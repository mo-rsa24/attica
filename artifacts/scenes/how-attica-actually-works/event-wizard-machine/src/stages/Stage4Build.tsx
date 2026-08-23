// Stage 4: build it. Python and JavaScript, because that is what this concept is
// met in professionally and what Attica is written in.
//
// Every step opens with the previous step's failure, then the smallest code that
// answers it, then the same scenario surviving, then what it charged. The last
// step is the one Attica does not have, which is the honest place to end.

import { useState } from 'react'
import { RawCode } from '../ui/CodeBlock'

interface Step {
  n: number
  title: string
  failure: string
  body: string
  file: string
  lang: 'python' | 'javascript'
  code: string
  hot?: number[]
  run: string
  survives: string
  cost: string
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'One form, one POST',
    failure:
      'Nothing exists yet. Start with the obvious design, because it is the one you have to feel the limits of before anything else is justified.',
    body:
      'Collect everything in component state and submit once. The server validates the whole object, because for the first and last time it has the whole object. This is a good design and you should not leave it without a reason.',
    file: 'CreateEvent.jsx',
    lang: 'javascript',
    code: `const [form, setForm] = useState({ name: '', date: '', venue: '', price: '' });

const submit = async () => {
    const res = await fetch('/api/events/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    });
    if (!res.ok) {
        const errors = await res.json();   // the server saw all of it at once
        setErrors(errors);
        return;
    }
    navigate('/my-events');
};`,
    run: `POST /api/events/ 400
{"date": ["This field is required."], "venue": ["This field is required."]}`,
    survives:
      'A half-filled event never reaches the database, and the error message can talk about the whole thing at once.',
    cost:
      'Close the tab and every keystroke is gone. For a four-field form that is a shrug. For eight screens including a calendar and a venue map, it is the entire problem.',
  },
  {
    n: 2,
    title: 'A row from the very first click',
    failure:
      'From step 1: the organizer spent ten minutes on the schedule screen, closed the tab, and has nothing.',
    body:
      'Create the draft before asking anything, so every screen has somewhere to write to. Note what this costs immediately: the row exists while the object is still incomplete, so the model cannot require any of it.',
    file: 'models.py and CreateEventPage.jsx',
    lang: 'python',
    code: `class EventDraft(models.Model):
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default="draft")
    data = models.JSONField(default=dict, blank=True)

# and on the client, before the first question is asked:
#   const { data } = await api.post('/api/events/event-drafts/', { data: { steps: {} } });
#   navigate(\`/listing/\${data.id}/step1\`);`,
    hot: [3],
    run: `POST /api/events/event-drafts/ 201
{"id": 1, "status": "draft", "data": {"steps": {}}}`,
    survives:
      "Step 1's scenario now leaves something behind. Close the tab and the row is still there with whatever had been saved into it.",
    cost:
      'Every field is now optional, forever. There is no point in the lifecycle where the server holds a complete event and could refuse an incomplete one.',
  },
  {
    n: 3,
    title: 'Save on the way out of each screen',
    failure:
      'From step 2: there is a row, but nothing writes to it. The organizer comes back to an empty draft.',
    body:
      'Send on every Next. Send the whole accumulated map rather than just this screen, so a later save carries earlier answers along and one dropped request is not one lost screen.',
    file: 'wizardContext.jsx',
    lang: 'javascript',
    code: `const saveStep = async (id, step, payload, nextStep) => {
    const mergedSteps = { ...state.steps, [step]: payload };

    const res = await fetch(\`/api/events/event-drafts/\${id}/\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { steps: mergedSteps } }),
    });
    if (!res.ok) {
        setError('Save failed, stored locally until you are back online.');
        return { ok: false };
    }
    return { ok: true, data: await res.json() };
};`,
    hot: [1],
    run: `PATCH /api/events/event-drafts/1/ 200
{"data": {"steps": {"step1": {"name": "Kaya Fest"}}}}`,
    survives:
      "Step 1's scenario survives properly now: the answers are on the server, not just the row. A different laptop sees them.",
    cost:
      'A request per screen, and a decision you have just deferred: what should Next do when that request fails? Attica navigates anyway. Whatever you choose, choose it on purpose.',
  },
  {
    n: 4,
    title: 'Remember where they were',
    failure:
      'From step 3: the answers come back but the wizard does not. The organizer lands on step 1 and has to click forward through five screens to find where they stopped.',
    body:
      'One column. Send it in the same request that carries the data, so position and content can never disagree about which save they came from.',
    file: 'models.py and wizardContext.jsx',
    lang: 'python',
    code: `    current_step = models.CharField(max_length=100)

# in the same PATCH, not a separate one:
#   body: JSON.stringify({ data: { steps: mergedSteps }, current_step: nextStep })`,
    hot: [0],
    run: `PATCH /api/events/event-drafts/1/ 200
{"current_step": "step5", "data": {"steps": {...}}}`,
    survives:
      'Close the tab on step 5, come back, and the server knows it was step 5. The organizer resumes in one click instead of six.',
    cost:
      'A string with no constraint on it. Add choices here and a bad value becomes a 400 at write time instead of a blank page at read time. Attica left it open, which is why the blank-page failure in stage 3 exists at all.',
  },
  {
    n: 5,
    title: 'Reconcile the URL with the row',
    failure:
      'From step 4: the row says step 5 and the organizer clicked a bookmark for step 3. Two sources of truth about position, and the wizard has to pick.',
    body:
      'Decide explicitly, in one place, and write down which one wins. An explicit URL is a deliberate act, so let it win, and only consult the stored step when the URL has nothing to say.',
    file: 'ListingWizardLayout.jsx',
    lang: 'javascript',
    code: `const draft = await loadEvent(eventId);

// An explicit step in the URL is a deliberate act: honour it.
const urlStep = getUrlStep(location.pathname);
if (urlStep) return setIsLoading(false);

// Nothing in the URL, so fall back to where they left off.
const stepPath = resolveStepPath(draft.current_step);
if (stepPath) return navigate(\`/listing/\${eventId}/\${stepPath}\`, { replace: true });

setIsLoading(false);   // <- and this is the blank page`,
    hot: [3, 4, 7, 8, 10],
    run: `/listing/1          -> redirected to /listing/1/step5
/listing/1/step3    -> stays on step3, current_step untouched
/listing/1  (current_step = "step-two-ish")  -> renders nothing`,
    survives:
      'Both entry points behave predictably, and a deep link is shareable without lying about progress.',
    cost:
      'That last line. When resolveStepPath returns null the layout has no case for it, so the wizard renders an empty outlet. Either constrain current_step (step 4) or make this branch redirect to step 1. Attica does neither.',
  },
  {
    n: 6,
    title: 'Turn the bag into a row',
    failure:
      'From step 5: the draft holds a nested JSON bag and the site needs an Event with columns, indexes and a date it can sort on.',
    body:
      'Write the projection. One function, one place, every column named. The fallback chain is where you decide what an absent answer means, and you have to decide it for every single column because none of them were ever required.',
    file: 'views.py',
    lang: 'python',
    code: `def _build_event_payload(self, draft, request=None):
    step1 = self._draft_step(draft, "step1")
    step5 = self._draft_step(draft, "step5")

    start_dt = parse_datetime(str(step1.get("start_date") or ""))
    event_date = parse_date(str(step1.get("date"))) if step1.get("date") else None
    event_date = event_date or (start_dt.date() if start_dt else timezone.localdate())

    return {
        "name": self._first_truthy(step1.get("name"), "Untitled event"),
        "date": event_date,
        "base_price": self._first_truthy(step5.get("base_price"), 0),
        "status": "published",
    }`,
    hot: [5, 6, 8],
    run: `# an empty draft, published:
Event(name="Untitled event", date=2026-08-15, base_price=0, status="published")`,
    survives:
      'Any draft at all becomes a valid Event row. Nothing throws, nothing 500s, and a half-finished event can be published and finished later.',
    cost:
      'Read that output again. That is a real event on a real site, named "Untitled event" and dated whenever it happened to be published. The projection cannot refuse, because refusing was never its job.',
  },
  {
    n: 7,
    title: 'The gate this design still needs',
    failure:
      'From step 6: publishing cannot fail, so nothing stands between a blank draft and the public site. Attica ends here. You do not have to.',
    body:
      'The missing piece is not validation on the draft, which would break resumability, but validation at the transition. Define completeness once, check it only when a draft tries to become public, and say which fields are missing.',
    file: 'views.py',
    lang: 'python',
    code: `REQUIRED_FOR_PUBLISH = {
    "name": lambda s: s["step1"].get("name"),
    "date": lambda s: s["step1"].get("start_date") or s["step1"].get("date"),
    "venue": lambda s: s["step4"].get("location"),
}

def publish(self, request, *args, **kwargs):
    draft = self.get_object()
    steps = self._draft_steps(draft)
    missing = [name for name, get in REQUIRED_FOR_PUBLISH.items()
               if not get({**{k: {} for k in ("step1", "step4")}, **steps})]
    if missing:
        return Response(
            {"detail": "This event is not ready to publish.", "missing": missing},
            status=status.HTTP_400_BAD_REQUEST,
        )
    ...`,
    hot: [7, 8, 9, 10, 11, 12],
    run: `POST /api/events/event-drafts/1/publish/ 400
{"detail": "This event is not ready to publish.", "missing": ["name", "date", "venue"]}`,
    survives:
      'The draft is still schemaless and still resumable, because nothing about saving changed. Only the one transition that makes it public now has an opinion.',
    cost:
      'You need a definition of "complete" that lives somewhere, and it will drift from the wizard as screens change. That is a real maintenance cost, and it buys you never again publishing an event called "Untitled event".',
  },
]

export function Stage4Build() {
  const [i, setI] = useState(0)
  const s = STEPS[i]

  return (
    <>
      <div className="card">
        <h2>Build it, in the order the failures force</h2>
        <p className="lede">
          Seven steps. Each one starts from the previous step's failure, so nothing is introduced
          before you have felt why it is needed. Steps 2 to 6 land on exactly what Attica does; step
          7 is what it does not.
        </p>
        <div className="ctl">
          {STEPS.map((st, n) => (
            <button key={st.n} className="opt" aria-pressed={n === i} onClick={() => setI(n)}>
              {st.n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          STEP {s.n} OF 7 · THE FAILURE THIS ANSWERS
        </div>
        <p style={{ margin: '5px 0 14px', color: 'var(--warn)', fontSize: 14 }}>{s.failure}</p>

        <h3>{s.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{s.body}</p>

        <RawCode code={s.code} lang={s.lang} file={s.file} hotLines={s.hot} />

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          RUN IT
        </div>
        <div className="term" style={{ marginTop: 5 }}>
          {s.run}
        </div>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          THE SAME SCENARIO, NOW
        </div>
        <p style={{ fontSize: 14, marginTop: 4 }}>{s.survives}</p>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          WHAT IT CHARGED
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginTop: 4, marginBottom: 0 }}>{s.cost}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="opt" disabled={i === 0} onClick={() => setI(i - 1)}>
            ← previous
          </button>
          <button className="opt" disabled={i === STEPS.length - 1} onClick={() => setI(i + 1)}>
            next step →
          </button>
        </div>
      </div>

      {i === STEPS.length - 1 && (
        <div className="card">
          <h3>What you can now say without looking</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--ink-dim)' }}>
            <li>Why the draft row is created before the first question is asked.</li>
            <li>
              Which of the three tiers holds a value at any moment, and which one a different browser
              can see.
            </li>
            <li>What <code>current_step</code> buys, and what leaving it unconstrained costs.</li>
            <li>Why publish cannot refuse anything, and where the gate would have to go instead.</li>
            <li>
              Why step 2 was excised, and how to tell whether a screen in a wizard actually saves.
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
