// An off-page prompt: where to go, exactly what to do, what to bring back,
// and what the answer means. The check runs against the same embedded
// artifact text the inspector shows.

import { useState } from 'react'
import type { Excursion as Spec, Verdict } from '../engagement'
import { useStore } from '../store'

export function Excursion({ spec }: { spec: Spec }) {
  const s = useStore()
  const [input, setInput] = useState(s.excursions[spec.id] ?? '')
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  return (
    <div className="excursion" data-tour={`excursion:${spec.id}`}>
      <div className="excursion-head">
        <strong>Off this page</strong>
        <span className="where">{spec.where}</span>
      </div>
      <ol className="todo">
        {spec.todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <div className="excursion-return">
        <label>
          bring back: {spec.ret}
          <input
            name={`excursion-${spec.id}`}
            value={input}
            placeholder={spec.placeholder}
            onChange={(e) => {
              setInput(e.target.value)
              setVerdict(null)
            }}
          />
        </label>
        <button
          disabled={!input.trim()}
          onClick={() => {
            const v = spec.verify(input)
            setVerdict(v)
            s.setExcursion(spec.id, input)
          }}
        >
          check it
        </button>
      </div>

      {verdict && (
        <div className={`verdict ${verdict.ok ? 'ok' : 'no'}`}>
          <p>{verdict.detail}</p>
          {verdict.ok && <p className="muted">{spec.means}</p>}
        </div>
      )}
    </div>
  )
}
