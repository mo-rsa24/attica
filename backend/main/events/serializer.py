from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'user', 'partner_user', 'name', 'date', 'start_time', 'end_time', 'location', 'venue', 'budget', 'guest_count', 'theme', 'notes', 'created_at', 'updated_at']