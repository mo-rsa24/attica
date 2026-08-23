// Drives the journey one real request at a time, and stops for a prediction before
// the three steps whose outcome the names get wrong.

import { STEPS } from '../model/journey'
import { PREDICTIONS } from '../engagement'
import { useScene } from '../store'

export function Runner() {
  const { cursor, advance, rewindTo, pending, ask, answer, clearPending } = useScene()
  const next = STEPS[cursor]
  const done = cursor >= STEPS.length

  const onRun = () => {
    if (!next) return
    const p = PREDICTIONS.find((x) => x.stepId === next.id)
    if (p && (!pending || pending.stepId !== next.id)) {
      ask({ stepId: next.id, question: p.question, options: p.options, correct: p.correct, chosen: null })
      return
    }
    clearPending()
    advance()
  }

  const active = pending && next && pending.stepId === next.id ? pending : null
  const reveal = active?.chosen !== null && active ? PREDICTIONS.find((p) => p.stepId === active.stepId) : null

  return (
    <>
      <div className="runner" data-tour="tour-run">
        <button className="run-btn" onClick={onRun} disabled={done}>
          {done ? 'journey complete' : active ? (active.chosen === null ? 'commit first' : 'run it') : 'run next request'}
        </button>
        <span className="run-next">
          {next ? next.label : 'every step has run'}
          <span className="k">{next ? `stage ${next.stage} · ${next.id}` : `${STEPS.length} steps`}</span>
        </span>
        {cursor > 0 && (
          <button className="ghost" onClick={() => rewindTo(cursor - 1)}>
            back
          </button>
        )}
        <div className="progress">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`pip${i < cursor ? ' done' : i === cursor ? ' now' : ''}`} title={s.label} />
          ))}
        </div>
      </div>

      {active && (
        <div className="predict">
          <div className="q">{active.question}</div>
          <div className="opts">
            {active.options.map((o, i) => (
              <button
                key={i}
                className={
                  active.chosen === null
                    ? ''
                    : i === active.correct
                      ? 'right'
                      : i === active.chosen
                        ? 'wrong'
                        : ''
                }
                onClick={() => active.chosen === null && answer(i)}
              >
                {o}
              </button>
            ))}
          </div>
          {reveal && <div className="reveal">{reveal.reveal}</div>}
        </div>
      )}
    </>
  )
}
