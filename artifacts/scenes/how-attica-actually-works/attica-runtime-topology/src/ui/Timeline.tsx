// The Request Timeline drawer: arm the two breakpoints and scrub the fixed
// seven-event request lifecycle. Stage 4's main content reads the same
// shared playhead and breakpoint state, so scrubbing here and scrubbing in
// stage 4 are the same action, never two truths.

import { allBreakpointHits, LIFECYCLE_STEPS } from '../lifecycle'
import { useStore } from '../store'

export function Timeline() {
  const s = useStore()
  const hits = allBreakpointHits(s.breakpointsArmed)

  return (
    <div>
      <p className="muted tiny">
        The fixed sequence one "save" click actually goes through. Scrub it, or arm a breakpoint and watch where
        execution would actually stop.
      </p>

      <div className="bp-arm">
        <label className="switch">
          <input type="checkbox" checked={s.breakpointsArmed.frontend} onChange={() => s.toggleBreakpoint('frontend')} />
          <span>frontend breakpoint: ListingStep1.jsx save handler</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={s.breakpointsArmed.backend} onChange={() => s.toggleBreakpoint('backend')} />
          <span>backend breakpoint: EventDraftViewSet.partial_update</span>
        </label>
      </div>

      <input
        name="request-lifecycle-playhead"
        type="range"
        min={0}
        max={LIFECYCLE_STEPS.length - 1}
        value={s.requestLifecyclePlayhead}
        onChange={(e) => s.setPlayhead(Number(e.target.value))}
        className="scrub"
      />
      <div className="stepbar">
        {LIFECYCLE_STEPS.map((st) => (
          <button key={st.id} className={st.index === s.requestLifecyclePlayhead ? 'on' : ''} onClick={() => s.setPlayhead(st.index)}>
            {st.index + 1}
          </button>
        ))}
        <span className="muted tiny">{LIFECYCLE_STEPS[s.requestLifecyclePlayhead].title}</span>
      </div>

      {hits.length === 0 ? (
        <p className="muted tiny">no breakpoint armed: the request runs straight through, all seven events.</p>
      ) : (
        <div className="bp-hits">
          <strong>which breakpoint fires first?</strong>
          <ol>
            {hits.map((h) => (
              <li key={h.which}>
                <span className={`badge ${h.which === 'frontend' ? '' : 'dim'}`}>{h.which}</span> stops at event{' '}
                {h.atIndex + 1} ({h.step.title})
              </li>
            ))}
          </ol>
          {hits.length === 2 && (
            <p className="because">
              the frontend breakpoint fires first because the request has not left the browser yet; the backend
              breakpoint cannot fire until Django receives it, which is strictly later in wall-clock time. Two
              debuggers, two processes, one order.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
