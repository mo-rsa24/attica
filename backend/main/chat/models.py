from django.db import models
from users.models import CustomUser
from django.utils import timezone


class ChatRoom(models.Model):
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_organizer')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_vendor')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['organizer', 'vendor'], name='unique_room_per_pair'),
        ]

    def __str__(self) -> str:
        return f"Room {self.pk}: {self.organizer_id} <> {self.vendor_id}"


class ChatAttachment(models.Model):
    file = models.FileField(upload_to='chat_attachments/')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_attachments')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_name = models.CharField(max_length=255, blank=True)
    size = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.original_name or f"Attachment {self.pk}"


class ChatBid(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        COUNTERED = 'countered', 'Countered'

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='bids')
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bids_made')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bids_received')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default='USD')
    tier = models.CharField(max_length=64, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    counter_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    idempotency_key = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['organizer', 'vendor', 'idempotency_key'], name='unique_bid_idempotency'),
        ]

    def __str__(self):
        return f"Bid {self.pk} {self.organizer_id}->{self.vendor_id} {self.amount} {self.currency}"

class Message(models.Model):
    class MessageType(models.TextChoices):
        TEXT = 'text', 'Text'
        SYSTEM = 'system', 'System'
        BID = 'bid', 'Bid'
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(blank=True, null=True)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    message_type = models.CharField(max_length=16, choices=MessageType.choices, default=MessageType.TEXT)
    bid = models.ForeignKey(ChatBid, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    delivered_at = models.DateTimeField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    attachments = models.ManyToManyField(ChatAttachment, related_name='messages', blank=True)

    def mark_delivered(self):
        if not self.delivered_at:
            self.delivered_at = timezone.now()
            self.save(update_fields=['delivered_at'])

    def mark_read(self):
        if not self.read_at:
            self.read_at = timezone.now()
            self.save(update_fields=['read_at'])

    def __str__(self):
        return f"Message {self.pk} in room {self.room_id}"