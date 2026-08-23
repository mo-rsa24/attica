// Where it costs you. Every failure here is reachable by a control you can set,
// each one surfaces the real symptom before the cause (debugging is recognition,
// and you meet the symptom first), and each one is worth predicting before you
// reproduce it.

import { EXCURSIONS } from '../engagement'
import { run, type SceneState } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { Excursion } from '../ui/Excursion'
import { Predict } from '../ui/Predict'

interface Failure {
  id: string
  symptom: string
  cause: string
  detail: string
  real: string[]
  patch: Partial<SceneState>
  question: string
  snippet?: string
  hot?: number
  note?: string
}

const FAILURES: Failure[] = [
  {
    id: 'redis-after',
    symptom:
      'Two people are in a room. One sends. Their own screen updates. The other screen does not, and never will, and neither browser shows an error.',
    cause: 'Redis died after both sockets had already joined the group',
    detail:
      'group_add ran while Redis was still up, so both sockets are members and both clients think ' +
      'they are healthy. When the POST reaches group_send, the connection is gone. _safe_group_send ' +
      'catches it, logs a warning, and returns. The view carries on and answers 201. Nothing sends a ' +
      'close frame, nothing sends a warning frame, so socketError is never set and the fallback poll ' +
      'never mounts.',
    real: [
      'WARNING Chat broadcast skipped: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
      'POST /api/chat/rooms/7/messages/ 201 (Created)',
    ],
    patch: { redis: 'down-after-connect' },
    question:
      'Redis is about to die, after both sockets already joined the room. The organizer sends a message. What becomes of it?',
    snippet: 'broadcast',
    hot: 19,
    note:
      'One honest gap: whether the counterpart\'s socket eventually closes depends on how channels_redis ' +
      'surfaces a lost connection into the consumer\'s receive loop, and Attica has no explicit handler ' +
      'for that. If it does close, the client recovers through the ordinary reconnect and poll. If it ' +
      'does not, the staleness is unbounded. The scene models the unhandled case, because that is the ' +
      'one nothing in the code is defending against.',
  },
  {
    id: 'redis-before',
    symptom:
      'A banner appears saying realtime updates are unavailable, and messages start arriving late but reliably.',
    cause: 'Redis was already down when the socket connected',
    detail:
      'group_add raises during connect(). ChatConsumer catches it, sets broadcast_enabled to False, ' +
      'accepts the socket anyway, and then sends a warning frame. The client sets socketError on that ' +
      'frame, which mounts the 8-second poll. This is the graceful path, and it is the one the code ' +
      'actually handles.',
    real: [
      'WARNING Failed to join chat group chat_room_7: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
      'ws frame out: {"type": "warning", "detail": "Realtime updates unavailable; refresh to see new messages."}',
    ],
    patch: { redis: 'down-before-connect' },
    question:
      'Redis is about to be down before anyone connects, so the socket cannot join the group at all. What becomes of the message?',
    snippet: 'consumer',
    hot: 72,
    note:
      'Compare this with the one above. The same dead Redis produces a handled degradation or a silent ' +
      'gap depending only on when it died relative to the handshake. That is the sharpest edge in the ' +
      'whole design.',
  },
  {
    id: 'token',
    symptom:
      'The socket connects, drops immediately, connects again four seconds later, drops again. Forever.',
    cause: 'The access token expired',
    detail:
      'WebSocketJWTAuthMiddleware validates the token once, at handshake. An expired one resolves to ' +
      'AnonymousUser and connect() closes 4401. The client\'s onclose schedules a reconnect in 4000 ms, ' +
      'which presents the same dead token. The loop only breaks when AuthProvider refreshes: wsUrl ' +
      'depends on tokens, so a refresh rebuilds the URL and the effect reconnects with a live one.',
    real: [
      'WebSocket is closed before the connection is established.  code: 4401',
      'POST /api/chat/rooms/7/messages/ 401 (Unauthorized)',
    ],
    patch: { token: 'expired' },
    question: 'The access token is about to expire. What becomes of the message?',
    snippet: 'middleware',
    hot: 51,
    note:
      'The mirror of this is worth saying out loud: the token is checked at handshake and never again. ' +
      'ACCESS_TOKEN_LIFETIME is 30 minutes, so a socket opened at minute zero is still open and still ' +
      'trusted at minute ninety. Nothing in this code path revalidates it.',
  },
  {
    id: 'authz',
    symptom: 'A user opens a room they were linked to and the socket closes at once with 4403.',
    cause: 'They are not the organizer or the vendor of that room',
    detail:
      '_user_in_room checks membership against the two participants and closes 4403 when it fails. ' +
      'The REST endpoints answer 403 for the same user, so there is no fallback and there should not ' +
      'be one. This failure is the authorization check doing its job, and it is the only case in this ' +
      'stage where a stale screen is the correct outcome.',
    real: ['WebSocket is closed before the connection is established.  code: 4403', 'GET /api/chat/rooms/7/messages/ 403 (Forbidden)'],
    patch: { token: 'valid-non-member' },
    question:
      'The person watching is about to turn out not to be a participant in this room. What becomes of the message?',
    snippet: 'consumer',
    hot: 63,
  },
  {
    id: 'runserver',
    symptom:
      'Everything in the app works except that nothing is ever live. Chat, notifications, all of it falls back to polling.',
    cause: 'The server was started with manage.py runserver instead of daphne',
    detail:
      'daphne is not in INSTALLED_APPS, so Channels does not patch runserver, and runserver is the ' +
      'plain WSGI dev server. It has no handler for the upgrade at all. The REST API is completely ' +
      'unaffected, which is exactly why this is easy to miss: every feature works, just slowly.',
    real: ["WebSocket connection to 'ws://localhost:5173/ws/chat/rooms/7/' failed"],
    patch: { server: 'runserver' },
    question:
      'The server is about to be restarted with manage.py runserver instead of daphne. What becomes of the message?',
  },
  {
    id: 'proxy',
    symptom: 'Sending fails outright with a generic error, and the room will not even load.',
    cause: 'The Vite dev-server proxy is not forwarding',
    detail:
      'The client addresses everything as same-origin against :5173. Without the proxy entries, the ' +
      'POST hits Vite itself, which has no such route and answers 404. Vite\'s SPA fallback does not ' +
      'rescue it, because that only rewrites GET requests which accept text/html. This is the one ' +
      'failure in the stage that loses the message, and it loses it because nothing was ever written.',
    real: [
      'POST http://localhost:5173/api/chat/rooms/7/messages/ 404 (Not Found)',
      'Failed to send message.',
    ],
    patch: { viteProxy: false },
    question: 'The Vite proxy is about to be switched off. What becomes of the message?',
    snippet: 'proxy',
    hot: 15,
  },
]

export function Stage3Failures() {
  const falsify = EXCURSIONS.find((e) => e.id === 'falsify')!
  const real = EXCURSIONS.find((e) => e.id === 'real-attica')!

  return (
    <>
      <div className="card">
        <h2>Six ways this goes wrong, and only one of them loses anything</h2>
        <p className="lede">
          Each card leads with what you would actually see, because that is what you meet first when
          something is broken. The cause comes after. Every one of them is a control you can set, so
          predict first, then reproduce it and watch the map.
        </p>
      </div>

      {FAILURES.map((f) => (
        <FailureCard key={f.id} f={f} />
      ))}

      <div className="card">
        <h3>And one surprise that is not a failure</h3>
        <p>
          Send from both sides at the same instant and the two events can reach a browser in either
          order. Nothing prevents that, and nothing needs to: the client sorts by{' '}
          <code>created_at</code> on every merge, so the wire order never reaches the screen. Set
          the sender count to two on the <strong>appendMessages</strong> box inside the browser and
          watch the arrival order and the rendered order disagree without anything going wrong.
        </p>
        <p style={{ marginBottom: 0 }}>
          The genuine edge is the tie. Two messages with an identical <code>created_at</code> sort
          equal, and a stable sort keeps them in arrival order. Rare, harmless, and real.
        </p>
      </div>

      <div className="card">
        <h2>Try to prove all of this wrong</h2>
        <p className="lede">
          Everything above rests on one claim: no configuration of this system loses a committed
          message. The checks drawer sweeps all 256 configurations on every render and says so. Do
          not take its word for it.
        </p>
        <Excursion ex={falsify} />
        <Excursion ex={real} />
      </div>
    </>
  )
}

function FailureCard({ f }: { f: Failure }) {
  const { state, apply } = useStore()
  const here = run({ ...state, ...f.patch })

  return (
    <div className="card">
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
        WHAT YOU SEE
      </div>
      <h3 style={{ margin: '3px 0 10px', fontWeight: 500 }}>{f.symptom}</h3>

      <div className="term">
        {f.real.map((r, i) => (
          <div key={i} className={r.includes('201') || r.includes('warning') ? 'warnln' : 'err'}>
            {r}
          </div>
        ))}
      </div>

      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
        WHY
      </div>
      <h4 style={{ margin: '3px 0 7px' }}>{f.cause}</h4>
      <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{f.detail}</p>

      {f.snippet && <CodeBlock snippet={f.snippet} hot={f.hot ?? null} />}

      {f.note && (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', borderLeft: '2px solid var(--line)', paddingLeft: 12 }}>
          {f.note}
        </p>
      )}

      <Predict question={f.question} patch={f.patch} label={`reproduced: ${f.cause}`} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="opt"
          onClick={() =>
            apply({
              target: Object.keys(f.patch)[0],
              operation: 'scenario',
              label: `reproduced: ${f.cause}`,
              patch: f.patch,
            })
          }
        >
          reproduce it on the map
        </button>
        <span className={`pill ${here.messageDurable ? 'ok' : 'bad'}`}>
          {here.messageDurable ? `row survives: ${here.dbRowCount} in the database` : 'no row written'}
        </span>
        <span className={`pill ${here.counterpartSees ? 'ok' : 'warn'}`}>
          {here.counterpartSees ? `delivered after ${here.counterpartSeesAtMs} ms` : 'not delivered'}
        </span>
      </div>
    </div>
  )
}
