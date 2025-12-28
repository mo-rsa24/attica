from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

# Create your tests here.
from .models import ChatRoom


class ChatRoomAPITests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.organizer = User.objects.create_user(username='org', password='pass', user_type='organizer')
        self.vendor = User.objects.create_user(username='vend', password='pass', user_type='vendor')
        self.client = APIClient()
        self.client.force_authenticate(self.organizer)

    def test_room_creation_idempotent(self):
        payload = {"organizer": self.organizer.id, "vendor": self.vendor.id}
        first = self.client.post('/api/chat/rooms/', payload, format='json')
        self.assertEqual(first.status_code, 200)
        second = self.client.post('/api/chat/rooms/', payload, format='json')
        self.assertEqual(second.status_code, 200)
        self.assertEqual(ChatRoom.objects.count(), 1)