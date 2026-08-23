// The counterfactual fork: two worlds from one shared baseline, run by the
// same resolve(), each differing by exactly one intervention. Default
// candidate is backendMode: daphne -> runserver, the claim card's own
// comparison, literally run. A second candidate lets the reader fork
// venv-binding instead.

import { useState } from 'react'
import { changeset } from '../lab'
import { debugConfigOutcomes, encodeState, resolve, type SceneState } from '../model'
import { useStore } from '../store'
import { Lane } from './Lane'

type CandidateKey = 'backend-mode' | 'venv-binding'

export function Fork({ state }: { state: SceneState }) {
  const s = useStore()
  const [key, setKey] = useState<CandidateKey>('backend-mode')

  if (key === 'backend-mode') {
    const worldA = { ...state, backendMode: 'daphne' as const }
    const worldB = { ...state, backendMode: 'runserver' as const }
    const a = resolve(worldA)
    const b = resolve(worldB)
    const wsA = a.requests.find((r) => r.kind === 'ws')!
    const wsB = b.requests.find((r) => r.kind === 'ws')!
    const diff = changeset(a, b)

    return (
      <div>
        <ForkPicker value={key} onChange={setKey} />
        <p className="muted tiny">
          Both worlds share <code>{encodeState(state)}</code> as their baseline, differing only in backendMode. Same
          model, same WS connection attempt, run twice.
        </p>
        <div className="lanes">
          <Lane title="world A: daphne" subtitle="ASGI, both protocols served" trace={wsA} />
          <Lane title="world B: runserver" subtitle="WSGI, no protocol upgrade" trace={wsB} />
        </div>
        <ChangesetList diff={diff} />
        <button
          className="tiny"
          onClick={() => {
            s.applyScenario({ backendMode: 'runserver' }, 'adopt world B: backendMode → runserver')
            s.setForkOpen(false)
          }}
        >
          adopt world B into the scene
        </button>
      </div>
    )
  }

  const worldA = { ...state, selectedVenv: 'lobola' as const }
  const worldB = { ...state, selectedVenv: 'backend-venv' as const }
  const outA = debugConfigOutcomes(worldA).find((d) => d.id === 'django-runserver')!
  const outB = debugConfigOutcomes(worldB).find((d) => d.id === 'django-runserver')!

  return (
    <div>
      <ForkPicker value={key} onChange={setKey} />
      <p className="muted tiny">
        Same debug config launched twice: "Backend: Django Runserver", the only difference is which venv the reader
        imagines they just installed a package into.
      </p>
      <div className="lanes">
        <div className={`lane ${outA.wouldLaunch ? '' : 'lane-failed'}`}>
          <div className="lane-head">
            <strong>world A: installed into lobola</strong>
          </div>
          <p className="because">{outA.reason}</p>
        </div>
        <div className={`lane ${outB.wouldLaunch ? '' : 'lane-failed'}`}>
          <div className="lane-head">
            <strong>world B: installed into backend/venv</strong>
          </div>
          <p className="because">{outB.reason}</p>
        </div>
      </div>
      <button
        className="tiny"
        onClick={() => {
          s.setSelectedVenv('backend-venv')
          s.setForkOpen(false)
        }}
      >
        adopt world B into the scene
      </button>
    </div>
  )
}

function ForkPicker({ value, onChange }: { value: CandidateKey; onChange: (k: CandidateKey) => void }) {
  return (
    <label className="fork-pick">
      compare:
      <select name="fork-candidate" value={value} onChange={(e) => onChange(e.target.value as CandidateKey)}>
        <option value="backend-mode">backendMode: daphne vs runserver (the claim card)</option>
        <option value="venv-binding">venv-binding: lobola vs backend/venv</option>
      </select>
    </label>
  )
}

function ChangesetList({ diff }: { diff: { observable: string; before: string; after: string }[] }) {
  if (diff.length === 0) return <p className="muted">no observable differs from this baseline.</p>
  return (
    <ul className="changes">
      {diff.map((c) => (
        <li key={c.observable}>
          <span className="ch-name">{c.observable}</span>
          <span className="ch-before">A: {c.before}</span>
          <span className="ch-arrow">vs</span>
          <span className="ch-after">B: {c.after}</span>
        </li>
      ))}
    </ul>
  )
}
