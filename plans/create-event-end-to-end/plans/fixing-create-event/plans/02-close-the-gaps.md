# 🛡️ Close the Validation and Persistence Gaps

Step 2 of 3 in the [running order](../MASTER_PLAN.md#running-order). Waits on step 1
([Unblock the truth](01-unblock-the-truth.md)) for a trustworthy test suite.
Next: [Make the suites honest](03-reconcile-suite-and-runbook.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to fix](#description-what-to-fix)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [fixing-create-event](../MASTER_PLAN.md). Second of three. Six defects. Four have a test
already written that will tell you when it is fixed; the two wizard-state ones need their test
writing as part of the fix.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Six confirmed defects, all in the event-creation path.

Four are backend and each already has a failing test: two missing validations (a past date, a
negative price both go through), one persistence bug (an uploaded asset does not attach to its
draft), and one inconsistency (two paths disagree about whether reading another organizer's draft is
403 or 404).

Two are frontend and were found later, by driving the wizard and reading the database after every
screen. Route step4 saves a different location from the one picked, and the review screen cannot
display the event basics it already holds. Neither has a test yet.

**Step 1 may have added to this list.** If either of the two previously-unclassifiable bugs turned
out to be a real, unfixed defect, it belongs here.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- `python manage.py test` is the working backend suite. **There is no working pytest**, so do not
  reach for one.
- `MAX_UPLOAD_SIZE_BYTES` defaults to 50 MB while the upload screen's own copy says 100 MB. The
  server-side limit already works; the screen text is a separate, smaller problem.
- The publish action is at `backend/main/events/views.py:496-537` and already handles re-publish by
  storing `published_event_id` in the draft.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Validation belongs on the server, and the tests check the server.**

Both validation tests hit the API directly rather than the form. Adding a check in
`ListingStep1.jsx` alone will not turn either green, and would leave the API open to anything that
does not go through the wizard.

**The 403-versus-404 question is a decision, not a bug with one right answer.**

Returning 404 for another organizer's draft hides whether it exists, which is the more private
answer. Returning 403 says "this exists and is not yours". Both are defensible. What is **not**
defensible is the current state, where the retrieve path returns 404 and the publish path returns
403 for the same situation. Pick one, apply it to both, and write down why.

**The asset bug may be in either half.**

`test_upload_asset_persists_on_draft` errors because the draft's `assets` list comes back empty. That
could be the upload not saving, or the serializer not returning what was saved. Find out which before
changing anything, or you will fix the wrong end.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

An organizer cannot publish an event dated in the past or priced below zero, an uploaded asset stays
attached to its draft, the two paths that guard another organizer's draft agree with each other, and
the two wizard screens that currently misreport their own state tell the truth.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

These are the defects that let bad data into the system rather than making a screen look wrong. A
past-dated published event and a negatively-priced ticket are both states nothing downstream expects,
and both are reachable today through the ordinary flow.

The asset bug is quieter and worse in its own way: the organizer uploads a poster, sees no error, and
the poster is not there.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  organizer action            today                        after this plan
  ─────────────────────────────────────────────────────────────────────────
  publish, date = yesterday   ✅ 200, event created        ❌ 400, rejected
  create, base_price = -10    ✅ 200, event created        ❌ 400, rejected
  upload a poster             ✅ 200, assets list empty    ✅ 200, poster in assets
  read someone else's draft   404 here, 403 at publish     one status, both paths
  pick an address on step4    sometimes saves another one  saves the one picked
  open the review screen      basics blank, data is fine   basics show what step1 holds
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-fix) ➡️

Two pieces in the scope's map, [the illustrated map](../diagram-prompts.md), draw this plan.

**Subject: where all six defects sit.** This plan owns badges 3 to 6, and the picture's claim is
that all four are in the backend band while
[01](01-unblock-the-truth.md)'s two straddle the boundary.
[Prompt 2 (Subject)](../diagram-prompts.md#prompt-2-subject-where-all-six-defects-sit).
Save as `../diagrams/subject-02-where-the-six-sit.png`. *(image not yet generated)*

**Process: three plans, three gates.** This plan is the middle panel, and its gate is the one a
suite cannot pass for you: a person tried each fix in a browser.
[Prompt 2 (Process)](../diagram-prompts.md#prompt-2-process-three-plans-and-what-each-gate-proves).
Save as `../diagrams/process-02-three-plans-three-gates.png`. *(image not yet generated)*

## Description: what to fix

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Add server-side validation for past dates and negative prices, make uploaded assets persist and come
back on the draft, make the retrieve and publish paths agree on one [status code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> for a draft that
belongs to someone else, and stop the two wizard screens that misreport their own state: route step4
overwriting a chosen address, and the review screen showing blanks for values it already has.

## Purpose and goal

Navigation: ⬅️ [Description: what to fix](#description-what-to-fix) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Stop the flow accepting states nothing downstream can handle.

**Goal.** Four tests change state: two Playwright `test.fail` markers flip to `test`, and the two
erroring Django tests pass. `python manage.py test` reports 0 failures and 0 errors. Two new tests
exist and pass, one per wizard-state defect, because neither had any coverage before.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/fixing-create-event/plans/02-close-the-gaps.md`
- [ ] **Carry in step 1's verdicts.** If autosave or the unsaved-changes guard turned out to be a
  real unfixed defect, add it to task 2 below before starting.

▶ **Next: [task 1.1](#1--add-the-missing-validation)**.

### 1. 🛡️ Add the missing validation

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Reject a past-dated event at publish**
  - The test: `create-event.spec.ts:45`, `rejects events with start_date in the past`. It PATCHes a
    draft with yesterday's `start_date`, publishes, and expects **400**.
  - Validate server-side. The publish action is `backend/main/events/views.py:496`; the serializer is
    `backend/main/events/serializers.py`.
  - Decide and write down what "past" means against what: the event's `date`, its `start_date`, or
    its `start_time`. Those are three different fields with three different types, per
    [What an event is](../../../../../context/world/event.md#what-people-get-wrong).
  - Flip the marker from `test.fail` to `test` in the same change.

- [ ] **1.2 Reject a negative `base_price`**
  - The test: `create-event.spec.ts:105`, `rejects negative base_price on event create`. It POSTs
    `base_price: '-10.00'` to `/api/events/` and expects **400**.
  - The test's own comment points at `backend/main/events/serializers.py:99` as having no range check.
  - Consider whether zero should be allowed. A free event is legitimate; a negative one is not.
  - Flip the marker in the same change.

▶ **Next: [task 2.1](#2--fix-asset-persistence-and-the-status-disagreement)**.

### 2. 🔧 Fix asset persistence and the status disagreement

◀ **Needs: [task 1](#1--add-the-missing-validation)**.

- [ ] **2.1 Make an uploaded asset persist to its draft**
  - The test: `backend/main/events/tests.py:91`,
    `test_upload_asset_persists_on_draft`. It errors with `IndexError: list index out of range`
    because `response.data["assets"]` is empty.
  - **Diagnose which half is wrong before changing anything.** Upload an asset, then query
    `events_eventdraftasset` directly. If the row is there, the serializer is not returning it. If it
    is not, `upload_asset` at `backend/main/events/views.py:438` is not saving it.
  - Say which half it was in the fix.

- [ ] **2.2 Make the two guard paths agree**
  - The test: `backend/main/events/tests.py:248`,
    `test_cross_organizer_access_denied`. It expects **403** and gets **404**.
  - The publish action already returns 403 with a detail message
    (`backend/main/events/views.py:499`). The retrieve path returns 404.
  - Pick one and apply it to both paths. Write the reason in a comment where the choice is made:
    404 hides whether the draft exists, 403 confirms it exists and is not yours.
  - If you choose 404, the test is what changes, not the code, and that is a legitimate outcome as
    long as the publish path changes to match.

- [ ] **2.3 Get the live Sentry credential out of `.env.example`**
  - The file carries a real DSN and a real `SENTRY_AUTH_TOKEN` beginning `sntryu_`. It is
    gitignored (`.gitignore:13`) and `git log --all` confirms it has never been committed, so
    nothing is in history and this is not an incident.
  - It is still a working credential in a file named like a template, which is the shape of file
    people paste into a commit.
  - Rotate the token in Sentry first, then replace both values in `.env.example` with obvious
    placeholders (`SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>`), and put the real
    ones in `.env`, which is where the app reads them from anyway.
  - Rotating is a browser step in the Sentry account, so it is instruction 4.4, not a task here.

▶ **Next: [task 3.1](#3--fix-the-two-wizard-screens-that-lie-about-their-own-state)**.

### 3. 🖥️ Fix the two wizard screens that lie about their own state

◀ **Needs: [task 2](#2--fix-asset-persistence-and-the-status-disagreement)**.

Both were found on 2026-08-28 by driving the wizard end to end and reading the database after every
screen. Neither has a test yet, so each task writes one. Both are frontend-only; the backend stores
and publishes the right values in both cases.

- [ ] **3.1 Stop route step4 overwriting a location the organizer already chose**
  - The symptom: the organizer picks an address from the dropdown, the box and the map pin both show
    it, and the address that saves is somewhere else. Observed saving an Emfuleni address
    (lat `-26.719`, lon `27.836`) while the pin still showed Sandton, about 90 km away.
  - The cause: on mount, `frontend/src/ListingStep4.jsx:43` asks the browser for the user's
    location. Its success callback at `:51` calls `setSelectedLocation` and `setSearchQuery`
    unconditionally, with no check for a choice already made. The callback does a reverse-geocode
    round trip first, so it commonly lands *after* the organizer has picked.
  - It is a race, so it does not reproduce every time. Waiting for the box to settle before picking
    makes it save correctly, which is the confirmation that this is the mechanism.
  - Decide between guarding the callback (only seed the field when the organizer has not chosen) and
    dropping the auto-detect. Guarding keeps the convenience; write down which you chose.
  - Add a test that picks an address, resolves geolocation afterwards, and asserts the picked one
    survives.

- [ ] **3.2 Make the review screen show the event basics it already has**
  - The symptom: `/listing/<id>/review` shows Title "Pending details from Step 1", Date & time
    "Add schedule in earlier steps", and Category and Capacity "Not provided", while the panel
    beside it says "Review complete". The values are in the draft the whole time and publish uses
    them correctly.
  - The cause is two things meeting. `reviewDetails` is initialised to `{}` at
    `frontend/src/ListingReview.jsx:138`, and the guard at `:184` returns it whenever it is a
    non-array object. An empty object satisfies that, so the `steps.step1` fallback at `:185` is
    unreachable code. Separately, step1 persists `eventDetails` as `{}`, so after any reload there
    is nothing in the object the screen does read.
  - Fix the guard to test for the keys it needs rather than for object-ness, so the fallback can
    fire. Consider also persisting `eventDetails` on step1's save, but the guard is the smaller and
    more certain change.
  - Add a test that loads a review screen from a draft with `eventDetails: {}` and a populated
    `steps.step1`, and asserts the title renders.

- [ ] **3.3 Decide whether the step4 location is meant to reach the published event**
  - Not classified as a defect yet, and that is the point of this task. On event 48, published from
    a draft carrying a full address, `location_id` and `venue` are both empty while
    `steps.step4.location` still holds the address, latitude and longitude.
  - `events_event` has no latitude or longitude column, so there may be nowhere for it to go. This
    may be unimplemented rather than broken.
  - Produce a verdict, the same way step 1 produced verdicts for autosave and the unsaved-changes
    guard: a defect with a fix, or a gap recorded in
    [the environment overview](../../../../../environment/overview.md)'s known gaps.

▶ **Next: [instruction 4.1](#4--try-each-fix-as-an-organizer)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4.2](#4--try-each-fix-as-an-organizer)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for each of the six defects
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself. A passing test is not the same as a usable screen.

### 4. 🖱️ Try each fix as an organizer

◀ **Needs: [task 3](#3--fix-the-two-wizard-screens-that-lie-about-their-own-state)**.

4.1 **Try to create a past-dated event through the wizard**
   - Stack up per [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     logged in as `test_organizer`. Start an event and set the date to yesterday.
   - Expected result: you are stopped, **and told why, in the form**.
   - ✅ a readable message naming the field. ❌ a raw 400 in the console with nothing on screen: the
     server is right and the form is silent, which is a worse experience than before. Note it.

4.2 **Upload a poster and confirm it is really there**
   - Reach the media step, upload an image, then reload the page.
   - Expected result: the poster is still shown after the reload, not just after the upload.
   - ✅ it survives a reload. ❌ it vanishes: the fix addressed the response, not the storage.

4.3 **Check the upload limit message**
   - The screen says "Max 100MB each"; the server rejects above 50 MB.
   - Expected result: they agree. This is a one-word copy fix and it is in scope because a user who
     is told 100 and rejected at 60 has no way to work out what happened.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

4.4 **Rotate the Sentry token in the browser**

- Open `sentry.io`, the Attica project, then Settings, then Auth Tokens.
- Revoke the token beginning `sntryu_` that appears in `.env.example`, and create a replacement.
- Paste the new one into `.env` only. `.env.example` gets a placeholder, never a value.
- ✅ The old token is listed as revoked, and the app still reports an error after a restart. If it
  does not, `SENTRY_DSN` is unset in that shell, which is the normal no-op rather than a failure.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

Done is: `python manage.py test` reports 0 failures and 0 errors, the two Playwright markers are
flipped, **and** you have seen each fix behave correctly in a browser as an organizer.

A green suite with a form that rejects silently is not done. Instruction 4.1 is the check that
catches it.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Past-date validation | `backend/main/events/` serializer or view | not started |
| Negative-price validation | `backend/main/events/serializers.py` | not started |
| Asset persistence fix | `backend/main/events/views.py:438` or the serializer | not started |
| One agreed [status code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>, both paths | `backend/main/events/views.py` | not started |
| Two Playwright markers flipped to `test` | `frontend/tests/e2e/create-event.spec.ts` | not started |
| The upload-limit copy corrected | the media step's on-screen text | not started |
| Route step4 keeps the chosen address | `frontend/src/ListingStep4.jsx:43-56` | not started |
| Review screen renders the event basics | `frontend/src/ListingReview.jsx:138` and `:183-186` | not started |
| A test per wizard-state defect | wherever the frontend tests live | not started |
| A verdict on the step4 location never reaching the event | this plan, or the environment overview's known gaps | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Every fix here flips a test, and [03](03-reconcile-suite-and-runbook.md) re-runs both suites as its
first act. So leave the markers correct as you go rather than in a batch at the end; step 3 reads
them as its input.

The [status-code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> decision in task 2.2 is the one that needs writing down somewhere a person will find
it. That is step 3's job, and it needs the reason, not just the number.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../../../environment/overview.md): the working test suite, and the upload limit.
- [What an event is](../../../../../context/world/event.md): the three date fields and why
  they disagree, which task 1.1 has to choose between.
- [What an event draft is](../../../../../context/world/event-draft.md): what an asset is
  and where it lands on disk.
- `frontend/tests/e2e/create-event.spec.ts`: the four tests that define done here.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[Make the suites honest](03-reconcile-suite-and-runbook.md), which makes the suites tell
the truth and writes every bug and fix into the runbook.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| An event dated in the past publishes successfully | Publish, `events/views.py:496` | No server-side past-date check. The wizard form does not have one either. |
| A negative `base_price` is accepted | `POST /api/events/` | No range check at `events/serializers.py:99`. |
| An uploaded asset returns 200 and the draft's `assets` list stays empty | `events/tests.py:91` | Either `upload_asset` does not save or the serializer does not return it. Diagnose before fixing. |
| Reading another organizer's draft gives 404, publishing it gives 403 | `events/tests.py:248` against `events/views.py:499` | The two paths disagree. Pick one status, apply to both, record the reason. |

### From driving the wizard on 2026-08-28

| Error | Where it bit | Fix |
|---|---|---|
| The address that saves is not the one the organizer picked | Route step4, `ListingStep4.jsx:51` | The geolocation success callback overwrites the chosen location with no guard, and lands late because it reverse-geocodes first. |
| Review shows "Pending details from Step 1" for a draft that has them | `/listing/<id>/review`, `ListingReview.jsx:138` and `:184` | `reviewDetails` starts as `{}`, which is truthy, so the guard always returns it and the `steps.step1` fallback at `:185` is unreachable. |
| The step4 address is absent from the published event | `events_event.location_id` and `.venue`, both empty | Unclassified. `events_event` has no latitude or longitude column, so this may be unimplemented rather than broken. Task 3.3 decides. |
