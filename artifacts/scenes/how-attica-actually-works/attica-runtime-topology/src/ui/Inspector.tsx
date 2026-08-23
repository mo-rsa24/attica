// Inspect: what it is, what it affects, the real artifact behind it, and its
// live contribution to the current outcome, plus the toggle itself when the
// clicked thing renders a state variable. Anchored to the click that opened
// it (workspace.md), never a fixed sidebar panel.

import { EDGES, nodeOf, type EdgeId } from '../atlas'
import {
  ASGI_PY,
  CHAT_ROUTING_PY,
  GET_USER_PERMISSIONS_PY,
  LOCATIONS_CONSUMERS_PY,
  NOTIFICATIONS_ROUTING_PY,
  ROUTING_PY,
  SETTINGS_CACHES,
  SETTINGS_CHANNEL_LAYERS,
  VITE_CONFIG_JS,
  WS_JWT_MIDDLEWARE_PY,
} from '../artifacts'
import { findComponent } from '../components'
import { asgiRouterStatus, resolve, type ProcessId, type ProxyPath, type SceneState } from '../model'
import { useStore } from '../store'
import { CodeBlock } from './CodeBlock'
import { Popover } from './Popover'

const HTTP_PATHS: ProxyPath[] = ['api', 'vendors', 'cart', 'checkout']

export function Inspector({ state }: { state: SceneState }) {
  const s = useStore()
  if (!s.popover) return null
  const { id, kind, x, y } = s.popover

  return (
    <Popover x={x} y={y} onClose={s.closePopover} width={360}>
      {kind === 'node' && <NodeDetail id={id as ProcessId} state={state} />}
      {kind === 'edge' && <EdgeDetail id={id as EdgeId} state={state} />}
      {kind === 'component' && <ComponentDetail id={id} state={state} />}
    </Popover>
  )
}

function NodeDetail({ id, state }: { id: ProcessId; state: SceneState }) {
  const s = useStore()
  const node = nodeOf(id)

  if (id === 'browser') {
    return (
      <div>
        <strong>{node.label}</strong>
        <p>The one origin the reader actually loads: http://localhost:5173. Every request in this scene starts here.</p>
      </div>
    )
  }
  if (id === 'vite') {
    return (
      <div>
        <strong>{node.label}</strong>
        <p>Serves the React app and proxies everything it does not own itself. If this process is not running, nothing else in the scene can matter yet.</p>
        <label className="switch">
          <input type="checkbox" checked={state.viteServerUp} onChange={(e) => s.set('viteServerUp', e.target.checked)} />
          <span>{state.viteServerUp ? 'running on :5173' : 'not running'}</span>
        </label>
        <p className="muted tiny">off: <code>net::ERR_CONNECTION_REFUSED</code></p>
      </div>
    )
  }
  if (id === 'django' || id === 'channels') {
    return (
      <div>
        <strong>{node.label}</strong>
        <p>
          One real process serves both lanes: <code>manage.py runserver</code> or Daphne on the same port, :8000. Which
          one is running decides whether the websocket lane exists at all.
        </p>
        <label className="fork-pick">
          backend process mode:
          <select
            name="backend-process-mode"
            value={state.backendMode}
            onChange={(e) => s.set('backendMode', e.target.value as 'runserver' | 'daphne')}
          >
            <option value="daphne">daphne (ASGI, serves both)</option>
            <option value="runserver">runserver (WSGI, http only)</option>
          </select>
        </label>
        {id === 'channels' && (
          <p className="muted tiny">
            with runserver: <code>Error during WebSocket handshake: Unexpected response code: 500</code>
          </p>
        )}
      </div>
    )
  }
  if (id === 'redis') {
    return (
      <div>
        <strong>{node.label}</strong>
        <p>One process, two logical databases. DB 0 is the channel layer; DB 1 is the cache. Independent, even though it is the same Redis.</p>
        <label className="switch">
          <input type="checkbox" checked={state.redisChannelUp} onChange={(e) => s.set('redisChannelUp', e.target.checked)} />
          <span>DB 0, channel layer {state.redisChannelUp ? 'up' : 'down'}</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={state.redisCacheUp} onChange={(e) => s.set('redisCacheUp', e.target.checked)} />
          <span>DB 1, cache {state.redisCacheUp ? 'up' : 'down'}</span>
        </label>
        <CodeBlock code={SETTINGS_CHANNEL_LAYERS} lang="python" caption="settings.py: CHANNEL_LAYERS" />
        <CodeBlock code={SETTINGS_CACHES} lang="python" caption="settings.py: CACHES" />
      </div>
    )
  }
  return null
}

function EdgeDetail({ id, state }: { id: EdgeId; state: SceneState }) {
  const s = useStore()
  const edge = EDGES.find((e) => e.id === id)!

  return (
    <div>
      <strong>
        {nodeOf(edge.source).label} → {nodeOf(edge.target).label}
      </strong>
      <p>{edge.role}</p>
      <p className="muted tiny">carries: {edge.carries}</p>

      {id === 'vite-django' && (
        <div className="tagset">
          {HTTP_PATHS.map((p) => (
            <label key={p} className="tagcheck">
              <input type="checkbox" checked={state.proxyRoutes[p]} onChange={() => s.toggleProxyPath(p)} />
              <code>/{p}</code>
            </label>
          ))}
          <CodeBlock code={VITE_CONFIG_JS} lang="javascript" caption="frontend/vite.config.js" active={[15, 16, 17, 18]} />
        </div>
      )}
      {id === 'vite-channels' && (
        <div className="tagset">
          <label className="tagcheck">
            <input type="checkbox" checked={state.proxyRoutes.ws} onChange={() => s.toggleProxyPath('ws')} />
            <code>/ws</code> (ws:true)
          </label>
          <CodeBlock code={VITE_CONFIG_JS} lang="javascript" caption="frontend/vite.config.js" active={[19, 20, 21, 22]} />
        </div>
      )}
      {id === 'django-redis' && <CodeBlock code={GET_USER_PERMISSIONS_PY} lang="python" caption="users/utils.py" active={[6]} />}
      {id === 'channels-redis' && (
        <CodeBlock code={WS_JWT_MIDDLEWARE_PY} lang="python" caption="chat/consumers.py: WebSocketJWTAuthMiddleware" />
      )}
    </div>
  )
}

function ComponentDetail({ id, state }: { id: string; state: SceneState }) {
  const s = useStore()
  const c = findComponent(id)
  if (!c) return null
  const out = resolve(state)

  return (
    <div>
      <strong>{c.label}</strong>
      <p>{c.what}</p>
      <dl>
        <dt>affects</dt>
        <dd>{c.affects.join(', ')}</dd>
        <dt>{c.effect === 'gap' ? 'the honest gap' : c.effect === 'breaks' ? 'how it breaks' : 'what changes'}</dt>
        <dd>{c.breaks}</dd>
        <dt>the real thing</dt>
        <dd>
          <code>{c.real}</code>
        </dd>
      </dl>

      {id === 'jwt-refresh-interceptor' && (
        <>
          <label className="switch">
            <input type="checkbox" checked={state.jwtInterceptorEnabled} onChange={(e) => s.set('jwtInterceptorEnabled', e.target.checked)} />
            <span>{state.jwtInterceptorEnabled ? 'on: silent refresh' : 'off: no retry'}</span>
          </label>
          <p className="because">{out.jwt.ok ? 'succeeds after a silent refresh.' : out.jwt.errorString}</p>
        </>
      )}

      {id === 'asgi-router' && (
        <div className="consumer-cards">
          {asgiRouterStatus(state).map((cons) => (
            <div key={cons.id} className={`consumer-card ${cons.liveNow ? 'live' : cons.wired ? 'wired-down' : 'gap'}`}>
              <strong>{cons.id}</strong>
              <span className="muted tiny">{cons.wired ? (cons.liveNow ? 'live' : 'wired, currently down') : 'not wired'}</span>
              <p className="muted tiny">{cons.detail}</p>
            </div>
          ))}
          <CodeBlock code={ASGI_PY} lang="python" caption="main/asgi.py" />
          <CodeBlock code={ROUTING_PY} lang="python" caption="main/routing.py" active={[5, 7]} />
          <CodeBlock code={CHAT_ROUTING_PY} lang="python" caption="chat/routing.py" />
          <CodeBlock code={NOTIFICATIONS_ROUTING_PY} lang="python" caption="notifications/routing.py" />
          <CodeBlock code={LOCATIONS_CONSUMERS_PY} lang="python" caption="locations/consumers.py: real, complete, never imported" />
        </div>
      )}
    </div>
  )
}
