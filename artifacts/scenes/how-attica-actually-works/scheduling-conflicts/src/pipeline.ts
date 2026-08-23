// The atlas: the pipeline nodes, the edges between them, and the parts registry.
//
// A node here is both a place on the map and a component in the sense of
// components.md. One registry, so the diagram and the parts list cannot drift.

import type { Config } from './model'

export type Level = 'ECOSYSTEM' | 'SYSTEM' | 'COMPONENT' | 'MECHANISM'

export const LEVELS: { id: Level; blurb: string; reveals: string }[] = [
  {
    id: 'ECOSYSTEM',
    blurb: 'four things that can say no',
    reveals: 'the application, the database, the scheduled jobs, and the incident log',
  },
  {
    id: 'SYSTEM',
    blurb: 'the two pipelines',
    reveals: 'rule to slot on one side, request to booking on the other, and where they meet',
  },
  {
    id: 'COMPONENT',
    blurb: 'the service functions',
    reveals: 'each one owns live state you can read right now',
  },
  {
    id: 'MECHANISM',
    blurb: 'inside one transaction',
    reveals: 'the two locks, the counter, and the order the five phases run in',
  },
]

export interface Node {
  id: string
  label: string
  what: string
  level: Level
  parent: string | null
  opens: boolean
  source: string
  x: number
  y: number
  w: number
  h: number
}

const W = 156
const H = 62

export const NODES: Node[] = [
  // --- ECOSYSTEM ---------------------------------------------------------
  {
    id: 'app',
    label: 'the application',
    what:
      'services.py. It checks capacity or overlap under a lock, and it is the layer you want doing the refusing, because it can say why.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    source: 'backend/main/scheduling/services.py',
    x: 46,
    y: 96,
    w: 200,
    h: 76,
  },
  {
    id: 'db',
    label: 'the database',
    what:
      'Two constraints matter: a CHECK that capacity_reserved never exceeds capacity_total, and on Postgres only, a GiST exclusion constraint that refuses overlapping active bookings.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    source: 'models.py:227-236, migrations/0003_postgres_booking_overlap_constraint.py',
    x: 400,
    y: 96,
    w: 200,
    h: 76,
  },
  {
    id: 'jobs',
    label: 'the scheduled jobs',
    what:
      'Three management commands: materialize slots forward, expire checkout holds, expire stale requests. Nothing in the request path does any of this.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    source: 'scheduling/management/commands/',
    x: 754,
    y: 96,
    w: 200,
    h: 76,
  },
  {
    id: 'incidents',
    label: 'BookingConflictIncident',
    what:
      'A table whose only job is to record that two bookings collided, and which layer caught it. conflict_source is application_check or db_constraint.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: false,
    source: 'models.py:688-734',
    x: 400,
    y: 268,
    w: 200,
    h: 76,
  },

  // --- SYSTEM: inside the application ------------------------------------
  {
    id: 'rule',
    label: 'AvailabilityRule',
    what:
      'Recurring availability: a frequency, a set of weekdays, a local start and end time, an effective range, and a capacity. It is not bookable by itself.',
    level: 'SYSTEM',
    parent: 'app',
    opens: false,
    source: 'models.py:133-175',
    x: 40,
    y: 70,
    w: W,
    h: H,
  },
  {
    id: 'exception',
    label: 'AvailabilityException',
    what:
      'One-off blackout or override windows. Only blackout has any effect: _apply_exceptions returns False on a blackout and ignores overrides entirely.',
    level: 'SYSTEM',
    parent: 'app',
    opens: false,
    source: 'models.py:178-203, services.py:2384-2389',
    x: 40,
    y: 186,
    w: W,
    h: H,
  },
  {
    id: 'slot',
    label: 'AvailabilitySlot',
    what:
      'The materialized row. One concrete window, a capacity_total and a capacity_reserved counter, unique on (resource, start_at, end_at).',
    level: 'SYSTEM',
    parent: 'app',
    opens: true,
    source: 'models.py:206-251',
    x: 260,
    y: 128,
    w: W,
    h: H,
  },
  {
    id: 'request',
    label: 'BookingRequest',
    what:
      'The ask. Created pending with expires_at 48 hours out. Approval opens a checkout session, which is what actually holds the window.',
    level: 'SYSTEM',
    parent: 'app',
    opens: false,
    source: 'models.py:300-393, services.py:479',
    x: 480,
    y: 70,
    w: W,
    h: H,
  },
  {
    id: 'hold',
    label: 'CheckoutSession',
    what:
      'The TTL hold. hold_expires_at is now plus policy.checkout_hold_minutes, default 30. Paying sets paid_at and does not extend it.',
    level: 'SYSTEM',
    parent: 'app',
    opens: false,
    source: 'models.py:254-297, services.py:1554',
    x: 480,
    y: 186,
    w: W,
    h: H,
  },
  {
    id: 'booking',
    label: 'Booking',
    what:
      'The confirmed row. Five of its eight statuses count as occupying the window, and that list is duplicated in the Postgres constraint by hand.',
    level: 'SYSTEM',
    parent: 'app',
    opens: true,
    source: 'models.py:396-477',
    x: 700,
    y: 128,
    w: W,
    h: H,
  },

  // --- COMPONENT / MECHANISM: inside create_booking -----------------------
  {
    id: 'lockphase',
    label: 'select_for_update',
    what:
      'Two locks in order: the MarketplaceResource row, then the overlapping slots. The comment in the source says why: so concurrent approvals are serialised at the DB level.',
    level: 'MECHANISM',
    parent: 'booking',
    opens: false,
    source: 'services.py:576, services.py:347-353',
    x: 40,
    y: 80,
    w: 170,
    h: 80,
  },
  {
    id: 'checkphase',
    label: 'the check',
    what:
      'With slots, _assert_slot_capacity compares capacity_remaining against attendee_count. Without slots, _find_booking_conflict runs the overlap query instead.',
    level: 'MECHANISM',
    parent: 'booking',
    opens: false,
    source: 'services.py:356-361, 340-344',
    x: 240,
    y: 80,
    w: 170,
    h: 80,
  },
  {
    id: 'reservephase',
    label: '_reserve_capacity',
    what:
      'An UPDATE adding attendee_count to capacity_reserved. It sits outside the one try/except IntegrityError in the function, so a constraint violation here is uncaught.',
    level: 'MECHANISM',
    parent: 'booking',
    opens: false,
    source: 'services.py:364-369, called at 602',
    x: 440,
    y: 80,
    w: 170,
    h: 80,
  },
  {
    id: 'insertphase',
    label: 'INSERT, in a try',
    what:
      'The only place an IntegrityError is converted into a ConflictError and an incident. On SQLite there is no constraint that would raise one here.',
    level: 'MECHANISM',
    parent: 'booking',
    opens: false,
    source: 'services.py:640-665',
    x: 640,
    y: 80,
    w: 170,
    h: 80,
  },
  {
    id: 'idem',
    label: 'IdempotencyRecord',
    what:
      'Unique on (owner, endpoint, key). A repeat with a matching request hash returns the stored response body; a repeat with a different one raises.',
    level: 'MECHANISM',
    parent: 'booking',
    opens: false,
    source: 'models.py:546-567, services.py:114-142',
    x: 340,
    y: 210,
    w: 170,
    h: 80,
  },

  // --- COMPONENT: inside the database ------------------------------------
  {
    id: 'checkconstraint',
    label: 'capacity_reserved_lte_total',
    what:
      'A CheckConstraint on AvailabilitySlot. Django emits it on SQLite too, so this one is real in development.',
    level: 'COMPONENT',
    parent: 'db',
    opens: false,
    source: 'models.py:232-235',
    x: 90,
    y: 100,
    w: 220,
    h: 80,
  },
  {
    id: 'uniqslot',
    label: 'uniq_resource_slot_window',
    what:
      'Unique on (resource, start_at, end_at). This is what makes re-running materialization a no-op rather than a duplicate.',
    level: 'COMPONENT',
    parent: 'db',
    opens: false,
    source: 'models.py:228-231',
    x: 390,
    y: 100,
    w: 220,
    h: 80,
  },
  {
    id: 'exclusion',
    label: 'scheduling_booking_no_overlap_active',
    what:
      'A GiST exclusion over resource_id and tstzrange(start_at, end_at), filtered to the five active statuses. Created only when connection.vendor is postgresql.',
    level: 'COMPONENT',
    parent: 'db',
    opens: false,
    source: 'migrations/0003_postgres_booking_overlap_constraint.py:7-35',
    x: 690,
    y: 100,
    w: 220,
    h: 80,
  },

  // --- COMPONENT: inside the jobs ----------------------------------------
  {
    id: 'materializecmd',
    label: 'materialize_availability_slots',
    what:
      'Walks active rules over a horizon, converts each local window to UTC, applies exceptions, and get_or_creates the slot.',
    level: 'COMPONENT',
    parent: 'jobs',
    opens: false,
    source: 'services.py:2485-2561',
    x: 60,
    y: 100,
    w: 250,
    h: 80,
  },
  {
    id: 'expireholds',
    label: 'expire_draft_holds',
    what:
      'Calls expire_checkout_sessions, which selects ACTIVE sessions past hold_expires_at and releases them. It never looks at paid_at.',
    level: 'COMPONENT',
    parent: 'jobs',
    opens: false,
    source: 'services.py:1744-1769',
    x: 370,
    y: 100,
    w: 250,
    h: 80,
  },
  {
    id: 'expireandmat',
    label: 'expire_and_materialize',
    what:
      'A supervised loop that its docstring says runs both expiry and materialization. It imports materialize_slots_for_resource, which services.py does not define, and its loop body only expires requests.',
    level: 'COMPONENT',
    parent: 'jobs',
    opens: false,
    source: 'management/commands/expire_and_materialize.py:20',
    x: 680,
    y: 100,
    w: 250,
    h: 80,
  },
]

export const nodeById = (id: string) => NODES.find((n) => n.id === id)
export const nodesAt = (focus: string | null) => NODES.filter((n) => n.parent === focus)

export function trail(focus: string | null): Node[] {
  const out: Node[] = []
  let cur = focus
  while (cur) {
    const n = nodeById(cur)
    if (!n) break
    out.unshift(n)
    cur = n.parent
  }
  return out
}

// ---------------------------------------------------------------------------
// Edges
// ---------------------------------------------------------------------------

export interface Edge {
  id: string
  from: string
  to: string
  at: string | null
  short: string
  carries: string
  consequence: string
  source: string
  /** Best effort: it can fail and nothing upstream learns. */
  bestEffort?: boolean
}

export const EDGES: Edge[] = [
  {
    id: 'app-db',
    from: 'app',
    to: 'db',
    at: null,
    short: 'writes',
    carries: 'the capacity UPDATE and the booking INSERT',
    consequence: 'the database gets its one chance to refuse',
    source: 'services.py:602, 641',
  },
  {
    id: 'jobs-db',
    from: 'jobs',
    to: 'db',
    at: null,
    short: 'materializes',
    carries: 'get_or_create per rule per date',
    consequence: 'slot rows appear ahead of anyone asking for them',
    source: 'services.py:2522',
  },
  {
    id: 'app-inc',
    from: 'app',
    to: 'incidents',
    at: null,
    short: 'application_check',
    carries: 'the window, the message, and the conflicting id',
    consequence: 'a row saying the application caught it',
    source: 'services.py:590, 608, 627',
    bestEffort: true,
  },
  {
    id: 'db-inc',
    from: 'db',
    to: 'incidents',
    at: null,
    short: 'db_constraint',
    carries: 'the same shape, tagged differently',
    consequence: 'a row saying the application did not catch it and the database did',
    source: 'services.py:653-665',
    bestEffort: true,
  },
  {
    id: 'rule-slot',
    from: 'rule',
    to: 'slot',
    at: 'app',
    short: 'materialize',
    carries: 'one row per rule per matching date',
    consequence: 'abstract availability becomes concrete bookable windows',
    source: 'services.py:2511-2531',
  },
  {
    id: 'exc-slot',
    from: 'exception',
    to: 'slot',
    at: 'app',
    short: 'is_bookable',
    carries: 'a blackout, and nothing else',
    consequence: 'the slot exists but the booking path cannot see it',
    source: 'services.py:2384-2389',
  },
  {
    id: 'req-hold',
    from: 'request',
    to: 'hold',
    at: 'app',
    short: 'approve',
    carries: 'a TTL',
    consequence: 'the window is held for policy.checkout_hold_minutes',
    source: 'services.py:793',
  },
  {
    id: 'hold-booking',
    from: 'hold',
    to: 'booking',
    at: 'app',
    short: 'finalize',
    carries: 'the held window, consumed',
    consequence: 'a confirmed Booking row',
    source: 'services.py:1814 finalize_draft_bookings',
  },
  {
    id: 'slot-booking',
    from: 'slot',
    to: 'booking',
    at: 'app',
    short: 'capacity',
    carries: 'capacity_remaining, read under a lock',
    consequence: 'the booking is allowed or refused',
    source: 'services.py:580-602',
  },
  {
    id: 'lock-check',
    from: 'lockphase',
    to: 'checkphase',
    at: 'booking',
    short: 'then',
    carries: 'a serialised view of the slots',
    consequence: 'the read cannot be stale while the lock is held',
    source: 'services.py:576-588',
  },
  {
    id: 'check-reserve',
    from: 'checkphase',
    to: 'reservephase',
    at: 'booking',
    short: 'then',
    carries: 'a decision made on that read',
    consequence: 'the gap between these two is where a race lives',
    source: 'services.py:588-602',
  },
  {
    id: 'reserve-insert',
    from: 'reservephase',
    to: 'insertphase',
    at: 'booking',
    short: 'then',
    carries: 'the counter, already incremented',
    consequence: 'only from here on is an IntegrityError caught',
    source: 'services.py:602-641',
  },
]

export const edgesAt = (focus: string | null) => EDGES.filter((e) => e.at === focus)

// ---------------------------------------------------------------------------
// Parts registry
// ---------------------------------------------------------------------------

export interface Part {
  id: string
  label: string
  what: string
  controls: keyof Config
  breaks: string
  real: string
  source: string
  stage: number
  /** Flagged in the closing note as looking like a defect rather than a choice. */
  suspect?: boolean
}

export const PARTS: Part[] = [
  {
    id: 'design',
    label: 'which branch runs',
    what:
      'create_booking has two bodies. With slots it compares a counter; with none it runs the overlap query and treats the resource as single-capacity.',
    controls: 'design',
    breaks:
      'the overlap query cannot express capacity above one, so a vendor who can take five bookings takes one.',
    real: '# No availability slots defined — treat the resource as single-capacity',
    source: 'services.py:583-606',
    stage: 0,
  },
  {
    id: 'lock',
    label: 'select_for_update',
    what:
      'A row lock on the MarketplaceResource, taken before anything is read, plus a second lock on the overlapping slots.',
    controls: 'locking',
    breaks:
      'off, and both transactions read before either writes. What happens next depends on the design and the vendor, and none of the four outcomes is the same.',
    real: 'MarketplaceResource.objects.select_for_update().get(id=resource.id)',
    source: 'services.py:576',
    stage: 0,
  },
  {
    id: 'vendor',
    label: 'the database vendor',
    what:
      'Migration 0003 adds a GiST exclusion constraint that refuses overlapping active bookings. Its first statement is a vendor check.',
    controls: 'vendor',
    breaks:
      'on anything that is not postgresql the migration returns immediately, the constraint never exists, and get_constraint_monitor_status reports None rather than False.',
    real: 'if schema_editor.connection.vendor != "postgresql": return',
    source: 'migrations/0003_postgres_booking_overlap_constraint.py:8-9',
    stage: 3,
    suspect: true,
  },
  {
    id: 'capacity',
    label: 'slot capacity',
    what: 'AvailabilityRule.capacity becomes AvailabilitySlot.capacity_total, and bookings decrement against it.',
    controls: 'slotCapacity',
    breaks:
      'set it to 1 and the slot design behaves exactly like the overlap query. The extra models only pay for themselves above one.',
    real: 'capacity_total = models.PositiveIntegerField(default=1)',
    source: 'models.py:221',
    stage: 2,
  },
  {
    id: 'attendees',
    label: 'attendee_count',
    what: 'How many seats one booking takes. The check is capacity_remaining < attendee_count, not a simple occupied flag.',
    controls: 'attendees',
    breaks:
      'three attendees against a capacity of five means the second booking of three is refused even though the window is not full.',
    real: 'Slot capacity exceeded for window ... - ....',
    source: 'services.py:356-361',
    stage: 2,
  },
  {
    id: 'idem',
    label: 'the Idempotency-Key',
    what:
      'A record keyed by owner, endpoint and key, storing the response status and body. A repeat returns the stored booking instead of making another.',
    controls: 'idem',
    breaks:
      'reuse the key with a different payload and it raises rather than replaying. And the record is written after the transaction commits, so a crash in between leaves a booking with no record of it.',
    real: 'Idempotency key reused with a different payload.',
    source: 'services.py:114-142, 690-697',
    stage: 3,
  },
  {
    id: 'dst',
    label: 'the DST policy',
    what:
      'Local times are resolved against the rule timezone. Ambiguous times take the earlier occurrence; nonexistent ones are skipped.',
    controls: 'dst',
    breaks:
      'a spring-forward window produces no slot at all, silently, and the run reports it only as a skipped_nonexistent count.',
    real: '# - nonexistent local times are skipped entirely.',
    source: 'services.py:2369-2375',
    stage: 3,
  },
  {
    id: 'blackout',
    label: 'AvailabilityException',
    what:
      'A blackout window makes the overlapping slot is_bookable=False. An override exception is fetched and then ignored.',
    controls: 'blackout',
    breaks:
      'the slot still exists, but _lock_overlapping_slots filters on is_bookable=True, so the booking path stops seeing it and quietly falls into the overlap-query branch instead.',
    real: 'if exception.exception_type == ...BLACKOUT: return False',
    source: 'services.py:2384-2389',
    stage: 3,
    suspect: true,
  },
  {
    id: 'hold',
    label: 'checkout_hold_minutes',
    what: 'How long an approved request holds the window before the seats go back.',
    controls: 'holdMinutes',
    breaks:
      'paying does not extend it and does not finalize the session, and the expiry job never checks paid_at. Pay at minute 29 of a 30 minute hold and the seats are released at minute 30.',
    real: 'locked_session.paid_at = locked_session.paid_at or now',
    source: 'services.py:1554, 1744-1769',
    stage: 3,
    suspect: true,
  },
]

export const partById = (id: string) => PARTS.find((p) => p.id === id)
