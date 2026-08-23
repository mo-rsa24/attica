# 🔓 Unblock the Truth: Two One-Line Bugs

Step 1 of 3 in the [running order](../MASTER_PLAN.md#running-order). Waits on nothing.
Next: [Close the gaps](02-close-the-gaps.md).

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
- [Autonomously running the loop: which parts a terminal can do](#autonomously-running-the-loop-which-parts-a-terminal-can-do)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [fixing-create-event](../MASTER_PLAN.md). First of three, and the only one that must go
first. The other two can be done in either order once this lands.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Two bugs, each one line, each blocking something bigger than itself.

The first breaks the organizer dashboard outright. The second means **every browser-level end-to-end
test runs logged out**, which is why two other bugs in this scope currently have no verdict: their
tests report "failed as expected" while the page is sitting on the login screen.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- Tokens live in `localStorage` under the key `tokens`, holding `{access, refresh}`. This is the
  fact bug 2 gets wrong.
- The Playwright suite assumes the backend is already up on `:8000` and starts Vite itself.
- The deterministic fixture is `e2e-organizer` / `E2eOrganizerPass!23`, created by
  `python manage.py seed_e2e`.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A broken test helper is worse than a missing test.**

A missing test is a known gap. A test that runs against a logged-out page and reports "failed as
expected" looks like a documented defect and is actually noise. Two entries on this scope's bug list
are in that state right now, and no amount of reading the application code will settle them.

**Fix the helper before believing anything the browser tests say**, including anything they said in
the past.

**Two callers share the wrong path, and fixing one is not enough.**

`/api/events/my/` is requested from two files. Correcting the dashboard alone leaves the event
selector on a vendor profile still broken, and that path is how an organizer attaches a booking to
an event.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Two one-line corrections make the organizer dashboard load and make the browser test suite tell the
truth. Nothing else in this scope is trustworthy until they are made.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Both bugs are typos in a string. Neither is hard. They are first because of what they unblock, not
because of what they cost.

Bug 1 is the difference between an organizer seeing their bookings and seeing "Failed to fetch
data". Bug 2 is the difference between a test suite that measures the application and one that
measures the login screen.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BUG 1                                   BUG 2
  frontend asks   /api/events/my/         helper writes  localStorage.authTokens
                        │ 404                                   │
  backend serves  /api/events/my-events/  AuthProvider reads    localStorage.tokens
                        │                                       │
                        ▼                                       ▼
        "Failed to fetch data"                    every browser test runs logged out
        dashboard + event selector dead           2 bugs stuck at "unknown"
                        │                                       │
                        └───────────── fix both ────────────────┘
                                        │
                                        ▼
                        re-run the suite; 2 unknowns get a verdict
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-fix) ➡️

Two pieces in the scope's map, [the illustrated map](../diagram-prompts.md), draw this plan.

**Subject: the two wrong strings.** The ASCII above, rendered.
[Prompt 1 (Subject)](../diagram-prompts.md#prompt-1-subject-two-wrong-strings-two-dead-paths).
Save as `../diagrams/subject-01-two-wrong-strings.png`. *(image not yet generated)*

**Process: unblock, then re-classify.** The four stages, the gate where evidence becomes
trustworthy, and the two verdicts that may differ.
[Prompt 1 (Process)](../diagram-prompts.md#prompt-1-process-unblock-then-re-classify).
Save as `../diagrams/process-01-unblock-then-reclassify.png`. *(image not yet generated)*

For where this plan's two defects sit relative to
[02](02-close-the-gaps.md)'s four, see
[Prompt 2 (Subject)](../diagram-prompts.md#prompt-2-subject-where-all-six-defects-sit): the split
between the browser band and the backend band is exactly the split between the two plans.

## Description: what to fix

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Correct one API path in two frontend files, correct one `localStorage` key in the e2e login helper,
then re-run the browser suite and classify the two bugs that were previously unclassifiable.

## Purpose and goal

Navigation: ⬅️ [Description: what to fix](#description-what-to-fix) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Make the dashboard work, and make the evidence trustworthy before acting on it.

**Goal.** `/dashboard/organizer` loads and shows the seven seeded scenarios, the Playwright
happy-path test passes, and the autosave and unsaved-changes bugs each carry a verdict backed by a
run rather than a guess.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/fixing-create-event/plans/01-unblock-the-truth.md`

▶ **Next: [task 1.1](#1--fix-the-two-one-line-bugs)**.

### 1. 🔧 Fix the two one-line bugs

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Correct the API path in both callers**
  - The backend registers `event-drafts` and `my-events` at `backend/main/events/api_urls.py:8,14`,
    included under `api/events/` at `backend/main/main/urls.py:43`. So the working path is
    `/api/events/my-events/`.
  - Change `/api/events/my/` to `/api/events/my-events/` in **both**:
    - `frontend/src/EventOrganizerDashboard.jsx:252`
    - `frontend/src/components/booking/EventSelector.jsx:21`
  - Then grep for `events/my/` across `frontend/src` and confirm no caller is left.

- [ ] **1.2 Correct the localStorage key in the e2e login helper**
  - `frontend/tests/e2e/create-event.spec.ts:27` writes `localStorage.setItem('authTokens', ...)`.
  - `frontend/src/AuthProvider.jsx:7,36,57,61` reads and writes `tokens`.
  - Change the helper to write `tokens`.
  - Then grep the tests for `authTokens` and confirm it is gone.

▶ **Next: [instruction 3.1](#3--see-the-dashboard-load)**.

### 2. 🔍 Re-classify the two unknown bugs

◀ **Needs: [instruction 3.2](#3--see-the-dashboard-load)**, the browser suite genuinely
authenticating.

- [ ] **2.1 Re-run the browser suite and read the two results properly**
  - With the backend up and `seed_e2e` run: `cd frontend && npx playwright test --reporter=list`
  - The two tests in question:
    - `autosaves form changes within 2s of typing`
    - `prompts before discarding unsaved changes on step3`
  - For each, record which of three states it is in:
    - **Still expected-failing**, and now for the right reason: the feature is genuinely absent.
      Leave `test.fail` and write the reason into the test's comment.
    - **Now passing** ("Expected to fail, but passed"): the feature exists and the marker was
      hiding it. Flip to `test`.
    - **Failing for a third reason**: the test itself is wrong. Say so; do not flip anything.
  - Report the verdict for each. Do not carry either forward as "known broken" without one.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 2](#2--re-classify-the-two-unknown-bugs)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for both bugs
  - A wrong API path that 404s from two callers, and a test helper writing a key nothing reads.
    Both are cheap to write down now and expensive to rediscover.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 👀 See the dashboard load

◀ **Needs: [task 1](#1--fix-the-two-one-line-bugs)**.

3.1 **Bring the stack up and log in**
   - Follow [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Log in at `http://localhost:5173/login` as `test_organizer` / `Test123!`.
   - Expected result: you land on the feed, and the navbar shows "Event Organizer".

3.2 **Open the organizer dashboard with DevTools open**
   - Chrome DevTools → Network, filtered to Fetch/XHR, Preserve log on. Then click **My Bookings**
     in the navbar, which goes to `/dashboard/organizer`.
   - Expected result: the request to `/api/events/my-events/` returns **200**, and the page shows
     the Marketplace Requests tab with all seven seeded scenarios.
   - ✅ seven rows with their status badges. Take the screenshot the runbook has been waiting for:
     save as `runbook/images/booking/03-seven-scenarios.png`.
   - ❌ still "Failed to fetch data": check the Network tab for the actual path requested. If it
     still says `my/`, one of the two callers was missed.

3.3 **Check the event selector, the second caller**
   - Go to a vendor profile from `/services`, and start a booking so the event selector opens.
   - Expected result: your events list loads rather than erroring.
   - ✅ the list appears. ❌ it errors, `EventSelector.jsx` was not corrected.

▶ **Next: [task 2.1](#2--re-classify-the-two-unknown-bugs)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is done when the dashboard shows seven scenarios in a real browser **and** the two unknown
bugs each have a verdict from a run.

Fixing the two lines without re-running the suite leaves this scope exactly as uncertain as it was.
The point of going first is the re-classification, not the two edits.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Corrected API path, two callers | `frontend/src/EventOrganizerDashboard.jsx`, `frontend/src/components/booking/EventSelector.jsx` | not started |
| Corrected login helper | `frontend/tests/e2e/create-event.spec.ts` | not started |
| Verdict on autosave and the unsaved-changes guard | recorded in task 2.1 and carried into [03](03-reconcile-suite-and-runbook.md) | not started |
| The seven-scenarios screenshot | `runbook/images/booking/03-seven-scenarios.png` | slot open |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

The verdict from task 2.1 changes what [03](03-reconcile-suite-and-runbook.md) has to write into the
runbook, and may add work to [02](02-close-the-gaps.md) if either unknown turns out to be a real
defect nobody has fixed.

So do not start step 3 until this plan's verdicts exist.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../../../environment/overview.md): where tokens live, and what the suites need.
- [Bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): starting
  the four processes.
- [Running the tests](../../../../../runbook/running-the-web-app/running-the-tests.md): running both
  suites, and how to read a `test.fail` result.
- `backend/main/events/api_urls.py:8,14` with `backend/main/main/urls.py:43`: where the real paths
  are registered.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[Close the gaps](02-close-the-gaps.md), which fixes the validation and persistence defects.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#autonomously-running-the-loop-which-parts-a-terminal-can-do) ➡️

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| `/dashboard/organizer` shows "Failed to fetch data"; console has two 404s on `/api/events/my/` | The organizer dashboard, and the event selector on a vendor profile | The backend registers `my-events/`. Correct the path in both callers. |
| Every browser e2e test reports failed-as-expected while the page sits on `/login` | `create-event.spec.ts`'s `loginInBrowser` | It writes `localStorage.authTokens`; `AuthProvider` reads `tokens`. Any browser result taken before this fix is meaningless. |

## Autonomously running the loop: which parts a terminal can do

Navigation: ⬅️ [Error Matrix](#error-matrix) | 📋 [TOC](#table-of-contents)

**Optional.** Working through [Tasks](#tasks) and [Instructions](#instructions) as written, then
the close-out, satisfies this plan's definition of done on its own. This section is the other way
to get there: hand the computable parts to a terminal and keep the rest.

Three stretches, in order. The middle one is you in a browser, and nothing after it is trustworthy
until it is done. Run every command from the repo root, `/home/molef/Work/attica`.

- [ ] **Stretch 1, autonomous: the preflight and the two edits ([task 0](#0--preflight-check-this-plan-before-working-from-it) and [task 1](#1--fix-the-two-one-line-bugs))**
  - First see what it intends to do, without letting it do anything:
    ```
    claude -p "/execute-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event/plans/01-unblock-the-truth.md,
    run only group 0 and group 1 and park everything after them"
    ```
    It prints a run sheet and stops. Confirm the sheet lists only groups 0 and 1.
  - Then let it run:
    ```
    claude -p "/execute-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event/plans/01-unblock-the-truth.md,
    run only group 0 and group 1 and park everything after them" \
      --allowedTools "Read" "Grep" "Edit" "Bash(git:*)"
    ```
  - Expected result: three edits on a branch, one commit each. Both callers of `/api/events/my/`
    corrected, the `authTokens` key corrected, and a grep confirming neither string survives.
  - The run sheet should list [task 2](#2--re-classify-the-two-unknown-bugs) as **held**, waiting on
    instruction 3.2, because that is what its `◀ Needs:` pointer says. Naming the groups in the
    prompt is belt and braces on top of that, kept until a run has been seen to hold on its own.
  - ⚠️ **If the sheet offers to run task 2, stop and do not grant permissions.** It would fire the
    browser suite against a stack nobody started, and the verdicts it produced would be worth
    nothing. Report it: the gate is not being read.
  - ❌ if it refuses task 1 as well: `/verify-plan` judged this plan's Engagement Instructions too
    thin to autorun. Fix the plan, not the flags.

- [ ] **Stretch 2, yours: see the dashboard load ([instruction 3](#3--see-the-dashboard-load))**
  - No command runs this. It needs the four processes up, a login, DevTools open, and your eyes on
    seven rows. Follow steps 3.1 to 3.3 as written.
  - The deliverable is the screenshot at `runbook/images/booking/03-seven-scenarios.png`.
  - Leave the stack running. Stretch 3 needs the backend still on `:8000`.

- [ ] **Stretch 3, autonomous: re-classify and close out ([task 2](#2--re-classify-the-two-unknown-bugs) and [the close out](#close-out--record-what-this-plan-taught))**
  - With the backend still up and `python manage.py seed_e2e` already run, resume where stretch 1
    stopped, with Playwright added to what it may run:
    ```
    claude -p "/execute-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event/plans/01-unblock-the-truth.md,
    resume at group 2 and run through the close out" \
      --allowedTools "Read" "Grep" "Edit" "Bash(npx playwright test:*)" "Bash(git:*)"
    ```
  - Expected result: the browser suite runs, and each of the two unknown bugs carries one of the
    three verdicts named in [task 2.1](#2--re-classify-the-two-unknown-bugs).
  - Task 2.1 may come back parked rather than done. Deciding why a test still fails is judgment, and
    the loop hands judgment back. A parked 2.1 with its run output attached is a correct outcome;
    carrying either bug forward with no verdict at all is not.

▶ **Back to [task 0](#0--preflight-check-this-plan-before-working-from-it)**, which stretch 1 runs for you.
