import { create } from 'zustand'
import { DEFAULT_KNOBS, type FieldChange, type Intervention, type Knobs, type StageId, type World } from './model/types'
import { STEPS, diff, clientDiff, run } from './model/journey'

export type Level =
  | { kind: 'journey' }
  | { kind: 'stage'; stage: StageId }
  | { kind: 'call'; cid: string }

export type Popover = { key: string; x: number; y: number } | null
export type DrawerId = 'source' | 'probes' | 'history' | 'fork' | null

export type Changeset = {
  label: string
  detail: string
  rows: FieldChange[]
  client: { field: string; before: unknown; after: unknown }[]
}

/** A prediction the reader commits to before the intervention fires. */
export type Pending = {
  stepId: string
  question: string
  options: string[]
  correct: number
  chosen: number | null
} | null

type Scene = {
  knobs: Knobs
  cursor: number
  world: World
  level: Level
  popover: Popover
  drawer: DrawerId
  interventions: Intervention[]
  changeset: Changeset | null
  pending: Pending
  tour: number | null
  forkOpen: boolean

  setKnob: <K extends keyof Knobs>(k: K, v: Knobs[K]) => void
  advance: () => void
  rewindTo: (cursor: number) => void
  reset: () => void
  goto: (l: Level) => void
  openPopover: (key: string, x: number, y: number) => void
  closePopover: () => void
  toggleDrawer: (d: Exclude<DrawerId, null>) => void
  ask: (p: NonNullable<Pending>) => void
  answer: (i: number) => void
  clearPending: () => void
  startTour: () => void
  tourNext: () => void
  endTour: () => void
}

const KNOB_LABELS: Record<keyof Knobs, string> = {
  serializeUserType: 'user_type in UserSerializer.fields',
  artistRow: 'Artist row for this user',
  organizerPageReachable: 'link to /organizers/:id exists',
  resourceExists: 'MarketplaceResource for the artist',
  myEventsShape: 'my-events payload shape',
  idempotencyHeader: 'Idempotency-Key header',
  chatBidHasMatch: 'a BookingRequest the bid can match',
  bookingEntry: 'booking submitted from',
}

export const useScene = create<Scene>((set, get) => ({
  knobs: { ...DEFAULT_KNOBS },
  cursor: 0,
  world: run(DEFAULT_KNOBS, 0),
  level: { kind: 'journey' },
  popover: null,
  drawer: null,
  interventions: [],
  changeset: null,
  pending: null,
  tour: null,
  forkOpen: false,

  setKnob: (key, value) => {
    const s = get()
    const before = s.world
    const knobs = { ...s.knobs, [key]: value }
    const after = run(knobs, s.cursor)
    const rows = diff(before, after)
    const client = clientDiff(before, after)
    set({
      knobs,
      world: after,
      changeset: {
        label: KNOB_LABELS[key],
        detail: `${String(s.knobs[key])} → ${String(value)}`,
        rows, client,
      },
      interventions: [
        ...s.interventions,
        {
          n: s.interventions.length + 1, kind: 'knob',
          label: KNOB_LABELS[key],
          detail: `${String(s.knobs[key])} → ${String(value)}`,
          changes: rows,
          callsAdded: after.calls.slice(before.calls.length).map((c) => c.cid),
        },
      ],
    })
  },

  advance: () => {
    const s = get()
    if (s.cursor >= STEPS.length) return
    const before = s.world
    const cursor = s.cursor + 1
    const after = run(s.knobs, cursor)
    const rows = diff(before, after)
    const client = clientDiff(before, after)
    const step = STEPS[s.cursor]
    const newCalls = after.calls.slice(before.calls.length)
    set({
      cursor,
      world: after,
      level: newCalls.length ? { kind: 'call', cid: newCalls[newCalls.length - 1].cid } : s.level,
      changeset: { label: step.label, detail: `step ${cursor} of ${STEPS.length}`, rows, client },
      interventions: [
        ...s.interventions,
        {
          n: s.interventions.length + 1, kind: 'step', label: step.label,
          detail: `${step.stage} · ${step.id}`, changes: rows,
          callsAdded: newCalls.map((c) => c.cid),
        },
      ],
    })
  },

  rewindTo: (cursor) => {
    const s = get()
    const before = s.world
    const after = run(s.knobs, cursor)
    set({
      cursor, world: after, level: { kind: 'journey' },
      changeset: { label: 'rewound', detail: `to step ${cursor}`, rows: diff(before, after), client: clientDiff(before, after) },
    })
  },

  reset: () => set({
    knobs: { ...DEFAULT_KNOBS }, cursor: 0, world: run(DEFAULT_KNOBS, 0),
    level: { kind: 'journey' }, interventions: [], changeset: null, popover: null, pending: null,
  }),

  goto: (level) => set({ level, popover: null }),
  openPopover: (key, x, y) => set({ popover: { key, x, y } }),
  closePopover: () => set({ popover: null }),
  toggleDrawer: (d) => set((s) => ({ drawer: s.drawer === d ? null : d })),

  ask: (p) => set({ pending: p }),
  answer: (i) => set((s) => (s.pending ? { pending: { ...s.pending, chosen: i } } : {})),
  clearPending: () => set({ pending: null }),

  startTour: () => set({ tour: 0 }),
  tourNext: () => set((s) => (s.tour === null ? {} : { tour: s.tour + 1 })),
  endTour: () => set({ tour: null }),
}))
