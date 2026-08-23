// Commit before reveal. The options are the model's own variant list, so nobody
// authored a correct answer and nobody can author a wrong one. The answer is
// run() on the patched configuration, evaluated at click time.

import { useState } from 'react'
import { VARIANTS, run, type Config, type MachineEvent } from '../model'
import { useStore } from '../store'

export function Predict({
  question,
  patch,
  events,
  label,
}: {
  question: string
  patch: Partial<Config>
  /** The run to judge against. Falls back to the reader's own log. */
  events?: MachineEvent[]
  label: string
}) {
  const { config, events: live, setConfig, loadScenario } = useStore()
  const [picked, setPicked] = useState<string | null>(null)
  const log = events ?? live
  const truth = run({ ...config, ...patch }, log)

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
          <button
            className="opt"
            onClick={() => {
              if (events) loadScenario('predict', events, patch, label)
              else setConfig(patch, label)
            }}
          >
            put the machine in that state
          </button>
        </div>
      )}
    </div>
  )
}
