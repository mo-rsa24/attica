// Two worlds from one baseline, differing by exactly one setting, run by the
// same model on the same schedule. The default candidate is the claim card's
// alternative: swap the slot design for the overlap query.

import { useState } from 'react'
import { changeset } from '../lab'
import { run, type Config, type Outcome } from '../model'
import { useStore } from '../store'

const CANDIDATES: { id: string; label: string; patch: Partial<Config> }[] = [
  { id: 'design', label: 'one table and an overlap query instead', patch: { design: 'overlap-query' } },
  { id: 'lock', label: 'without SELECT FOR UPDATE', patch: { locking: 'none' } },
  { id: 'vendor', label: 'on postgresql instead of sqlite', patch: { vendor: 'postgresql' } },
  { id: 'capacity', label: 'with the rule at capacity 5', patch: { slotCapacity: 5 } },
  { id: 'attendees', label: 'with 3 attendees per booking', patch: { attendees: 3 } },
  { id: 'blackout', label: 'with a blackout over the window', patch: { blackout: true } },
]

export function Fork() {
  const { config, events } = useStore()
  const [pick, setPick] = useState(CANDIDATES[0].id)
  const cand = CANDIDATES.find((c) => c.id === pick)!
  const a = run(config, events)
  const b = run({ ...config, ...cand.patch }, events)
  const diff = changeset(a, b)

  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
        Both worlds replay the schedule you built. B differs by one setting and nothing else.
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
            Nowhere. On this schedule that setting is not load-bearing. Build a longer interleaving and try again.
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
      </div>
    </>
  )
}

function World({ title, o }: { title: string; o: Outcome }) {
  return (
    <div>
      <h4>{title}</h4>
      <dl className="kv">
        <dt>outcome</dt>
        <dd>{o.variant}</dd>
        <dt>bookings</dt>
        <dd>{o.activeBookings}</dd>
        <dt>capacity</dt>
        <dd className="mono">{o.capacityLine}</dd>
        <dt>incidents</dt>
        <dd>
          {o.incidentsBySource.application_check} app, {o.incidentsBySource.db_constraint} db
        </dd>
        <dt>silent</dt>
        <dd>{o.silent ? 'yes' : o.world.crashed ? 'a 500' : 'no'}</dd>
      </dl>
    </div>
  )
}
