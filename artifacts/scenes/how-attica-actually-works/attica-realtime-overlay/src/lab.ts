// The laboratory primitives. Pure: imports the model and nothing else.
//
// Intervention is the semantic unit of experimentation ("redis: up -> down after
// connect"), never "a select changed". History, replay and reset all fold from
// the list. Changeset says what became different; it never says why, because why
// is the model's own provenance chain.
//
// Contract: ~/.claude/skills/concept-scene/references/laboratory.md

import { initialState, type Outcome, type SceneState } from './model'

// ---------------------------------------------------------------------------
// Interventions
// ---------------------------------------------------------------------------

export interface Intervention {
  target: string
  operation: 'set' | 'toggle' | 'scenario' | 'load'
  before?: string
  after?: string
  /** One plain sentence for the history drawer. */
  label: string
  /** The state change that reproduces this on replay. */
  patch: Partial<SceneState>
}

export const BASELINE: SceneState = { ...initialState }

/** Fold the history from a baseline. Replay must land exactly on the current state. */
export function replayState(baseline: SceneState, history: Intervention[]): SceneState {
  return history.reduce<SceneState>((s, iv) => ({ ...s, ...iv.patch }), { ...baseline })
}

// ---------------------------------------------------------------------------
// Changeset
// ---------------------------------------------------------------------------

export interface Change {
  observable: string
  before: string
  after: string
}

const yesNo = (b: boolean) => (b ? 'yes' : 'no')

const OBSERVED: [string, (o: Outcome) => string][] = [
  ['outcome', (o) => o.variant],
  ['row committed', (o) => yesNo(o.messageDurable)],
  ['HTTP status', (o) => (o.httpStatus === null ? 'no HTTP request' : String(o.httpStatus))],
  ['second browser sees it', (o) => yesNo(o.counterpartSees)],
  [
    'it saw it after',
    (o) => (o.counterpartSeesAtMs === null ? 'never, without a reload' : `${o.counterpartSeesAtMs} ms`),
  ],
  ['socket close code', (o) => (o.socket.closeCode === null ? 'still open' : String(o.socket.closeCode))],
  ['warning frame sent', (o) => yesNo(o.socket.warningFrame)],
  ['broadcast_enabled', (o) => yesNo(o.socket.broadcastEnabled)],
  [
    'members of chat_room_7',
    (o) => (o.groupMembersReadable ? String(o.groupMembers.length) : `${o.groupMembers.length}, unreadable`),
  ],
  ['fallback poll running', (o) => yesNo(o.pollActive)],
  ['rows in the database', (o) => String(o.dbRowCount)],
  ['rows on their screen', (o) => String(o.screenRowCount)],
  ['steps that ran', (o) => String(o.slots.filter((x) => x.status === 'ran').length)],
  ['steps that failed', (o) => String(o.slots.filter((x) => x.status === 'failed').length)],
  ['GETs per minute', (o) => (o.pollActive ? String(o.queriesPerMinute) : '0')],
]

export function changeset(prev: Outcome, next: Outcome): Change[] {
  return OBSERVED.filter(([, f]) => f(prev) !== f(next)).map(([observable, f]) => ({
    observable,
    before: f(prev),
    after: f(next),
  }))
}

// ---------------------------------------------------------------------------
// Probes. Every one names the claim-card field or failure mode it serves; a
// probe that serves none is cut, the same rule that governs animations.
// ---------------------------------------------------------------------------

export interface Probe {
  id: string
  label: string
  traces: string
  select(o: Outcome): string
  /** Is this value the good one right now? Drives the colour, nothing else. */
  healthy?(o: Outcome): boolean
}

export const PROBES: Probe[] = [
  {
    id: 'durable',
    label: 'row committed to SQLite',
    traces: 'claim: the write finishes before anyone is told',
    select: (o) => (o.messageDurable ? `yes, ${o.dbRowCount} rows in room 7` : 'no row written'),
    healthy: (o) => o.messageDurable,
  },
  {
    id: 'sees',
    label: 'second browser sees it',
    traces: 'consequence: what the overlay is actually for',
    select: (o) =>
      o.counterpartSees
        ? `yes, after ${o.counterpartSeesAtMs} ms`
        : o.variant === 'blocked-by-authz'
          ? 'no, and correctly so'
          : 'no, not until it reloads',
    healthy: (o) => o.counterpartSees || o.variant === 'blocked-by-authz',
  },
  {
    id: 'divergence',
    label: 'database ahead of screen by',
    traces: 'do-not case: the cost is staleness, measured',
    select: (o) => `${o.divergence} row${o.divergence === 1 ? '' : 's'}`,
    healthy: (o) => o.divergence === 0,
  },
  {
    id: 'queries',
    label: 'GETs per minute while polling',
    traces: 'alternative: what the 8-second poll costs to run',
    select: (o) => (o.pollActive ? `${o.queriesPerMinute}` : '0, the push path is carrying it'),
    healthy: (o) => !o.pollActive,
  },
  {
    id: 'group',
    label: 'members of chat_room_7',
    traces: 'mechanism: group membership lives in Redis, not in the process',
    select: (o) =>
      !o.groupMembersReadable
        ? o.groupMembers.length === 0
          ? 'no group was ever created'
          : `${o.groupMembers.length} joined, but the set is unreadable now`
        : o.groupMembers.length === 0
          ? 'none'
          : `${o.groupMembers.length}: ${o.groupMembers.join(', ')}`,
    healthy: (o) => o.groupMembersReadable && o.groupMembers.length === 2,
  },
  {
    id: 'signal',
    label: 'did anything tell the client',
    traces: 'do-not case: a silent failure starts no fallback',
    select: (o) =>
      o.socket.closeCode !== null
        ? `close ${o.socket.closeCode}`
        : o.socket.warningFrame
          ? 'the warning frame'
          : 'nothing at all',
    healthy: (o) => o.socket.socketError || o.counterpartSees,
  },
]
