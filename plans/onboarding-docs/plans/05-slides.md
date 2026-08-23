# 📊 Marp Slides Deck

Step 6 of 6, the last, in the [running order](../MASTER_PLAN.md#running-order). Waits on
steps 2, 3, and 5 ([02](02-backend-setup-docs.md), [03](03-frontend-setup-docs.md),
[04](04-architecture-diagrams.md)) for the decks and diagrams it merges.

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

Scope: [onboarding-docs](../MASTER_PLAN.md). Last of six, and the only one that consumes rather
than produces source material. Everything it merges must be settled first.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing is started, and it is correctly blocked: plan 04's four diagrams do not exist yet, and this
plan merges them.

The two source decks (`artifacts/decks/onboarding-a-new-developer/backend-setup.md`, `artifacts/decks/onboarding-a-new-developer/frontend-setup.md`) do exist.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority. The deck states facts
about the system on its architecture slides, so it inherits every correctness obligation the source
documents have.

- Django is **5.2.3**. The backend deck's title slide currently says 5.1 and must be corrected
  before it is merged, or the error propagates into the master deck.
- The frontend reaches the backend two ways, only one of which goes through the Vite proxy. An
  architecture slide claiming a single clean proxy path is wrong.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Merging copies every error in the sources into a fourth document.**

This plan does not check facts, it combines slides. Two known errors are sitting in the sources
right now: the Django 5.1 title slide in the backend deck, and plan 04's diagram briefs, which were
wrong about the draft being deleted at publish until they were corrected. Merge before those are
fixed and the master deck carries them.

**The output filename was ambiguous and is now fixed.**

An earlier draft named the goal `onboarding-slides.md` and the tasks `onboarding-master-deck.md`.
The source of truth is `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`; the exports take the shorter name.

**A deck is read at 16:9 from across a room, not on the author's laptop.**

Slides that fit in a markdown preview routinely overflow when rendered. That is what instruction 3
is for, and it cannot be done by reading the markdown.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

One deck can be handed to a new hire, or presented in a walkthrough, and take them from knowing
nothing about Attica to understanding both how to run it and why it is built the way it is.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The setup guides are for doing. The diagrams are for understanding one flow. Neither is presentable,
and neither gives the whole arc in one sitting.

A single deck is the artifact you actually hand someone, or stand up and talk through, and it is the
only output of this scope that works without a keyboard.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  slides/backend-setup.md   ─┐
  slides/frontend-setup.md  ─┼──► slides/onboarding-master-deck.md ──┬──► onboarding-slides.pdf
  diagrams/ws-auth.md       ─┤              (~15-20 slides)          └──► onboarding-slides.html
  diagrams/rest-vs-ws.md    ─┤                     │
  diagrams/jwt-refresh.md   ─┤            rendered and read at 16:9
  diagrams/event-wizard.md  ─┘                     │
      (from plan 04, ⚠️ not built yet)             ▼
                                          handed to a new hire
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Consolidate the backend and frontend decks and the four architecture diagrams into one cohesive Marp
deck, logically grouped and visually consistent, and export it to PDF and HTML.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Produce the one presentation-ready artifact this scope hands over.

**Goal.** `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`, roughly 15 to 20 slides: title and project overview,
architecture, backend setup, frontend setup, the four architecture flows, then verification and next
steps. Consistent colours, fonts and code blocks, readable at 16:9.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/05-slides.md`

▶ **Next: [task 1.1](#1--fix-the-sources-before-merging)**.

### 1. 🧹 Fix the sources before merging

◀ **Needs: [Architecture diagrams](04-architecture-diagrams.md)** complete, all four diagrams
written and checked against the code.

- [ ] **1.1 Correct the Django version in the backend deck**
  - `slides/backend-setup.md:22` says "Django 5.1". It is 5.2.3.
  - Do this before merging, not after; a fixed source and a stale merged copy is the worst outcome.

- [ ] **1.2 Confirm the four diagrams exist and passed their check**
  - `artifacts/figures/onboarding-a-new-developer/ws-auth.md`, `rest-vs-ws.md`, `jwt-refresh.md`, `event-wizard.md`.
  - Plan 04's instruction 3.2 must have confirmed the wizard diagram shows the draft surviving
    publish. Merging an unchecked diagram propagates whatever it says.

▶ **Next: [task 2.1](#2--merge-into-one-deck)**.

### 2. 🔧 Merge into one deck

◀ **Needs: [task 1](#1--fix-the-sources-before-merging)**.

- [ ] **2.1 Build `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`**
  - Slide 1: title, "Attica Onboarding: From Zero to Running System"
  - Slide 2: project overview, what Attica is and who it is for
  - Slide 3: architecture at a high level, REST plus websocket, SQLite plus Redis, JWT
  - Slides 4 to 6: backend setup, from `artifacts/decks/onboarding-a-new-developer/backend-setup.md`
  - Slides 7 to 9: frontend setup, from `artifacts/decks/onboarding-a-new-developer/frontend-setup.md`
  - Slides 10 to 13: the four architecture flows, from `diagrams/`
  - Slides 14 to 15: verification and where to go next
  - Check while merging: consistent terminology across the two source decks, no duplicated slide, a
    flow that reads in one pass.

- [ ] **2.2 Polish the formatting**
  - A Marp theme with a consistent colour scheme and fonts.
  - Slide numbers, and a footer reading "Attica Onboarding".
  - Syntax highlighting on every code block: bash, JavaScript, Python.
  - Diagrams embedded rather than linked, so the deck survives being sent as a file.

▶ **Next: [instruction 4.1](#4--render-it-and-look-at-it)**.

### 3. 📦 Export

◀ **Needs: [instruction 4.3](#4--render-it-and-look-at-it)**, the deck read at full size and its
facts spot-checked.

- [ ] **3.1 Export both formats**
  - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md -o artifacts/decks/onboarding-a-new-developer/onboarding-slides.pdf`
  - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md -o artifacts/decks/onboarding-a-new-developer/onboarding-slides.html`
  - The markdown stays as the source of truth; the exports are generated and regenerable.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`
  - This is the last plan in the running order, so this sync is also the scope's close-out. If every
    plan comes back done, run `/recap-plan-tree @plans/onboarding-docs/MASTER_PLAN.md`.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 👁️ Render it and look at it

◀ **Needs: [task 2](#2--merge-into-one-deck)**.

4.1 **Render the deck at full size**
   - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md --preview`,
     or open it in VS Code with the Marp extension and press the preview button.
   - Put the preview full screen. A deck judged in a side panel is judged at the wrong size.
   - Expected result: every slide fits, no code block is cut off, no text runs past the edge.
   - ✅ all slides fit, move on. ❌ anything overflows, fix the markdown and re-render that slide.

4.2 **Read it as the person receiving it**
   - Go through once at presentation pace, without stopping to fix anything, as though you knew
     nothing about Attica.
   - Expected result: you can say what Attica is, what to install, and how auth works, by the end.
   - ✅ the arc holds. ❌ you lost the thread somewhere, note the slide number; that is a gap in
     the order, not in any one slide.

4.3 **Spot-check two facts against the source**
   - The title slide's Django version, and whatever the wizard diagram slide says happens to the
     draft at publish.
   - Expected result: 5.2.3, and the draft surviving publish.
   - ✅ both right. ❌ either wrong, a source was merged before it was fixed; go back to task 1.

▶ **Next: [task 3.1](#3--export)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The deck is done when you have read it at full size, at presentation pace, and could hand it to
someone without narrating over the gaps.

A merged markdown file that has never been rendered is not a deck; it is a document that will
overflow in front of an audience.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Master deck source | `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md` | not created |
| PDF export | `slides/onboarding-slides.pdf` | not created |
| HTML export | `slides/onboarding-slides.html` | not created |

The draft slide text that used to sit in this plan as sections has been removed. The two source
decks are the real content and are longer; a third copy here would be the one that goes stale.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

This plan is downstream of everything. Six documents feed it and nothing feeds back, so after the
merge there are two copies of every slide: the source deck and the master deck.

Nothing keeps them in sync. Correct the source first and re-merge, rather than editing the master
deck in place, or the next merge silently reverts your fix.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): the facts the architecture slides assert.
- [The backend setup deck](../../../artifacts/decks/onboarding-a-new-developer/backend-setup.md) and
  [The frontend setup deck](../../../artifacts/decks/onboarding-a-new-developer/frontend-setup.md): the two source decks.
- [The onboarding figures](../../../artifacts/figures/onboarding-a-new-developer/): the procedure diagrams, and the four architecture diagrams once plan 04 has written them.
- Marp: `https://marp.app/`.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

This is the last plan in the running order. When it is done, every plan in the scope is done, and
the close-out in the close out applies.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/slidecraft` for deck structure and slide-level editing. ▶ `/speaker-notes` if the deck is going
to be presented rather than only read.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Two different output filenames for one deck | This plan's goal versus its tasks, before correction | The source is `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`; the exports are `onboarding-slides.pdf` and `.html`. |
| A merged deck carries an error already fixed in its source | Anticipated, from the Django 5.1 title slide | Fix sources first (task 1), then merge. Never edit the master deck in place to fix a source error. |
