# 📚 Source Analysis and Design Extraction

Step 1 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on nothing.
Next: [Backend setup docs](02-backend-setup-docs.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
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

Scope: [onboarding-docs](../MASTER_PLAN.md). First of six, and the foundation: every other plan
reads the four documents this one produced.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

All seven tasks are done. Four source documents exist and are what plans 02 through 07 read.

**The two input files this plan analysed no longer exist.** `PHASE-1-SNAPSHOT.txt` and
`UNPACK-OUTPUT.txt` were never committed and are not on disk. That is not a loss: they were
transient tool output, and everything worth keeping from them is in the four documents below. It
does mean this plan cannot be re-run as written, and the [References](#references) section says so
rather than pointing at files that are gone.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority. This plan's outputs assert
facts about how Attica runs, so they inherit that file's obligations.

- Django is **5.2.3**, not 5.1. Any document produced here saying otherwise is stale.
- Nothing auto-starts: four processes by hand. The setup sequence this plan extracted must match.
- The frontend reaches the backend two ways, only one through the Vite proxy.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This plan's outputs are the single point of failure for the whole scope.**

Five later plans read `onboarding-source.md`, `setup-sequence.md`, `design-decisions.md` and
`core-models.md` and never re-derive anything from the code. An error here propagates into a guide,
a deck, a diagram and a Todoist task before anyone notices.

**Two documents now cover overlapping ground and neither knows about the other.**

`design-decisions.md` and `core-models.md` explain why Attica is built as it is and what its models
mean. The repository now also carries [the context index](../../../context/00-INDEX.md), built later and from
the code directly, which covers the same territory in more depth and flags several places where the
obvious reading is wrong. Where they disagree, `context/` is the newer and better-evidenced one.

**The inputs were transient and the outputs are not.**

Tool output that was never committed cannot be re-read. Anything this plan concluded that is not
written into one of the four documents is gone.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Four documents hold the factual foundation for the whole scope: the setup sequence, the design
decisions with their reasons, the core models and their relationships, and the architecture flows,
each with real file paths, model names and commands rather than descriptions of them.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Writing five documents that each re-derive the same facts from the codebase guarantees five
different answers. Extracting the facts once, into documents the others cite, is what keeps the guides,
the decks and the diagrams saying the same thing.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  PHASE-1-SNAPSHOT.txt  ─┐                          ┌──► onboarding-source.md  ✅
  UNPACK-OUTPUT.txt     ─┼──► reviewed against ──►──┼──► setup-sequence.md     ✅
  the codebase itself   ─┘     the live code        ├──► design-decisions.md   ✅
   (inputs: gone, never                             └──► core-models.md        ✅
    committed)                                              │
                                            read by plans 02, 03, 04, 05, 07
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Extract the factual foundation for all the documentation in this scope: the setup sequence, the
design decisions, the architecture relationships and the terminology, consolidated into documents
every later plan cites rather than re-deriving.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Establish the facts once, so five downstream documents agree with each other.

**Goal.** A reviewed, consolidated `onboarding-source.md` plus three reference documents, carrying
real paths, model names, endpoint paths and commands.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. All seven are done.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/01-source-analysis.md`

▶ **Next: [task 1](#1--review-the-source-material)**.

### 1. 🔍 Review the source material

- [x] ✅ **Review the replicate output: archetype classification, file structure, current state**
  - [x] All 11 Django apps listed with their models
  - [x] All key models named: `Event`, `EventDraft`, `ChatRoom`, `ChatBid` and the rest
  - [x] Discrepancies against the current code noted

- [x] ✅ **Review the unpack output: setup sequence and design-decision explanations**
  - [x] Backend setup (venv, install, migrate, seed, Daphne) checked against the actual files
  - [x] Frontend setup (npm, Vite proxy, auth) checked for completeness
  - [x] JWT auth flow and websocket integration explanations checked for clarity

▶ **Next: [task 2](#2--extract-and-consolidate)**.

### 2. ✍️ Extract and consolidate

◀ **Needs: [task 1](#1--review-the-source-material)**.

- [x] ✅ **Extract the canonical setup sequence**
  - [x] Backend: create the environment, install, migrate, seed, start Daphne
  - [x] Frontend: npm install, Vite dev server, proxy to `localhost:8000`
  - [x] External: Redis on port 6379

- [x] ✅ **Extract the design decisions with their reasons**
  - [x] REST-first: the database is the source of truth, websockets are the notification layer
  - [x] SQLite plus Redis: a file-based database with zero setup, Redis coordinating broadcasts
  - [x] JWT: stateless, refreshable from the frontend on a 401
  - [x] Multi-role users: one account, several personas

- [x] ✅ **Document the core models and their relationships**
  - [x] User to Event, Vendor, Artist, ChatRoom, Booking
  - [x] Event to Location, ChatRoom, Booking, ArtistBooking
  - [x] ChatRoom to Message, ChatBid
  - [x] Relationships sketched in text, to be formalised by [Architecture diagrams](04-architecture-diagrams.md)

- [x] ✅ **Consolidate into [the consolidated onboarding source](../source/onboarding-source.md)**
  - [x] Sections: setup sequence, design decisions, core models, architecture flows
  - [x] Carries real file paths, model names and endpoint paths, not abstractions
  - [x] Carries real command examples, such as `daphne -b 0.0.0.0 -p 8000 main.asgi:application`

- [x] ✅ **Split the long-form detail into its own reference files**
  - [x] [the setup sequence source](../source/setup-sequence.md): the command-by-command order with decision
    points and failure symptoms
  - [x] [the design decisions source](../source/design-decisions.md): the reason behind each choice, with the
    code that proves it
  - [x] [the core models source](../source/core-models.md): the entity map, per-model relationship tables, and
    the relationships not yet wired
  - [x] All three linked from the scope's `## Source Documents` list

▶ **Next: [instruction 3.1](#3--reconcile-against-the-context-folder)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--reconcile-against-the-context-folder)**.

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 🔎 Reconcile against the context folder

◀ **Needs: [task 2](#2--extract-and-consolidate)**.

The repository gained [the context index](../../../context/00-INDEX.md) after this plan finished. It covers the
same ground as `design-decisions.md` and `core-models.md`, built from the code directly, and it
flags several places where the obvious reading of a name is wrong.

3.1 **Read `source/core-models.md` beside `context/world/booking.md` and `context/world/organizer.md`** ❌ done 2026-08-23
   - Both checks failed, and both are now pointers into `context/` rather than copies.
   - The bookings row said the scheduling app held "a third booking layer, not yet integrated",
     which reads as though the chat and vendor bookings are the working ones. The opposite is true:
     `scheduling.Booking` is the only live model and the other four are vestigial.
   - The entity map labelled `user_type` "legacy". It is enforced, by
     `scheduling/permissions.py`, while the artist and vendor apps enforce `has_role()`.

3.2 **Read `source/design-decisions.md` beside `context/purpose/03-what-working-means.md`** ✅ done 2026-08-23
   - The document does not overstate ticketing. It names `TICKET_BUYER` once, in the role list, as
     an intent rather than a built capability, and claims nothing about checkout.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The four documents exist and the tasks are ticked, which is what this plan promised.

What it cannot promise is that they are still accurate. They were extracted from tool output that no
longer exists, and the codebase has moved since. Instruction 3 is the cheapest available check
against something newer and independently derived.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Read by |
|---|---|---|
| Consolidated reference | [The consolidated onboarding source](../source/onboarding-source.md) | plans 02, 03, 04, 05 |
| Command-by-command setup order | [The setup sequence source](../source/setup-sequence.md) | plans 02, 03, 07 |
| Design decisions with their reasons | [The design decisions source](../source/design-decisions.md) | plans 02, 03, 05 |
| Entity map and relationships | [The core models source](../source/core-models.md) | plans 04, 05 |

An earlier version of this plan carried four of these as sections inside the plan file. They were
superseded by the documents above, which are longer and are what everything else cites, and have
been removed rather than kept as a second copy.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Everything in this scope is downstream of these four documents, and nothing feeds back. Correcting a
fact here after plans 02 through 05 have run does not correct the guides, decks or diagrams that
copied it.

So a correction here means checking the scope for the same sentence. The scope is small enough to
grep.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): how Attica actually runs, and the corrections this
  plan's outputs may predate.
- [The context index](../../../context/00-INDEX.md): what Attica means, built later and
  independently. The reconciliation target in instruction 3.
- [The project instructions](../../../CLAUDE.md): the repository's own overview.

**The two input files are gone.** `PHASE-1-SNAPSHOT.txt` and `UNPACK-OUTPUT.txt` sat at the
repository root, were never committed, and are no longer on disk. They cannot be recovered, so this
plan cannot be re-run as it was originally written. Re-deriving from the codebase, or from
`context/`, is the route if the outputs are ever in doubt.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[Backend setup docs](02-backend-setup-docs.md), which turns the setup sequence into a
diagram, a deck and a guide.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/unpack` for explaining a system from its code. Alternative: `/learn-codebase` where the aim is a
rebuild guide rather than a reference.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A plan's engagement instructions point at input files that no longer exist | This plan's original references to `PHASE-1-SNAPSHOT.txt` and `UNPACK-OUTPUT.txt` | Transient tool output was never committed. Either commit the input a plan analyses, or write the plan so its outputs stand without it. |
| Documentation states Django 5.1 | The repository `CLAUDE.md` and this scope's decks, before correction | The version is 5.2.3, pinned at `backend/main/requirements.txt:17`. |
