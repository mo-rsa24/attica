// The "what that did" strip: after every intervention, the observables that
// actually became different, diffed between the model's two outcomes. The
// "why" expander renders the model's own provenance chain and nothing else.

import { useState } from 'react'
import { resolve } from '../model'
import { changeset } from '../lab'
import { useStore } from '../store'

export function Changeset() {
  const s = useStore()
  const [why, setWhy] = useState(false)
  if (!s.lastChange) return null

  const prev = resolve(s.lastChange.prev)
  const next = resolve(s.lastChange.next)
  const changes = changeset(prev, next)
  const last = s.history.at(-1)

  return (
    <div className="changeset">
      <div className="changeset-head">
        <strong>{last?.label ?? 'change'}</strong>
        <span className="grow" />
        <button onClick={() => setWhy(!why)}>{why ? 'hide why' : 'why?'}</button>
        <button
          onClick={() => {
            setWhy(false)
            s.dismissChange()
          }}
        >
          dismiss
        </button>
      </div>

      {changes.length === 0 ? (
        <p className="muted tiny">no observable changed: this variable is not load-bearing in the current configuration.</p>
      ) : (
        <ul className="changes">
          {changes.map((c) => (
            <li key={c.observable}>
              <span className="ch-name">{c.observable}</span>
              <span className="ch-before">{c.before}</span>
              <span className="ch-arrow">→</span>
              <span className="ch-after">{c.after}</span>
            </li>
          ))}
        </ul>
      )}

      {why && (
        <div className="provenance">
          <p className="muted tiny">the model's own why-chain, in the order it computes:</p>
          <ul>
            {next.provenance.map((p) => (
              <li key={p.observable}>
                <span className="pv-from">{p.from.join(' + ')}</span>
                <span className="ch-arrow">→</span>
                <strong>{p.observable}</strong> = {p.value}
                <div className="muted tiny">{p.because}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
