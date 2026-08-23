import { allBreakpointHits, LIFECYCLE_STEPS } from '../lifecycle'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'

export function Stage4Build() {
  const s = useStore()
  const i = s.requestLifecyclePlayhead
  const step = LIFECYCLE_STEPS[i]
  const hits = allBreakpointHits(s.breakpointsArmed)
  const isBreakpointHere = hits.find((h) => h.atIndex === i)

  return (
    <section data-tour="stage-4">
      <h1>Build it</h1>
      <p className="lede">
        Arm both breakpoints, fire one real "save" click, and step both call stacks in sync. This is the literal
        walkthrough: the frontend breakpoint is <code>ListingStep1.jsx</code>'s <code>saveStep</code> call, the
        backend breakpoint is <code>EventDraftViewSet.partial_update</code>.
      </p>

      <div className="bp-arm">
        <label className="switch">
          <input type="checkbox" checked={s.breakpointsArmed.frontend} onChange={() => s.toggleBreakpoint('frontend')} />
          <span>frontend breakpoint armed</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={s.breakpointsArmed.backend} onChange={() => s.toggleBreakpoint('backend')} />
          <span>backend breakpoint armed</span>
        </label>
      </div>

      <div className="stepbar">
        {LIFECYCLE_STEPS.map((st) => (
          <button key={st.id} className={st.index === i ? 'on' : ''} onClick={() => s.setPlayhead(st.index)}>
            {st.index + 1}
          </button>
        ))}
        <span className="muted tiny">event {i + 1} of {LIFECYCLE_STEPS.length}: {step.title}</span>
      </div>

      {isBreakpointHere && (
        <div className="callout bp-stop">
          <strong>{isBreakpointHere.which} breakpoint stops here.</strong> Execution on this side does not continue
          past this line until you step past it in the real debugger.
        </div>
      )}

      <div className="buildstep">
        <div className="motivation">
          <strong>{step.side === 'network' ? 'crosses the seam' : `on the ${step.side}`}.</strong> {step.note}
        </div>

        {step.panels.map((p) => (
          <CodeBlock key={p.file} code={p.code} lang={p.lang} active={p.activeLines} caption={p.file} />
        ))}

        <h3>call stack at this instant</h3>
        <ol className="callstack">
          {step.stack.map((frame) => (
            <li key={frame}>
              <code>{frame}</code>
            </li>
          ))}
        </ol>
      </div>

      <div className="nav">
        <button disabled={i === 0} onClick={() => s.setPlayhead(i - 1)}>
          previous
        </button>
        <button disabled={i === LIFECYCLE_STEPS.length - 1} onClick={() => s.setPlayhead(i + 1)}>
          next
        </button>
      </div>

      <div className="callout">
        <strong>Exit check.</strong> With both breakpoints armed, the frontend one fires at event 1 (the request has
        not left the browser yet) and the backend one fires at event 3 (Django just received it), strictly later in
        wall-clock time. That ordering, not either breakpoint alone, is what "two debuggers, stepping in sync" means:
        you attach one to the Node process (or Chrome) and one to whichever Python process is actually serving :8000,
        and you need both, because neither call stack contains the other.
      </div>
    </section>
  )
}
