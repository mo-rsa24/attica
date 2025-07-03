from rest_framework import serializers
from .models import Venue, VenueBooking

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'name', 'address', 'capacity', 'owner', 'is_approved', 'created_at']

class VenueBookingSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = VenueBooking
        fields = ['id', 'venue', 'event', 'status', 'created_at']