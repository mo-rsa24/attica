// The statechart and the parts registry.
//
// A part here is a component in the sense of components.md: inspect, toggle,
// parameterize, with a real `breaks` string and the real artifact behind it.
// Both the chart and the parts list render from this one file, so the diagram
// and the registry cannot drift apart.

import type { Config, StepId } from './model'

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export interface ChartState {
  id: StepId | 'step2' | 'gone' | 'published'
  label: string
  /** What the screen collects, in the domain's words. */
  holds: string
  /** Does it write anything to EventDraft.data on the way out? */
  persists: 'json' | 'asset' | 'nothing' | 'n/a'
  file: string
  x: number
  y: number
  w: number
  h: number
  /** Drawn as a ghost: present in the repo, absent from the machine. */
  excised?: boolean
  terminal?: boolean
}

const W = 148
const H = 64

export const STATES: ChartState[] = [
  {
    id: 'step1',
    label: 'step1',
    holds: 'name, description, event type, region, dates, capacity. The largest form in the wizard, and the only one that validates before saving.',
    persists: 'json',
    file: 'ListingStep1.jsx',
    x: 40,
    y: 84,
    w: W,
    h: H,
  },
  {
    id: 'step2',
    label: 'step2',
    holds: 'an event-type picker, in a useState called selectedEventType. Its Next button calls navigate and nothing else.',
    persists: 'nothing',
    file: 'ListingStep2.jsx',
    x: 40,
    y: 196,
    w: W,
    h: H,
    excised: true,
  },
  {
    id: 'step3',
    label: 'step3',
    holds: 'the calendar, booking requests to artists and vendors, and the schedule. It writes the schedule into step1.',
    persists: 'json',
    file: 'ListingStep3.jsx',
    x: 232,
    y: 84,
    w: W,
    h: H,
  },
  {
    id: 'step4',
    label: 'step4',
    holds: 'the venue, chosen on a map. Saved as a whole location object under step4.',
    persists: 'json',
    file: 'ListingStep4.jsx',
    x: 424,
    y: 84,
    w: W,
    h: H,
  },
  {
    id: 'step5',
    label: 'step5',
    holds: 'ticket price, currency, refund policy, max per buyer, and whether the event is seated. The seating chart is an asset upload.',
    persists: 'json',
    file: 'ListingStep5.jsx',
    x: 616,
    y: 84,
    w: W,
    h: H,
  },
  {
    id: 'step6',
    label: 'step6',
    holds: 'nothing. Eighty-nine lines of layout, and its Next saves an empty object.',
    persists: 'nothing',
    file: 'ListingStep6.jsx',
    x: 808,
    y: 84,
    w: W,
    h: H,
  },
  {
    id: 'step7',
    label: 'step7',
    holds: 'amenities, as a list of feature names. The only step whose payload maps one-to-one onto its Event column.',
    persists: 'json',
    file: 'ListingStep7.jsx',
    x: 808,
    y: 208,
    w: W,
    h: H,
  },
  {
    id: 'step8',
    label: 'step8',
    holds: 'photos. Its Next also saves an empty object: the files go through the multipart asset endpoint instead.',
    persists: 'asset',
    file: 'ListingStep8.jsx',
    x: 616,
    y: 208,
    w: W,
    h: H,
  },
  {
    id: 'review',
    label: 'review',
    holds: 'a read-only summary and the Publish button, behind a readiness modal that lists booking requests without blocking on them.',
    persists: 'nothing',
    file: 'ListingReview.jsx',
    x: 424,
    y: 208,
    w: W,
    h: H,
  },
  {
    id: 'published',
    label: 'published',
    holds: 'EventDraft.status flips to published and an Event row exists. The draft is kept, with published_event_id written into its data.',
    persists: 'n/a',
    file: 'events/views.py publish()',
    x: 424,
    y: 332,
    w: W,
    h: H,
    terminal: true,
  },
  {
    id: 'gone',
    label: 'tab closed',
    holds: 'the reducer is gone. localStorage and the EventDraft row are not.',
    persists: 'n/a',
    file: 'no beforeunload handler anywhere',
    x: 40,
    y: 332,
    w: W,
    h: H,
    terminal: true,
  },
]

export const stateById = (id: string) => STATES.find((s) => s.id === id)

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export interface Transition {
  id: string
  from: string
  to: string
  label: string
  /** What runs on the way. */
  does: string
  source: string
  kind: 'next' | 'back' | 'redirect' | 'publish' | 'abandon' | 'resume'
}

export const TRANSITIONS: Transition[] = [
  {
    id: 't1',
    from: 'step1',
    to: 'step3',
    label: 'Next',
    does: "saveStep(id, 'step1', payload, 'step3'): PATCH with the whole steps map, then current_step moves",
    source: 'ListingStep1.jsx:217',
    kind: 'next',
  },
  {
    id: 't3',
    from: 'step3',
    to: 'step4',
    label: 'Next',
    does: "the schedule was already written into step1's bucket by setStepData",
    source: 'ListingStep3.jsx:182',
    kind: 'next',
  },
  {
    id: 't4',
    from: 'step4',
    to: 'step5',
    label: 'Next',
    does: "saveStep(id, 'step4', {location: selectedLocation}, 'step5')",
    source: 'ListingStep4.jsx:109',
    kind: 'next',
  },
  {
    id: 't5',
    from: 'step5',
    to: 'step6',
    label: 'Next',
    does: 'saves the ticketing payload, which the field whitelist would have thrown away if it were live',
    source: 'ListingStep5.jsx',
    kind: 'next',
  },
  {
    id: 't6',
    from: 'step6',
    to: 'step7',
    label: 'Next',
    does: "saveStep(id, 'step6', {}, 'step7'): an empty payload, purely to move current_step",
    source: 'ListingStep6.jsx:18',
    kind: 'next',
  },
  {
    id: 't7',
    from: 'step7',
    to: 'step8',
    label: 'Next',
    does: "saveStep(id, 'step7', {features: selectedFeatures}, 'step8')",
    source: 'ListingStep7.jsx:213',
    kind: 'next',
  },
  {
    id: 't8',
    from: 'step8',
    to: 'review',
    label: 'Next',
    does: "saveStep(draftId, 'step8', {}, 'review'): also empty. The photos went up separately.",
    source: 'ListingStep8.jsx:244',
    kind: 'next',
  },
  {
    id: 'tpub',
    from: 'review',
    to: 'published',
    label: 'Publish',
    does: '_build_event_payload projects data.steps onto Event columns, then upserts. Nothing validates first.',
    source: 'events/views.py:496-537',
    kind: 'publish',
  },
  {
    id: 'tredirect',
    from: 'step2',
    to: 'step1',
    label: 'redirect',
    does: 'the route itself is a Navigate. ListingStep2.jsx is never rendered.',
    source: 'App.jsx:121',
    kind: 'redirect',
  },
  {
    id: 't1to2',
    from: 'step1',
    to: 'step2',
    label: 'Next (historical)',
    does: 'where step 1 used to lead, before the picker moved into step 1 itself',
    source: 'ListingStep2.jsx:115-119',
    kind: 'next',
  },
]

// ---------------------------------------------------------------------------
// The parts registry
// ---------------------------------------------------------------------------

export interface Part {
  id: string
  label: string
  what: string
  kind: 'toggle' | 'select'
  controls: keyof Config
  reads: string[]
  affects: string[]
  breaks: string
  real: string
  source: string
  /** The stage where it becomes live. */
  stage: number
  /** Flagged in the closing note as looking like a defect rather than a choice. */
  suspect?: boolean
}

export const PARTS: Part[] = [
  {
    id: 'step2',
    label: 'the step 2 route',
    what:
      'App.jsx routes step2 to a redirect, so ListingStep2.jsx never renders. Switch the redirect off and the screen comes back, along with the reason it was excised.',
    kind: 'toggle',
    controls: 'step2Live',
    reads: [],
    affects: ['the sequence', 'what survives a navigation'],
    breaks:
      'live, its Next calls navigate and nothing else, so selectedEventType never leaves the component. Nothing is saved on the way out.',
    real: '<Route path="step2" element={<Navigate to="step1" replace/>}/>',
    source: 'frontend/src/App.jsx:121',
    stage: 0,
    suspect: true,
  },
  {
    id: 'network',
    label: 'the save call',
    what:
      'Every Next is a PATCH carrying the whole accumulated steps map. When it throws, the catch sets a status and an error string and the wizard carries on regardless.',
    kind: 'toggle',
    controls: 'network',
    reads: ['the reducer'],
    affects: ['what reaches the server'],
    breaks:
      'the navigation still happens. You advance a step while the server keeps the old one, so current_step now lags where you actually are.',
    real: 'Save failed, stored locally until you are back online.',
    source: 'frontend/src/context/reactContext.jsx:451-455',
    stage: 3,
  },
  {
    id: 'localStore',
    label: 'the localStorage key',
    what:
      'The whole reducer is mirrored into one key on every state change. The key is a constant with no draft id in it.',
    kind: 'toggle',
    controls: 'staleLocal',
    reads: ['the reducer'],
    affects: ['what a resume shows you'],
    breaks:
      "on resume, mergeStepMaps puts the cached steps over the ones just fetched, so a draft you edited earlier can put its answers into the draft you are looking at now.",
    real: "const LOCAL_STORAGE_KEY = 'eventCreationStore'",
    source: 'frontend/src/context/reactContext.jsx:12, 317-320',
    stage: 3,
    suspect: true,
  },
  {
    id: 'route',
    label: 'how you come back',
    what:
      'The layout looks for a known step segment in the URL. If it finds one it stops there; only a bare /listing/:id consults the saved current_step.',
    kind: 'select',
    controls: 'route',
    reads: ['current_step'],
    affects: ['where a resume lands'],
    breaks:
      'a bookmarked deep link silently overrides where you actually left off, and current_step is never even read.',
    real: 'if (urlStep) { setIsLoading(false); return; }',
    source: 'frontend/src/ListingWizardLayout.jsx:81-85',
    stage: 2,
  },
  {
    id: 'currentStep',
    label: 'current_step on the row',
    what:
      'The single field that makes the wizard resumable. It is a plain CharField: no choices, no validator, and nothing on either side checks it against the sequence.',
    kind: 'select',
    controls: 'storedStepOverride',
    reads: [],
    affects: ['where a resume lands'],
    breaks:
      'set it to anything the lookup does not know and resolveStepPath returns null, so no redirect fires and the index route renders an empty layout.',
    real: 'current_step = models.CharField(max_length=100)',
    source: 'backend/main/events/models.py:114',
    stage: 3,
  },
  {
    id: 'whitelist',
    label: 'the field whitelist',
    what:
      'STEP_FIELD_WHITELIST and filterPayloadForStep look like they bound what each step may persist. Switch it on to see what it would actually have done.',
    kind: 'toggle',
    controls: 'whitelistLive',
    reads: ['the payload'],
    affects: ['what reaches the server'],
    breaks:
      "it is never applied: filteredPayload is computed and then both branches of the ternary evaluate to the same thing, so the full payload goes up either way. Its idea of step5 is wrong too, listing budget and guest_count for the step that collects ticket pricing.",
    real: '...((filteredPayload && Object.keys(filteredPayload).length) ? { steps: mergedSteps } : { steps: mergedSteps })',
    source: 'frontend/src/context/reactContext.jsx:417',
    stage: 3,
    suspect: true,
  },
  {
    id: 'bookings',
    label: 'the readiness modal',
    what:
      'Before publishing, review fetches the draft\'s booking requests and groups them by status. It shows you what is still pending.',
    kind: 'select',
    controls: 'bookings',
    reads: ['scheduling requests'],
    affects: ['nothing about whether publish succeeds'],
    breaks:
      'it is advisory. The confirm button is wired straight to handlePublish, so pending bookings are displayed and then published past.',
    real: 'onConfirm={handlePublish}',
    source: 'frontend/src/ListingReview.jsx:262',
    stage: 3,
  },
  {
    id: 'priorEventId',
    label: 'published_event_id',
    what:
      'On the first publish the new Event id is written back into draft.data. Every later publish reads it and updates that same row.',
    kind: 'toggle',
    controls: 'priorEventId',
    reads: ['draft.data'],
    affects: ['how many Event rows exist'],
    breaks:
      'remove it and the next publish creates a second Event from the same draft, because the lookup falls through to the create branch.',
    real: 'draft_payload["published_event_id"] = published_event.id',
    source: 'backend/main/events/views.py:508-522',
    stage: 3,
  },
]

export const partById = (id: string) => PARTS.find((p) => p.id === id)
