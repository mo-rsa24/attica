from rest_framework import serializers

from locations.serializers import VenueSerializer
from tickets.serializers import TicketSerializer
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'user',
            'partner_user',
            'organizer',
            'location',
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
            'updated_at'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

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