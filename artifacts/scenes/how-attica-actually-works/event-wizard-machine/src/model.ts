// The one place truth is computed.
//
// Pure: imports nothing from React, the store, or any component.
//
// Shape: dynamic. step(machine, event) -> machine, folded by run(config, events).
// The concept is a state machine and order is the whole lesson: abandon, resume,
// back-navigation and republish only mean anything as sequences.
//
// The three storage tiers are folded in parallel, because the entire concept is
// which tier holds a value at each instant:
//
//   form    the step component's own useState
//   local   the reducer + localStorage key 'eventCreationStore'
//   server  EventDraft.data.steps + current_step
//
// The claim this model exists to make checkable: a value reaches `server` only
// when a `next` or `save-and-exit` ran saveStep for the step that owns it.

// ---------------------------------------------------------------------------
// The states
// ---------------------------------------------------------------------------

export type StepId = 'step1' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7' | 'step8' | 'review'

/** reactContext.jsx:13, verbatim. step2 is not in it. */
export const STEP_SEQUENCE: StepId[] = [
  'step1',
  'step3',
  'step4',
  'step5',
  'step6',
  'step7',
  'step8',
  'review',
]

/** reactContext.jsx:19-23. A step outside the sequence scores 0. */
export function getStepProgress(step: string): number {
  const idx = STEP_SEQUENCE.indexOf(step as StepId)
  if (idx === -1) return 0
  return Math.round(((idx + 1) / STEP_SEQUENCE.length) * 100)
}

/** reactContext.jsx:213-217. Index -1 returns the step itself, so an unknown
 *  step is a fixed point: Next takes you nowhere. */
export function getNextStep(step: string): string {
  const index = STEP_SEQUENCE.indexOf(step as StepId)
  if (index === -1) return step
  return STEP_SEQUENCE[Math.min(index + 1, STEP_SEQUENCE.length - 1)]
}

export function getPreviousStep(step: string): string {
  const index = STEP_SEQUENCE.indexOf(step as StepId)
  if (index <= 0) return STEP_SEQUENCE[0]
  return STEP_SEQUENCE[index - 1]
}

// ---------------------------------------------------------------------------
// The fields an organizer can enter, and where each one lands
// ---------------------------------------------------------------------------

export type FieldId =
  | 'name'
  | 'schedule'
  | 'category'
  | 'location'
  | 'price'
  | 'features'
  | 'media'

export interface FieldSpec {
  id: FieldId
  label: string
  /** The screen that collects it. */
  collectedOn: StepId | 'step2'
  /** The key in EventDraft.data.steps it is written under. Not always the screen
   *  that collected it: step 3 writes its schedule into step1's bucket. */
  storedUnder: StepId
  /** The Event column it becomes at publish. */
  column: string
  /** How it travels. `json` rides saveStep; `asset` goes through the separate
   *  multipart endpoint because sanitizePayload strips every File. */
  transport: 'json' | 'asset'
  source: string
}

export const FIELDS: FieldSpec[] = [
  {
    id: 'name',
    label: 'event name',
    collectedOn: 'step1',
    storedUnder: 'step1',
    column: 'name',
    transport: 'json',
    source: 'ListingStep1.jsx:204  name: formData.eventName',
  },
  {
    id: 'category',
    label: 'event type',
    collectedOn: 'step1',
    storedUnder: 'step1',
    column: 'category',
    transport: 'json',
    source: 'ListingStep1.jsx:205  category: formData.selectedEventType',
  },
  {
    id: 'schedule',
    label: 'dates and times',
    collectedOn: 'step3',
    storedUnder: 'step1',
    column: 'start_date, end_date, date',
    transport: 'json',
    source: "ListingStep3.jsx:182  setStepData('step1', {...step1, ...nextSchedule})",
  },
  {
    id: 'location',
    label: 'venue',
    collectedOn: 'step4',
    storedUnder: 'step4',
    column: 'location, venue',
    transport: 'json',
    source: "ListingStep4.jsx:109  saveStep(id, 'step4', {location: selectedLocation}, next)",
  },
  {
    id: 'price',
    label: 'ticket price',
    collectedOn: 'step5',
    storedUnder: 'step5',
    column: 'base_price',
    transport: 'json',
    source: 'ListingStep5.jsx:53  useState(initialStepData.base_price ?? 150.00)',
  },
  {
    id: 'features',
    label: 'amenities',
    collectedOn: 'step7',
    storedUnder: 'step7',
    column: 'features',
    transport: 'json',
    source: "ListingStep7.jsx:213  saveStep(id, 'step7', {features: selectedFeatures}, next)",
  },
  {
    id: 'media',
    label: 'photos',
    collectedOn: 'step8',
    storedUnder: 'step8',
    column: 'image_url, banner_image',
    transport: 'asset',
    source: "ListingStep8.jsx:70  uploadDraftAsset(draftId, file, 'media', 'step8')",
  },
]

export const fieldsOfStep = (s: StepId) => FIELDS.filter((f) => f.storedUnder === s)

// ---------------------------------------------------------------------------
// Config: the manipulable settings the events read
// ---------------------------------------------------------------------------

export interface Config {
  /** Route step2 live instead of redirecting to step1 (App.jsx:121). */
  step2Live: boolean
  /** saveStep reaches the server, or throws. */
  network: 'up' | 'save-fails'
  /** localStorage holds another draft's steps. One global key, no draft scoping. */
  staleLocal: boolean
  /** How the organizer re-enters after closing the tab. */
  route: 'bare' | 'explicit-step5'
  /** Corrupt the stored current_step. It is a CharField with no choices. */
  storedStepOverride: 'none' | 'unknown'
  /** Booking request status at the readiness modal. */
  bookings: 'none' | 'pending' | 'approved'
  /** Is published_event_id already in draft.data? Decides upsert vs create. */
  priorEventId: boolean
  /** Turn filterPayloadForStep back on, as if the ternary were not a no-op. */
  whitelistLive: boolean
}

export const initialConfig: Config = {
  step2Live: false,
  network: 'up',
  staleLocal: false,
  route: 'bare',
  storedStepOverride: 'none',
  bookings: 'none',
  priorEventId: false,
  whitelistLive: false,
}

/** reactContext.jsx:53-61, verbatim. Dead code: see WHITELIST_NOTE. */
export const STEP_FIELD_WHITELIST: Record<string, string[]> = {
  step1: ['name', 'notes', 'category', 'theme', 'start_date', 'end_date', 'start_time', 'end_time', 'guest_count', 'date'],
  step3: ['location', 'bookingRequestIds'],
  step4: ['location'],
  step5: ['budget', 'guest_count'],
  step6: ['base_price', 'currency', 'tiered_prices'],
  step7: ['refund_policy', 'access_type', 'is_age_restricted', 'custom_questions'],
  step8: ['image_url', 'banner_image'],
}

/** The real column names each step actually sends, for the whitelist comparison. */
export const STEP_SENT_FIELDS: Record<string, string[]> = {
  step1: ['name', 'category', 'theme', 'guest_count', 'start_date', 'end_date', 'start_time', 'end_time', 'date', 'notes'],
  step4: ['location'],
  step5: ['base_price', 'currency', 'max_tickets_per_buyer', 'refund_policy', 'is_seated'],
  step7: ['features'],
}

/** What filterPayloadForStep would drop, if it were wired up. */
export function whitelistWouldDrop(step: string): string[] {
  const allowed = STEP_FIELD_WHITELIST[step]
  const sent = STEP_SENT_FIELDS[step]
  if (!allowed || !sent) return []
  return sent.filter((f) => !allowed.includes(f))
}

// ---------------------------------------------------------------------------
// Events: the alphabet, every one a real user action
// ---------------------------------------------------------------------------

export type MachineEvent =
  | { t: 'create-draft' }
  | { t: 'edit'; field: FieldId }
  | { t: 'next' }
  | { t: 'back' }
  | { t: 'save-and-exit' }
  | { t: 'close-tab' }
  | { t: 'resume' }
  | { t: 'publish' }

export const EVENT_LABEL: Record<MachineEvent['t'], string> = {
  'create-draft': 'start a draft',
  edit: 'type into a field',
  next: 'Next',
  back: 'Back',
  'save-and-exit': 'Save & exit',
  'close-tab': 'close the tab',
  resume: 'come back',
  publish: 'Publish',
}

// ---------------------------------------------------------------------------
// The machine
// ---------------------------------------------------------------------------

export interface PublishedField {
  column: string
  value: string
  /** Did it come from the draft, or from a fallback in _build_event_payload? */
  defaulted: boolean
  source: string
}

export interface Machine {
  /** Where the browser is. `null` before the draft exists, 'step2' only when
   *  the redirect is switched off. */
  at: StepId | 'step2' | 'gone' | null
  draftExists: boolean
  /** EventDraft.current_step as stored on the row. */
  serverCurrentStep: string | null
  /** EventDraft.data.steps: which fields actually reached the database. */
  server: Partial<Record<StepId, FieldId[]>>
  /** The reducer plus localStorage. */
  local: Partial<Record<StepId, FieldId[]>>
  /** The step component's own useState, wiped by any navigation. */
  form: FieldId[]
  status: 'none' | 'draft' | 'offline-draft' | 'saved' | 'published'
  /** Assets live in their own table, not in data.steps. */
  assets: number
  publishedEventId: number | null
  eventsCreated: number
  /** Real log lines and error strings, in order. */
  transcript: string[]
}

const emptyMachine: Machine = {
  at: null,
  draftExists: false,
  serverCurrentStep: null,
  server: {},
  local: {},
  form: [],
  status: 'none',
  assets: 0,
  publishedEventId: null,
  eventsCreated: 0,
  transcript: [],
}

const add = (bag: Partial<Record<StepId, FieldId[]>>, step: StepId, fields: FieldId[]) => {
  const next = { ...bag }
  next[step] = Array.from(new Set([...(next[step] || []), ...fields]))
  return next
}

/** The reducer. Pure, and the only place a transition is decided. */
export function step(m: Machine, e: MachineEvent, cfg: Config): Machine {
  switch (e.t) {
    case 'create-draft': {
      if (m.draftExists) return m
      return {
        ...m,
        draftExists: true,
        at: 'step1',
        serverCurrentStep: 'step1',
        status: 'draft',
        // CreateEventPage.jsx:59-62
        transcript: [...m.transcript, "POST /api/events/event-drafts/ {data: {steps: {}}, current_step: 'step1'} 201"],
      }
    }

    case 'edit': {
      if (!m.draftExists || m.at === null || m.at === 'gone') return m
      const spec = FIELDS.find((f) => f.id === e.field)
      if (!spec) return m
      // Typing reaches the component's own state. ListingStep1 also mirrors into
      // the reducer on every keystroke; step2 does not, which is the whole point.
      const reachesLocal = m.at !== 'step2'
      return {
        ...m,
        form: Array.from(new Set([...m.form, e.field])),
        local: reachesLocal ? add(m.local, spec.storedUnder, [e.field]) : m.local,
        transcript: [
          ...m.transcript,
          reachesLocal
            ? `setStepData('${spec.storedUnder}', {${e.field}}) -> reducer + localStorage`
            : `setSelectedEventType('${e.field}') -> component useState only`,
        ],
      }
    }

    case 'next': {
      if (!m.draftExists || m.at === null || m.at === 'gone') return m

      // step2's Next is a bare navigate. Nothing is saved on the way out.
      if (m.at === 'step2') {
        return {
          ...m,
          at: 'step3',
          form: [],
          transcript: [...m.transcript, 'navigate(`${listingBase}/step3`)   no save call'],
        }
      }
      if (m.at === 'review') return m

      const here = m.at
      // With the redirect switched off, step 1's Next reaches step 2, which is how
      // this was wired before App.jsx:121 became <Navigate to="step1" replace/>.
      const target = (cfg.step2Live && here === 'step1' ? 'step2' : getNextStep(here)) as StepId | 'step2'
      // saveStep sends the whole accumulated steps map, not just this step.
      if (cfg.network === 'save-fails') {
        return {
          ...m,
          at: target,
          form: [],
          status: 'offline-draft',
          transcript: [
            ...m.transcript,
            `PATCH /api/events/event-drafts/1/ FAILED`,
            'Save failed, stored locally until you are back online.',
          ],
        }
      }
      // Every step key the reducer holds goes up, so an earlier step's edits are
      // carried along by a later save. Assets never ride this path.
      const promoted = promote(m.local, cfg)
      return {
        ...m,
        at: target,
        form: [],
        server: promoted,
        serverCurrentStep: target,
        status: 'draft',
        transcript: [
          ...m.transcript,
          `PATCH /api/events/event-drafts/1/ {data: {steps: {${Object.keys(promoted).join(', ')}}}, current_step: '${target}'} 200`,
        ],
      }
    }

    case 'back': {
      if (!m.draftExists || m.at === null || m.at === 'gone' || m.at === 'step2') return m
      const target = getPreviousStep(m.at) as StepId
      // Back is a plain navigate in every step component: nothing is saved, and
      // current_step on the row does not move.
      return {
        ...m,
        at: target,
        form: [],
        transcript: [...m.transcript, `navigate(back to ${target})   current_step stays '${m.serverCurrentStep}'`],
      }
    }

    case 'save-and-exit': {
      if (!m.draftExists || m.at === null || m.at === 'gone' || m.at === 'step2') return m
      if (cfg.network === 'save-fails') {
        return { ...m, status: 'offline-draft', transcript: [...m.transcript, 'Save failed, stored locally until you are back online.'] }
      }
      const promoted = promote(m.local, cfg)
      return {
        ...m,
        server: promoted,
        // saveAndExit passes no nextStep, so current_step stays where it is.
        serverCurrentStep: m.at,
        status: 'saved',
        at: 'gone',
        transcript: [...m.transcript, `PATCH ... current_step: '${m.at}' 200`, 'navigate(/my-events)'],
      }
    }

    case 'close-tab': {
      if (!m.draftExists) return m
      // The reducer dies with the tab. localStorage survives; the server row
      // survives. Nothing is flushed on the way out.
      return {
        ...m,
        at: 'gone',
        form: [],
        transcript: [...m.transcript, 'tab closed. no beforeunload handler, no flush'],
      }
    }

    case 'resume': {
      if (!m.draftExists) return m
      // ListingWizardLayout: load the draft, then either honour the URL or
      // redirect to the stored current_step.
      const stored = cfg.storedStepOverride === 'unknown' ? 'step-two-ish' : m.serverCurrentStep
      let landing: Machine['at']
      const lines: string[] = ['GET /api/events/event-drafts/1/ 200']

      if (cfg.route === 'explicit-step5') {
        landing = 'step5'
        lines.push("getUrlStep('/listing/1/step5') -> 'step5'. URL wins; current_step is not consulted.")
      } else if (stored && resolveStepPath(stored)) {
        const resolved = resolveStepPath(stored)!
        if (resolved === 'step2' && !cfg.step2Live) {
          landing = 'step1'
          lines.push("resolveStepPath -> 'step2', then App.jsx:121 redirects it straight to step1.")
        } else {
          landing = resolved as StepId
          lines.push(`resolveStepPath('${stored}') -> '${resolved}'. navigate(replace) to it.`)
        }
      } else {
        landing = null
        lines.push(`resolveStepPath('${stored}') -> null. No redirect fires and the index route renders nothing.`)
      }

      // The reducer is rehydrated from localStorage, which survived the tab, and
      // loadEvent then merges the fetched steps UNDER it. So unsaved work is
      // still here on this browser, and anything the localStorage key happens to
      // be holding from another draft arrives with it.
      let merged: Partial<Record<StepId, FieldId[]>> = { ...m.local }
      for (const [k, v] of Object.entries(m.server) as [StepId, FieldId[]][]) {
        merged = add(merged, k, v)
      }
      lines.push('loadPersistedState() rehydrated the reducer from localStorage')
      if (cfg.staleLocal) {
        // The bleed lands in the reducer, not the database: nothing has saved it.
        merged = add(merged, 'step1', ['category'])
        lines.push("mergeStepMaps(backendSteps, localStorage.steps) -> local wins. An event type from the draft you had open before is now showing in this one.")
      }
      const bled = merged

      return {
        ...m,
        at: landing,
        form: [],
        local: bled,
        transcript: [...m.transcript, ...lines],
      }
    }

    case 'publish': {
      if (!m.draftExists) return m
      // No validation gate anywhere: not in the serializer, not in the view.
      const isRepublish = cfg.priorEventId || m.publishedEventId !== null
      const id = isRepublish ? (m.publishedEventId ?? 7) : 7
      return {
        ...m,
        status: 'published',
        publishedEventId: id,
        eventsCreated: isRepublish ? Math.max(m.eventsCreated, 1) : m.eventsCreated + 1,
        transcript: [
          ...m.transcript,
          'POST /api/events/event-drafts/1/publish/ 200',
          isRepublish
            ? `published_event_id ${id} found in draft.data: Event ${id} updated in place`
            : `Event ${id} created, published_event_id written back into draft.data`,
          cfg.bookings === 'pending'
            ? 'ReadinessModal listed 1 pending booking request, then onConfirm={handlePublish} ran anyway'
            : '',
        ].filter(Boolean),
      }
    }
  }
}

/** What a save actually promotes to the server. Assets never ride the JSON path,
 *  because sanitizePayload strips every File, Blob and blob: URL first. */
function promote(local: Partial<Record<StepId, FieldId[]>>, cfg: Config): Partial<Record<StepId, FieldId[]>> {
  const out: Partial<Record<StepId, FieldId[]>> = {}
  for (const [k, fields] of Object.entries(local) as [StepId, FieldId[]][]) {
    let keep = fields.filter((f) => FIELDS.find((x) => x.id === f)?.transport !== 'asset')
    if (cfg.whitelistLive) {
      const allowed = STEP_FIELD_WHITELIST[k]
      if (allowed) {
        keep = keep.filter((f) => {
          const col = FIELDS.find((x) => x.id === f)?.column.split(',')[0].trim()
          return col ? allowed.includes(col) : false
        })
      }
    }
    if (keep.length) out[k] = keep
  }
  return out
}

/** ListingWizardLayout.jsx:28-34. Anything not in the lookup returns null. */
export function resolveStepPath(currentStep: string | null): string | null {
  if (!currentStep) return null
  const known = [...STEP_SEQUENCE.map(String), 'step2', '1', '2', '3', '4', '5', '6', '7', '8']
  const normalized = String(currentStep).toLowerCase()
  if (known.includes(normalized)) return normalized.startsWith('step') ? normalized : `step${normalized}`
  return null
}

// ---------------------------------------------------------------------------
// The outcome
// ---------------------------------------------------------------------------

export type Variant =
  | 'survives'
  | 'lost-on-navigate'
  | 'lost-on-reload'
  | 'local-only'
  | 'published-with-defaults'
  | 'nothing-yet'

export const VARIANTS: { id: Variant; label: string; blurb: string }[] = [
  { id: 'survives', label: 'it survives', blurb: 'the value is in EventDraft.data and comes back on resume' },
  { id: 'lost-on-navigate', label: 'lost the moment you navigate', blurb: 'it only ever reached component useState' },
  { id: 'lost-on-reload', label: 'lost when the tab closes', blurb: 'it reached the reducer but no save ran' },
  { id: 'local-only', label: 'on this browser only', blurb: 'localStorage has it, the server does not' },
  { id: 'published-with-defaults', label: 'published, with defaults filled in', blurb: 'publish succeeded and the projection supplied what was missing' },
  { id: 'nothing-yet', label: 'nothing has happened yet', blurb: 'no draft exists' },
]

export interface ProvEdge {
  from: string
  to: string
  because: string
}

export interface Outcome {
  machine: Machine
  variant: Variant
  reason: string
  /** Where a `resume` right now would land you. */
  resumesAt: string
  /** Fields the organizer typed that never reached the server. */
  lostFields: { field: FieldId; where: string }[]
  /** Fields in local but not yet in server. */
  unsaved: FieldId[]
  progress: number
  published: PublishedField[] | null
  defaultsUsed: number
  provenance: ProvEdge[]
}

const DEFAULTS: Record<string, { value: string; source: string }> = {
  name: { value: '"Untitled event"', source: 'views.py:386  _first_truthy(..., "Untitled event")' },
  date: { value: 'today', source: 'views.py:355  parsed_date or ... or timezone.localdate()' },
  category: { value: 'null', source: 'views.py:399  _first_truthy(step1.category, step1.selectedEventType, ...)' },
  'location, venue': { value: 'null', source: 'views.py:365-372  Location.objects.filter(id=...).first()' },
  base_price: { value: '0', source: 'views.py:402  _first_truthy(..., 0)' },
  features: { value: 'null', source: 'views.py:411  step7.get("features") or ... or None' },
  'image_url, banner_image': { value: 'null', source: 'views.py:378  media_assets[0] if media_assets else None' },
}

export function outcome(m: Machine, cfg: Config, events: MachineEvent[]): Outcome {
  const prov: ProvEdge[] = []

  // Everything the organizer typed, in order.
  const typed = events.filter((e): e is { t: 'edit'; field: FieldId } => e.t === 'edit').map((e) => e.field)
  const inServer = new Set(Object.values(m.server).flat())
  const inLocal = new Set(Object.values(m.local).flat())

  const lostFields = Array.from(new Set(typed))
    .filter((f) => !inServer.has(f))
    .map((f) => {
      const spec = FIELDS.find((x) => x.id === f)!
      if (spec.transport === 'asset') {
        return { field: f, where: 'assets never ride the JSON save; this one needs the multipart endpoint' }
      }
      if (!inLocal.has(f)) {
        return { field: f, where: 'only ever reached component useState' }
      }
      return { field: f, where: 'in the reducer and localStorage, but no save has run for its step' }
    })

  const unsaved = Array.from(inLocal).filter((f) => !inServer.has(f))

  // Where a resume would land.
  const stored = cfg.storedStepOverride === 'unknown' ? 'step-two-ish' : m.serverCurrentStep
  let resumesAt: string
  if (!m.draftExists) resumesAt = 'no draft yet'
  else if (cfg.route === 'explicit-step5') resumesAt = 'step5, because the URL names it'
  else if (stored && resolveStepPath(stored)) resumesAt = stored
  else resumesAt = 'nowhere: resolveStepPath returned null'

  if (m.draftExists) {
    prov.push({
      from: cfg.route === 'explicit-step5' ? 'a step in the URL' : `current_step = '${stored}'`,
      to: `resume lands on ${resumesAt}`,
      because:
        cfg.route === 'explicit-step5'
          ? 'ListingWizardLayout returns early when getUrlStep finds a known segment'
          : 'the index route has no step, so the layout redirects to resolveStepPath(current_step)',
    })
  }

  // The publish projection.
  let published: PublishedField[] | null = null
  let defaultsUsed = 0
  if (m.status === 'published') {
    published = FIELDS.map((f) => {
      const present = inServer.has(f.id) || (f.transport === 'asset' && m.assets > 0)
      const def = DEFAULTS[f.column]
      if (present) {
        return { column: f.column, value: `from data.steps.${f.storedUnder}`, defaulted: false, source: f.source }
      }
      defaultsUsed++
      return {
        column: f.column,
        value: def?.value ?? 'null',
        defaulted: true,
        source: def?.source ?? 'views.py _build_event_payload',
      }
    })
    prov.push({
      from: 'publish with missing step keys',
      to: `${defaultsUsed} column(s) filled by fallback`,
      because: 'nothing validates EventDraft.data, so _build_event_payload must default every field',
    })
  }

  // Variant.
  let variant: Variant
  let reason: string
  if (!m.draftExists) {
    variant = 'nothing-yet'
    reason = 'No draft row exists. Start one and the wizard has something to persist into.'
  } else if (m.status === 'published') {
    variant = 'published-with-defaults'
    reason =
      defaultsUsed === 0
        ? `Published. Every column came from the draft: Event ${m.publishedEventId}, ${m.eventsCreated} Event row in total.`
        : `Published anyway. ${defaultsUsed} of ${FIELDS.length} columns had nothing in the draft and were filled by _build_event_payload's fallbacks. Nothing refused it.`
  } else if (lostFields.some((l) => l.where.startsWith('only ever'))) {
    variant = 'lost-on-navigate'
    reason =
      'Something you typed only ever reached a component useState. The moment you navigated it was gone, and no save call was ever made.'
  } else if (m.at === 'gone' && unsaved.length > 0) {
    variant = 'lost-on-reload'
    reason = `${unsaved.length} field(s) are in the reducer and localStorage but never reached the server. On this browser they come back; on any other they do not.`
  } else if (unsaved.length > 0) {
    variant = 'local-only'
    reason = `${unsaved.length} field(s) are in the reducer, waiting for a save. Press Next and they go up with everything else.`
  } else {
    variant = 'survives'
    reason = `Everything typed is in EventDraft.data.steps. Close the tab, change laptop, come back: resume lands on ${resumesAt}.`
  }

  if (lostFields.length > 0) {
    prov.push({
      from: 'a field typed but absent from data.steps',
      to: `${lostFields.length} lost field(s)`,
      because: 'a value reaches the server only when saveStep ran for the step that owns it',
    })
  }

  return {
    machine: m,
    variant,
    reason,
    resumesAt,
    lostFields,
    unsaved,
    progress: typeof m.at === 'string' ? getStepProgress(m.at) : 0,
    published,
    defaultsUsed,
    provenance: prov,
  }
}

/** Fold the whole log. The only entry point any panel uses. */
export function run(cfg: Config, events: MachineEvent[]): Outcome {
  const m = events.reduce((acc, e) => step(acc, e, cfg), emptyMachine)
  return outcome(m, cfg, events)
}

/** Fold a prefix, for the timeline scrubber. */
export function runPrefix(cfg: Config, events: MachineEvent[], upTo: number): Outcome {
  return run(cfg, events.slice(0, upTo))
}

// ---------------------------------------------------------------------------
// Scenarios: prepared logs, so the machine can be driven or replayed
// ---------------------------------------------------------------------------

export const SCENARIOS: {
  id: string
  label: string
  blurb: string
  events: MachineEvent[]
  /** Some scenarios only mean anything under a particular setting. */
  config?: Partial<Config>
}[] = [
  {
    id: 'happy',
    label: 'fill it in and publish',
    blurb: 'the path the wizard was designed for',
    events: [
      { t: 'create-draft' },
      { t: 'edit', field: 'name' },
      { t: 'edit', field: 'category' },
      { t: 'next' },
      { t: 'edit', field: 'schedule' },
      { t: 'next' },
      { t: 'edit', field: 'location' },
      { t: 'next' },
      { t: 'edit', field: 'price' },
      { t: 'next' },
      { t: 'next' },
      { t: 'edit', field: 'features' },
      { t: 'next' },
      { t: 'next' },
      { t: 'publish' },
    ],
  },
  {
    id: 'interrupted',
    label: 'interrupted at step 5',
    blurb: 'close the tab mid-wizard, come back later',
    events: [
      { t: 'create-draft' },
      { t: 'edit', field: 'name' },
      { t: 'next' },
      { t: 'next' },
      { t: 'edit', field: 'location' },
      { t: 'next' },
      { t: 'edit', field: 'price' },
      { t: 'close-tab' },
      { t: 'resume' },
    ],
  },
  {
    id: 'step2',
    label: 'the step 2 path',
    blurb: 'type into the screen that never saves',
    config: { step2Live: true },
    events: [
      { t: 'create-draft' },
      { t: 'next' },
      { t: 'create-draft' },
      { t: 'edit', field: 'category' },
      { t: 'next' },
      { t: 'close-tab' },
      { t: 'resume' },
    ],
  },
  {
    id: 'empty',
    label: 'publish an empty draft',
    blurb: 'click through without typing anything',
    events: [
      { t: 'create-draft' },
      { t: 'next' },
      { t: 'next' },
      { t: 'next' },
      { t: 'next' },
      { t: 'next' },
      { t: 'next' },
      { t: 'next' },
      { t: 'publish' },
    ],
  },
]

// ---------------------------------------------------------------------------
// The state round trip, for the excursions
// ---------------------------------------------------------------------------

const E_CODES: MachineEvent['t'][] = ['create-draft', 'edit', 'next', 'back', 'save-and-exit', 'close-tab', 'resume', 'publish']

export function encodeState(cfg: Config, events: MachineEvent[]): string {
  const c = [
    cfg.step2Live ? '1' : '0',
    cfg.network,
    cfg.staleLocal ? '1' : '0',
    cfg.route,
    cfg.storedStepOverride,
    cfg.bookings,
    cfg.priorEventId ? '1' : '0',
    cfg.whitelistLive ? '1' : '0',
  ].join('~')
  const ev = events
    .map((e) => (e.t === 'edit' ? `e:${e.field}` : String(E_CODES.indexOf(e.t))))
    .join('.')
  return `${c}|${ev}`
}

export function decodeState(raw: string): { config: Config; events: MachineEvent[] } | null {
  const [c, ev] = raw.split('|')
  if (!c) return null
  const p = c.split('~')
  if (p.length !== 8) return null
  const [s2, net, stale, route, stored, bookings, prior, wl] = p
  if (net !== 'up' && net !== 'save-fails') return null
  if (route !== 'bare' && route !== 'explicit-step5') return null
  if (stored !== 'none' && stored !== 'unknown') return null
  if (!['none', 'pending', 'approved'].includes(bookings)) return null
  const config: Config = {
    step2Live: s2 === '1',
    network: net,
    staleLocal: stale === '1',
    route,
    storedStepOverride: stored,
    bookings: bookings as Config['bookings'],
    priorEventId: prior === '1',
    whitelistLive: wl === '1',
  }
  const events: MachineEvent[] = []
  for (const tok of (ev || '').split('.').filter(Boolean)) {
    if (tok.startsWith('e:')) {
      const f = tok.slice(2) as FieldId
      if (!FIELDS.some((x) => x.id === f)) return null
      events.push({ t: 'edit', field: f })
    } else {
      const t = E_CODES[Number(tok)]
      if (!t || t === 'edit') return null
      events.push({ t } as MachineEvent)
    }
  }
  return { config, events }
}
