// Stage 3: where it costs you. Symptom before cause, because that is the order
// you meet them in. Every failure is reachable from a control.
//
// The closing card is the flagged note: three of these read as defects rather
// than decisions, and saying so is more useful than pretending otherwise.

import { PARTS } from '../machine'
import { EXCURSIONS, PREDICTIONS } from '../engagement'
import type { Config, MachineEvent } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { Excursion } from '../ui/Excursion'
import { Predict } from '../ui/Predict'

interface Failure {
  id: string
  symptom: string
  cause: string
  detail: string
  real: string[]
  patch: Partial<Config>
  events?: MachineEvent[]
  snippet?: string
  hot?: number
  note?: string
}

const FULL: MachineEvent[] = [
  { t: 'create-draft' },
  { t: 'edit', field: 'name' },
  { t: 'next' },
  { t: 'next' },
  { t: 'edit', field: 'location' },
  { t: 'next' },
  { t: 'close-tab' },
  { t: 'resume' },
]

const FAILURES: Failure[] = [
  {
    id: 'step2',
    symptom:
      'An organizer swears they picked an event type. The published event has no category, and the draft has no record that anyone ever chose one.',
    cause: 'They picked it on a screen that never saved',
    detail:
      "ListingStep2 holds the choice in a useState called selectedEventType, and its Next button calls navigate and nothing else. There is no saveStep, no setStepData, no request. Today the route redirects past it, so the screen cannot be reached at all and step 1 collects the event type instead. The backend still carries the old shape as a fallback: _first_truthy(step1.get('category'), step1.get('selectedEventType'), ...).",
    real: ['<Route path="step2" element={<Navigate to="step1" replace/>}/>'],
    patch: { step2Live: true },
    snippet: 'step2next',
    hot: 119,
    note:
      'Both halves of this are worth holding at once. As shipped, nothing is lost, because you cannot reach the screen. What is left behind is a 130-line component that looks live to anyone reading the folder.',
  },
  {
    id: 'network',
    symptom:
      'The organizer keeps working and everything looks normal. Later, the wizard reopens several steps earlier than where they stopped, and recent answers are missing.',
    cause: 'A save failed and the wizard advanced anyway',
    detail:
      'saveStep catches the failure, sets an error string and a status, and returns. The step component does not check the result before navigating, so the browser moves to the next step while current_step on the row stays where it was. The reducer and localStorage keep the answers, so on that same browser it looks fine. On any other one it does not.',
    real: ['Save failed, stored locally until you are back online.'],
    patch: { network: 'save-fails' },
    events: FULL,
    snippet: 'saveStep',
    hot: 418,
    note:
      'There is no retry anywhere. "Stored locally until you are back online" describes what happened, not something the code will act on: the next successful save is what pushes it, and only if the reducer still holds it.',
  },
  {
    id: 'localStore',
    symptom:
      'An organizer opens a draft and finds a field already filled in with something from a different event.',
    cause: 'One localStorage key for every draft',
    detail:
      'The whole reducer, including data.steps, is written to a fixed key on every state change. Nothing about that key mentions which draft it belongs to. When the next draft loads, mergeStepMaps puts the cached steps over the fetched ones, so the previous draft wins wherever they overlap.',
    real: ["const LOCAL_STORAGE_KEY = 'eventCreationStore';"],
    patch: { staleLocal: true },
    events: FULL,
    snippet: 'persist',
    hot: 192,
  },
  {
    id: 'currentStep',
    symptom: 'A draft opens to a blank page. No error, no redirect, no wizard.',
    cause: 'current_step holds something the lookup does not recognise',
    detail:
      'resolveStepPath returns null for anything outside its table, and the layout treats null as "nothing to do": it stops loading and renders the outlet with no step matched. Nothing prevents this from happening, because current_step is a CharField with no choices, the serializer does not constrain it, and the client sends whatever getNextStep produced.',
    real: ['current_step = models.CharField(max_length=100)'],
    patch: { storedStepOverride: 'unknown' },
    events: FULL,
    snippet: 'layout',
    hot: 88,
  },
  {
    id: 'route',
    symptom:
      'An organizer with a bookmarked link keeps landing on step 5, no matter how far past it they have got.',
    cause: 'A step in the URL wins over the saved one',
    detail:
      'The layout looks for a known step segment anywhere in the path and returns early if it finds one. current_step is fetched and then never consulted. This is deliberate, and it is what makes a deep link work at all, but it means the URL and the row can disagree indefinitely.',
    real: ['if (urlStep) { setIsLoading(false); return; }'],
    patch: { route: 'explicit-step5' },
    events: FULL,
    snippet: 'layout',
    hot: 82,
  },
  {
    id: 'empty',
    symptom: 'An event appears on the site called "Untitled event", dated today, with no venue.',
    cause: 'Publishing an empty draft succeeds',
    detail:
      'Nothing between the wizard and the Event table checks that anything was filled in. The review screen has a readiness modal, but it lists booking requests and its confirm button is wired straight to handlePublish. _build_event_payload then fills every missing column from a fallback chain ending in a literal.',
    real: ['"name": self._first_truthy(..., "Untitled event")', 'event_date = parsed_date or ... or timezone.localdate()'],
    patch: { bookings: 'pending' },
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
    snippet: 'readiness',
    hot: 263,
    note:
      'This is the price of the design rather than an oversight in it. Persisting a partial draft at every step means the server must accept a partial draft at every step, so there is no moment before publish when refusing an incomplete one would be possible without inventing a separate schema for "complete".',
  },
]

export function Stage3Failures() {
  const suspect = PARTS.filter((p) => p.suspect)
  return (
    <>
      <div className="card">
        <h2>Six ways this goes wrong</h2>
        <p className="lede">
          Each card leads with what you would actually see, because that is what you meet first.
          Every one is reachable from the controls above, so predict, then reproduce it and watch the
          chart.
        </p>
      </div>

      {FAILURES.map((f) => (
        <FailureCard key={f.id} f={f} />
      ))}

      <div className="card">
        <h2>Prove there is a fourth way</h2>
        <p className="lede">
          The scene knows three ways an organizer loses work that are not the step 2 screen. Go and
          find one of them, or a fourth.
        </p>
        {EXCURSIONS.filter((e) => e.stage === 3).map((e) => (
          <Excursion key={e.id} ex={e} />
        ))}
      </div>

      <div className="card flagged">
        <h2>What looks wrong, as opposed to merely costly</h2>
        <p className="lede">
          Most of what is above is the price of a resumable wizard, paid knowingly. Three of them do
          not read that way, and it is more useful to say so than to present every finding as a
          design.
        </p>
        {suspect.map((p) => (
          <div key={p.id} className="flag">
            <h4>{p.label}</h4>
            <p>{p.breaks}</p>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
              {p.source}
            </div>
          </div>
        ))}
        <p style={{ marginTop: 14, marginBottom: 0, color: 'var(--ink-dim)', fontSize: 13.5 }}>
          None of the three is currently losing anyone's data on the shipped routes: step 2 is
          unreachable, the whitelist's inaction is what makes step 5 save correctly, and the storage
          bleed needs two drafts in one session. They are worth naming because each one reads as the
          opposite of what it does, and the next person to touch this code will believe the reading.
        </p>
      </div>
    </>
  )
}

function FailureCard({ f }: { f: Failure }) {
  const { setConfig, loadScenario } = useStore()
  const pred = PREDICTIONS.find((p) => p.id === f.id)

  return (
    <div className="card">
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
        WHAT YOU SEE
      </div>
      <h3 style={{ margin: '3px 0 10px', fontWeight: 500 }}>{f.symptom}</h3>

      <div className="term">
        {f.real.map((r, i) => (
          <div key={i} className="err">
            {r}
          </div>
        ))}
      </div>

      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
        WHY
      </div>
      <h4 style={{ margin: '3px 0 7px' }}>{f.cause}</h4>
      <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{f.detail}</p>

      {f.snippet && <CodeBlock snippet={f.snippet} hot={f.hot ?? null} />}

      {f.note && (
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', borderLeft: '2px solid var(--line)', paddingLeft: 12 }}>
          {f.note}
        </p>
      )}

      {pred && <Predict question={pred.question} patch={f.patch} events={f.events} label={`reproduced: ${f.cause}`} />}

      <button
        className="opt"
        onClick={() => {
          if (f.events) loadScenario(f.id, f.events, f.patch, `reproduced: ${f.cause}`)
          else setConfig(f.patch, `reproduced: ${f.cause}`)
        }}
      >
        reproduce it on the chart
      </button>
    </div>
  )
}
