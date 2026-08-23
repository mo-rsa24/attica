// Commit before the intervention fires. The options are the model's own
// outcome space; the correct answer is the prediction's answer() function
// run at click time. No answer is written down here, so no answer can be
// wrong here.

import { useState } from 'react'
import type { Prediction } from '../engagement'
import type { SceneState } from '../model'
import { useStore } from '../store'

export function Predict<K extends string>({
  id,
  prediction,
  state,
}: {
  id: string
  prediction: Prediction<K>
  state: SceneState
}) {
  const s = useStore()
  const [choice, setChoice] = useState<K | null>(null)
  const committed = s.predictions[id] as K | undefined

  const actual = prediction.answer(state)

  if (committed) {
    const right = committed === actual
    return (
      <div className={`predict done ${right ? 'right' : 'wrong'}`}>
        <div className="predict-verdict">{right ? 'You called it.' : 'Not that.'}</div>
        <p>
          You said <em>{label(prediction, committed)}</em>. What happened: <em>{label(prediction, actual)}</em>.
        </p>
      </div>
    )
  }

  return (
    <div className="predict">
      <div className="predict-q">{prediction.question}</div>
      {prediction.options.map((o) => (
        <label key={o.key} className={choice === o.key ? 'opt on' : 'opt'}>
          <input type="radio" name={`predict-${id}`} checked={choice === o.key} onChange={() => setChoice(o.key)} />
          <span>{o.label}</span>
        </label>
      ))}
      <button
        disabled={!choice}
        onClick={() => {
          if (!choice) return
          s.commitPrediction(id, choice)
        }}
      >
        commit, then check
      </button>
      <p className="muted tiny">Nothing is scored or kept beyond this one comparison.</p>
    </div>
  )
}

function label<K extends string>(prediction: Prediction<K>, k: K) {
  return prediction.options.find((o) => o.key === k)!.label
}
