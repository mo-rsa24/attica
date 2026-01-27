import json
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for real-time notifications."""

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or isinstance(self.user, AnonymousUser):
            await self.close(code=4401)
            return

        self.group_name = f'notifications_{self.user.id}'

        try:
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
        except Exception as exc:
            logger.warning(f'Failed to join notification group: {exc}')
            await self.close(code=4500)
            return

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
                )
            except Exception:
                pass

    async def notification_new(self, event):
        """Handle new notification broadcast."""
        await self.send_json({
            'type': 'notification',
            'notification': event['notification']
        })
