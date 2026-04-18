from rest_framework import serializers
from locations.serializers import VenueSerializer
from locations.models import Location
from tickets.serializers import TicketSerializer
from .models import Event, PromoCode, EventDraft

def _extract_draft_name(data):
    """
    Attempt to pull a human-friendly name from the draft payload.
    Falls back to 'Untitled event' when no title-like field exists.
    """
    if not isinstance(data, dict):
        return "Untitled event"

    candidates = [
        data.get("name"),
        data.get("title"),
        data.get("eventName"),
        data.get("event_name"),
        data.get("eventDetails", {}).get("name"),
        data.get("eventDetails", {}).get("eventName"),
        data.get("event_details", {}).get("name"),
        data.get("event_details", {}).get("eventName"),
        data.get("steps", {}).get("step1", {}).get("name"),
        data.get("steps", {}).get("step1", {}).get("eventName"),
    ]

    for candidate in candidates:
        if candidate:
            return candidate

    return "Untitled event"

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = [
            'id', 'event', 'code', 'discount_percentage',
            'discount_amount', 'start_date', 'end_date', 'is_active'
        ]
        read_only_fields = ['id']

class EventSerializer(serializers.ModelSerializer):
    promo_codes = PromoCodeSerializer(many=True, read_only=True)
    class Meta:
        model = Event
        fields = [
            'id',
            'user',
            'partner_user',
            'organizer',
            'name',
            'date',
            'start_date',
            'end_date',
            'start_time',
            'end_time',
            'location',
            'venue',
            'budget',
            'guest_count',
            'theme',
            'notes',
            'image_url',
            'banner_image',
            'category',   # Added field
            'created_at',
            'updated_at',
            'is_draft',
            'status',
            'published_at',

            # 1. Ticket Options
            'base_price', 'currency', 'tiered_prices', 'refund_policy',

            'max_tickets_per_buyer', 'promo_codes',

            # 2. Seating Options
            'is_seated', 'seating_chart',

            # 3. Audience & Access Controls
            'is_age_restricted', 'access_type', 'custom_questions',

            # 4. Event features / amenities
            'features',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'status', 'published_at']

    def create(self, validated_data):
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_tiered_prices(self, value):
        """
        Optional: Add validation for the structure of the tiered_prices JSON.
        Ensures each tier has a name, price, and quantity.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Tiered prices must be a list of tier objects.")
        for tier in value:
            if not all(k in tier for k in ('name', 'price', 'quantity')):
                raise serializers.ValidationError("Each tier must contain 'name', 'price', and 'quantity'.")
        return value

class EventDetailSerializer(EventSerializer):
    """
    A more detailed serializer for a single event page, including related
    location and ticket information.
    """
    location = VenueSerializer(read_only=True)
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['location', 'tickets']

class SimilarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'banner_image', 'start_date', 'location')
        fields = ('id', 'name', 'banner_image', 'start_date', 'location')

# Lightweight serializer to expose basic location details without creating
# a circular dependency on the full location serializers (which import
# events).
class LocationSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'image_url']

class EventListSerializer(EventSerializer):
    location_detail = LocationSummarySerializer(source="location", read_only=True)
    distance_km = serializers.FloatField(read_only=True, allow_null=True, required=False)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['location_detail', 'distance_km']

class EventDraftSerializer(serializers.ModelSerializer):
    assets = serializers.SerializerMethodField()
    organizer_id = serializers.IntegerField(source="organizer.id", read_only=True)

    class Meta:
        model = EventDraft
        fields = [
            "id",
            "organizer_id",
            "status",
            "current_step",
            "data",
            "assets",
            "created_at",
            "updated_at",
            "published_at",
        ]
        read_only_fields = ["id", "organizer_id", "status", "created_at", "updated_at", "published_at"]
        extra_kwargs = {"current_step": {"required": False}}

    def validate_data(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Event data must be an object.")
        return value

    def get_assets(self, obj):
        serializer = EventDraftAssetSerializer(
            obj.assets.all(),
            many=True,
            context=self.context,
        )
        return serializer.data


class EventDraftAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    is_image = serializers.SerializerMethodField()
    is_video = serializers.SerializerMethodField()

    class Meta:
        model = EventDraft._meta.get_field("assets").related_model
        fields = [
            "id",
            "asset_type",
            "name",
            "mime_type",
            "size",
            "file_url",
            "is_image",
            "is_video",
            "created_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_is_image(self, obj):
        return bool(obj.mime_type and obj.mime_type.startswith("image/"))

    def get_is_video(self, obj):
        return bool(obj.mime_type and obj.mime_type.startswith("video/"))

class MyEventSummarySerializer(serializers.Serializer):
    """
    Lightweight serializer that unifies published events and drafts for the
    organizer-facing “My Events” experience.
    """

    id = serializers.IntegerField()
    name = serializers.CharField()
    status = serializers.CharField()
    lifecycle_state = serializers.CharField()
    current_step = serializers.CharField(required=False, allow_null=True)
    published_at = serializers.DateTimeField(required=False, allow_null=True)
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    record_type = serializers.CharField()
    is_draft = serializers.BooleanField()
    readiness_state = serializers.CharField()
    organizer_id = serializers.IntegerField(required=False, allow_null=True)

    def to_representation(self, instance):
        if isinstance(instance, EventDraft):
            name = _extract_draft_name(instance.data or {})
            return {
                "id": instance.id,
                "name": name,
                "status": instance.status,
                "lifecycle_state": "draft",
                "current_step": instance.current_step,
                "published_at": instance.published_at,
                "created_at": instance.created_at,
                "updated_at": instance.updated_at,
                "record_type": "draft",
                "is_draft": True,
                "readiness_state": "in_progress" if instance.status == EventDraft.Status.DRAFT else "ready",
                "organizer_id": instance.organizer_id,
            }

        if isinstance(instance, Event):
            organizer_id = instance.organizer_id or instance.user_id
            lifecycle_state = instance.status or ("published" if not instance.is_draft else "draft")
            return {
                "id": instance.id,
                "name": instance.name,
                "status": instance.status,
                "lifecycle_state": lifecycle_state,
                "current_step": None,
                "published_at": instance.published_at,
                "created_at": instance.created_at,
                "updated_at": instance.updated_at,
                "record_type": "event",
                "is_draft": instance.is_draft,
                "readiness_state": "published" if lifecycle_state == "published" else "pending",
                "organizer_id": organizer_id,
            }

        return super().to_representation(instance)
