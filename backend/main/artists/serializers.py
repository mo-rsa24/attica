from rest_framework import serializers
from .models import Artist, ArtistBooking

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'owner', 'created_at', 'updated_at']

class ArtistBookingSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = ArtistBooking
        fields = ['id', 'artist', 'event', 'start_time', 'end_time', 'status', 'created_at', 'updated_at']