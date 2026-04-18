from rest_framework import serializers
from .models import Artist, ArtistBooking, ArtistPortfolioItem, Follow, ArtistPost
import json

DEFAULT_PROFILE_PICTURE_NAMES = {
    "default_profile.jpg",
    "default_profile.jpeg",
    "default_profile.png",
}


def _is_placeholder_profile_image(image_field):
    if not image_field:
        return True
    name = (getattr(image_field, "name", "") or "").split("?")[0]
    file_name = name.split("/")[-1].lower()
    return file_name in DEFAULT_PROFILE_PICTURE_NAMES


def _to_media_url(image_field, request):
    if not image_field:
        return None
    try:
        url = image_field.url
    except Exception:
        return None
    return request.build_absolute_uri(url) if request else url


class ArtistPortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistPortfolioItem
        fields = ['id', 'image', 'caption', 'created_at']

class ArtistSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
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

    def get_profile_image(self, obj):
        request = self.context.get("request")
        artist_image = getattr(obj, "profile_image", None)
        user_image = getattr(getattr(obj, "user", None), "profile_picture", None)

        # Prefer a non-placeholder account avatar, then artist image, then any account avatar.
        if user_image and not _is_placeholder_profile_image(user_image):
            return _to_media_url(user_image, request)
        if artist_image:
            return _to_media_url(artist_image, request)
        return _to_media_url(user_image, request)

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
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ('id', 'name', 'profile_image', 'genres', 'rating')

    def get_profile_image(self, obj):
        request = self.context.get("request")
        artist_image = getattr(obj, "profile_image", None)
        user_image = getattr(getattr(obj, "user", None), "profile_picture", None)

        if user_image and not _is_placeholder_profile_image(user_image):
            return _to_media_url(user_image, request)
        if artist_image:
            return _to_media_url(artist_image, request)
        return _to_media_url(user_image, request)

class ArtistBookingSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = ArtistBooking
        fields = ['id', 'artist', 'event', 'date_booked', 'status', 'created_at', 'updated_at']
