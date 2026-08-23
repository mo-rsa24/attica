// The anchored surface: the two transactions as steppable phases, with the rows
// they are fighting over directly underneath and the readouts attached.
//
// Every colour here derives from run(config, events). Nothing decides for itself.

import {
  PHASE_ORDER,
  PHASE_LABEL,
  PHASE_SOURCE,
  type Actor,
  type Config,
  type Outcome,
  type Phase,
} from '../model'
import { useStore } from '../store'

export function Bench({ outcome, config }: { outcome: Outcome; config: Config }) {
  const { fire, events } = useStore()
  const w = outcome.world

  // Which phase each actor has reached, so the next one is the obvious click.
  const reached = (actor: Actor): number => {
    let n = 0
    for (const e of events) if (e.t === 'txn' && e.actor === actor) n++
    return n
  }

  const readouts = [
    {
      k: 'active bookings',
      v: String(outcome.activeBookings),
      tone: outcome.overbooked ? 'bad' : 'ok',
    },
    { k: 'capacity', v: outcome.capacityLine, tone: outcome.overbooked ? 'bad' : 'ok' },
    {
      k: 'incidents recorded',
      v:
        w.incidents.length === 0
          ? 'none'
          : `${outcome.incidentsBySource.application_check} app, ${outcome.incidentsBySource.db_constraint} db`,
      tone: outcome.incidentsBySource.db_constraint > 0 ? 'warn' : 'ok',
    },
    {
      k: 'collisions unrecorded',
      v: outcome.silent ? 'yes' : w.crashed ? 'a 500, no incident' : 'none',
      tone: outcome.silent || w.crashed ? 'bad' : 'ok',
    },
  ] as const

  return (
    <div className="bench">
      <div className="stepper" data-tour="stepper">
        <div className="shead">
          <h3>create_booking, one phase at a time</h3>
          <span className="note">click in any order. the two transactions are independent until a lock says otherwise</span>
        </div>

        {(['A', 'B'] as Actor[]).map((actor) => {
          const t = w.txn[actor]
          const done = reached(actor)
          return (
            <div className="srow" key={actor}>
              <span className={`sactor ${t.phase}`}>{actor}</span>
              {PHASE_ORDER.map((phase, i) => {
                const isDone = i < done
                const isNext = i === done && t.phase !== 'aborted' && t.phase !== 'committed'
                return (
                  <button
                    key={phase}
                    className={`sphase ${isDone ? 'done' : ''} ${isNext ? 'next' : ''} ${t.phase === 'aborted' && i === done - 1 ? 'bad' : ''}`}
                    onClick={() => fire({ t: 'txn', actor, phase }, `${actor}: ${PHASE_LABEL[phase]}`)}
                    title={PHASE_SOURCE[phase]}
                  >
                    <span className="pn">{i + 1}</span>
                    {PHASE_LABEL[phase]}
                  </button>
                )
              })}
              <span className="sstate">
                {t.phase}
                {t.readRemaining !== null && <em> read {t.readRemaining}</em>}
                {t.error && <span className="serr">{t.error}</span>}
              </span>
            </div>
          )
        })}

        <div className="srow lockrow">
          <span className="sactor lock">lock</span>
          <span className="sstate">
            {config.locking === 'none'
              ? 'select_for_update is switched off, so nothing serialises these two'
              : w.lockHeldBy
                ? `held by ${w.lockHeldBy}`
                : 'free'}
          </span>
        </div>
      </div>

      <div className="readouts" data-tour="readouts">
        {readouts.map((r) => (
          <div key={r.k} className={`ro ${r.tone}`}>
            <div className="k">{r.k}</div>
            <div className="v">{r.v}</div>
          </div>
        ))}
      </div>

      <div className="rows">
        <Table
          title="AvailabilitySlot"
          empty={
            w.slots.length === 0
              ? w.skippedNonexistent > 0
                ? 'no rows: that local time does not exist, so it was skipped'
                : 'no rows: nothing materialized, so create_booking takes the overlap-query branch'
              : null
          }
          rows={w.slots.map((s) => ({
            key: s.startLabel,
            cells: [
              s.startLabel.slice(0, 16).replace('T', ' '),
              `${s.capacityReserved} / ${s.capacityTotal}`,
              s.isBookable ? 'bookable' : 'is_bookable=False',
            ],
            tone: !s.isBookable ? 'warn' : s.capacityReserved >= s.capacityTotal ? 'warn' : 'ok',
          }))}
          head={['window', 'reserved / total', 'state']}
        />
        <Table
          title="Booking"
          empty={w.bookings.length === 0 ? 'no rows' : null}
          rows={w.bookings.map((b) => ({
            key: String(b.id),
            cells: [`#${b.id}`, b.actor, b.status],
            tone: outcome.overbooked ? 'bad' : 'ok',
          }))}
          head={['id', 'by', 'status']}
        />
        <Table
          title="BookingConflictIncident"
          empty={
            w.incidents.length === 0
              ? outcome.silent
                ? 'no rows, and that is the problem'
                : 'no rows'
              : null
          }
          rows={w.incidents.map((i, n) => ({
            key: String(n),
            cells: [i.source, i.message],
            tone: i.source === 'db_constraint' ? 'warn' : 'ok',
          }))}
          head={['conflict_source', 'message']}
        />
      </div>

      <p className={`reason ${outcome.silent || w.crashed ? 'bad' : ''}`}>{outcome.reason}</p>
    </div>
  )
}

function Table({
  title,
  head,
  rows,
  empty,
}: {
  title: string
  head: string[]
  rows: { key: string; cells: string[]; tone: string }[]
  empty: string | null
}) {
  return (
    <div className="tbl">
      <div className="tname">{title}</div>
      {empty ? (
        <div className="tempty">{empty}</div>
      ) : (
        <>
          <div className="thead" style={{ gridTemplateColumns: `repeat(${head.length}, auto)` }}>
            {head.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {rows.map((r) => (
            <div
              className={`trow ${r.tone}`}
              key={r.key}
              style={{ gridTemplateColumns: `repeat(${r.cells.length}, auto)` }}
            >
              {r.cells.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export { PHASE_ORDER }
export type { Phase }
