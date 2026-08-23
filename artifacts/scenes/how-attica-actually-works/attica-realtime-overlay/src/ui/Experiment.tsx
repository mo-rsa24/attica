// History, reset, replay. Replay is verified live rather than asserted: folding
// the recorded interventions from the baseline must reproduce the current
// encoded state, and the panel says so either way.

import { replayState } from '../lab'
import { encodeState } from '../model'
import { replayMatches, useStore } from '../store'

export function Experiment() {
  const st = useStore()
  const { baseline, history, state, reset } = st
  const ok = replayMatches({ baseline, state, history })

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className="opt" onClick={reset}>
          reset to the baseline
        </button>
        <span className={`pill ${ok ? 'ok' : 'bad'}`}>
          replay {ok ? 'reproduces this state' : 'DIVERGES'}
        </span>
      </div>

      {history.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
          Nothing changed yet. Every control you touch is recorded here as one sentence, and the
          list is enough to reproduce exactly what you are looking at.
        </p>
      ) : (
        <>
          {history.map((h, i) => (
            <div className="hist" key={i}>
              <span className="t">{String(i + 1).padStart(2, '0')}</span> {h.label}
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div className="sect" style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-faint)' }}>
              REPLAYED
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-dim)', wordBreak: 'break-all' }}>
              {encodeState(replayState(baseline, history))}
            </div>
            <div className="sect" style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', marginTop: 8 }}>
              ACTUAL
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-dim)', wordBreak: 'break-all' }}>
              {encodeState(state)}
            </div>
          </div>
        </>
      )}
    </>
  )
}
