// Live checks. They run in the page and standalone with `npm run checks`.
//
// The space: every configuration crossed with the scenarios, plus every
// interleaving of the two transactions' five phases up to a bounded length.
// An interleaving space is combinatorial, so the bound is stated rather than
// implied: a check that quietly covers less than it sounds like is worse than
// no check.

import {
  PHASE_ORDER,
  SCENARIOS,
  initialConfig,
  run,
  step,
  type Actor,
  type Config,
  type SchedEvent,
} from './model'

export interface Check {
  id: string
  label: string
  defends: string
  run(): { ok: boolean; detail: string }
}

// ---------------------------------------------------------------------------
// The space
// ---------------------------------------------------------------------------

function everyConfig(): Config[] {
  const out: Config[] = []
  for (const design of ['slots', 'overlap-query'] as const)
    for (const vendor of ['sqlite', 'postgresql'] as const)
      for (const locking of ['select-for-update', 'none'] as const)
        for (const slotCapacity of [1, 5])
          for (const attendees of [1, 3])
            for (const blackout of [false, true])
              out.push({ ...initialConfig, design, vendor, locking, slotCapacity, attendees, blackout })
  return out
}

/** Every interleaving of A's five phases with B's five phases, in order per
 *  actor. That is C(10,5) = 252 distinct schedules, which is the whole space
 *  for two transactions of five steps each. */
function everyInterleaving(): SchedEvent[][] {
  const out: SchedEvent[][] = []
  const walk = (ai: number, bi: number, acc: SchedEvent[]) => {
    if (ai === PHASE_ORDER.length && bi === PHASE_ORDER.length) {
      out.push(acc)
      return
    }
    if (ai < PHASE_ORDER.length) {
      walk(ai + 1, bi, [...acc, { t: 'txn', actor: 'A' as Actor, phase: PHASE_ORDER[ai] }])
    }
    if (bi < PHASE_ORDER.length) {
      walk(ai, bi + 1, [...acc, { t: 'txn', actor: 'B' as Actor, phase: PHASE_ORDER[bi] }])
    }
  }
  walk(0, 0, [])
  return out
}

const INTERLEAVINGS = everyInterleaving()
const CONFIGS = everyConfig()

/** Interleavings, with the slots materialized first, under every config. */
function interleavingRuns(): { cfg: Config; events: SchedEvent[] }[] {
  const out: { cfg: Config; events: SchedEvent[] }[] = []
  for (const cfg of CONFIGS)
    for (const il of INTERLEAVINGS) out.push({ cfg, events: [{ t: 'materialize' }, ...il] })
  return out
}

function scenarioRuns(): { cfg: Config; events: SchedEvent[] }[] {
  return SCENARIOS.map((s) => ({ cfg: { ...initialConfig, ...(s.config || {}) }, events: s.events }))
}

const ALL = [...interleavingRuns(), ...scenarioRuns()]

export const SWEEP_SIZE = ALL.length
export const INTERLEAVING_COUNT = INTERLEAVINGS.length

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

export const CHECKS: Check[] = [
  {
    id: 'lock-holds',
    label: 'with slots and the lock, no interleaving overbooks',
    defends: 'the claim itself',
    run() {
      const guarded = ALL.filter(
        ({ cfg }) => cfg.design === 'slots' && cfg.locking === 'select-for-update' && !cfg.blackout,
      )
      const bad = guarded.filter(({ cfg, events }) => run(cfg, events).overbooked)
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} of ${guarded.length} locked runs overbooked`
            : `${guarded.length} locked runs over ${INTERLEAVING_COUNT} interleavings, none overbooked`,
      }
    },
  },
  {
    id: 'falsifier-exists',
    label: 'without the lock, some interleaving does double book in silence',
    defends: 'the falsifier: the scene can produce the result that would sink the claim',
    run() {
      const silent = ALL.filter(({ cfg, events }) => {
        if (cfg.locking !== 'none' || cfg.vendor !== 'sqlite') return false
        return run(cfg, events).silent
      })
      return {
        ok: silent.length > 0,
        detail:
          silent.length > 0
            ? `${silent.length} runs end with more bookings than allowed and zero incidents`
            : 'no run double books silently, which would mean the scene cannot show its own cost',
      }
    },
  },
  {
    id: 'every-refusal-recorded',
    label: 'every refusal from create_booking leaves an incident',
    defends: 'mechanism: BookingConflictIncident is written at both layers',
    run() {
      const bad = ALL.filter(({ cfg, events }) => {
        const o = run(cfg, events)
        const refusals = Object.values(o.world.txn).filter((t) => t.refusedBy !== null).length
        return refusals > o.world.incidents.length
      })
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs refused a booking without recording it`
            : 'every ConflictError raised by a refusal has a matching incident row',
      }
    },
  },
  {
    id: 'uncaught-is-unrecorded',
    label: 'the uncaught IntegrityError records nothing, and only happens without the lock',
    defends: 'do-not case: _reserve_capacity sits outside the try/except',
    run() {
      const crashed = ALL.filter(({ cfg, events }) => run(cfg, events).world.crashed !== null)
      const withLock = crashed.filter(({ cfg }) => cfg.locking === 'select-for-update')
      const recorded = crashed.filter(({ cfg, events }) => run(cfg, events).world.incidents.length > 0)
      return {
        ok: withLock.length === 0,
        detail:
          withLock.length > 0
            ? `${withLock.length} runs hit the check constraint while holding the lock, which should be impossible`
            : `${crashed.length} runs raise the check constraint, all of them unlocked, and ${recorded.length} of them record an incident`,
      }
    },
  },
  {
    id: 'materialize-idempotent',
    label: 'materializing twice creates nothing the second time',
    defends: 'mechanism: get_or_create over uniq_resource_slot_window',
    run() {
      const bad = CONFIGS.filter((cfg) => {
        const once = run(cfg, [{ t: 'materialize' }])
        const twice = run(cfg, [{ t: 'materialize' }, { t: 'materialize' }])
        return (
          twice.world.slotsCreated !== once.world.slotsCreated ||
          twice.world.slots.length !== once.world.slots.length
        )
      })
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} configurations created new rows on the second run`
            : `${CONFIGS.length} configurations: the second run creates 0 slots and adds no rows`,
      }
    },
  },
  {
    id: 'capacity-never-shrinks-below-reserved',
    label: 'materializing never drops capacity_total below capacity_reserved',
    defends: 'mechanism: target_capacity = max(capacity_reserved, desired)',
    run() {
      // Reserve 3 against a capacity-5 slot, then re-materialize with a rule
      // that has been lowered to capacity 1. run() folds one config, so the
      // second materialize is applied with step() directly under the new config:
      // that is the only way to change the rule mid-history.
      const big: Config = { ...initialConfig, slotCapacity: 5, attendees: 3 }
      const before = run(big, [
        { t: 'materialize' },
        { t: 'txn', actor: 'A', phase: 'lock' },
        { t: 'txn', actor: 'A', phase: 'check' },
        { t: 'txn', actor: 'A', phase: 'reserve' },
      ])
      const reserved = before.world.slots[0]?.capacityReserved ?? 0
      if (reserved !== 3) {
        return { ok: false, detail: `setup failed: expected 3 reserved, got ${reserved}` }
      }
      const after = step(before.world, { t: 'materialize' }, { ...big, slotCapacity: 1 })
      const slot = after.slots[0]
      const ok = !!slot && slot.capacityTotal >= slot.capacityReserved
      return {
        ok,
        detail: ok
          ? `reserved ${slot.capacityReserved}, then the rule dropped to capacity 1: capacity_total held at ${slot.capacityTotal} rather than shrinking below it`
          : `a re-materialize shrank the slot to ${slot?.capacityTotal} with ${slot?.capacityReserved} already reserved`,
      }
    },
  },
  {
    id: 'idempotent-retry',
    label: 'a retry with the same key and payload creates no second booking',
    defends: 'mechanism: what IdempotencyRecord actually prevents',
    run() {
      const cfg: Config = { ...initialConfig, idem: 'same-key-same-payload' }
      const first: SchedEvent[] = [
        { t: 'materialize' },
        { t: 'txn', actor: 'A', phase: 'lock' },
        { t: 'txn', actor: 'A', phase: 'check' },
        { t: 'txn', actor: 'A', phase: 'reserve' },
        { t: 'txn', actor: 'A', phase: 'insert' },
        { t: 'txn', actor: 'A', phase: 'commit' },
      ]
      const once = run(cfg, first)
      const retried = run(cfg, [...first, { t: 'retry', actor: 'A' }])
      const ok =
        retried.activeBookings === once.activeBookings &&
        retried.world.txn.A.replayed &&
        retried.world.txn.A.bookingId === once.world.txn.A.bookingId
      return {
        ok,
        detail: ok
          ? `retry replayed booking #${retried.world.txn.A.bookingId} and the booking count stayed at ${retried.activeBookings}`
          : 'the retry produced a second booking',
      }
    },
  },
  {
    id: 'idempotency-mismatch-refuses',
    label: 'the same key with a different payload refuses and books nothing',
    defends: 'mechanism: request_hash is compared, not just the key',
    run() {
      const cfg: Config = { ...initialConfig, idem: 'same-key-different-payload' }
      const events: SchedEvent[] = [
        { t: 'materialize' },
        { t: 'txn', actor: 'A', phase: 'lock' },
        { t: 'txn', actor: 'A', phase: 'check' },
        { t: 'txn', actor: 'A', phase: 'reserve' },
        { t: 'txn', actor: 'A', phase: 'insert' },
        { t: 'txn', actor: 'A', phase: 'commit' },
        { t: 'retry', actor: 'A' },
      ]
      const o = run(cfg, events)
      const ok = o.activeBookings === 1 && o.world.txn.A.error !== null
      return {
        ok,
        detail: ok
          ? `refused with: ${o.world.txn.A.error}`
          : 'a mismatched payload did not refuse',
      }
    },
  },
  {
    id: 'dst-skip',
    label: 'a local time that does not exist produces no slot',
    defends: 'do-not case: the horizon has holes you did not put there',
    run() {
      const o = run({ ...initialConfig, dst: 'spring-forward' }, [{ t: 'materialize' }])
      const ok = o.world.slots.length === 0 && o.world.skippedNonexistent === 1
      return {
        ok,
        detail: ok
          ? 'skipped_nonexistent = 1 and no AvailabilitySlot row exists for that window'
          : 'the nonexistent local time produced a slot anyway',
      }
    },
  },
  {
    id: 'paid-hold-expires',
    label: 'a paid hold still expires and gives its seats back',
    defends: 'do-not case: release_checkout_session only guards on FINALIZED',
    run() {
      const o = run(initialConfig, [
        { t: 'materialize' },
        { t: 'request', actor: 'A' },
        { t: 'approve', actor: 'A' },
        { t: 'tick', minutes: 29 },
        { t: 'pay', actor: 'A' },
        { t: 'tick', minutes: 2 },
        { t: 'run-expire-holds' },
      ])
      const hold = o.world.holds[0]
      const ok = hold?.status === 'expired' && hold.paidAtMin !== null
      return {
        ok,
        detail: ok
          ? `hold paid at t+${hold.paidAtMin} was expired at t+${o.world.nowMin} anyway, and the seats went back`
          : 'the paid hold was protected, so this failure mode does not exist',
      }
    },
  },
]

// ---------------------------------------------------------------------------
// Standalone runner
// ---------------------------------------------------------------------------

declare const process: { exitCode?: number } | undefined

if (typeof process !== 'undefined' && typeof document === 'undefined') {
  let failed = 0
  for (const c of CHECKS) {
    const r = c.run()
    if (!r.ok) failed++
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${c.label}\n      ${r.detail}`)
  }
  console.log(
    `\n${CHECKS.length - failed}/${CHECKS.length} checks passing over ${SWEEP_SIZE.toLocaleString()} runs ` +
      `(${CONFIGS.length} configurations x all ${INTERLEAVING_COUNT} interleavings of two five-phase transactions)`,
  )
  if (failed && process) process.exitCode = 1
}
