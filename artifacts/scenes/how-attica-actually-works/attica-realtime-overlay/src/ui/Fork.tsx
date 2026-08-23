// Two worlds from one baseline, differing by exactly one intervention, run by
// the same model. The default candidate is the claim card's own alternative:
// take the channel layer away entirely and the 8-second poll is the delivery
// path, which is the comparison the whole scene exists to make.
//
// Both worlds render with the same component and the same row order, so only
// the divergence differs. Redesigning one side would make them incomparable.

import { useState } from 'react'
import { changeset } from '../lab'
import { run, type SceneState } from '../model'
import { useStore } from '../store'

const CANDIDATES: { id: string; label: string; patch: Partial<SceneState> }[] = [
  {
    id: 'no-layer',
    label: 'no channel layer at all: the poll is the only delivery',
    patch: { redis: 'not-configured' },
  },
  { id: 'redis-late', label: 'Redis dies after the sockets joined', patch: { redis: 'down-after-connect' } },
  { id: 'runserver', label: 'started with manage.py runserver', patch: { server: 'runserver' } },
  { id: 'no-proxy', label: 'the Vite proxy is off', patch: { viteProxy: false } },
  { id: 'socket-writer', label: 'the socket does the writing', patch: { sendPath: 'socket' } },
]

export function Fork() {
  const { state } = useStore()
  const [pick, setPick] = useState(CANDIDATES[0].id)
  const cand = CANDIDATES.find((c) => c.id === pick)!
  const a = run(state)
  const b = run({ ...state, ...cand.patch })
  const diff = changeset(a, b)

  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
        Both worlds start from exactly the state you have now. B differs by one thing and nothing
        else.
      </p>
      <div className="ctl" style={{ marginBottom: 14 }}>
        {CANDIDATES.map((c) => (
          <button key={c.id} className="opt" aria-pressed={c.id === pick} onClick={() => setPick(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="forkgrid">
        <World title="A: as you have it" o={a} />
        <World title={`B: ${cand.label}`} o={b} />
      </div>

      <div style={{ marginTop: 14 }}>
        <h4 style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', margin: '0 0 6px' }}>
          WHERE THEY DIVERGE
        </h4>
        {diff.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
            Nowhere. In this configuration that change is not load-bearing.
          </p>
        ) : (
          <div className="changes">
            {diff.map((c) => (
              <div className="change" key={c.observable}>
                <span className="k">{c.observable}</span>
                <span className="b">{c.before}</span>
                <span className="arrow">→</span>
                <span className="a">{c.after}</span>
              </div>
            ))}
          </div>
        )}
        {a.messageDurable && b.messageDurable && (
          <p className="pill ok" style={{ marginTop: 10 }}>
            the row is committed in both
          </p>
        )}
      </div>
    </>
  )
}

function World({ title, o }: { title: string; o: ReturnType<typeof run> }) {
  const first = o.slots.findIndex((s) => s.status !== 'ran')
  return (
    <div>
      <h4>{title}</h4>
      <dl className="kv">
        <dt>outcome</dt>
        <dd>{o.variant}</dd>
        <dt>row</dt>
        <dd>{o.messageDurable ? `committed, ${o.dbRowCount} rows` : 'not written'}</dd>
        <dt>seen</dt>
        <dd>{o.counterpartSees ? `after ${o.counterpartSeesAtMs} ms` : 'not without a reload'}</dd>
        <dt>gap</dt>
        <dd>{o.divergence} rows</dd>
        <dt>first stop</dt>
        <dd>{first === -1 ? 'ran to the end' : `${o.slots[first].label} (${o.slots[first].status})`}</dd>
      </dl>
      <div style={{ display: 'flex', gap: 2, marginTop: 9 }}>
        {o.slots.map((s) => (
          <span
            key={s.id}
            title={s.label}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background:
                s.status === 'ran' ? 'var(--ok)' : s.status === 'failed' ? 'var(--bad)' : 'var(--line)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
