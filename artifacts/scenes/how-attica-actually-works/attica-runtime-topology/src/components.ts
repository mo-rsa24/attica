// The component registry. Single source for the parts list. The topology
// diagram, the inspector, and the tour generator all render from this.

export const STAGES = ['0. the problem', '1. minimal version', '2. the mechanism', '3. failure modes', '4. build it']

export type Kind = 'toggle' | 'select' | 'parameterize' | 'inspect'

export interface ComponentSpec {
  id: string
  label: string
  kind: Kind
  what: string
  affects: string[]
  /** 'breaks' means a real error is reachable; 'changes' means a legal other outcome; 'gap' means it cannot be fixed by any toggle in this scene */
  effect: 'breaks' | 'changes' | 'gap'
  breaks: string
  real: string
  stage: number
  options?: string[]
}

export const REGISTRY: ComponentSpec[] = [
  {
    id: 'vite-dev-server',
    label: 'Vite dev server',
    kind: 'toggle',
    what: 'the process on :5173 that serves the React app and proxies everything else. Every path in this scene passes through it first.',
    affects: ['every proxied path', 'ws upgrade'],
    effect: 'breaks',
    breaks: 'off: nothing listens on :5173, and no other toggle in the scene matters until this is back on',
    real: 'net::ERR_CONNECTION_REFUSED',
    stage: 0,
  },
  {
    id: 'vite-proxy-map',
    label: 'Vite proxy map',
    kind: 'parameterize',
    what: "vite.config.js's server.proxy object: one entry per path (api, vendors, cart, checkout, ws). Each entry is independent; disabling one leaves the other four untouched.",
    affects: ['which paths reach Django at all'],
    effect: 'breaks',
    breaks: 'disable one path\'s entry: that path 404s from the browser even though Django on :8000 is completely healthy',
    real: `Unexpected token '<', "<!doctype "... is not valid JSON`,
    stage: 0,
    options: ['api', 'vendors', 'cart', 'checkout', 'ws'],
  },
  {
    id: 'redis-channel-layer',
    label: 'Redis: channel layer (DB 0)',
    kind: 'toggle',
    what: "channels_redis's RedisChannelLayer, configured in settings.py's CHANNEL_LAYERS to 127.0.0.1:6379 with no explicit db index, which channels_redis defaults to DB 0. Every WebSocket group_add/group_send goes through it.",
    affects: ['chat delivery', 'notifications delivery', 'ws upgrade'],
    effect: 'breaks',
    breaks: 'off: channels_redis raises on connect; chat and notifications stop delivering; every REST path is unaffected',
    real: 'redis.exceptions.ConnectionError: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
    stage: 0,
  },
  {
    id: 'redis-cache',
    label: 'Redis: cache (DB 1)',
    kind: 'toggle',
    what: "django_redis's cache backend, configured to redis://127.0.0.1:6379/1, a different logical database on the same Redis process as the channel layer. users/utils.py's get_user_permissions() calls cache.get()/cache.set() with no error handling.",
    affects: ['permission-gated requests (cart, checkout)'],
    effect: 'breaks',
    breaks: 'off: django_redis raises on the next cache access, independent of the channel-layer toggle even though it is the same Redis instance',
    real: 'django_redis.exceptions.ConnectionInterrupted: Redis ConnectionError: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
    stage: 0,
  },
  {
    id: 'backend-process-mode',
    label: 'Backend process: runserver or Daphne',
    kind: 'select',
    what: "which process is actually serving :8000. 'channels' is installed after 'django.contrib.staticfiles' in INSTALLED_APPS, so Channels' own runserver override never triggers: manage.py runserver here is plain WSGI.",
    affects: ['ws upgrade', 'chat and notifications liveness'],
    effect: 'breaks',
    breaks: 'runserver: the WS upgrade gets a real protocol-mismatch failure. daphne: both HTTP and WebSocket are served',
    real: 'Error during WebSocket handshake: Unexpected response code: 500',
    stage: 0,
    options: ['runserver', 'daphne'],
  },
  {
    id: 'asgi-router',
    label: 'ASGI router (main/routing.py)',
    kind: 'inspect',
    what: 'the ProtocolTypeRouter that splits http from websocket, and the URLRouter inside it that maps a websocket path to a consumer class. chat and notifications are both imported and concatenated into its urlpatterns.',
    affects: ['which consumer answers a given ws path'],
    effect: 'gap',
    breaks: "locations is not a toggle with an effect here: it opens routing.py's real import list and shows the module is simply absent",
    real: 'locations/consumers.py defines a complete NotificationConsumer; locations/routing.py does not exist, and main/routing.py never imports it',
    stage: 2,
    options: ['chat', 'notifications', 'locations'],
  },
  {
    id: 'jwt-refresh-interceptor',
    label: 'JWT refresh interceptor',
    kind: 'toggle',
    what: "useAxios.js's request interceptor: before every request it decodes the access token and checks dayjs.unix(exp).diff(dayjs()) < 1. If the token is about to expire, it awaits a refresh call first.",
    affects: ['every authenticated request, once the token is stale'],
    effect: 'breaks',
    breaks: 'off: an expired-token request goes out unchanged and returns a real 401, and nothing retries it',
    real: '{"detail":"Given token not valid for any token type","code":"token_not_valid"}',
    stage: 1,
  },
  {
    id: 'vscode-debug-config',
    label: 'VS Code debug configs',
    kind: 'select',
    what: "the five configurations in .vscode/launch.json: Django Runserver, Daphne WS, Run Migrations, Vite Dev Server, Chrome Debug. Inspecting one shows its real JSON block.",
    affects: ['what actually launches when you press F5'],
    effect: 'breaks',
    breaks: '"Run Migrations" points its python field at ${env:HOME}/local/bin/python, which does not exist on disk, so launching it fails before Python even starts',
    real: '/bin/bash: line 1: /home/molef/local/bin/python: No such file or directory',
    stage: 3,
    options: ['django-runserver', 'daphne-ws', 'run-migrations', 'vite-dev', 'chrome-debug'],
  },
  {
    id: 'debug-compound',
    label: 'Debug compounds',
    kind: 'select',
    what: 'launch.json\'s two "compounds" entries, each naming exactly two configurations to launch together.',
    affects: ['what F5 launches when a compound is selected'],
    effect: 'gap',
    breaks: 'attempting to add a Chrome-debug leg is refused: neither compound includes it today, and this scene will not silently pretend one does',
    real: '"Full Stack: Backend + Frontend" = [Django Runserver, Vite Dev Server]; "Full Stack: Backend (Daphne) + Frontend" = [Daphne Server, Vite Dev Server]',
    stage: 3,
    options: ['fullstack-runserver', 'fullstack-daphne'],
  },
  {
    id: 'venv-binding',
    label: 'Which venv actually runs',
    kind: 'select',
    what: 'CLAUDE.md documents backend/venv/ as the project virtualenv, but both Python debug configs hardcode "python": "/home/molef/lobola/bin/python", a different interpreter entirely.',
    affects: ['whether a pip-installed package is importable when a debug config launches'],
    effect: 'breaks',
    breaks: 'install a package into backend/venv only, then launch a debug config: it is unavailable, because the config actually resolves against the lobola interpreter',
    real: 'ModuleNotFoundError: No module named \'<package>\'',
    stage: 3,
    options: ['backend-venv', 'lobola'],
  },
]

export function findComponent(id: string): ComponentSpec | undefined {
  return REGISTRY.find((c) => c.id === id)
}
