// Stage 1: the smallest thing that genuinely exhibits the concept. Whole
// artifacts, not abstractions of them.

import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { ConfigControls } from '../ui/Controls'

export function Stage1Minimal() {
  const { fire } = useStore()
  return (
    <>
      <div className="card">
        <h2>One rule, one run, one row</h2>
        <p className="lede">
          Availability starts as something you cannot book: a recurring pattern with a local start
          time, a set of weekdays, and a capacity. Materialization is the job that turns it into rows
          that exist.
        </p>
        <div className="ctl">
          <button className="opt" onClick={() => fire({ t: 'materialize' }, 'ran materialize_availability_slots')}>
            run materialize_availability_slots
          </button>
          <span className="dnote">watch the AvailabilitySlot table above fill in</span>
        </div>
      </div>

      <div className="card">
        <h3>1. The rule is a pattern, not a row you can book</h3>
        <p>
          <code>frequency</code>, <code>weekdays</code>, a local start and end time, an effective
          range, and a capacity. Nothing here is a bookable window: 18:00 to 22:00 on Saturdays is
          not a thing you can hold, it is a description of many things.
        </p>
        <p style={{ marginBottom: 0 }}>
          The times are local, and the timezone is a column on the rule. That is deliberate, and it
          is why the next step can fail in a way that surprises people.
        </p>
      </div>

      <div className="card">
        <h3>2. Materializing walks the dates and converts each one</h3>
        <p>
          For each date the rule matches, the local window is resolved against the rule's timezone
          and converted to UTC. Then exceptions are applied, and then the row is created or found.
        </p>
        <CodeBlock snippet="materialize" hot={2522} caption="get_or_create, not create. That is the whole idempotency story." />
        <p style={{ marginBottom: 0 }}>
          Run it twice and the second run reports <code>slots_created: 0</code>. The unique
          constraint on (resource, start_at, end_at) is what makes that safe rather than lucky.
        </p>
      </div>

      <div className="card">
        <h3>3. The DST policy is written down, and it has a hole</h3>
        <p>
          Two things can go wrong converting a local time. It can be ambiguous, which happens when
          the clocks go back and 01:30 occurs twice. Or it can not exist at all, which happens when
          they go forward and 02:30 is skipped. The code states its policy in a comment.
        </p>
        <CodeBlock snippet="dst" hot={2374} />
        <p style={{ marginBottom: 0 }}>
          Ambiguous takes the earlier one. Nonexistent returns None, and the caller counts it and
          moves on. No slot is created, no error is raised, and the only trace is a number in the
          run's summary.
        </p>
        <ConfigControls keys={['dst']} />
      </div>

      <div className="card">
        <h3>4. The row is four columns doing the work</h3>
        <p>
          A window, a <code>capacity_total</code>, a <code>capacity_reserved</code>, and an{' '}
          <code>is_bookable</code> flag. Booking is now an increment against a bound, which is a
          different kind of question from "does anything overlap".
        </p>
        <CodeBlock snippet="constraints" hot={232} caption="Both constraints are ordinary Django, and both are real on SQLite." />
        <p style={{ marginBottom: 0 }}>
          The check constraint is the first of the two places the database can refuse. It is not the
          famous one, and it is the one that actually exists in development.
        </p>
      </div>

      <div className="card">
        <h3>Check you have it</h3>
        <p style={{ marginBottom: 0 }}>
          Without scrolling back: if the materialize job has never run for a resource, what does
          create_booking do? It takes the else branch, treats the resource as single-capacity, and
          runs the overlap query. The extra models do not fail closed. They fail back to the design
          they replaced.
        </p>
      </div>
    </>
  )
}
