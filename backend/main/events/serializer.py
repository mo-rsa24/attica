from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'user',
            'partner_user',
            'name',
            'date',
            'start_time',
            'end_time',
            'location',
            'venue',
            'budget',
            'guest_count',
            'theme',
            'notes',
            'image_url',  # Added field
            'category',   # Added field
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)