from __future__ import annotations

from datetime import timedelta

from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event

from .exceptions import ConflictError, IdempotencyConflictError, PolicyViolationError, TransitionError
from .models import (
    AvailabilityException,
    AvailabilityRule,
    AvailabilitySlot,
    BookingConflictIncident,
    Booking,
    BookingRequest,
    CheckoutSession,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    Review,
    WebhookTarget,
)
from .permissions import IsSchedulingAdmin, can_manage_event, can_manage_resource, is_admin
from .serializers import (
    AvailabilityExceptionSerializer,
    AvailabilityRuleSerializer,
    AvailabilitySearchQuerySerializer,
    AvailabilitySlotSerializer,
    BookingConflictIncidentSerializer,
    BookingRequestSerializer,
    BookingSerializer,
    CalendarQuerySerializer,
    CancelBookingSerializer,
    CheckoutSessionSerializer,
    CompleteMockDepositSerializer,
    CounterProposalSerializer,
    CreateBookingSerializer,
    CreateRequestSerializer,
    EnrichedAvailabilitySearchQuerySerializer,
    MarketplaceResourceSerializer,
    OutboxDeadLetterSerializer,
    OutboxEventSerializer,
    RefreshCheckoutSerializer,
    ReleaseCheckoutSerializer,
    RequestReviewSerializer,
    ResourcePolicySerializer,
    RescheduleBookingSerializer,
    ReviewSerializer,
    StartCheckoutSerializer,
    WebhookTargetSerializer,
)
from .services import (
    accept_counter,
    approve_request,
    build_calendar_view,
    cancel_booking,
    complete_booking,
    complete_checkout_mock_deposit,
    counter_propose,
    create_booking,
    create_request,
    decline_request,
    get_scheduling_ops_summary,
    nudge_organizer_checkout,
    refresh_checkout_session,
    reject_counter,
    release_checkout_session,
    replay_dead_letter,
    reschedule_booking,
    search_availability,
    search_availability_enriched,
    start_checkout_session,
    withdraw_request,
)


class BaseSchedulingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _error_response(exc: Exception):
        if isinstance(exc, ConflictError):
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        if isinstance(exc, IdempotencyConflictError):
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        if isinstance(exc, TransitionError):
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, PolicyViolationError):
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Unexpected scheduling error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarketplaceResourceViewSet(viewsets.ModelViewSet):
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MarketplaceResource.objects.all().select_related("owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            pass  # admins see all; apply optional filters below
        elif self.action in {"list", "retrieve"}:
            qs = qs.filter(is_active=True)
        else:
            qs = qs.filter(owner=self.request.user)

        owner_id = self.request.query_params.get("owner_id")
        if owner_id:
            qs = qs.filter(owner_id=owner_id)

        resource_type = self.request.query_params.get("resource_type")
        if resource_type:
            qs = qs.filter(resource_type=resource_type)

        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        resource = self.get_object()
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to edit this resource.")
        serializer.save()


class ResourcePolicyViewSet(viewsets.ModelViewSet):
    serializer_class = ResourcePolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ResourcePolicy.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage this resource policy.")
        serializer.save()

    def perform_update(self, serializer):
        policy = self.get_object()
        if not can_manage_resource(self.request.user, policy.resource):
            raise PermissionDenied("You do not have permission to update this policy.")
        serializer.save(version=policy.version + 1)


class AvailabilityRuleViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilityRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilityRule.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage availability for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        rule = self.get_object()
        if not can_manage_resource(self.request.user, rule.resource):
            raise PermissionDenied("You do not have permission to update this rule.")
        serializer.save(version=rule.version + 1)


class AvailabilityExceptionViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilityExceptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilityException.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage exceptions for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        exception = self.get_object()
        if not can_manage_resource(self.request.user, exception.resource):
            raise PermissionDenied("You do not have permission to update this exception.")
        serializer.save()


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilitySlot.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to create slots for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        slot = self.get_object()
        if not can_manage_resource(self.request.user, slot.resource):
            raise PermissionDenied("You do not have permission to update this slot.")
        serializer.save(version=slot.version + 1)


class BookingRequestViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = BookingRequest.objects.all().select_related(
        "resource",
        "resource__owner",
        "resource__artist",
        "resource__vendor",
        "resource__venue",
        "event",
        "event__location",
        "event_draft",
        "organizer",
        "checkout_session",
    )

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            qs = self.queryset
        else:
            qs = self.queryset.filter(
                models.Q(organizer=user) | models.Q(resource__owner=user)
            )

        status_filter = self.request.query_params.get("status")
        event_id = self.request.query_params.get("event")
        event_draft_id = self.request.query_params.get("event_draft_id") or self.request.query_params.get("event_draft")
        resource_id = self.request.query_params.get("resource")
        role = self.request.query_params.get("role")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_id:
            qs = qs.filter(event_id=event_id)
        if event_draft_id:
            qs = qs.filter(event_draft_id=event_draft_id)
        if resource_id:
            qs = qs.filter(resource_id=resource_id)
        if role == "organizer":
            qs = qs.filter(organizer=user)
        elif role == "provider":
            qs = qs.filter(resource__owner=user)
        return qs.order_by("-created_at")


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all().select_related("resource", "resource__owner", "event", "organizer")

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            qs = self.queryset
        else:
            qs = self.queryset.filter(
                models.Q(organizer=user) | models.Q(resource__owner=user)
            )

        status_filter = self.request.query_params.get("status")
        event_id = self.request.query_params.get("event")
        resource_id = self.request.query_params.get("resource")
        role = self.request.query_params.get("role")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_id:
            qs = qs.filter(event_id=event_id)
        if resource_id:
            qs = qs.filter(resource_id=resource_id)
        if role == "organizer":
            qs = qs.filter(organizer=user)
        elif role == "provider":
            qs = qs.filter(resource__owner=user)
        return qs.order_by("-created_at")


class WebhookTargetViewSet(viewsets.ModelViewSet):
    serializer_class = WebhookTargetSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = WebhookTarget.objects.all().select_related("created_by", "updated_by")

    def get_queryset(self):
        qs = self.queryset.order_by("id")
        active = self.request.query_params.get("active")
        if active in {"1", "true"}:
            qs = qs.filter(is_active=True)
        if active in {"0", "false"}:
            qs = qs.filter(is_active=False)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class OutboxEventOpsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OutboxEventSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = OutboxEvent.objects.all().order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        status_filter = self.request.query_params.get("status")
        event_type = self.request.query_params.get("event_type")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs


class OutboxDeadLetterViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OutboxDeadLetterSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = OutboxDeadLetter.objects.all().select_related("outbox_event").order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        event_type = self.request.query_params.get("event_type")
        aggregate_type = self.request.query_params.get("aggregate_type")
        if event_type:
            qs = qs.filter(event_type=event_type)
        if aggregate_type:
            qs = qs.filter(aggregate_type=aggregate_type)
        return qs

    @action(detail=True, methods=["post"], url_path="replay")
    def replay(self, request, pk=None):
        dead_letter = self.get_object()
        replayed_event = replay_dead_letter(dead_letter=dead_letter, actor=request.user)
        return Response(
            {
                "dead_letter_id": dead_letter.id,
                "replayed_outbox_event_id": replayed_event.id,
            },
            status=status.HTTP_201_CREATED,
        )


class BookingConflictIncidentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingConflictIncidentSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = BookingConflictIncident.objects.all().order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        operation = self.request.query_params.get("operation")
        conflict_source = self.request.query_params.get("conflict_source")
        if operation:
            qs = qs.filter(operation=operation)
        if conflict_source:
            qs = qs.filter(conflict_source=conflict_source)
        return qs


class SchedulingOpsSummaryAPIView(BaseSchedulingAPIView):
    permission_classes = [IsSchedulingAdmin]

    def get(self, request):
        return Response(get_scheduling_ops_summary())


class AvailabilitySearchAPIView(BaseSchedulingAPIView):
    def get(self, request):
        serializer = AvailabilitySearchQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        data = search_availability(
            start_at=payload["start_at"],
            end_at=payload["end_at"],
            resource_type=payload.get("resource_type"),
            city=payload.get("city"),
            attendee_count=payload.get("attendee_count", 1),
            limit=payload.get("limit", 25),
            offset=payload.get("offset", 0),
        )
        return Response({"results": data})


class CreateBookingAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        event = get_object_or_404(Event, id=payload["event_id"])
        if not can_manage_event(request.user, event):
            raise PermissionDenied("You do not have permission to book against this event.")

        resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"], is_active=True)
        policy, _ = ResourcePolicy.objects.get_or_create(resource=resource)

        if policy.booking_mode == ResourcePolicy.BookingMode.APPROVAL_REQUIRED:
            return Response(
                {"detail": "This resource requires request approval. Use /requests instead."},
                status=status.HTTP_409_CONFLICT,
            )

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            booking, created = create_booking(
                organizer=request.user,
                event=event,
                resource=resource,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                attendee_count=payload["attendee_count"],
                source=Booking.Source.INSTANT,
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = BookingSerializer(booking).data
        return Response(output, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CreateRequestAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = CreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        event = None
        event_draft = None

        if payload.get("event_id"):
            from events.models import Event as EventModel
            event = get_object_or_404(EventModel, id=payload["event_id"])
            if not can_manage_event(request.user, event):
                raise PermissionDenied("You do not have permission to create a request for this event.")
        elif payload.get("event_draft_id"):
            from events.models import EventDraft
            event_draft = get_object_or_404(EventDraft, id=payload["event_draft_id"])
            if event_draft.organizer_id != request.user.id:
                raise PermissionDenied("You do not have permission to create a request for this event draft.")
        else:
            return Response(
                {"detail": "Either event_id or event_draft_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"], is_active=True)
        idempotency_key = request.headers.get("Idempotency-Key")

        try:
            booking_request, created = create_request(
                organizer=request.user,
                event=event,
                event_draft=event_draft,
                resource=resource,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                attendee_count=payload["attendee_count"],
                message=payload.get("message", ""),
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = BookingRequestSerializer(booking_request).data
        return Response(output, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CheckoutSessionDetailAPIView(BaseSchedulingAPIView):
    """GET /checkout-sessions/<id>/ — retrieve a session the caller owns or is a participant of."""

    def get(self, request, checkout_session_id: int):
        session = get_object_or_404(CheckoutSession, id=checkout_session_id)
        if session.organizer_id != request.user.id and not is_admin(request.user):
            raise PermissionDenied("You do not have permission to view this checkout session.")
        output = CheckoutSessionSerializer(
            CheckoutSession.objects.prefetch_related("booking_requests__resource").get(id=session.id)
        ).data
        return Response(output)


class CheckoutSessionListAPIView(BaseSchedulingAPIView):
    """GET /checkout-sessions/?event_draft_id=<id> — list sessions for a draft."""

    def get(self, request):
        event_draft_id = request.query_params.get("event_draft_id")
        if not event_draft_id:
            return Response({"detail": "event_draft_id query param is required."}, status=status.HTTP_400_BAD_REQUEST)

        from events.models import EventDraft

        event_draft = get_object_or_404(EventDraft, id=event_draft_id)
        if event_draft.organizer_id != request.user.id and not is_admin(request.user):
            raise PermissionDenied("You do not have permission to view sessions for this draft.")

        sessions = (
            CheckoutSession.objects.prefetch_related("booking_requests__resource")
            .filter(event_draft=event_draft)
            .order_by("-created_at")
        )
        return Response(CheckoutSessionSerializer(sessions, many=True).data)


class StartCheckoutAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = StartCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        from events.models import EventDraft

        event_draft = get_object_or_404(EventDraft, id=payload["event_draft_id"])
        if event_draft.organizer_id != request.user.id:
            raise PermissionDenied("You do not have permission to start checkout for this draft.")

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            checkout_session, created = start_checkout_session(
                organizer=request.user,
                event_draft=event_draft,
                request_ids=payload["request_ids"],
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = CheckoutSessionSerializer(
            CheckoutSession.objects.prefetch_related("booking_requests__resource").get(id=checkout_session.id)
        ).data
        return Response(output, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class RefreshCheckoutAPIView(BaseSchedulingAPIView):
    def post(self, request, checkout_session_id: int):
        serializer = RefreshCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        checkout_session = get_object_or_404(CheckoutSession, id=checkout_session_id)
        if checkout_session.organizer_id != request.user.id:
            raise PermissionDenied("You do not have permission to refresh this checkout session.")

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            refreshed = refresh_checkout_session(
                organizer=request.user,
                checkout_session=checkout_session,
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = CheckoutSessionSerializer(
            CheckoutSession.objects.prefetch_related("booking_requests__resource").get(id=refreshed.id)
        ).data
        return Response(output)


class CompleteMockDepositAPIView(BaseSchedulingAPIView):
    def post(self, request, checkout_session_id: int):
        serializer = CompleteMockDepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        checkout_session = get_object_or_404(CheckoutSession, id=checkout_session_id)
        if checkout_session.organizer_id != request.user.id:
            raise PermissionDenied("You do not have permission to pay for this checkout session.")

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated = complete_checkout_mock_deposit(
                organizer=request.user,
                checkout_session=checkout_session,
                card_brand=serializer.validated_data["card_brand"],
                card_last4=serializer.validated_data["card_last4"],
                card_expiry_month=serializer.validated_data["card_expiry_month"],
                card_expiry_year=serializer.validated_data["card_expiry_year"],
                mock_payment_reference=serializer.validated_data.get("mock_payment_reference"),
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = CheckoutSessionSerializer(
            CheckoutSession.objects.prefetch_related("booking_requests__resource").get(id=updated.id)
        ).data
        return Response(output)


class ReleaseCheckoutAPIView(BaseSchedulingAPIView):
    def post(self, request, checkout_session_id: int):
        serializer = ReleaseCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        checkout_session = get_object_or_404(CheckoutSession, id=checkout_session_id)
        if checkout_session.organizer_id != request.user.id:
            raise PermissionDenied("You do not have permission to release this checkout session.")

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated = release_checkout_session(
                actor=request.user,
                checkout_session=checkout_session,
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = CheckoutSessionSerializer(
            CheckoutSession.objects.prefetch_related("booking_requests__resource").get(id=updated.id)
        ).data
        return Response(output)


class ApproveRequestAPIView(BaseSchedulingAPIView):
    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest.objects.select_related("resource"), id=request_id)
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("You do not have permission to approve this request.")

        serializer = RequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated_request, booking = approve_request(
                reviewer=request.user,
                booking_request=booking_request,
                provider_message=serializer.validated_data["provider_message"],
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(
            {
                "request": BookingRequestSerializer(updated_request).data,
                "booking": BookingSerializer(booking).data if booking else None,
            }
        )


class DeclineRequestAPIView(BaseSchedulingAPIView):
    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest.objects.select_related("resource"), id=request_id)
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("You do not have permission to decline this request.")

        serializer = RequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated_request = decline_request(
                reviewer=request.user,
                booking_request=booking_request,
                provider_message=serializer.validated_data["provider_message"],
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingRequestSerializer(updated_request).data)


class CancelBookingAPIView(BaseSchedulingAPIView):
    def post(self, request, booking_id: int):
        booking = get_object_or_404(Booking.objects.select_related("resource", "organizer"), id=booking_id)

        can_cancel = (
            booking.organizer_id == request.user.id
            or can_manage_resource(request.user, booking.resource)
            or is_admin(request.user)
        )
        if not can_cancel:
            raise PermissionDenied("You do not have permission to cancel this booking.")

        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not is_admin(request.user):
            policy, _ = ResourcePolicy.objects.get_or_create(resource=booking.resource)
            if booking.start_at - timezone.now() < timedelta(hours=policy.cancellation_window_hours):
                return Response(
                    {"detail": "Cancellation window has passed for this booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated_booking = cancel_booking(
                actor=request.user,
                booking=booking,
                reason=serializer.validated_data["reason"],
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingSerializer(updated_booking).data)


class RescheduleBookingAPIView(BaseSchedulingAPIView):
    def post(self, request, booking_id: int):
        booking = get_object_or_404(Booking.objects.select_related("resource", "organizer"), id=booking_id)

        can_reschedule = (
            booking.organizer_id == request.user.id
            or can_manage_resource(request.user, booking.resource)
            or is_admin(request.user)
        )
        if not can_reschedule:
            raise PermissionDenied("You do not have permission to reschedule this booking.")

        policy, _ = ResourcePolicy.objects.get_or_create(resource=booking.resource)
        if not policy.allow_reschedule and not is_admin(request.user):
            return Response({"detail": "Provider policy does not allow reschedule."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RescheduleBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_booking = reschedule_booking(
                actor=request.user,
                booking=booking,
                new_start_at=serializer.validated_data["new_start_at"],
                new_end_at=serializer.validated_data["new_end_at"],
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingSerializer(updated_booking).data)


class CounterProposalAPIView(BaseSchedulingAPIView):
    """Provider submits a counter-proposal (revised time/rate) on a PENDING request."""

    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest.objects.select_related("resource"), id=request_id)
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("You do not have permission to counter-propose on this request.")

        serializer = CounterProposalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated_request = counter_propose(
                reviewer=request.user,
                booking_request=booking_request,
                counter_start_at=serializer.validated_data["counter_start_at"],
                counter_end_at=serializer.validated_data["counter_end_at"],
                counter_rate=serializer.validated_data.get("counter_rate"),
                counter_message=serializer.validated_data.get("counter_message", ""),
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingRequestSerializer(updated_request).data)


class AcceptCounterAPIView(BaseSchedulingAPIView):
    """Organizer accepts a counter-proposal; creates a confirmed Booking using counter times."""

    def post(self, request, request_id: int):
        booking_request = get_object_or_404(
            BookingRequest.objects.select_related("resource", "organizer"), id=request_id
        )
        if booking_request.organizer_id != request.user.id:
            raise PermissionDenied("Only the organizer who made this request can accept a counter.")

        try:
            updated_request, booking = accept_counter(
                organizer=request.user,
                booking_request=booking_request,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(
            {
                "request": BookingRequestSerializer(updated_request).data,
                "booking": BookingSerializer(booking).data if booking else None,
            }
        )


class RejectCounterAPIView(BaseSchedulingAPIView):
    """Organizer rejects a counter-proposal; transitions the request to DECLINED."""

    def post(self, request, request_id: int):
        booking_request = get_object_or_404(
            BookingRequest.objects.select_related("resource", "organizer"), id=request_id
        )
        if booking_request.organizer_id != request.user.id:
            raise PermissionDenied("Only the organizer who made this request can reject a counter.")

        message = request.data.get("message", "")
        try:
            updated_request = reject_counter(
                organizer=request.user,
                booking_request=booking_request,
                message=message,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingRequestSerializer(updated_request).data)


class AvailabilitySearchEnrichedAPIView(BaseSchedulingAPIView):
    """
    Enriched availability search that returns provider profile data
    (rating, image, price, bio, distance) sorted by distance → rating → price.
    """

    def get(self, request):
        serializer = EnrichedAvailabilitySearchQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        data = search_availability_enriched(
            start_at=payload["start_at"],
            end_at=payload["end_at"],
            resource_type=payload.get("resource_type"),
            city=payload.get("city"),
            attendee_count=payload.get("attendee_count", 1),
            lat=payload.get("lat"),
            lng=payload.get("lng"),
            min_rating=payload.get("min_rating"),
            max_price=payload.get("max_price"),
            name=payload.get("name"),
            limit=payload.get("limit", 20),
            offset=payload.get("offset", 0),
        )
        return Response({"results": data, "count": len(data)})


class CalendarViewAPIView(BaseSchedulingAPIView):
    def get(self, request):
        serializer = CalendarQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        scope = payload["scope"]
        if scope == "admin" and not is_admin(request.user):
            raise PermissionDenied("Only admins can use admin scope.")

        if scope == "resource" and payload.get("resource_id"):
            resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"])
            if not can_manage_resource(request.user, resource) and not is_admin(request.user):
                raise PermissionDenied("You do not have permission to read this resource calendar.")

        try:
            events = build_calendar_view(
                user=request.user,
                scope=scope,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                event_id=payload.get("event_id"),
                resource_id=payload.get("resource_id"),
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response({"results": events})


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Two-way reviews: organizers review providers, providers review organizers.
    POST /reviews/ with { booking, rating, comment, reviewer_type }
    GET  /reviews/?resource=<id>  — reviews of a resource (for public profile)
    GET  /reviews/?resource_owner_id=<id>  — all reviews for a provider's resources
    GET  /reviews/?booking=<id>  — reviews for a specific booking (both sides)
    GET  /reviews/?reviewee_id=<id>  — reviews written about a user (organizer profile)
    """

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all().select_related("reviewer", "reviewee", "resource", "booking")

    def get_queryset(self):
        qs = self.queryset
        resource_id = self.request.query_params.get("resource")
        booking_id = self.request.query_params.get("booking")
        resource_owner_id = self.request.query_params.get("resource_owner_id")
        reviewee_id = self.request.query_params.get("reviewee_id")
        reviewer_type = self.request.query_params.get("reviewer_type")
        if resource_id:
            qs = qs.filter(resource_id=resource_id)
        if booking_id:
            qs = qs.filter(booking_id=booking_id)
        if resource_owner_id:
            qs = qs.filter(resource__owner_id=resource_owner_id)
        if reviewee_id:
            qs = qs.filter(reviewee_id=reviewee_id)
        if reviewer_type:
            qs = qs.filter(reviewer_type=reviewer_type)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError

        booking_id = self.request.data.get("booking")
        booking = get_object_or_404(
            Booking.objects.select_related("resource", "resource__owner", "organizer"),
            id=booking_id,
        )
        user = self.request.user

        if booking.status != Booking.Status.COMPLETED:
            raise PermissionDenied("Reviews can only be submitted for completed bookings.")

        is_organizer = booking.organizer_id == user.id
        is_provider = booking.resource and booking.resource.owner_id == user.id

        if not is_organizer and not is_provider:
            raise PermissionDenied("Only the organizer or the resource provider can leave a review.")

        reviewer_type = Review.ReviewerType.ORGANIZER if is_organizer else Review.ReviewerType.PROVIDER

        if Review.objects.filter(booking=booking, reviewer_type=reviewer_type).exists():
            raise ValidationError(f"You have already submitted a review for this booking.")

        if is_organizer:
            reviewee = booking.resource.owner if booking.resource else None
            resource = booking.resource
        else:
            reviewee = booking.organizer
            resource = None  # provider-to-organizer reviews don't belong to a resource

        serializer.save(
            reviewer=user,
            reviewee=reviewee,
            reviewer_type=reviewer_type,
            resource=resource,
        )


class CompleteBookingAPIView(BaseSchedulingAPIView):
    """Provider marks a confirmed/in-progress booking as COMPLETED."""

    def post(self, request, booking_id: int):
        booking = get_object_or_404(Booking.objects.select_related("resource", "organizer"), id=booking_id)
        if not can_manage_resource(request.user, booking.resource):
            raise PermissionDenied("Only the resource provider can mark a booking as complete.")

        try:
            updated_booking = complete_booking(actor=request.user, booking=booking)
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingSerializer(updated_booking).data)


class WithdrawRequestAPIView(BaseSchedulingAPIView):
    """Organizer withdraws a pending or counter-proposed booking request."""

    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest, id=request_id)
        if booking_request.organizer_id != request.user.id:
            raise PermissionDenied("Only the organizer can withdraw a request.")

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            updated_request = withdraw_request(
                organizer=request.user,
                booking_request=booking_request,
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingRequestSerializer(updated_request).data)


class NudgeRequestAPIView(BaseSchedulingAPIView):
    """Provider nudges the organizer to complete checkout for an accepted draft request."""

    def post(self, request, request_id: int):
        booking_request = get_object_or_404(
            BookingRequest.objects.select_related("resource", "resource__owner"),
            id=request_id,
        )
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("Only the resource provider can send a checkout nudge.")

        try:
            nudge_organizer_checkout(provider=request.user, booking_request=booking_request)
        except Exception as exc:
            return self._error_response(exc)

        return Response({"detail": "Nudge sent to organizer."}, status=status.HTTP_200_OK)
