# 🧭 Read The Answer And Choose The Cache

Step 1 of 6 in this scope. Waits on `running-the-workers`, which is the parent's condition for the
whole scope. Next: [02-define-the-envelope.md](02-define-the-envelope.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to establish](#description-what-to-establish)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [one client truth](../MASTER_PLAN.md). First of six, and it must go first for two separate
reasons.

**It reads D1's answer**, and D1 decides which entities the cache is keyed on and whether the chat
components are being repaired or migrated away from. Every plan below this one is written as though
D1 were open, because it is open while they are being authored. This plan is where it stops being
open.

**It takes the cache decision**, which [04](04-build-the-one-cache.md) implements and
[05](05-one-transport-that-recovers.md) attaches a transport to. A cache chosen by being installed
first is a candidate that won on typing speed.

[02](02-define-the-envelope.md) waits on this one, because the envelope names entities and the
answer to D1 says which entities exist.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing in this scope is built. `frontend/package.json` lists no data layer at all: no TanStack
Query, no SWR, no Redux, no Zustand. The one shared store in the app is
`frontend/src/context/reactContext.jsx`, the event-creation wizard's own reducer persisted to
`localStorage` under `eventCreationStore`, which is not a cache of anything the server owns.

What has no owner is large and countable: **144 `fetch(` call sites across 40 of the 110 JavaScript
files in `frontend/src`**, and 73 files holding their own `useState`. That count and the command
that produced it are [task 2.1](#2--pin-the-count-and-record-the-before-number), and it is the
number [04](04-build-the-one-cache.md) is measured against.

**This plan takes the cache decision.** It is the one genuine decision this scope contains, it is
not pre-answered anywhere in this folder, and the reason it was left open is in
[the decisions taken here](../decisions-taken-here.md#the-cache-decision-is-left-open-rather-than-answered-here).

**Two programme decisions reach in, and this plan reads them rather than guessing them.** D1 decides
which of the four live booking representations survives, and the parent's running order answers it
before this scope starts. D2 decides when a hold starts, and it is expected to still be open, which
is fine here: it changes which events exist and not what the cache is.

**A third constrains the decision and is not this scope's.** D10, the frontend stack, belongs to
`the-design-system`, scope 12, which starts immediately and does not wait on this one. This plan
states which of its candidates a Tailwind or Material UI decision would invalidate rather than
waiting for one.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **There are two HTTP clients with no bridge between them**, per
  [the access paths](../../../../../environment/overview.md#access-paths). One goes through the Vite
  proxy on relative paths; one hardcodes `http://127.0.0.1:8000` in
  `frontend/src/utils/useAxios.js:10` and needs CORS. They fail differently and they authenticate
  differently, so a cache that owns remote state has to know which of the two a call went through.
  This is a criterion in the candidate table, not a detail for later.
- **The websocket authenticates by query parameter**, not by header, so the access token is baked
  into the socket URL at connect time. This is a constraint on
  [05](05-one-transport-that-recovers.md) rather than on this plan, and the candidate table records
  which candidates make it easier or harder to hand a fresh token to a reconnect.
- **Daphne, not `runserver`**, for anything touching websockets:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
  [the execution model](../../../../../environment/overview.md#execution-model). Nothing in this
  plan needs a socket, but the counting in [task 2.1](#2--pin-the-count-and-record-the-before-number)
  is a static search and needs nothing running at all.
- **Two backend tests already fail**, so a red `python manage.py test` does not mean this plan broke
  something. Nothing here touches the backend.

**One fact this plan needs is not written in `environment/` and must not be inferred**: whether this
repository's frontend has a unit test runner. It does not, today: `frontend/package.json` carries
`@playwright/test` and no vitest and no jest, and the only test scripts are `test:e2e`,
`test:e2e:ui` and `test:e2e:report`. [Task 3.3](#3--write-the-decision-record) records what that
means for proving a cache's apply rule, because a decision that assumes a test runner exists is a
decision that will be discovered to be wrong in [04](04-build-the-one-cache.md).

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a deciding plan, not a building plan.**

Nothing here installs a package, writes a hook or edits a component. The deliverable is a written
decision with the losers and their reasons, plus a pinned counting command and its answer.
[04](04-build-the-one-cache.md) builds whatever this plan chose. A half-migrated screen is the
strongest argument in the room for whichever library it was migrated to, and it is not an argument
about merit.

**The obvious candidate is the dangerous one.**

TanStack Query is the answer most React codebases reach for, and obvious is exactly the condition
under which a decision gets taken without its alternatives written down. Every candidate gets its
row and every loser gets its paragraph, including the ones that lose quickly.

**Read D1's answer, never assume it.**

The recommendation on the table is that the scheduling representation survives, and a
recommendation is not an answer. [Task 1.1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)
quotes what `one-booking-truth` decided from the file it decided it in. If that scope has taken no
decision, this plan stops, because the parent's running order says this scope waits and a wait that
gets skipped is a wait that was never real.

**The count is a measurement, so it needs a command rather than a number.**

[The scope's definition of done](../MASTER_PLAN.md#definition-of-done) asks for the direct-fetch
count before and after, starting from a baseline of 132 across 38 files recorded on 2026-08-23. A
plain `grep -rn "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l` answers 144 across 40
files on the same tree, so the two numbers came from two different searches and only one of them has
its search written down. [Task 2.1](#2--pin-the-count-and-record-the-before-number) pins one command
and records what it answers, and the after-number in [04](04-build-the-one-cache.md) is that same
command run again. A before and an after taken with two different rulers measure nothing.

**A candidate that a stack decision would delete is still allowed to win.**

D10 does not exist yet. The rule this plan works under is to label each candidate by what a Tailwind
or Material UI decision would do to it, not to wait for one. A candidate marked "would be redone"
can still be the right answer today, as long as the label is written where the person taking D10
will see it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**One written decision with its losers is worth more than the cache it produces**, because the cache
will be rewritten when the frontend stack is decided and the reasoning will not.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Several components each hold their own copy of the same booking. That is not a caching inefficiency,
it is a correctness defect: two copies fetched at different moments disagree, and nothing in the app
can tell which is right. No amount of protocol quality on the server fixes it, which is
[objective 1](../MASTER_PLAN.md#objectives).

The temptation is to install the library everyone installs and start migrating screens, because
migrating a screen is visible and choosing is not. That produces a cache nobody can argue with,
which sounds like agreement and is actually an absence of reasoning. When `the-design-system` asks
what the client's data layer costs in the bundle, the answer has to be a sentence somebody wrote,
not an archaeology exercise on `package.json`.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  144 FETCH CALLS, 40 FILES, NO OWNER

    booking read here ─┐
    booking read there ┼──►  four copies, correct at four different moments
    booking read again ┘                    │
                                            ▼
                            ┌────────  the cache decision  ────────┐
                            │  candidates, each labelled by what   │
                            │  a D10 stack decision would do to it │
                            └──────────────────┬───────────────────┘
                                               │  a person chooses
                    D1's answer ───────────────┤
                    (which entities)           │
                                               ▼
                              decision record  +  pinned count command
                                               │
                              04 builds exactly this, and 02 names
                              its entities from the same D1 answer
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-establish) ➡️

One piece in this scope's map is drawn from what this plan opens in.

**Subject: one fact, many copies.** The state this plan measures, and the picture whose empty framed
slot this plan's decision fills.
[Piece 1](../diagram-prompts.md#piece-1-one-fact-many-copies-planned--not-rendered).
Save as `../diagrams/subject-01-one-fact-many-copies.png`. *(image not yet generated)*

The counter chip on that piece carries the number and the file count from
[task 2.1](#2--pin-the-count-and-record-the-before-number), so the picture and the notes file say
the same thing.

## Description: what to establish

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `artifacts/notes/one-client-truth/what-owns-remote-state.md`, holding five
sections.

1. **What the two open decisions say today.** D1's answer as `one-booking-truth` recorded it, quoted
   with the file it was read from and the date. D2's state, which is expected to be open, in one
   line either way.
2. **The entities the cache is keyed on.** One list, derived from D1's answer and from nothing else.
   Each entity with the endpoint that reads it and the endpoint that changes it.
3. **The before-count, with the command that produced it.** The command, its exact output, the date,
   and the commit from `git rev-parse --short HEAD`. Both numbers: call sites and files.
4. **The candidates, with what each costs.** One row per candidate scored against the criteria in
   [task 2.2](#2--pin-the-count-and-record-the-before-number), each carrying the stack-fragility
   label from [task 2.3](#2--pin-the-count-and-record-the-before-number).
5. **The decision, and every loser with its reason.** One paragraph per losing candidate, and a
   closing paragraph naming what would have to be true for a different candidate to win.

## Purpose and goal

Navigation: ⬅️ [Description: what to establish](#description-what-to-establish) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), giving remote state one place to
live, and give [04](04-build-the-one-cache.md) something to build that is not the writer's
preference.

**Goal.** `artifacts/notes/one-client-truth/what-owns-remote-state.md` exists; D1's answer is quoted
rather than summarised; the entity list is derived from that answer; the before-count carries the
command that produced it; every candidate carries a stack-fragility label; and the chosen one is
signed and dated by a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/01-read-the-answer-and-choose-the-cache.md`

▶ **Next: [task 1.1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

### 1. 📖 Read the answers this plan is not allowed to guess

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read what `one-booking-truth` decided about D1, and quote it verbatim**
  - The scope lives at `plans/create-event-end-to-end/plans/one-booking-truth/` once it is
    decomposed. Read its master plan and its decision record.
  - Produces: one paragraph naming the surviving booking representation, quoted, with the file it
    was read from and the date.
  - Done when: the answer is quoted, not summarised. It decides which entities
    [02](02-define-the-envelope.md) names in the envelope and which
    [03](03-put-the-envelope-on-the-wire.md) adds a version field to, and a summary of a summary is
    how the wrong entity gets a migration.
  - ❌ If the scope does not exist yet or has taken no decision, write "D1 unanswered on `<date>`"
    and stop this plan. The parent's running order has this scope waiting on `running-the-workers`,
    which waits on `one-booking-truth`; if that chain is not complete, the wait is real.

- [ ] **1.2 Record D2's state, whichever it is**
  - Read `plans/create-event-end-to-end/plans/contention-and-holds/` if it exists.
  - Produces: one line, either "D2 taken on `<date>`: holds start at `<request time | acceptance>`,
    per `<file>`" or "D2 open as of `<date>`".
  - Done when: the line exists either way. D2 being open is the expected answer and it is a fact to
    record, not a blocker: the envelope is structure and the event catalogue is configuration, per
    [the decisions taken here](../decisions-taken-here.md#what-written-against-d2-being-unmade-means-concretely).

- [ ] **1.3 Derive the entity list from D1's answer**
  - Produces: one list of the entities the cache is keyed on, each with the endpoint that reads it
    and the endpoint that changes it.
  - Done when: every entity on the list traces to a sentence in D1's answer. An entity that is on
    the list because it seemed useful is the guess this plan exists to prevent.
  - ❌ If D1's answer does not settle whether a given entity survives, put it in a separate
    "unsettled" list rather than in the main one, and name what would settle it. A cache keyed on an
    entity that is about to be migrated is the expensive mistake here.

▶ **Next: [task 2.1](#2--pin-the-count-and-record-the-before-number)**, which measures the thing the
cache replaces.

### 2. 📊 Pin the count and record the before-number

◀ **Needs: [task 1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

- [ ] **2.1 Pin one counting command and run it**
  ```
  cd /home/molef/Work/attica
  grep -rn "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l
  grep -rl "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l
  find frontend/src -name '*.js' -o -name '*.jsx' | wc -l
  git rev-parse --short HEAD
  ```
  - Produces: four numbers and a commit, written into the notes file with the commands beside them.
    On 2026-08-23 that tree answered 144, 40 and 110.
  - Done when: the notes file carries the commands, not only their answers, and says in one line
    that [04](04-build-the-one-cache.md) runs these same commands for the after-number.
  - The scope's definition of done records a baseline of 132 across 38 files from a differently
    worded search. Write both down, name which one is the pinned ruler, and do not reconcile them by
    picking the number that flatters the result.

- [ ] **2.2 Write the candidate table against six criteria**
  - The criteria, in this order: does one object own each entity so two screens reading the same
    booking get the same object; can a WebSocket message patch a cached entity without a refetch;
    what does it add to the shipped bundle; can it drive both HTTP clients, the Vite-proxy one and
    the `127.0.0.1:8000` one, without a component knowing which it used; what does it cost to learn
    for someone who has never used it; and can its apply rule be tested without a browser.
  - The candidates to score, at minimum. Add any the reading turns up rather than treating this list
    as closed:
    - **TanStack Query.** The default answer. Owns fetching, caching and invalidation; patching a
      cached entity from a socket message is `setQueryData`.
    - **SWR.** Smaller, same shape, fewer escape hatches.
    - **Zustand or Redux Toolkit with a hand-written entity cache.** A store, not a fetching
      library, so the apply rule is code somebody in this repo wrote and can read.
    - **A hand-written cache with no dependency at all.** A map keyed by entity and id, a
      subscribe function, and three rules. Cheapest to ship, most to maintain.
    - **Keep `useState` and add a shared context per entity type.** The candidate that changes least,
      scored honestly rather than as a straw man.
  - Produces: one row per candidate with a plain answer in each of the six columns. Not a score out
    of ten.
  - Done when: no cell says "depends". Where a candidate genuinely cannot be judged without D10,
    write "needs the stack answer" in that cell, which is a different statement.
  - 💡 `/unpack frontend/src/components/notifications/useNotifications.js` before scoring: it holds
    the badge, the list, the socket and the 30-second poll in one file, and it is the smallest
    complete example in the repo of what each candidate would have to replace.

- [ ] **2.3 Label every candidate by what a stack decision would do to it**
  - Three labels only: `survives` (works whatever `the-design-system` decides), `reconfigured` (the
    same tool, different wiring), `redone` (thrown away and replaced).
  - Produces: one label per candidate with the sentence justifying it, and one line stating the one
    point where this scope and D10 touch, which is what ships in the bundle and not the API a
    component calls.
  - Done when: every row has a label, including the winner. The winner's label is the one thing
    `the-design-system` will want and the one thing nobody will remember to write later.

▶ **Next: [instruction 4.1](#4--take-the-cache-decision-and-sign-it)**, which is where a person
chooses.

### 3. ✍️ Write the decision record

◀ **Needs: [instruction 4](#4--take-the-cache-decision-and-sign-it)** done, so there is a decision to
record rather than a preference to justify.

- [ ] **3.1 Write `artifacts/notes/one-client-truth/what-owns-remote-state.md`**
  - Five sections, in the order given in [Description](#description-what-to-establish).
  - Open it with the date and the commit from [task 2.1](#2--pin-the-count-and-record-the-before-number).
  - Every losing candidate gets its own paragraph naming why it lost. "Not chosen" is not a reason.
  - Done when: a person who was not in the room can say what was chosen, what it beat, and what
    would have to be true for a different answer to win.

- [ ] **3.2 Write down the contract [04](04-build-the-one-cache.md) implements**
  - One section naming: the file the cache lives in, the shape of a read (what a component calls to
    get a booking), the shape of a patch (what a socket message calls to update one), and the rule
    for which of the two HTTP clients a cached read goes through.
  - Produces: the interface [05](05-one-transport-that-recovers.md) attaches a transport to.
  - Done when: it is stated plainly that a component never calls `fetch` for an entity on the list,
    and that adding an entity is an edit in one place.

- [ ] **3.3 Record what proving the apply rule will cost**
  - The fact: `frontend/package.json` has `@playwright/test` and no unit runner, and the only test
    scripts are `test:e2e`, `test:e2e:ui` and `test:e2e:report`.
  - Produces: one paragraph naming which of two routes [04](04-build-the-one-cache.md) takes:
    add a unit runner and test the apply rule as the pure function it is, or prove it through
    Playwright against a running stack.
  - The recommendation to record unless the decision-taker disagrees: **add `vitest`**, because the
    apply rule is a pure function of two version numbers, Vite is already the build tool so the
    runner needs no new configuration, and it is a development dependency that ships nothing, so it
    does not touch D10.
  - Done when: the route is named and the reason is written. This is what stops
    [04](04-build-the-one-cache.md) discovering mid-build that its proof has nowhere to run.

- [ ] **3.4 Write the grouping's card**
  - Create `artifacts/notes/one-client-truth/README.md` per `~/.claude/ARTIFACT_TREE_FORMAT.md`,
    with one entry for the decision record: what it holds, how it was established, what it lets you
    say, what it cannot say.
  - Done when: the provenance is in the card as prose, so no folder or filename has to carry it.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--write-the-decision-record)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. ⚖️ Take the cache decision and sign it

◀ **Needs: [task 2](#2--pin-the-count-and-record-the-before-number)** done, so there is a table to
read.

This is the one decision this scope contains. Nobody else takes it, and no plan in this folder
pre-answers it.

4.1 **See the problem on a real screen before reading the table**
   - Start the stack per
     [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md).
     Daphne, not `runserver`.
   - Open Chrome at `http://localhost:5173`, log in as the organizer, and open DevTools with F12.
   - Click the Network tab, then the Fetch/XHR filter, then reload the organizer dashboard.
   - Expected result: a list of requests, several of them for the same resource.
   - ✅ You can point at two rows requesting the same thing: that is the defect, on your screen,
     with a request count beside it. Write the count down.
   - ❌ Every request is distinct: write that down too, and say which screen you were on. The
     duplicate-fetch claim in this scope is drawn from the draft being fetched four times on mount
     in the event wizard, so try that screen before concluding the claim is wrong.

4.2 **Read the candidate table end to end before forming a view**
   - Open `artifacts/notes/one-client-truth/what-owns-remote-state.md`.
   - Read the bundle-cost column and the can-a-socket-patch-it column first, because those two
     remove candidates without argument.
   - ✅ At least one candidate lets a socket message patch a cached entity and can drive both HTTP
     clients: choose among those.
   - ❌ No candidate does both: that is a real finding. The answer is the least-bad candidate plus a
     written statement of what it does not do. Do not invent a candidate to escape it.

4.3 **Say the decision out loud in one sentence, then write it**
   - The sentence has this shape: "Remote state is owned by `<candidate>`, because
     `<the criterion that decided it>`, and a frontend stack decision would `<label>` it."
   - ✅ You can say it without reading the table: the decision is clear enough to build from.
   - ❌ You cannot say it in one sentence: the table is missing a criterion. Go back to
     [task 2.2](#2--pin-the-count-and-record-the-before-number) and add it rather than deciding
     around it.

4.4 **Decide the apply-rule proof route, and say which**
   - Read [task 3.3](#3--write-the-decision-record)'s recommendation and either take it or overrule
     it in one sentence.
   - ✅ You have named a route: [04](04-build-the-one-cache.md) knows where its proof runs.
   - ❌ You want to defer: that is a deferral to record with a date, not a blank. A proof with
     nowhere to run is how "proved rather than asserted" quietly becomes asserted.

4.5 **Sign and date it**
   - Write your name and the date under the decision in the notes file.
   - This is what makes it a decision rather than a proposal, and it is what
     [04](04-build-the-one-cache.md)'s first task reads.

▶ **Next: [task 3.1](#3--write-the-decision-record)**, which writes it down in full.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when someone can build the cache from the notes file without asking anybody what
> was chosen, why, or which entities it holds.

Pass:

- D1's answer is quoted from the file it was read from, with a date, and D2's state is recorded
  whichever it is.
- The entity list traces to D1's answer, and anything unsettled is in its own list with what would
  settle it.
- The before-count carries the command that produced it, and the notes say which of the two
  circulating numbers is the pinned ruler.
- Every candidate carries an answer in all six columns, a stack-fragility label, and, if it lost, a
  paragraph saying why.
- The apply-rule proof route is named.
- The decision is signed and dated by a person.

Fail, and what it means:

- The entity list contains something D1's answer does not mention. That is the failure this plan is
  most exposed to, because every plausible entity looks like it belongs in a cache.
- A decision record written before instruction 4. Then the record is the writer's preference with a
  table attached, and the table will be read as evidence for it.
- An after-number planned against a different command from the before-number. Two rulers measure
  nothing, and this is the easiest way for [04](04-build-the-one-cache.md) to report progress it did
  not make.
- D1 summarised rather than quoted.

Partial pass is acceptable on the candidate list alone. Four candidates scored honestly beats six
where two were scored from memory.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The decision record, five sections | `artifacts/notes/one-client-truth/what-owns-remote-state.md` | — | not started |
| The grouping's card | `artifacts/notes/one-client-truth/README.md` | — | not started |
| D1's answer quoted, D2's state recorded | inside the decision record | — | not started |
| The entity list the cache is keyed on | inside the decision record | — | not started |
| The pinned counting command and the before-number | inside the decision record | — | not started |
| The apply-rule proof route | inside the decision record | — | not started |
| One fact, many copies | [piece 1](../diagram-prompts.md#piece-1-one-fact-many-copies-planned--not-rendered) → `../diagrams/subject-01-one-fact-many-copies.png` | subject | ⏳ not rendered |
| Six plans, six gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-six-plans-six-gates-planned--not-rendered) → `../diagrams/process-02-six-plans-six-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/01-read-the-answer-and-choose-the-cache.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the file every candidate would replace | `/unpack frontend/src/components/notifications/useNotifications.js` | task 2.2 | The badge, the list, the socket and the poll read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md): what is true today, with a line number on every claim.
- [the decisions taken here](../decisions-taken-here.md#the-cache-decision-is-left-open-rather-than-answered-here): why this decision was left for this plan.
- [the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions): D1, D2 and D10 in their own words.
- [the access paths](../../../../../environment/overview.md#access-paths): the two HTTP clients and why a cache has to know which one a call went through.
- `frontend/src/utils/useAxios.js:10`: the hardcoded `http://127.0.0.1:8000` base.
- `frontend/src/context/reactContext.jsx`: the only shared store in the app, and not a cache of server state.
- `frontend/src/components/notifications/useNotifications.js`: the badge, the list, the socket and the 30-second poll in one file.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[02-define-the-envelope.md](02-define-the-envelope.md), which writes the shape every real-time
message carries, using the entity list this plan derived from D1's answer. It waits on this plan and
on nothing else.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is a decision taken by a person against evidence gathered by hand,
and the skills that come closest do the wrong half: `/code-audit` hunts defects with no question in
hand, `/refine-plan` edits plan text.
   also: `/context-pulse` in [06](06-prove-it-and-write-it-down.md) is where this scope's new
   vocabulary lands, so nothing here needs to define a word for the whole repository.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A websocket connects under `runserver` and no message ever arrives | The stack, whenever `runserver` is used instead of Daphne | Start Daphne per the execution model. Nothing in this plan needs a socket, but instruction 4.1 uses the running app. |
| A count that moved without the code moving | Any before-and-after measurement in this scope | Two different greps. Use the pinned command from task 2.1 for both ends of the comparison. |
