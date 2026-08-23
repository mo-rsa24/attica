// Probes and persistent invariants, in the side column, behind the
// "debug configs... " toolbar's neighbor. A probe is a selector over
// resolve(state); the "was" badge is the same selector on the
// pre-intervention state.

import { resolve, type SceneState } from '../model'
import { runChecks } from '../model.checks'
import { PROBES } from '../lab'
import { useStore } from '../store'

export function Probes({ state }: { state: SceneState }) {
  const s = useStore()
  const out = resolve(state)
  const prevOut = s.lastChange ? resolve(s.lastChange.prev) : null
  const checks = runChecks(state)
  const failing = checks.filter((c) => !c.pass)

  return (
    <div className="probes">
      <div className="probe-grid">
        {PROBES.map((p) => {
          const now = p.select(out, state)
          const was = prevOut ? p.select(prevOut, state) : null
          return (
            <div key={p.id} className="probe" title={p.traces}>
              <div className="probe-label">{p.label}</div>
              <div className="probe-value">{now}</div>
              {was !== null && was !== now && <div className="probe-was">was {was}</div>}
            </div>
          )
        })}
      </div>

      <h3>Invariants</h3>
      <ul className="checks tiny">
        {checks.map((c) => (
          <li key={c.name} className={c.pass ? 'pass' : 'fail'}>
            <span className="mark">{c.pass ? 'holds' : 'FAILED'}</span>
            {c.name}
            <div className="muted tiny">{c.detail}</div>
          </li>
        ))}
      </ul>
      {failing.length > 0 && (
        <p className="muted tiny">a failing invariant means the scene's model drifted from the rule it claims.</p>
      )}
    </div>
  )
}
