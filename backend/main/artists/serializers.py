from rest_framework import serializers
from .models import Artist, ArtistBooking, ArtistPortfolioItem, Follow, ArtistPost


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
            'genres', 'rating', 'booking_fee', 'contact_email', 'phone_number', 'instagram_handle',
            'availability', 'is_popular', 'portfolio_items','created_at', 'updated_at',
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

class PopularArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ('id', 'name', 'profile_image', 'genres', 'rating')

class ArtistBookingSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = ArtistBooking
        fields = ['id', 'artist', 'event', 'start_time', 'end_time', 'status', 'created_at', 'updated_at']