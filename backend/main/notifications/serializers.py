from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    deep_link = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'sender_username',
            'notification_type',
            'title',
            'message',
            'link_type',
            'link_id',
            'deep_link',
            'data',
            'is_read',
            'read_at',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_deep_link(self, obj):
        if obj.link_type == 'chat' and obj.link_id:
            return f'/dm/{obj.link_id}'
        elif obj.link_type == 'booking' and obj.link_id:
            return f'/bookings/{obj.link_id}'
        return None
