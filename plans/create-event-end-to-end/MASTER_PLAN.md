# Create Event End To End

## Do this next

Two blockers, and they can run at the same time. Open
[Unblock the truth](plans/fixing-create-event/plans/01-unblock-the-truth.md), which makes the
browser suite tell the truth, or [Settle what a role is](plans/getting-in/plans/01-settle-what-a-role-is.md),
which starts making the other three roles reachable.

A third thing is startable now and waits on neither:
[Read the system before drawing it](plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md),
which establishes what the code actually does. It is worth starting early because three of the
pictures it leads to are the evidence the first three open decisions get taken on.

A fourth is planned and waiting rather than startable:
[running-the-workers](plans/running-the-workers/MASTER_PLAN.md) has its master plan and its five
plan files, but the work itself waits on `one-booking-truth`.

A fifth, [one-client-truth](plans/one-client-truth/MASTER_PLAN.md), has its master plan and its six
plan files. The work itself waits on `running-the-workers`.

A sixth, [the-design-system](plans/the-design-system/MASTER_PLAN.md), has its master plan and its
seven plan files, and four of the seven are startable the moment `getting-in` lands: they are
counting, deciding, and writing named values into a config file, and they need only the Vite dev
server. Its later three drive real screens as real roles, which is why the scope waits on step 6.

A seventh, [getting-it-out](plans/getting-it-out/MASTER_PLAN.md), has its master plan and no plan
files yet. Its row in the running order says it waits on `one-booking-truth`; its own text says the
deployment decision is worth taking before that. Both are kept, because the decision needs no answer
to D1. What it does need is an answer nothing in this repository holds: where a deployed Attica would
run. That is a question for a person and it is the first thing the scope's first plan has to ask.

The remaining five sub-scopes are named below and not yet decomposed.

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
| 7 | [Read the system before drawing it](plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md) | Establish what a booking is, what happens under contention, what reaches a screen, and whether convergence exists, with a `path:line` on every claim | ⚠️ not started | nothing |
| 8 | [Draw the layers map](plans/the-system-in-layers/plans/02-draw-the-layers-map.md) | Give `environment/` its first pictures: the folder's map, the layers prompt, and the slot in `overview.md` | ⚠️ not started | 7 |
| 9 | [Brief the other eight](plans/the-system-in-layers/plans/03-brief-the-other-eight.md) | The four the reviews ask for, the four already briefed in `onboarding-docs`, and a failure beside every one | ⚠️ not started | 7, 8 |
| 10 | [Render it, check it, and write down how](plans/the-system-in-layers/plans/04-render-check-and-write-it-down.md) | Every prompt in the scope rendered, each read back against its note before filing, and the two recipes for doing it again | ⚠️ not started | 8, 9 |
| 11 | [Take the execution decision](plans/running-the-workers/plans/01-take-the-execution-decision.md) | Settle D7: what runs the recurring work, with the candidates that lost and the reason each lost | ⚠️ not started | `one-booking-truth` |
| 12 | [Make the commands honest](plans/running-the-workers/plans/02-make-the-commands-honest.md) | Resolve the two scheduling commands that lie about what they do, before anything goes on a clock | ⚠️ not started | `one-booking-truth` |
| 13 | [Build the runner](plans/running-the-workers/plans/03-build-the-runner.md) | Every non-seed scheduling command on the runner, with a log that answers "is it moving" | ⚠️ not started | 11, 12 |
| 14 | [Close the two silent losses](plans/running-the-workers/plans/04-close-the-two-silent-losses.md) | The reaper for stranded `processing` rows, and one notification path that pushes as well as persists | ⚠️ not started | 13 |
| 15 | [Prove it and write it down](plans/running-the-workers/plans/05-prove-it-and-write-it-down.md) | The two runbook questions nothing answers, and the two environment facts this scope made false | ⚠️ not started | 14 |
| 16 | [Read the answer and choose the cache](plans/one-client-truth/plans/01-read-the-answer-and-choose-the-cache.md) | Quote what `one-booking-truth` decided, pin the counting command, and take the cache decision with the candidates that lost | ⚠️ not started | 15 |
| 17 | [Define the envelope](plans/one-client-truth/plans/02-define-the-envelope.md) | The shape every real-time message carries, the apply rule, and the event catalogue as a list a person edits | ⚠️ not started | 16 |
| 18 | [Put the envelope on the wire](plans/one-client-truth/plans/03-put-the-envelope-on-the-wire.md) | Resolve the two version bumps that cannot be read back, and make three push sites send the envelope after commit | ⚠️ not started | 17 |
| 19 | [Build the one cache](plans/one-client-truth/plans/04-build-the-one-cache.md) | One cache the reads go through, the apply rule as a tested pure function, and the badge derived from the list | ⚠️ not started | 17 |
| 20 | [One transport that recovers](plans/one-client-truth/plans/05-one-transport-that-recovers.md) | One socket, one reconnect policy, a fresh token per connect, and a reconnect that refetches | ⚠️ not started | 18, 19 |
| 21 | [Prove it and write it down](plans/one-client-truth/plans/06-prove-it-and-write-it-down.md) | The duplicate, gap and refresh tests by hand, the two runbook recipes, and the word this scope introduced | ⚠️ not started | 20 |
| 22 | [Measure it and take the stack decision](plans/the-design-system/plans/01-measure-it-and-take-the-stack-decision.md) | Pin eight counting commands, take the frontend stack decision with the candidates that lost | ⚠️ not started | 6 |
| 23 | [Name the colours and the spacing](plans/the-design-system/plans/02-name-the-colours-and-the-spacing.md) | Colour, spacing, radius and elevation as named tokens in one file, with every counted value mapped onto one | ⚠️ not started | 22 |
| 24 | [Give type its roles](plans/the-design-system/plans/03-give-type-its-roles.md) | Eleven sizes and six weights become a handful of named roles, each saying what it is for | ⚠️ not started | 22 |
| 25 | [Say what moves and what does not](plans/the-design-system/plans/04-say-what-moves-and-what-does-not.md) | Duration bands, the rule for which motion system to use, the list of what does not animate, one reduced-motion rule | ⚠️ not started | 22 |
| 26 | [The components that own the styles](plans/the-design-system/plans/05-the-components-that-own-the-styles.md) | The button, the one card skeleton replacing four, and explicit status text for actions in flight | ⚠️ not started | 23, 24, 25 |
| 27 | [Cards that answer to their container](plans/the-design-system/plans/06-cards-that-answer-to-their-container.md) | Container queries where the space decides, breakpoints where the viewport does, and mobile as its own layout | ⚠️ not started | 26 |
| 28 | [Prove it and write it down](plans/the-design-system/plans/07-prove-it-and-write-it-down.md) | The check that catches an invented style, the five dead class names, and the runbook pair that does not exist | ⚠️ not started | 27 |
| 29 | [getting-it-out](plans/getting-it-out/MASTER_PLAN.md) | Take the deployment decision, build what it chooses, and make one machine reproducible enough that a second one is a copy rather than an archaeology exercise | ⚠️ plans not authored yet | `one-booking-truth` |

Steps 1, 4 and 7 all wait on nothing and can run at the same time. Everything in the domain plane
waits on step 3 and step 6, the two blockers finishing.

Steps 11 to 15 are `running-the-workers`, and the two cells naming `one-booking-truth` in words
rather than by step number do so because that scope is not decomposed yet, so there is no number to
point at. Steps 11 and 12 wait on it and on each other for nothing, so they run at the same time.
Two undecomposed domain scopes, `one-booking-truth` and `contention-and-holds`, sit between step 10
and step 11 in the sub-scope order below and contribute no rows here yet.

Steps 16 to 21 are `one-client-truth`. They sit directly after step 15 because that scope waits on
`running-the-workers` and on nothing else; the three undecomposed domain scopes between them in the
sub-scope order will push them down when they are decomposed. Steps 18 and 19 are the server half and
the client half of one contract, so they wait on step 17 and not on each other, and they run at the
same time.

Steps 22 to 28 are `the-design-system`, and their position in this table is the one place where the
number is an identifier rather than a claim about when. That scope waits on step 6 and on nothing
else, so its plans can run alongside anything from step 7 onward, and steps 23, 24 and 25 wait on
step 22 and not on each other. They sit at the bottom because inserting them at step 7 would
renumber every row from 7 to 21, and those numbers are written into eleven existing plan files and
one diagram map. The `Waits on` column carries the dependency; the reasoning is in
[that scope's decisions](plans/the-design-system/decisions-taken-here.md#the-rows-are-appended-to-the-parents-running-order-as-22-to-28-not-inserted-at-7).

Step 29 is a placeholder for a whole sub-scope rather than a plan. It is one row because
`getting-it-out` has a master plan and no plan files yet; `populate-plans` replaces this row with its
real plans, interleaved at the step numbers they belong at. Its "Waits on" cell names
`one-booking-truth` in words because that scope is not decomposed, so there is no step number to
point at. It sits at the bottom for the same reason steps 22 to 28 do: its true position is directly
after the `one-booking-truth` rows that do not exist yet, and inserting it there would renumber every
row above it. That scope's own text says the deployment decision is worth taking earlier than this
row implies, and the `Waits on` column rather than the number carries what actually gates it.

Steps 7 to 10 are grouped after the two blockers in this table rather than interleaved through them,
because nothing in either direction gates the other: the layers scope needs no login and no green
suite, and no blocker needs a diagram. Three of its outputs are the evidence D1, D2 and D3 get
decided on, so running it early is worth more than running it in order.

---

## Mission

Attica's create-event path works end to end for every role, and every claim about it is backed by
something someone ran or saw.

Today it works for one role on a happy path. Most of what is wrong is invisible until you drive it,
and a substantial amount of what is right is built and inert: ten scheduling commands that nothing
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
| 6 | [running-the-workers](plans/running-the-workers/MASTER_PLAN.md) | domain | 4 |
| 7 | `availability-that-is-true` | domain | 5, 6 |
| 8 | `the-booking-journey` | domain | 5, 6 |
| 9 | `performance-architecture` | performance | 7, 8 |
| 10 | [one-client-truth](plans/one-client-truth/MASTER_PLAN.md) | experience | 6 |
| 11 | `the-event-workspace` | experience | 8, 10 |
| 12 | [the-design-system](plans/the-design-system/MASTER_PLAN.md) | experience | 2 |
| 13 | [getting-it-out](plans/getting-it-out/MASTER_PLAN.md) | cross | 4 |

Scopes 1, 2, 3 and 12 start immediately. After 8 lands, the performance and experience planes run in
parallel.

`fixing-create-event`, `getting-in`, `the-system-in-layers`, `running-the-workers`,
`one-client-truth` and `the-design-system` have plan files. `getting-it-out` has a master plan and no
plan files yet. The other five are named here and not yet decomposed.

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
