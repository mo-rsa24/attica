// Real file content, embedded verbatim, re-read against the live repository
// the day this scene was built. Nothing here is paraphrased: what the
// inspector shows is what `cat` would show.

export const LAUNCH_JSON = `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Backend: Django Runserver",
            "type": "debugpy",
            "request": "launch",
            "program": "\${workspaceFolder}/backend/main/manage.py",
            "args": ["runserver", "localhost:8000"],
            "django": true,
            "python": "/home/molef/lobola/bin/python",
            "cwd": "\${workspaceFolder}/backend/main",
            "env": {
                "PYTHONUNBUFFERED": "1"
            },
            "autoStartBrowser": false,
            "console": "integratedTerminal"
        },
        {
            "name": "Backend: Daphne Server (WebSockets)",
            "type": "debugpy",
            "request": "launch",
            "module": "daphne",
            "args": ["-b", "0.0.0.0", "-p", "8000", "main.asgi:application"],
            "python": "/home/molef/lobola/bin/python",
            "cwd": "\${workspaceFolder}/backend/main",
            "env": {
                "PYTHONUNBUFFERED": "1"
            },
            "autoStartBrowser": false,
            "console": "integratedTerminal"
        },
        {
            "name": "Backend: Run Migrations",
            "type": "debugpy",
            "request": "launch",
            "program": "\${workspaceFolder}/backend/main/manage.py",
            "args": ["migrate"],
            "python": "\${env:HOME}/local/bin/python",
            "cwd": "\${workspaceFolder}/backend/main",
            "console": "integratedTerminal"
        },
        {
            "name": "Frontend: Vite Dev Server",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "dev"],
            "cwd": "\${workspaceFolder}/frontend",
            "console": "integratedTerminal",
            "skipFiles": ["<node_internals>/**"]
        },
        {
            "name": "Frontend: Debug in Chrome",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:5173",
            "webRoot": "\${workspaceFolder}/frontend/src",
            "sourceMaps": true
        }
    ],
    "compounds": [
        {
            "name": "Full Stack: Backend + Frontend",
            "configurations": [
                "Backend: Django Runserver",
                "Frontend: Vite Dev Server"
            ],
            "stopAll": true
        },
        {
            "name": "Full Stack: Backend (Daphne) + Frontend",
            "configurations": [
                "Backend: Daphne Server (WebSockets)",
                "Frontend: Vite Dev Server"
            ],
            "stopAll": true
        }
    ]
}`

export const ASGI_PY = `"""
ASGI config for main project.

It exposes the ASGI callable as a module-level variable named \`\`application\`\`.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from .routing import application`

export const ROUTING_PY = `from channels.auth import AuthMiddlewareStack
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
})`

export const VITE_CONFIG_JS = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
})`

export const SETTINGS_CHANNEL_LAYERS = `CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}`

export const SETTINGS_CACHES = `CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",  # Use a different DB for caching
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
USER_PERMISSIONS_CACHE_TIMEOUT = 60 * 15`

export const SETTINGS_INSTALLED_APPS = `INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'django_extensions',
    'events.apps.EventsConfig',
    'vendors.apps.VendorsConfig',
    'cart.apps.CartConfig',
    'chat.apps.ChatConfig',
    'users.apps.UsersConfig',
    'checkout.apps.CheckoutConfig',
    'artists.apps.ArtistsConfig',
    'locations.apps.LocationsConfig',
    'tickets.apps.TicketsConfig',
    'notifications.apps.NotificationsConfig',
    'scheduling.apps.SchedulingConfig',
    'rest_framework',
    'corsheaders',
    'django_filters'
]`

export const WS_JWT_MIDDLEWARE_PY = `class WebSocketJWTAuthMiddleware:
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
        return await self.inner(scope, receive, send)`

export const CHAT_ROUTING_PY = `from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/rooms/(?P<room_id>\\d+)/$', consumers.ChatConsumer.as_asgi()),
]`

export const NOTIFICATIONS_ROUTING_PY = `from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]`

export const LOCATIONS_CONSUMERS_PY = `# backend/main/locations/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'notifications'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))`

export const USE_AXIOS_INTERCEPTOR_JS = `        instance.interceptors.request.use(async req => {
            if (!tokens) {
                console.warn('No tokens. Skipping request.');
                return req;
            }
            const decodedAccessToken = jwtDecode(tokens.access);
            const isExpired = dayjs.unix(decodedAccessToken.exp).diff(dayjs()) < 1;

            if (!isExpired) return req;

            if (refreshAttemptedRef.current) {
                console.error('Refresh already attempted. Skipping further retries.');
                return req;
            }
            refreshAttemptedRef.current = true;

            try {
                const response = await axios.post(\`\${baseURL}/api/accounts/token/refresh/\`, {
                    refresh: tokens.refresh
                });
                localStorage.setItem('tokens', JSON.stringify({...tokens, access: response.data.access}));
                setTokens(prev => ({...prev, access: response.data.access}));
                req.headers.Authorization = \`Bearer \${response.data.access}\`;
            } catch (err) {
                console.error('Failed to refresh token in useAxios:', err);
            }
            return req;
        });`

export const GET_USER_PERMISSIONS_PY = `def get_user_permissions(user: CustomUser):
    """
    Retrieves all permissions for a given user, utilizing a cache
    to improve performance.
    """
    cache_key = f"user_{user.id}_permissions"
    permissions = cache.get(cache_key)

    if permissions is None:
        # If permissions are not in the cache, fetch from the database
        permissions = set()
        for role in user.roles.all():
            for perm in role.permissions.all():
                permissions.add(perm.codename)
        for perm in user.user_permissions.all():
            permissions.add(perm.codename)

        # Store the permissions in the cache
        cache.set(cache_key, permissions, timeout=settings.USER_PERMISSIONS_CACHE_TIMEOUT)

    return permissions`
