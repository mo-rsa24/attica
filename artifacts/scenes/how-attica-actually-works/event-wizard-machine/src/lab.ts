// Laboratory primitives. Pure: imports the model, nothing else.
//
// An intervention here is either a change to the configuration ("the step 2
// route: redirecting to live") or an event appended to the log ("Next"). Both
// are semantic; neither is "a button was clicked". Replay folds the record.

import { FIELDS, type Config, type MachineEvent, type Outcome } from './model'

export interface Intervention {
  target: string
  operation: 'set' | 'toggle' | 'event' | 'scenario' | 'load'
  before?: string
  after?: string
  label: string
  /** Replay: a config patch, an appended event, or a whole new log. */
  patch: { config?: Partial<Config>; append?: MachineEvent; events?: MachineEvent[] }
}

export function replay(
  baseConfig: Config,
  baseEvents: MachineEvent[],
  history: Intervention[],
): { config: Config; events: MachineEvent[] } {
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
// Changeset: what became different. Never why.
// ---------------------------------------------------------------------------

export interface Change {
  observable: string
  before: string
  after: string
}

const bag = (b: Partial<Record<string, string[]>>) =>
  Object.entries(b)
    .map(([k, v]) => `${k}:${(v || []).length}`)
    .sort()
    .join(' ') || 'empty'

const OBSERVED: [string, (o: Outcome) => string][] = [
  ['outcome', (o) => o.variant],
  ['where you are', (o) => String(o.machine.at ?? 'nowhere')],
  ['current_step on the row', (o) => o.machine.serverCurrentStep ?? 'no row'],
  ['a resume would land on', (o) => o.resumesAt],
  ['data.steps on the server', (o) => bag(o.machine.server)],
  ['steps in the reducer', (o) => bag(o.machine.local)],
  ['typed but never saved', (o) => String(o.lostFields.length)],
  ['waiting for a save', (o) => String(o.unsaved.length)],
  ['progress bar', (o) => `${o.progress}%`],
  ['draft status', (o) => o.machine.status],
  ['Event rows', (o) => String(o.machine.eventsCreated)],
  ['columns filled by default', (o) => (o.published ? String(o.defaultsUsed) : 'not published')],
]

export function changeset(prev: Outcome, next: Outcome): Change[] {
  return OBSERVED.filter(([, f]) => f(prev) !== f(next)).map(([observable, f]) => ({
    observable,
    before: f(prev),
    after: f(next),
  }))
}

// ---------------------------------------------------------------------------
// Probes. Each names the claim-card field it serves, or it would be cut.
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
    id: 'resume',
    label: 'a resume lands on',
    traces: 'claim: you come back to where you left off',
    select: (o) => o.resumesAt,
    healthy: (o) => !o.resumesAt.startsWith('nowhere'),
  },
  {
    id: 'lost',
    label: 'typed but never saved',
    traces: 'alternative: what the client-only design loses',
    select: (o) =>
      o.lostFields.length === 0
        ? 'nothing'
        : o.lostFields.map((l) => FIELDS.find((f) => f.id === l.field)?.label ?? l.field).join(', '),
    healthy: (o) => o.lostFields.length === 0,
  },
  {
    id: 'unsaved',
    label: 'in the browser only',
    traces: 'mechanism: the reducer runs ahead of the server between saves',
    select: (o) => (o.unsaved.length === 0 ? 'nothing' : `${o.unsaved.length} field(s)`),
    healthy: (o) => o.unsaved.length === 0,
  },
  {
    id: 'defaults',
    label: 'columns filled by fallback',
    traces: 'do-not case: publish cannot refuse an incomplete draft',
    select: (o) => (o.published ? `${o.defaultsUsed} of ${FIELDS.length}` : 'not published yet'),
    healthy: (o) => !o.published || o.defaultsUsed === 0,
  },
  {
    id: 'events',
    label: 'Event rows from this draft',
    traces: 'mechanism: publish upserts on published_event_id',
    select: (o) => String(o.machine.eventsCreated),
    healthy: (o) => o.machine.eventsCreated <= 1,
  },
  {
    id: 'progress',
    label: 'progress bar reads',
    traces: 'mechanism: progress is an index into STEP_SEQUENCE',
    select: (o) => `${o.progress}%`,
    healthy: (o) => o.machine.at === null || o.progress > 0,
  },
]
