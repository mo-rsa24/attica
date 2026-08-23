// The claim card, run as a comparison. Both lanes carry the same message from
// the same POST; only the delivery differs. Segment width is proportional to
// time, so the poll lane's wait visibly dominates rather than being asserted.
//
// The scene is map-first, so this lives inside stage 2 as the detail behind the
// browser-to-Daphne edge, rather than being the first thing anyone sees.

import { run, type SceneState } from '../model'
import { useStore } from '../store'

export function Race() {
  const { state, apply } = useStore()
  const pushed = run({ ...state, redis: 'up', server: 'daphne', viteProxy: true, token: 'valid' })
  const polled = run({ ...state, redis: 'not-configured', server: 'daphne', viteProxy: true, token: 'valid' })

  const scale = polled.counterpartSeesAtMs ?? state.pollIntervalMs
  const pushMs = pushed.counterpartSeesAtMs ?? 0
  const pollMs = polled.counterpartSeesAtMs ?? state.pollIntervalMs

  return (
    <>
      <Lane
        name="the socket carries it"
        ms={pushMs}
        scale={scale}
        tone="var(--push)"
        note={`${pushMs} ms, illustrative`}
      />
      <Lane
        name="the poll carries it"
        ms={pollMs}
        scale={scale}
        tone="var(--poll)"
        note={`up to ${pollMs} ms, and this number is real: it is the 8000 in DirectMessagePage.jsx:260`}
      />

      <dl className="kv" style={{ marginTop: 16 }}>
        <dt>same POST</dt>
        <dd>both lanes start from one HTTP 201 and one committed row. The write is not the variable.</dd>
        <dt>the cost</dt>
        <dd>
          the poll lane issues <strong>{polled.queriesPerMinute} GETs per minute</strong> across{' '}
          {state.openRooms} open rooms, nearly all of them returning rows the browser already has.
          The push lane issues none.
        </dd>
        <dt>the catch</dt>
        <dd>
          the poll lane cannot be wrong for long. The push lane can be silently wrong forever, which
          is stage 3.
        </dd>
      </dl>

      <div className="ctl">
        <label>open rooms</label>
        {[1, 100, 500].map((n) => (
          <button
            key={n}
            className="opt"
            aria-pressed={state.openRooms === n}
            onClick={() =>
              apply({
                target: 'openRooms',
                operation: 'set',
                before: String(state.openRooms),
                after: String(n),
                label: `open rooms: ${state.openRooms} to ${n}`,
                patch: { openRooms: n } as Partial<SceneState>,
              })
            }
          >
            {n}
          </button>
        ))}
      </div>
    </>
  )
}

function Lane({
  name,
  ms,
  scale,
  tone,
  note,
}: {
  name: string
  ms: number
  scale: number
  tone: string
  note: string
}) {
  const pct = Math.max(1.2, (ms / scale) * 100)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 5 }}>
        <strong style={{ fontSize: 13.5 }}>{name}</strong>
        <span className="mono" style={{ fontSize: 12, color: tone }}>
          {ms} ms
        </span>
      </div>
      <div style={{ height: 16, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 4 }}>{note}</div>
    </div>
  )
}
