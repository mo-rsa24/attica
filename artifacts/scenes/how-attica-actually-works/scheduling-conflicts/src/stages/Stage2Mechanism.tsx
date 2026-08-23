// Stage 2: the load-bearing machinery, named exactly. The longest stage.

import { EXCURSIONS } from '../engagement'
import { run } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { ConfigControls } from '../ui/Controls'
import { Excursion } from '../ui/Excursion'

export function Stage2Mechanism() {
  const { config, events, setFocus } = useStore()
  const o = run(config, events)
  const statuses = EXCURSIONS.find((e) => e.id === 'statuses')!

  return (
    <>
      <div className="card">
        <h2>Two locks, then a counter, then one try block</h2>
        <p className="lede">
          create_booking is one transaction with a fixed order inside it, and the order is the whole
          design. The map above opens: double-click <strong>Booking</strong> to see these five
          phases as places.
        </p>
        <CodeBlock snippet="createBooking" hot={580} caption="The comment says why the slots are locked first: so concurrent approvals are serialised at the DB level." />
        <p style={{ marginBottom: 0 }}>
          Two locks, in order. The resource row first, which serializes every booking attempt against
          that resource. Then the overlapping slots, which is what makes the capacity read safe to act
          on. With both held, the gap between the check and the reserve is not a gap any other
          transaction can get into.{' '}
          <button className="opt" onClick={() => setFocus('booking')}>
            open the transaction →
          </button>
        </p>
      </div>

      <div className="card">
        <h3>The branch that decides which design you are running</h3>
        <p>
          <code>if slots:</code> compares a counter. <code>else:</code> runs the overlap query and
          treats the resource as single-capacity, and the comment in the source says exactly that.
          The naive design is not a strawman here; it is the fallback path.
        </p>
        <p>
          Which branch runs is not a setting anyone chose. It depends entirely on whether the
          materialize job has produced rows for this window, and on whether a blackout has set
          <code> is_bookable=False</code>, because <code>_lock_overlapping_slots</code> filters on
          that flag.
        </p>
        <CodeBlock snippet="locks" hot={350} />
        <p style={{ marginBottom: 0 }}>
          Right now the bench is on the <strong>{config.design}</strong> branch with{' '}
          <strong>{o.capacityLine}</strong>.
        </p>
        <ConfigControls keys={['slotCapacity', 'attendees']} />
      </div>

      <div className="card">
        <h3>Capacity is why the extra models exist at all</h3>
        <p>
          With <code>capacity_total = 1</code> the slot design and the overlap query agree on every
          input. Everything the extra models buy you appears above one: the check is
          <code> capacity_remaining &lt; attendee_count</code>, so five seats can be sold as five
          bookings of one, or one of three and one of two, and refused for a second three.
        </p>
        <p style={{ marginBottom: 0 }}>
          That is the sentence the whole architecture is paying for. If every resource in your
          marketplace has capacity 1 forever, the overlap query was the right call.
        </p>
      </div>

      <div className="card">
        <h3>The two places the database can say no</h3>
        <p>
          One is ordinary and present everywhere: the check constraint that
          <code> capacity_reserved</code> never exceeds <code>capacity_total</code>. The other is a
          GiST exclusion constraint over the time range, and it is created by a migration whose first
          statement is a vendor test.
        </p>
        <CodeBlock snippet="exclusion" hot={8} caption="Two lines in, and on anything but Postgres the function is already finished." />
        <p>
          The status list in that WHERE clause is <code>Booking.ACTIVE_STATES</code>, written out a
          second time in SQL. Nothing keeps the two in step.
        </p>
        <Excursion ex={statuses} />
      </div>

      <div className="card">
        <h3>The one try block, and what it is really for</h3>
        <p>
          Exactly one place in create_booking converts an <code>IntegrityError</code> into a
          <code> ConflictError</code> and records an incident, and it wraps the INSERT.
        </p>
        <CodeBlock snippet="dbCatch" hot={653} />
        <p>
          On SQLite nothing can raise from that INSERT, because the constraint that would is not
          there. So the branch is dormant in development and load-bearing in production, which is an
          uncomfortable place for a branch to be.
        </p>
        <p style={{ marginBottom: 0 }}>
          Note also what is <em>not</em> inside it. <code>_reserve_capacity</code> runs a few lines
          earlier, outside any try, and it is an UPDATE against a check constraint that does exist.
          Stage 3 is what that costs.
        </p>
        <ConfigControls keys={['vendor']} />
      </div>

      <div className="card">
        <h3>Recording which layer caught it</h3>
        <p>
          This is the part that has no equivalent in the naive design at all.
          <code> BookingConflictIncident</code> exists only to record collisions, and
          <code> conflict_source</code> says whether the application caught it or the database did.
        </p>
        <p>
          The distinction is operational, not academic. An <code>application_check</code> incident is
          the system working: something was refused before any write. A <code>db_constraint</code>{' '}
          incident means the application check let it through and only the constraint stopped it,
          which is a bug report about the application, delivered by the database.
        </p>
        <CodeBlock snippet="monitor" hot={3265} caption="And the monitor that reads them back, which only asks the constraint question on postgresql." />
        <p style={{ marginBottom: 0 }}>
          Current split: <strong>{o.incidentsBySource.application_check}</strong> application_check,{' '}
          <strong>{o.incidentsBySource.db_constraint}</strong> db_constraint.
        </p>
      </div>

      <div className="card">
        <h3>Idempotency is a different problem from conflict</h3>
        <p>
          A conflict is two people wanting one window. A duplicate is one person's request arriving
          twice, because a proxy retried or a phone lost signal after the write and before the
          response. The overlap query cannot tell those apart: the second arrival looks exactly like
          a conflict with the booking the first arrival just made.
        </p>
        <CodeBlock snippet="idem" hot={123} />
        <p style={{ marginBottom: 0 }}>
          The key alone is not enough, which is why the request hash is compared too. Same key and
          same payload replays the stored response. Same key and a different payload raises, because
          that is a client bug and silently returning the old booking would hide it.
        </p>
        <ConfigControls keys={['idem']} />
      </div>
    </>
  )
}
