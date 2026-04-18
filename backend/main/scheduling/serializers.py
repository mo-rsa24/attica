from __future__ import annotations

from decimal import Decimal

from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import serializers

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
from .services import (
    get_booking_request_deposit_state,
    get_booking_request_workflow_state,
    is_booking_request_ready_for_publish,
)


class MarketplaceResourceSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    booking_mode = serializers.SerializerMethodField()

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
            "average_rating",
            "review_count",
            "booking_mode",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def get_average_rating(self, obj):
        result = obj.reviews.aggregate(avg=Avg("rating"))
        avg = result.get("avg")
        return round(float(avg), 1) if avg is not None else None

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_booking_mode(self, obj):
        policy = getattr(obj, "policy", None)
        return policy.booking_mode if policy else None


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
            "requires_deposit",
            "deposit_type",
            "deposit_value",
            "checkout_hold_minutes",
            "publish_requires_mock_deposit",
            "version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CheckoutSessionSerializer(serializers.ModelSerializer):
    requests = serializers.SerializerMethodField()
    total_deposit_due = serializers.SerializerMethodField()
    total_remaining_balance_estimate = serializers.SerializerMethodField()
    hold_remaining_seconds = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = CheckoutSession
        fields = [
            "id",
            "organizer",
            "event_draft",
            "status",
            "hold_minutes",
            "hold_expires_at",
            "hold_remaining_seconds",
            "paid_at",
            "is_paid",
            "is_active",
            "card_brand",
            "card_last4",
            "card_expiry_month",
            "card_expiry_year",
            "mock_payment_reference",
            "total_deposit_due",
            "total_remaining_balance_estimate",
            "requests",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_requests(self, obj):
        requests = getattr(obj, "booking_requests_cache", None)
        if requests is None:
            requests = obj.booking_requests.select_related("resource").all()
        return [
            {
                "id": request.id,
                "resource_id": request.resource_id,
                "resource_display_name": request.resource.display_name,
                "resource_type": request.resource.resource_type,
                "deposit_due_amount": request.deposit_due_amount,
                "remaining_balance_estimate": request.remaining_balance_estimate,
                "workflow_state": get_booking_request_workflow_state(request),
                "deposit_state": get_booking_request_deposit_state(request),
                "is_ready_for_publish": is_booking_request_ready_for_publish(request),
                "checkout_hold_expires_at": request.draft_hold_expires_at,
            }
            for request in requests
        ]

    def get_total_deposit_due(self, obj):
        requests = getattr(obj, "booking_requests_cache", None)
        if requests is None:
            requests = obj.booking_requests.all()
        return sum((request.deposit_due_amount or Decimal("0")) for request in requests)

    def get_total_remaining_balance_estimate(self, obj):
        requests = getattr(obj, "booking_requests_cache", None)
        if requests is None:
            requests = obj.booking_requests.all()
        return sum((request.remaining_balance_estimate or Decimal("0")) for request in requests)

    def get_hold_remaining_seconds(self, obj):
        if not obj.hold_expires_at:
            return 0
        remaining = int((obj.hold_expires_at - timezone.now()).total_seconds())
        return max(0, remaining)

    def get_is_active(self, obj):
        return obj.status == CheckoutSession.Status.ACTIVE and self.get_hold_remaining_seconds(obj) > 0

    def get_is_paid(self, obj):
        return bool(obj.paid_at)


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
    organizer_username = serializers.CharField(source="organizer.username", read_only=True)
    organizer_first_name = serializers.CharField(source="organizer.first_name", read_only=True)
    organizer_last_name = serializers.CharField(source="organizer.last_name", read_only=True)
    organizer_profile_picture = serializers.SerializerMethodField()
    resource_display_name = serializers.CharField(source="resource.display_name", read_only=True)
    resource_type = serializers.CharField(source="resource.resource_type", read_only=True)
    resource_owner_id = serializers.IntegerField(source="resource.owner_id", read_only=True)
    resource_owner_username = serializers.CharField(source="resource.owner.username", read_only=True)
    event_title = serializers.SerializerMethodField()
    event_category = serializers.SerializerMethodField()
    event_theme = serializers.SerializerMethodField()
    event_notes = serializers.SerializerMethodField()
    event_guest_count = serializers.SerializerMethodField()
    event_date = serializers.SerializerMethodField()
    event_start_time = serializers.SerializerMethodField()
    event_end_time = serializers.SerializerMethodField()
    event_banner_image = serializers.SerializerMethodField()
    event_image_url = serializers.SerializerMethodField()
    event_location_name = serializers.SerializerMethodField()
    event_location_address = serializers.SerializerMethodField()
    event_location_latitude = serializers.SerializerMethodField()
    event_location_longitude = serializers.SerializerMethodField()
    resource_image_url = serializers.SerializerMethodField()
    resource_price_display = serializers.SerializerMethodField()
    workflow_state = serializers.SerializerMethodField()
    deposit_state = serializers.SerializerMethodField()
    is_ready_for_publish = serializers.SerializerMethodField()
    checkout_hold_expires_at = serializers.DateTimeField(source="draft_hold_expires_at", read_only=True)
    hold_remaining_seconds = serializers.SerializerMethodField()
    checkout_session_status = serializers.CharField(source="checkout_session.status", read_only=True)
    mock_payment_paid_at = serializers.DateTimeField(source="checkout_session.paid_at", read_only=True)
    mock_payment_reference = serializers.CharField(source="checkout_session.mock_payment_reference", read_only=True)
    mock_payment_card_brand = serializers.CharField(source="checkout_session.card_brand", read_only=True)
    mock_payment_card_last4 = serializers.CharField(source="checkout_session.card_last4", read_only=True)

    class Meta:
        model = BookingRequest
        fields = [
            "id",
            "event",
            "event_draft",
            "organizer",
            "organizer_username",
            "organizer_first_name",
            "organizer_last_name",
            "organizer_profile_picture",
            "resource",
            "resource_display_name",
            "resource_type",
            "resource_owner_id",
            "resource_owner_username",
            "resource_image_url",
            "resource_price_display",
            "event_title",
            "event_category",
            "event_theme",
            "event_notes",
            "event_guest_count",
            "event_date",
            "event_start_time",
            "event_end_time",
            "event_banner_image",
            "event_image_url",
            "event_location_name",
            "event_location_address",
            "event_location_latitude",
            "event_location_longitude",
            "requested_start_at",
            "requested_end_at",
            "attendee_count",
            "message",
            "status",
            "workflow_state",
            "deposit_state",
            "is_ready_for_publish",
            "provider_message",
            "expires_at",
            "checkout_session",
            "checkout_session_status",
            "checkout_started_at",
            "checkout_released_at",
            "checkout_hold_expires_at",
            "hold_remaining_seconds",
            "deposit_required_at_checkout",
            "publish_requires_mock_deposit",
            "deposit_type_snapshot",
            "deposit_value_snapshot",
            "estimated_total_amount",
            "deposit_due_amount",
            "remaining_balance_estimate",
            "mock_payment_paid_at",
            "mock_payment_reference",
            "mock_payment_card_brand",
            "mock_payment_card_last4",
            "draft_hold_expires_at",
            "reviewed_at",
            "reviewed_by",
            "idempotency_key",
            # Counter-proposal fields
            "counter_start_at",
            "counter_end_at",
            "counter_rate",
            "counter_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organizer",
            "status",
            "provider_message",
            "expires_at",
            "checkout_session",
            "checkout_session_status",
            "checkout_started_at",
            "checkout_released_at",
            "checkout_hold_expires_at",
            "hold_remaining_seconds",
            "deposit_required_at_checkout",
            "publish_requires_mock_deposit",
            "deposit_type_snapshot",
            "deposit_value_snapshot",
            "estimated_total_amount",
            "deposit_due_amount",
            "remaining_balance_estimate",
            "mock_payment_paid_at",
            "mock_payment_reference",
            "mock_payment_card_brand",
            "mock_payment_card_last4",
            "draft_hold_expires_at",
            "reviewed_at",
            "reviewed_by",
            "counter_start_at",
            "counter_end_at",
            "counter_rate",
            "counter_message",
            "created_at",
            "updated_at",
        ]

    @staticmethod
    def _first_truthy(*values):
        for value in values:
            if value not in (None, ""):
                return value
        return None

    def _draft_payload(self, obj):
        if not obj.event_draft_id or not obj.event_draft:
            return {}
        payload = obj.event_draft.data
        return payload if isinstance(payload, dict) else {}

    def _draft_step(self, obj, step_key):
        payload = self._draft_payload(obj)
        steps = payload.get("steps")
        if isinstance(steps, dict):
            step_payload = steps.get(step_key)
            if isinstance(step_payload, dict):
                return step_payload
        direct_payload = payload.get(step_key)
        return direct_payload if isinstance(direct_payload, dict) else {}

    def _draft_location(self, obj):
        step4 = self._draft_step(obj, "step4")
        if isinstance(step4.get("location"), dict):
            return step4.get("location")
        payload = self._draft_payload(obj)
        event_details = payload.get("eventDetails")
        if isinstance(event_details, dict) and isinstance(event_details.get("location"), dict):
            return event_details.get("location")
        return {}

    def _serialize_datetime_like(self, value):
        if value is None:
            return None
        if hasattr(value, "isoformat"):
            return value.isoformat()
        return str(value)

    def get_organizer_profile_picture(self, obj):
        profile_picture = getattr(obj.organizer, "profile_picture", None)
        if not profile_picture:
            return None
        try:
            url = profile_picture.url
        except Exception:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_event_title(self, obj):
        if obj.event_id and obj.event:
            return obj.event.name
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("name"),
            step1.get("eventName"),
            payload.get("name"),
            payload.get("eventName"),
            "Untitled event",
        )

    def get_event_category(self, obj):
        if obj.event_id and obj.event:
            return obj.event.category
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("category"),
            step1.get("selectedEventType"),
            payload.get("category"),
        )

    def get_event_theme(self, obj):
        if obj.event_id and obj.event:
            return obj.event.theme
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("theme"),
            payload.get("theme"),
        )

    def get_event_notes(self, obj):
        if obj.event_id and obj.event:
            return obj.event.notes
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("notes"),
            step1.get("description"),
            payload.get("notes"),
            payload.get("description"),
        )

    def get_event_guest_count(self, obj):
        if obj.event_id and obj.event:
            return obj.event.guest_count
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        value = self._first_truthy(
            step1.get("guest_count"),
            step1.get("capacity"),
            payload.get("guest_count"),
            payload.get("capacity"),
        )
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return value

    def get_event_date(self, obj):
        if obj.event_id and obj.event:
            return self._serialize_datetime_like(obj.event.date)
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("date"),
            step1.get("start_date"),
            payload.get("date"),
            payload.get("start_date"),
        )

    def get_event_start_time(self, obj):
        if obj.event_id and obj.event:
            return self._serialize_datetime_like(obj.event.start_time)
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("start_time"),
            step1.get("start_date"),
            payload.get("start_time"),
            payload.get("start_date"),
        )

    def get_event_end_time(self, obj):
        if obj.event_id and obj.event:
            return self._serialize_datetime_like(obj.event.end_time)
        step1 = self._draft_step(obj, "step1")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step1.get("end_time"),
            step1.get("end_date"),
            payload.get("end_time"),
            payload.get("end_date"),
        )

    def get_event_banner_image(self, obj):
        if obj.event_id and obj.event:
            return obj.event.banner_image
        step8 = self._draft_step(obj, "step8")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step8.get("banner_image"),
            payload.get("banner_image"),
        )

    def get_event_image_url(self, obj):
        if obj.event_id and obj.event:
            return obj.event.image_url
        step8 = self._draft_step(obj, "step8")
        payload = self._draft_payload(obj)
        return self._first_truthy(
            step8.get("image_url"),
            payload.get("image_url"),
        )

    def get_event_location_name(self, obj):
        if obj.event_id and obj.event and obj.event.location_id:
            return obj.event.location.name
        location = self._draft_location(obj)
        return self._first_truthy(
            location.get("name"),
            location.get("venue"),
            location.get("title"),
        )

    def get_event_location_address(self, obj):
        if obj.event_id and obj.event and obj.event.location_id:
            return obj.event.location.address
        location = self._draft_location(obj)
        return self._first_truthy(
            location.get("address"),
            location.get("formatted_address"),
        )

    def get_event_location_latitude(self, obj):
        if obj.event_id and obj.event and obj.event.location_id:
            return obj.event.location.latitude
        location = self._draft_location(obj)
        return self._first_truthy(
            location.get("lat"),
            location.get("latitude"),
        )

    def get_event_location_longitude(self, obj):
        if obj.event_id and obj.event and obj.event.location_id:
            return obj.event.location.longitude
        location = self._draft_location(obj)
        return self._first_truthy(
            location.get("lon"),
            location.get("lng"),
            location.get("longitude"),
        )

    def get_resource_image_url(self, obj):
        resource = obj.resource
        if resource.artist_id and resource.artist:
            return self._first_truthy(
                getattr(resource.artist, "profile_image", None),
                getattr(resource.artist, "image_url", None),
                getattr(resource.artist, "photo", None),
            )
        if resource.venue_id and resource.venue:
            return self._first_truthy(
                getattr(resource.venue, "image_url", None),
                getattr(resource.venue, "photo", None),
            )
        if resource.vendor_id and resource.vendor:
            return self._first_truthy(
                getattr(resource.vendor, "portfolio", None),
                getattr(resource.vendor, "image_url", None),
            )
        return None

    def get_resource_price_display(self, obj):
        resource = obj.resource
        if resource.artist_id and resource.artist:
            fee = getattr(resource.artist, "booking_fee", None)
            if fee:
                return f"R{int(fee):,}"
        if resource.vendor_id and resource.vendor:
            price = getattr(resource.vendor, "price_range", None)
            if price:
                return f"R{int(price):,}"
        if resource.venue_id and resource.venue:
            price = getattr(resource.venue, "price", None)
            if price:
                return f"R{int(price):,}"
        if obj.counter_rate:
            return f"R{obj.counter_rate:,.2f}"
        return None

    def get_workflow_state(self, obj):
        return get_booking_request_workflow_state(obj)

    def get_deposit_state(self, obj):
        return get_booking_request_deposit_state(obj)

    def get_is_ready_for_publish(self, obj):
        return is_booking_request_ready_for_publish(obj)

    def get_hold_remaining_seconds(self, obj):
        if not obj.draft_hold_expires_at:
            return 0
        remaining = int((obj.draft_hold_expires_at - timezone.now()).total_seconds())
        return max(0, remaining)


class BookingSerializer(serializers.ModelSerializer):
    resource_display_name = serializers.CharField(source="resource.display_name", read_only=True)
    resource_type = serializers.CharField(source="resource.resource_type", read_only=True)
    resource_owner_id = serializers.IntegerField(source="resource.owner_id", read_only=True)
    resource_owner_username = serializers.CharField(source="resource.owner.username", read_only=True)
    organizer_username = serializers.CharField(source="organizer.username", read_only=True)
    organizer_first_name = serializers.CharField(source="organizer.first_name", read_only=True)
    organizer_last_name = serializers.CharField(source="organizer.last_name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "event",
            "organizer",
            "organizer_username",
            "organizer_first_name",
            "organizer_last_name",
            "resource",
            "resource_display_name",
            "resource_type",
            "resource_owner_id",
            "resource_owner_username",
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
            "organizer_username",
            "organizer_first_name",
            "organizer_last_name",
            "resource_display_name",
            "resource_type",
            "resource_owner_id",
            "resource_owner_username",
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
    event_id = serializers.IntegerField(required=False)
    event_draft_id = serializers.IntegerField(required=False)
    resource_id = serializers.IntegerField()
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    attendee_count = serializers.IntegerField(min_value=1, default=1)
    message = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if not attrs.get("event_id") and not attrs.get("event_draft_id"):
            raise serializers.ValidationError("Either event_id or event_draft_id is required.")
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class CounterProposalSerializer(serializers.Serializer):
    counter_start_at = serializers.DateTimeField()
    counter_end_at = serializers.DateTimeField()
    counter_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    counter_message = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["counter_end_at"] <= attrs["counter_start_at"]:
            raise serializers.ValidationError("counter_end_at must be after counter_start_at.")
        return attrs


class EnrichedAvailabilitySearchQuerySerializer(serializers.Serializer):
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    resource_type = serializers.ChoiceField(
        choices=MarketplaceResource.ResourceType.choices,
        required=False,
    )
    city = serializers.CharField(required=False, allow_blank=True)
    attendee_count = serializers.IntegerField(required=False, min_value=1, default=1)
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)
    min_rating = serializers.FloatField(required=False, allow_null=True, min_value=0, max_value=5)
    max_price = serializers.FloatField(required=False, allow_null=True, min_value=0)
    name = serializers.CharField(required=False, allow_blank=True)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=20)
    offset = serializers.IntegerField(required=False, min_value=0, default=0)

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("end_at must be after start_at.")
        return attrs


class RequestReviewSerializer(serializers.Serializer):
    provider_message = serializers.CharField(required=False, allow_blank=True, default="")


class StartCheckoutSerializer(serializers.Serializer):
    event_draft_id = serializers.IntegerField()
    request_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class RefreshCheckoutSerializer(serializers.Serializer):
    pass


class CompleteMockDepositSerializer(serializers.Serializer):
    card_brand = serializers.CharField(max_length=32)
    card_last4 = serializers.RegexField(r"^\d{4}$")
    card_expiry_month = serializers.IntegerField(min_value=1, max_value=12)
    card_expiry_year = serializers.IntegerField(min_value=timezone.now().year)
    mock_payment_reference = serializers.CharField(required=False, allow_blank=True, max_length=128)


class ReleaseCheckoutSerializer(serializers.Serializer):
    pass


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


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source="reviewer.username", read_only=True)
    reviewee_username = serializers.CharField(source="reviewee.username", read_only=True)
    resource_display_name = serializers.CharField(source="resource.display_name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "booking",
            "reviewer",
            "reviewer_username",
            "reviewee",
            "reviewee_username",
            "reviewer_type",
            "resource",
            "resource_display_name",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reviewer",
            "reviewer_username",
            "reviewee",
            "reviewee_username",
            "reviewer_type",
            "resource",
            "resource_display_name",
            "created_at",
            "updated_at",
        ]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


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
