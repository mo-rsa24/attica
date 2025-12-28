from rest_framework import serializers
from django.utils import timezone
from .models import ChatAttachment, ChatBid, ChatRoom, Message


class ChatAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatAttachment
        fields = ['id', 'file', 'original_name', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'size']


class MessageSerializer(serializers.ModelSerializer):
    attachments = ChatAttachmentSerializer(many=True, read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'room',
            'sender',
            'sender_username',
            'text',
            'tip_amount',
            'message_type',
            'bid',
            'delivered_at',
            'read_at',
            'created_at',
            'attachments',
        ]
        read_only_fields = ['id', 'delivered_at', 'read_at', 'created_at']

    def create(self, validated_data):
        validated_data.setdefault('created_at', timezone.now())
        return super().create(validated_data)

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'organizer',
            'organizer_username',
            'vendor',
            'vendor_username',
            'created_at',
            'updated_at',
            'messages',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChatBidSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    room_id = serializers.IntegerField(source='room.id', read_only=True)

    class Meta:
        model = ChatBid
        fields = [
            'id',
            'room',
            'room_id',
            'organizer',
            'organizer_username',
            'vendor',
            'vendor_username',
            'amount',
            'currency',
            'tier',
            'notes',
            'status',
            'counter_amount',
            'idempotency_key',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate(self, attrs):
        organizer = attrs.get('organizer')
        vendor = attrs.get('vendor')
        if organizer == vendor:
            raise serializers.ValidationError("Organizer and vendor must be different users.")
        return attrs