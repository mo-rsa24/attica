from rest_framework import serializers
from .models import Artist, ArtistBooking, ArtistPortfolioItem, Follow, ArtistPost
import json


class ArtistPortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistPortfolioItem
        fields = ['id', 'image', 'caption', 'created_at']

class ArtistSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    # Dummy stats for demonstration
    bookings_completed = serializers.IntegerField(default=24)
    rating = serializers.FloatField(default=4.8)
    events_participated = serializers.IntegerField(default=12)
    portfolio_items = ArtistPortfolioItemSerializer(many=True, read_only=True)

    class Meta:
        model = Artist
        fields = [
            'id', 'name', 'bio', 'owner', 'profile_image',
            'genres', 'rating', 'booking_fee', 'booking_fee_min', 'booking_fee_max',
            'contact_email', 'phone_number', 'instagram_handle', 'availability',
            'tour_start_date', 'tour_end_date', 'tour_cities', 'tour_clubs', 'general_ticket_price',
            'is_popular', 'portfolio_items','created_at', 'updated_at',
            'follower_count', 'is_following', 'bookings_completed',
            'rating', 'events_participated'
        ]

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_is_following(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return Follow.objects.filter(user=user, artist=obj).exists()
        return False

class ArtistPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistPost
        fields = ['id', 'artist', 'content', 'image', 'created_at']
        read_only_fields = ['id', 'artist', 'created_at']

class ArtistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating artist profiles."""
    tour_cities = serializers.ListField(child=serializers.CharField(), required=False)
    tour_clubs = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Artist
        fields = [
            "id", "name", "bio", "genres", "profile_image",
            "booking_fee", "booking_fee_min", "booking_fee_max",
            "contact_email", "phone_number", "instagram_handle", "availability",
            "tour_start_date", "tour_end_date", "tour_cities", "tour_clubs",
            "general_ticket_price",
        ]
        read_only_fields = ["id"]

    def to_internal_value(self, data):
        # Normalize multipart/querydict payloads to a plain dict first.
        if hasattr(data, "getlist"):
            mutable = {}
            for key in data.keys():
                values = data.getlist(key)
                mutable[key] = values if len(values) > 1 else data.get(key)
        else:
            mutable = dict(data)

        for field in ("tour_cities", "tour_clubs", "availability"):
            value = mutable.get(field)
            if isinstance(value, list) and len(value) == 1:
                value = value[0]
            if isinstance(value, str) and value.strip():
                try:
                    mutable[field] = json.loads(value)
                except json.JSONDecodeError:
                    # Let field-level validation produce a clear error message.
                    pass
        return super().to_internal_value(mutable)

    def validate(self, attrs):
        min_fee = attrs.get("booking_fee_min")
        max_fee = attrs.get("booking_fee_max")
        if min_fee is not None and max_fee is not None and min_fee > max_fee:
            raise serializers.ValidationError(
                {"booking_fee_max": "Booking fee max must be greater than or equal to booking fee min."}
            )

        start_date = attrs.get("tour_start_date")
        end_date = attrs.get("tour_end_date")
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"tour_end_date": "Tour end date must be on or after tour start date."}
            )
        return attrs


class PopularArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ('id', 'name', 'profile_image', 'genres', 'rating')

class ArtistBookingSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = ArtistBooking
        fields = ['id', 'artist', 'event', 'date_booked', 'status', 'created_at', 'updated_at']
