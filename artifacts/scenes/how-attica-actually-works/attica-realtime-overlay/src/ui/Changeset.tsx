// What that did. Mechanically diffed between the model's two outcomes, and
// honestly named: this answers *what changed*, never *why*. Why is the model's
// own provenance chain, rendered separately and only where the model emits it.

import { changeset, replayState } from '../lab'
import { run } from '../model'
import { useStore } from '../store'

export function Changeset() {
  const { baseline, history, state } = useStore()
  if (history.length === 0) return null

  const prev = replayState(baseline, history.slice(0, -1))
  const diff = changeset(run(prev), run(state))
  const last = history[history.length - 1]

  return (
    <div className="card" data-tour="changeset">
      <h3 style={{ fontSize: 13, color: 'var(--ink-faint)', fontFamily: 'var(--mono)' }}>
        {last.label}
      </h3>
      {diff.length === 0 ? (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-dim)' }}>
          Nothing observable changed. That control is not load-bearing in this configuration, which
          is a real answer, not a missing one.
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
      <Why />
    </div>
  )
}

function Why() {
  const { state } = useStore()
  const o = run(state)
  if (o.provenance.length === 0) return null
  return (
    <details style={{ marginTop: 10 }}>
      <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--ink-faint)' }}>why?</summary>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {o.provenance.map((p, i) => (
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
  )
}
