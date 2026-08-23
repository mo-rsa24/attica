// Commit before reveal. The options are the model's own variant list, and the
// answer is run() on the patched configuration and schedule at click time.

import { useState } from 'react'
import { VARIANTS, run, type Config, type SchedEvent } from '../model'
import { useStore } from '../store'

export function Predict({
  question,
  patch,
  events,
  label,
}: {
  question: string
  patch: Partial<Config>
  events: SchedEvent[]
  label: string
}) {
  const { config, loadScenario } = useStore()
  const [picked, setPicked] = useState<string | null>(null)
  const truth = run({ ...config, ...patch }, events)

  return (
    <div className="predict">
      <div className="q">{question}</div>
      {picked === null ? (
        <div className="opts">
          {VARIANTS.filter((v) => v.id !== 'nothing-yet').map((v) => (
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
          <button className="opt" onClick={() => loadScenario('predict', events, patch, label)}>
            run it on the bench
          </button>
        </div>
      )}
    </div>
  )
}
