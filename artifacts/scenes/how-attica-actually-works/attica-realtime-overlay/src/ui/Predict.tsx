// Commit before reveal. The options are the model's own variant list, so nobody
// authored a correct answer and nobody can author a wrong one. The answer is
// run(state with the patch applied), evaluated at click time.
//
// No score, no streak, no progress bar. The single commit is what makes a wrong
// answer stick; a running tally would just invite optimizing a number.

import { useState } from 'react'
import { VARIANTS, run, type SceneState } from '../model'
import { useStore } from '../store'

export function Predict({
  question,
  patch,
  label,
}: {
  question: string
  patch: Partial<SceneState>
  label: string
}) {
  const { state, apply } = useStore()
  const [picked, setPicked] = useState<string | null>(null)
  const truth = run({ ...state, ...patch })

  return (
    <div className="predict">
      <div className="q">{question}</div>
      {picked === null ? (
        <div className="opts">
          {VARIANTS.map((v) => (
            <button key={v.id} onClick={() => setPicked(v.id)}>
              <strong>{v.label}</strong>
              <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>{v.blurb}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="verdict">
          <span className={`pill ${picked === truth.variant ? 'ok' : 'bad'}`}>
            {picked === truth.variant ? 'that is what happens' : 'not what happens'}
          </span>
          <p style={{ marginTop: 9 }}>
            {picked !== truth.variant && (
              <>
                You said <em>{VARIANTS.find((v) => v.id === picked)?.label}</em>. It is{' '}
                <em>{VARIANTS.find((v) => v.id === truth.variant)?.label}</em>.{' '}
              </>
            )}
            {truth.reason}
          </p>
          <button
            className="opt"
            onClick={() =>
              apply({
                target: Object.keys(patch)[0],
                operation: 'scenario',
                label,
                patch,
              })
            }
          >
            put the scene in that state
          </button>
        </div>
      )}
    </div>
  )
}
