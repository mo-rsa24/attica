// Tour, predictions and excursions, all generated from what the scene already declares.

import type { StepId } from './model/types'

export type TourStop = { anchor: string; title: string; body: string }

/** Generated from the atlas levels and the toolbar, in the order a reader meets them. */
export const TOUR: TourStop[] = [
  {
    anchor: 'tour-map',
    title: 'Two maps of the same journey',
    body: 'Top row is what the route table and the model names promise. Bottom row is what the trace produced. Where they disagree the card turns red. Click any card to open that stage.',
  },
  {
    anchor: 'tour-run',
    title: 'Run the journey',
    body: 'Each press fires the next real request. The atlas drops to the call it just made: frontend file, HTTP, Django view, rows.',
  },
  {
    anchor: 'tour-changeset',
    title: 'What changed, and why',
    body: 'After every action this strip lists the fields that actually moved, with the line that moved them. "why?" opens the chain the model emitted, not a guess.',
  },
  {
    anchor: 'tour-knobs',
    title: 'Break any part',
    body: 'Every switch here is a real condition in the repo. The defaults are the repo as it stands today. Change one and the whole trace recomputes.',
  },
  {
    anchor: 'tour-toolbar',
    title: 'Source, probes, history, fork',
    body: 'Source shows the verbatim code for whatever is selected. Fork runs the same journey twice, differing by one choice: where the booking was submitted from.',
  },
]

export type Prediction = {
  stepId: StepId
  question: string
  options: string[]
  correct: number
  reveal: string
}

/** The reader commits before the intervention fires. Options come from the model's own outcome space. */
export const PREDICTIONS: Prediction[] = [
  {
    stepId: 'publish',
    question: 'After publish, how many EventDraft rows does this organizer have?',
    options: ['0, it became the Event', '1, still there', '2, the draft plus a copy'],
    correct: 1,
    reveal: 'The row stays, status flips to published, and published_event_id is written into data. MyEventsAPIView still returns it under "drafts".',
  },
  {
    stepId: 'submit_booking',
    question: 'The form is filled in and you press Submit. What comes back?',
    options: ['201, a pending BookingRequest', '400, missing event context', '403, not your artist'],
    correct: 1,
    reveal: 'The dropdown had no real options, so no event_id went in the body, and CreateRequestAPIView rejects a request with neither event_id nor event_draft_id.',
  },
  {
    stepId: 'accept_chat_bid',
    question: 'A ChatBid is accepted and no BookingRequest matches. Which row changes?',
    options: ['a new BookingRequest is created', 'the ChatBid only', 'none, the signal logs and returns'],
    correct: 2,
    reveal: 'chat/signals.py:48 hits "if not candidates" and returns after a debug log. It never creates a BookingRequest.',
  },
]

export type Excursion = {
  id: string
  where: string
  what: string
  bring: string
  check: (answer: string) => boolean
  hint: string
}

export const EXCURSIONS: Excursion[] = [
  {
    id: 'orphan',
    where: 'a terminal in /home/molef/Work/attica',
    what: 'run  grep -rn "organizers/" frontend/src --include=*.jsx --include=*.js',
    bring: 'the number of hits',
    check: (a) => a.trim() === '1',
    hint: 'One hit means the route in App.jsx is the only mention: nothing navigates there.',
  },
  {
    id: 'current_step',
    where: 'the running Attica app, wizard step 5',
    what: 'save step 5, then read the draft back: GET /api/events/event-drafts/<id>/',
    bring: 'the current_step string in the response',
    check: (a) => /^step[13-8]$/.test(a.trim()),
    hint: 'saveStep sends current_step: nextStep, so after saving step5 the stored value is step6. There is no step2 to land on.',
  },
]
