# 📖 Make the Suites Honest, and Write It All Down

Step 3 of 3, the last, in the [running order](../MASTER_PLAN.md#running-order). Waits on steps 1
and 2 ([01](01-unblock-the-truth.md), [02](02-close-the-gaps.md)) for the fixes it records.

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to write](#description-what-to-write)
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

Scope: [fixing-create-event](../MASTER_PLAN.md). Last of three, and the one that produces the thing
which outlives the fixes.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Steps 1 and 2 fixed six defects. This plan makes the two suites report honestly, then writes each
bug and its fix into the runbook, where somebody will actually meet it again.

**This is the deliverable of the whole scope.** The fixes stop the bugs happening. The runbook is
what stops the next person spending an afternoon rediscovering one.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- `python manage.py test` is the working backend suite; there is no working pytest.
- The Playwright suite needs the backend on `:8000` and `seed_e2e` run, and starts Vite itself.
- The environment file's Known gaps section currently lists gaps this scope closes. It is not
  self-updating.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A runbook recipe is read by someone mid-problem, not someone browsing.**

So each bug goes where its symptom would send a person, not into a list of bugs. Somebody whose
dashboard says "Failed to fetch data" opens the booking recipe, not a changelog. Filing it correctly
is most of the value.

**Write the symptom first, the cause second, the fix third.**

The reader has the symptom. They do not have the cause; that is what they came for. A recipe opening
with the fix makes them read backwards to find out whether it is even their problem.

**A fixed bug still belongs in the runbook.**

It is tempting to delete a bug once it is fixed. Do not. The symptom can recur from a different
cause, and "we saw this before, it was the API path" is worth more than a clean page. Mark it fixed
and date it.

**The suites are documentation too.**

A `test.fail` marker on a solved problem, or a helper that never logs in, both mislead exactly like a
wrong runbook line. Task 1 exists because leaving them is the same failure in a different file.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Both suites report green and mean it, and a person who meets any of these six symptoms finds it in
the runbook with its cause and its fix, without knowing it was ever a bug.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Six bugs were found by running things, and **none of them was recorded anywhere in the repository**
beforehand. Some had been there for months. That is the actual failure this scope addresses: not
that the bugs existed, but that finding them cost a day and left no trace anyone else could use.

Fixing them without writing them down repeats the failure.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  six fixed bugs
       │
       ├──► both suites re-run ──► green, and every marker means what it says
       │
       └──► written into the runbook, filed by SYMPTOM:
              │
              ├─ "Failed to fetch data" ────────► booking recipe
              ├─ past date / negative price ────► booking recipe
              ├─ poster vanished on reload ─────► booking recipe
              ├─ browser tests all fail ────────► tests recipe
              └─ a test.fail that now passes ───► tests recipe
                            │
                            ▼
              next person recognises it in 30 seconds
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-write) ➡️

Two pieces in the scope's map, [the illustrated map](../diagram-prompts.md), draw this plan.

**Process: from six unrecorded bugs to a runbook that remembers.** The capstone, and this plan is
its right-hand half. The six badges start loose and uncontained, and end as six entries inside a
book somebody is reading.
[Process capstone](../diagram-prompts.md#process-capstone-from-six-unrecorded-bugs-to-a-runbook-that-remembers).
Save as `../diagrams/process-capstone-bugs-to-runbook.png`. *(image not yet generated)*

**Subject: the create-event surface, with every fault marked.** The before picture this plan's work
invalidates. Its final calendar card is drawn gray, meaning the flow is not reliably reachable; when
this scope is done that card is gold, which is the capstone above.
[Subject capstone](../diagram-prompts.md#subject-capstone-the-create-event-surface-with-every-fault-marked).
Save as `../diagrams/subject-capstone-the-whole-surface.png`. *(image not yet generated)*

**Rendering these two is worth doing before task 2.** The capstone's argument, that the bugs
existing was not the failure and the bugs leaving no trace was, is this plan's own reason for
existing, and it is easier to write the runbook entries with that picture in front of you.

## Description: what to write

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Retire the stale `test.fail` marker, re-run both suites and capture the real output, then write each
of the six bugs into the runbook recipe its symptom belongs to, and correct the environment file and
the ledger so no closed gap is still listed as open.

## Purpose and goal

Navigation: ⬅️ [Description: what to write](#description-what-to-write) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Leave the project knowing what went wrong and what fixed it, in the place people read.

**Goal.** Both suites green with pasted real output in the runbook, every bug present in a recipe
with symptom, cause and fix, and no stale "known gap" left in `environment/overview.md`.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/fixing-create-event/plans/03-reconcile-suite-and-runbook.md`

▶ **Next: [task 1.1](#1--make-the-suites-honest)**.

### 1. ✅ Make the suites honest

◀ **Needs: [Close the gaps](02-close-the-gaps.md)** complete.

- [ ] **1.1 Retire the stale idempotent-publish marker**
  - `create-event.spec.ts:136`, `publishing the same draft twice does not create two events`,
    currently reports **"Expected to fail, but passed"**. The feature works: the publish action
    stores `published_event_id` in the draft and reuses it (`events/views.py:503-517`).
  - Flip `test.fail` to `test`, and delete the comment claiming
    `_upsert_event_from_draft` is not [idempotent](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub>, because it is no longer true.

- [ ] **1.2 Re-run both suites and capture the real output**
  - Backend: `python manage.py test` from `backend/main` with `/home/molef/lobola` activated.
  - Browser: with the backend up and `seed_e2e` run,
    `cd frontend && npx playwright test --reporter=list`.
  - Keep the actual output. It is what task 2.2 pastes into the runbook, and a described output is
    not an output.
  - Expected: backend 43 tests, 0 failures, 0 errors. Playwright 0 failed.

▶ **Next: [task 2.1](#2--write-every-bug-into-the-runbook)**.

### 2. 📖 Write every bug into the runbook

◀ **Needs: [task 1](#1--make-the-suites-honest)**, so what you write is what the suites now say.

This is the task the scope exists for. **File each bug by the symptom that would send someone
looking**, not in a list of bugs.

- [ ] **2.1 Add the six bugs to the right recipes**
  - Into [driving the booking flow](../../../../../runbook/driving-the-app/driving-the-booking-flow.md), in
    its Error [Matrix](../../../../../../../Obsidian/Mathematics/Linear%20Algebra/Matrix.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/linear-algebra/linear-algebra-textbook.pdf#page=39 "Linear algebra textbook, section 1.3, Matrix notation, then the row-by-column product worked on a 2 by 3 times a 3 by 4 matrix (Example 5, page 43)."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=28 "Mathematics for machine learning, section 2.2, Matrix addition and multiplication, inverse and transpose, and a system of linear equations written compactly ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/deep-learning-textbook.pdf#page=50 "Deep learning textbook, section 2.2, The matrix product, the element-wise product and its properties, as deep learning uses them."), [▶1](https://www.youtube.com/watch?v=QtAZsWseIKk&t=511s "tilestats, Matrices and matrix operations for beginners 1/2, Matrix multiplication, 8:31 to 12:27, Matrix multiplication for beginners, followed in the next ..."), [▶2](https://www.youtube.com/watch?v=kYB8IZa5AuE&t=212s "3Blue1Brown, Linear transformations and matrices (Essence of linear algebra, chapter 3), Basis vectors and matrices, 3:32 to 6:18, A matrix read as where the..."), [◆](../../../../../../../goal-setting/learning/deep-learning/transformers/textbook/03-multiply-two-matrices-row-by-column.md "Multiply two matrices row by column and say why the order matters, deep-learning/transformers, chapter 03. The same two matrices multiplied in both orders, t...")</sub> and in the affected recipes:
    - "Failed to fetch data" on `/dashboard/organizer` → the frontend asked `/api/events/my/`; the
      backend registers `my-events/`. Two callers. Fixed `<date>`.
    - A past-dated event publishes without complaint → no server-side check. Fixed `<date>`.
    - A negative `base_price` is accepted → no range check. Fixed `<date>`.
    - An uploaded poster disappears on reload → say which half was wrong, the save or the
      serializer. Fixed `<date>`.
    - Another organizer's draft returns a different status from each of two paths → say which status
      was chosen and **why**, per task 2.2 of step 2.
  - Into [running the tests](../../../../../runbook/running-the-web-app/running-the-tests.md):
    - Every browser test failing while the page sits on `/login` → the helper wrote
      `localStorage.authTokens`; `AuthProvider` reads `tokens`. Fixed `<date>`.
    - A `test.fail` reporting "Expected to fail, but passed" → the invariant now holds and the
      marker is stale. That recipe already explains how to read this; add the idempotent-publish
      case as the worked example, since it actually happened.
  - Each entry carries **symptom first, cause second, fix third**, and is dated.

- [ ] **2.2 Update the recipes' real output and freshness marks**
  - `running-the-tests.md` currently pastes a red run: 43 tests, 1 failure, 1 error. Replace it with
    the green output from task 1.2 and re-mark the recipe `ran <date>`.
  - `driving-the-booking-flow.md` recipe 3 currently opens with a warning that it **cannot be
    completed** because the dashboard is broken. Remove the block, restore the seven-scenario check
    as the ✅ path, and embed the screenshot taken in step 1's instruction 3.2.

- [ ] **2.3 Correct the environment file and the ledger**
  - [The environment overview](../../../../../environment/overview.md): the Known gaps section lists the red test suite and
    the two failing tests. Rewrite to the current state. Add or update the Provenance rows with the
    date and how each was established.
  - [The retrofit ledger](../../../../../RETROFIT.md): its Outstanding list names the `/api/events/my/` mismatch.
    Move it to a resolved entry rather than deleting it; that file is the one place history belongs.

▶ **Next: [instruction 3.1](#3--read-it-as-someone-who-was-not-here)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--read-it-as-someone-who-was-not-here)**.

- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event`
  - This is the last plan in the scope, so if every plan comes back done, also run
    `/recap-plan-tree @plans/create-event-end-to-end/plans/fixing-create-event/MASTER_PLAN.md`.
- [ ] **Run the following prompt:** `/runbook-pulse @/home/molef/Work/attica`
  - The default audit, to confirm every new entry has its freshness mark and every write recipe kept
    its guard.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself. Only a person can judge whether the writing works.

### 3. 👁️ Read it as someone who was not here

◀ **Needs: [task 2](#2--write-every-bug-into-the-runbook)**.

3.1 **Take each symptom and try to find it**
   - Open [the runbook index](../../../../../runbook/00-INDEX.md) and, for each of these, find the
     answer using only the index's questions. Do not use search.
     - "The dashboard says Failed to fetch data."
     - "My poster disappeared after I reloaded."
     - "Every browser test is failing and I changed nothing."
   - Expected result: each takes under thirty seconds and lands on the right recipe.
   - ✅ all three found. ❌ any one needs search, the index question is written in the author's words
     rather than the reader's. Rewrite that row.

3.2 **Check the reason behind the [status-code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> decision survived**
   - Find the 403-versus-404 entry.
   - Expected result: it says which was chosen **and why**, in a sentence someone could disagree
     with.
   - ✅ the reason is there. ❌ only the number is recorded: the next person will change it back,
     because a bare status code reads like an accident.

3.3 **Confirm the fixed bugs are still visible**
   - Expected result: every bug is still in the runbook, marked fixed with a date, not deleted.
   - ✅ all six present. ❌ any were removed for tidiness: restore them. A symptom can recur from a
     new cause, and the old entry is what makes that recognisable.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

Done is instruction 3.1 passing: three symptoms, three lookups, under thirty seconds each, no search.

Green suites are necessary and are not the gate. The gate is whether the runbook answers "I have
seen this before, what was it" for a person who was not here when it was found.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Idempotent-publish marker retired | `frontend/tests/e2e/create-event.spec.ts:136` | not started |
| Green backend output, pasted | `runbook/running-the-web-app/running-the-tests.md` | not started |
| Green Playwright output, pasted | `runbook/running-the-web-app/running-the-tests.md` | not started |
| Five bugs written into the booking recipe | `runbook/driving-the-app/driving-the-booking-flow.md` | not started |
| Two bugs written into the tests recipe | `runbook/running-the-web-app/running-the-tests.md` | not started |
| The seven-scenarios screenshot embedded | `runbook/images/booking/03-seven-scenarios.png` | slot open, taken in step 1 |
| Known gaps corrected | `environment/overview.md` | not started |
| Outstanding list corrected | `RETROFIT.md` | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Four documents carry overlapping claims about these bugs and none updates another: the runbook, the
environment file, the retrofit ledger, and the test files themselves.

The order that keeps them consistent is the task order above: make the suites true first, then write
what they now say into the runbook, then correct the two documents that quote the old state. Doing
it the other way round means writing down a result you have not seen.

**`RETROFIT.md` is a ledger, so entries there are corrected by adding, never by deleting.**

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The runbook index](../../../../../runbook/00-INDEX.md): the index whose questions instruction
  3.1 tests.
- [Driving the booking flow](../../../../../runbook/driving-the-app/driving-the-booking-flow.md) and
  [Running the tests](../../../../../runbook/running-the-web-app/running-the-tests.md): the two recipes
  this plan writes into.
- [The environment overview](../../../../../environment/overview.md): Known gaps and Provenance, both needing
  correction.
- [The retrofit ledger](../../../../../RETROFIT.md): where these bugs were first recorded, with the
  commands and output that found them.
- `~/.claude/RUNBOOK_FORMAT.md`: the shape a recipe takes, and the rule that a described output is
  not an output.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

Nothing in this scope. When this plan is done, every plan in it is done, and the close-out in the close out
applies.

The natural follow-on is outside this scope: the twelve runbook recipes still marked `unverified`,
most of them browser walkthroughs. `runbook-pulse --capture` after a real session is the cheapest way
to upgrade them.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A `test.fail` test reports "Expected to fail, but passed" | `create-event.spec.ts:136` | The invariant now holds and nobody flipped the marker. Good news that reads as bad news; flip it in the change that fixed the feature. |
| A runbook recipe pastes output from a run that is no longer current | `running-the-tests.md`, holding a red suite | Re-run and re-paste. A recipe's freshness mark is only meaningful if its output came from that run. |
| A closed gap is still listed as open in the environment file | `environment/overview.md` Known gaps | Nothing updates it automatically. Correcting it is a task in the plan that closes the gap, which is task 2.3 here. |
