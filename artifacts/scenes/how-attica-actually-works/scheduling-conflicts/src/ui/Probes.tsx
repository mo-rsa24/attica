// Probes and the live checks. Each probe names the claim-card field it serves.

import { PROBES, changeset, replay } from '../lab'
import { CHECKS, INTERLEAVING_COUNT, SWEEP_SIZE } from '../model.checks'
import { run } from '../model'
import { useStore } from '../store'

export function Probes() {
  const { config, events, baseConfig, baseEvents, history } = useStore()
  const o = run(config, events)
  const prevFold = history.length ? replay(baseConfig, baseEvents, history.slice(0, -1)) : null
  const prev = prevFold ? run(prevFold.config, prevFold.events) : null
  const moved = prev ? changeset(prev, o).length : 0

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
        CHECKS, RUN OVER {SWEEP_SIZE.toLocaleString()} RUNS
      </h3>
      <p style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
        Every configuration crossed with all {INTERLEAVING_COUNT} interleavings of two five-phase
        transactions. That is the complete schedule space for two transactions of this shape, not a
        sample of it: C(10,5) = {INTERLEAVING_COUNT}.
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
      {moved > 0 && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 14 }}>
          {moved} observable{moved === 1 ? '' : 's'} moved on your last action.
        </p>
      )}
    </>
  )
}
