// What that did. Diffed between the model's two outcomes, and honestly named:
// this says what changed, never why. Why is the model's own provenance chain.

import { changeset, replay } from '../lab'
import { run } from '../model'
import { useStore } from '../store'

export function Changeset() {
  const { baseConfig, baseEvents, history, config, events } = useStore()
  if (history.length === 0) return null

  const prevFold = replay(baseConfig, baseEvents, history.slice(0, -1))
  const prev = run(prevFold.config, prevFold.events)
  const now = run(config, events)
  const diff = changeset(prev, now)
  const last = history[history.length - 1]

  return (
    <div className="card changeset">
      <h3 style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--mono)' }}>{last.label}</h3>
      {diff.length === 0 ? (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-dim)' }}>
          Nothing observable changed. That action is not load-bearing here, which is a real answer
          rather than a missing one.
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
      {now.provenance.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-faint)' }}>why?</summary>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {now.provenance.map((p, i) => (
              <div key={i} style={{ fontSize: 12.5 }}>
                <span className="mono" style={{ color: 'var(--ink-dim)' }}>
                  {p.from}
                </span>
                <span style={{ color: 'var(--ink-faint)' }}> → </span>
                <span className="mono">{p.to}</span>
                <div style={{ color: 'var(--ink-faint)', fontSize: 12, paddingLeft: 12 }}>{p.because}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
