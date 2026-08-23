// The claim card, run as a comparison.
//
// Both lanes get the schedule that would really happen under the current lock
// setting: serialized when the lock is on, interleaved when it is off. Only the
// design differs between the two lanes, so the divergence is the design's.

import { initialConfig, run, type Config, type SchedEvent } from '../model'
import { useStore } from '../store'
import { ConfigControls } from './Controls'

const seq = (actor: 'A' | 'B', ...phases: ('lock' | 'check' | 'reserve' | 'insert' | 'commit')[]): SchedEvent[] =>
  phases.map((phase) => ({ t: 'txn', actor, phase }))

/** With a lock held, B waits and then runs after A. */
const SERIALIZED: SchedEvent[] = [
  ...seq('A', 'lock', 'check', 'reserve', 'insert', 'commit'),
  ...seq('B', 'lock', 'check', 'reserve', 'insert', 'commit'),
]

/** Without one, both read before either writes. */
const INTERLEAVED: SchedEvent[] = [
  ...seq('A', 'lock', 'check'),
  ...seq('B', 'lock', 'check'),
  ...seq('A', 'reserve', 'insert', 'commit'),
  ...seq('B', 'reserve', 'insert', 'commit'),
]

export function Lanes() {
  const { config } = useStore()
  const schedule = config.locking === 'none' ? INTERLEAVED : SERIALIZED
  const base: Config = {
    ...initialConfig,
    vendor: config.vendor,
    locking: config.locking,
    slotCapacity: config.slotCapacity,
  }
  const naive = run({ ...base, design: 'overlap-query' }, schedule)
  const slotted = run({ ...base, design: 'slots' }, [{ t: 'materialize' }, ...schedule])
  const same =
    naive.activeBookings === slotted.activeBookings &&
    naive.world.incidents.length === slotted.world.incidents.length &&
    naive.silent === slotted.silent

  return (
    <>
      <p style={{ fontSize: 13, color: 'var(--ink-faint)', marginBottom: 8 }}>
        {config.locking === 'none'
          ? 'Both transactions read before either writes, because nothing is serialising them.'
          : 'B waits on the lock, then runs after A commits.'}
      </p>

      <div className="lanes" data-tour="lanes">
        <Lane
          name="one table, an overlap query"
          o={naive}
          note="WHERE start_at < :end AND end_at > :start"
        />
        <Lane
          name="materialized slots, a counter"
          o={slotted}
          note="capacity_remaining compared against attendee_count"
        />
      </div>

      <div className={`verdictline ${same ? 'same' : 'diff'}`}>
        {same
          ? `With capacity ${config.slotCapacity} and the lock ${config.locking === 'none' ? 'off' : 'on'}, these two designs produce the same result. Change one of the two settings below and they stop agreeing.`
          : 'They diverge here, and the two rows above say exactly how.'}
      </div>

      <ConfigControls keys={['locking', 'slotCapacity']} />
    </>
  )
}

function Lane({ name, o, note }: { name: string; o: ReturnType<typeof run>; note: string }) {
  const bad = o.overbooked || o.silent || !!o.world.crashed
  return (
    <div className={`lane ${bad ? 'bad' : 'ok'}`}>
      <div className="lname">{name}</div>
      <div className="lnote">{note}</div>
      <div className="lresult">
        <span className={bad ? 'gone' : 'good'}>
          {o.silent
            ? `${o.activeBookings} bookings, nothing recorded`
            : o.world.crashed
              ? 'a 500, nothing recorded'
              : `${o.activeBookings} booking(s), ${o.world.incidents.length} incident(s)`}
        </span>
      </div>
      <dl className="kv" style={{ marginTop: 8 }}>
        <dt>capacity</dt>
        <dd className="mono">{o.capacityLine}</dd>
        <dt>refused by</dt>
        <dd>
          {o.incidentsBySource.application_check > 0
            ? 'the application check'
            : o.incidentsBySource.db_constraint > 0
              ? 'the database'
              : 'nothing'}
        </dd>
        <dt>outcome</dt>
        <dd>{o.variant}</dd>
      </dl>
    </div>
  )
}
