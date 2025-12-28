import json
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

from .models import ChatRoom, Message
from .serializers import MessageSerializer

User = get_user_model()


@database_sync_to_async
def _get_user_from_token(token):
    try:
        UntypedToken(token)
    except (InvalidToken, TokenError):
        return AnonymousUser()
    try:
        validated = UntypedToken(token)
        user_id = validated.get('user_id')
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class WebSocketJWTAuthMiddleware:
    """
    Simple middleware that accepts ?token= or header Authorization: Bearer <token>.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = None
        if 'token' in params:
            token = params.get('token')[0]
        else:
            headers = dict(scope.get('headers', []))
            auth_header = headers.get(b'authorization')
            if auth_header:
                token = auth_header.decode().split('Bearer ')[-1]
        scope['user'] = await _get_user_from_token(token) if token else AnonymousUser()
        return await self.inner(scope, receive, send)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        if not self.scope['user'] or self.scope['user'].is_anonymous:
            await self.close(code=4401)
            return
        if not await self._user_in_room():
            await self.close(code=4403)
            return
        self.room_group_name = f"chat_room_{self.room_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        if message_type == 'send_message':
            await self._handle_send(content)
        elif message_type == 'typing':
            await self._broadcast({'type': 'typing', 'user': self.scope['user'].username})
        elif message_type == 'read_receipt':
            await self._handle_read(content)

    async def _handle_send(self, content):
        text = content.get('text', '')
        payload = {
            'room': self.room_id,
            'sender': self.scope['user'].id,
            'text': text,
        }
        serializer = MessageSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        message = await database_sync_to_async(serializer.save)()
        await database_sync_to_async(Message.objects.filter(id=message.id).update)(delivered_at=timezone.now())
        await self._broadcast({'type': 'message', 'message': MessageSerializer(message).data})

    async def _handle_read(self, content):
        message_id = content.get('message_id')
        if not message_id:
            return
        now = timezone.now()
        await database_sync_to_async(Message.objects.filter(id=message_id, room_id=self.room_id).update)(read_at=now)
        await self._broadcast({'type': 'read_receipt', 'message_id': message_id, 'read_at': now.isoformat()})

    async def _broadcast(self, payload):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.event',
                'payload': payload,
            },
        )

    async def chat_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))

    @database_sync_to_async
    def _user_in_room(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
        except ChatRoom.DoesNotExist:
            return False
        return self.scope['user'] in [room.organizer, room.vendor]