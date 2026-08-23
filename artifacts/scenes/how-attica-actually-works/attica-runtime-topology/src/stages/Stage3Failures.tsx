import { EXCURSIONS } from '../engagement'
import { debugConfigOutcomes, resolve, type ProxyPath, type SceneState } from '../model'
import { Excursion } from '../ui/Excursion'
import { useStore } from '../store'

interface Scenario {
  name: string
  symptom: string
  cause: string
  fix: string
  patch: Partial<SceneState>
}

const HTTP_PATHS: ProxyPath[] = ['api', 'vendors', 'cart', 'checkout']

function scenarios(state: SceneState): Scenario[] {
  return [
    {
      name: 'the Vite process is not running',
      symptom: 'the whole app is a blank tab; the browser never even finishes connecting',
      cause: 'nothing listens on :5173, so the request never leaves the browser toward anything real',
      fix: 'cd frontend && npm run dev, or launch the "Frontend: Vite Dev Server" debug config',
      patch: { viteServerUp: false },
    },
    {
      name: 'one proxy path is disabled',
      symptom: 'every page still loads, but one specific feature\'s data never arrives, and the network tab shows 200 with HTML in the body',
      cause: `vite.config.js has no rule for that path, so Vite's SPA fallback answers with index.html and JSON.parse chokes on it`,
      fix: 'add the missing entry to server.proxy in vite.config.js',
      patch: { proxyRoutes: { ...state.proxyRoutes, cart: false } },
    },
    {
      name: 'Redis DB 0 (channel layer) is down',
      symptom: 'chat and notifications stop delivering; every other page keeps working exactly as before',
      cause: 'channels_redis raises when ChatConsumer.connect() calls group_add(), and nothing in the http lane ever calls it',
      fix: 'start Redis; confirm with redis-cli ping from the same host settings.py points at',
      patch: { redisChannelUp: false },
    },
    {
      name: 'Redis DB 1 (cache) is down, DB 0 is fine',
      symptom: 'chat keeps delivering in real time, but a permission-gated request (cart, checkout) throws a 500',
      cause: 'users/utils.py:get_user_permissions() calls cache.get() with no error handling, on the same Redis process but a different logical database',
      fix: 'the two DBs share one process: if Redis itself died, this and the channel layer fail together; if only django_redis\'s config is wrong, only this fails',
      patch: { redisCacheUp: false },
    },
    {
      name: 'manage.py runserver instead of Daphne',
      symptom: 'REST calls all succeed; the moment the chat panel tries to open its socket, it fails immediately with a handshake error',
      cause: `channels is listed after django.contrib.staticfiles in INSTALLED_APPS, so Channels' runserver override never triggers, and plain WSGI has no upgrade path`,
      fix: 'launch Daphne instead: daphne -b 0.0.0.0 -p 8000 main.asgi:application, or the "Backend: Daphne Server (WebSockets)" debug config',
      patch: { backendMode: 'runserver' },
    },
  ]
}

export function Stage3Failures({ state }: { state: SceneState }) {
  const s = useStore()
  const out = resolve(state)
  const debugConfigs = debugConfigOutcomes(state)
  const migrate = debugConfigs.find((d) => d.id === 'run-migrations')!

  return (
    <section>
      <h1>Failure modes</h1>
      <p className="lede">
        Every card below is reachable from the controls: press reproduce and the topology diagram above updates to
        match. The symptom comes first, because that is the order you meet it in.
      </p>

      {scenarios(state).map((sc) => (
        <div key={sc.name} className="failcard">
          <div className="failhead">
            <strong>{sc.name}</strong>
            <button onClick={() => s.applyScenario(sc.patch, `reproduce: ${sc.name}`)}>reproduce</button>
          </div>
          <dl>
            <dt>what you see</dt>
            <dd>{sc.symptom}</dd>
            <dt>what it is</dt>
            <dd>{sc.cause}</dd>
            <dt>what to do</dt>
            <dd>{sc.fix}</dd>
          </dl>
        </div>
      ))}

      <h3>Four honest gaps: nothing in this scene can fix these by toggling</h3>

      <div className="failcard">
        <strong>locations is unwired</strong>
        <p>
          <code>locations/consumers.py</code> defines a complete, working <code>NotificationConsumer</code>. There is
          no <code>locations/routing.py</code>, and <code>main/routing.py</code> never imports one. No amount of
          toggling redis, backendMode, or anything else in this scene makes it live: the gap is upstream of every
          toggle here.
        </p>
      </div>

      <div className="failcard">
        <strong>the venv CLAUDE.md documents is not the venv that runs</strong>
        <p>
          Both Python debug configs hardcode <code>"python": "/home/molef/lobola/bin/python"</code>. A package
          installed only into <code>backend/venv</code> is invisible to them. Open the Debug Configs drawer and flip
          venv-binding to see it.
        </p>
      </div>

      <div className="failcard">
        <strong>"Run Migrations" cannot launch</strong>
        <p>{migrate.reason}</p>
        <code className="reach-err">{migrate.errorString}</code>
      </div>

      <div className="failcard">
        <strong>neither compound includes the Chrome-debug leg</strong>
        <p>
          "Full Stack: Backend + Frontend" runs Django Runserver + Vite. "Full Stack: Backend (Daphne) + Frontend"
          runs Daphne + Vite. If you want Chrome attached too, launch it as a third, separate configuration: this
          scene will not pretend a compound covers it when it does not.
        </p>
      </div>

      {EXCURSIONS.map((ex) => (
        <Excursion key={ex.id} spec={ex} />
      ))}

      <div className="callout">
        <strong>What survives every failure above.</strong> Look at the reachability readout beside the topology
        diagram: {HTTP_PATHS.filter((p) => out.requests.find((r) => r.path === p)?.ok).length} of {HTTP_PATHS.length}{' '}
        plain HTTP paths are reachable right now, independent of whatever you just broke in the websocket lane.
      </div>
    </section>
  )
}
