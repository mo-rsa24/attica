import { LIFECYCLE_STEPS } from '../lifecycle'
import { jwtOutcome, type SceneState } from '../model'
import { findComponent } from '../components'
import { useStore } from '../store'

export function Stage1Minimal({ state }: { state: SceneState }) {
  const s = useStore()
  const jwt = jwtOutcome(state)
  const c = findComponent('jwt-refresh-interceptor')!

  return (
    <section>
      <h1>The minimal version</h1>
      <p className="lede">
        No WebSocket, no Redis: the smallest thing that is still a real round trip. One field on the event-creation
        wizard, one PATCH, through Vite's proxy, into DRF, through a serializer, onto a model row, back out as JSON,
        and React re-renders. Stage 4 walks this exact sequence in real code; here it is just the shape.
      </p>

      <ol className="minimal-flow">
        {LIFECYCLE_STEPS.map((step) => (
          <li key={step.id} className={`flow-step flow-${step.side}`}>
            <span className="flow-title">{step.title}</span>
            <span className="muted tiny">{step.note}</span>
          </li>
        ))}
      </ol>

      <h3>{c.label}</h3>
      <p>{c.what}</p>
      <label className="switch">
        <input type="checkbox" checked={state.jwtInterceptorEnabled} onChange={(e) => s.set('jwtInterceptorEnabled', e.target.checked)} />
        <span>{state.jwtInterceptorEnabled ? 'on' : 'off'}</span>
      </label>
      <p className="because">{jwt.because}</p>
      {!jwt.ok && <code className="reach-err">{jwt.errorString}</code>}

      <div className="callout">
        <strong>Exit check.</strong> This round trip never mentions Redis or a WebSocket, and it does not need to: it
        is the one path in this scene that survives every Redis toggle untouched, which stage 2 turns into a checked
        invariant instead of an assertion.
      </div>
    </section>
  )
}
