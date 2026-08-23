// History, reset, replay. Replay is verified live: folding the recorded
// interventions from the baseline must reproduce exactly what is on screen.

import { replay } from '../lab'
import { encodeState } from '../model'
import { useStore } from '../store'

export function Experiment() {
  const { baseConfig, baseEvents, history, config, events, reset } = useStore()
  const folded = replay(baseConfig, baseEvents, history)
  const ok = encodeState(folded.config, folded.events) === encodeState(config, events)

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <button className="opt" onClick={reset}>
          reset to the baseline
        </button>
        <span className={`pill ${ok ? 'ok' : 'bad'}`}>replay {ok ? 'reproduces this run' : 'DIVERGES'}</span>
      </div>

      {history.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
          Nothing yet. Every control you touch and every button you press is recorded here as one
          sentence, and the list is enough to reproduce exactly what you are looking at.
        </p>
      ) : (
        <>
          {history.map((h, i) => (
            <div className="hist" key={i}>
              <span className="t">{String(i + 1).padStart(2, '0')}</span> {h.label}
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              THIS RUN, ENCODED
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-dim)', wordBreak: 'break-all' }}>
              {encodeState(config, events)}
            </div>
          </div>
        </>
      )}
    </>
  )
}
