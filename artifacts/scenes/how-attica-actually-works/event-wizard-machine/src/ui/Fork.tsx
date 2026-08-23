// Two worlds from one baseline, differing by exactly one thing, run by the same
// model. Both render with the same component and the same row order, so only the
// divergence differs.
//
// The default candidate is the claim card's own alternative: switch the step 2
// route live, and watch an answer that used to survive stop surviving.

import { useState } from 'react'
import { changeset } from '../lab'
import { FIELDS, run, type Config, type Outcome } from '../model'
import { useStore } from '../store'

const CANDIDATES: { id: string; label: string; patch: Partial<Config> }[] = [
  { id: 'step2', label: 'step 2 routed live, the way it used to be', patch: { step2Live: true } },
  { id: 'offline', label: 'the save call fails', patch: { network: 'save-fails' } },
  { id: 'stale', label: 'localStorage holds another draft', patch: { staleLocal: true } },
  { id: 'deep', label: 'you come back to a bookmarked /step5', patch: { route: 'explicit-step5' } },
  { id: 'badstep', label: 'current_step holds an unrecognised value', patch: { storedStepOverride: 'unknown' } },
  { id: 'whitelist', label: 'the field whitelist actually applied', patch: { whitelistLive: true } },
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
        Both worlds replay the same event log you built. B differs by one setting and nothing else.
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
            Nowhere. On this event log that setting is not load-bearing. Build a longer run and try
            again.
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
  const lost = o.lostFields.map((l) => FIELDS.find((f) => f.id === l.field)?.label ?? l.field)
  return (
    <div>
      <h4>{title}</h4>
      <dl className="kv">
        <dt>outcome</dt>
        <dd>{o.variant}</dd>
        <dt>at</dt>
        <dd>{String(o.machine.at ?? 'nowhere')}</dd>
        <dt>current_step</dt>
        <dd>{o.machine.serverCurrentStep ?? 'no row'}</dd>
        <dt>resumes on</dt>
        <dd>{o.resumesAt}</dd>
        <dt>lost</dt>
        <dd>{lost.length ? lost.join(', ') : 'nothing'}</dd>
        <dt>defaults</dt>
        <dd>{o.published ? `${o.defaultsUsed} columns` : 'not published'}</dd>
      </dl>
    </div>
  )
}
