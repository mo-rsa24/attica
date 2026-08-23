// Stage 3: where it costs you. Symptom before cause. Every failure is reachable
// from the controls, and the stage closes on the flagged note.

import { EXCURSIONS, PREDICTIONS } from '../engagement'
import { PARTS } from '../pipeline'
import type { Config, SchedEvent } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { Excursion } from '../ui/Excursion'
import { Predict } from '../ui/Predict'

const RACE: SchedEvent[] = [
  { t: 'materialize' },
  { t: 'txn', actor: 'A', phase: 'lock' },
  { t: 'txn', actor: 'A', phase: 'check' },
  { t: 'txn', actor: 'B', phase: 'lock' },
  { t: 'txn', actor: 'B', phase: 'check' },
  { t: 'txn', actor: 'A', phase: 'reserve' },
  { t: 'txn', actor: 'A', phase: 'insert' },
  { t: 'txn', actor: 'A', phase: 'commit' },
  { t: 'txn', actor: 'B', phase: 'reserve' },
  { t: 'txn', actor: 'B', phase: 'insert' },
  { t: 'txn', actor: 'B', phase: 'commit' },
]

const SOLO: SchedEvent[] = [
  { t: 'materialize' },
  { t: 'txn', actor: 'A', phase: 'lock' },
  { t: 'txn', actor: 'A', phase: 'check' },
]

const PAID: SchedEvent[] = [
  { t: 'materialize' },
  { t: 'request', actor: 'A' },
  { t: 'approve', actor: 'A' },
  { t: 'tick', minutes: 29 },
  { t: 'pay', actor: 'A' },
  { t: 'tick', minutes: 5 },
  { t: 'run-expire-holds' },
]

interface Failure {
  id: string
  symptom: string
  cause: string
  detail: string
  real: string[]
  patch: Partial<Config>
  events: SchedEvent[]
  snippet?: string
  hot?: number
  note?: string
}

const FAILURES: Failure[] = [
  {
    id: 'naive',
    symptom:
      'Two organizers both get a confirmation email for the same venue on the same night. Nothing in the logs mentions it. The provider finds out when both turn up.',
    cause: 'Two overlap queries, both run before either insert',
    detail:
      'Without a lock, both transactions ask whether anything overlaps and both are told no, because neither has written yet. On SQLite there is no exclusion constraint to refuse the second INSERT, so both succeed. No exception is raised anywhere, so _record_conflict_incident is never reached and the incident table stays empty.',
    real: ['(no error, no log line, no incident row)'],
    patch: { design: 'overlap-query', locking: 'none', vendor: 'sqlite' },
    events: RACE,
    snippet: 'overlapQ',
    hot: 341,
    note:
      'This is the outcome the whole architecture exists to prevent, and it is also the one your monitoring cannot see. An incident count of zero looks identical to a healthy day.',
  },
  {
    id: 'unlocked-slots',
    symptom: 'A 500 from the booking endpoint, with an IntegrityError in the traceback and no incident recorded.',
    cause: 'The slot design without the lock',
    detail:
      'Both transactions read capacity_remaining before either reserved, so both decide there is room. The first UPDATE succeeds; the second pushes capacity_reserved past capacity_total and the check constraint refuses it. That UPDATE is _reserve_capacity, which sits a few lines above the only try/except IntegrityError in the function, so nothing converts it into a ConflictError and nothing records it.',
    real: ['IntegrityError: CHECK constraint failed: capacity_reserved_lte_total'],
    patch: { design: 'slots', locking: 'none', vendor: 'sqlite' },
    events: RACE,
    snippet: 'locks',
    hot: 369,
    note:
      'Better than the silent double booking, because it fails loudly and the data stays correct. Worse than a ConflictError, because the caller gets a 500 instead of a 409 and the incident log learns nothing.',
  },
  {
    id: 'postgres',
    symptom:
      'A 409 with a clear message, and an incident in the log tagged db_constraint rather than application_check.',
    cause: 'The application check missed it and the exclusion constraint caught it',
    detail:
      'Same race, same missing lock, but the database now has a rule it enforces without being asked. The second INSERT violates the GiST exclusion over the time range, the one try block catches it, and the incident is written with conflict_source=db_constraint. That tag is the signal: every db_constraint incident is a report that layer one leaked.',
    real: [
      'IntegrityError: conflicting key value violates exclusion constraint "scheduling_booking_no_overlap_active"',
      'ConflictError: Resource has a conflicting booking for this time window.',
    ],
    patch: { design: 'overlap-query', locking: 'none', vendor: 'postgresql' },
    events: RACE,
    snippet: 'dbCatch',
    hot: 653,
  },
  {
    id: 'blackout',
    symptom:
      'A resource with availability configured starts behaving as though it has none: single capacity, hard conflicts, no counter.',
    cause: 'A blackout made the slot invisible to the booking path',
    detail:
      '_apply_exceptions sets is_bookable=False on any slot a blackout overlaps. _lock_overlapping_slots then filters on is_bookable=True, so the query returns nothing, and create_booking takes the else branch. The slot row still exists and still says capacity 5; the booking path simply cannot see it and quietly reverts to the design you thought you had replaced.',
    real: ['if exception.exception_type == ...BLACKOUT: return False'],
    patch: { blackout: true, design: 'slots' },
    events: SOLO,
    snippet: 'exceptions',
    hot: 2387,
    note:
      'And while you are in that function: an override exception is fetched by the same query and then ignored. is_available_override and capacity_override are on the model and in the serializer, and no code reads either one.',
  },
  {
    id: 'dst',
    symptom:
      'One Sunday a year, a resource has no availability at all, and nobody can say why. The rule has not changed.',
    cause: 'The local start time did not exist on that date',
    detail:
      'When the clocks go forward, a local time in the skipped hour is not a real instant. _resolve_local_datetime returns None for it, _rule_slot_to_utc returns None, and the materialize loop increments skipped_nonexistent and moves on. No slot, no error, no log line beyond a count in the run summary. And because no slot exists, create_booking falls into the overlap-query branch for that window.',
    real: ["materialize_availability_slots -> {'slots_created': 0, 'skipped_nonexistent': 1}"],
    patch: { dst: 'spring-forward' },
    events: [{ t: 'materialize' }],
    snippet: 'dst',
    hot: 2374,
  },
  {
    id: 'paid-expired',
    symptom:
      'An organizer pays a deposit, gets a receipt, and then finds the window has been given back to the pool. The money is taken and the booking is gone.',
    cause: 'Paying does not finalize the session, and the expiry job does not look at paid_at',
    detail:
      'complete_checkout_mock_deposit sets paid_at and leaves status ACTIVE, without extending hold_expires_at. expire_checkout_sessions selects exactly on status=ACTIVE and hold_expires_at <= now. release_checkout_session refuses only when the status is already FINALIZED, which paying never sets, so the session is expired and _release_capacity hands the seats back.',
    real: ['expire_checkout_sessions -> released 1 hold(s)'],
    patch: { holdMinutes: 30 },
    events: PAID,
    snippet: 'release',
    hot: 1659,
    note:
      'Finalization happens later, in finalize_draft_bookings when the event is published. The window between paying and publishing is exactly the window in which this can happen, and its width is checkout_hold_minutes minus however long the organizer took to pay.',
  },
]

export function Stage3Failures() {
  const suspect = PARTS.filter((p) => p.suspect)
  const find = EXCURSIONS.find((e) => e.id === 'find-silence')!
  const monitor = EXCURSIONS.find((e) => e.id === 'monitor')!

  return (
    <>
      <div className="card">
        <h2>Six ways it costs you, and two of them are quiet</h2>
        <p className="lede">
          Each card leads with what you would actually see. Every one is reachable from the controls,
          so predict first, then run it on the bench and watch the tables.
        </p>
      </div>

      {FAILURES.map((f) => (
        <FailureCard key={f.id} f={f} />
      ))}

      <div className="card">
        <h2>Go and find the quiet one yourself</h2>
        <Excursion ex={find} />
        <Excursion ex={monitor} />
      </div>

      <div className="card flagged">
        <h2>What looks wrong, as opposed to merely costly</h2>
        <p className="lede">
          Most of the above is the price of the design, paid knowingly: more models, a cron job, a
          horizon. Three of them do not read that way.
        </p>
        {suspect.map((p) => (
          <div key={p.id} className="flag">
            <h4>{p.label}</h4>
            <p>{p.breaks}</p>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              {p.source}
            </div>
          </div>
        ))}
        <div className="flag">
          <h4>expire_and_materialize</h4>
          <p>
            The command imports materialize_slots_for_resource from scheduling.services, which does
            not define it, so the command raises ImportError before its loop starts. Its docstring
            says it runs both expiry and materialization; its loop body only expires stale requests.
          </p>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
            management/commands/expire_and_materialize.py:20
          </div>
        </div>
        <p style={{ marginTop: 14, marginBottom: 0, color: 'var(--ink-dim)', fontSize: 13.5 }}>
          The first three are each one line, and each one turns a two-layer defence into a one-layer
          defence without saying so. The fourth means the job that keeps the horizon full is not
          running from that command, so materialization has to be someone's cron entry against
          materialize_availability_slots instead, and if it is not, every resource quietly falls back
          to the overlap query as the horizon runs out.
        </p>
      </div>
    </>
  )
}

function FailureCard({ f }: { f: Failure }) {
  const { loadScenario } = useStore()
  const pred = PREDICTIONS.find((p) => p.id === f.id)

  return (
    <div className="card">
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
        WHAT YOU SEE
      </div>
      <h3 style={{ margin: '3px 0 10px', fontWeight: 500 }}>{f.symptom}</h3>

      <div className="term">
        {f.real.map((r, i) => (
          <div key={i} className="err">
            {r}
          </div>
        ))}
      </div>

      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
        WHY
      </div>
      <h4 style={{ margin: '3px 0 7px' }}>{f.cause}</h4>
      <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{f.detail}</p>

      {f.snippet && <CodeBlock snippet={f.snippet} hot={f.hot ?? null} />}

      {f.note && (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', borderLeft: '2px solid var(--line)', paddingLeft: 12 }}>
          {f.note}
        </p>
      )}

      {pred && <Predict question={pred.question} patch={f.patch} events={f.events} label={`reproduced: ${f.cause}`} />}

      <button className="opt" onClick={() => loadScenario(f.id, f.events, f.patch, `reproduced: ${f.cause}`)}>
        run it on the bench
      </button>
    </div>
  )
}
