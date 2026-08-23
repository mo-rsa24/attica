// The engagement layer: generated tour, prediction space, excursions.
//
// The tour copy is read off the parts registry, so changing a part's `what` or
// `breaks` changes the tour with it.
//
// Contract: ~/.claude/skills/concept-scene/references/engagement.md

import { PARTS } from './machine'

export interface TourStep {
  anchor: string
  heading: string
  body: string
  tryIt?: string
  real?: string
  goTo?: { stage?: number }
}

// Argument-first, so the generator uses engagement.md's first row: one per
// stage-strip surface, one per component whose effect is `breaks`, one for the
// inspector, one for the outcome surface.
//
// Eight parts break, plus four surfaces, is twelve; the cap is eight. Kept: the
// three parts the claim card turns on (step2, network, localStore) and the five
// surfaces. Dropped, all reachable in stage 3 with their own failure cards:
// route, currentStep, whitelist, bookings, priorEventId.
const TOUR_PARTS = ['step2', 'network', 'localStore']

export function buildTour(): TourStep[] {
  const steps: TourStep[] = [
    {
      anchor: 'stage-strip',
      heading: 'Five stages, each one standing alone',
      body:
        'Stage 0 is the argument. Stage 2 is the machine itself. You can jump straight to any of them, and each is a link you can paste to someone.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'lanes',
      heading: 'The same answer, down two paths',
      body:
        'One organizer types an event type. On the left it goes through saveStep; on the right it sits in a component useState. Then the tab closes. Only one of them comes back.',
      goTo: { stage: 0 },
    },
    {
      anchor: 'chart',
      heading: 'The machine, seven states wide',
      body:
        'This is what STEP_SEQUENCE actually contains. step2 is drawn as a ghost because the repo has the file and the machine does not have the state.',
      goTo: { stage: 2 },
    },
    {
      anchor: 'tiers',
      heading: 'Three places a value can be',
      body:
        'The form, the reducer plus localStorage, and EventDraft.data on the server. A field is somewhere different in each tier at almost every moment, and that gap is the whole concept.',
      goTo: { stage: 2 },
    },
    {
      anchor: 'controls',
      heading: 'Drive it yourself',
      body:
        'Type into a field, press Next, close the tab, come back. Every button here is one real user action, and the log below records what you did.',
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
// Predictions. Options come from the model's own variant list.
// ---------------------------------------------------------------------------

export interface PredictPoint {
  id: string
  question: string
  part: string
}

export const PREDICTIONS: PredictPoint[] = [
  {
    id: 'step2',
    part: 'step2',
    question:
      'The step 2 route is about to go live, and the organizer picks an event type there and presses Next. What becomes of that answer?',
  },
  {
    id: 'network',
    part: 'network',
    question:
      'The save call is about to start failing. The organizer types a venue and presses Next. What becomes of the venue?',
  },
  {
    id: 'localStore',
    part: 'localStore',
    question:
      'localStorage still holds the previous draft they were editing. They open this one and resume. What do they see?',
  },
  {
    id: 'currentStep',
    part: 'currentStep',
    question:
      "current_step on the row is about to hold a value the lookup does not recognise. They open /listing/1 with no step in the URL. Where do they land?",
  },
  {
    id: 'empty',
    part: 'bookings',
    question:
      'A draft with nothing typed into it at all reaches review, and the organizer presses Publish. What happens?',
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
    id: 'whitelist',
    where: 'VS Code, at frontend/src/context/reactContext.jsx lines 404 to 419',
    does:
      'Read saveStep. Find where filteredPayload is used in the request body, and look carefully at the two branches of that ternary. Then answer: of the five fields step 5 actually sends, how many would STEP_FIELD_WHITELIST have dropped if it were wired up?',
    returns: 'type the count. The scene computes the same answer from the whitelist and the step payload.',
    means:
      'If the number surprises you, that is the point: the whitelist reads like a constraint on what each step may persist, and step 5 is the step where its idea of the payload and the real payload have almost nothing in common.',
    check: 'number',
    stage: 3,
  },
  {
    id: 'lose-a-field',
    where: 'this page, with the controls and the event log',
    does:
      'Find a run where the organizer types something and it never reaches EventDraft.data, without touching the step 2 control. There is more than one way. Copy the link from the address bar when you have one.',
    returns:
      'paste it back here. The scene decodes the configuration and the whole event log and folds them through the same run() it uses everywhere else.',
    means:
      'Every way you find is a real way an organizer loses work in this wizard today. The scene knows of three; if you find a fourth, the model is missing something.',
    check: 'state',
    stage: 3,
  },
  {
    id: 'real-drafts',
    where: 'a terminal, in backend/main, with the venv active',
    does:
      'Run: python manage.py shell -c "from events.models import EventDraft; from collections import Counter; print(Counter(EventDraft.objects.values_list(\'current_step\', flat=True)))"',
    returns:
      'the distinct current_step values across your own drafts, and how many sit at each. Only you can see your database, so the scene cannot check this one.',
    means:
      'A pile-up on one step is where real organizers stop. A value that is not in STEP_SEQUENCE at all is a draft nobody can resume, and the field type allows it.',
    check: 'none',
    stage: 3,
  },
]
