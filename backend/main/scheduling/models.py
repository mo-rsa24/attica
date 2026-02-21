from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.utils import timezone

from common.models import TimeStampedModel


class MarketplaceResource(TimeStampedModel):
    class ResourceType(models.TextChoices):
        VENUE = "venue", "Venue"
        ARTIST = "artist", "Artist"
        VENDOR = "vendor", "Vendor"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="marketplace_resources",
    )
    resource_type = models.CharField(max_length=16, choices=ResourceType.choices)
    display_name = models.CharField(max_length=255)
    timezone = models.CharField(max_length=64, default="UTC")
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    venue = models.OneToOneField(
        "locations.Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marketplace_resource",
    )
    artist = models.OneToOneField(
        "artists.Artist",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marketplace_resource",
    )
    vendor = models.OneToOneField(
        "vendors.Vendor",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="marketplace_resource",
    )

    class Meta:
        indexes = [
            models.Index(fields=["resource_type", "is_active"]),
            models.Index(fields=["owner", "is_active"]),
        ]

    def clean(self):
        linked_entities = [self.venue_id, self.artist_id, self.vendor_id]
        linked_count = sum(1 for value in linked_entities if value)
        if linked_count > 1:
            raise ValidationError("A resource can only reference one linked entity.")

        if self.venue_id and self.resource_type != self.ResourceType.VENUE:
            raise ValidationError("Venue link requires resource_type='venue'.")
        if self.artist_id and self.resource_type != self.ResourceType.ARTIST:
            raise ValidationError("Artist link requires resource_type='artist'.")
        if self.vendor_id and self.resource_type != self.ResourceType.VENDOR:
            raise ValidationError("Vendor link requires resource_type='vendor'.")

    def __str__(self):
        return f"{self.display_name} ({self.resource_type})"


class ResourcePolicy(TimeStampedModel):
    class BookingMode(models.TextChoices):
        INSTANT = "instant", "Instant"
        APPROVAL_REQUIRED = "approval_required", "Approval Required"
        HYBRID = "hybrid", "Hybrid"

    resource = models.OneToOneField(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="policy",
    )
    booking_mode = models.CharField(
        max_length=32,
        choices=BookingMode.choices,
        default=BookingMode.APPROVAL_REQUIRED,
    )
    min_notice_hours = models.PositiveIntegerField(default=24)
    max_horizon_days = models.PositiveIntegerField(default=365)
    buffer_before_minutes = models.PositiveIntegerField(default=0)
    buffer_after_minutes = models.PositiveIntegerField(default=0)
    cancellation_window_hours = models.PositiveIntegerField(default=24)
    default_capacity = models.PositiveIntegerField(default=1)
    allow_reschedule = models.BooleanField(default=True)
    require_message_for_request = models.BooleanField(default=False)
    version = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Policy for {self.resource_id}"


class AvailabilityRule(TimeStampedModel):
    class Frequency(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"

    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="availability_rules",
    )
    name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    timezone = models.CharField(max_length=64, default="UTC")
    frequency = models.CharField(max_length=16, choices=Frequency.choices, default=Frequency.WEEKLY)
    weekdays = models.JSONField(default=list, blank=True)
    effective_start_date = models.DateField()
    effective_end_date = models.DateField(null=True, blank=True)
    local_start_time = models.TimeField()
    local_end_time = models.TimeField()
    capacity = models.PositiveIntegerField(default=1)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        indexes = [
            models.Index(fields=["resource", "is_active"]),
            models.Index(fields=["resource", "effective_start_date"]),
        ]

    def clean(self):
        if self.effective_end_date and self.effective_end_date < self.effective_start_date:
            raise ValidationError("effective_end_date must be on or after effective_start_date.")
        if self.local_end_time <= self.local_start_time:
            raise ValidationError("local_end_time must be after local_start_time.")

        if self.frequency == self.Frequency.WEEKLY:
            weekdays = self.weekdays or []
            if not weekdays:
                raise ValidationError("weekly rules require at least one weekday.")
            if any(not isinstance(day, int) or day < 0 or day > 6 for day in weekdays):
                raise ValidationError("weekdays must use integers in range [0, 6].")

    def __str__(self):
        return self.name or f"Rule {self.pk}"


class AvailabilityException(TimeStampedModel):
    class ExceptionType(models.TextChoices):
        BLACKOUT = "blackout", "Blackout"
        OVERRIDE = "override", "Override"

    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="availability_exceptions",
    )
    exception_type = models.CharField(max_length=16, choices=ExceptionType.choices)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)
    is_available_override = models.BooleanField(default=False)
    capacity_override = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["resource", "start_at", "end_at"])]

    def clean(self):
        if self.end_at <= self.start_at:
            raise ValidationError("end_at must be after start_at.")

    def __str__(self):
        return f"{self.exception_type} [{self.start_at} - {self.end_at}]"


class AvailabilitySlot(TimeStampedModel):
    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="availability_slots",
    )
    source_rule = models.ForeignKey(
        AvailabilityRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="materialized_slots",
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    capacity_total = models.PositiveIntegerField(default=1)
    capacity_reserved = models.PositiveIntegerField(default=0)
    is_bookable = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["resource", "start_at", "end_at"],
                name="uniq_resource_slot_window",
            ),
            models.CheckConstraint(
                check=Q(capacity_reserved__lte=F("capacity_total")),
                name="capacity_reserved_lte_total",
            ),
        ]
        indexes = [
            models.Index(fields=["resource", "start_at", "end_at"]),
            models.Index(fields=["resource", "is_bookable"]),
        ]

    @property
    def capacity_remaining(self):
        return self.capacity_total - self.capacity_reserved

    def clean(self):
        if self.end_at <= self.start_at:
            raise ValidationError("end_at must be after start_at.")

    def __str__(self):
        return f"Slot {self.resource_id} [{self.start_at} - {self.end_at}]"


class BookingRequest(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DECLINED = "declined", "Declined"
        WITHDRAWN = "withdrawn", "Withdrawn"
        EXPIRED = "expired", "Expired"

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="scheduling_requests",
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="booking_requests_created",
    )
    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="booking_requests",
    )
    requested_start_at = models.DateTimeField()
    requested_end_at = models.DateTimeField()
    attendee_count = models.PositiveIntegerField(default=1)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    provider_message = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="booking_requests_reviewed",
    )
    idempotency_key = models.CharField(max_length=128, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["resource", "status"]),
            models.Index(fields=["organizer", "status"]),
            models.Index(fields=["event", "status"]),
            models.Index(fields=["expires_at"]),
        ]

    def clean(self):
        if self.requested_end_at <= self.requested_start_at:
            raise ValidationError("requested_end_at must be after requested_start_at.")

    def __str__(self):
        return f"Request {self.pk} [{self.status}]"


class Booking(TimeStampedModel):
    class Status(models.TextChoices):
        HOLD = "hold", "Hold"
        CONFIRMED = "confirmed", "Confirmed"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        RESCHEDULE_PENDING = "reschedule_pending", "Reschedule Pending"
        DISPUTED = "disputed", "Disputed"
        EXPIRED = "expired", "Expired"

    class Source(models.TextChoices):
        INSTANT = "instant", "Instant"
        REQUEST = "request", "Request"
        ADMIN_OVERRIDE = "admin_override", "Admin Override"

    ACTIVE_STATES = (
        Status.HOLD,
        Status.CONFIRMED,
        Status.IN_PROGRESS,
        Status.RESCHEDULE_PENDING,
        Status.DISPUTED,
    )

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="scheduling_bookings",
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings_created_v2",
    )
    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    source_request = models.OneToOneField(
        BookingRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_booking",
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    attendee_count = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.HOLD)
    source = models.CharField(max_length=24, choices=Source.choices)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings_cancelled_v2",
    )
    reschedule_requested_start_at = models.DateTimeField(null=True, blank=True)
    reschedule_requested_end_at = models.DateTimeField(null=True, blank=True)
    version = models.PositiveIntegerField(default=1)
    idempotency_key = models.CharField(max_length=128, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["resource", "status"]),
            models.Index(fields=["resource", "start_at", "end_at"]),
            models.Index(fields=["organizer", "status"]),
            models.Index(fields=["event", "status"]),
        ]

    def clean(self):
        if self.end_at <= self.start_at:
            raise ValidationError("end_at must be after start_at.")

    def is_active_state(self):
        return self.status in self.ACTIVE_STATES

    def __str__(self):
        return f"Booking {self.pk} [{self.status}]"


class CalendarEvent(TimeStampedModel):
    class ActorType(models.TextChoices):
        ORGANIZER = "organizer", "Organizer"
        RESOURCE = "resource", "Resource"
        ADMIN = "admin", "Admin"

    class CalendarType(models.TextChoices):
        AVAILABLE = "available", "Available"
        PENDING = "pending", "Pending"
        BOOKED = "booked", "Booked"
        BLACKOUT = "blackout", "Blackout"
        HOLD = "hold", "Hold"

    actor_type = models.CharField(max_length=16, choices=ActorType.choices)
    actor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="calendar_events",
    )
    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="calendar_events",
    )
    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="calendar_events",
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="calendar_events",
    )
    request = models.ForeignKey(
        BookingRequest,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="calendar_events",
    )
    calendar_type = models.CharField(max_length=16, choices=CalendarType.choices)
    title = models.CharField(max_length=255)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["actor_type", "actor_user", "start_at"]),
            models.Index(fields=["resource", "start_at", "end_at"]),
            models.Index(fields=["event", "start_at", "end_at"]),
        ]

    def __str__(self):
        return f"CalendarEvent {self.pk} ({self.calendar_type})"


class IdempotencyRecord(TimeStampedModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="idempotency_records",
    )
    endpoint = models.CharField(max_length=128)
    key = models.CharField(max_length=128)
    request_hash = models.CharField(max_length=64)
    response_status = models.PositiveSmallIntegerField()
    response_body = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "endpoint", "key"],
                name="uniq_idempotency_owner_endpoint_key",
            )
        ]

    def __str__(self):
        return f"{self.endpoint}::{self.key}"


class AuditLog(TimeStampedModel):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduling_audit_logs",
    )
    action = models.CharField(max_length=128)
    target_type = models.CharField(max_length=64)
    target_id = models.CharField(max_length=64)
    before_data = models.JSONField(default=dict, blank=True)
    after_data = models.JSONField(default=dict, blank=True)
    reason = models.TextField(blank=True)
    is_admin_override = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["target_type", "target_id"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.action} on {self.target_type}:{self.target_id}"


class OutboxEvent(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        DEAD_LETTER = "dead_letter", "Dead Letter"

    event_type = models.CharField(max_length=128)
    aggregate_type = models.CharField(max_length=64)
    aggregate_id = models.CharField(max_length=64)
    payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    attempts = models.PositiveIntegerField(default=0)
    next_attempt_at = models.DateTimeField(default=timezone.now)
    last_error = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status", "next_attempt_at"]),
            models.Index(fields=["aggregate_type", "aggregate_id"]),
        ]

    def mark_failed(self, error_message: str, retry_in_seconds: int = 30):
        self.status = self.Status.FAILED
        self.last_error = error_message
        self.attempts = F("attempts") + 1
        self.next_attempt_at = timezone.now() + timedelta(seconds=retry_in_seconds)
        self.save(update_fields=["status", "last_error", "attempts", "next_attempt_at", "updated_at"])

    def __str__(self):
        return f"{self.event_type} ({self.status})"


class OutboxDeadLetter(TimeStampedModel):
    outbox_event = models.ForeignKey(
        OutboxEvent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="dead_letters",
    )
    event_type = models.CharField(max_length=128)
    aggregate_type = models.CharField(max_length=64)
    aggregate_id = models.CharField(max_length=64)
    payload = models.JSONField(default=dict, blank=True)
    attempts = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["event_type", "created_at"]),
            models.Index(fields=["aggregate_type", "aggregate_id"]),
        ]

    def __str__(self):
        return f"DLQ {self.event_type} ({self.aggregate_type}:{self.aggregate_id})"


class WebhookTarget(TimeStampedModel):
    url = models.URLField(unique=True)
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    secret = models.CharField(max_length=255, blank=True)
    timeout_seconds = models.PositiveIntegerField(default=5)
    failure_threshold = models.PositiveIntegerField(default=5)
    open_seconds = models.PositiveIntegerField(default=120)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduling_webhook_targets_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduling_webhook_targets_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["is_active", "created_at"]),
        ]

    def __str__(self):
        return self.url


class BookingConflictIncident(TimeStampedModel):
    class Operation(models.TextChoices):
        CREATE = "create", "Create"
        RESCHEDULE = "reschedule", "Reschedule"

    class ConflictSource(models.TextChoices):
        APPLICATION_CHECK = "application_check", "Application Check"
        DB_CONSTRAINT = "db_constraint", "DB Constraint"

    operation = models.CharField(max_length=16, choices=Operation.choices)
    conflict_source = models.CharField(max_length=24, choices=ConflictSource.choices)
    resource = models.ForeignKey(
        MarketplaceResource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conflict_incidents",
    )
    event = models.ForeignKey(
        "events.Event",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="booking_conflict_incidents",
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="booking_conflict_incidents",
    )
    requested_start_at = models.DateTimeField()
    requested_end_at = models.DateTimeField()
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["operation", "created_at"]),
            models.Index(fields=["conflict_source", "created_at"]),
            models.Index(fields=["resource", "created_at"]),
        ]

    def __str__(self):
        return f"{self.operation}:{self.conflict_source} ({self.resource_id})"
