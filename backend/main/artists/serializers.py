from rest_framework import serializers
from .models import Artist, ArtistBooking

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = [
            'id', 'name', 'bio', 'owner', 'profile_image',
            'genres', 'rating', 'created_at', 'updated_at'
        ]
class PopularArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ('id', 'name', 'profile_image', 'genres', 'rating')

class ArtistBookingSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = ArtistBooking
        fields = ['id', 'artist', 'event', 'start_time', 'end_time', 'status', 'created_at', 'updated_at']