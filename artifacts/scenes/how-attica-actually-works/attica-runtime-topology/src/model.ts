// The one model function for stages 0-3. Imports nothing from React, the
// store, or any component. Every panel in the scene derives from resolve().
// Stage 4 has its own pure function (lifecycle.ts), because order is the
// lesson there and a memoryless resolve() cannot carry it.

export type ProxyPath = 'api' | 'vendors' | 'cart' | 'checkout' | 'ws'
export type BackendMode = 'runserver' | 'daphne'
export type VenvId = 'backend-venv' | 'lobola'
export type DebugConfigId = 'django-runserver' | 'daphne-ws' | 'run-migrations' | 'vite-dev' | 'chrome-debug'
export type CompoundId = 'fullstack-runserver' | 'fullstack-daphne'
export type ConsumerId = 'chat' | 'notifications' | 'locations'
export type ProcessId = 'browser' | 'vite' | 'django' | 'channels' | 'redis'

export interface SceneState {
  viteServerUp: boolean
  proxyRoutes: Record<ProxyPath, boolean>
  redisChannelUp: boolean
  redisCacheUp: boolean
  backendMode: BackendMode
  jwtInterceptorEnabled: boolean
  selectedDebugConfig: DebugConfigId
  selectedVenv: VenvId
  requestLifecyclePlayhead: number
  breakpointsArmed: { frontend: boolean; backend: boolean }
}

export const initialState: SceneState = {
  viteServerUp: true,
  proxyRoutes: { api: true, vendors: true, cart: true, checkout: true, ws: true },
  redisChannelUp: true,
  redisCacheUp: true,
  backendMode: 'daphne',
  jwtInterceptorEnabled: true,
  selectedDebugConfig: 'django-runserver',
  selectedVenv: 'lobola',
  requestLifecyclePlayhead: 0,
  breakpointsArmed: { frontend: false, backend: false },
}

// ---------------------------------------------------------------------------
// Requests: one trace per proxied path, plus the WS path. Every hop is a real
// process this repo actually runs, and the failure string at the hop that
// kills the request is copied from the real tool, never invented.
// ---------------------------------------------------------------------------

export interface Hop {
  process: ProcessId
  label: string
  ok: boolean
}

export interface RequestTrace {
  path: ProxyPath
  kind: 'http' | 'ws'
  /** every process this request actually touches, in order, whether or not it survives */
  hops: Hop[]
  ok: boolean
  failedAt: ProcessId | null
  errorString: string | null
  /** true only when this specific request's failure or success turns on Redis at all */
  redisLoadBearing: boolean
  redisWhich: 'channel-layer' | 'cache' | 'none'
  because: string
}

const PROXY_TARGET = 'http://localhost:8000'

function httpRequestTrace(path: ProxyPath, state: SceneState): RequestTrace {
  const hops: Hop[] = [{ process: 'browser', label: `fetch('/${path}/...')`, ok: true }]

  if (!state.viteServerUp) {
    hops.push({ process: 'vite', label: 'nothing listens on :5173', ok: false })
    return {
      path,
      kind: 'http',
      hops,
      ok: false,
      failedAt: 'vite',
      errorString: 'net::ERR_CONNECTION_REFUSED',
      redisLoadBearing: false,
      redisWhich: 'none',
      because: 'the Vite dev server is not running, so the browser cannot even open the TCP connection the proxy needs.',
    }
  }

  if (!state.proxyRoutes[path]) {
    hops.push({ process: 'vite', label: `up, but no proxy entry for '/${path}'`, ok: false })
    return {
      path,
      kind: 'http',
      hops,
      ok: false,
      failedAt: 'vite',
      errorString: `Unexpected token '<', "<!doctype "... is not valid JSON`,
      redisLoadBearing: false,
      redisWhich: 'none',
      because: `vite.config.js has no proxy rule for '/${path}', so Vite's SPA fallback serves index.html for it, and the fetch's JSON.parse chokes on HTML.`,
    }
  }

  hops.push({ process: 'vite', label: `dev server on :5173, proxied to ${PROXY_TARGET}`, ok: true })
  hops.push({ process: 'django', label: `Django/DRF, mode=${state.backendMode}`, ok: true })

  // django_redis (cache DB 1) is on the path only for permission-gated views;
  // this scene models that as a per-request property of the /cart and /checkout
  // paths, the two that carry a real role check in this codebase's permission
  // classes, grounded in users/utils.py's unguarded cache.get().
  const touchesCache = path === 'cart' || path === 'checkout'
  if (touchesCache) {
    hops.push({ process: 'redis', label: 'cache DB 1: get_user_permissions()', ok: state.redisCacheUp })
    if (!state.redisCacheUp) {
      return {
        path,
        kind: 'http',
        hops,
        ok: false,
        failedAt: 'redis',
        errorString: 'django_redis.exceptions.ConnectionInterrupted: Redis ConnectionError: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
        redisLoadBearing: true,
        redisWhich: 'cache',
        because: `users/utils.py:get_user_permissions() calls cache.get() with no try/except, and this path's permission check runs through it.`,
      }
    }
  }

  return {
    path,
    kind: 'http',
    hops,
    ok: true,
    failedAt: null,
    errorString: null,
    redisLoadBearing: touchesCache,
    redisWhich: touchesCache ? 'cache' : 'none',
    because: touchesCache
      ? 'Vite forwarded it, Django served it, and the permission cache answered from Redis DB 1.'
      : 'Vite forwarded it and Django served it. Nothing on this path touches Redis at all.',
  }
}

function wsRequestTrace(state: SceneState): RequestTrace {
  const hops: Hop[] = [{ process: 'browser', label: `new WebSocket('/ws/chat/rooms/1/')`, ok: true }]

  if (!state.viteServerUp) {
    hops.push({ process: 'vite', label: 'nothing listens on :5173', ok: false })
    return {
      path: 'ws',
      kind: 'ws',
      hops,
      ok: false,
      failedAt: 'vite',
      errorString: 'net::ERR_CONNECTION_REFUSED',
      redisLoadBearing: false,
      redisWhich: 'none',
      because: 'the Vite dev server is not running, so there is no process to open the WebSocket handshake with.',
    }
  }
  if (!state.proxyRoutes.ws) {
    hops.push({ process: 'vite', label: `up, but no proxy entry for '/ws': ws:true never applies`, ok: false })
    return {
      path: 'ws',
      kind: 'ws',
      hops,
      ok: false,
      failedAt: 'vite',
      errorString: `WebSocket connection to 'ws://localhost:5173/ws/chat/rooms/1/' failed: Unexpected response code: 200`,
      redisLoadBearing: false,
      redisWhich: 'none',
      because: `vite.config.js's '/ws' proxy entry (the one with ws:true) is disabled, so Vite answers the upgrade request with a plain HTTP 200 instead of switching protocols.`,
    }
  }
  hops.push({ process: 'vite', label: `dev server on :5173, proxied to ${PROXY_TARGET} with ws:true`, ok: true })

  if (state.backendMode === 'runserver') {
    hops.push({ process: 'django', label: 'plain WSGI runserver: no protocol upgrade support', ok: false })
    return {
      path: 'ws',
      kind: 'ws',
      hops,
      ok: false,
      failedAt: 'django',
      errorString: `WebSocket connection to 'ws://localhost:5173/ws/chat/rooms/1/' failed: Error during WebSocket handshake: Unexpected response code: 500`,
      redisLoadBearing: false,
      redisWhich: 'none',
      because: `INSTALLED_APPS lists 'channels' after 'django.contrib.staticfiles' in settings.py, so Channels' runserver override never triggers; manage.py runserver serves WSGI only and has no code path for a protocol upgrade.`,
    }
  }
  hops.push({ process: 'django', label: 'Daphne: ASGI, ProtocolTypeRouter routes to websocket', ok: true })
  hops.push({ process: 'channels', label: 'WebSocketJWTAuthMiddleware -> ChatConsumer.connect()', ok: true })
  hops.push({ process: 'redis', label: 'channel layer DB 0: group_add()', ok: state.redisChannelUp })

  if (!state.redisChannelUp) {
    return {
      path: 'ws',
      kind: 'ws',
      hops,
      ok: false,
      failedAt: 'redis',
      errorString: 'redis.exceptions.ConnectionError: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
      redisLoadBearing: true,
      redisWhich: 'channel-layer',
      because: 'ChatConsumer.connect() calls self.channel_layer.group_add(), and channels_redis raises when it cannot reach Redis DB 0.',
    }
  }

  return {
    path: 'ws',
    kind: 'ws',
    hops,
    ok: true,
    failedAt: null,
    errorString: null,
    redisLoadBearing: true,
    redisWhich: 'channel-layer',
    because: 'Daphne served the upgrade, the consumer joined its group, and the channel layer is live on Redis DB 0.',
  }
}

export function allRequests(state: SceneState): RequestTrace[] {
  const paths: ProxyPath[] = ['api', 'vendors', 'cart', 'checkout']
  return [...paths.map((p) => httpRequestTrace(p, state)), wsRequestTrace(state)]
}

// ---------------------------------------------------------------------------
// ASGI router: the real consumers wired into main/routing.py, and the one
// that is not. `locations` never becomes reachable no matter what else is
// toggled, which is itself the lesson: it is not a failure the learner can
// cause, it is a gap nobody wired.
// ---------------------------------------------------------------------------

export interface ConsumerStatus {
  id: ConsumerId
  wired: boolean
  liveNow: boolean
  route: string | null
  consumerClass: string | null
  detail: string
}

export function asgiRouterStatus(state: SceneState): ConsumerStatus[] {
  return [
    {
      id: 'chat',
      wired: true,
      liveNow: state.backendMode === 'daphne' && state.redisChannelUp,
      route: 'ws/chat/rooms/(?P<room_id>\\d+)/$',
      consumerClass: 'chat.consumers.ChatConsumer',
      detail: 'imported into main/routing.py via chat_routing.websocket_urlpatterns, live when Daphne is serving and Redis DB 0 is up.',
    },
    {
      id: 'notifications',
      wired: true,
      liveNow: state.backendMode === 'daphne' && state.redisChannelUp,
      route: 'ws/notifications/$',
      consumerClass: 'notifications.consumers.NotificationConsumer',
      detail: 'imported into main/routing.py via notifications_routing.websocket_urlpatterns, same fate as chat.',
    },
    {
      id: 'locations',
      wired: false,
      liveNow: false,
      route: null,
      consumerClass: 'locations.consumers.NotificationConsumer',
      detail: 'the class exists and is a complete, working AsyncWebsocketConsumer, but locations/ has no routing.py and main/routing.py never imports it. No toggle in this scene can make it reachable: this is a gap, not a fault.',
    },
  ]
}

// ---------------------------------------------------------------------------
// vscode-debug-config: whether each of the real launch.json configs would
// actually launch, computed from the real interpreter paths and the current
// venv-binding selection.
// ---------------------------------------------------------------------------

export interface DebugConfigOutcome {
  id: DebugConfigId
  label: string
  interpreter: string | null
  wouldLaunch: boolean
  errorString: string | null
  reason: string
}

const LOBOLA_PY = '/home/molef/lobola/bin/python'
const MIGRATE_PY = '/home/molef/local/bin/python'

export function debugConfigOutcomes(state: SceneState): DebugConfigOutcome[] {
  const pkgReachableFromLobola = state.selectedVenv === 'lobola'

  return [
    {
      id: 'django-runserver',
      label: 'Backend: Django Runserver',
      interpreter: LOBOLA_PY,
      wouldLaunch: true,
      errorString: null,
      reason: pkgReachableFromLobola
        ? `launches with ${LOBOLA_PY}, and a package installed there imports fine.`
        : `launches with ${LOBOLA_PY}, but a package installed only into backend/venv is invisible to it: ModuleNotFoundError.`,
    },
    {
      id: 'daphne-ws',
      label: 'Backend: Daphne Server (WebSockets)',
      interpreter: LOBOLA_PY,
      wouldLaunch: true,
      errorString: null,
      reason: pkgReachableFromLobola
        ? `launches with ${LOBOLA_PY}, and a package installed there imports fine.`
        : `launches with ${LOBOLA_PY}, but a package installed only into backend/venv is invisible to it: ModuleNotFoundError.`,
    },
    {
      id: 'run-migrations',
      label: 'Backend: Run Migrations',
      interpreter: MIGRATE_PY,
      wouldLaunch: false,
      errorString: `/bin/bash: line 1: ${MIGRATE_PY}: No such file or directory`,
      reason: `launch.json points this config at \${env:HOME}/local/bin/python, and that path does not exist on this machine. Nothing about the venv selection changes this: it fails before Python starts.`,
    },
    {
      id: 'vite-dev',
      label: 'Frontend: Vite Dev Server',
      interpreter: null,
      wouldLaunch: state.viteServerUp !== false, // node-launched, not python; only the vite toggle affects it here
      errorString: state.viteServerUp ? null : 'node dev server exits immediately, nothing serves :5173',
      reason: 'launches npm run dev via node, not Python, so venv-binding has no effect on it.',
    },
    {
      id: 'chrome-debug',
      label: 'Frontend: Debug in Chrome',
      interpreter: null,
      wouldLaunch: true,
      errorString: null,
      reason: 'attaches Chrome at http://localhost:5173, independent of every backend toggle.',
    },
  ]
}

export interface CompoundOutcome {
  id: CompoundId
  label: string
  legs: DebugConfigId[]
}

export const COMPOUNDS: CompoundOutcome[] = [
  { id: 'fullstack-runserver', label: 'Full Stack: Backend + Frontend', legs: ['django-runserver', 'vite-dev'] },
  { id: 'fullstack-daphne', label: 'Full Stack: Backend (Daphne) + Frontend', legs: ['daphne-ws', 'vite-dev'] },
]

// ---------------------------------------------------------------------------
// jwt-refresh-interceptor: a fixed scenario (the token has just expired),
// since that is the entire reason the component exists. No extra state
// variable: the scenario is baked into the model, same as the wheels scene
// bakes "a C extension with no matching wheel" into the compiler toggle.
// ---------------------------------------------------------------------------

export interface JwtOutcome {
  scenario: string
  ok: boolean
  errorString: string | null
  because: string
}

export function jwtOutcome(state: SceneState): JwtOutcome {
  if (state.jwtInterceptorEnabled) {
    return {
      scenario: 'an authenticated request fires with an access token that expired 4 seconds ago',
      ok: true,
      errorString: null,
      because: `useAxios.js's request interceptor decodes the token, sees dayjs.unix(exp).diff(dayjs()) < 1, and awaits POST /api/accounts/token/refresh/ before the real request leaves the browser.`,
    }
  }
  return {
    scenario: 'an authenticated request fires with an access token that expired 4 seconds ago',
    ok: false,
    errorString: 'HTTP 401 {"detail":"Given token not valid for any token type","code":"token_not_valid"}',
    because: 'with the interceptor off, the expired Authorization header goes out unchanged and nothing on the frontend retries it.',
  }
}

// ---------------------------------------------------------------------------
// Provenance: why the derived observables have their values, emitted here so
// the "why?" surface never has to invent a causal arrow.
// ---------------------------------------------------------------------------

export interface ProvenanceEntry {
  observable: string
  value: string
  from: string[]
  because: string
}

export interface Outcome {
  requests: RequestTrace[]
  consumers: ConsumerStatus[]
  debugConfigs: DebugConfigOutcome[]
  jwt: JwtOutcome
  provenance: ProvenanceEntry[]
}

export function resolve(state: SceneState): Outcome {
  const requests = allRequests(state)
  const consumers = asgiRouterStatus(state)
  const debugConfigs = debugConfigOutcomes(state)
  const jwt = jwtOutcome(state)

  const wsTrace = requests.find((r) => r.kind === 'ws')!

  const provenance: ProvenanceEntry[] = [
    {
      observable: 'vite reachability',
      value: state.viteServerUp ? 'up' : 'down',
      from: ['vite-dev-server'],
      because: 'every path in this scene is served through the Vite dev server first; nothing downstream matters if it is down.',
    },
    {
      observable: 'http paths',
      value: `${requests.filter((r) => r.kind === 'http' && r.ok).length} of ${requests.filter((r) => r.kind === 'http').length} reachable`,
      from: ['vite-proxy-map', 'redis-cache'],
      because: 'each HTTP path depends on its own proxy entry, and cart/checkout additionally depend on the permission cache.',
    },
    {
      observable: 'ws path',
      value: wsTrace.ok ? 'reachable' : `fails at ${wsTrace.failedAt}`,
      from: ['vite-proxy-map', 'backend-process-mode', 'redis-channel-layer'],
      because: 'the WebSocket path is the only one that runs through all three: the proxy, the ASGI protocol split, and the channel layer.',
    },
    {
      observable: 'asgi router',
      value: `chat=${consumers[0].liveNow ? 'live' : 'down'}, notifications=${consumers[1].liveNow ? 'live' : 'down'}, locations=not wired`,
      from: ['asgi-router', 'backend-process-mode', 'redis-channel-layer'],
      because: 'chat and notifications share the same live-or-down fate as the ws path; locations was never imported into main/routing.py, so it cannot be live regardless.',
    },
  ]

  return { requests, consumers, debugConfigs, jwt, provenance }
}

// ---------------------------------------------------------------------------
// State round trip for deep links and the excursion checks.
// ---------------------------------------------------------------------------

const PATHS: ProxyPath[] = ['api', 'vendors', 'cart', 'checkout', 'ws']

export function encodeState(s: SceneState): string {
  const routes = PATHS.map((p) => (s.proxyRoutes[p] ? '1' : '0')).join('')
  return [
    s.viteServerUp ? '1' : '0',
    routes,
    s.redisChannelUp ? '1' : '0',
    s.redisCacheUp ? '1' : '0',
    s.backendMode,
    s.jwtInterceptorEnabled ? '1' : '0',
    s.selectedVenv,
  ].join('~')
}

export function decodeState(raw: string): SceneState | null {
  const parts = raw.split('~')
  if (parts.length !== 7) return null
  const [vite, routes, channel, cache, mode, jwt, venv] = parts
  if (vite !== '0' && vite !== '1') return null
  if (routes.length !== PATHS.length || !/^[01]+$/.test(routes)) return null
  if (channel !== '0' && channel !== '1') return null
  if (cache !== '0' && cache !== '1') return null
  if (mode !== 'runserver' && mode !== 'daphne') return null
  if (jwt !== '0' && jwt !== '1') return null
  if (venv !== 'backend-venv' && venv !== 'lobola') return null
  const proxyRoutes = {} as Record<ProxyPath, boolean>
  PATHS.forEach((p, i) => (proxyRoutes[p] = routes[i] === '1'))
  return {
    viteServerUp: vite === '1',
    proxyRoutes,
    redisChannelUp: channel === '1',
    redisCacheUp: cache === '1',
    backendMode: mode as BackendMode,
    jwtInterceptorEnabled: jwt === '1',
    selectedDebugConfig: 'django-runserver',
    selectedVenv: venv as VenvId,
    requestLifecyclePlayhead: 0,
    breakpointsArmed: { frontend: false, backend: false },
  }
}

/** Stage 0's race: the four-process split against a hypothetical single-process MVC. */
export function stage0Race(state: SceneState) {
  const split = resolve(state)
  return { split, wsTrace: split.requests.find((r) => r.kind === 'ws')! }
}
