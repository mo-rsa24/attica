# Scene spec: Attica's event creation wizard, as a state machine

```
ran under:  none
built from: /home/molef/Work/attica (the repository itself)
why:        understand how the wizard survives a closed tab
depends on: ../../../environment/overview.md, ../../../context/00-INDEX.md
```

The confirmed gate output that produced this app.

## Claim card

```
Claim:        every Next writes the whole accumulated draft to the server and moves
              current_step, so the wizard survives a closed tab, a dead battery, and
              a different machine. You resume exactly where you left off.

Alternative:  holding a step's answers in component useState and submitting once at
              the end. Not hypothetical: ListingStep2.jsx is that design, still in
              the repo. It holds selectedEventType in useState, its Next button only
              calls navigate, and nothing it collects ever leaves the browser.

Use it:       an organizer fills step 1, is interrupted, and comes back two days
              later on a different laptop. loadEvent fetches the draft and
              ListingWizardLayout reads draft.current_step and redirects there.

Do not:       persisting a partial object per step means the server can never refuse
              an incomplete one, so every field needs a fallback. Publish an empty
              draft and it succeeds: name defaults to "Untitled event", date to
              timezone.localdate(), start_time to timezone.now(). A single-submit
              form would have refused it at the door. EventDraft.data is an untyped
              JSONField and current_step is a CharField(max_length=100) with no
              choices and no validation.

Consequence:  the scene runs one organizer down two lanes from the same start. The
              step 1 lane's answer lands in EventDraft.data.steps.step1 and survives
              a tab close; the step 2 lane's selectedEventType exists only in a
              useState and is gone the moment they navigate. Then it publishes an
              empty draft and shows the projection filling itself with defaults.
```

**Falsification check.** The claim dies if data an organizer entered fails to survive. The scene produces that three ways, all real, and excursion 2 asks the reader to find a fourth.

## What the code actually does

Six findings that shaped the scene. Every one is why this is not a generic wizard.

1. **Eight step files, seven wizard states.** `STEP_SEQUENCE` omits `step2` ([reactContext.jsx:13](../../frontend/src/context/reactContext.jsx#L13)).
2. **`ListingStep2.jsx` never renders.** Its route is `<Navigate to="step1" replace/>` ([App.jsx:121](../../frontend/src/App.jsx#L121)). The event-type picker moved into step 1, which saves it as `category`. The backend still carries the trace: `_first_truthy(step1.get("category"), step1.get("selectedEventType"), ...)`.
3. **`STEP_FIELD_WHITELIST` does nothing.** `filterPayloadForStep` is computed, then both branches of the ternary at [reactContext.jsx:417](../../frontend/src/context/reactContext.jsx#L417) evaluate to `{ steps: mergedSteps }`. Its entry for step5 lists `budget` and `guest_count`; step 5 sends neither.
4. **Step 3 writes into step 1's bucket.** `setStepData('step1', {...step1, ...nextSchedule})` ([ListingStep3.jsx:182](../../frontend/src/ListingStep3.jsx#L182)), which is why the publish projection reads `start_date` from step1.
5. **Steps 6 and 8 persist nothing.** Both call `saveStep(id, 'stepN', {}, nextStep)`. Step 8's photos go through the multipart asset endpoint instead.
6. **The readiness modal is advisory.** It groups booking requests by status, then wires `onConfirm={handlePublish}`.

## Model

**Shape: dynamic.** `step(machine, event, config) → machine`, folded by `run(config, events)`. Order is the whole lesson: abandon, resume, back-navigation and republish only mean anything as sequences. The event log is the timeline and scrubbing folds a prefix.

Event alphabet, each a real user action: `create-draft`, `edit(field)`, `next`, `back`, `save-and-exit`, `close-tab`, `resume`, `publish`.

Three storage tiers folded in parallel, because the concept is which tier holds a value at each instant:

| tier | what it is | survives |
|---|---|---|
| form | the step component's own `useState` | nothing; any navigation wipes it |
| local | the reducer, mirrored to `localStorage` on every dispatch | a closed tab, on that browser only |
| server | `EventDraft.data.steps` | everything, and it is all publish can see |

## State: the manipulable configuration

| id | values | grounded in |
|---|---|---|
| `step2Live` | redirect / routed live | App.jsx:121 |
| `network` | up / save fails | saveStep's catch |
| `staleLocal` | clean / holds another draft | one global key, no draft scoping |
| `route` | `/listing/1` / `/listing/1/step5` | the URL-wins branch in the layout |
| `storedStepOverride` | as saved / a value the lookup rejects | `CharField`, no choices |
| `bookings` | none / pending / approved | the readiness modal |
| `priorEventId` | absent / in draft.data | upsert vs create |
| `whitelistLive` | as shipped / wired up | the no-op ternary |

## Stages

| Stage | Medium | Content |
|---|---|---|
| 0. the problem | visual | the same answer down two lanes, then a closed tab. Only one comes back |
| 1. the smallest version | visual + code | the four calls that make a wizard resumable, whole |
| 2. the machine | visual | seven states, the three tiers, the merge rule, the field map, the publish projection |
| 3. where it costs you | prose + visual | six failures, symptom before cause, each with a prediction and a reproduce button, closing on the flagged note |
| 4. build it | code | seven steps in Python and JavaScript, ending on the gate Attica does not have |

**Stage 4 drops the machine surface deliberately**: it builds one from nothing, so the code is the surface there.

## Workspace

- **Anchored surface**: the statechart, with the readouts, the three-tier grid, the controls and the event log in one region beneath it.
- **Attached readouts**: where you are, a resume lands on, typed but never saved, waiting for a save (or columns filled by fallback once published).
- **Popovers**: clicking a state, a transition or a part opens one anchored to it, carrying the live value, the real source line, the break-it string, its controls, and the model-computed counterfactual.
- **Drawers behind a 3-button toolbar**: `probes`, `history`, `compare`.

## Engagement

**Tour**: generated argument-first, 8 steps at the cap. Five surfaces (stage strip, lanes, chart, tiers, controls) plus the three parts the claim card turns on. **Dropped to stay at the cap**: `route`, `currentStep`, `whitelist`, `bookings`, `priorEventId`, all of which have their own failure card in stage 3.

**Predictions**: five, committing to one of the model's variants before the intervention fires.

**Excursions**: three. Two machine-checked (how many of step 5's fields the whitelist would drop, checked against the model; and a run where a typed field never reaches the server, checked through `encodeState`/`decodeState`). One labelled unverified: count `current_step` values in your own database.

## Live checks

Nine, over **30,036 runs**: every one of 128 configurations crossed with the four scenarios, plus every event sequence up to length four under four representative configurations. The space of all sequences is infinite; the bound is stated in the page rather than implied.

1. with the redirect in place, nothing reaches step 2
2. a value reaches the server only through a save
3. a successful Next leaves current_step where you landed
4. a failed save advances the browser and not the row
5. publish succeeds whatever the draft holds (the do-not case as an assertion)
6. republishing updates the Event instead of making a second one
7. a file never travels in the JSON payload
8. folding the recorded history reproduces the run
9. diffing a run against itself yields nothing

## Editorial stance

Confirmed at the gate: **teach, then flag**. Each finding is explained neutrally in the stage where it belongs, and stage 3 closes with a separate card naming the three that read as defects rather than decisions (the step 2 route, the no-op whitelist, the unscoped storage key), with the note that none of them is currently losing data on the shipped routes and why each still matters.

## Stack

React, TypeScript, Vite, Zustand, Motion, Shiki (python and javascript only). No KaTeX, no Mafs, no 3D. No React Flow: the chart has eleven fixed, hand-placed states, so bespoke SVG is smaller and better art-directed.

## Honesty notes

- **`step2Live` models a hypothetical**, and the scene says so. As shipped you cannot reach step 2, so its Next never runs. Switching the control on restores the historical wiring in order to show what that screen would do.
- **The publish projection is modelled per field, not per column.** Attica's `_build_event_payload` writes about twenty columns; the scene tracks the seven an organizer can actually enter in this model and names the fallback for each.
- **Numbers in the checks are counts of modelled runs**, not measurements of the real app.

## What the browser drive found

- `resume` was replacing the reducer tier with the server's contents, which wiped exactly the unsaved work `localStorage` exists to keep. The interrupted scenario showed the ticket price as lost when it should have been present in the browser and absent from the server. Fixed; the variant copy ("on this browser they come back; on any other they do not") had been describing behaviour the model did not have.
- The `staleLocal` bleed was injecting a field into the *server* bag rather than the reducer, which is the wrong tier for a cache bleed, and it injected a field the scenarios already typed, so it was invisible. Now it adds an event type to the reducer only.
- Two of the nine checks failed on first run. The publish check read the status at the end of the log rather than at the publish event, and a draft stays editable after publishing. The `current_step` check was over-broad: step 2's Next saves nothing, which is the finding, so the check now counts those separately and reports them.
- The sequence sweep ran only the default configuration, so the offline-divergence check had zero coverage while appearing to pass. Now crossed with four configurations.
- The tier grid's absent-state dots were nearly invisible against the panel.
- The abandon edge's label was hidden behind the review box; the live edges now draw above the states.
- The copied `index.html` still carried the previous scene's title.
