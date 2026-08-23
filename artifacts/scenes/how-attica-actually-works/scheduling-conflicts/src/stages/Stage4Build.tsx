// Stage 4: build it. SQL first, then Django, per build-track.md's data-design
// row. The race is only convincing when you can see two psql sessions.

import { useState } from 'react'
import { RawCode } from '../ui/CodeBlock'

interface Step {
  n: number
  title: string
  failure: string
  body: string
  file: string
  lang: 'python' | 'sql'
  code: string
  hot?: number[]
  run: string
  survives: string
  cost: string
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'One table and an overlap query',
    failure:
      'Nothing exists yet. Start with the design you would reach for first, because you have to feel where it stops working before anything else is justified.',
    body:
      'A booking is a row with a start and an end. Availability is a question you ask the table. This is a good design and most systems should stop here.',
    file: 'psql, session 1',
    lang: 'sql',
    code: `CREATE TABLE booking (
    id          bigserial PRIMARY KEY,
    resource_id bigint NOT NULL,
    start_at    timestamptz NOT NULL,
    end_at      timestamptz NOT NULL,
    status      text NOT NULL
);
CREATE INDEX ON booking (resource_id, start_at, end_at);

-- is this window free?
SELECT id FROM booking
 WHERE resource_id = 7
   AND status IN ('hold','confirmed','in_progress','reschedule_pending','disputed')
   AND start_at < '2026-09-12 22:00+00'
   AND end_at   > '2026-09-12 18:00+00';`,
    run: `(0 rows)`,
    survives: 'One organizer at a time gets a correct answer, on one index, in one query.',
    cost: 'The answer is only true at the instant you asked. Nothing stops it going stale between the question and the insert.',
  },
  {
    n: 2,
    title: 'Two sessions, and the answer goes stale',
    failure: 'From step 1: the query is right and the timing is not. Prove it rather than assuming it.',
    body:
      'Open two psql sessions and interleave them by hand. Both ask, both are told the window is free, both insert. A transaction does not help: read committed lets both read the pre-insert state.',
    file: 'psql, two sessions, interleaved',
    lang: 'sql',
    code: `-- session 1                          -- session 2
BEGIN;
SELECT ... ;  -- (0 rows)
                                       BEGIN;
                                       SELECT ... ;  -- (0 rows), still
INSERT INTO booking ... ;
COMMIT;
                                       INSERT INTO booking ... ;
                                       COMMIT;

SELECT count(*) FROM booking WHERE resource_id = 7;`,
    hot: [3, 4, 7],
    run: ` count
-------
     2`,
    survives:
      'Nothing survives. Two bookings, one window, no error. This is the failure every later step is answering.',
    cost:
      'Worth sitting with before fixing it: the database did exactly what it was asked. Nothing here is a bug in SQL.',
  },
  {
    n: 3,
    title: 'Serialize the readers',
    failure: 'From step 2: both transactions were allowed to be between the question and the answer at once.',
    body:
      'Lock the resource row before reading anything. The second session now blocks on the SELECT until the first commits, then reads the state that includes the first booking.',
    file: 'psql, two sessions',
    lang: 'sql',
    code: `-- session 1                          -- session 2
BEGIN;
SELECT * FROM resource
 WHERE id = 7 FOR UPDATE;
SELECT ... ;  -- (0 rows)
                                       BEGIN;
                                       SELECT * FROM resource
                                        WHERE id = 7 FOR UPDATE;  -- blocks
INSERT INTO booking ... ;
COMMIT;
                                       -- unblocks here, and now sees it
                                       SELECT ... ;  -- (1 row)`,
    hot: [2, 3, 6, 7],
    run: ` id
----
  1     <- session 2 now finds the conflict and refuses`,
    survives: "Step 2's interleaving. The second session cannot read until the first has finished writing.",
    cost:
      'Every booking attempt for a resource is now serialized against every other, and a capacity of one is baked in: any overlap is still a conflict, because a row is either there or it is not.',
  },
  {
    n: 4,
    title: 'Materialize the windows and count against them',
    failure:
      'From step 3: correct, and it cannot express a vendor who can take five bookings at once. The overlap query has no number in it.',
    body:
      'Give each bookable window a row with a counter. Booking is now an increment against a bound, which is a question about a number rather than about the existence of other rows.',
    file: 'models.py and services.py',
    lang: 'python',
    code: `class AvailabilitySlot(models.Model):
    resource          = models.ForeignKey(MarketplaceResource, on_delete=models.CASCADE)
    start_at          = models.DateTimeField()
    end_at            = models.DateTimeField()
    capacity_total    = models.PositiveIntegerField(default=1)
    capacity_reserved = models.PositiveIntegerField(default=0)

    @property
    def capacity_remaining(self):
        return self.capacity_total - self.capacity_reserved


def _assert_slot_capacity(slots, attendee_count):
    for slot in slots:
        if slot.capacity_remaining < attendee_count:
            raise ConflictError(
                f"Slot capacity exceeded for window {slot.start_at.isoformat()} - {slot.end_at.isoformat()}."
            )`,
    hot: [4, 5, 12, 13, 14],
    run: `capacity 5, three bookings of 1 and one of 3:
  1 -> reserved 1/5    ok
  1 -> reserved 2/5    ok
  1 -> reserved 3/5    ok
  3 -> remaining 2 < 3  ConflictError`,
    survives: 'Step 3 still holds, and five concurrent bookings are now expressible where before there was one.',
    cost:
      'Rows that did not exist before now have to be manufactured and kept true, which is a scheduled job, a horizon, and a new way to be wrong: a window nobody materialized is a window nobody can book.',
  },
  {
    n: 5,
    title: 'Make the materializer safe to run twice',
    failure:
      'From step 4: the job runs on a timer, and timers overlap, retry, and get run by hand at the same time by someone debugging.',
    body:
      'A unique constraint on the window, and get_or_create instead of create. The second run finds the row that is there. Then the one detail that is easy to miss: a rule whose capacity was lowered must not shrink a slot below what is already reserved.',
    file: 'models.py and services.py',
    lang: 'python',
    code: `    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["resource", "start_at", "end_at"],
                name="uniq_resource_slot_window",
            ),
            models.CheckConstraint(
                check=Q(capacity_reserved__lte=F("capacity_total")),
                name="capacity_reserved_lte_total",
            ),
        ]

# and in the loop:
slot, was_created = AvailabilitySlot.objects.get_or_create(
    resource=rule.resource, start_at=utc_start, end_at=utc_end,
    defaults={"capacity_total": rule.capacity},
)
target_capacity = max(slot.capacity_reserved, rule.capacity)`,
    hot: [2, 3, 4, 5, 16, 17, 18, 19],
    run: `$ python manage.py materialize_availability_slots
{'rules_processed': 1, 'slots_created': 180, 'slots_updated': 0}
$ python manage.py materialize_availability_slots
{'rules_processed': 1, 'slots_created': 0, 'slots_updated': 0}`,
    survives:
      'The job is now safe on any schedule, and a capacity change can never orphan a reservation that has already been made.',
    cost:
      'The check constraint you just added can fire, and where it fires matters. Put the reserving UPDATE outside your error handling and a race turns into a 500 instead of a 409.',
  },
  {
    n: 6,
    title: 'Give the database a rule it enforces without being asked',
    failure:
      'From step 5: every guarantee so far lives in application code, so every new code path is a new chance to forget the lock.',
    body:
      'An exclusion constraint over the time range. It is not a check the application runs; it is a property the table has. Note the vendor test on the first line, and what it means for anyone developing on SQLite.',
    file: 'migrations/0003_postgres_booking_overlap_constraint.py',
    lang: 'python',
    code: `def add_postgres_exclusion_constraint(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist;")
        cursor.execute("""
            ALTER TABLE scheduling_booking
            ADD CONSTRAINT scheduling_booking_no_overlap_active
            EXCLUDE USING gist (
                resource_id WITH =,
                tstzrange(start_at, end_at, '[)') WITH &&
            )
            WHERE (status IN ('hold','confirmed','in_progress','reschedule_pending','disputed'));
        """)`,
    hot: [1, 2, 7, 8, 9, 10, 11, 12],
    run: `-- with the lock removed on purpose, session 2's insert:
ERROR:  conflicting key value violates exclusion constraint
        "scheduling_booking_no_overlap_active"`,
    survives:
      "Step 2's interleaving, even with every application check deleted. The database refuses on its own.",
    cost:
      'Two things. The status list is now written twice, in Python and in SQL, with nothing keeping them in step. And on any vendor without exclusion constraints the migration returns silently, so your development environment has one layer where production has two.',
  },
  {
    n: 7,
    title: 'Record which layer caught it',
    failure:
      'From step 6: you have two defences and no way to know which one is doing the work. That is the difference between a system that is safe and one you can only hope is safe.',
    body:
      'A table whose only job is to record collisions, with a column saying where it was caught. Then a monitor that reads the split back. This is the piece with no equivalent in the naive design at all.',
    file: 'models.py and services.py',
    lang: 'python',
    code: `class BookingConflictIncident(models.Model):
    class ConflictSource(models.TextChoices):
        APPLICATION_CHECK = "application_check", "Application Check"
        DB_CONSTRAINT     = "db_constraint", "DB Constraint"

    operation       = models.CharField(max_length=16, choices=Operation.choices)
    conflict_source = models.CharField(max_length=24, choices=ConflictSource.choices)
    requested_start_at = models.DateTimeField()
    requested_end_at   = models.DateTimeField()
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)

# and the one line that makes it trustworthy, in _record_conflict_incident:
    except Exception:
        # Conflict tracking must never block booking flow error responses.
        return None`,
    hot: [2, 3, 4, 14, 15, 16],
    run: `>>> get_constraint_monitor_status()
{'database_vendor': 'sqlite',
 'constraint_present': None,
 'last_24h_conflicts_total': 3,
 'last_24h_by_source': {'application_check': 3}}`,
    survives:
      'Everything above, and now you can see it. A day of application_check incidents is the system working. A single db_constraint incident is a bug report about your application, filed by your database.',
    cost:
      'The last honest note: constraint_present is None here, not False, because the monitor only asks the question on postgresql. If you develop on SQLite, the layer you are relying on in production is one you have never once seen fire.',
  },
]

export function Stage4Build() {
  const [i, setI] = useState(0)
  const s = STEPS[i]

  return (
    <>
      <div className="card">
        <h2>Build it, one race at a time</h2>
        <p className="lede">
          Seven steps, SQL first and then Django. Each starts from the previous step's failure, so
          nothing is introduced before you have felt why it is needed. Steps 3 to 7 land on exactly
          what Attica has.
        </p>
        <div className="ctl">
          {STEPS.map((st, n) => (
            <button key={st.n} className="opt" aria-pressed={n === i} onClick={() => setI(n)}>
              {st.n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          STEP {s.n} OF 7 · THE FAILURE THIS ANSWERS
        </div>
        <p style={{ margin: '5px 0 14px', color: 'var(--warn)', fontSize: 14 }}>{s.failure}</p>

        <h3>{s.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{s.body}</p>

        <RawCode code={s.code} lang={s.lang} file={s.file} hotLines={s.hot} />

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          RUN IT
        </div>
        <div className="term" style={{ marginTop: 5 }}>
          {s.run}
        </div>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          THE SAME SCENARIO, NOW
        </div>
        <p style={{ fontSize: 14, marginTop: 4 }}>{s.survives}</p>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          WHAT IT CHARGED
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginTop: 4, marginBottom: 0 }}>{s.cost}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="opt" disabled={i === 0} onClick={() => setI(i - 1)}>
            ← previous
          </button>
          <button className="opt" disabled={i === STEPS.length - 1} onClick={() => setI(i + 1)}>
            next step →
          </button>
        </div>
      </div>

      {i === STEPS.length - 1 && (
        <div className="card">
          <h3>What you can now say without looking</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--ink-dim)' }}>
            <li>Why an overlap query is correct and still not enough, in one sentence about timing.</li>
            <li>What the materialized slot buys that the query cannot express, and what it charges.</li>
            <li>Where the two locks go, and what the gap between the check and the reserve is.</li>
            <li>Which of the two database constraints exists on your machine, and which does not.</li>
            <li>
              Why conflict_source has two values, and what a db_constraint incident is actually
              telling you.
            </li>
            <li>Why idempotency is a separate problem from conflict, and what distinguishes them.</li>
          </ul>
        </div>
      )}
    </>
  )
}
