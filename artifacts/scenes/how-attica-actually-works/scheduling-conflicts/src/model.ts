// The one place truth is computed.
//
// Pure: imports nothing from React, the store, or any component.
//
// Shape: dynamic. step(world, event, config) -> world, folded by run().
// This is a concurrency scene, so the lesson is interleaving: create_booking is
// decomposed into the phases it really has, and the reader chooses the order.
//
//   lock -> check -> reserve -> insert -> commit
//
// The claim this model exists to make checkable: with slots and the resource
// lock, no interleaving produces bookings beyond capacity. Take the lock away
// and the reader can produce two different bad outcomes, both real.

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Which branch of create_booking runs. `slots` is the capacity-aware path;
 *  `overlap-query` is the else branch, used whenever a resource has no slots. */
export type Design = 'slots' | 'overlap-query'

/** Decides whether migration 0003's exclusion constraint exists at all. */
export type Vendor = 'sqlite' | 'postgresql'

export type Locking = 'select-for-update' | 'none'

export type Idem = 'none' | 'same-key-same-payload' | 'same-key-different-payload'

/** _rule_slot_to_utc's stated DST policy: ambiguous picks fold=0, nonexistent
 *  is skipped entirely. */
export type Dst = 'normal' | 'spring-forward' | 'fall-back'

export interface Config {
  design: Design
  vendor: Vendor
  locking: Locking
  /** AvailabilityRule.capacity, which becomes AvailabilitySlot.capacity_total. */
  slotCapacity: number
  /** attendee_count on each booking attempt. */
  attendees: number
  idem: Idem
  dst: Dst
  /** AvailabilityException of type blackout covering the window. */
  blackout: boolean
  /** ResourcePolicy.checkout_hold_minutes. */
  holdMinutes: number
}

export const initialConfig: Config = {
  design: 'slots',
  vendor: 'sqlite',
  locking: 'select-for-update',
  slotCapacity: 1,
  attendees: 1,
  idem: 'none',
  dst: 'normal',
  blackout: false,
  holdMinutes: 30,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type Actor = 'A' | 'B'

export type Phase = 'lock' | 'check' | 'reserve' | 'insert' | 'commit'

export type SchedEvent =
  | { t: 'materialize' }
  | { t: 'txn'; actor: Actor; phase: Phase }
  | { t: 'request'; actor: Actor }
  | { t: 'approve'; actor: Actor }
  | { t: 'pay'; actor: Actor }
  | { t: 'retry'; actor: Actor }
  | { t: 'tick'; minutes: number }
  | { t: 'run-expire-holds' }
  | { t: 'run-expire-requests' }

export const PHASE_LABEL: Record<Phase, string> = {
  lock: 'SELECT FOR UPDATE',
  check: 'check capacity',
  reserve: 'reserve',
  insert: 'INSERT booking',
  commit: 'COMMIT',
}

export const PHASE_ORDER: Phase[] = ['lock', 'check', 'reserve', 'insert', 'commit']

/** The real source line each phase runs. */
export const PHASE_SOURCE: Record<Phase, string> = {
  lock: 'services.py:576  MarketplaceResource.objects.select_for_update().get(id=...)',
  check: 'services.py:588  _assert_slot_capacity(slots, attendee_count)',
  reserve: 'services.py:602  _reserve_capacity(slots, attendee_count)',
  insert: 'services.py:641  Booking.objects.create(...)',
  commit: 'services.py:575  with transaction.atomic():',
}

// ---------------------------------------------------------------------------
// The world
// ---------------------------------------------------------------------------

export type TxnPhase = 'idle' | 'blocked' | 'locked' | 'checked' | 'reserved' | 'inserted' | 'committed' | 'aborted'

export interface Txn {
  phase: TxnPhase
  holdsLock: boolean
  /** What this transaction READ at check time. A stale read is the whole bug. */
  readRemaining: number | null
  reserved: number
  error: string | null
  /** Which conflict layer refused it, if any. */
  refusedBy: 'application_check' | 'db_constraint' | null
  bookingId: number | null
  /** Did it replay a stored idempotent response instead of doing the work? */
  replayed: boolean
}

const idleTxn: Txn = {
  phase: 'idle',
  holdsLock: false,
  readRemaining: null,
  reserved: 0,
  error: null,
  refusedBy: null,
  bookingId: null,
  replayed: false,
}

export interface Slot {
  startLabel: string
  capacityTotal: number
  capacityReserved: number
  isBookable: boolean
}

export interface BookingRow {
  id: number
  actor: Actor
  status: 'confirmed'
}

export interface Incident {
  operation: 'create'
  source: 'application_check' | 'db_constraint'
  message: string
  details: string
}

export interface IdemRow {
  key: string
  endpoint: string
  requestHash: string
  bookingId: number
}

export interface HoldRow {
  actor: Actor
  status: 'active' | 'expired' | 'released' | 'finalized'
  paidAtMin: number | null
  holdExpiresAtMin: number
  reserved: number
}

export interface World {
  materialized: boolean
  slots: Slot[]
  materializeRuns: number
  slotsCreated: number
  slotsUpdated: number
  skippedNonexistent: number

  bookings: BookingRow[]
  incidents: Incident[]
  idem: IdemRow[]
  holds: HoldRow[]

  nowMin: number
  lockHeldBy: Actor | null
  txn: Record<Actor, Txn>
  /** Real log lines and exception strings, in order. */
  log: string[]
  /** Set when an IntegrityError escaped the one try/except that exists. */
  crashed: string | null
}

const emptyWorld: World = {
  materialized: false,
  slots: [],
  materializeRuns: 0,
  slotsCreated: 0,
  slotsUpdated: 0,
  skippedNonexistent: 0,
  bookings: [],
  incidents: [],
  idem: [],
  holds: [],
  nowMin: 0,
  lockHeldBy: null,
  txn: { A: { ...idleTxn }, B: { ...idleTxn } },
  log: [],
  crashed: null,
}

// ---------------------------------------------------------------------------
// The real strings
// ---------------------------------------------------------------------------

const WINDOW = '2026-09-12T18:00:00+00:00 - 2026-09-12T22:00:00+00:00'

export const MSG = {
  capacity: `Slot capacity exceeded for window ${WINDOW}.`,
  alreadyBooked: (id: number) => `Resource is already booked for booking #${id}.`,
  holdConflict: (id: number) => `Resource is on an active checkout hold for request #${id}.`,
  idemMismatch: 'Idempotency key reused with a different payload.',
  dbConflict: 'Resource has a conflicting booking for this time window.',
  /** The CheckConstraint on AvailabilitySlot. Django emits it on SQLite too. */
  checkConstraint:
    'IntegrityError: CHECK constraint failed: capacity_reserved_lte_total',
  /** The Postgres exclusion constraint from migration 0003. */
  exclusion:
    'IntegrityError: conflicting key value violates exclusion constraint "scheduling_booking_no_overlap_active"',
  holdExpired: 'This checkout session has already expired.',
} as const

// ---------------------------------------------------------------------------
// The reducer
// ---------------------------------------------------------------------------

function slotsFor(cfg: Config): Slot[] {
  // A spring-forward local time does not exist, so _rule_slot_to_utc returns
  // None and materialize_availability_slots counts it in skipped_nonexistent.
  if (cfg.dst === 'spring-forward') return []
  return [
    {
      startLabel: WINDOW,
      capacityTotal: cfg.slotCapacity,
      capacityReserved: 0,
      isBookable: !cfg.blackout,
    },
  ]
}

/** Slots the booking path can actually see: _lock_overlapping_slots filters on
 *  is_bookable=True, so a blackout slot is invisible to it and the else branch
 *  (the overlap query) runs instead. */
const visibleSlots = (w: World) => w.slots.filter((s) => s.isBookable)

export function step(w: World, e: SchedEvent, cfg: Config): World {
  const log = (...lines: string[]) => ({ ...w, log: [...w.log, ...lines] })

  switch (e.t) {
    case 'materialize': {
      const desired = slotsFor(cfg)
      const runs = w.materializeRuns + 1

      if (cfg.design === 'overlap-query') {
        return {
          ...w,
          materializeRuns: runs,
          log: [
            ...w.log,
            'no AvailabilityRule for this resource: nothing to materialize',
          ],
        }
      }

      if (desired.length === 0) {
        return {
          ...w,
          materialized: true,
          materializeRuns: runs,
          skippedNonexistent: w.skippedNonexistent + 1,
          log: [
            ...w.log,
            "_rule_slot_to_utc returned None: that local time does not exist on this date",
            `materialize_availability_slots -> {'slots_created': 0, 'skipped_nonexistent': ${w.skippedNonexistent + 1}}`,
          ],
        }
      }

      // get_or_create over uniq_resource_slot_window: the second run finds the
      // row that is already there, so it creates nothing.
      if (w.materialized) {
        const target = Math.max(w.slots[0]?.capacityReserved ?? 0, cfg.slotCapacity)
        const needsUpdate = (w.slots[0]?.capacityTotal ?? 0) !== target || (w.slots[0]?.isBookable ?? true) !== !cfg.blackout
        const slots = w.slots.map((s) => ({
          ...s,
          capacityTotal: target,
          isBookable: !cfg.blackout,
        }))
        return {
          ...w,
          slots,
          materializeRuns: runs,
          slotsUpdated: w.slotsUpdated + (needsUpdate ? 1 : 0),
          log: [
            ...w.log,
            `get_or_create(resource, start_at, end_at) -> found, was_created=False`,
            `materialize_availability_slots -> {'slots_created': 0, 'slots_updated': ${needsUpdate ? 1 : 0}}`,
            ...(target > cfg.slotCapacity
              ? [`target_capacity = max(capacity_reserved, ${cfg.slotCapacity}) = ${target}: a rule cannot shrink a slot below what is reserved`]
              : []),
          ],
        }
      }

      return {
        ...w,
        materialized: true,
        slots: desired,
        materializeRuns: runs,
        slotsCreated: w.slotsCreated + desired.length,
        log: [
          ...w.log,
          `get_or_create(resource, start_at, end_at) -> was_created=True`,
          `materialize_availability_slots -> {'slots_created': ${desired.length}, 'slots_updated': 0}`,
          ...(cfg.blackout ? ['_apply_exceptions found a blackout: is_bookable=False'] : []),
        ],
      }
    }

    case 'tick': {
      const now = w.nowMin + e.minutes
      return { ...w, nowMin: now, log: [...w.log, `clock: +${e.minutes} min (now t+${now})`] }
    }

    case 'request': {
      return log(`BookingRequest created, expires_at = now + 48h (services.py:479)`)
    }

    case 'approve': {
      const hold: HoldRow = {
        actor: e.actor,
        status: 'active',
        paidAtMin: null,
        holdExpiresAtMin: w.nowMin + cfg.holdMinutes,
        reserved: cfg.attendees,
      }
      return {
        ...w,
        holds: [...w.holds, hold],
        log: [
          ...w.log,
          `approve_request: CheckoutSession active, hold_expires_at = now + ${cfg.holdMinutes} min`,
        ],
      }
    }

    case 'pay': {
      const holds = w.holds.map((h) =>
        h.actor === e.actor && h.status === 'active'
          ? { ...h, paidAtMin: w.nowMin }
          : h,
      )
      const target = w.holds.find((h) => h.actor === e.actor)
      if (!target) return log('no checkout session to pay for')
      if (target.status !== 'active') return log(MSG.holdExpired)
      if (target.holdExpiresAtMin <= w.nowMin) return log(MSG.holdExpired)
      return {
        ...w,
        holds,
        log: [
          ...w.log,
          'complete_checkout_mock_deposit: paid_at set, status stays ACTIVE, hold_expires_at unchanged',
        ],
      }
    }

    case 'run-expire-holds': {
      // expire_checkout_sessions filters on status=ACTIVE and hold_expires_at
      // <= now. It never looks at paid_at, and release_checkout_session only
      // refuses when the status is already FINALIZED.
      let released = 0
      const paidLost: Actor[] = []
      const holds = w.holds.map((h) => {
        if (h.status === 'active' && h.holdExpiresAtMin <= w.nowMin) {
          released++
          if (h.paidAtMin !== null) paidLost.push(h.actor)
          return { ...h, status: 'expired' as const }
        }
        return h
      })
      // _release_capacity gives the reserved seats back.
      const freed = w.holds
        .filter((h) => h.status === 'active' && h.holdExpiresAtMin <= w.nowMin)
        .reduce((n, h) => n + h.reserved, 0)
      const slots = w.slots.map((s) => ({
        ...s,
        capacityReserved: Math.max(0, s.capacityReserved - freed),
      }))
      return {
        ...w,
        holds,
        slots,
        log: [
          ...w.log,
          `expire_checkout_sessions -> released ${released} hold(s)`,
          ...(paidLost.length
            ? [
                `WARNING hold for ${paidLost.join(', ')} had paid_at set and was expired anyway: release_checkout_session only guards on FINALIZED`,
              ]
            : []),
          ...(freed ? [`_release_capacity gave back ${freed} seat(s)`] : []),
        ],
      }
    }

    case 'run-expire-requests': {
      return log('expire_pending_requests -> BookingRequest.status = expired for anything past expires_at')
    }

    case 'retry': {
      // A retry re-enters create_booking. What happens depends entirely on the
      // idempotency configuration.
      if (cfg.idem === 'none') {
        return {
          ...w,
          txn: { ...w.txn, [e.actor]: { ...idleTxn } },
          log: [...w.log, 'retry with no Idempotency-Key: create_booking runs again from the top'],
        }
      }
      const stored = w.idem.find((r) => r.key === `key-${e.actor}`)
      if (!stored) {
        return {
          ...w,
          txn: { ...w.txn, [e.actor]: { ...idleTxn } },
          log: [...w.log, 'retry: no IdempotencyRecord yet, so create_booking runs again from the top'],
        }
      }
      if (cfg.idem === 'same-key-different-payload') {
        return {
          ...w,
          txn: {
            ...w.txn,
            [e.actor]: { ...idleTxn, phase: 'aborted', error: MSG.idemMismatch },
          },
          log: [...w.log, `IdempotencyConflictError: ${MSG.idemMismatch}`],
        }
      }
      return {
        ...w,
        txn: {
          ...w.txn,
          [e.actor]: { ...idleTxn, phase: 'committed', bookingId: stored.bookingId, replayed: true },
        },
        log: [
          ...w.log,
          `_get_or_assert_idempotency hit: returning stored booking #${stored.bookingId}, created=False`,
        ],
      }
    }

    case 'txn':
      return runPhase(w, e.actor, e.phase, cfg)
  }
}

function runPhase(w: World, actor: Actor, phase: Phase, cfg: Config): World {
  const me = w.txn[actor]
  const other: Actor = actor === 'A' ? 'B' : 'A'
  const push = (world: World, ...lines: string[]) => ({ ...world, log: [...world.log, ...lines] })

  if (me.phase === 'aborted' || me.phase === 'committed') return w
  if (w.crashed) return w

  switch (phase) {
    case 'lock': {
      if (cfg.locking === 'none') {
        return push(
          { ...w, txn: { ...w.txn, [actor]: { ...me, phase: 'locked' } } },
          `${actor}: no select_for_update, nothing to wait for`,
        )
      }
      if (w.lockHeldBy && w.lockHeldBy !== actor) {
        return push(
          { ...w, txn: { ...w.txn, [actor]: { ...me, phase: 'blocked' } } },
          `${actor}: SELECT FOR UPDATE blocks, ${w.lockHeldBy} holds the resource row`,
        )
      }
      return push(
        {
          ...w,
          lockHeldBy: actor,
          txn: { ...w.txn, [actor]: { ...me, phase: 'locked', holdsLock: true } },
        },
        `${actor}: holds the lock on MarketplaceResource`,
      )
    }

    case 'check': {
      if (cfg.locking === 'select-for-update' && w.lockHeldBy !== actor) {
        return push(w, `${actor}: still blocked, cannot read yet`)
      }
      const slots = visibleSlots(w)

      if (cfg.design === 'slots' && slots.length > 0) {
        const remaining = slots[0].capacityTotal - slots[0].capacityReserved
        if (remaining < cfg.attendees) {
          const incident: Incident = {
            operation: 'create',
            source: 'application_check',
            message: MSG.capacity,
            details: '{}',
          }
          return push(
            {
              ...w,
              incidents: [...w.incidents, incident],
              lockHeldBy: w.lockHeldBy === actor ? null : w.lockHeldBy,
              txn: {
                ...w.txn,
                [actor]: { ...me, phase: 'aborted', readRemaining: remaining, error: MSG.capacity, refusedBy: 'application_check' },
              },
            },
            `${actor}: capacity_remaining=${remaining} < attendee_count=${cfg.attendees}`,
            `ConflictError: ${MSG.capacity}`,
            'BookingConflictIncident(conflict_source=application_check) recorded',
          )
        }
        return push(
          { ...w, txn: { ...w.txn, [actor]: { ...me, phase: 'checked', readRemaining: remaining } } },
          `${actor}: read capacity_remaining=${remaining}, ok for ${cfg.attendees}`,
        )
      }

      // The else branch: no slots, so any active overlapping booking is a hard
      // conflict, and an active checkout hold is too.
      const conflict = w.bookings.find((b) => b.status === 'confirmed' && b.actor !== actor)
      if (conflict) {
        const incident: Incident = {
          operation: 'create',
          source: 'application_check',
          message: MSG.alreadyBooked(conflict.id),
          details: `{"conflicting_booking_id": ${conflict.id}}`,
        }
        return push(
          {
            ...w,
            incidents: [...w.incidents, incident],
            lockHeldBy: w.lockHeldBy === actor ? null : w.lockHeldBy,
            txn: {
              ...w.txn,
              [actor]: { ...me, phase: 'aborted', readRemaining: 0, error: MSG.alreadyBooked(conflict.id), refusedBy: 'application_check' },
            },
          },
          `${actor}: _find_booking_conflict found booking #${conflict.id}`,
          `ConflictError: ${MSG.alreadyBooked(conflict.id)}`,
          'BookingConflictIncident(conflict_source=application_check) recorded',
        )
      }
      const activeHold = w.holds.find(
        (h) => h.actor !== actor && h.status === 'active' && h.holdExpiresAtMin > w.nowMin,
      )
      if (activeHold) {
        const rid = activeHold.actor === 'A' ? 1 : 2
        const incident: Incident = {
          operation: 'create',
          source: 'application_check',
          message: MSG.holdConflict(rid),
          details: `{"conflicting_request_id": ${rid}}`,
        }
        return push(
          {
            ...w,
            incidents: [...w.incidents, incident],
            lockHeldBy: w.lockHeldBy === actor ? null : w.lockHeldBy,
            txn: {
              ...w.txn,
              [actor]: { ...me, phase: 'aborted', error: MSG.holdConflict(rid), refusedBy: 'application_check' },
            },
          },
          `${actor}: _find_checkout_hold_conflict found request #${rid}`,
          `ConflictError: ${MSG.holdConflict(rid)}`,
          'BookingConflictIncident(conflict_source=application_check) recorded',
        )
      }
      return push(
        { ...w, txn: { ...w.txn, [actor]: { ...me, phase: 'checked', readRemaining: 1 } } },
        `${actor}: _find_booking_conflict returned None, window looks free`,
      )
    }

    case 'reserve': {
      if (me.phase !== 'checked') return push(w, `${actor}: nothing to reserve yet`)
      const slots = visibleSlots(w)
      if (cfg.design !== 'slots' || slots.length === 0) {
        return push(
          { ...w, txn: { ...w.txn, [actor]: { ...me, phase: 'reserved' } } },
          `${actor}: no slots on this path, nothing to reserve`,
        )
      }
      const slot = slots[0]
      const next = slot.capacityReserved + cfg.attendees
      if (next > slot.capacityTotal) {
        // _reserve_capacity is an UPDATE, and it sits outside the one
        // try/except IntegrityError in create_booking. So the CheckConstraint
        // fires and nothing catches it: no ConflictError, no incident.
        return push(
          {
            ...w,
            crashed: MSG.checkConstraint,
            txn: {
              ...w.txn,
              [actor]: { ...me, phase: 'aborted', error: MSG.checkConstraint },
            },
          },
          `${actor}: UPDATE capacity_reserved = ${slot.capacityReserved} + ${cfg.attendees} = ${next} > capacity_total = ${slot.capacityTotal}`,
          MSG.checkConstraint,
          'uncaught: _reserve_capacity sits outside the try/except IntegrityError, so no incident is recorded and the request 500s',
        )
      }
      return push(
        {
          ...w,
          slots: w.slots.map((s) => (s.isBookable ? { ...s, capacityReserved: next } : s)),
          txn: { ...w.txn, [actor]: { ...me, phase: 'reserved', reserved: cfg.attendees } },
        },
        `${actor}: capacity_reserved = F('capacity_reserved') + ${cfg.attendees} -> ${next}`,
      )
    }

    case 'insert': {
      if (me.phase !== 'reserved' && me.phase !== 'checked') return push(w, `${actor}: not ready to insert`)
      // The Postgres exclusion constraint is the only thing that can refuse an
      // overlapping INSERT, and migration 0003 only creates it on postgresql.
      const overlapping = w.bookings.some((b) => b.status === 'confirmed' && b.actor !== actor)
      const slots = visibleSlots(w)
      const guarded = cfg.vendor === 'postgresql' && overlapping && (cfg.design !== 'slots' || slots.length === 0)
      if (guarded) {
        const incident: Incident = {
          operation: 'create',
          source: 'db_constraint',
          message: MSG.dbConflict,
          details: '{"source": "integrity_error"}',
        }
        return push(
          {
            ...w,
            incidents: [...w.incidents, incident],
            lockHeldBy: w.lockHeldBy === actor ? null : w.lockHeldBy,
            txn: {
              ...w.txn,
              [actor]: { ...me, phase: 'aborted', error: MSG.dbConflict, refusedBy: 'db_constraint' },
            },
          },
          `${actor}: ${MSG.exclusion}`,
          `ConflictError: ${MSG.dbConflict}`,
          'BookingConflictIncident(conflict_source=db_constraint) recorded',
        )
      }
      const id = w.bookings.length + 1
      return push(
        {
          ...w,
          bookings: [...w.bookings, { id, actor, status: 'confirmed' }],
          txn: { ...w.txn, [actor]: { ...me, phase: 'inserted', bookingId: id } },
        },
        `${actor}: INSERT booking #${id} status=confirmed`,
        ...(overlapping && cfg.vendor === 'sqlite'
          ? ['no exclusion constraint on this vendor: the overlapping row is accepted']
          : []),
      )
    }

    case 'commit': {
      if (me.phase !== 'inserted') return push(w, `${actor}: nothing to commit`)
      const idemRow: IdemRow | null =
        cfg.idem === 'none'
          ? null
          : {
              key: `key-${actor}`,
              endpoint: 'scheduling.booking.create',
              requestHash: 'sha256(payload)',
              bookingId: me.bookingId!,
            }
      // Whoever was blocked on this lock now has it: their SELECT FOR UPDATE
      // returns the moment the holder commits.
      const otherTxn = w.txn[other]
      const handOver = otherTxn.phase === 'blocked'
      return push(
        {
          ...w,
          lockHeldBy: handOver ? other : w.lockHeldBy === actor ? null : w.lockHeldBy,
          idem: idemRow ? [...w.idem, idemRow] : w.idem,
          txn: {
            ...w.txn,
            [actor]: { ...me, phase: 'committed', holdsLock: false },
            ...(handOver ? { [other]: { ...otherTxn, phase: 'locked' as const, holdsLock: true } } : {}),
          },
        },
        `${actor}: COMMIT, lock released`,
        ...(idemRow
          ? ['_save_idempotency writes the IdempotencyRecord, after the transaction has already committed']
          : []),
        ...(handOver ? [`${other}: unblocked, its SELECT FOR UPDATE returns and it now holds the lock`] : []),
      )
    }
  }
}

// ---------------------------------------------------------------------------
// The outcome
// ---------------------------------------------------------------------------

export type Variant =
  | 'nothing-yet'
  | 'booked'
  | 'refused-application'
  | 'refused-db-constraint'
  | 'double-booked-silently'
  | 'crash-uncaught'
  | 'idempotent-replay'
  | 'hold-expired-after-payment'

export const VARIANTS: { id: Variant; label: string; blurb: string }[] = [
  { id: 'booked', label: 'one booking, cleanly', blurb: 'the window is taken once and nothing is refused' },
  { id: 'refused-application', label: 'refused by the application check', blurb: 'ConflictError, and an incident tagged application_check' },
  { id: 'refused-db-constraint', label: 'refused by the database', blurb: 'the exclusion constraint fired and the incident says db_constraint' },
  { id: 'double-booked-silently', label: 'double booked, nothing recorded', blurb: 'two active bookings on one resource and zero incidents' },
  { id: 'crash-uncaught', label: 'an uncaught IntegrityError', blurb: 'the check constraint fired where nothing catches it: a 500, no incident' },
  { id: 'idempotent-replay', label: 'the stored response replayed', blurb: 'the retry returned the first booking and created nothing' },
  { id: 'hold-expired-after-payment', label: 'a paid hold expired anyway', blurb: 'the seats went back while paid_at was set' },
  { id: 'nothing-yet', label: 'nothing has happened yet', blurb: 'no attempt has run' },
]

export interface ProvEdge {
  from: string
  to: string
  because: string
}

export interface Outcome {
  world: World
  variant: Variant
  reason: string
  activeBookings: number
  incidentsBySource: { application_check: number; db_constraint: number }
  /** True when there are more active bookings than the design should allow. */
  overbooked: boolean
  /** Bookings that got through with nothing recorded about it. */
  silent: boolean
  constraintPresent: boolean | null
  capacityLine: string
  provenance: ProvEdge[]
}

export function outcome(w: World, cfg: Config): Outcome {
  const prov: ProvEdge[] = []
  const active = w.bookings.filter((b) => b.status === 'confirmed').length
  const bySource = {
    application_check: w.incidents.filter((i) => i.source === 'application_check').length,
    db_constraint: w.incidents.filter((i) => i.source === 'db_constraint').length,
  }

  // The capacity the design permits in this window.
  const allowed =
    cfg.design === 'slots' && visibleSlots(w).length > 0
      ? Math.floor(visibleSlots(w)[0].capacityTotal / Math.max(1, cfg.attendees))
      : 1
  const overbooked = active > allowed
  const silent = overbooked && w.incidents.length === 0

  // constraint_present: only asked on postgresql, so it is None elsewhere.
  const constraintPresent = cfg.vendor === 'postgresql' ? true : null

  if (cfg.vendor === 'sqlite') {
    prov.push({
      from: 'vendor = sqlite',
      to: 'no exclusion constraint',
      because: 'migration 0003 returns immediately when connection.vendor != "postgresql"',
    })
  }
  if (cfg.locking === 'none') {
    prov.push({
      from: 'no select_for_update',
      to: 'both transactions read before either writes',
      because: 'nothing serialises them, so each check sees the state before the other reserved',
    })
  }

  const paidLost = w.holds.some((h) => h.status === 'expired' && h.paidAtMin !== null)

  let variant: Variant
  let reason: string

  if (paidLost) {
    variant = 'hold-expired-after-payment'
    reason =
      'The hold was paid and then expired anyway. expire_checkout_sessions selects on status=ACTIVE and hold_expires_at, never on paid_at, and release_checkout_session only refuses a session that is already FINALIZED. The seats went back to the pool.'
  } else if (w.crashed) {
    variant = 'crash-uncaught'
    reason =
      'The check constraint fired inside _reserve_capacity, which sits outside the only try/except IntegrityError in create_booking. Nothing converted it to a ConflictError and nothing recorded an incident: the caller gets a 500.'
    prov.push({
      from: 'stale read then reserve',
      to: 'capacity_reserved > capacity_total',
      because: 'the CheckConstraint capacity_reserved_lte_total refused the UPDATE',
    })
  } else if (silent) {
    variant = 'double-booked-silently'
    reason = `${active} active bookings on one resource, and zero incidents. Both transactions checked before either inserted, and on this vendor there is no constraint to catch the second one.`
  } else if (Object.values(w.txn).some((t) => t.replayed)) {
    variant = 'idempotent-replay'
    reason =
      'The retry found an IdempotencyRecord with a matching request hash and returned the stored booking id with created=False. No second booking exists.'
  } else if (Object.values(w.txn).some((t) => t.refusedBy === 'db_constraint')) {
    variant = 'refused-db-constraint'
    reason =
      'The application check let it through and the database refused it. The incident is tagged db_constraint, which is the signal that layer one leaked.'
  } else if (Object.values(w.txn).some((t) => t.refusedBy === 'application_check')) {
    variant = 'refused-application'
    reason =
      'The application check caught it before any write. The incident is tagged application_check, which is the layer you want doing the work.'
  } else if (active > 0) {
    variant = 'booked'
    reason = `${active} booking(s) confirmed, within the ${allowed} this window allows. No incidents.`
  } else {
    variant = 'nothing-yet'
    reason = 'Nothing has run yet. Materialize the slots, then step the two transactions.'
  }

  const slots = visibleSlots(w)
  const capacityLine = slots.length
    ? `${slots[0].capacityReserved} / ${slots[0].capacityTotal} reserved`
    : w.slots.length
      ? 'the only slot is not bookable'
      : 'no slots exist'

  return {
    world: w,
    variant,
    reason,
    activeBookings: active,
    incidentsBySource: bySource,
    overbooked,
    silent,
    constraintPresent,
    capacityLine,
    provenance: prov,
  }
}

export function run(cfg: Config, events: SchedEvent[]): Outcome {
  const w = events.reduce((acc, e) => step(acc, e, cfg), emptyWorld)
  return outcome(w, cfg)
}

export function runPrefix(cfg: Config, events: SchedEvent[], upTo: number): Outcome {
  return run(cfg, events.slice(0, upTo))
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const seq = (actor: Actor, ...phases: Phase[]): SchedEvent[] => phases.map((phase) => ({ t: 'txn', actor, phase }))

export const SCENARIOS: {
  id: string
  label: string
  blurb: string
  events: SchedEvent[]
  config?: Partial<Config>
}[] = [
  {
    id: 'serial',
    label: 'one after the other',
    blurb: 'A finishes before B starts: the boring, correct case',
    events: [
      { t: 'materialize' },
      ...seq('A', 'lock', 'check', 'reserve', 'insert', 'commit'),
      ...seq('B', 'lock', 'check'),
    ],
  },
  {
    id: 'interleaved-locked',
    label: 'interleaved, lock on',
    blurb: 'B tries to start while A is mid-transaction',
    events: [
      { t: 'materialize' },
      ...seq('A', 'lock', 'check'),
      ...seq('B', 'lock'),
      ...seq('A', 'reserve', 'insert', 'commit'),
      ...seq('B', 'lock', 'check'),
    ],
  },
  {
    id: 'interleaved-unlocked',
    label: 'interleaved, lock off',
    blurb: 'both read before either writes',
    config: { locking: 'none' },
    events: [
      { t: 'materialize' },
      ...seq('A', 'lock', 'check'),
      ...seq('B', 'lock', 'check'),
      ...seq('A', 'reserve', 'insert', 'commit'),
      ...seq('B', 'reserve'),
    ],
  },
  {
    id: 'naive',
    label: 'the overlap query, lock off',
    blurb: 'no slots, no lock, no constraint',
    config: { design: 'overlap-query', locking: 'none', vendor: 'sqlite' },
    events: [
      ...seq('A', 'lock', 'check'),
      ...seq('B', 'lock', 'check'),
      ...seq('A', 'insert', 'commit'),
      ...seq('B', 'insert', 'commit'),
    ],
  },
  {
    id: 'paid-then-expired',
    label: 'paid, then expired',
    blurb: 'pay at minute 29 of a 30 minute hold, then the job runs',
    events: [
      { t: 'materialize' },
      { t: 'request', actor: 'A' },
      { t: 'approve', actor: 'A' },
      { t: 'tick', minutes: 29 },
      { t: 'pay', actor: 'A' },
      { t: 'tick', minutes: 2 },
      { t: 'run-expire-holds' },
    ],
  },
]

// ---------------------------------------------------------------------------
// State round trip
// ---------------------------------------------------------------------------

const PH: Phase[] = ['lock', 'check', 'reserve', 'insert', 'commit']

export function encodeState(cfg: Config, events: SchedEvent[]): string {
  const c = [
    cfg.design,
    cfg.vendor,
    cfg.locking,
    String(cfg.slotCapacity),
    String(cfg.attendees),
    cfg.idem,
    cfg.dst,
    cfg.blackout ? '1' : '0',
    String(cfg.holdMinutes),
  ].join('~')
  const ev = events
    .map((e) => {
      if (e.t === 'txn') return `${e.actor}${PH.indexOf(e.phase)}`
      if (e.t === 'tick') return `t${e.minutes}`
      if (e.t === 'request') return `q${e.actor}`
      if (e.t === 'approve') return `a${e.actor}`
      if (e.t === 'pay') return `p${e.actor}`
      if (e.t === 'retry') return `y${e.actor}`
      if (e.t === 'materialize') return 'M'
      if (e.t === 'run-expire-holds') return 'X'
      return 'R'
    })
    .join('.')
  return `${c}|${ev}`
}

export function decodeState(raw: string): { config: Config; events: SchedEvent[] } | null {
  const [c, ev] = raw.split('|')
  if (!c) return null
  const p = c.split('~')
  if (p.length !== 9) return null
  const [design, vendor, locking, cap, att, idem, dst, blackout, hold] = p
  if (design !== 'slots' && design !== 'overlap-query') return null
  if (vendor !== 'sqlite' && vendor !== 'postgresql') return null
  if (locking !== 'select-for-update' && locking !== 'none') return null
  if (!['none', 'same-key-same-payload', 'same-key-different-payload'].includes(idem)) return null
  if (!['normal', 'spring-forward', 'fall-back'].includes(dst)) return null
  const config: Config = {
    design,
    vendor,
    locking,
    slotCapacity: Number(cap) || 1,
    attendees: Number(att) || 1,
    idem: idem as Idem,
    dst: dst as Dst,
    blackout: blackout === '1',
    holdMinutes: Number(hold) || 30,
  }
  const events: SchedEvent[] = []
  for (const tok of (ev || '').split('.').filter(Boolean)) {
    if (tok === 'M') events.push({ t: 'materialize' })
    else if (tok === 'X') events.push({ t: 'run-expire-holds' })
    else if (tok === 'R') events.push({ t: 'run-expire-requests' })
    else if (tok.startsWith('t')) events.push({ t: 'tick', minutes: Number(tok.slice(1)) || 1 })
    else if (tok[0] === 'A' || tok[0] === 'B') {
      const phase = PH[Number(tok.slice(1))]
      if (!phase) return null
      events.push({ t: 'txn', actor: tok[0] as Actor, phase })
    } else {
      const map: Record<string, SchedEvent['t']> = { q: 'request', a: 'approve', p: 'pay', y: 'retry' }
      const t = map[tok[0]]
      const actor = tok[1] as Actor
      if (!t || (actor !== 'A' && actor !== 'B')) return null
      events.push({ t, actor } as SchedEvent)
    }
  }
  return { config, events }
}
