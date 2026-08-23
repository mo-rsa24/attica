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

Scope: [fixing-create-event](../MASTER_PLAN.md). Second of three. Four defects, each with a test
already written that will tell you when it is fixed.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Four confirmed defects, all in the event-creation path, all with existing failing tests:

Two are missing validation (a past date, a negative price both go through). One is a persistence bug
(an uploaded asset does not attach to its draft). One is an inconsistency (two paths disagree about
whether reading another organizer's draft is 403 or 404).

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
attached to its draft, and the two paths that guard another organizer's draft agree with each other.

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
back on the draft, and make the retrieve and publish paths agree on one status code for a draft that
belongs to someone else.

## Purpose and goal

Navigation: ⬅️ [Description: what to fix](#description-what-to-fix) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Stop the flow accepting states nothing downstream can handle.

**Goal.** Four tests change state: two Playwright `test.fail` markers flip to `test`, and the two
erroring Django tests pass. `python manage.py test` reports 0 failures and 0 errors.

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
  - Rotating is a browser step in the Sentry account, so it is instruction 3.4, not a task here.

▶ **Next: [instruction 3.1](#3--try-each-fix-as-an-organizer)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--try-each-fix-as-an-organizer)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for each of the four defects
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself. A passing test is not the same as a usable screen.

### 3. 🖱️ Try each fix as an organizer

◀ **Needs: [task 2](#2--fix-asset-persistence-and-the-status-disagreement)**.

3.1 **Try to create a past-dated event through the wizard**
   - Stack up per [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     logged in as `test_organizer`. Start an event and set the date to yesterday.
   - Expected result: you are stopped, **and told why, in the form**.
   - ✅ a readable message naming the field. ❌ a raw 400 in the console with nothing on screen: the
     server is right and the form is silent, which is a worse experience than before. Note it.

3.2 **Upload a poster and confirm it is really there**
   - Reach the media step, upload an image, then reload the page.
   - Expected result: the poster is still shown after the reload, not just after the upload.
   - ✅ it survives a reload. ❌ it vanishes: the fix addressed the response, not the storage.

3.3 **Check the upload limit message**
   - The screen says "Max 100MB each"; the server rejects above 50 MB.
   - Expected result: they agree. This is a one-word copy fix and it is in scope because a user who
     is told 100 and rejected at 60 has no way to work out what happened.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

3.4 **Rotate the Sentry token in the browser**

- Open `sentry.io`, the Attica project, then Settings, then Auth Tokens.
- Revoke the token beginning `sntryu_` that appears in `.env.example`, and create a replacement.
- Paste the new one into `.env` only. `.env.example` gets a placeholder, never a value.
- ✅ The old token is listed as revoked, and the app still reports an error after a restart. If it
  does not, `SENTRY_DSN` is unset in that shell, which is the normal no-op rather than a failure.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

Done is: `python manage.py test` reports 0 failures and 0 errors, the two Playwright markers are
flipped, **and** you have seen each fix behave correctly in a browser as an organizer.

A green suite with a form that rejects silently is not done. Instruction 3.1 is the check that
catches it.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Past-date validation | `backend/main/events/` serializer or view | not started |
| Negative-price validation | `backend/main/events/serializers.py` | not started |
| Asset persistence fix | `backend/main/events/views.py:438` or the serializer | not started |
| One agreed status code, both paths | `backend/main/events/views.py` | not started |
| Two Playwright markers flipped to `test` | `frontend/tests/e2e/create-event.spec.ts` | not started |
| The upload-limit copy corrected | the media step's on-screen text | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Every fix here flips a test, and [03](03-reconcile-suite-and-runbook.md) re-runs both suites as its
first act. So leave the markers correct as you go rather than in a batch at the end; step 3 reads
them as its input.

The status-code decision in task 2.2 is the one that needs writing down somewhere a person will find
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
