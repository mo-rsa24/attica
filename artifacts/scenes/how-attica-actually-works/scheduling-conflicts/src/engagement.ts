// The engagement layer: generated tour, prediction points, excursions.

import { PARTS } from './pipeline'

export interface TourStep {
  anchor: string
  heading: string
  body: string
  tryIt?: string
  real?: string
  goTo?: { stage?: number }
}

// Argument-first, so: one per stage-strip surface, one per component that
// breaks, one for the inspector, one for the outcome surface. Nine parts break,
// plus five surfaces, is fourteen against a cap of eight. Kept: the three parts
// the claim card turns on (design, lock, vendor) and five surfaces. Dropped, all
// with their own failure card in stage 3: capacity, attendees, idem, dst,
// blackout, hold.
const TOUR_PARTS = ['design', 'lock', 'vendor']

export function buildTour(): TourStep[] {
  const steps: TourStep[] = [
    {
      anchor: 'stage-strip',
      heading: 'Five stages, each one standing alone',
      body:
        'Stage 0 is the argument, stage 2 is the machinery, stage 3 is what it costs. Each is a link you can paste to someone.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'lanes',
      heading: 'Two designs, the same two attempts',
      body:
        'One booking table with an overlap query on the left, materialized slots with a counter on the right. Both run the interleaving you choose below.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'stepper',
      heading: 'You decide the order',
      body:
        'create_booking really does have these five phases. Click them in any order you like, alternating between A and B, and watch where the two transactions cross.',
      tryIt: 'A: check, then B: check, then A: reserve. Both read before either wrote.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'readouts',
      heading: 'What the run produced',
      body:
        'Bookings, the capacity counter, and the incident log split by which layer caught the collision. The last one is the number to watch.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'map',
      heading: 'The pipeline, when you want it',
      body:
        'From stage 1 the map is the anchored surface: rules becoming slots on one side, requests becoming bookings on the other. Any box with a corner mark opens.',
      goTo: { stage: 2 },
    },
  ]

  for (const id of TOUR_PARTS) {
    const p = PARTS.find((x) => x.id === id)
    if (!p) continue
    steps.push({
      anchor: `part:${p.id}`,
      heading: p.label,
      body: p.what,
      tryIt: p.breaks,
      real: p.real,
      goTo: { stage: p.stage },
    })
  }

  return steps
}

export const TOUR = buildTour()

// ---------------------------------------------------------------------------
// Predictions
// ---------------------------------------------------------------------------

export interface PredictPoint {
  id: string
  question: string
}

export const PREDICTIONS: PredictPoint[] = [
  {
    id: 'naive',
    question:
      'One booking table, an overlap query, no lock, on SQLite. Both A and B check, then both insert. What comes out?',
  },
  {
    id: 'unlocked-slots',
    question:
      'Materialized slots with capacity 1, but no lock. Both check while the counter reads 1, then both reserve. What comes out?',
  },
  {
    id: 'postgres',
    question:
      'The overlap query with no lock again, but the database is Postgres this time. What comes out?',
  },
  {
    id: 'blackout',
    question:
      'A blackout exception now covers the window, and the resource has exactly one slot. A tries to book. What comes out?',
  },
  {
    id: 'paid-expired',
    question:
      'A pays at minute 29 of a 30 minute hold, then the expiry job runs at minute 31. What happens to the hold?',
  },
]

// ---------------------------------------------------------------------------
// Excursions
// ---------------------------------------------------------------------------

export interface Excursion {
  id: string
  where: string
  does: string
  returns: string
  means: string
  check: 'state' | 'number' | 'none'
  stage: number
}

export const EXCURSIONS: Excursion[] = [
  {
    id: 'statuses',
    where: 'VS Code, with models.py:412 and migrations/0003_postgres_booking_overlap_constraint.py open side by side',
    does:
      'Compare Booking.ACTIVE_STATES with the status list in the constraint\'s WHERE clause. Count how many statuses appear in the SQL.',
    returns: 'type the count. The scene compares it against the same list in its own model.',
    means:
      'The same set is written twice, in two languages, in two files, and nothing checks that they agree. Add a sixth active status in Python and the constraint silently stops covering it.',
    check: 'number',
    stage: 2,
  },
  {
    id: 'find-silence',
    where: 'this page, with the phase stepper and the controls',
    does:
      'Find an interleaving that ends with two active bookings on one resource and nothing at all in the incident log. Then copy the link from the address bar.',
    returns:
      'paste it back. The scene decodes the configuration and the whole schedule and folds them through the same run() it uses everywhere.',
    means:
      'That is the outcome the extra models exist to prevent, and the one your monitoring cannot see: no exception was raised, no incident was written, and both organizers were told yes.',
    check: 'state',
    stage: 3,
  },
  {
    id: 'monitor',
    where: 'a terminal, in backend/main, with the venv active',
    does:
      'Run: python manage.py shell -c "from scheduling.services import get_constraint_monitor_status as s; print(s())" and read database_vendor and constraint_present.',
    returns:
      'what constraint_present came back as. Only you can see your own database, so the scene cannot check this one.',
    means:
      'On SQLite it is None, not False, because the function only asks the question on postgresql. None means unknown, and here unknown means absent.',
    check: 'none',
    stage: 3,
  },
]
