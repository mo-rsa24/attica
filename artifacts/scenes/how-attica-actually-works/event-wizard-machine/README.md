# Attica's event wizard, as a state machine

## The claim

Every Next writes the whole accumulated draft to the server and moves `current_step`, so the wizard survives a closed tab, a dead battery, and a different machine. You resume exactly where you left off.

The alternative it beats is holding a step's answers in component state and submitting once at the end. That is not a hypothetical: [ListingStep2.jsx](../../frontend/src/ListingStep2.jsx) is that design, still in the repo. It keeps `selectedEventType` in a `useState`, its Next button only calls `navigate`, and nothing it collects ever leaves the browser.

And the price: persisting a partial draft at every step means the server can never refuse an incomplete one. Publish an empty draft and it succeeds, as an event called `"Untitled event"` dated today.

## Run it

```bash
npm install
npm run dev        # http://localhost:5175
npm run checks     # 9 live checks over 30,036 runs, outside the browser
```

Port 5175: Attica's frontend owns 5173 and the realtime-overlay scene owns 5174.

## Click this first

Press **interrupted at step 5** in the controls under the chart. Then read the tier grid, one row:

```
ticket price   form ○   reducer ●   EventDraft.data ○
```

They typed it, closed the tab, and came back. It is still in their browser and it is not in the database. Press **Next** once and watch it move to the third column, because a save is the only door.

Then press **the step 2 path** and watch the same thing never reach the second column at all.

## What it is grounded in

Every string, line number and code excerpt comes from these files. Nothing is paraphrased.

- [frontend/src/context/reactContext.jsx](../../frontend/src/context/reactContext.jsx) — `STEP_SEQUENCE`, `saveStep`, the merge rule, the localStorage mirror, the whitelist
- [frontend/src/ListingWizardLayout.jsx](../../frontend/src/ListingWizardLayout.jsx) — the resume logic, all eight lines of it
- [frontend/src/App.jsx](../../frontend/src/App.jsx) — the step2 redirect
- [frontend/src/ListingStep1.jsx](../../frontend/src/ListingStep1.jsx), [ListingStep3.jsx](../../frontend/src/ListingStep3.jsx), [ListingStep7.jsx](../../frontend/src/ListingStep7.jsx), [ListingStep8.jsx](../../frontend/src/ListingStep8.jsx) — what each screen actually saves
- [frontend/src/ListingStep2.jsx](../../frontend/src/ListingStep2.jsx) — the alternative, preserved
- [backend/main/events/models.py](../../backend/main/events/models.py) — `EventDraft`, and how little it constrains
- [backend/main/events/views.py](../../backend/main/events/views.py) — `_build_event_payload` and `publish`

`SPEC.md` is the confirmed design, including the three findings flagged as defects and what the browser drive caught.
