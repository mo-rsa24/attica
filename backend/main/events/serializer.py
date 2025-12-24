from rest_framework import serializers
from locations.serializers import VenueSerializer
from locations.models import Location
from tickets.serializers import TicketSerializer
from .models import Event, PromoCode

# NEW: Serializer for the PromoCode model
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

            # 1. Ticket Options
            'base_price', 'currency', 'tiered_prices', 'refund_policy',

            'max_tickets_per_buyer', 'promo_codes',

            # 2. Seating Options
            'is_seated', 'seating_chart',

            # 3. Audience & Access Controls
            'is_age_restricted', 'access_type', 'custom_questions',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

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