// Verbatim excerpts from Attica. Nothing here is paraphrased or tidied: if a
// line looks odd, it looks odd in the repository too.
//
// `firstLine` is the real line number the excerpt starts at, so the gutter
// matches what you see when you open the file.

import type { SlotId } from './model'

export interface Snippet {
  id: string
  file: string
  firstLine: number
  lang: 'python' | 'javascript'
  text: string
}

export const SNIPPETS: Record<string, Snippet> = {
  routing: {
    id: 'routing',
    file: 'backend/main/main/routing.py',
    firstLine: 1,
    lang: 'python',
    text: `from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from chat import routing as chat_routing
from chat.consumers import WebSocketJWTAuthMiddleware
from notifications import routing as notifications_routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": WebSocketJWTAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                chat_routing.websocket_urlpatterns +
                notifications_routing.websocket_urlpatterns
            )
        )
    ),
})`,
  },

  view: {
    id: 'view',
    file: 'backend/main/chat/views.py',
    firstLine: 125,
    lang: 'python',
    text: `    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        payload = request.data.copy()
        payload['room'] = room.id
        payload['sender'] = request.user.id
        serializer = MessageSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        Message.objects.filter(id=message.id).update(delivered_at=timezone.now())
        message.refresh_from_db()
        ChatRoom.objects.filter(id=room.id).update(updated_at=message.created_at)
        serialized = MessageSerializer(message).data
        broadcast_room_event(room.id, {"type": "message", "message": serialized})
        # Send notification to the other participant
        notify_new_message(room, request.user, message.text or '')
        return Response(serialized, status=status.HTTP_201_CREATED)`,
  },

  broadcast: {
    id: 'broadcast',
    file: 'backend/main/chat/utils.py',
    firstLine: 10,
    lang: 'python',
    text: `def _safe_group_send(channel_layer: BaseChannelLayer, group_name: str, payload: Dict[str, Any]) -> None:
    """Attempt to send to a group but swallow channel-layer errors.

    If Redis or the configured channel layer is unavailable, we log the failure
    and return without raising so that REST/API handlers can continue and the
    message remains persisted in the database.
    """
    try:
        async_to_sync(channel_layer.group_send)(group_name, payload)
    except Exception as exc:  # pragma: no cover - defensive safety
        logger.warning("Chat broadcast skipped: %s", exc)


def broadcast_room_event(room_id: int, payload: dict) -> None:
    """Send a payload to all websocket subscribers for the given room."""

    channel_layer: Optional[BaseChannelLayer] = get_channel_layer()
    if not channel_layer:
        logger.info("Chat broadcast skipped: no channel layer configured")
        return
    _safe_group_send(
        channel_layer,
        f"chat_room_{room_id}",
        {
            "type": "chat.event",
            "payload": payload,
        },
    )`,
  },

  consumer: {
    id: 'consumer',
    file: 'backend/main/chat/consumers.py',
    firstLine: 56,
    lang: 'python',
    text: `    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        self.broadcast_enabled = True
        if not self.scope['user'] or self.scope['user'].is_anonymous:
            await self.close(code=4401)
            return
        if not await self._user_in_room():
            await self.close(code=4403)
            return
        self.room_group_name = f"chat_room_{self.room_id}"
        if not self.channel_layer:
            self.broadcast_enabled = False
            logger.warning("No channel layer configured; realtime disabled for room %s", self.room_id)
        else:
            try:
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Failed to join chat group %s: %s", self.room_group_name, exc)
                self.broadcast_enabled = False
        await self.accept()
        if not self.broadcast_enabled:
            await self.send_json(
                {"type": "warning", "detail": "Realtime updates unavailable; refresh to see new messages."})`,
  },

  dispatch: {
    id: 'dispatch',
    file: 'backend/main/chat/consumers.py',
    firstLine: 137,
    lang: 'python',
    text: `    async def chat_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))`,
  },

  merge: {
    id: 'merge',
    file: 'frontend/src/pages/DirectMessagePage.jsx',
    firstLine: 126,
    lang: 'javascript',
    text: `    const appendMessages = useCallback((incoming = []) => {
        setMessages((prev) => {
            const byId = new Map(prev.map((m) => [m.id, m]));
            incoming.forEach((msg) => {
                if (msg?.id) {
                    byId.set(msg.id, {...(byId.get(msg.id) || {}), ...msg});
                }
            });
            const merged = Array.from(byId.values());
            merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            return merged;
        });
    }, []);`,
  },

  poll: {
    id: 'poll',
    file: 'frontend/src/pages/DirectMessagePage.jsx',
    firstLine: 258,
    lang: 'javascript',
    text: `    useEffect(() => {
        if (!socketError) return undefined;
        const interval = setInterval(() => {
            fetchMessages();
        }, 8000);
        return () => clearInterval(interval);
    }, [fetchMessages, socketError]);`,
  },

  proxy: {
    id: 'proxy',
    file: 'frontend/vite.config.js',
    firstLine: 4,
    lang: 'javascript',
    text: `export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws', // or 'wss' for secure dev servers
    },
    watch: {
      usePolling: true,  // Try this for WSL2 or Docker environments
    },
    proxy: {
      '/api': 'http://localhost:8000',
      '/vendors': 'http://localhost:8000',
      '/cart': 'http://localhost:8000',
      '/checkout': 'http://localhost:8000',
      '/ws': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
})`,
  },

  layers: {
    id: 'layers',
    file: 'backend/main/main/settings.py',
    firstLine: 90,
    lang: 'python',
    text: `ASGI_APPLICATION = 'main.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}`,
  },

  middleware: {
    id: 'middleware',
    file: 'backend/main/chat/consumers.py',
    firstLine: 32,
    lang: 'python',
    text: `class WebSocketJWTAuthMiddleware:
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
        return await self.inner(scope, receive, send)`,
  },

  socket: {
    id: 'socket',
    file: 'frontend/src/pages/DirectMessagePage.jsx',
    firstLine: 120,
    lang: 'javascript',
    text: `    const wsUrl = useMemo(() => {
        if (!roomId) return null;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return \`\${protocol}://\${window.location.host}/ws/chat/rooms/\${roomId}/?token=\${tokens?.access || ''}\`;
    }, [roomId, tokens]);`,
  },
}

/** Which snippet, and which real line, the given lifecycle slot is executing.
 *  One index drives both the timeline and the code: this is the linked view. */
export const SLOT_CODE: Record<SlotId, { snippet: string; line: number } | null> = {
  compose: { snippet: 'socket', line: 123 },
  'proxy-http': { snippet: 'proxy', line: 15 },
  authz: { snippet: 'view', line: 127 },
  'db-insert': { snippet: 'view', line: 134 },
  'db-delivered': { snippet: 'view', line: 135 },
  serialize: { snippet: 'view', line: 138 },
  broadcast: { snippet: 'broadcast', line: 26 },
  'group-send': { snippet: 'broadcast', line: 18 },
  fanout: { snippet: 'layers', line: 94 },
  'consumer-send': { snippet: 'dispatch', line: 138 },
  'client-merge': { snippet: 'merge', line: 135 },
  notify: { snippet: 'view', line: 141 },
  'http-201': { snippet: 'view', line: 142 },
  'poll-tick': { snippet: 'poll', line: 260 },
}
