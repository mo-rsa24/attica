// The event log is the timeline. Scrubbing folds a prefix, which is what makes
// this a dynamic model rather than a configuration with an animation on top.

import { EVENT_LABEL, FIELDS, runPrefix, type Config, type MachineEvent } from '../model'
import { useStore } from '../store'

export function EventLog({ config, events }: { config: Config; events: MachineEvent[] }) {
  const { upTo, setUpTo } = useStore()
  const n = events.length
  const shown = upTo ?? n

  if (n === 0) {
    return (
      <div className="log">
        <div className="loghead">
          <h3>what you did</h3>
          <span className="note">nothing yet. Press a control above, or run one of the scenarios.</span>
        </div>
      </div>
    )
  }

  const at = runPrefix(config, events, shown)

  return (
    <div className="log" data-tour="log">
      <div className="loghead">
        <h3>what you did</h3>
        <span className="note">
          {shown} of {n} events
          {shown < n ? ', folded to here' : ''}
        </span>
        <span className="spacer" />
        {shown < n && (
          <button className="opt" onClick={() => setUpTo(null)}>
            back to the end
          </button>
        )}
      </div>

      <div className="ticks">
        {events.map((e, i) => {
          const label = e.t === 'edit' ? FIELDS.find((f) => f.id === e.field)?.label ?? e.field : EVENT_LABEL[e.t]
          const past = i < shown
          return (
            <button
              key={i}
              className={`tick ${past ? 'past' : ''} ${i === shown - 1 ? 'sel' : ''} k-${e.t}`}
              onClick={() => setUpTo(i + 1 === shown ? null : i + 1)}
              title={`${i + 1}. ${label}`}
            >
              <span className="bar" />
              <span className="n">{i + 1}</span>
            </button>
          )
        })}
      </div>

      <div className="logdetail">
        {at.machine.transcript.length === 0 ? (
          <span className="dim">nothing has happened yet</span>
        ) : (
          <div className="term">
            {at.machine.transcript.slice(-6).map((line, i) => (
              <div key={i} className={line.includes('FAILED') || line.includes('Save failed') ? 'err' : line.includes('no save') || line.includes('useState only') ? 'warnln' : ''}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
