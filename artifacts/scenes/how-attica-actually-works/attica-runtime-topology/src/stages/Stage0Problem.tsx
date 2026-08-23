import { resolve, type SceneState } from '../model'
import { Lane } from '../ui/Lane'
import type { RequestTrace } from '../model'

const MVC_TRACE: RequestTrace = {
  path: 'ws',
  kind: 'ws',
  hops: [
    { process: 'browser', label: 'browser tab', ok: true },
    { process: 'django', label: 'one process: renders HTML, holds the socket, owns the DB connection', ok: true },
  ],
  ok: true,
  failedAt: null,
  errorString: null,
  redisLoadBearing: false,
  redisWhich: 'none',
  because: 'one language, one process, one debugger. There is no seam to reproduce a bug across, because there is only one runtime.',
}

export function Stage0Problem({ state }: { state: SceneState }) {
  const out = resolve(state)
  const ws = out.requests.find((r) => r.kind === 'ws')!

  return (
    <section data-tour="stage-strip">
      <h1>The problem</h1>
      <p className="lede">
        Hitting save feels like one instant. In Attica it is carried by four independently-failing processes, glued by
        a proxy that only exists in development. Toggle the topology diagram above and watch this race change without
        touching anything below.
      </p>

      <div className="callout">
        <strong>Claim.</strong> Vite, Django/DRF, Daphne/ASGI+Channels and Redis are four processes with four
        different jobs, and reproducing a bug that crosses between them needs two separate debuggers, attached to two
        separate runtimes, stepping in sync.
        <br />
        <strong>Alternative.</strong> Classical server-rendered MVC: one process, one language, Django renders the
        HTML directly, one debugger sees the whole request.
      </div>

      <div className="lanes">
        <Lane title="classical MVC (hypothetical)" subtitle="the alternative this scene compares against" trace={MVC_TRACE} />
        <Lane title="Attica, right now" subtitle={`backendMode=${state.backendMode}, channel layer ${state.redisChannelUp ? 'up' : 'down'}`} trace={ws} />
      </div>

      <div className="callout">
        <strong>Use it for:</strong> the chat/notifications real-time overlay, which needs Channels and Redis to exist
        at all; independent frontend iteration via Vite's HMR, with no Django restart; deploying frontend and backend
        on different infrastructure or cadence.
        <br />
        <strong>Do not reach for it when:</strong> a bug only reproduces when a WebSocket message races a REST call,
        invisible from either debugger alone; and every deploy re-solves the origin/CORS problem classical MVC never
        has, since this dev-only proxy does not exist in production.
      </div>

      <p className="muted tiny">
        No mechanism yet: how Vite actually forwards a path, how Daphne actually splits protocols, is stage 1 and
        stage 2. This stage is allowed to be a black box.
      </p>
    </section>
  )
}
