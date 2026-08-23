import { ASGI_PY, ROUTING_PY, SETTINGS_CACHES, SETTINGS_CHANNEL_LAYERS } from '../artifacts'
import { LOCATIONS_PREDICTION } from '../engagement'
import { asgiRouterStatus, type SceneState } from '../model'
import { CodeBlock } from '../ui/CodeBlock'
import { Predict } from '../ui/Predict'

const JOBS = [
  { tool: 'Vite', job: 'dev HTTP server for the React bundle, HMR over its own websocket, and the only reverse proxy this repo runs' },
  { tool: 'Django / DRF', job: 'URL routing, the ORM, serializers, permission checks; owns the http lane whichever process serves it' },
  { tool: 'Daphne / Channels', job: 'the ASGI protocol server: the only one of the four that can hold a websocket open; routes it to a consumer class' },
  { tool: 'Redis', job: 'two unrelated jobs on one process: the channel layer\'s pub/sub (DB 0), and the page-load cache (DB 1)' },
]

export function Stage2Mechanism({ state }: { state: SceneState }) {
  const consumers = asgiRouterStatus(state)

  return (
    <section>
      <h1>The mechanism</h1>
      <p className="lede">
        Four tools, four distinct jobs, and one place that decides which of Attica's real consumer classes answers a
        websocket at all.
      </p>

      <h3>MVC becomes MTV plus a serializer layer</h3>
      <p>
        Classical MVC's "view" (what the user sees) is Django's <em>template</em>; Django's "view" is a controller
        function. DRF adds a fourth layer neither classical MVC nor plain Django MTV has: the <em>serializer</em>,
        which is the boundary between a model instance and the JSON this scene's frontend actually reads.
      </p>
      <ul className="taglist">
        <li>
          <span className="idx">model</span> the EventDraft row, the same for every consumer of it
        </li>
        <li>
          <span className="idx">view</span> EventDraftViewSet: resolves the request, owns permission checks
        </li>
        <li>
          <span className="idx">serializer</span> EventDraftSerializer: the only thing that knows the JSON shape
        </li>
        <li>
          <span className="idx">template</span> replaced entirely: React owns rendering, the serializer's JSON is the
          whole contract
        </li>
      </ul>

      <h3>Four tools, four distinct jobs</h3>
      <table className="jobtable">
        <tbody>
          {JOBS.map((j) => (
            <tr key={j.tool}>
              <td>
                <strong>{j.tool}</strong>
              </td>
              <td>{j.job}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Redis's two DBs</h3>
      <p>
        Same process, two logical databases, and the whole "two jobs, one process" claim rests on them staying
        independent, which the invariants panel checks on every render rather than asserting.
      </p>
      <div className="two">
        <CodeBlock code={SETTINGS_CHANNEL_LAYERS} lang="python" caption="settings.py: CHANNEL_LAYERS, DB 0" />
        <CodeBlock code={SETTINGS_CACHES} lang="python" caption="settings.py: CACHES, DB 1" />
      </div>

      <h3>ASGI's protocol split</h3>
      <p>
        <code>ProtocolTypeRouter</code> looks at the connection type before anything else runs: <code>http</code>{' '}
        goes to Django's normal handler, <code>websocket</code> goes through a JWT auth middleware into a{' '}
        <code>URLRouter</code> that matches a path regex to one consumer class.
      </p>
      <CodeBlock code={ASGI_PY} lang="python" caption="main/asgi.py" />
      <CodeBlock code={ROUTING_PY} lang="python" caption="main/routing.py" active={[5, 7]} />

      <div className="consumer-cards" data-tour="component:asgi-router">
        {consumers.map((c) => (
          <div key={c.id} className={`consumer-card ${c.liveNow ? 'live' : c.wired ? 'wired-down' : 'gap'}`}>
            <strong>{c.id}</strong>
            <span className="muted tiny">{c.wired ? (c.liveNow ? 'live' : 'wired, currently down') : 'not wired'}</span>
            <p className="muted tiny">{c.detail}</p>
          </div>
        ))}
      </div>

      <Predict id="stage2:locations" prediction={LOCATIONS_PREDICTION} state={state} />
    </section>
  )
}
