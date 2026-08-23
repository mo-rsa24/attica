// The schedule is the timeline. Scrubbing folds a prefix, so the bench and the
// log are two views of one execution.

import { PHASE_LABEL, runPrefix, type Config, type SchedEvent } from '../model'
import { useStore } from '../store'

const shortLabel = (e: SchedEvent): string => {
  switch (e.t) {
    case 'txn':
      return `${e.actor} ${PHASE_LABEL[e.phase]}`
    case 'tick':
      return `+${e.minutes}m`
    case 'materialize':
      return 'materialize'
    case 'run-expire-holds':
      return 'expire holds'
    case 'run-expire-requests':
      return 'expire requests'
    default:
      return `${e.actor} ${e.t}`
  }
}

export function EventLog({ config, events }: { config: Config; events: SchedEvent[] }) {
  const { upTo, setUpTo } = useStore()
  const n = events.length
  const shown = upTo ?? n

  if (n === 0) {
    return (
      <div className="log">
        <div className="loghead">
          <h3>the schedule</h3>
          <span className="note">nothing yet. materialize the slots, then step the two transactions.</span>
        </div>
      </div>
    )
  }

  const at = runPrefix(config, events, shown)

  return (
    <div className="log" data-tour="log">
      <div className="loghead">
        <h3>the schedule</h3>
        <span className="note">
          {shown} of {n} steps{shown < n ? ', folded to here' : ''}
        </span>
        <span className="spacer" />
        {shown < n && (
          <button className="opt" onClick={() => setUpTo(null)}>
            back to the end
          </button>
        )}
      </div>

      <div className="ticks">
        {events.map((e, i) => (
          <button
            key={i}
            className={`tick ${i < shown ? 'past' : ''} ${i === shown - 1 ? 'sel' : ''} ${
              e.t === 'txn' ? `a-${e.actor}` : 'job'
            }`}
            onClick={() => setUpTo(i + 1 === shown ? null : i + 1)}
            title={`${i + 1}. ${shortLabel(e)}`}
          >
            <span className="bar" />
            <span className="n">{shortLabel(e)}</span>
          </button>
        ))}
      </div>

      <div className="logdetail">
        <div className="term">
          {at.world.log.slice(-8).map((line, i) => (
            <div
              key={i}
              className={
                line.includes('IntegrityError') || line.includes('ConflictError') || line.includes('WARNING')
                  ? 'err'
                  : line.includes('uncaught') || line.includes('no exclusion constraint')
                    ? 'warnln'
                    : ''
              }
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
