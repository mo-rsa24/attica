// Probes and the live checks. Each probe names the claim-card field it serves;
// a probe that served none would be cut, which is the animation rule applied to
// instruments.

import { PROBES, changeset, replayState } from '../lab'
import { CHECKS } from '../model.checks'
import { run } from '../model'
import { useStore } from '../store'

export function Probes() {
  const { state, baseline, history } = useStore()
  const o = run(state)
  const prev = history.length ? run(replayState(baseline, history.slice(0, -1))) : null
  const changed = prev ? new Set(changeset(prev, o).map((c) => c.observable)) : new Set<string>()

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        {PROBES.map((p) => {
          const v = p.select(o)
          const was = prev ? p.select(prev) : null
          const ok = p.healthy ? p.healthy(o) : true
          return (
            <div className="probe" key={p.id}>
              <div className="top">
                <span className="name">{p.label}</span>
                <span className={`val ${ok ? 'ok' : 'bad'}`}>{v}</span>
              </div>
              <div className="tr">{p.traces}</div>
              {was && was !== v && <div className="was">was {was}</div>}
            </div>
          )
        })}
      </div>

      <h3 style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', marginBottom: 8 }}>
        CHECKS, RUN OVER ALL 256 CONFIGURATIONS
      </h3>
      <p style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
        These sweep the whole state space on every render, not just the one you are looking at. The
        first is the claim itself. If any of them goes red, the scene is wrong and you should believe
        the check.
      </p>
      {CHECKS.map((c) => {
        const r = c.run()
        return (
          <div className="chk" key={c.id}>
            <span className={`mark ${r.ok ? 'ok' : 'bad'}`}>{r.ok ? '✓' : '✗'}</span>
            <span>
              {c.label}
              <div className="det">{r.detail}</div>
              <div className="det" style={{ opacity: 0.75 }}>
                defends {c.defends}
              </div>
            </span>
          </div>
        )
      })}
      {changed.size > 0 && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 14 }}>
          {changed.size} observable{changed.size === 1 ? '' : 's'} moved on your last intervention.
        </p>
      )}
    </>
  )
}
