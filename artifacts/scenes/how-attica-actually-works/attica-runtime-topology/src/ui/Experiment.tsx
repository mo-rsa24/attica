// The experiment surface: the semantic intervention history, reset, and the
// replay check. Replay is verified live: folding the recorded patches from
// the baseline must land exactly on the current encoded state.

import { encodeState, type SceneState } from '../model'
import { replayState } from '../lab'
import { useStore } from '../store'

export function Experiment({ state }: { state: SceneState }) {
  const s = useStore()
  const replayOk = encodeState(replayState(s.baseline, s.history)) === encodeState(state)
  const shown = s.history.slice(-8)

  return (
    <div>
      <button onClick={s.reset}>reset to the baseline</button>

      {s.history.length === 0 ? (
        <p className="muted tiny">
          no interventions yet. Everything you change is recorded here as a plain sentence, and reset returns to this
          baseline.
        </p>
      ) : (
        <>
          <ol className="ivlist" start={Math.max(1, s.history.length - shown.length + 1)}>
            {shown.map((iv, i) => (
              <li key={i}>{iv.label}</li>
            ))}
          </ol>
          {s.history.length > shown.length && (
            <p className="muted tiny">{s.history.length - shown.length} earlier interventions not shown</p>
          )}
          <p className={`tiny ${replayOk ? 'muted' : 'replay-bad'}`}>
            {replayOk
              ? `replay check: reapplying all ${s.history.length} interventions from the baseline reproduces this exact state.`
              : 'replay check FAILED: the history does not reproduce the current state.'}
          </p>
        </>
      )}
    </div>
  )
}
