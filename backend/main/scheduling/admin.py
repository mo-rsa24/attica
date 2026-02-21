from django.contrib import admin

from .models import (
    AuditLog,
    AvailabilityException,
    AvailabilityRule,
    AvailabilitySlot,
    BookingConflictIncident,
    Booking,
    BookingRequest,
    CalendarEvent,
    IdempotencyRecord,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    WebhookTarget,
)


@admin.register(MarketplaceResource)
class MarketplaceResourceAdmin(admin.ModelAdmin):
    list_display = ("id", "display_name", "resource_type", "owner", "is_active", "updated_at")
    list_filter = ("resource_type", "is_active")
    search_fields = ("display_name", "owner__username")


@admin.register(ResourcePolicy)
class ResourcePolicyAdmin(admin.ModelAdmin):
    list_display = ("id", "resource", "booking_mode", "min_notice_hours", "max_horizon_days", "updated_at")
    list_filter = ("booking_mode",)


@admin.register(AvailabilityRule)
class AvailabilityRuleAdmin(admin.ModelAdmin):
    list_display = ("id", "resource", "frequency", "is_active", "effective_start_date", "effective_end_date")
    list_filter = ("frequency", "is_active")


@admin.register(AvailabilityException)
class AvailabilityExceptionAdmin(admin.ModelAdmin):
    list_display = ("id", "resource", "exception_type", "start_at", "end_at")
    list_filter = ("exception_type",)


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("id", "resource", "start_at", "end_at", "capacity_total", "capacity_reserved", "is_bookable")
    list_filter = ("is_bookable",)


@admin.register(BookingRequest)
class BookingRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "resource", "organizer", "status", "requested_start_at", "requested_end_at")
    list_filter = ("status",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "resource", "organizer", "status", "source", "start_at", "end_at")
    list_filter = ("status", "source")


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ("id", "actor_type", "actor_user", "resource", "calendar_type", "start_at", "end_at")
    list_filter = ("actor_type", "calendar_type")


@admin.register(IdempotencyRecord)
class IdempotencyRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "endpoint", "key", "response_status", "created_at")
    search_fields = ("owner__username", "endpoint", "key")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "action", "target_type", "target_id", "actor", "is_admin_override", "created_at")
    list_filter = ("is_admin_override", "action", "target_type")


@admin.register(OutboxEvent)
class OutboxEventAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "aggregate_type", "aggregate_id", "status", "attempts", "next_attempt_at")
    list_filter = ("status", "event_type")


@admin.register(OutboxDeadLetter)
class OutboxDeadLetterAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "aggregate_type", "aggregate_id", "attempts", "created_at")
    search_fields = ("event_type", "aggregate_type", "aggregate_id")


@admin.register(WebhookTarget)
class WebhookTargetAdmin(admin.ModelAdmin):
    list_display = ("id", "url", "is_active", "timeout_seconds", "failure_threshold", "open_seconds", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("url", "description")


@admin.register(BookingConflictIncident)
class BookingConflictIncidentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "operation",
        "conflict_source",
        "resource",
        "event",
        "organizer",
        "requested_start_at",
        "created_at",
    )
    list_filter = ("operation", "conflict_source")
