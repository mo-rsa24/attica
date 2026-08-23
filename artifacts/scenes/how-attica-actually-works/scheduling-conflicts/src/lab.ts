// Laboratory primitives. Pure: imports the model and nothing else.

import type { Config, Outcome, SchedEvent } from './model'

export interface Intervention {
  target: string
  operation: 'set' | 'event' | 'scenario' | 'load'
  before?: string
  after?: string
  label: string
  patch: { config?: Partial<Config>; append?: SchedEvent; events?: SchedEvent[] }
}

export function replay(
  baseConfig: Config,
  baseEvents: SchedEvent[],
  history: Intervention[],
): { config: Config; events: SchedEvent[] } {
  let config = { ...baseConfig }
  let events = [...baseEvents]
  for (const iv of history) {
    if (iv.patch.config) config = { ...config, ...iv.patch.config }
    if (iv.patch.events) events = [...iv.patch.events]
    if (iv.patch.append) events = [...events, iv.patch.append]
  }
  return { config, events }
}

// ---------------------------------------------------------------------------
// Changeset
// ---------------------------------------------------------------------------

export interface Change {
  observable: string
  before: string
  after: string
}

const OBSERVED: [string, (o: Outcome) => string][] = [
  ['outcome', (o) => o.variant],
  ['active bookings', (o) => String(o.activeBookings)],
  ['capacity', (o) => o.capacityLine],
  ['incidents: application_check', (o) => String(o.incidentsBySource.application_check)],
  ['incidents: db_constraint', (o) => String(o.incidentsBySource.db_constraint)],
  ['overbooked', (o) => (o.overbooked ? 'yes' : 'no')],
  ['A', (o) => o.world.txn.A.phase],
  ['B', (o) => o.world.txn.B.phase],
  ['lock held by', (o) => o.world.lockHeldBy ?? 'nobody'],
  ['slots', (o) => String(o.world.slots.length)],
  ['slots created', (o) => String(o.world.slotsCreated)],
  ['skipped nonexistent', (o) => String(o.world.skippedNonexistent)],
  ['IdempotencyRecords', (o) => String(o.world.idem.length)],
  ['uncaught error', (o) => o.world.crashed ?? 'none'],
  ['clock', (o) => `t+${o.world.nowMin}`],
]

export function changeset(prev: Outcome, next: Outcome): Change[] {
  return OBSERVED.filter(([, f]) => f(prev) !== f(next)).map(([observable, f]) => ({
    observable,
    before: f(prev),
    after: f(next),
  }))
}

// ---------------------------------------------------------------------------
// Probes
// ---------------------------------------------------------------------------

export interface Probe {
  id: string
  label: string
  traces: string
  select(o: Outcome): string
  healthy?(o: Outcome): boolean
}

export const PROBES: Probe[] = [
  {
    id: 'bookings',
    label: 'active bookings on this window',
    traces: 'claim: the window is taken exactly as often as capacity allows',
    select: (o) => String(o.activeBookings),
    healthy: (o) => !o.overbooked,
  },
  {
    id: 'capacity',
    label: 'capacity_reserved / capacity_total',
    traces: 'mechanism: booking is a bounded counter increment',
    select: (o) => o.capacityLine,
    healthy: (o) => !o.overbooked,
  },
  {
    id: 'incidents',
    label: 'incidents by source',
    traces: 'mechanism: which layer caught it',
    select: (o) =>
      `application_check ${o.incidentsBySource.application_check}, db_constraint ${o.incidentsBySource.db_constraint}`,
    healthy: (o) => o.incidentsBySource.db_constraint === 0,
  },
  {
    id: 'silence',
    label: 'collisions that went unrecorded',
    traces: 'do-not case: the worst outcome is the quiet one',
    select: (o) => (o.silent ? 'yes, and nothing is in the incident log' : o.world.crashed ? 'an uncaught 500, no incident' : 'none'),
    healthy: (o) => !o.silent && !o.world.crashed,
  },
  {
    id: 'constraint',
    label: 'constraint_present',
    traces: 'do-not case: the second layer is vendor-conditional',
    select: (o) => (o.constraintPresent === null ? 'None (not asked on this vendor)' : String(o.constraintPresent)),
    healthy: (o) => o.constraintPresent === true,
  },
  {
    id: 'slots',
    label: 'slots materialized',
    traces: 'alternative: the rows the overlap-query design never needs',
    select: (o) =>
      o.world.slots.length === 0
        ? o.world.skippedNonexistent > 0
          ? `none, ${o.world.skippedNonexistent} skipped as nonexistent`
          : 'none'
        : `${o.world.slots.length}, created ${o.world.slotsCreated} over ${o.world.materializeRuns} run(s)`,
  },
]
