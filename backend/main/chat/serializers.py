from rest_framework import serializers
from django.utils import timezone
from .models import Booking, ChatAttachment, ChatBid, ChatRoom, Message, ProviderAvailability


class ChatAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatAttachment
        fields = ['id', 'file', 'original_name', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'size']

class ChatBidSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    room_id = serializers.IntegerField(source='room.id', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)

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
            'event',
            'event_name',
            'provider_type',
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

class MessageSerializer(serializers.ModelSerializer):
    attachments = ChatAttachmentSerializer(many=True, read_only=True)
    attachment_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=ChatAttachment.objects.all(),
        required=False,
        source='attachments',
    )
    bid_details = ChatBidSerializer(read_only=True, source='bid')
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
            'bid_details',
            'attachment_ids',
            'delivered_at',
            'read_at',
            'created_at',
            'attachments',
        ]
        read_only_fields = ['id', 'delivered_at', 'read_at', 'created_at']

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        validated_data.setdefault('created_at', timezone.now())
        message = super().create(validated_data)
        if attachments:
            message.attachments.set(attachments)
        return message

    def validate(self, attrs):
        attachments = attrs.get('attachments') or []
        room = attrs.get('room')
        if attachments and room:
            for attachment in attachments:
                if attachment.room_id != room.id:
                    raise serializers.ValidationError("Attachments must belong to the same room.")
        return attrs

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    vendor_username = serializers.CharField(source='vendor.username', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'organizer',
            'organizer_username',
            'vendor',
            'vendor_username',
            'event',
            'event_name',
            'created_at',
            'updated_at',
            'messages',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    provider_username = serializers.CharField(source='provider.username', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    chatroom_id = serializers.IntegerField(source='chatroom.id', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'event',
            'event_name',
            'event_date',
            'organizer',
            'organizer_username',
            'provider',
            'provider_username',
            'provider_type',
            'provider_entity_id',
            'chatroom',
            'chatroom_id',
            'status',
            'bid_amount',
            'final_amount',
            'currency',
            'proposed_date',
            'proposed_start_time',
            'proposed_end_time',
            'notes',
            'accepted_bid',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'organizer', 'status', 'final_amount',
            'accepted_bid', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        organizer = self.context['request'].user
        provider = attrs.get('provider')
        if organizer == provider:
            raise serializers.ValidationError("Cannot create a booking with yourself.")
        return attrs


class ProviderAvailabilitySerializer(serializers.ModelSerializer):
    provider_username = serializers.CharField(source='provider.username', read_only=True)
    booking_event = serializers.CharField(source='booking.event.name', read_only=True)

    class Meta:
        model = ProviderAvailability
        fields = [
            'id',
            'provider',
            'provider_username',
            'date',
            'booking',
            'booking_event',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

