# Create Event End To End

## Do this next

Two blockers, and they can run at the same time. Open
[Unblock the truth](plans/fixing-create-event/plans/01-unblock-the-truth.md), which makes the
browser suite tell the truth, or run `populate-plans` on
[getting-in](plans/getting-in/MASTER_PLAN.md), which makes the other three roles reachable.

The remaining nine sub-scopes are named below and not yet decomposed.

## Running order

Every plan in this scope, across all levels, in the order they get done. Plan numbering is
per-folder and is **not** the running order. `sync-plan-tree` recomputes this table.

| # | Plan | What it does | Status | Waits on |
|---|---|---|---|---|
| 1 | [Unblock the truth](plans/fixing-create-event/plans/01-unblock-the-truth.md) | Fix the wrong API path and the wrong storage key, then re-classify the two unknown bugs | ⚠️ not started | nothing |
| 2 | [Close the gaps](plans/fixing-create-event/plans/02-close-the-gaps.md) | Past-date validation, negative price, asset persistence, and the 404-versus-403 disagreement | ⚠️ not started | 1 |
| 3 | [Make the suites honest](plans/fixing-create-event/plans/03-reconcile-suite-and-runbook.md) | Retire the stale marker, re-run both suites, and write every bug and its fix into the runbook | ⚠️ not started | 1, 2 |
| 4 | [Settle what a role is](plans/getting-in/plans/01-settle-what-a-role-is.md) | Decide which of the two classifications decides what a user may see | ⚠️ not started | nothing |
| 5 | [Grant every role](plans/getting-in/plans/02-grant-every-role.md) | Seeds grant the three ungranted roles and give the nine marketplace users theirs | ⚠️ not started | 4 |
| 6 | [Prove it and write it down](plans/getting-in/plans/03-prove-it-and-write-it-down.md) | Five logins, five screenshots, the runbook pair, the verified credentials table | ⚠️ not started | 5 |
| 7 | [the-system-in-layers](plans/the-system-in-layers/MASTER_PLAN.md) | Plans not authored yet. The layers map for `environment/`, the four diagrams the reviews ask for, and the four already written as briefs in `onboarding-docs` | ⚠️ not started | nothing |

Steps 1, 4 and 7 all wait on nothing and can run at the same time. Everything in the domain plane
waits on step 3 and step 6, the two blockers finishing.

Step 7 is one row for a whole sub-scope because its plan files do not exist yet. It sits last in
the table only for that reason, not because anything gates it. `populate-plans` replaces the row
with the real plans and interleaves them where they belong.

---

## Mission

Attica's create-event path works end to end for every role, and every claim about it is backed by
something someone ran or saw.

Today it works for one role on a happy path. Most of what is wrong is invisible until you drive it,
and a substantial amount of what is right is built and inert: eleven scheduling commands that nothing
runs, and a notification channel wired at one end only.

---

## Objectives

1. **Make evidence and access real before anything else.** A browser suite that runs logged out, and
   three gated roles nobody can become, mean no claim in this scope is checkable.
2. **Settle the domain.** One booking truth, one state machine, contention resolved where the policy
   says it should be, and the execution tier actually running.
3. **Make it fast by design rather than by tuning.** Reads shaped like screens, query budgets checked
   in development, and caching that never answers a question it must not.
4. **Make it feel like one thing.** One client-side truth, one workspace, one design system.
5. **Spend on infrastructure only where a problem named it.**

---

## Goals

1. Five roles log in and reach their own dashboards, with credentials verified in one table.
2. `python manage.py test` and `npx playwright test` both report zero failures.
3. One booking representation remains; the other three are migrated or removed.
4. Two simultaneous requests on the same resource and window resolve identically every time, proved
   by a concurrent test on a database that locks.
5. Every scheduled command has a runner, and a state change reaches a waiting screen without a
   refresh.
6. A dashboard loads in one call, under ten queries.
7. A refresh mid-wizard loses nothing, from any entry point.

---

## Expected Outcome

An organizer can request nine providers across three resource types, converse with them, and watch
the event converge and publish. A provider can receive, answer, counter and cancel. Nobody refreshes
a page, and nothing contradicts itself.

---

## Definition of Done

- [ ] Every plan in all twelve sub-scopes is ✅
- [ ] ⚠️ The two-browser test passed by hand: request, accept, pay, confirm, cancel, with no refresh
      and no contradictory state at any point `[owner: human]`
- [ ] ⚠️ The full convergence walk performed by one person playing every role, nine requests across
      three resource types `[owner: human]`
- [ ] ⚠️ Refresh-is-boring checked at three points in the journey: after a request, after payment,
      after a cancellation `[owner: human]`
- [ ] The nine architecture tests pass, including competing requests and a worker crash after commit
- [ ] Every sub-scope carries its runbook pair: how to walk it by hand, how to prove it works
- [ ] Every sub-scope has run the pulse for each folder it changed, and each names which it owes in
      [the scopes](../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md): `env-pulse` when it
      adds a process or moves an access path, `context-pulse` when it introduces a word nobody has
      defined, `runbook-pulse` with `drip-runbook` when it adds something a person operates by hand
- [ ] `environment/overview.md`'s Known gaps section lists nothing this scope closed
- [ ] The scope has a recall gallery: run
      `/recap-plan-tree @plans/create-event-end-to-end/MASTER_PLAN.md` once every plan above is ✅,
      and record the Artifact URL it publishes

---

## Sub-Scopes

Twelve, arranged as three planes over a build order that goes by risk rather than by dependency
between symptoms. The structure, with every item marked decide, build, wire up or fix, is in
[the scopes](../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md).

| # | Sub-scope | Plane | Waits on |
|---|---|---|---|
| 1 | [fixing-create-event](plans/fixing-create-event/MASTER_PLAN.md) | blocker | nothing |
| 2 | [getting-in](plans/getting-in/MASTER_PLAN.md) | blocker | nothing |
| 3 | [the-system-in-layers](plans/the-system-in-layers/MASTER_PLAN.md) | cross | nothing |
| 4 | `one-booking-truth` | domain | 1, 2 |
| 5 | `contention-and-holds` | domain | 4 |
| 6 | `running-the-workers` | domain | 4 |
| 7 | `availability-that-is-true` | domain | 5, 6 |
| 8 | `the-booking-journey` | domain | 5, 6 |
| 9 | `performance-architecture` | performance | 7, 8 |
| 10 | `one-client-truth` | experience | 6 |
| 11 | `the-event-workspace` | experience | 8, 10 |
| 12 | `the-design-system` | experience | 2 |
| 13 | `getting-it-out` | cross | 4 |

Scopes 1, 2, 3 and 12 start immediately. After 8 lands, the performance and experience planes run in
parallel.

`fixing-create-event` is the only sub-scope with plan files. `getting-in` and
`the-system-in-layers` each have a master plan and an empty `plans/`. The other nine are named here
and not yet decomposed.

---

## Plans

(none yet — this scope's own plan files are authored by `populate-plans` after the sub-scopes are
decomposed)

---

## Environment Context

Environment and architecture facts live in [the environment index](../../environment/00-INDEX.md),
maintained by `env-pulse`. Read [the overview](../../environment/overview.md) before running
anything: it says which four processes must be started by hand, which Python environment the app runs
from, and which test suite actually works.

Where a fact this scope needs is not written there, stop and ask rather than inferring it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../runbook/00-INDEX.md). Bringing the stack up,
seeding, and running the suites are recipes there; this scope links them rather than restating them.

This scope also writes back, and to three folders rather than one. Every sub-scope owes a runbook
pair, and owes `environment/` a fact whenever it adds a process or moves an access path, and
`context/` an entry whenever it introduces a word nobody has defined. Those are the deliverables that
outlive the code.

---

## Context

What Attica means in the real world lives in [the context index](../../context/00-INDEX.md). Three
entries matter most here: [availability](../../context/world/availability.md),
[booking-request](../../context/world/booking-request.md) and
[event-draft](../../context/world/event-draft.md).

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the art
direction of the existing eleven-piece flow map so the whole set reads as one.

---

## Source Documents

Three files in [the planning walk](../../ideas/enhancing-create-event-end-to-end/) hold the work
behind this scope. [What we are building](../../ideas/enhancing-create-event-end-to-end/WHAT-WE-ARE-BUILDING.md)
is the specification. [Where we landed](../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md)
is the state of the world and the ten open decisions. [The scopes](../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
is the structure this table came from.
