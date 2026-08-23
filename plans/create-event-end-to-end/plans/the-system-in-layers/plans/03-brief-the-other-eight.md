# ✍️ Brief The Other Eight

Step 3 of 4 in this scope. Waits on [01](01-read-the-system-before-drawing-it.md) and
[02](02-draw-the-layers-map.md).
Next: [04-render-check-and-write-it-down.md](04-render-check-and-write-it-down.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to build](#description-what-to-build)
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

Scope: [the-system-in-layers](../MASTER_PLAN.md). Third of four, and the largest. It waits on
[01](01-read-the-system-before-drawing-it.md) for its facts and on
[02](02-draw-the-layers-map.md) for the art direction written into `environment/`.
[04](04-render-check-and-write-it-down.md) renders everything this plan writes.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The findings file exists and the layers map is briefed. Eight diagrams remain, and they are not all
the same kind of thing.

**Four already have briefs.** WebSocket authentication, REST versus WebSocket, JWT refresh, and the
event wizard state machine are written out in full in
[the onboarding architecture-diagrams plan](../../../../onboarding-docs/plans/04-architecture-diagrams.md),
with three factual corrections already applied to them there. Nobody has rendered them. This plan
takes ownership rather than rewriting them.

**Three cannot be drawn as the target state**, because nobody has decided what the target is. They
are drawn as-is instead, per
[the rule this scope works under](../MASTER_PLAN.md#what-this-scope-may-draw-while-d1-and-d2-are-open).

**One is a straight as-built drawing.** The real-time delivery path is not waiting on any decision;
it is waiting on someone tracing it, which [01](01-read-the-system-before-drawing-it.md) did.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md) and from
[01](01-read-the-system-before-drawing-it.md)'s findings file, which is the authority for anything
about the booking path.

- **Websockets authenticate by `?token=<jwt>` query parameter**, through
  `WebSocketJWTAuthMiddleware`, not by an `Authorization` header. Diagram 5 is about this and
  getting it backwards makes the diagram useless.
- **`ROTATE_REFRESH_TOKENS` is off**, so the same refresh token serves for its full lifetime and is
  not replaced on each use. Diagram 7 has to say so.
- **Tokens live in `localStorage` under the single key `tokens`**, holding `{access, refresh}`. One
  key, not two.
- **Redis carries the channel layer**, so the broadcast half of diagram 6 does not happen at all
  when Redis is down.
- **`select_for_update` does not lock on SQLite.** The contention diagram draws the guard and must
  not draw it holding.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Three diagrams are hostage to decisions nobody has taken, and the answer is to draw today, dated.**

The booking state machine is hostage to D1, the contention sequence to D2, and event convergence to
D3. Drawing a guess would put a picture of a system that does not exist in front of a reader who
believes pictures. Waiting would strand a scope that waits on nothing.

So each of the three draws what the code does on the day it is drawn, carries that date and the
commit hash, and names the scope that owes the target version. Four state machines get drawn as four.
That is not a compromise: four machines side by side, with their state counts and their reference
counts, is the single most useful artefact D1 could have.

**Four briefs already exist and are better than anything written from scratch here.**

They were checked against the code and three of them were corrected in the process: the draft is not
deleted on publish, the endpoint is `event-drafts` and not `drafts`, and the wizard has eight steps
and not five. Rewriting them would lose those corrections and probably reintroduce them.

Take them as they are. The one thing to add is what this scope adds to everything: a failure drawn
beside the happy path.

**A failure diagram is not a diagram of an error message.**

The question it answers is what the system does when the step does not happen: what the user sees,
what state is left behind, and who finds out. "Redis is down during a booking approval" is a failure
diagram. "A 500 page" is not.

**The scope of "every happy path" is these eight and no others.**

Not the eleven storyboard steps of the flow map, which lives in a learning tree this repository reads
and never writes to.

**Say per diagram whether the failure is a branch or its own page.**

A branch keeps the two readings together and is right when the failure is one fork. Its own page is
right when the failure has its own sequence. Either is fine; leaving the choice unstated is not,
because then nobody can tell whether a missing page is a decision or an omission.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Eight briefs, each true on a named date against a named commit, and none of them pretending to know
an answer nobody has given yet.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The architecture reviews all ask for the same four pictures, and the repository has none of them. An
argument about where a hold should start currently has nothing to point at, so it is conducted from
memory, and the two reviews reached opposite conclusions partly for that reason.

Meanwhile four more diagrams sit fully specified in another scope and undrawn, which is the cheapest
kind of waste: the thinking is done and the output does not exist.

This plan closes both gaps at once, and does it without pre-empting three decisions that belong to
other scopes.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  EIGHT BRIEFS, THREE KINDS

  as-built, no decision needed        already briefed elsewhere
  ┌───────────────────────┐          ┌──────────────────────────┐
  │ real-time delivery    │          │ ws-auth    jwt-refresh   │
  └───────────────────────┘          │ rest-vs-ws event-wizard  │
                                     └──────────────────────────┘
                                       take ownership, don't rewrite

  decision-dependent: drawn AS-IS, dated, each naming who owes the target
  ┌──────────────────────────────────────────────────────────────┐
  │ state machine (×4)  →  one-booking-truth owes the survivor    │
  │ contention sequence →  contention-and-holds owes the settled  │
  │ event convergence   →  the-booking-journey owes the projection│
  └──────────────────────────────────────────────────────────────┘

  every one of the eight  ──►  + a failure, as a branch or its own page
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Four pieces of this scope's map are about this plan's work.

**Subject: one concept, four state machines.** The brief in task 1.1, as a picture.
[Piece 2](../diagram-prompts.md#piece-2-one-concept-four-state-machines-planned--not-rendered).
Save as `../diagrams/subject-02-one-concept-four-machines.png`. *(image not yet generated)*

**Subject: two answers to when a hold starts.** The brief in task 1.2.
[Piece 3](../diagram-prompts.md#piece-3-two-answers-to-when-a-hold-starts-planned--not-rendered).
Save as `../diagrams/subject-03-two-answers-one-hold.png`. *(image not yet generated)*

**Subject: every happy path without its failure.** What task 3 closes.
[Piece 4](../diagram-prompts.md#piece-4-every-happy-path-without-its-failure-planned--not-rendered).
Save as `../diagrams/subject-04-the-missing-half.png`. *(image not yet generated)*

**Subject: the same diagram planned twice.** What task 2 closes.
[Piece 5](../diagram-prompts.md#piece-5-the-same-diagram-planned-twice-planned--not-rendered).
Save as `../diagrams/subject-05-planned-twice.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Eight briefs, filed in two places by audience.

1. **Four in `artifacts/figures/how-a-booking-happens/`**: the four booking state machines, the
   contention sequence, the real-time delivery path, event convergence. New grouping, with a card.
2. **Four in `artifacts/figures/onboarding-a-new-developer/`**: WebSocket authentication, REST
   versus WebSocket, JWT refresh, the event wizard state machine. Existing grouping, existing briefs,
   ownership moved here.
3. **A failure for each of the eight**, stated per diagram as a branch inside it or as its own page.
4. **The reconciliation** so nobody draws the four twice.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objectives 2, 3 and 4](../MASTER_PLAN.md#objectives), and honour the rule the
scope works under while three decisions are open.

**Goal.** Eight briefs exist. Each carries the date it describes, the commit hash, and its
`path:line` references. Each of the three decision-dependent ones names the scope that owes its
target version. Each of the eight says where its failure is drawn.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/03-brief-the-other-eight.md`

▶ **Next: [task 1.1](#1--brief-the-four-the-reviews-ask-for)**.

### 1. 📐 Brief the four the reviews ask for

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**, and
[01](01-read-the-system-before-drawing-it.md)'s findings file, which every brief here cites instead
of re-deriving.

Each brief opens with the same three lines: **as of `<date>`**, **commit `<hash>`**, and for the
three decision-dependent ones, **the target version is owed by `<scope>`**.

- [ ] **1.1 Brief the booking state machine, as four machines**
  - One panel per live representation, from the findings file's section 1. Each panel carries its
    state list, its state count, its reference count, and its `path:line`.
  - The two with a free-text `status` and no choices list are drawn as such: a panel with no
    enumerable states is a finding, not an empty box.
  - `workflow_state` is drawn beside the representation it belongs to, using the findings file's
    section 2 answer about whether it is a projection or a second machine.
  - Add the line: the target version, one machine, is owed by
    [one-booking-truth](../../../MASTER_PLAN.md#sub-scopes) once D1 is answered.
  - Save to `artifacts/figures/how-a-booking-happens/four-booking-machines.md`.
  - Done when: a reader can say which representation is most complete and which is most referenced,
    from the picture alone, and can see that the two are not the same one.

- [ ] **1.2 Brief the contention sequence, as what the code does plus what a review proposes**
  - The lower, solid track: what `approve_request` does today, from the findings file's section 3,
    including the branch on `ResourcePolicy.BookingMode` and where the two hold timestamps are set.
  - The upper, hedged track: the request-time semantics the first review proposes, drawn with the
    inherited hedge outline and its tag, clearly labelled as a proposal.
  - Draw the `select_for_update` guard, and label it with what the findings file's section 3 says it
    does on SQLite. A guard drawn as holding when it does not is worse than no guard drawn.
  - Add the line: the target version is owed by
    [contention-and-holds](../../../MASTER_PLAN.md#sub-scopes) once D2 is answered.
  - Save to `artifacts/figures/how-a-booking-happens/when-a-hold-starts.md`.
  - Done when: nobody reading it can tell which of the two tracks the author preferred.

- [ ] **1.3 Brief the real-time delivery path, both branches of it**
  - From the findings file's section 5. Two paths from a change to a screen: the chat one and the
    scheduling one. Draw both, and draw where each one ends.
  - If the scheduling path ends at a database row without reaching the channel layer, that ending is
    the point of the diagram and gets the emphasis, not a footnote.
  - Include the outbox hop and the fact that nothing starts the worker, from the findings file's
    section 5.
  - Save to `artifacts/figures/how-a-booking-happens/what-reaches-a-screen.md`.
  - Done when: the two paths are visibly different lengths, and a reader can say which kinds of
    change a user finds out about without refreshing.

- [ ] **1.4 Brief event convergence, as whatever exists**
  - From the findings file's section 6. If the server computes per-request readiness and the client
    computes the event-level answer, draw exactly that, with the file that does each.
  - If no event-level projection exists server-side, the diagram's subject is the gap: the nine
    requests, the per-request states, and the client-side function that decides publish, drawn as
    the thing standing in for a projection.
  - Add the line: the target version is owed by
    [the-booking-journey](../../../MASTER_PLAN.md#sub-scopes) once D3 is answered.
  - Save to `artifacts/figures/how-a-booking-happens/is-this-event-ready.md`.
  - Done when: it is unambiguous whether the client is inventing its own definition of ready, and
    the diagram does not imply a server projection that is not there.

- [ ] **1.5 Write the grouping's card**
  - Create `artifacts/figures/how-a-booking-happens/README.md` with an entry per diagram, per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`: what it shows, how it was established, what it lets you say,
    what it cannot say. This is a second card in a second folder: the one
    [01](01-read-the-system-before-drawing-it.md) wrote is under `artifacts/notes/`, for the findings
    file. Same grouping name, two kinds, per the artifact tree convention.
  - Done when: the "what it cannot say" line on each of the three decision-dependent ones names the
    decision it is waiting on. That line is what stops someone reading an as-is picture as a design.

▶ **Next: [task 2.1](#2--take-ownership-of-the-four-that-already-have-briefs)**.

### 2. 🔀 Take ownership of the four that already have briefs

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**. Independent of task 1,
so it can be done at the same time.

- [ ] **2.1 Copy the four briefs across unchanged**
  - The four `/flowspec` briefs are in
    [the onboarding architecture-diagrams plan](../../../../onboarding-docs/plans/04-architecture-diagrams.md),
    tasks 1.1 to 1.4. Copy them verbatim, corrections included.
  - Do not re-derive them. The three corrections in that plan's Considerations were established
    against the repository and re-deriving risks losing them.
  - Their save paths stay in `artifacts/figures/onboarding-a-new-developer/`, because that is who
    reads them.
  - Done when: the four briefs are reachable from this scope and the text matches the source
    character for character, apart from the three additions in task 2.2.

- [ ] **2.2 Add the three lines this scope adds to every brief**
  - As of `<date>`, commit `<hash>`, and where the failure is drawn.
  - Done when: all eight briefs in this scope carry the same three lines, so the set is uniform.

- [ ] **2.3 Reconcile the source so nothing is drawn twice**
  - In [the onboarding master plan](../../../../onboarding-docs/MASTER_PLAN.md), the running order's
    architecture-diagrams row now says the briefs are owned here.
  - In [the architecture-diagrams plan](../../../../onboarding-docs/plans/04-architecture-diagrams.md)
    itself, its Quick context says the same, in the present tense, without narrating the handover.
  - Its Next step still points at the merged deck, which still needs the four images. The
    dependency does not go away, it just gets its images from here.
  - Done when: `grep -rn "ws-auth\|rest-vs-ws\|jwt-refresh\|event-wizard" plans/` shows both scopes,
    and only one of them claims to author the briefs.

▶ **Next: [task 3.1](#3--put-a-failure-beside-every-happy-path)**.

### 3. 💥 Put a failure beside every happy path

◀ **Needs: [tasks 1 and 2](#1--brief-the-four-the-reviews-ask-for)**, all eight briefs existing.

- [ ] **3.1 Decide, per diagram, branch or its own page**
  - Write the decision into each brief as one line. A branch when the failure is one fork; its own
    page when the failure has its own sequence.
  - Done when: all eight say which, and none is silent.

- [ ] **3.2 Write the failure content for each**
  - Each answers three questions: what the user sees, what state is left behind, and who finds out.
  - Candidates drawn from the acceptance list in
    [where we landed](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance),
    so the failure diagrams and the architecture tests describe the same nine situations:
    Redis unavailable during approval; a worker crashing after commit and before notification; a
    websocket disconnecting and reconnecting; a request expiring while the organizer is offline;
    two organizers competing for the same venue.
  - Match each to the diagram it belongs to rather than spreading all nine across all eight.
  - 💡 `/flowspec` per failure: it already draws decision points and branches, which is the whole
    shape of a failure diagram.
  - Done when: every one of the eight has a failure whose three questions are answered, and each
    failure is one a reader could actually cause on a laptop.

▶ **Next: [instruction 4.1](#4--read-the-three-hedged-briefs-back-for-leakage)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4.2](#4--read-the-three-hedged-briefs-back-for-leakage)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers`
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/onboarding-docs`, because task 2.3 changed that
      scope's running order, and its statuses have to agree with the change.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🧐 Read the three hedged briefs back for leakage

◀ **Needs: [task 1](#1--brief-the-four-the-reviews-ask-for)**, the three decision-dependent briefs
written.

This is the check no command can run. A brief can honour every rule mechanically and still read as
though the author has already decided, through emphasis, ordering, or which option got the nicer
words. That leak is what would pre-empt a decision that is not this scope's to make.

4.1 **Read each of the three aloud and try to guess the author's preference**
   - Open `four-booking-machines.md`, `when-a-hold-starts.md` and `is-this-event-ready.md` in turn.
   - Read each one out loud, start to finish.
   - Then answer, honestly: which option does this brief want?
   - Expected result: you cannot tell.
   - ✅ You cannot tell: the brief is neutral. Move to the next.
   - ❌ You can tell: find what gave it away. Usually one of three things: the preferred option is
     drawn first, it gets more detail, or the other one is described in the passive. Fix the
     specific thing rather than adding a disclaimer, because a disclaimer under a slanted picture
     does not un-slant it.

4.2 **Check each hedged element would survive being seen alone**
   - Take one hedged claim out of a brief and imagine it rendered as a standalone image with no
     caption.
   - Expected result: the hedge is visible in the drawing itself, through the grey dashed outline
     and its tag, not only in the surrounding text.
   - ✅ Visible in the drawing: correct. This is the rule that stops a proposal being read as a
     description once the image is pasted into a chat message.
   - ❌ Only the text hedges it: go back to the brief and move the hedge into the described visual.
     An image travels without its file; the text does not travel with it.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when eight briefs exist and none of them answers a question that belongs to
> another scope.

Pass:

- Eight briefs, each carrying its date, its commit hash, and its `path:line` references.
- The three decision-dependent ones each name the scope that owes the target version, and each says
  in its card what it cannot tell you.
- All eight say where the failure is drawn, and all eight have one.
- Instruction 4.1 was run on all three hedged briefs and none of them gave away a preference.
- `onboarding-docs` and this scope agree on who authors the four shared briefs.

Fail, and what it means:

- A brief that draws one booking state machine. That is D1 answered by a diagram, which is the exact
  failure the scope's rule exists to prevent, and it is nearly invisible once rendered.
- A failure section that describes an error message rather than what the system does. It reads as
  covered and teaches nothing.
- Both scopes still claiming to author the four briefs. Then they get drawn twice, differently, and
  the merged deck picks one at random.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| Four booking machines | `artifacts/figures/how-a-booking-happens/four-booking-machines.md` | subject | not started |
| When a hold starts | `artifacts/figures/how-a-booking-happens/when-a-hold-starts.md` | subject | not started |
| What reaches a screen | `artifacts/figures/how-a-booking-happens/what-reaches-a-screen.md` | subject | not started |
| Is this event ready | `artifacts/figures/how-a-booking-happens/is-this-event-ready.md` | subject | not started |
| The four onboarding briefs, owned here | `artifacts/figures/onboarding-a-new-developer/` | subject | not started |
| The grouping's card, extended | `artifacts/figures/how-a-booking-happens/README.md` | — | not started |
| The reconciliation | [the onboarding master plan](../../../../onboarding-docs/MASTER_PLAN.md) and [its diagrams plan](../../../../onboarding-docs/plans/04-architecture-diagrams.md) | — | not started |
| One concept, four state machines | [piece 2](../diagram-prompts.md#piece-2-one-concept-four-state-machines-planned--not-rendered) | subject | ⏳ not rendered |
| Two answers to when a hold starts | [piece 3](../diagram-prompts.md#piece-3-two-answers-to-when-a-hold-starts-planned--not-rendered) | subject | ⏳ not rendered |
| Every happy path without its failure | [piece 4](../diagram-prompts.md#piece-4-every-happy-path-without-its-failure-planned--not-rendered) | subject | ⏳ not rendered |
| The same diagram planned twice | [piece 5](../diagram-prompts.md#piece-5-the-same-diagram-planned-twice-planned--not-rendered) | subject | ⏳ not rendered |
| The socket that carries one path and not the other | [piece 6](../diagram-prompts.md#piece-6-the-socket-that-carries-one-path-and-not-the-other-planned--not-rendered) | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/03-brief-the-other-eight.md` | task 0, before any work | Conformance and thin instructions reported |
| Draw the branches | `/flowspec` per failure | task 3.2 | Decision points and branches drawn rather than described |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring this tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers` | the close out | Statuses and running order match reality |
| Bring the other scope current | `/sync-plan-tree @plans/onboarding-docs` | the close out | That scope's running order agrees with the reconciliation |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the architecture-diagrams plan](../../../../onboarding-docs/plans/04-architecture-diagrams.md): the four existing briefs, and the three corrections already applied to them.
- [what this scope may draw while D1 and D2 are open](../MASTER_PLAN.md#what-this-scope-may-draw-while-d1-and-d2-are-open): the rule every brief here obeys.
- [where we landed § acceptance](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance): the nine situations the failure diagrams draw from.
- [the environment overview](../../../../../environment/overview.md): the token key, the query-string auth, the two Redis databases.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to carry, and why provenance lives there rather than in a folder name.
- `backend/main/scheduling/services.py:701`: `approve_request`, the subject of the contention brief.
- `backend/main/scheduling/models.py:300` and `:396`, `backend/main/chat/models.py:123`, `backend/main/vendors/models.py:227`, `backend/main/artists/models.py:66`, `backend/main/locations/models.py:99`: every representation the state-machine brief draws.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[04-render-check-and-write-it-down.md](04-render-check-and-write-it-down.md), which turns all nine
prompts into images, checks each against its note, and writes down how to do both again.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/flowspec` ✅ : the four existing briefs were written for it, it draws decision points and failure
branches natively, and using it keeps the eight consistent with the four.
   alt: `/visualize-procedure` for the contention sequence specifically, where the subject is an
   ordered path rather than a state space.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A diagram teaches the opposite of what the code does | The onboarding briefs, before they were checked: the draft was drawn being deleted on publish, and it survives | Check every claim against `path:line` before briefing it. `backend/main/events/views.py:496-537` is the publish path. |
| An endpoint in a diagram does not resolve | The same briefs: `/api/events/drafts/` instead of `/api/events/event-drafts/` | The router prefix is `event-drafts`, at `events/api_urls.py:8`. |
| A proposal gets read as a description once the image is shared | Any hedged element hedged only in the surrounding text | The hedge belongs in the drawing. An image travels without its file. |
