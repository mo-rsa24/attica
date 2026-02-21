from __future__ import annotations

from rest_framework import serializers

from .models import (
    AvailabilityException,
    AvailabilityRule,
    AvailabilitySlot,
    BookingConflictIncident,
    Booking,
    BookingRequest,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    WebhookTarget,
)


class MarketplaceResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceResource
        fields = [
            "id",
            "owner",
            "resource_type",
            "display_name",
            "timezone",
            "city",
            "country",
            "is_active",
            "venue",
            "artist",
            "vendor",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class ResourcePolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourcePolicy
        fields = [
            "id",
            "resource",
            "booking_mode",
            "min_notice_hours",
            "max_horizon_days",
            "buffer_before_minutes",
            "buffer_after_minutes",
            "cancellation_window_hours",
            "default_capacity",
            "allow_reschedule",
            "require_message_for_request",
            "version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AvailabilityRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityRule
        fields = [
            "id",
            "resource",
            "name",
            "is_active",
            "timezone",
            "frequency",
            "weekdays",
            "effective_start_date",
            "effective_end_date",
            "local_start_time",
            "local_end_time",
            "capacity",
            "version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "version", "created_at", "updated_at"]


class AvailabilityExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityException
        fields = [
            "id",
            "resource",
            "exception_type",
            "start_at",
            "end_at",
            "reason",
            "is_available_override",
            "capacity_override",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    capacity_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "resource",
            "source_rule",
            "start_at",
            "end_at",
            "capacity_total",
            "capacity_reserved",
            "capacity_remaining",
            "is_bookable",
            "version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "capacity_reserved", "version", "created_at", "updated_at"]


class BookingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = [
            "id",
            "event",
            "organizer",
            "resource",
            "requested_start_at",
            "requested_end_at",
            "attendee_count",
            "message",
            "status",
            "provider_message",
            "expires_at",
            "reviewed_at",
            "reviewed_by",
            "idempotency_key",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organizer",
            "status",
            "provider_message",
            "expires_at",
            "reviewed_at",
            "reviewed_by",
            "created_at",
            "updated_at",
        ]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "event",
            "organizer",
            "resource",
            "source_request",
            "start_at",
            "end_at",
            "attendee_count",
            "status",
            "source",
            "hold_expires_at",
            "cancellation_reason",
            "cancelled_by",
            "reschedule_requested_start_at",
            "reschedule_requested_end_at",
            "version",
            "idempotency_key",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organizer",
            "source_request",
            "status",
            "source",
            "hold_expires_at",
            "cancellation_reason",
            "cancelled_by",
            "reschedule_requested_start_at",
            "reschedule_requested_end_at",
            "version",
            "created_at",
            "updated_at",
        ]


class AvailabilitySearchQuerySerializer(serializers.Serializer):
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    resource_type = serializers.ChoiceField(
        choices=MarketplaceResource.ResourceType.choices,
        required=False,
    )
    city = serializers.CharField(required=False)
    attendee_count = serializers.IntegerField(required=False, min_value=1, default=1)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=25)
    offset = serializers.IntegerField(required=False, min_value=0, default=0)

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class CreateBookingSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    resource_id = serializers.IntegerField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    attendee_count = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class CreateRequestSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    resource_id = serializers.IntegerField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    attendee_count = serializers.IntegerField(min_value=1, default=1)
    message = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class RequestReviewSerializer(serializers.Serializer):
    provider_message = serializers.CharField(required=False, allow_blank=True, default="")


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class RescheduleBookingSerializer(serializers.Serializer):
    new_start_at = serializers.DateTimeField()
    new_end_at = serializers.DateTimeField()

    def validate(self, attrs):
        if attrs["new_end_at"] <= attrs["new_start_at"]:
            raise serializers.ValidationError("new_end_at must be after new_start_at.")
        return attrs


class CalendarQuerySerializer(serializers.Serializer):
    scope = serializers.ChoiceField(choices=[("organizer", "organizer"), ("resource", "resource"), ("admin", "admin")])
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    event_id = serializers.IntegerField(required=False)
    resource_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class WebhookTargetSerializer(serializers.ModelSerializer):
    secret = serializers.CharField(write_only=True, required=False, allow_blank=True)
    clear_secret = serializers.BooleanField(write_only=True, required=False, default=False)
    has_secret = serializers.SerializerMethodField()
    secret_preview = serializers.SerializerMethodField()

    class Meta:
        model = WebhookTarget
        fields = [
            "id",
            "url",
            "description",
            "is_active",
            "secret",
            "clear_secret",
            "has_secret",
            "secret_preview",
            "timeout_seconds",
            "failure_threshold",
            "open_seconds",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "has_secret",
            "secret_preview",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_url(self, value):
        if not value.startswith("http://") and not value.startswith("https://"):
            raise serializers.ValidationError("Webhook URL must start with http:// or https://")
        return value

    def get_has_secret(self, instance):
        return bool(instance.secret)

    def get_secret_preview(self, instance):
        if not instance.secret:
            return ""
        visible = instance.secret[-4:]
        return f"***{visible}"

    def create(self, validated_data):
        secret = validated_data.pop("secret", "")
        validated_data.pop("clear_secret", None)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["created_by"] = request.user
            validated_data["updated_by"] = request.user
        target = super().create(validated_data)
        if secret:
            target.secret = secret
            target.save(update_fields=["secret", "updated_at"])
        return target

    def update(self, instance, validated_data):
        secret = validated_data.pop("secret", None)
        clear_secret = validated_data.pop("clear_secret", False)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["updated_by"] = request.user
        instance = super().update(instance, validated_data)
        if clear_secret:
            instance.secret = ""
            instance.save(update_fields=["secret", "updated_at"])
        elif secret not in (None, ""):
            instance.secret = secret
            instance.save(update_fields=["secret", "updated_at"])
        return instance


class OutboxEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboxEvent
        fields = [
            "id",
            "event_type",
            "aggregate_type",
            "aggregate_id",
            "payload",
            "status",
            "attempts",
            "next_attempt_at",
            "last_error",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OutboxDeadLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboxDeadLetter
        fields = [
            "id",
            "outbox_event",
            "event_type",
            "aggregate_type",
            "aggregate_id",
            "payload",
            "attempts",
            "error_message",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class BookingConflictIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingConflictIncident
        fields = [
            "id",
            "operation",
            "conflict_source",
            "resource",
            "event",
            "organizer",
            "requested_start_at",
            "requested_end_at",
            "message",
            "details",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
