// What opens when you click a box or an arrow. Four things, per the component
// contract: what it is, what it reads and emits, the real artifact behind it,
// and its live contribution to the result on screen right now.
//
// The controls live here rather than in a permanent sidebar, so the thing you
// change and the thing that changes are the same object.

import { byId, type AtlasEdge, type AtlasNode } from '../atlas'
import { changeset } from '../lab'
import { run, type SceneState } from '../model'
import { useStore } from '../store'
import { Icon } from './Icons'

type Opt = { value: string | number | boolean; label: string }

const OPTIONS: Partial<Record<keyof SceneState, Opt[]>> = {
  redis: [
    { value: 'up', label: 'reachable' },
    { value: 'down-after-connect', label: 'died after connect' },
    { value: 'down-before-connect', label: 'down at connect' },
    { value: 'not-configured', label: 'CHANNEL_LAYERS removed' },
  ],
  token: [
    { value: 'valid', label: 'valid' },
    { value: 'expired', label: 'expired' },
    { value: 'absent', label: 'absent' },
    { value: 'valid-non-member', label: 'valid, not in this room' },
  ],
  sendPath: [
    { value: 'rest', label: 'POST /api (what Attica does)' },
    { value: 'socket', label: 'send_message frame' },
  ],
  server: [
    { value: 'daphne', label: 'daphne' },
    { value: 'runserver', label: 'manage.py runserver' },
  ],
  viteProxy: [
    { value: true, label: 'forwarding' },
    { value: false, label: 'off' },
  ],
  concurrentSends: [
    { value: false, label: '1 sender' },
    { value: true, label: '2 at once' },
  ],
  pollIntervalMs: [
    { value: 2000, label: '2000 ms' },
    { value: 8000, label: '8000 ms (real)' },
    { value: 30000, label: '30000 ms' },
  ],
  openRooms: [
    { value: 1, label: '1 room' },
    { value: 100, label: '100 rooms' },
    { value: 500, label: '500 rooms' },
  ],
}

const LABEL: Partial<Record<keyof SceneState, string>> = {
  redis: 'channel layer',
  token: 'the JWT on the handshake',
  sendPath: 'which writer',
  server: 'ASGI server',
  viteProxy: 'proxy',
  concurrentSends: 'senders',
  pollIntervalMs: 'poll interval',
  openRooms: 'open rooms',
}

export function Controls({ keys }: { keys: (keyof SceneState)[] }) {
  const { state, apply } = useStore()
  return (
    <>
      {keys.map((k) => {
        const opts = OPTIONS[k]
        if (!opts) return null
        return (
          <div className="ctl" key={k}>
            <label>{LABEL[k] ?? k}</label>
            {opts.map((o) => (
              <button
                key={String(o.value)}
                className="opt"
                aria-pressed={state[k] === o.value}
                onClick={() =>
                  apply({
                    target: k,
                    operation: typeof o.value === 'boolean' ? 'toggle' : 'set',
                    before: String(state[k]),
                    after: String(o.value),
                    label: `${LABEL[k] ?? k}: ${String(state[k])} to ${String(o.value)}`,
                    patch: { [k]: o.value } as Partial<SceneState>,
                  })
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}

export function NodeInspector({ node }: { node: AtlasNode }) {
  const { state, setFocus } = useStore()
  const outcome = run(state)

  // "What happens without this?" computed by the same model, presented as a
  // counterfactual and never as a contribution.
  const ablation = ablate(node, state)

  return (
    <>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon slug={node.icon} /> {node.label}
      </h3>
      <div className="what">{node.what}</div>

      <div className="sect">right now</div>
      <div className="mono" style={{ fontSize: 12.5 }}>
        {liveLine(node.id, state, outcome)}
      </div>

      {node.reads.length > 0 && (
        <>
          <div className="sect">reads</div>
          <div style={{ fontSize: 13 }}>{node.reads.map((r) => byId(r)?.label ?? r).join(', ')}</div>
        </>
      )}
      {node.affects.length > 0 && (
        <>
          <div className="sect">changes when it changes</div>
          <div style={{ fontSize: 13 }}>{node.affects.map((r) => byId(r)?.label ?? r).join(', ')}</div>
        </>
      )}

      <div className="sect">the real thing</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)', whiteSpace: 'pre-wrap' }}>
        {node.source}
      </div>

      {node.breaks && (
        <>
          <div className="sect">break it</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{node.breaks}</div>
          {node.real && (
            <div className="term" style={{ marginTop: 8 }}>
              <span className="err">{node.real}</span>
            </div>
          )}
        </>
      )}

      {node.controls && <Controls keys={[node.controls]} />}
      {node.id === 'poll' && <Controls keys={['openRooms']} />}

      {ablation && (
        <>
          <div className="sect">without it</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{ablation}</div>
        </>
      )}

      {node.opens && (
        <button
          className="opt"
          style={{ marginTop: 12 }}
          onClick={() => setFocus(node.id)}
        >
          open {node.label} →
        </button>
      )}
    </>
  )
}

export function EdgeInspector({ edge }: { edge: AtlasEdge }) {
  const { state } = useStore()
  const a = byId(edge.from)
  const b = byId(edge.to)
  return (
    <>
      <h3>
        {a?.label} → {b?.label}
      </h3>
      <div className="what">{edge.label}</div>

      <dl className="kv">
        <dt>carries</dt>
        <dd>{edge.carries}</dd>
        <dt>transport</dt>
        <dd>{edge.transport}</dd>
        <dt>result</dt>
        <dd>{edge.consequence}</dd>
      </dl>

      <div className="sect">declared at</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)', whiteSpace: 'pre-wrap' }}>
        {edge.source}
      </div>

      {edge.bestEffort && (
        <>
          <div className="sect">best effort</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
            Drawn dashed because nothing upstream learns if it fails. That is a design choice, and it
            is the reason the write has to come first.
          </div>
        </>
      )}

      {edge.severNote && (
        <>
          <div className="sect">{edge.severs ? 'sever it' : 'not severable'}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{edge.severNote}</div>
        </>
      )}
      {edge.severs && <Controls keys={[edge.severs]} />}
      {edge.id === 'ws' && <Controls keys={['token']} />}
      {edge.id === 'http' && <Controls keys={['viteProxy']} />}
      {state.redis !== 'up' && edge.id === 'layer' && (
        <div className="pill bad" style={{ marginTop: 10 }}>
          severed right now
        </div>
      )}
    </>
  )
}

function liveLine(id: string, s: SceneState, o: ReturnType<typeof run>): string {
  switch (id) {
    case 'redis':
    case 'channel-layer':
    case 'group-add':
    case 'group-send':
      return (
        (o.groupMembersReadable
          ? `${o.groupMembers.length} channel(s) in chat_room_7`
          : `${o.groupMembers.length} channel(s) joined, but Redis is unreachable so the set cannot be read`) +
        `; group_send ${o.slots.find((x) => x.id === 'group-send')?.status ?? 'n/a'}`
      )
    case 'sqlite':
    case 'view':
      return `${o.dbRowCount} rows in room 7, delivered_at stamped on the newest`
    case 'browser':
    case 'client':
    case 'merge':
      return `${o.screenRowCount} rows on the second browser's screen, ${o.divergence} behind`
    case 'poll':
      return o.pollActive
        ? `mounted: ${o.queriesPerMinute} GETs per minute across ${s.openRooms} rooms`
        : 'not mounted, because socketError is false'
    case 'ws-branch':
    case 'consumer':
      return o.socket.closeCode
        ? `closed ${o.socket.closeCode}: ${o.socket.closeMeaning}`
        : `open, broadcast_enabled = ${o.socket.broadcastEnabled ? 'True' : 'False'}`
    case 'daphne':
      return `${s.server}; HTTP ${o.httpStatus ?? 'n/a'}, socket ${o.socket.connected ? 'open' : 'refused'}`
    case 'vite-proxy':
      return s.viteProxy ? 'forwarding /api and upgrading /ws' : 'off: :5173 answers 404 itself'
    default:
      return o.reason
  }
}

/** The counterfactual, computed by the canonical model. */
function ablate(node: AtlasNode, s: SceneState): string | null {
  const neutralize: Partial<Record<string, Partial<SceneState>>> = {
    redis: { redis: 'not-configured' },
    'channel-layer': { redis: 'not-configured' },
    'group-add': { redis: 'down-before-connect' },
    'group-send': { redis: 'down-after-connect' },
    'vite-proxy': { viteProxy: false },
    daphne: { server: 'runserver' },
    poll: { pollIntervalMs: 3600000 },
    'ws-branch': { token: 'absent' },
  }
  const patch = neutralize[node.id]
  if (!patch) return null
  const before = run(s)
  const after = run({ ...s, ...patch })
  const diff = changeset(before, after)
  if (diff.length === 0) return 'nothing changes from here: it is not load-bearing in this configuration.'
  return diff.map((d) => `${d.observable}: ${d.before} becomes ${d.after}`).join('; ') + '.'
}
