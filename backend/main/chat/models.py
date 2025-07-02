from django.db import models
from users.models import CustomUser


class ChatRoom(models.Model):
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_organizer')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_vendor')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(blank=True, null=True)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
