from __future__ import annotations

import hashlib
import hmac
import json
from decimal import Decimal, InvalidOperation
from datetime import date, datetime, timedelta, timezone as datetime_timezone
from urllib import error as urllib_error
from urllib import request as urllib_request
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError, connection, transaction
from django.db.models import Count, F, Q
from django.utils import timezone

from notifications.models import Notification

from .exceptions import ConflictError, IdempotencyConflictError, PolicyViolationError, TransitionError
from .models import (
    AuditLog,
    AvailabilityException,
    AvailabilityRule,
    AvailabilitySlot,
    Booking,
    BookingConflictIncident,
    CheckoutSession,
    BookingRequest,
    IdempotencyRecord,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    WebhookTarget,
)


def _serialize_for_hash(data: dict) -> str:
    return json.dumps(data, sort_keys=True, default=str, separators=(",", ":"))


def _request_hash(data: dict) -> str:
    return hashlib.sha256(_serialize_for_hash(data).encode("utf-8")).hexdigest()


def _create_audit(
    *,
    actor,
    action: str,
    target_type: str,
    target_id,
    before: dict | None = None,
    after: dict | None = None,
    reason: str = "",
    is_admin_override: bool = False,
):
    AuditLog.objects.create(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        before_data=before or {},
        after_data=after or {},
        reason=reason,
        is_admin_override=is_admin_override,
    )


def _emit_outbox(
    *,
    event_type: str,
    aggregate_type: str,
    aggregate_id,
    payload: dict,
):
    OutboxEvent.objects.create(
        event_type=event_type,
        aggregate_type=aggregate_type,
        aggregate_id=str(aggregate_id),
        payload=payload,
    )


def _record_conflict_incident(
    *,
    operation: str,
    conflict_source: str,
    resource: MarketplaceResource | None,
    event=None,
    organizer=None,
    requested_start_at: datetime,
    requested_end_at: datetime,
    message: str,
    details: dict | None = None,
):
    try:
        BookingConflictIncident.objects.create(
            operation=operation,
            conflict_source=conflict_source,
            resource=resource,
            event=event,
            organizer=organizer,
            requested_start_at=requested_start_at,
            requested_end_at=requested_end_at,
            message=message,
            details=details or {},
        )
    except Exception:
        # Conflict tracking must never block booking flow error responses.
        return None


def _get_or_assert_idempotency(*, owner, endpoint: str, key: str | None, payload: dict):
    if not key:
        return None

    digest = _request_hash(payload)
    existing = IdempotencyRecord.objects.filter(owner=owner, endpoint=endpoint, key=key).first()
    if not existing:
        return None

    if existing.request_hash != digest:
        raise IdempotencyConflictError("Idempotency key reused with a different payload.")

    return existing


def _save_idempotency(*, owner, endpoint: str, key: str | None, payload: dict, response_status: int, response_body: dict):
    if not key:
        return None

    IdempotencyRecord.objects.update_or_create(
        owner=owner,
        endpoint=endpoint,
        key=key,
        defaults={
            "request_hash": _request_hash(payload),
            "response_status": response_status,
            "response_body": response_body,
        },
    )


def _ensure_policy(resource: MarketplaceResource, start_at: datetime):
    policy, _ = ResourcePolicy.objects.get_or_create(resource=resource)
    now = timezone.now()

    min_start = now + timedelta(hours=policy.min_notice_hours)
    max_start = now + timedelta(days=policy.max_horizon_days)

    if start_at < min_start:
        raise PolicyViolationError("Requested start violates min_notice_hours policy.")
    if start_at > max_start:
        raise PolicyViolationError("Requested start violates max_horizon_days policy.")

    return policy


def _policy_requires_mock_deposit(policy: ResourcePolicy) -> bool:
    return bool(policy.requires_deposit or policy.publish_requires_mock_deposit)


def _active_checkout_hold_q(now: datetime | None = None):
    moment = now or timezone.now()
    return (
        Q(checkout_session__status=CheckoutSession.Status.ACTIVE)
        & Q(draft_hold_expires_at__gt=moment)
        & Q(status=BookingRequest.Status.APPROVED)
    )


def _active_checkout_hold_qs(
    resource: MarketplaceResource,
    start_at: datetime,
    end_at: datetime,
    *,
    exclude_request_ids: list[int] | None = None,
    exclude_session_id: int | None = None,
    now: datetime | None = None,
):
    qs = BookingRequest.objects.filter(resource=resource).filter(_active_checkout_hold_q(now)).filter(
        _request_overlap_q(start_at, end_at)
    )
    if exclude_request_ids:
        qs = qs.exclude(id__in=exclude_request_ids)
    if exclude_session_id:
        qs = qs.exclude(checkout_session_id=exclude_session_id)
    return qs


def _find_checkout_hold_conflict(
    resource: MarketplaceResource,
    start_at: datetime,
    end_at: datetime,
    *,
    exclude_request_ids: list[int] | None = None,
    exclude_session_id: int | None = None,
):
    return (
        _active_checkout_hold_qs(
            resource,
            start_at,
            end_at,
            exclude_request_ids=exclude_request_ids,
            exclude_session_id=exclude_session_id,
        )
        .order_by("requested_start_at")
        .first()
    )


def _request_overlap_q(start_at: datetime, end_at: datetime):
    return Q(requested_start_at__lt=end_at) & Q(requested_end_at__gt=start_at)


def _estimate_request_total_amount(booking_request: BookingRequest) -> Decimal:
    if booking_request.counter_rate not in (None, ""):
        return Decimal(booking_request.counter_rate)

    resource = booking_request.resource
    candidates = []
    if resource.artist_id and resource.artist:
        candidates.extend(
            [
                getattr(resource.artist, "booking_fee", None),
                getattr(resource.artist, "booking_fee_max", None),
                getattr(resource.artist, "booking_fee_min", None),
            ]
        )
    if resource.vendor_id and resource.vendor:
        candidates.append(getattr(resource.vendor, "price_range", None))
    if resource.venue_id and resource.venue:
        candidates.extend(
            [
                getattr(resource.venue, "price", None),
                getattr(resource.venue, "budget_estimate_max", None),
                getattr(resource.venue, "budget_estimate_min", None),
            ]
        )

    for candidate in candidates:
        if candidate in (None, ""):
            continue
        try:
            amount = Decimal(candidate)
        except (InvalidOperation, TypeError, ValueError):
            continue
        if amount >= 0:
            return amount

    return Decimal("0")


def _calculate_deposit_amount(total_amount: Decimal, policy: ResourcePolicy) -> Decimal:
    deposit_value = Decimal(policy.deposit_value or 0)
    total_amount = Decimal(total_amount or 0)
    if deposit_value <= 0:
        return Decimal("0")

    if policy.deposit_type == ResourcePolicy.DepositType.PERCENTAGE:
        amount = (total_amount * deposit_value) / Decimal("100")
    else:
        amount = deposit_value
    if total_amount > 0:
        amount = min(amount, total_amount)
    return amount.quantize(Decimal("0.01"))


def _request_checkout_session_is_active(booking_request: BookingRequest, now: datetime | None = None) -> bool:
    session = getattr(booking_request, "checkout_session", None)
    moment = now or timezone.now()
    return bool(
        session
        and session.status == CheckoutSession.Status.ACTIVE
        and booking_request.draft_hold_expires_at
        and booking_request.draft_hold_expires_at > moment
    )


def get_booking_request_deposit_state(booking_request: BookingRequest, now: datetime | None = None) -> str | None:
    if not _request_checkout_session_is_active(booking_request, now):
        return None
    session = booking_request.checkout_session
    if session and session.paid_at:
        return "deposit_mock_paid"
    if booking_request.deposit_required_at_checkout or booking_request.publish_requires_mock_deposit:
        return "deposit_required"
    return "deposit_not_required"


def is_booking_request_ready_for_publish(booking_request: BookingRequest, now: datetime | None = None) -> bool:
    if booking_request.status != BookingRequest.Status.APPROVED:
        return False
    if not _request_checkout_session_is_active(booking_request, now):
        return False
    if booking_request.deposit_required_at_checkout or booking_request.publish_requires_mock_deposit:
        session = booking_request.checkout_session
        return bool(session and session.paid_at)
    return True


def get_booking_request_workflow_state(booking_request: BookingRequest, now: datetime | None = None) -> str:
    moment = now or timezone.now()
    if getattr(booking_request, "created_booking", None):
        return "booked"
    if booking_request.status in {BookingRequest.Status.DECLINED, BookingRequest.Status.WITHDRAWN}:
        return "cancelled"
    if booking_request.status == BookingRequest.Status.PENDING:
        return "requested"
    if booking_request.checkout_session_id:
        session = booking_request.checkout_session
        if session and session.status == CheckoutSession.Status.EXPIRED:
            return "checkout_hold_expired"
        if session and session.status == CheckoutSession.Status.RELEASED:
            return "released"
    if booking_request.checkout_released_at and not _request_checkout_session_is_active(booking_request, moment):
        return "released"
    if booking_request.draft_hold_expires_at and booking_request.draft_hold_expires_at <= moment:
        return "checkout_hold_expired"
    if is_booking_request_ready_for_publish(booking_request, moment):
        return "ready_for_publish"
    if _request_checkout_session_is_active(booking_request, moment):
        return "checkout_hold_active"
    if booking_request.status == BookingRequest.Status.APPROVED and booking_request.event_draft_id:
        return "accepted_pending_checkout"
    if booking_request.status == BookingRequest.Status.EXPIRED:
        return "released" if booking_request.checkout_released_at else "cancelled"
    return booking_request.status


def _overlap_q(start_at: datetime, end_at: datetime):
    return Q(start_at__lt=end_at) & Q(end_at__gt=start_at)


def _active_booking_qs(resource: MarketplaceResource):
    return Booking.objects.filter(resource=resource, status__in=Booking.ACTIVE_STATES)


def _find_booking_conflict(resource: MarketplaceResource, start_at: datetime, end_at: datetime, exclude_booking_id: int | None = None):
    qs = _active_booking_qs(resource).filter(_overlap_q(start_at, end_at))
    if exclude_booking_id:
        qs = qs.exclude(id=exclude_booking_id)
    return qs.order_by("start_at").first()


def _lock_overlapping_slots(resource: MarketplaceResource, start_at: datetime, end_at: datetime):
    return (
        AvailabilitySlot.objects.select_for_update()
        .filter(resource=resource, is_bookable=True)
        .filter(_overlap_q(start_at, end_at))
        .order_by("start_at")
    )


def _assert_slot_capacity(slots, attendee_count: int):
    for slot in slots:
        if slot.capacity_remaining < attendee_count:
            raise ConflictError(
                f"Slot capacity exceeded for window {slot.start_at.isoformat()} - {slot.end_at.isoformat()}."
            )


def _reserve_capacity(slots, attendee_count: int):
    if attendee_count <= 0:
        return
    slot_ids = [slot.id for slot in slots]
    if slot_ids:
        AvailabilitySlot.objects.filter(id__in=slot_ids).update(capacity_reserved=F("capacity_reserved") + attendee_count)


def _release_capacity(resource: MarketplaceResource, start_at: datetime, end_at: datetime, attendee_count: int):
    if attendee_count <= 0:
        return
    slot_ids = list(
        AvailabilitySlot.objects.filter(resource=resource, is_bookable=True)
        .filter(_overlap_q(start_at, end_at))
        .values_list("id", flat=True)
    )
    if slot_ids:
        AvailabilitySlot.objects.filter(id__in=slot_ids).update(
            capacity_reserved=F("capacity_reserved") - attendee_count
        )


def create_request(
    *,
    organizer,
    event=None,
    event_draft=None,
    resource: MarketplaceResource,
    start_at: datetime,
    end_at: datetime,
    attendee_count: int,
    message: str = "",
    idempotency_key: str | None = None,
):
    if event is None and event_draft is None:
        raise PolicyViolationError("A booking request requires either an event or an event_draft.")

    payload = {
        "event_id": event.id if event else None,
        "event_draft_id": event_draft.id if event_draft else None,
        "resource_id": resource.id,
        "start_at": start_at.isoformat(),
        "end_at": end_at.isoformat(),
        "attendee_count": attendee_count,
        "message": message,
    }

    existing = _get_or_assert_idempotency(
        owner=organizer,
        endpoint="scheduling.request.create",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        request_id = existing.response_body.get("request_id")
        if request_id:
            return BookingRequest.objects.get(id=request_id), False

    if end_at <= start_at:
        raise PolicyViolationError("Request end time must be after start time.")

    # Venue exclusivity: organizer may only hold one venue request per time window.
    if resource.resource_type == "venue":
        overlapping_venue = BookingRequest.objects.filter(
            organizer=organizer,
            resource__resource_type="venue",
            status__in=[
                BookingRequest.Status.PENDING,
                BookingRequest.Status.APPROVED,
                BookingRequest.Status.COUNTER_PROPOSED,
            ],
            requested_start_at__lt=end_at,
            requested_end_at__gt=start_at,
        )
        if event is not None:
            overlapping_venue = overlapping_venue.exclude(event=event)
        if event_draft is not None:
            overlapping_venue = overlapping_venue.exclude(event_draft=event_draft)
        if overlapping_venue.exists():
            raise PolicyViolationError(
                "A venue is already booked or pending for this time window. "
                "Cancel or withdraw the existing venue request before submitting a new one."
            )

    policy = _ensure_policy(resource, start_at)
    if policy.require_message_for_request and not message.strip():
        raise PolicyViolationError("Provider policy requires a request message.")

    # Prevent spam: block re-submission of an identical request within 1 hour of withdrawal.
    cooldown_cutoff = timezone.now() - timedelta(hours=1)
    recently_withdrawn = BookingRequest.objects.filter(
        organizer=organizer,
        resource=resource,
        requested_start_at=start_at,
        requested_end_at=end_at,
        status=BookingRequest.Status.WITHDRAWN,
        updated_at__gte=cooldown_cutoff,
    ).exists()
    if recently_withdrawn:
        raise PolicyViolationError(
            "This request was withdrawn less than 1 hour ago. "
            "Wait before re-submitting the same slot, or use different dates."
        )

    with transaction.atomic():
        booking_request = BookingRequest.objects.create(
            event=event,
            event_draft=event_draft,
            organizer=organizer,
            resource=resource,
            requested_start_at=start_at,
            requested_end_at=end_at,
            attendee_count=attendee_count,
            message=message,
            status=BookingRequest.Status.PENDING,
            expires_at=timezone.now() + timedelta(hours=48),
            idempotency_key=idempotency_key,
        )
        _create_audit(
            actor=organizer,
            action="request.created",
            target_type="BookingRequest",
            target_id=booking_request.id,
            after={
                "status": booking_request.status,
                "resource_id": resource.id,
                "event_id": event.id if event else None,
                "event_draft_id": event_draft.id if event_draft else None,
            },
        )
        _emit_outbox(
            event_type="request.created",
            aggregate_type="booking_request",
            aggregate_id=booking_request.id,
            payload={
                "request_id": booking_request.id,
                "resource_id": resource.id,
                "organizer_id": organizer.id,
                "event_id": event.id if event else None,
                "event_draft_id": event_draft.id if event_draft else None,
            },
        )

        # Notify the resource owner immediately (do not wait for outbox worker).
        event_label = event.name if event else (event_draft.data.get('step1', {}).get('name', 'your event') if event_draft else "an event")
        _create_in_app_notification(
            recipient=resource.owner,
            sender=organizer,
            notification_type=Notification.NotificationType.BOOKING_REQUEST,
            title=f"New booking request for {resource.display_name}",
            message=f"{organizer.username} wants to book you for {event_label}.",
            link_type="booking",
            link_id=booking_request.id,
            data={
                "request_id": booking_request.id,
                "resource_id": resource.id,
            },
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.request.create",
        key=idempotency_key,
        payload=payload,
        response_status=201,
        response_body={"request_id": booking_request.id},
    )

    return booking_request, True


def create_booking(
    *,
    organizer,
    event,
    resource: MarketplaceResource,
    start_at: datetime,
    end_at: datetime,
    attendee_count: int,
    source: str,
    source_request: BookingRequest | None = None,
    consume_checkout_hold: bool = False,
    idempotency_key: str | None = None,
):
    payload = {
        "event_id": event.id,
        "resource_id": resource.id,
        "start_at": start_at.isoformat(),
        "end_at": end_at.isoformat(),
        "attendee_count": attendee_count,
        "source": source,
        "source_request_id": source_request.id if source_request else None,
        "consume_checkout_hold": consume_checkout_hold,
    }

    existing = _get_or_assert_idempotency(
        owner=organizer,
        endpoint="scheduling.booking.create",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        booking_id = existing.response_body.get("booking_id")
        if booking_id:
            return Booking.objects.get(id=booking_id), False

    if end_at <= start_at:
        raise PolicyViolationError("Booking end time must be after start time.")

    _ensure_policy(resource, start_at)

    with transaction.atomic():
        MarketplaceResource.objects.select_for_update().get(id=resource.id)
        exclude_request_ids = [source_request.id] if consume_checkout_hold and source_request else []

        # Lock slots first so concurrent approvals are serialised at the DB level.
        slot_qs = _lock_overlapping_slots(resource, start_at, end_at)
        slots = list(slot_qs)

        if slots:
            if not consume_checkout_hold:
                # Capacity-aware path: multiple bookings are allowed up to slot capacity
                # (e.g. a service provider with capacity=5 can accept 5 concurrent bookings).
                try:
                    _assert_slot_capacity(slots, attendee_count)
                except ConflictError as capacity_exc:
                    _record_conflict_incident(
                        operation=BookingConflictIncident.Operation.CREATE,
                        conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                        resource=resource,
                        event=event,
                        organizer=organizer,
                        requested_start_at=start_at,
                        requested_end_at=end_at,
                        message=str(capacity_exc),
                        details={},
                    )
                    raise
                _reserve_capacity(slots, attendee_count)
        else:
            # No availability slots defined — treat the resource as single-capacity:
            # any active booking in the window is a hard conflict.
            conflict = _find_booking_conflict(resource, start_at, end_at)
            if conflict:
                _record_conflict_incident(
                    operation=BookingConflictIncident.Operation.CREATE,
                    conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                    resource=resource,
                    event=event,
                    organizer=organizer,
                    requested_start_at=start_at,
                    requested_end_at=end_at,
                    message=f"Resource is already booked for booking #{conflict.id}.",
                    details={"conflicting_booking_id": conflict.id},
                )
                raise ConflictError(f"Resource is already booked for booking #{conflict.id}.")
            hold_conflict = _find_checkout_hold_conflict(
                resource,
                start_at,
                end_at,
                exclude_request_ids=exclude_request_ids,
            )
            if hold_conflict:
                _record_conflict_incident(
                    operation=BookingConflictIncident.Operation.CREATE,
                    conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                    resource=resource,
                    event=event,
                    organizer=organizer,
                    requested_start_at=start_at,
                    requested_end_at=end_at,
                    message=f"Resource is on an active checkout hold for request #{hold_conflict.id}.",
                    details={"conflicting_request_id": hold_conflict.id},
                )
                raise ConflictError(f"Resource is on an active checkout hold for request #{hold_conflict.id}.")

        try:
            booking = Booking.objects.create(
                event=event,
                organizer=organizer,
                resource=resource,
                source_request=source_request,
                start_at=start_at,
                end_at=end_at,
                attendee_count=attendee_count,
                status=Booking.Status.CONFIRMED,
                source=source,
                idempotency_key=idempotency_key,
            )
        except IntegrityError as exc:
            _record_conflict_incident(
                operation=BookingConflictIncident.Operation.CREATE,
                conflict_source=BookingConflictIncident.ConflictSource.DB_CONSTRAINT,
                resource=resource,
                event=event,
                organizer=organizer,
                requested_start_at=start_at,
                requested_end_at=end_at,
                message="Resource has a conflicting booking for this time window.",
                details={"source": "integrity_error"},
            )
            raise ConflictError("Resource has a conflicting booking for this time window.") from exc

        _create_audit(
            actor=organizer,
            action="booking.created",
            target_type="Booking",
            target_id=booking.id,
            after={
                "status": booking.status,
                "resource_id": resource.id,
                "event_id": event.id,
            },
        )
        _emit_outbox(
            event_type="booking.confirmed",
            aggregate_type="booking",
            aggregate_id=booking.id,
            payload={
                "booking_id": booking.id,
                "resource_id": resource.id,
                "organizer_id": organizer.id,
                "event_id": event.id,
            },
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.booking.create",
        key=idempotency_key,
        payload=payload,
        response_status=201,
        response_body={"booking_id": booking.id},
    )

    return booking, True

def approve_request(*, reviewer, booking_request: BookingRequest, provider_message: str = "", idempotency_key: str | None = None):
    payload = {"request_id": booking_request.id, "action": "approve"}
    existing = _get_or_assert_idempotency(
        owner=reviewer, endpoint="scheduling.request.approve", key=idempotency_key, payload=payload
    )
    if existing:
        req = BookingRequest.objects.select_related("resource").get(id=booking_request.id)
        booking = getattr(req, "created_booking", None)
        return req, booking

    with transaction.atomic():
        locked_request = (
            BookingRequest.objects.select_for_update()
            .select_related("resource", "event", "event_draft", "organizer")
            .get(id=booking_request.id)
        )

        if locked_request.status != BookingRequest.Status.PENDING:
            raise TransitionError("Only pending requests can be approved.")

        # Draft-safe approval: accepted requests remain available until the
        # organizer explicitly opens checkout and starts a timed hold.
        is_draft_linked = bool(locked_request.event_draft_id and not locked_request.event_id)

        # For instant-mode resources with a draft, auto-start a checkout hold immediately
        # so the organizer doesn't have to manually trigger it.
        policy = ResourcePolicy.objects.filter(resource=locked_request.resource).first()
        is_instant_mode = policy and policy.booking_mode == ResourcePolicy.BookingMode.INSTANT

        if is_draft_linked:
            locked_request.status = BookingRequest.Status.APPROVED
            locked_request.provider_message = provider_message
            locked_request.reviewed_by = reviewer
            locked_request.reviewed_at = timezone.now()
            locked_request.checkout_session = None
            locked_request.checkout_started_at = None
            locked_request.checkout_released_at = None
            locked_request.draft_hold_expires_at = None
            locked_request.deposit_required_at_checkout = False
            locked_request.publish_requires_mock_deposit = False
            locked_request.deposit_type_snapshot = ""
            locked_request.deposit_value_snapshot = None
            locked_request.estimated_total_amount = None
            locked_request.deposit_due_amount = None
            locked_request.remaining_balance_estimate = None
            locked_request.save(
                update_fields=[
                    "status",
                    "provider_message",
                    "reviewed_by",
                    "reviewed_at",
                    "checkout_session",
                    "checkout_started_at",
                    "checkout_released_at",
                    "draft_hold_expires_at",
                    "deposit_required_at_checkout",
                    "publish_requires_mock_deposit",
                    "deposit_type_snapshot",
                    "deposit_value_snapshot",
                    "estimated_total_amount",
                    "deposit_due_amount",
                    "remaining_balance_estimate",
                    "updated_at",
                ]
            )
            booking = None

            _create_audit(
                actor=reviewer,
                action="request.accepted_pending_checkout",
                target_type="BookingRequest",
                target_id=locked_request.id,
                before={"status": BookingRequest.Status.PENDING},
                after={"status": BookingRequest.Status.APPROVED, "workflow_state": "accepted_pending_checkout"},
            )
            _emit_outbox(
                event_type="request.accepted_pending_checkout",
                aggregate_type="booking_request",
                aggregate_id=locked_request.id,
                payload={"request_id": locked_request.id},
            )
            draft_title = ""
            if locked_request.event_draft_id and locked_request.event_draft:
                draft_data = locked_request.event_draft.data or {}
                step1 = (draft_data.get("steps") or {}).get("step1") or {}
                draft_title = step1.get("name") or step1.get("eventName") or ""
            event_label = draft_title or "your draft event"

            # For instant-mode resources, auto-start the checkout hold on acceptance
            # so the organizer doesn't need to manually trigger it.
            if is_instant_mode:
                hold_minutes = policy.checkout_hold_minutes or 30
                hold_expires_at = timezone.now() + timedelta(minutes=hold_minutes)
                checkout_session = CheckoutSession.objects.create(
                    organizer=locked_request.organizer,
                    event_draft=locked_request.event_draft,
                    hold_minutes=hold_minutes,
                    hold_expires_at=hold_expires_at,
                )
                requires_deposit = _policy_requires_mock_deposit(policy)
                total_amount = _estimate_request_total_amount(locked_request)
                deposit_amount = _calculate_deposit_amount(total_amount, policy) if requires_deposit else Decimal("0")
                locked_request.checkout_session = checkout_session
                locked_request.checkout_started_at = timezone.now()
                locked_request.draft_hold_expires_at = hold_expires_at
                locked_request.deposit_required_at_checkout = policy.requires_deposit
                locked_request.publish_requires_mock_deposit = policy.publish_requires_mock_deposit
                locked_request.deposit_type_snapshot = policy.deposit_type
                locked_request.deposit_value_snapshot = policy.deposit_value
                locked_request.estimated_total_amount = total_amount
                locked_request.deposit_due_amount = deposit_amount
                locked_request.remaining_balance_estimate = total_amount - deposit_amount
                locked_request.save(
                    update_fields=[
                        "checkout_session",
                        "checkout_started_at",
                        "draft_hold_expires_at",
                        "deposit_required_at_checkout",
                        "publish_requires_mock_deposit",
                        "deposit_type_snapshot",
                        "deposit_value_snapshot",
                        "estimated_total_amount",
                        "deposit_due_amount",
                        "remaining_balance_estimate",
                        "updated_at",
                    ]
                )
                notification_message = (
                    f"{locked_request.resource.display_name} instantly accepted your request for {event_label}. "
                    f"A {hold_minutes}-minute checkout hold has started automatically."
                )
            else:
                notification_message = (
                    f"{locked_request.resource.display_name} accepted your booking request for {event_label}. "
                    "Start checkout to place a 30-minute reservation hold before you publish."
                )

            _create_in_app_notification(
                recipient=locked_request.organizer,
                sender=reviewer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                title=f"{locked_request.resource.display_name} accepted your request",
                message=notification_message,
                link_type="booking_request",
                link_id=locked_request.id,
                data={
                    "request_id": locked_request.id,
                    "resource_id": locked_request.resource_id,
                    "workflow_state": "checkout_hold_active" if is_instant_mode else "accepted_pending_checkout",
                },
            )
        else:
            booking, _ = create_booking(
                organizer=locked_request.organizer,
                event=locked_request.event,
                resource=locked_request.resource,
                start_at=locked_request.requested_start_at,
                end_at=locked_request.requested_end_at,
                attendee_count=locked_request.attendee_count,
                source=Booking.Source.REQUEST,
                source_request=locked_request,
                idempotency_key=None,
            )

            locked_request.status = BookingRequest.Status.APPROVED
            locked_request.provider_message = provider_message
            locked_request.reviewed_by = reviewer
            locked_request.reviewed_at = timezone.now()
            locked_request.save(
                update_fields=["status", "provider_message", "reviewed_by", "reviewed_at", "updated_at"]
            )

            _create_audit(
                actor=reviewer,
                action="request.approved",
                target_type="BookingRequest",
                target_id=locked_request.id,
                before={"status": BookingRequest.Status.PENDING},
                after={"status": BookingRequest.Status.APPROVED, "booking_id": booking.id},
            )
            _emit_outbox(
                event_type="request.approved",
                aggregate_type="booking_request",
                aggregate_id=locked_request.id,
                payload={"request_id": locked_request.id, "booking_id": booking.id},
            )
            event_label = locked_request.event.name if locked_request.event_id else "your event"
            _create_in_app_notification(
                recipient=locked_request.organizer,
                sender=reviewer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                title=f"Booking confirmed — {locked_request.resource.display_name}",
                message=f"Your request for {event_label} was approved.",
                link_type="confirmed_booking",
                link_id=booking.id,
                data={
                    "request_id": locked_request.id,
                    "booking_id": booking.id,
                    "resource_id": locked_request.resource_id,
                },
            )

    booking_id = booking.id if booking else None
    _save_idempotency(
        owner=reviewer,
        endpoint="scheduling.request.approve",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"request_id": locked_request.id, "booking_id": booking_id, "status": BookingRequest.Status.APPROVED},
    )

    return locked_request, booking


def decline_request(*, reviewer, booking_request: BookingRequest, provider_message: str = "", idempotency_key: str | None = None):
    payload = {"request_id": booking_request.id, "action": "decline"}
    existing = _get_or_assert_idempotency(
        owner=reviewer, endpoint="scheduling.request.decline", key=idempotency_key, payload=payload
    )
    if existing:
        return BookingRequest.objects.get(id=booking_request.id)

    with transaction.atomic():
        locked_request = (
            BookingRequest.objects.select_for_update()
            .select_related("resource", "organizer")
            .get(id=booking_request.id)
        )
        if locked_request.status != BookingRequest.Status.PENDING:
            raise TransitionError("Only pending requests can be declined.")

        locked_request.status = BookingRequest.Status.DECLINED
        locked_request.provider_message = provider_message
        locked_request.reviewed_by = reviewer
        locked_request.reviewed_at = timezone.now()
        locked_request.save(
            update_fields=["status", "provider_message", "reviewed_by", "reviewed_at", "updated_at"]
        )

        _create_audit(
            actor=reviewer,
            action="request.declined",
            target_type="BookingRequest",
            target_id=locked_request.id,
            before={"status": BookingRequest.Status.PENDING},
            after={"status": BookingRequest.Status.DECLINED},
        )
        _emit_outbox(
            event_type="request.declined",
            aggregate_type="booking_request",
            aggregate_id=locked_request.id,
            payload={"request_id": locked_request.id},
        )

        # Notify the organizer immediately.
        msg = "Your booking request was declined."
        if provider_message:
            msg += f" Message: {provider_message}"
        _create_in_app_notification(
            recipient=locked_request.organizer,
            sender=reviewer,
            notification_type=Notification.NotificationType.BOOKING_REJECTED,
            title=f"Request declined — {locked_request.resource.display_name}",
            message=msg,
            link_type="booking",
            link_id=locked_request.id,
            data={
                "request_id": locked_request.id,
                "resource_id": locked_request.resource_id,
            },
        )

    _save_idempotency(
        owner=reviewer,
        endpoint="scheduling.request.decline",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"request_id": locked_request.id, "status": BookingRequest.Status.DECLINED},
    )

    return locked_request


def counter_propose(
    *,
    reviewer,
    booking_request: BookingRequest,
    counter_start_at: datetime,
    counter_end_at: datetime,
    counter_rate=None,
    counter_message: str = "",
    idempotency_key: str | None = None,
):
    """Provider counter-proposes a revised time/rate on a PENDING request."""
    if counter_end_at <= counter_start_at:
        raise PolicyViolationError("counter_end_at must be after counter_start_at.")

    payload = {"request_id": booking_request.id, "action": "counter_propose"}
    existing = _get_or_assert_idempotency(
        owner=reviewer, endpoint="scheduling.request.counter_propose", key=idempotency_key, payload=payload
    )
    if existing:
        return BookingRequest.objects.get(id=booking_request.id)

    with transaction.atomic():
        locked_request = BookingRequest.objects.select_for_update().get(id=booking_request.id)
        if locked_request.status != BookingRequest.Status.PENDING:
            raise TransitionError("Only pending requests can receive a counter-proposal.")

        locked_request.status = BookingRequest.Status.COUNTER_PROPOSED
        locked_request.counter_start_at = counter_start_at
        locked_request.counter_end_at = counter_end_at
        locked_request.counter_rate = counter_rate
        locked_request.counter_message = counter_message
        locked_request.reviewed_by = reviewer
        locked_request.reviewed_at = timezone.now()
        locked_request.save(
            update_fields=[
                "status",
                "counter_start_at",
                "counter_end_at",
                "counter_rate",
                "counter_message",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        _create_audit(
            actor=reviewer,
            action="request.counter_proposed",
            target_type="BookingRequest",
            target_id=locked_request.id,
            before={"status": BookingRequest.Status.PENDING},
            after={
                "status": BookingRequest.Status.COUNTER_PROPOSED,
                "counter_start_at": counter_start_at.isoformat(),
                "counter_end_at": counter_end_at.isoformat(),
            },
        )
        _emit_outbox(
            event_type="request.counter_proposed",
            aggregate_type="booking_request",
            aggregate_id=locked_request.id,
            payload={
                "request_id": locked_request.id,
                "counter_start_at": counter_start_at.isoformat(),
                "counter_end_at": counter_end_at.isoformat(),
            },
        )
        _create_in_app_notification(
            recipient=locked_request.organizer,
            sender=reviewer,
            notification_type=Notification.NotificationType.COUNTER_PROPOSED,
            title=f"Counter proposal from {locked_request.resource.display_name}",
            message=(
                f"They've proposed revised times for your request. "
                f"{'Rate: R ' + str(counter_rate) + '. ' if counter_rate else ''}"
                f"{counter_message[:80] if counter_message else ''}"
            ).strip(),
            link_type="booking",
            link_id=locked_request.id,
            data={"request_id": locked_request.id},
        )

    _save_idempotency(
        owner=reviewer,
        endpoint="scheduling.request.counter_propose",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"request_id": locked_request.id, "status": BookingRequest.Status.COUNTER_PROPOSED},
    )

    return locked_request


def accept_counter(*, organizer, booking_request: BookingRequest):
    """Organizer accepts a counter-proposal; creates a confirmed Booking using counter times."""
    with transaction.atomic():
        locked_request = (
            BookingRequest.objects.select_for_update()
            .select_related("resource", "event", "event_draft", "organizer")
            .get(id=booking_request.id)
        )

        if locked_request.status != BookingRequest.Status.COUNTER_PROPOSED:
            raise TransitionError("Only counter-proposed requests can be accepted.")
        if locked_request.organizer_id != organizer.id:
            raise TransitionError("Only the organizer who made the request can accept a counter.")

        # Resolve the event reference (may be linked to draft or published event)
        event = locked_request.event
        if event is None and locked_request.event_draft_id:
            # Counter-accepted draft requests still need checkout before a slot is held.
            locked_request.status = BookingRequest.Status.APPROVED
            locked_request.checkout_session = None
            locked_request.checkout_started_at = None
            locked_request.checkout_released_at = None
            locked_request.draft_hold_expires_at = None
            locked_request.deposit_required_at_checkout = False
            locked_request.publish_requires_mock_deposit = False
            locked_request.deposit_type_snapshot = ""
            locked_request.deposit_value_snapshot = None
            locked_request.estimated_total_amount = None
            locked_request.deposit_due_amount = None
            locked_request.remaining_balance_estimate = None
            locked_request.save(
                update_fields=[
                    "status",
                    "checkout_session",
                    "checkout_started_at",
                    "checkout_released_at",
                    "draft_hold_expires_at",
                    "deposit_required_at_checkout",
                    "publish_requires_mock_deposit",
                    "deposit_type_snapshot",
                    "deposit_value_snapshot",
                    "estimated_total_amount",
                    "deposit_due_amount",
                    "remaining_balance_estimate",
                    "updated_at",
                ]
            )
            _create_audit(
                actor=organizer,
                action="request.counter_accepted_draft",
                target_type="BookingRequest",
                target_id=locked_request.id,
                before={"status": BookingRequest.Status.COUNTER_PROPOSED},
                after={"status": BookingRequest.Status.APPROVED, "workflow_state": "accepted_pending_checkout"},
            )
            _emit_outbox(
                event_type="request.counter_accepted",
                aggregate_type="booking_request",
                aggregate_id=locked_request.id,
                payload={"request_id": locked_request.id},
            )
            _create_in_app_notification(
                recipient=locked_request.resource.owner,
                sender=organizer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                title=f"{organizer.username} accepted your counter proposal",
                message=f"For {locked_request.resource.display_name}. The organizer still needs to start checkout to hold the slot.",
                link_type="booking",
                link_id=locked_request.id,
                data={"request_id": locked_request.id},
            )
            return locked_request, None

        booking, _ = create_booking(
            organizer=locked_request.organizer,
            event=event,
            resource=locked_request.resource,
            start_at=locked_request.counter_start_at,
            end_at=locked_request.counter_end_at,
            attendee_count=locked_request.attendee_count,
            source=Booking.Source.REQUEST,
            source_request=locked_request,
            idempotency_key=None,
        )

        locked_request.status = BookingRequest.Status.APPROVED
        locked_request.save(update_fields=["status", "updated_at"])

        _create_audit(
            actor=organizer,
            action="request.counter_accepted",
            target_type="BookingRequest",
            target_id=locked_request.id,
            before={"status": BookingRequest.Status.COUNTER_PROPOSED},
            after={"status": BookingRequest.Status.APPROVED, "booking_id": booking.id},
        )
        _emit_outbox(
            event_type="request.counter_accepted",
            aggregate_type="booking_request",
            aggregate_id=locked_request.id,
            payload={"request_id": locked_request.id, "booking_id": booking.id},
        )
        _create_in_app_notification(
            recipient=locked_request.resource.owner,
            sender=organizer,
            notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
            title=f"{organizer.username} accepted your counter proposal",
            message=f"A confirmed booking has been created for {locked_request.resource.display_name}.",
            link_type="booking",
            link_id=booking.id,
            data={"request_id": locked_request.id, "booking_id": booking.id},
        )

    return locked_request, booking


def reject_counter(*, organizer, booking_request: BookingRequest, message: str = ""):
    """Organizer rejects a counter-proposal; transitions request to DECLINED."""
    with transaction.atomic():
        locked_request = BookingRequest.objects.select_for_update().get(id=booking_request.id)
        if locked_request.status != BookingRequest.Status.COUNTER_PROPOSED:
            raise TransitionError("Only counter-proposed requests can be rejected.")
        if locked_request.organizer_id != organizer.id:
            raise TransitionError("Only the organizer who made the request can reject a counter.")

        locked_request.status = BookingRequest.Status.DECLINED
        locked_request.provider_message = message or locked_request.provider_message
        locked_request.save(update_fields=["status", "provider_message", "updated_at"])

        _create_audit(
            actor=organizer,
            action="request.counter_rejected",
            target_type="BookingRequest",
            target_id=locked_request.id,
            before={"status": BookingRequest.Status.COUNTER_PROPOSED},
            after={"status": BookingRequest.Status.DECLINED},
        )
        _emit_outbox(
            event_type="request.counter_rejected",
            aggregate_type="booking_request",
            aggregate_id=locked_request.id,
            payload={"request_id": locked_request.id},
        )
        _create_in_app_notification(
            recipient=locked_request.resource.owner,
            sender=organizer,
            notification_type=Notification.NotificationType.BOOKING_REJECTED,
            title=f"{organizer.username} declined your counter proposal",
            message=f"For {locked_request.resource.display_name}. The request is now closed.",
            link_type="booking",
            link_id=locked_request.id,
            data={"request_id": locked_request.id},
        )

    return locked_request


def start_checkout_session(
    *,
    organizer,
    event_draft,
    request_ids: list[int],
    idempotency_key: str | None = None,
):
    normalized_request_ids = sorted({int(request_id) for request_id in request_ids if request_id})
    if not normalized_request_ids:
        raise PolicyViolationError("Select at least one accepted request before starting checkout.")

    payload = {
        "event_draft_id": event_draft.id,
        "request_ids": normalized_request_ids,
    }
    existing = _get_or_assert_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.start",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        session_id = existing.response_body.get("checkout_session_id")
        if session_id:
            return CheckoutSession.objects.get(id=session_id), False

    now = timezone.now()
    with transaction.atomic():
        locked_requests = list(
            BookingRequest.objects.select_for_update()
            .select_related(
                "resource",
                "resource__owner",
                "resource__artist",
                "resource__vendor",
                "resource__venue",
                "checkout_session",
                "event_draft",
            )
            .filter(id__in=normalized_request_ids)
            .order_by("id")
        )
        if len(locked_requests) != len(normalized_request_ids):
            raise PolicyViolationError("One or more requests could not be found.")

        active_session_ids = set()
        hold_minutes = None
        for locked_request in locked_requests:
            if locked_request.organizer_id != organizer.id:
                raise PolicyViolationError("Checkout requests must belong to the authenticated organizer.")
            if locked_request.event_draft_id != event_draft.id:
                raise PolicyViolationError("All checkout requests must belong to the same event draft.")
            if locked_request.status != BookingRequest.Status.APPROVED:
                raise TransitionError("Only accepted requests can enter checkout.")
            if getattr(locked_request, "created_booking", None):
                raise TransitionError("This request has already been finalized into a booking.")

            if _request_checkout_session_is_active(locked_request, now):
                active_session_ids.add(locked_request.checkout_session_id)

            policy = _ensure_policy(locked_request.resource, locked_request.requested_start_at)
            policy_hold_minutes = policy.checkout_hold_minutes or 30
            hold_minutes = policy_hold_minutes if hold_minutes is None else min(hold_minutes, policy_hold_minutes)

        if len(active_session_ids) == 1:
            existing_session = CheckoutSession.objects.select_for_update().get(id=next(iter(active_session_ids)))
            existing_session_request_ids = sorted(
                BookingRequest.objects.filter(checkout_session=existing_session)
                .filter(_active_checkout_hold_q(now))
                .values_list("id", flat=True)
            )
            if existing_session_request_ids == normalized_request_ids:
                return existing_session, False

        if active_session_ids:
            raise ConflictError("One of the selected requests is already held in another checkout session.")

        hold_minutes = hold_minutes or 30
        hold_expires_at = now + timedelta(minutes=hold_minutes)
        checkout_session = CheckoutSession.objects.create(
            organizer=organizer,
            event_draft=event_draft,
            hold_minutes=hold_minutes,
            hold_expires_at=hold_expires_at,
        )

        for locked_request in locked_requests:
            MarketplaceResource.objects.select_for_update().get(id=locked_request.resource_id)
            slot_qs = _lock_overlapping_slots(
                locked_request.resource,
                locked_request.requested_start_at,
                locked_request.requested_end_at,
            )
            slots = list(slot_qs)
            if slots:
                try:
                    _assert_slot_capacity(slots, locked_request.attendee_count)
                except ConflictError as capacity_exc:
                    _record_conflict_incident(
                        operation=BookingConflictIncident.Operation.CREATE,
                        conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                        resource=locked_request.resource,
                        event=locked_request.event,
                        organizer=organizer,
                        requested_start_at=locked_request.requested_start_at,
                        requested_end_at=locked_request.requested_end_at,
                        message=str(capacity_exc),
                        details={"request_id": locked_request.id, "phase": "checkout_start"},
                    )
                    raise
                _reserve_capacity(slots, locked_request.attendee_count)
            else:
                booking_conflict = _find_booking_conflict(
                    locked_request.resource,
                    locked_request.requested_start_at,
                    locked_request.requested_end_at,
                )
                if booking_conflict:
                    raise ConflictError(f"Resource is already booked for booking #{booking_conflict.id}.")

                hold_conflict = _find_checkout_hold_conflict(
                    locked_request.resource,
                    locked_request.requested_start_at,
                    locked_request.requested_end_at,
                    exclude_request_ids=normalized_request_ids,
                )
                if hold_conflict:
                    raise ConflictError(f"Resource is already held in checkout for request #{hold_conflict.id}.")

            policy = _ensure_policy(locked_request.resource, locked_request.requested_start_at)
            estimated_total = _estimate_request_total_amount(locked_request)
            deposit_due = _calculate_deposit_amount(estimated_total, policy)
            remaining_balance = max(Decimal("0"), estimated_total - deposit_due)

            locked_request.checkout_session = checkout_session
            locked_request.checkout_started_at = now
            locked_request.checkout_released_at = None
            locked_request.draft_hold_expires_at = hold_expires_at
            locked_request.deposit_required_at_checkout = _policy_requires_mock_deposit(policy)
            locked_request.publish_requires_mock_deposit = _policy_requires_mock_deposit(policy)
            locked_request.deposit_type_snapshot = policy.deposit_type
            locked_request.deposit_value_snapshot = policy.deposit_value
            locked_request.estimated_total_amount = estimated_total
            locked_request.deposit_due_amount = deposit_due
            locked_request.remaining_balance_estimate = remaining_balance
            locked_request.save(
                update_fields=[
                    "checkout_session",
                    "checkout_started_at",
                    "checkout_released_at",
                    "draft_hold_expires_at",
                    "deposit_required_at_checkout",
                    "publish_requires_mock_deposit",
                    "deposit_type_snapshot",
                    "deposit_value_snapshot",
                    "estimated_total_amount",
                    "deposit_due_amount",
                    "remaining_balance_estimate",
                    "updated_at",
                ]
            )

            _create_in_app_notification(
                recipient=locked_request.resource.owner,
                sender=organizer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                title=f"Checkout hold started — {locked_request.resource.display_name}",
                message=(
                    f"{organizer.username} started checkout for {locked_request.resource.display_name}. "
                    f"The hold expires at {hold_expires_at.strftime('%Y-%m-%d %H:%M %Z')}."
                ),
                link_type="booking_request",
                link_id=locked_request.id,
                data={
                    "request_id": locked_request.id,
                    "checkout_session_id": checkout_session.id,
                    "hold_expires_at": hold_expires_at.isoformat(),
                },
            )

        _create_audit(
            actor=organizer,
            action="checkout.started",
            target_type="CheckoutSession",
            target_id=checkout_session.id,
            after={
                "request_ids": normalized_request_ids,
                "hold_expires_at": hold_expires_at.isoformat(),
                "hold_minutes": hold_minutes,
            },
        )
        _emit_outbox(
            event_type="checkout.started",
            aggregate_type="checkout_session",
            aggregate_id=checkout_session.id,
            payload={
                "checkout_session_id": checkout_session.id,
                "request_ids": normalized_request_ids,
                "hold_expires_at": hold_expires_at.isoformat(),
            },
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.start",
        key=idempotency_key,
        payload=payload,
        response_status=201,
        response_body={"checkout_session_id": checkout_session.id},
    )
    return checkout_session, True


def refresh_checkout_session(
    *,
    organizer,
    checkout_session: CheckoutSession,
    idempotency_key: str | None = None,
):
    payload = {"checkout_session_id": checkout_session.id, "action": "refresh"}
    existing = _get_or_assert_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.refresh",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        return CheckoutSession.objects.get(id=checkout_session.id)

    now = timezone.now()
    with transaction.atomic():
        locked_session = CheckoutSession.objects.select_for_update().get(id=checkout_session.id)
        if locked_session.organizer_id != organizer.id:
            raise PolicyViolationError("You do not have permission to refresh this checkout session.")
        if locked_session.status != CheckoutSession.Status.ACTIVE:
            raise TransitionError("Only active checkout sessions can be refreshed.")
        if locked_session.hold_expires_at <= now:
            raise TransitionError("This checkout session has already expired.")

        refreshed_expires_at = now + timedelta(minutes=locked_session.hold_minutes)
        locked_session.hold_expires_at = refreshed_expires_at
        locked_session.save(update_fields=["hold_expires_at", "updated_at"])
        BookingRequest.objects.filter(checkout_session=locked_session).update(
            draft_hold_expires_at=refreshed_expires_at,
            updated_at=timezone.now(),
        )

        _create_audit(
            actor=organizer,
            action="checkout.refreshed",
            target_type="CheckoutSession",
            target_id=locked_session.id,
            after={"hold_expires_at": refreshed_expires_at.isoformat()},
        )
        _emit_outbox(
            event_type="checkout.refreshed",
            aggregate_type="checkout_session",
            aggregate_id=locked_session.id,
            payload={
                "checkout_session_id": locked_session.id,
                "hold_expires_at": refreshed_expires_at.isoformat(),
            },
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.refresh",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"checkout_session_id": checkout_session.id},
    )
    return locked_session


def complete_checkout_mock_deposit(
    *,
    organizer,
    checkout_session: CheckoutSession,
    card_brand: str,
    card_last4: str,
    card_expiry_month: int,
    card_expiry_year: int,
    mock_payment_reference: str | None = None,
    idempotency_key: str | None = None,
):
    payload = {
        "checkout_session_id": checkout_session.id,
        "card_brand": card_brand,
        "card_last4": card_last4,
        "card_expiry_month": card_expiry_month,
        "card_expiry_year": card_expiry_year,
        "mock_payment_reference": mock_payment_reference,
    }
    existing = _get_or_assert_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.mock_deposit",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        return CheckoutSession.objects.get(id=checkout_session.id)

    if len(str(card_last4)) != 4 or not str(card_last4).isdigit():
        raise PolicyViolationError("card_last4 must contain exactly four digits.")

    now = timezone.now()
    with transaction.atomic():
        locked_session = CheckoutSession.objects.select_for_update().get(id=checkout_session.id)
        if locked_session.organizer_id != organizer.id:
            raise PolicyViolationError("You do not have permission to pay for this checkout session.")
        if locked_session.status != CheckoutSession.Status.ACTIVE:
            raise TransitionError("Only active checkout sessions can accept a mock deposit.")
        if locked_session.hold_expires_at <= now:
            raise TransitionError("This checkout session has already expired.")

        locked_session.paid_at = locked_session.paid_at or now
        locked_session.card_brand = card_brand.strip()
        locked_session.card_last4 = str(card_last4)
        locked_session.card_expiry_month = card_expiry_month
        locked_session.card_expiry_year = card_expiry_year
        locked_session.mock_payment_reference = (
            mock_payment_reference
            or locked_session.mock_payment_reference
            or f"mock-{locked_session.id}-{int(now.timestamp())}"
        )
        locked_session.save(
            update_fields=[
                "paid_at",
                "card_brand",
                "card_last4",
                "card_expiry_month",
                "card_expiry_year",
                "mock_payment_reference",
                "updated_at",
            ]
        )

        held_requests = list(
            BookingRequest.objects.select_related("resource", "resource__owner")
            .filter(checkout_session=locked_session)
        )
        BookingRequest.objects.filter(id__in=[request.id for request in held_requests]).update(updated_at=timezone.now())

        for held_request in held_requests:
            _create_in_app_notification(
                recipient=held_request.resource.owner,
                sender=organizer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                title=f"Mock deposit paid — {held_request.resource.display_name}",
                message=(
                    f"{organizer.username} completed the mock deposit step for {held_request.resource.display_name}. "
                    "The request is now ready for publish if the hold remains active."
                ),
                link_type="booking_request",
                link_id=held_request.id,
                data={
                    "request_id": held_request.id,
                    "checkout_session_id": locked_session.id,
                    "paid_at": locked_session.paid_at.isoformat() if locked_session.paid_at else None,
                },
            )

        _create_audit(
            actor=organizer,
            action="checkout.deposit_mock_paid",
            target_type="CheckoutSession",
            target_id=locked_session.id,
            after={
                "paid_at": locked_session.paid_at.isoformat(),
                "mock_payment_reference": locked_session.mock_payment_reference,
            },
        )
        _emit_outbox(
            event_type="checkout.deposit_mock_paid",
            aggregate_type="checkout_session",
            aggregate_id=locked_session.id,
            payload={
                "checkout_session_id": locked_session.id,
                "paid_at": locked_session.paid_at.isoformat(),
                "mock_payment_reference": locked_session.mock_payment_reference,
            },
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.checkout.mock_deposit",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"checkout_session_id": checkout_session.id},
    )
    return locked_session


def release_checkout_session(
    *,
    actor,
    checkout_session: CheckoutSession,
    status: str = CheckoutSession.Status.RELEASED,
    notify: bool = True,
    idempotency_key: str | None = None,
):
    payload = {
        "checkout_session_id": checkout_session.id,
        "status": status,
    }
    existing = _get_or_assert_idempotency(
        owner=actor,
        endpoint="scheduling.checkout.release",
        key=idempotency_key,
        payload=payload,
    )
    if existing:
        return CheckoutSession.objects.get(id=checkout_session.id)

    now = timezone.now()
    with transaction.atomic():
        locked_session = CheckoutSession.objects.select_for_update().get(id=checkout_session.id)
        if locked_session.organizer_id != actor.id:
            raise PolicyViolationError("You do not have permission to release this checkout session.")
        if locked_session.status == CheckoutSession.Status.FINALIZED:
            raise TransitionError("Finalized checkout sessions cannot be released.")
        if locked_session.status in {CheckoutSession.Status.RELEASED, CheckoutSession.Status.EXPIRED}:
            return locked_session

        held_requests = list(
            BookingRequest.objects.select_for_update()
            .select_related("resource", "resource__owner", "organizer")
            .filter(checkout_session=locked_session)
        )
        for held_request in held_requests:
            _release_capacity(
                held_request.resource,
                held_request.requested_start_at,
                held_request.requested_end_at,
                held_request.attendee_count,
            )
            held_request.checkout_released_at = now
            held_request.draft_hold_expires_at = now
            held_request.save(update_fields=["checkout_released_at", "draft_hold_expires_at", "updated_at"])

        locked_session.status = status
        locked_session.released_at = now
        locked_session.hold_expires_at = now
        locked_session.save(update_fields=["status", "released_at", "hold_expires_at", "updated_at"])

        _create_audit(
            actor=actor,
            action="checkout.released" if status == CheckoutSession.Status.RELEASED else "checkout.expired",
            target_type="CheckoutSession",
            target_id=locked_session.id,
            after={"status": status},
        )
        _emit_outbox(
            event_type="checkout.released" if status == CheckoutSession.Status.RELEASED else "checkout.expired",
            aggregate_type="checkout_session",
            aggregate_id=locked_session.id,
            payload={"checkout_session_id": locked_session.id, "status": status},
        )

        if notify:
            organizer_message = (
                "The checkout hold expired before publish."
                if status == CheckoutSession.Status.EXPIRED
                else "The checkout hold is no longer active. You can restart checkout if the slot is still free."
            )
            provider_message = (
                "The checkout hold expired and your availability is open again."
                if status == CheckoutSession.Status.EXPIRED
                else "The organizer released the checkout hold and your availability is open again."
            )
            for held_request in held_requests:
                resource_name = held_request.resource.display_name
                _create_in_app_notification(
                    recipient=held_request.organizer,
                    sender=held_request.resource.owner,
                    notification_type=Notification.NotificationType.BOOKING_CANCELLED,
                    title=f"Checkout hold released — {resource_name}",
                    message=organizer_message,
                    link_type="booking_request",
                    link_id=held_request.id,
                    data={"request_id": held_request.id, "checkout_session_id": locked_session.id},
                )
                _create_in_app_notification(
                    recipient=held_request.resource.owner,
                    sender=held_request.organizer,
                    notification_type=Notification.NotificationType.BOOKING_CANCELLED,
                    title=f"Hold released — {resource_name}",
                    message=provider_message,
                    link_type="booking_request",
                    link_id=held_request.id,
                    data={"request_id": held_request.id, "checkout_session_id": locked_session.id},
                )

    _save_idempotency(
        owner=actor,
        endpoint="scheduling.checkout.release",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"checkout_session_id": checkout_session.id},
    )
    return locked_session


def expire_checkout_sessions(limit: int = 500):
    now = timezone.now()
    session_ids = list(
        CheckoutSession.objects.filter(
            status=CheckoutSession.Status.ACTIVE,
            hold_expires_at__lte=now,
        )
        .order_by("hold_expires_at")
        .values_list("id", flat=True)[:limit]
    )
    expired = 0
    for session_id in session_ids:
        session = CheckoutSession.objects.filter(id=session_id).first()
        if not session:
            continue
        try:
            release_checkout_session(
                actor=session.organizer,
                checkout_session=session,
                status=CheckoutSession.Status.EXPIRED,
                notify=True,
            )
            expired += 1
        except TransitionError:
            continue
    return expired


def nudge_organizer_checkout(*, provider, booking_request: BookingRequest):
    """Provider nudges the organizer to complete checkout for an accepted draft request."""
    if booking_request.status != BookingRequest.Status.APPROVED:
        raise TransitionError("Can only nudge for accepted requests.")
    if not booking_request.event_draft_id:
        raise PolicyViolationError("Nudging is only available for draft-linked requests.")
    if booking_request.resource.owner_id != provider.id:
        raise PermissionError("Only the resource owner can send a checkout nudge.")

    organizer = booking_request.organizer
    resource_name = booking_request.resource.display_name
    event_label = ""
    if booking_request.event_draft_id and booking_request.event_draft:
        draft_data = booking_request.event_draft.data or {}
        step1 = (draft_data.get("steps") or {}).get("step1") or {}
        event_label = step1.get("name") or step1.get("eventName") or ""
    event_label = event_label or "your event"

    _create_in_app_notification(
        recipient=organizer,
        sender=provider,
        notification_type=Notification.NotificationType.CHECKOUT_NUDGE,
        title=f"{resource_name} is waiting — please complete checkout",
        message=(
            f"{resource_name} accepted your booking request for {event_label}. "
            "Open your booking summary and complete checkout to lock in the reservation."
        ),
        link_type="booking_request",
        link_id=booking_request.id,
        data={
            "request_id": booking_request.id,
            "resource_id": booking_request.resource_id,
        },
    )
    _create_audit(
        actor=provider,
        action="request.checkout_nudge",
        target_type="BookingRequest",
        target_id=booking_request.id,
    )


def finalize_draft_bookings(*, draft, published_event, organizer):
    with transaction.atomic():
        now = timezone.now()
        approved_requests = list(
            BookingRequest.objects.select_for_update()
            .select_related("resource", "resource__owner", "organizer", "checkout_session")
            .filter(event_draft=draft, status=BookingRequest.Status.APPROVED)
            .order_by("id")
        )

        finalized_request_ids = []
        skipped_request_ids = []
        released_request_ids = []
        touched_session_ids = set()

        for request in approved_requests:
            request.event = published_event
            if is_booking_request_ready_for_publish(request, now):
                booking, _ = create_booking(
                    organizer=request.organizer,
                    event=published_event,
                    resource=request.resource,
                    start_at=request.requested_start_at,
                    end_at=request.requested_end_at,
                    attendee_count=request.attendee_count,
                    source=Booking.Source.REQUEST,
                    source_request=request,
                    consume_checkout_hold=True,
                    idempotency_key=None,
                )
                request.event_draft = None
                request.draft_hold_expires_at = None
                request.save(update_fields=["event", "event_draft", "draft_hold_expires_at", "updated_at"])
                finalized_request_ids.append(request.id)
                if request.checkout_session_id:
                    touched_session_ids.add(request.checkout_session_id)

                _create_in_app_notification(
                    recipient=request.resource.owner,
                    sender=organizer,
                    notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                    title=f"Booking finalized — {published_event.name}",
                    message=(
                        f"The event '{published_event.name}' has been published. "
                        f"Your booking for {request.resource.display_name} is now confirmed."
                    ),
                    link_type="confirmed_booking",
                    link_id=booking.id,
                    data={"booking_id": booking.id, "request_id": request.id},
                )
                _create_in_app_notification(
                    recipient=organizer,
                    sender=request.resource.owner,
                    notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                    title=f"Booking confirmed — {request.resource.display_name}",
                    message=f"Your booking for {request.resource.display_name} is confirmed for {published_event.name}.",
                    link_type="confirmed_booking",
                    link_id=booking.id,
                    data={"booking_id": booking.id, "request_id": request.id},
                )
                continue

            if _request_checkout_session_is_active(request, now):
                _release_capacity(
                    request.resource,
                    request.requested_start_at,
                    request.requested_end_at,
                    request.attendee_count,
                )
                request.checkout_released_at = now
                request.draft_hold_expires_at = now
                released_request_ids.append(request.id)
                if request.checkout_session_id:
                    touched_session_ids.add(request.checkout_session_id)

            request.event_draft = None
            request.save(
                update_fields=[
                    "event",
                    "event_draft",
                    "checkout_released_at",
                    "draft_hold_expires_at",
                    "updated_at",
                ]
            )
            skipped_request_ids.append(request.id)

        BookingRequest.objects.filter(event_draft=draft).exclude(id__in=[request.id for request in approved_requests]).update(
            event=published_event,
            event_draft=None,
        )

        for session_id in touched_session_ids:
            session = CheckoutSession.objects.select_for_update().get(id=session_id)
            session_request_ids = list(
                BookingRequest.objects.filter(checkout_session=session).values_list("id", flat=True)
            )
            finalized_in_session = any(request_id in finalized_request_ids for request_id in session_request_ids)
            session.status = CheckoutSession.Status.FINALIZED if finalized_in_session else CheckoutSession.Status.RELEASED
            session.finalized_at = now if finalized_in_session else session.finalized_at
            session.released_at = now if not finalized_in_session else session.released_at
            session.hold_expires_at = now
            session.save(
                update_fields=["status", "finalized_at", "released_at", "hold_expires_at", "updated_at"]
            )

        return {
            "finalized_request_ids": finalized_request_ids,
            "skipped_request_ids": skipped_request_ids,
            "released_request_ids": released_request_ids,
        }


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Compute haversine distance in km between two lat/lng points."""
    import math
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def search_availability_enriched(
    *,
    start_at: datetime,
    end_at: datetime,
    resource_type: str | None = None,
    city: str | None = None,
    attendee_count: int = 1,
    lat: float | None = None,
    lng: float | None = None,
    min_rating: float | None = None,
    max_price: float | None = None,
    name: str | None = None,
    limit: int = 20,
    offset: int = 0,
):
    """
    Enriched availability search that joins provider profile data (rating, price, image,
    bio, distance) and sorts by distance → rating → price.
    """
    from artists.models import Artist
    from locations.models import Location
    from vendors.models import Vendor

    base_results = search_availability(
        start_at=start_at,
        end_at=end_at,
        resource_type=resource_type,
        city=city,
        attendee_count=attendee_count,
        limit=limit * 4,  # Over-fetch to allow for post-filter/sort
        offset=offset,
    )

    enriched = []
    for item in base_results:
        extra = {}

        if item.get("artist_id"):
            try:
                artist = Artist.objects.get(id=item["artist_id"])
                extra = {
                    "profile_image": str(artist.profile_image.url) if artist.profile_image else None,
                    "bio": artist.bio or "",
                    "rating": float(artist.rating) if artist.rating else None,
                    "price_info": {
                        "min": float(artist.booking_fee_min) if artist.booking_fee_min else None,
                        "max": float(artist.booking_fee_max) if artist.booking_fee_max else None,
                        "base": float(artist.booking_fee) if artist.booking_fee else None,
                        "currency": "ZAR",
                    },
                    "distance_km": None,
                    "response_time_hours": 24,
                    "genres": artist.genres or "",
                }
            except Artist.DoesNotExist:
                pass

        elif item.get("venue_id"):
            try:
                location = Location.objects.get(id=item["venue_id"])
                distance_km = None
                if lat is not None and lng is not None and location.latitude and location.longitude:
                    distance_km = round(
                        _haversine_km(lat, lng, float(location.latitude), float(location.longitude)), 1
                    )
                extra = {
                    "profile_image": location.image_url or (str(location.image.url) if location.image else None),
                    "bio": f"Capacity: {location.capacity}" if location.capacity else "",
                    "rating": float(location.rating) if location.rating else None,
                    "price_info": {
                        "base": float(location.price) if location.price else None,
                        "min": float(location.budget_estimate_min) if location.budget_estimate_min else None,
                        "max": float(location.budget_estimate_max) if location.budget_estimate_max else None,
                        "currency": "ZAR",
                    },
                    "distance_km": distance_km,
                    "response_time_hours": 48,
                    "address": location.address or "",
                }
            except Location.DoesNotExist:
                pass

        elif item.get("vendor_id"):
            try:
                vendor = Vendor.objects.get(id=item["vendor_id"])
                extra = {
                    "profile_image": str(vendor.portfolio.url) if vendor.portfolio else None,
                    "bio": vendor.description or "",
                    "rating": float(vendor.rating) if vendor.rating else None,
                    "price_info": {
                        "base": float(vendor.price_range) if vendor.price_range else None,
                        "currency": "ZAR",
                    },
                    "distance_km": None,
                    "response_time_hours": 24,
                }
            except Vendor.DoesNotExist:
                pass

        # Apply name filter
        if name:
            name_lower = name.lower()
            if name_lower not in item.get("display_name", "").lower():
                continue

        # Apply min_rating filter
        if min_rating is not None and extra.get("rating") is not None:
            if extra["rating"] < min_rating:
                continue

        # Apply max_price filter
        if max_price is not None:
            price_base = (extra.get("price_info") or {}).get("base")
            if price_base is not None and price_base > max_price:
                continue

        enriched.append({**item, **extra})

    # Sort: distance ASC (None last), rating DESC (None last), price ASC (None last)
    def sort_key(r):
        dist = r.get("distance_km")
        rating = r.get("rating")
        price = (r.get("price_info") or {}).get("base")
        return (
            dist if dist is not None else 99999,
            -(rating if rating is not None else 0),
            price if price is not None else 99999,
            r.get("resource_id", 0),
        )

    enriched.sort(key=sort_key)
    return enriched[:limit]


def cancel_booking(*, actor, booking: Booking, reason: str = "", idempotency_key: str | None = None):
    payload = {"booking_id": booking.id, "action": "cancel"}
    existing = _get_or_assert_idempotency(
        owner=actor, endpoint="scheduling.booking.cancel", key=idempotency_key, payload=payload
    )
    if existing:
        return Booking.objects.get(id=booking.id)

    with transaction.atomic():
        locked_booking = Booking.objects.select_for_update().get(id=booking.id)
        if locked_booking.status in {Booking.Status.CANCELLED, Booking.Status.COMPLETED, Booking.Status.EXPIRED}:
            raise TransitionError("Booking cannot be cancelled in its current state.")

        previous_status = locked_booking.status
        locked_booking.status = Booking.Status.CANCELLED
        locked_booking.cancellation_reason = reason
        locked_booking.cancelled_by = actor
        locked_booking.save(update_fields=["status", "cancellation_reason", "cancelled_by", "updated_at"])

        _release_capacity(
            locked_booking.resource,
            locked_booking.start_at,
            locked_booking.end_at,
            locked_booking.attendee_count,
        )

        _create_audit(
            actor=actor,
            action="booking.cancelled",
            target_type="Booking",
            target_id=locked_booking.id,
            before={"status": previous_status},
            after={"status": Booking.Status.CANCELLED},
            reason=reason,
        )
        _emit_outbox(
            event_type="booking.cancelled",
            aggregate_type="booking",
            aggregate_id=locked_booking.id,
            payload={"booking_id": locked_booking.id, "reason": reason},
        )

    _save_idempotency(
        owner=actor,
        endpoint="scheduling.booking.cancel",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"booking_id": locked_booking.id, "status": Booking.Status.CANCELLED},
    )

    return locked_booking


def reschedule_booking(*, actor, booking: Booking, new_start_at: datetime, new_end_at: datetime):
    if new_end_at <= new_start_at:
        raise PolicyViolationError("Reschedule end time must be after start time.")

    with transaction.atomic():
        locked_booking = Booking.objects.select_for_update().select_related("resource").get(id=booking.id)
        if locked_booking.status not in Booking.ACTIVE_STATES:
            raise TransitionError("Only active bookings can be rescheduled.")

        _ensure_policy(locked_booking.resource, new_start_at)

        old_start = locked_booking.start_at
        old_end = locked_booking.end_at
        attendee_count = locked_booking.attendee_count

        # Release capacity for the old window first; the whole transaction rolls back
        # automatically if the new-window check below fails, so no manual restore needed.
        _release_capacity(locked_booking.resource, old_start, old_end, attendee_count)

        new_slots = list(_lock_overlapping_slots(locked_booking.resource, new_start_at, new_end_at))
        if new_slots:
            # Capacity-aware: allow reschedule if the new slot still has room.
            try:
                _assert_slot_capacity(new_slots, attendee_count)
            except ConflictError as capacity_exc:
                _record_conflict_incident(
                    operation=BookingConflictIncident.Operation.RESCHEDULE,
                    conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                    resource=locked_booking.resource,
                    event=locked_booking.event,
                    organizer=locked_booking.organizer,
                    requested_start_at=new_start_at,
                    requested_end_at=new_end_at,
                    message=str(capacity_exc),
                    details={"booking_id": locked_booking.id},
                )
                raise
            _reserve_capacity(new_slots, attendee_count)
        else:
            # No slots: single-capacity fallback, excluding this booking itself.
            conflict = _find_booking_conflict(
                locked_booking.resource,
                new_start_at,
                new_end_at,
                exclude_booking_id=locked_booking.id,
            )
            if conflict:
                _record_conflict_incident(
                    operation=BookingConflictIncident.Operation.RESCHEDULE,
                    conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
                    resource=locked_booking.resource,
                    event=locked_booking.event,
                    organizer=locked_booking.organizer,
                    requested_start_at=new_start_at,
                    requested_end_at=new_end_at,
                    message=f"Resource has a conflicting booking #{conflict.id}.",
                    details={"conflicting_booking_id": conflict.id, "booking_id": locked_booking.id},
                )
                raise ConflictError(f"Resource has a conflicting booking #{conflict.id}.")

        locked_booking.start_at = new_start_at
        locked_booking.end_at = new_end_at
        locked_booking.status = Booking.Status.CONFIRMED
        locked_booking.version = F("version") + 1
        locked_booking.reschedule_requested_start_at = None
        locked_booking.reschedule_requested_end_at = None
        try:
            locked_booking.save(
                update_fields=[
                    "start_at",
                    "end_at",
                    "status",
                    "version",
                    "reschedule_requested_start_at",
                    "reschedule_requested_end_at",
                    "updated_at",
                ]
            )
        except IntegrityError as exc:
            _record_conflict_incident(
                operation=BookingConflictIncident.Operation.RESCHEDULE,
                conflict_source=BookingConflictIncident.ConflictSource.DB_CONSTRAINT,
                resource=locked_booking.resource,
                event=locked_booking.event,
                organizer=locked_booking.organizer,
                requested_start_at=new_start_at,
                requested_end_at=new_end_at,
                message="Resource has a conflicting booking for the requested reschedule window.",
                details={"source": "integrity_error", "booking_id": locked_booking.id},
            )
            raise ConflictError("Resource has a conflicting booking for the requested reschedule window.") from exc
        locked_booking.refresh_from_db()

        _create_audit(
            actor=actor,
            action="booking.rescheduled",
            target_type="Booking",
            target_id=locked_booking.id,
            before={"start_at": old_start.isoformat(), "end_at": old_end.isoformat()},
            after={"start_at": new_start_at.isoformat(), "end_at": new_end_at.isoformat()},
        )
        _emit_outbox(
            event_type="booking.rescheduled",
            aggregate_type="booking",
            aggregate_id=locked_booking.id,
            payload={
                "booking_id": locked_booking.id,
                "old_start": old_start.isoformat(),
                "old_end": old_end.isoformat(),
                "new_start": new_start_at.isoformat(),
                "new_end": new_end_at.isoformat(),
            },
        )

        return locked_booking


def complete_booking(*, actor, booking: Booking):
    """Provider marks a booking as COMPLETED."""
    with transaction.atomic():
        locked_booking = Booking.objects.select_for_update().get(id=booking.id)
        completable = {Booking.Status.CONFIRMED, Booking.Status.IN_PROGRESS}
        if locked_booking.status not in completable:
            raise TransitionError("Only confirmed or in-progress bookings can be marked complete.")

        previous_status = locked_booking.status
        locked_booking.status = Booking.Status.COMPLETED
        locked_booking.save(update_fields=["status", "updated_at"])

        _create_audit(
            actor=actor,
            action="booking.completed",
            target_type="Booking",
            target_id=locked_booking.id,
            before={"status": previous_status},
            after={"status": Booking.Status.COMPLETED},
        )
        _emit_outbox(
            event_type="booking.completed",
            aggregate_type="booking",
            aggregate_id=locked_booking.id,
            payload={"booking_id": locked_booking.id},
        )
        return locked_booking


def withdraw_request(*, organizer, booking_request: BookingRequest, idempotency_key: str | None = None):
    """Organizer withdraws a PENDING or COUNTER_PROPOSED request."""
    payload = {"request_id": booking_request.id, "action": "withdraw"}
    existing = _get_or_assert_idempotency(
        owner=organizer, endpoint="scheduling.request.withdraw", key=idempotency_key, payload=payload
    )
    if existing:
        return BookingRequest.objects.get(id=booking_request.id)

    with transaction.atomic():
        locked_request = (
            BookingRequest.objects.select_for_update()
            .select_related("resource", "resource__owner", "organizer")
            .get(id=booking_request.id)
        )
        if locked_request.organizer_id != organizer.id:
            raise PermissionError("Only the organizer can withdraw a request.")
        withdrawable = {BookingRequest.Status.PENDING, BookingRequest.Status.COUNTER_PROPOSED}
        if locked_request.status not in withdrawable:
            raise TransitionError("Only pending or counter-proposed requests can be withdrawn.")

        prev_status = locked_request.status
        locked_request.status = BookingRequest.Status.WITHDRAWN
        locked_request.save(update_fields=["status", "updated_at"])

        _create_audit(
            actor=organizer,
            action="request.withdrawn",
            target_type="BookingRequest",
            target_id=locked_request.id,
            before={"status": prev_status},
            after={"status": BookingRequest.Status.WITHDRAWN},
        )
        _emit_outbox(
            event_type="request.withdrawn",
            aggregate_type="booking_request",
            aggregate_id=locked_request.id,
            payload={"request_id": locked_request.id},
        )

        # Notify the provider so they know the slot is back open.
        _create_in_app_notification(
            recipient=locked_request.resource.owner,
            sender=organizer,
            notification_type=Notification.NotificationType.BOOKING_CANCELLED,
            title=f"Booking request withdrawn — {locked_request.resource.display_name}",
            message=f"{organizer.username} withdrew their booking request.",
            link_type="booking",
            link_id=locked_request.id,
            data={"request_id": locked_request.id, "resource_id": locked_request.resource_id},
        )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.request.withdraw",
        key=idempotency_key,
        payload=payload,
        response_status=200,
        response_body={"request_id": locked_request.id, "status": BookingRequest.Status.WITHDRAWN},
    )

    return locked_request


def _iter_rule_dates(rule: AvailabilityRule, range_start: date, range_end: date):
    current = max(rule.effective_start_date, range_start)
    effective_end = min(rule.effective_end_date or range_end, range_end)

    while current <= effective_end:
        if rule.frequency == AvailabilityRule.Frequency.DAILY:
            yield current
        elif current.weekday() in (rule.weekdays or []):
            yield current
        current += timedelta(days=1)


def _resolve_local_datetime(local_dt: datetime, tz: ZoneInfo, prefer_fold: int = 0):
    candidates = []
    for fold in (0, 1):
        aware = local_dt.replace(tzinfo=tz, fold=fold)
        roundtrip = aware.astimezone(datetime_timezone.utc).astimezone(tz).replace(tzinfo=None)
        candidates.append((fold, aware, roundtrip == local_dt))

    valid = [(fold, aware) for fold, aware, is_valid in candidates if is_valid]
    if not valid:
        return None

    if len(valid) == 2 and valid[0][1].utcoffset() != valid[1][1].utcoffset():
        return valid[0][1] if prefer_fold == 0 else valid[1][1]
    return valid[0][1]


def _rule_slot_to_utc(rule: AvailabilityRule, slot_date: date):
    tz = ZoneInfo(rule.timezone or "UTC")
    local_start = datetime.combine(slot_date, rule.local_start_time)
    local_end = datetime.combine(slot_date, rule.local_end_time)

    # DST policy:
    # - ambiguous local times pick fold=0 (earlier occurrence),
    # - nonexistent local times are skipped entirely.
    aware_start = _resolve_local_datetime(local_start, tz, prefer_fold=0)
    aware_end = _resolve_local_datetime(local_end, tz, prefer_fold=0)
    if not aware_start or not aware_end:
        return None

    utc_start = aware_start.astimezone(datetime_timezone.utc)
    utc_end = aware_end.astimezone(datetime_timezone.utc)
    if utc_end <= utc_start:
        return None
    return utc_start, utc_end


def _apply_exceptions(resource: MarketplaceResource, start_at: datetime, end_at: datetime):
    exceptions = AvailabilityException.objects.filter(resource=resource).filter(_overlap_q(start_at, end_at))
    for exception in exceptions:
        if exception.exception_type == AvailabilityException.ExceptionType.BLACKOUT:
            return False
    return True


def _has_active_overlap(resource: MarketplaceResource, start_at: datetime, end_at: datetime):
    return (
        _active_booking_qs(resource).filter(_overlap_q(start_at, end_at)).exists()
        or _active_checkout_hold_qs(resource, start_at, end_at).exists()
    )


def search_availability(
    *,
    start_at: datetime,
    end_at: datetime,
    resource_type: str | None = None,
    city: str | None = None,
    attendee_count: int = 1,
    limit: int = 25,
    offset: int = 0,
):
    resources = MarketplaceResource.objects.filter(is_active=True)
    if resource_type:
        resources = resources.filter(resource_type=resource_type)
    if city:
        resources = resources.filter(city__iexact=city)

    resources = resources.order_by("id")[offset : offset + limit]
    results = []

    for resource in resources:
        windows = []
        materialized_slots = (
            AvailabilitySlot.objects.filter(resource=resource, is_bookable=True)
            .filter(_overlap_q(start_at, end_at))
            .order_by("start_at")
        )

        for slot in materialized_slots:
            if slot.capacity_remaining >= attendee_count:
                windows.append(
                    {
                        "start_at": slot.start_at,
                        "end_at": slot.end_at,
                        "capacity_remaining": slot.capacity_remaining,
                        "source": "slot",
                    }
                )

        if not windows:
            rule_qs = AvailabilityRule.objects.filter(
                resource=resource,
                is_active=True,
                effective_start_date__lte=end_at.date(),
            ).filter(Q(effective_end_date__isnull=True) | Q(effective_end_date__gte=start_at.date()))
            for rule in rule_qs:
                for slot_date in _iter_rule_dates(rule, start_at.date(), end_at.date()):
                    slot_window = _rule_slot_to_utc(rule, slot_date)
                    if not slot_window:
                        continue
                    utc_start, utc_end = slot_window
                    if utc_end <= start_at or utc_start >= end_at:
                        continue
                    if not _apply_exceptions(resource, utc_start, utc_end):
                        continue
                    if _has_active_overlap(resource, utc_start, utc_end):
                        continue
                    windows.append(
                        {
                            "start_at": utc_start,
                            "end_at": utc_end,
                            "capacity_remaining": rule.capacity,
                            "source": "rule",
                        }
                    )

        if windows:
            policy = ResourcePolicy.objects.filter(resource=resource).first()
            results.append(
                {
                    "resource_id": resource.id,
                    "resource_type": resource.resource_type,
                    "display_name": resource.display_name,
                    "timezone": resource.timezone,
                    "city": resource.city,
                    "country": resource.country,
                    "venue_id": resource.venue_id,
                    "artist_id": resource.artist_id,
                    "vendor_id": resource.vendor_id,
                    "booking_mode": policy.booking_mode if policy else ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
                    "windows": sorted(windows, key=lambda item: item["start_at"])[:30],
                }
            )

    return results


def materialize_availability_slots(
    *,
    start_date: date | None = None,
    end_date: date | None = None,
    horizon_days: int = 180,
    resource_id: int | None = None,
):
    if start_date is None:
        start_date = timezone.localdate()
    if end_date is None:
        end_date = start_date + timedelta(days=horizon_days)
    if end_date < start_date:
        raise PolicyViolationError("end_date must be on or after start_date.")

    rule_qs = AvailabilityRule.objects.filter(
        is_active=True,
        effective_start_date__lte=end_date,
    ).filter(Q(effective_end_date__isnull=True) | Q(effective_end_date__gte=start_date))
    if resource_id:
        rule_qs = rule_qs.filter(resource_id=resource_id)
    rules = list(rule_qs.select_related("resource").order_by("resource_id", "id"))

    created = 0
    updated = 0
    skipped_nonexistent = 0

    for rule in rules:
        for slot_date in _iter_rule_dates(rule, start_date, end_date):
            slot_window = _rule_slot_to_utc(rule, slot_date)
            if not slot_window:
                skipped_nonexistent += 1
                continue

            utc_start, utc_end = slot_window
            is_bookable = _apply_exceptions(rule.resource, utc_start, utc_end)
            desired_capacity = rule.capacity

            slot, was_created = AvailabilitySlot.objects.get_or_create(
                resource=rule.resource,
                start_at=utc_start,
                end_at=utc_end,
                defaults={
                    "source_rule": rule,
                    "capacity_total": desired_capacity,
                    "is_bookable": is_bookable,
                },
            )
            if was_created:
                created += 1
                continue

            target_capacity = max(slot.capacity_reserved, desired_capacity)
            needs_update = (
                slot.source_rule_id != rule.id
                or slot.capacity_total != target_capacity
                or slot.is_bookable != is_bookable
            )
            if not needs_update:
                continue

            AvailabilitySlot.objects.filter(id=slot.id).update(
                source_rule=rule,
                capacity_total=target_capacity,
                is_bookable=is_bookable,
                version=F("version") + 1,
                updated_at=timezone.now(),
            )
            updated += 1

    return {
        "rules_processed": len(rules),
        "slots_created": created,
        "slots_updated": updated,
        "skipped_nonexistent": skipped_nonexistent,
        "range_start": start_date.isoformat(),
        "range_end": end_date.isoformat(),
    }


def build_calendar_view(*, user, start_at: datetime, end_at: datetime, scope: str, event_id: int | None = None, resource_id: int | None = None):
    if end_at <= start_at:
        raise PolicyViolationError("Calendar end time must be after start time.")

    events = []

    if scope == "organizer":
        booking_qs = Booking.objects.filter(organizer=user).filter(_overlap_q(start_at, end_at))
        if event_id:
            booking_qs = booking_qs.filter(event_id=event_id)

        request_qs = BookingRequest.objects.filter(organizer=user).filter(
            Q(requested_start_at__lt=end_at) & Q(requested_end_at__gt=start_at)
        )
        if event_id:
            request_qs = request_qs.filter(event_id=event_id)

    elif scope == "resource":
        booking_qs = Booking.objects.filter(resource__owner=user).filter(_overlap_q(start_at, end_at))
        request_qs = BookingRequest.objects.filter(resource__owner=user).filter(
            Q(requested_start_at__lt=end_at) & Q(requested_end_at__gt=start_at)
        )
        if resource_id:
            booking_qs = booking_qs.filter(resource_id=resource_id)
            request_qs = request_qs.filter(resource_id=resource_id)

    else:
        booking_qs = Booking.objects.filter(_overlap_q(start_at, end_at))
        request_qs = BookingRequest.objects.filter(
            Q(requested_start_at__lt=end_at) & Q(requested_end_at__gt=start_at)
        )
        if event_id:
            booking_qs = booking_qs.filter(event_id=event_id)
            request_qs = request_qs.filter(event_id=event_id)
        if resource_id:
            booking_qs = booking_qs.filter(resource_id=resource_id)
            request_qs = request_qs.filter(resource_id=resource_id)

    for booking in booking_qs.select_related("event", "resource"):
        events.append(
            {
                "type": "booking",
                "id": booking.id,
                "status": booking.status,
                "event_id": booking.event_id,
                "resource_id": booking.resource_id,
                "title": f"{booking.resource.display_name} booking",
                "start_at": booking.start_at,
                "end_at": booking.end_at,
            }
        )

    for booking_request in request_qs.select_related("event", "resource"):
        events.append(
            {
                "type": "request",
                "id": booking_request.id,
                "status": booking_request.status,
                "event_id": booking_request.event_id,
                "resource_id": booking_request.resource_id,
                "title": f"{booking_request.resource.display_name} request",
                "start_at": booking_request.requested_start_at,
                "end_at": booking_request.requested_end_at,
            }
        )

    return sorted(events, key=lambda item: item["start_at"])


def expire_pending_requests(limit: int = 500):
    now = timezone.now()
    request_ids = list(
        BookingRequest.objects.filter(status=BookingRequest.Status.PENDING, expires_at__lt=now)
        .order_by("expires_at")
        .values_list("id", flat=True)[:limit]
    )
    if not request_ids:
        return 0

    with transaction.atomic():
        updated = BookingRequest.objects.filter(id__in=request_ids, status=BookingRequest.Status.PENDING).update(
            status=BookingRequest.Status.EXPIRED,
            updated_at=timezone.now(),
        )
        for request_id in request_ids:
            _emit_outbox(
                event_type="request.expired",
                aggregate_type="booking_request",
                aggregate_id=request_id,
                payload={"request_id": request_id},
            )
    return updated


def _create_in_app_notification(
    *,
    recipient,
    notification_type: str,
    title: str,
    message: str,
    sender=None,
    link_type: str = "",
    link_id: int | None = None,
    data: dict | None = None,
):
    if recipient is None:
        return None
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        link_type=link_type,
        link_id=link_id,
        data=data or {},
    )


def _dispatch_notification_for_event(event: OutboxEvent):
    payload = event.payload or {}

    if event.event_type == "request.created":
        booking_request = (
            BookingRequest.objects.select_related("organizer", "resource__owner", "event", "event_draft")
            .filter(id=payload.get("request_id"))
            .first()
        )
        if not booking_request:
            return

        event_label = (
            booking_request.event.name
            if booking_request.event_id
            else (booking_request.event_draft.data.get('step1', {}).get('name', 'your event') if booking_request.event_draft_id else "an event")
        )
        _create_in_app_notification(
            recipient=booking_request.resource.owner,
            sender=booking_request.organizer,
            notification_type=Notification.NotificationType.BOOKING_REQUEST,
            title=f"New booking request for {booking_request.resource.display_name}",
            message=f"{booking_request.organizer.username} requested {event_label}.",
            link_type="booking",
            link_id=booking_request.id,
            data={
                "request_id": booking_request.id,
                "resource_id": booking_request.resource_id,
                "event_id": booking_request.event_id,
            },
        )
        return

    if event.event_type == "request.approved":
        booking_request = (
            BookingRequest.objects.select_related("organizer", "resource", "event", "event_draft")
            .filter(id=payload.get("request_id"))
            .first()
        )
        if not booking_request:
            return

        event_label = (
            booking_request.event.name
            if booking_request.event_id
            else (booking_request.event_draft.data.get('step1', {}).get('name', 'your event') if booking_request.event_draft_id else "your event")
        )
        _create_in_app_notification(
            recipient=booking_request.organizer,
            notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
            title=f"Request approved for {booking_request.resource.display_name}",
            message=f"Your booking request for {event_label} was approved.",
            link_type="booking",
            link_id=payload.get("booking_id"),
            data={
                "request_id": booking_request.id,
                "booking_id": payload.get("booking_id"),
                "resource_id": booking_request.resource_id,
                "event_id": booking_request.event_id,
            },
        )
        return

    if event.event_type == "request.declined":
        booking_request = (
            BookingRequest.objects.select_related("organizer", "resource", "event", "event_draft")
            .filter(id=payload.get("request_id"))
            .first()
        )
        if not booking_request:
            return

        event_label = (
            booking_request.event.name
            if booking_request.event_id
            else (booking_request.event_draft.data.get('step1', {}).get('name', 'your event') if booking_request.event_draft_id else "your event")
        )
        _create_in_app_notification(
            recipient=booking_request.organizer,
            notification_type=Notification.NotificationType.BOOKING_REJECTED,
            title=f"Request declined for {booking_request.resource.display_name}",
            message=f"Your booking request for {event_label} was declined.",
            link_type="booking",
            link_id=booking_request.id,
            data={
                "request_id": booking_request.id,
                "resource_id": booking_request.resource_id,
                "event_id": booking_request.event_id,
            },
        )
        return

    if event.event_type == "request.expired":
        booking_request = (
            BookingRequest.objects.select_related("organizer", "resource", "event", "event_draft")
            .filter(id=payload.get("request_id"))
            .first()
        )
        if not booking_request:
            return

        event_label = (
            booking_request.event.name
            if booking_request.event_id
            else (booking_request.event_draft.data.get('step1', {}).get('name', 'your event') if booking_request.event_draft_id else "your event")
        )
        _create_in_app_notification(
            recipient=booking_request.organizer,
            notification_type=Notification.NotificationType.BOOKING_REJECTED,
            title=f"Request expired for {booking_request.resource.display_name}",
            message=f"Your booking request for {event_label} expired before review.",
            link_type="booking",
            link_id=booking_request.id,
            data={
                "request_id": booking_request.id,
                "resource_id": booking_request.resource_id,
                "event_id": booking_request.event_id,
            },
        )
        return

    if event.event_type == "booking.confirmed":
        booking = (
            Booking.objects.select_related("organizer", "resource__owner", "event")
            .filter(id=payload.get("booking_id"))
            .first()
        )
        if not booking:
            return
        if booking.source == Booking.Source.REQUEST:
            # Organizer notification already emitted on request.approved.
            return

        _create_in_app_notification(
            recipient=booking.resource.owner,
            sender=booking.organizer,
            notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
            title=f"New confirmed booking for {booking.resource.display_name}",
            message=f"{booking.organizer.username} booked {booking.event.name}.",
            link_type="booking",
            link_id=booking.id,
            data={
                "booking_id": booking.id,
                "resource_id": booking.resource_id,
                "event_id": booking.event_id,
            },
        )
        return

    if event.event_type == "booking.cancelled":
        booking = (
            Booking.objects.select_related("organizer", "resource__owner", "event", "cancelled_by")
            .filter(id=payload.get("booking_id"))
            .first()
        )
        if not booking:
            return

        cancelled_by_organizer = booking.cancelled_by_id == booking.organizer_id
        recipient = booking.resource.owner if cancelled_by_organizer else booking.organizer
        sender = booking.organizer if cancelled_by_organizer else booking.resource.owner
        _create_in_app_notification(
            recipient=recipient,
            sender=sender,
            notification_type=Notification.NotificationType.BOOKING_CANCELLED,
            title=f"Booking cancelled for {booking.resource.display_name}",
            message=f"Booking for {booking.event.name} was cancelled.",
            link_type="booking",
            link_id=booking.id,
            data={
                "booking_id": booking.id,
                "resource_id": booking.resource_id,
                "event_id": booking.event_id,
                "reason": payload.get("reason", ""),
            },
        )
        return

    if event.event_type == "booking.rescheduled":
        booking = (
            Booking.objects.select_related("organizer", "resource__owner", "event")
            .filter(id=payload.get("booking_id"))
            .first()
        )
        if not booking:
            return

        message = (
            f"Booking for {booking.event.name} moved to "
            f"{payload.get('new_start')} - {payload.get('new_end')}."
        )
        _create_in_app_notification(
            recipient=booking.organizer,
            notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
            title=f"Booking rescheduled for {booking.resource.display_name}",
            message=message,
            link_type="booking",
            link_id=booking.id,
            data={
                "booking_id": booking.id,
                "resource_id": booking.resource_id,
                "event_id": booking.event_id,
                "old_start": payload.get("old_start"),
                "old_end": payload.get("old_end"),
                "new_start": payload.get("new_start"),
                "new_end": payload.get("new_end"),
            },
        )
        _create_in_app_notification(
            recipient=booking.resource.owner,
            sender=booking.organizer,
            notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
            title=f"Booking rescheduled for {booking.resource.display_name}",
            message=message,
            link_type="booking",
            link_id=booking.id,
            data={
                "booking_id": booking.id,
                "resource_id": booking.resource_id,
                "event_id": booking.event_id,
                "old_start": payload.get("old_start"),
                "old_end": payload.get("old_end"),
                "new_start": payload.get("new_start"),
                "new_end": payload.get("new_end"),
            },
        )


class WebhookCircuitOpenError(RuntimeError):
    def __init__(self, webhook_url: str, retry_in_seconds: int):
        super().__init__(f"Webhook circuit is open for {webhook_url}.")
        self.retry_in_seconds = max(1, retry_in_seconds)


def _webhook_cache_key(webhook_url: str, suffix: str):
    digest = hashlib.sha256(webhook_url.encode("utf-8")).hexdigest()[:16]
    return f"scheduling:webhook:{digest}:{suffix}"


def _cache_increment(key: str, timeout: int):
    value = cache.get(key)
    next_value = int(value or 0) + 1
    cache.set(key, next_value, timeout=timeout)
    return next_value


def _record_webhook_metric(webhook_url: str, metric_name: str):
    ttl = max(60, int(getattr(settings, "SCHEDULING_WEBHOOK_METRICS_TTL_SECONDS", 86400)))
    metric_key = _webhook_cache_key(webhook_url, f"metric:{metric_name}")
    return _cache_increment(metric_key, ttl)


def _webhook_circuit_state(webhook_url: str):
    opened_until_ts = cache.get(_webhook_cache_key(webhook_url, "circuit:open_until"))
    if not opened_until_ts:
        return False, 0

    remaining = int(opened_until_ts - timezone.now().timestamp())
    if remaining <= 0:
        cache.delete(_webhook_cache_key(webhook_url, "circuit:open_until"))
        return False, 0
    return True, remaining


def _mark_webhook_success(webhook_url: str):
    _record_webhook_metric(webhook_url, "success")
    cache.delete(_webhook_cache_key(webhook_url, "circuit:failures"))
    cache.delete(_webhook_cache_key(webhook_url, "circuit:open_until"))


def _mark_webhook_failure(
    webhook_url: str,
    *,
    failure_threshold: int | None = None,
    open_seconds: int | None = None,
):
    _record_webhook_metric(webhook_url, "failed")

    threshold = max(
        1,
        int(
            failure_threshold
            if failure_threshold is not None
            else getattr(settings, "SCHEDULING_WEBHOOK_CIRCUIT_FAILURE_THRESHOLD", 5)
        ),
    )
    open_seconds = max(
        5,
        int(
            open_seconds
            if open_seconds is not None
            else getattr(settings, "SCHEDULING_WEBHOOK_CIRCUIT_OPEN_SECONDS", 120)
        ),
    )

    failures_key = _webhook_cache_key(webhook_url, "circuit:failures")
    failures = _cache_increment(failures_key, open_seconds * 10)
    if failures < threshold:
        return None

    open_until = timezone.now().timestamp() + open_seconds
    cache.set(_webhook_cache_key(webhook_url, "circuit:open_until"), open_until, open_seconds)
    return open_seconds


def _build_webhook_headers(*, event: OutboxEvent, request_body: bytes, secret: str = ""):
    timestamp = str(int(timezone.now().timestamp()))
    idempotency_key = f"scheduling-outbox-{event.id}"
    headers = {
        "Content-Type": "application/json",
        "X-Scheduling-Event": event.event_type,
        "X-Scheduling-Delivery-Id": str(event.id),
        "X-Scheduling-Timestamp": timestamp,
        "Idempotency-Key": idempotency_key,
    }

    if secret:
        signed_bytes = timestamp.encode("utf-8") + b"." + request_body
        signature = hmac.new(secret.encode("utf-8"), signed_bytes, hashlib.sha256).hexdigest()
        headers["X-Scheduling-Signature"] = f"v1={signature}"
    return headers


def _webhook_targets():
    default_timeout = max(1, int(getattr(settings, "SCHEDULING_WEBHOOK_TIMEOUT_SECONDS", 5)))
    default_secret = str(getattr(settings, "SCHEDULING_WEBHOOK_SECRET", "") or "")
    default_threshold = max(1, int(getattr(settings, "SCHEDULING_WEBHOOK_CIRCUIT_FAILURE_THRESHOLD", 5)))
    default_open_seconds = max(5, int(getattr(settings, "SCHEDULING_WEBHOOK_CIRCUIT_OPEN_SECONDS", 120)))

    try:
        db_targets = list(WebhookTarget.objects.filter(is_active=True).order_by("id"))
    except Exception:
        db_targets = []
    if db_targets:
        return [
            {
                "id": target.id,
                "url": target.url,
                "description": target.description,
                "secret": target.secret or default_secret,
                "timeout": max(1, int(target.timeout_seconds or default_timeout)),
                "failure_threshold": max(1, int(target.failure_threshold or default_threshold)),
                "open_seconds": max(5, int(target.open_seconds or default_open_seconds)),
                "source": "database",
            }
            for target in db_targets
        ]

    explicit_targets = getattr(settings, "SCHEDULING_WEBHOOK_TARGETS", None)
    if explicit_targets:
        normalized = []
        for target in explicit_targets:
            if isinstance(target, str):
                normalized.append(
                    {
                        "url": target,
                        "secret": default_secret,
                        "timeout": default_timeout,
                        "failure_threshold": default_threshold,
                        "open_seconds": default_open_seconds,
                        "source": "settings",
                    }
                )
                continue
            if isinstance(target, dict) and target.get("url"):
                normalized.append(
                    {
                        "url": target["url"],
                        "description": target.get("description", ""),
                        "secret": str(target.get("secret", default_secret) or ""),
                        "timeout": max(1, int(target.get("timeout", default_timeout))),
                        "failure_threshold": max(
                            1,
                            int(target.get("failure_threshold", default_threshold)),
                        ),
                        "open_seconds": max(5, int(target.get("open_seconds", default_open_seconds))),
                        "source": "settings",
                    }
                )
        return normalized

    return [
        {
            "url": webhook_url,
            "secret": default_secret,
            "timeout": default_timeout,
            "failure_threshold": default_threshold,
            "open_seconds": default_open_seconds,
            "source": "settings",
        }
        for webhook_url in list(getattr(settings, "SCHEDULING_WEBHOOK_URLS", []))
    ]


def _dispatch_webhooks_for_event(event: OutboxEvent):
    targets = _webhook_targets()
    if not targets:
        return

    request_body = json.dumps(
        {
            "event_type": event.event_type,
            "aggregate_type": event.aggregate_type,
            "aggregate_id": event.aggregate_id,
            "payload": event.payload,
            "created_at": event.created_at.isoformat(),
            "outbox_id": event.id,
        },
        default=str,
    ).encode("utf-8")

    for target in targets:
        webhook_url = target["url"]
        _record_webhook_metric(webhook_url, "attempted")

        is_open, remaining = _webhook_circuit_state(webhook_url)
        if is_open:
            _record_webhook_metric(webhook_url, "skipped_circuit")
            raise WebhookCircuitOpenError(webhook_url, remaining)

        req = urllib_request.Request(
            url=webhook_url,
            data=request_body,
            method="POST",
            headers=_build_webhook_headers(
                event=event,
                request_body=request_body,
                secret=target["secret"],
            ),
        )
        try:
            with urllib_request.urlopen(req, timeout=target["timeout"]) as response:
                status_code = int(getattr(response, "status", 200))
                if status_code >= 400:
                    raise RuntimeError(f"Webhook target {webhook_url} returned {status_code}.")
        except urllib_error.HTTPError as exc:
            opened_for = _mark_webhook_failure(
                webhook_url,
                failure_threshold=target.get("failure_threshold"),
                open_seconds=target.get("open_seconds"),
            )
            if opened_for:
                raise RuntimeError(
                    f"Webhook target {webhook_url} failed with HTTP {exc.code}; circuit opened for {opened_for}s."
                ) from exc
            raise RuntimeError(f"Webhook target {webhook_url} returned HTTP {exc.code}.") from exc
        except urllib_error.URLError as exc:
            opened_for = _mark_webhook_failure(
                webhook_url,
                failure_threshold=target.get("failure_threshold"),
                open_seconds=target.get("open_seconds"),
            )
            if opened_for:
                raise RuntimeError(
                    f"Webhook target {webhook_url} failed ({exc.reason}); circuit opened for {opened_for}s."
                ) from exc
            raise RuntimeError(f"Webhook target {webhook_url} failed: {exc.reason}.") from exc
        except Exception as exc:
            opened_for = _mark_webhook_failure(
                webhook_url,
                failure_threshold=target.get("failure_threshold"),
                open_seconds=target.get("open_seconds"),
            )
            if opened_for:
                raise RuntimeError(
                    f"Webhook target {webhook_url} failed ({exc}); circuit opened for {opened_for}s."
                ) from exc
            raise

        _mark_webhook_success(webhook_url)


def _compute_retry_delay_seconds(attempt_number: int):
    base = max(1, int(getattr(settings, "SCHEDULING_OUTBOX_RETRY_BASE_SECONDS", 30)))
    max_delay = max(base, int(getattr(settings, "SCHEDULING_OUTBOX_RETRY_MAX_SECONDS", 3600)))
    exponential = base * (2 ** max(0, attempt_number - 1))
    return min(max_delay, exponential)


def _mark_outbox_failure(
    event: OutboxEvent,
    error_message: str,
    max_attempts: int,
    *,
    retry_in_seconds: int | None = None,
    count_attempt: bool = True,
):
    now = timezone.now()
    attempt_number = event.attempts + (1 if count_attempt else 0)

    if count_attempt and attempt_number >= max_attempts:
        OutboxDeadLetter.objects.create(
            outbox_event=event,
            event_type=event.event_type,
            aggregate_type=event.aggregate_type,
            aggregate_id=event.aggregate_id,
            payload=event.payload,
            attempts=attempt_number,
            error_message=error_message,
            metadata={"last_status": event.status},
        )
        OutboxEvent.objects.filter(id=event.id).update(
            status=OutboxEvent.Status.DEAD_LETTER,
            attempts=attempt_number,
            last_error=error_message,
            next_attempt_at=now,
            updated_at=now,
        )
        return "dead_lettered"

    retry_delay = retry_in_seconds
    if retry_delay is None:
        retry_delay = _compute_retry_delay_seconds(max(1, event.attempts + 1))
    OutboxEvent.objects.filter(id=event.id).update(
        status=OutboxEvent.Status.FAILED,
        attempts=attempt_number,
        last_error=error_message,
        next_attempt_at=now + timedelta(seconds=retry_delay),
        updated_at=now,
    )
    return "failed"


def replay_dead_letter(*, dead_letter: OutboxDeadLetter, actor):
    replayed_event = OutboxEvent.objects.create(
        event_type=dead_letter.event_type,
        aggregate_type=dead_letter.aggregate_type,
        aggregate_id=dead_letter.aggregate_id,
        payload=dead_letter.payload,
        status=OutboxEvent.Status.PENDING,
        attempts=0,
        next_attempt_at=timezone.now(),
        last_error="",
    )

    metadata = dict(dead_letter.metadata or {})
    metadata["replay_count"] = int(metadata.get("replay_count", 0)) + 1
    metadata["last_replayed_at"] = timezone.now().isoformat()
    metadata["last_replayed_by"] = getattr(actor, "id", None)
    metadata["last_replayed_outbox_event_id"] = replayed_event.id
    dead_letter.metadata = metadata
    dead_letter.save(update_fields=["metadata", "updated_at"])

    _create_audit(
        actor=actor,
        action="outbox.dead_letter.replayed",
        target_type="OutboxDeadLetter",
        target_id=dead_letter.id,
        after={"new_outbox_event_id": replayed_event.id},
    )
    return replayed_event


def get_webhook_metrics_snapshot():
    snapshot = []
    for target in _webhook_targets():
        webhook_url = target["url"]
        circuit_open, circuit_remaining_seconds = _webhook_circuit_state(webhook_url)
        snapshot.append(
            {
                "url": webhook_url,
                "description": target.get("description", ""),
                "source": target.get("source", "settings"),
                "circuit_open": circuit_open,
                "circuit_remaining_seconds": circuit_remaining_seconds,
                "timeout_seconds": int(target.get("timeout", 5)),
                "failure_threshold": int(target.get("failure_threshold", 5)),
                "open_seconds": int(target.get("open_seconds", 120)),
                "metrics": {
                    "attempted": int(cache.get(_webhook_cache_key(webhook_url, "metric:attempted")) or 0),
                    "success": int(cache.get(_webhook_cache_key(webhook_url, "metric:success")) or 0),
                    "failed": int(cache.get(_webhook_cache_key(webhook_url, "metric:failed")) or 0),
                    "skipped_circuit": int(cache.get(_webhook_cache_key(webhook_url, "metric:skipped_circuit")) or 0),
                },
            }
        )
    return snapshot


def get_constraint_monitor_status():
    vendor = connection.vendor
    constraint_present = None
    if vendor == "postgresql":
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'scheduling_booking_no_overlap_active'
                )
                """
            )
            row = cursor.fetchone()
            constraint_present = bool(row[0]) if row else False

    last_24h = timezone.now() - timedelta(hours=24)
    by_source = (
        BookingConflictIncident.objects.filter(created_at__gte=last_24h)
        .values("conflict_source")
        .annotate(count=Count("id"))
    )
    by_operation = (
        BookingConflictIncident.objects.filter(created_at__gte=last_24h)
        .values("operation")
        .annotate(count=Count("id"))
    )

    return {
        "database_vendor": vendor,
        "constraint_present": constraint_present,
        "last_24h_conflicts_total": BookingConflictIncident.objects.filter(created_at__gte=last_24h).count(),
        "last_24h_by_source": {row["conflict_source"]: row["count"] for row in by_source},
        "last_24h_by_operation": {row["operation"]: row["count"] for row in by_operation},
    }


def get_scheduling_ops_summary():
    outbox_counts = (
        OutboxEvent.objects.values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )
    return {
        "outbox_counts": {row["status"]: row["count"] for row in outbox_counts},
        "dead_letter_count": OutboxDeadLetter.objects.count(),
        "webhooks": get_webhook_metrics_snapshot(),
        "constraints": get_constraint_monitor_status(),
        "recent_conflict_incidents": list(
            BookingConflictIncident.objects.order_by("-created_at").values(
                "id",
                "operation",
                "conflict_source",
                "resource_id",
                "event_id",
                "organizer_id",
                "requested_start_at",
                "requested_end_at",
                "message",
                "created_at",
            )[:20]
        ),
    }


def dispatch_outbox_events(
    limit: int = 100,
    *,
    consume_notifications: bool = True,
    consume_webhooks: bool = True,
):
    if not consume_notifications and not consume_webhooks:
        return {"processed": 0, "failed": 0, "dead_lettered": 0}

    now = timezone.now()
    max_attempts = max(1, int(getattr(settings, "SCHEDULING_OUTBOX_MAX_ATTEMPTS", 5)))

    event_ids = list(
        OutboxEvent.objects.filter(
            status__in=[OutboxEvent.Status.PENDING, OutboxEvent.Status.FAILED],
            next_attempt_at__lte=now,
        )
        .order_by("created_at")
        .values_list("id", flat=True)[:limit]
    )

    processed = 0
    failed = 0
    dead_lettered = 0

    for event_id in event_ids:
        # Claim event for processing (prevents duplicate processing by concurrent workers).
        claimed = OutboxEvent.objects.filter(
            id=event_id,
            status__in=[OutboxEvent.Status.PENDING, OutboxEvent.Status.FAILED],
            next_attempt_at__lte=timezone.now(),
        ).update(status=OutboxEvent.Status.PROCESSING, updated_at=timezone.now())
        if not claimed:
            continue

        event = OutboxEvent.objects.get(id=event_id)
        try:
            if consume_notifications:
                _dispatch_notification_for_event(event)
            if consume_webhooks:
                _dispatch_webhooks_for_event(event)
        except WebhookCircuitOpenError as exc:
            _mark_outbox_failure(
                event,
                str(exc),
                max_attempts=max_attempts,
                retry_in_seconds=exc.retry_in_seconds,
                count_attempt=False,
            )
            failed += 1
            continue
        except Exception as exc:
            outcome = _mark_outbox_failure(event, str(exc), max_attempts=max_attempts)
            if outcome == "dead_lettered":
                dead_lettered += 1
            else:
                failed += 1
            continue

        OutboxEvent.objects.filter(id=event.id).update(
            status=OutboxEvent.Status.SENT,
            attempts=event.attempts + 1,
            last_error="",
            updated_at=timezone.now(),
        )
        processed += 1

    return {"processed": processed, "failed": failed, "dead_lettered": dead_lettered}
