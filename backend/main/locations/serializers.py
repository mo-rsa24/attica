from rest_framework import serializers

from events.models import Event
from .models import Location, VenueBooking

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name','address','capacity','is_approved',
                  'venue_count', 'image', 'image_url', 'created_at', 'updated_at']

class PopularVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'name', 'image', 'venue_count')

class VenueBookingSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = VenueBooking
        fields = ['id', 'location', 'event', 'status', 'created_at', 'updated_at']