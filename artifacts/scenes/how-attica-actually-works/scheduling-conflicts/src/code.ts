// Verbatim excerpts from Attica. Nothing paraphrased or tidied.

export interface Snippet {
  id: string
  file: string
  firstLine: number
  lang: 'python' | 'sql'
  text: string
}

export const SNIPPETS: Record<string, Snippet> = {
  overlapQ: {
    id: 'overlapQ',
    file: 'backend/main/scheduling/services.py',
    firstLine: 332,
    lang: 'python',
    text: `def _overlap_q(start_at: datetime, end_at: datetime):
    return Q(start_at__lt=end_at) & Q(end_at__gt=start_at)


def _active_booking_qs(resource: MarketplaceResource):
    return Booking.objects.filter(resource=resource, status__in=Booking.ACTIVE_STATES)


def _find_booking_conflict(resource: MarketplaceResource, start_at: datetime, end_at: datetime, exclude_booking_id: int | None = None):
    qs = _active_booking_qs(resource).filter(_overlap_q(start_at, end_at))
    if exclude_booking_id:
        qs = qs.exclude(id=exclude_booking_id)
    return qs.order_by("start_at").first()`,
  },

  locks: {
    id: 'locks',
    file: 'backend/main/scheduling/services.py',
    firstLine: 347,
    lang: 'python',
    text: `def _lock_overlapping_slots(resource: MarketplaceResource, start_at: datetime, end_at: datetime):
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
        AvailabilitySlot.objects.filter(id__in=slot_ids).update(capacity_reserved=F("capacity_reserved") + attendee_count)`,
  },

  createBooking: {
    id: 'createBooking',
    file: 'backend/main/scheduling/services.py',
    firstLine: 575,
    lang: 'python',
    text: `    with transaction.atomic():
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
                        ...
                    )
                    raise
                _reserve_capacity(slots, attendee_count)
        else:
            # No availability slots defined — treat the resource as single-capacity:
            # any active booking in the window is a hard conflict.
            conflict = _find_booking_conflict(resource, start_at, end_at)`,
  },

  dbCatch: {
    id: 'dbCatch',
    file: 'backend/main/scheduling/services.py',
    firstLine: 640,
    lang: 'python',
    text: `        try:
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
            raise ConflictError("Resource has a conflicting booking for this time window.") from exc`,
  },

  constraints: {
    id: 'constraints',
    file: 'backend/main/scheduling/models.py',
    firstLine: 226,
    lang: 'python',
    text: `    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["resource", "start_at", "end_at"],
                name="uniq_resource_slot_window",
            ),
            models.CheckConstraint(
                check=Q(capacity_reserved__lte=F("capacity_total")),
                name="capacity_reserved_lte_total",
            ),
        ]`,
  },

  exclusion: {
    id: 'exclusion',
    file: 'backend/main/scheduling/migrations/0003_postgres_booking_overlap_constraint.py',
    firstLine: 7,
    lang: 'python',
    text: `def add_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
        cursor.execute(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = '{CONSTRAINT_NAME}'
                ) THEN
                    ALTER TABLE scheduling_booking
                    ADD CONSTRAINT {CONSTRAINT_NAME}
                    EXCLUDE USING gist (
                        resource_id WITH =,
                        tstzrange(start_at, end_at, '[)') WITH &&
                    )
                    WHERE (
                        status IN ('hold', 'confirmed', 'in_progress', 'reschedule_pending', 'disputed')
                    );
                END IF;
            END
            $$;
            """
        )`,
  },

  monitor: {
    id: 'monitor',
    file: 'backend/main/scheduling/services.py',
    firstLine: 3262,
    lang: 'python',
    text: `def get_constraint_monitor_status():
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
            constraint_present = bool(row[0]) if row else False`,
  },

  materialize: {
    id: 'materialize',
    file: 'backend/main/scheduling/services.py',
    firstLine: 2511,
    lang: 'python',
    text: `    for rule in rules:
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

            target_capacity = max(slot.capacity_reserved, desired_capacity)`,
  },

  dst: {
    id: 'dst',
    file: 'backend/main/scheduling/services.py',
    firstLine: 2364,
    lang: 'python',
    text: `def _rule_slot_to_utc(rule: AvailabilityRule, slot_date: date):
    tz = ZoneInfo(rule.timezone or "UTC")
    local_start = datetime.combine(slot_date, rule.local_start_time)
    local_end = datetime.combine(slot_date, rule.local_end_time)

    # DST policy:
    # - ambiguous local times pick fold=0 (earlier occurrence),
    # - nonexistent local times are skipped entirely.
    aware_start = _resolve_local_datetime(local_start, tz, prefer_fold=0)
    aware_end = _resolve_local_datetime(local_end, tz, prefer_fold=0)
    if not aware_start or not aware_end:
        return None`,
  },

  exceptions: {
    id: 'exceptions',
    file: 'backend/main/scheduling/services.py',
    firstLine: 2384,
    lang: 'python',
    text: `def _apply_exceptions(resource: MarketplaceResource, start_at: datetime, end_at: datetime):
    exceptions = AvailabilityException.objects.filter(resource=resource).filter(_overlap_q(start_at, end_at))
    for exception in exceptions:
        if exception.exception_type == AvailabilityException.ExceptionType.BLACKOUT:
            return False
    return True`,
  },

  idem: {
    id: 'idem',
    file: 'backend/main/scheduling/services.py',
    firstLine: 114,
    lang: 'python',
    text: `def _get_or_assert_idempotency(*, owner, endpoint: str, key: str | None, payload: dict):
    if not key:
        return None

    digest = _request_hash(payload)
    existing = IdempotencyRecord.objects.filter(owner=owner, endpoint=endpoint, key=key).first()
    if not existing:
        return None

    if existing.request_hash != digest:
        raise IdempotencyConflictError("Idempotency key reused with a different payload.")

    return existing`,
  },

  idemSave: {
    id: 'idemSave',
    file: 'backend/main/scheduling/services.py',
    firstLine: 688,
    lang: 'python',
    text: `            )

    _save_idempotency(
        owner=organizer,
        endpoint="scheduling.booking.create",
        key=idempotency_key,
        payload=payload,
        response_status=201,
        response_body={"booking_id": booking.id},
    )

    return booking, True`,
  },

  expireHolds: {
    id: 'expireHolds',
    file: 'backend/main/scheduling/services.py',
    firstLine: 1744,
    lang: 'python',
    text: `def expire_checkout_sessions(limit: int = 500):
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
    return expired`,
  },

  pay: {
    id: 'pay',
    file: 'backend/main/scheduling/services.py',
    firstLine: 1549,
    lang: 'python',
    text: `        if locked_session.status != CheckoutSession.Status.ACTIVE:
            raise TransitionError("Only active checkout sessions can accept a mock deposit.")
        if locked_session.hold_expires_at <= now:
            raise TransitionError("This checkout session has already expired.")

        locked_session.paid_at = locked_session.paid_at or now`,
  },

  release: {
    id: 'release',
    file: 'backend/main/scheduling/services.py',
    firstLine: 1656,
    lang: 'python',
    text: `        locked_session = CheckoutSession.objects.select_for_update().get(id=checkout_session.id)
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
            )`,
  },

  activeStates: {
    id: 'activeStates',
    file: 'backend/main/scheduling/models.py',
    firstLine: 412,
    lang: 'python',
    text: `    ACTIVE_STATES = (
        Status.HOLD,
        Status.CONFIRMED,
        Status.IN_PROGRESS,
        Status.RESCHEDULE_PENDING,
        Status.DISPUTED,
    )`,
  },
}
