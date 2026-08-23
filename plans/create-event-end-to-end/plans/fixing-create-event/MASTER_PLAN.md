# MASTER_PLAN.md: fixing create-event

## Do this next

Open [Unblock the truth](plans/01-unblock-the-truth.md), step 1 of 3. Two of the bugs
in this scope are one-line fixes, and until they are made, two other bugs cannot be classified at
all: the browser test harness never logs in, so every browser-level result is meaningless.

## Running order

This is a sub-scope. One ordering spans the whole tree, and it lives in the parent's
[running order](../../MASTER_PLAN.md#running-order), where this scope is row 1 and everything else
waits on it.

Within this scope the three plans go in order: [unblock the truth](plans/01-unblock-the-truth.md),
then [close the gaps](plans/02-close-the-gaps.md), then
[make the suites honest](plans/03-reconcile-suite-and-runbook.md).

---

## Environment Context

Environment and architecture facts live in [the environment overview](../../../../environment/overview.md), maintained
by `env-pulse`. Read it before running anything: it says which four processes must be started by
hand, which Python environment the app runs from, and which test suite actually works.

Where a fact this scope needs is not in that file, stop and ask rather than inferring it.

---

## Runbook

The by-hand recipes live in [the runbook](../../../../runbook/), starting at
[the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack up, seeding, and running
the suites are all recipes there; this scope does not restate them, it links them.

This scope also **writes back** to the runbook. That is step 3, and it is the deliverable that
outlives the fixes.

---

## Context

What Attica means in the real world lives in [the context folder](../../../../context/). Two entries matter
here: [what an event draft is](../../../../context/world/event-draft.md), because several of these bugs are about
what publish does to a draft, and [what an organizer is](../../../../context/world/organizer.md), because the
403-versus-404 question is about what an organizer may see.

---

## Mission

Fix the six confirmed bugs in Attica's event-creation flow, resolve the two that cannot currently be
classified, and leave the runbook carrying each bug beside its fix, so the next person who hits one
of these recognises it instead of rediscovering it.

---

## Objectives

1. **Make the evidence trustworthy first.** Two bugs are one-line fixes that unblock knowing the
   truth about two others. Nothing else is worth doing until they are made.
2. **Close the validation and persistence gaps** in the wizard, each proved by a test flipping from
   expected-fail to passing.
3. **Make the test suites tell the truth.** A suite reporting a solved problem as broken, or hiding
   a real problem behind a broken helper, is worse than no suite.
4. **Write the record where it will be found.** Each bug and its fix goes into the runbook recipe a
   person is already reading when they hit it, not into a changelog nobody opens.

---

## Goals

1. `python manage.py test` reports 43 tests with **0 failures and 0 errors**.
2. `npx playwright test` reports **0 failed**, with every `test.fail` marker either flipped to
   `test` because the invariant now holds, or still expected-failing for a reason written down.
3. The organizer dashboard at `/dashboard/organizer` loads and shows the seven seeded scenarios.
4. Every bug in this scope appears in a runbook recipe with its symptom, its cause and its fix.
5. `environment/overview.md`'s Known gaps section no longer lists any gap this scope closed.

---

## Expected Outcome

An organizer can create an event without hitting any of these six defects, the two suites agree with
reality, and `runbook/` answers "I have seen this before, what was it" for each one.

The fixes are small: two are one-line path corrections, two are validation guards, one is a
persistence bug, one is a status code. The value is not in their size, it is that nothing currently
records them and each one costs an afternoon to rediscover.

---

## Definition of Done

1. ⚠️ The organizer dashboard loads: `/api/events/my/` no longer 404s from any caller.
2. ⚠️ The e2e browser tests actually authenticate, and the happy-path test passes.
3. ⚠️ The two previously-unclassifiable bugs (autosave, unsaved-changes guard) have a verdict:
   fixed, confirmed broken with a written reason, or found never to have been broken.
4. ⚠️ Publishing a past-dated event is rejected.
5. ⚠️ A negative `base_price` is rejected.
6. ⚠️ An uploaded asset persists to its draft and comes back in the draft's `assets` list.
7. ⚠️ Reading another organizer's draft returns the same status code as trying to publish it, and
   the choice between 403 and 404 is written down somewhere.
8. ⚠️ The idempotent-publish test is marked `test`, not `test.fail`.
9. ⚠️ Both suites green, per goals 1 and 2.
10. ⚠️ Manual checkpoint: the runbook has a recipe covering each bug, and a person who has never
    seen the bug can recognise it from the symptom written there.
11. ⚠️ `environment/overview.md` and `RETROFIT.md` updated so no closed gap is still listed as open.

---

## Diagram Prompts

The scope's illustrated map is [the illustrated map](diagram-prompts.md): six prompts, none rendered
yet. Three subject pieces draw the create-event surface and where the six defects sit; three process
pieces draw the three plans and what each gate proves.

Its art direction is Vivid circuit, and it says in its own opening why that differs from the context
folder's map. Rendered images land in `diagrams/`.

---

## Sub-Scopes

None. This scope is small enough to hold three plans directly.

---

## Plans

- ⚠️ [Unblock the truth](plans/01-unblock-the-truth.md)
- ⚠️ [Close the gaps](plans/02-close-the-gaps.md)
- ⚠️ [Make the suites honest](plans/03-reconcile-suite-and-runbook.md)

---

## Where these bugs came from

Every one was found on 2026-08-22 and 2026-08-23 by running things rather than reading them: the
Django suite, the Playwright suite, and a browser driven through the organizer flow. None was
recorded anywhere in the repository beforehand.

The full evidence, with commands and output, is in [the retrofit ledger](../../../../RETROFIT.md) under the
verification passes.
