# 📐 Cards That Answer To Their Container

Step 6 of 7 in this scope. Waits on
[05](05-the-components-that-own-the-styles.md). Next:
[07-prove-it-and-write-it-down.md](07-prove-it-and-write-it-down.md).

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

Scope: [the design system](../MASTER_PLAN.md). Sixth of seven.

Waits on [05](05-the-components-that-own-the-styles.md), because the components that go inside
drawers have to exist before they can be taught to read their container.

Container queries and mobile are one plan because they are the same question asked twice: what
decides this layout, the space the component is in or the device it is on. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#seven-plans-not-five).

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 27.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**Not one container query exists in this app.** A search for `@container`, `container-type`, `cqw`
and `cqi` across every `.jsx`, `.js` and `.css` file returns nothing.

**Every responsive decision is a viewport breakpoint.** `lg:` 139 times, `md:` 125, `sm:` 119, `xl:`
9. That is 392 places where the question asked is "how wide is the window".

**Fifteen files put content into a narrow space where the window's width is the wrong question.**
`components/booking/EventBookingSummaryDrawer.jsx`, `components/booking/MockCheckoutSheet.jsx`,
`components/FilterSidebar.jsx`, `ArtistPostSidebar.jsx`, `pages/SelectArtists.jsx`,
`pages/SelectVendors.jsx`, six of the eight wizard steps, `HomePage.jsx`, `ArtistProfilePage.jsx`
and `TourDetailPage.jsx`.

So a provider card in a 380px drawer on a 1920px monitor is told the viewport is extra large, and it
lays itself out for a wide screen inside a narrow one.

**Mobile is currently the desktop layout shrunk.** The four breakpoints are used to adjust a layout
designed for a wide screen, not to select a different one. Nothing in the app says what the
create-event wizard is supposed to look like on a phone.

**This plan settles the question once and applies it twice.** Where the space decides, a container
query. Where the device genuinely decides, a viewport breakpoint. And for the two journeys that
matter most on a phone, a layout that was designed rather than derived.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Both instructions
  here drive a real browser, so `npm run dev` has to be running.
- **The drawer test needs a booking to look at.** The booking summary drawer is empty without data,
  so the whole stack has to be up per
  [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md) and
  the booking scenarios seeded per
  [seeding § 2](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md#2-seed-the-booking-scenarios).
- **Availability search returns nothing until slots are materialized**, per
  [what makes a provider bookable](../../../../../environment/django-admin/scheduling-availability.md).
  The provider selection pages are two of the fifteen drawer and sidebar files, and an empty list
  has no cards to look at.
- **The browser suite runs logged out today**, which `fixing-create-event` fixes, so both checks
  here are a person at a screen rather than a test.

**One fact this plan needs is not in `environment/` and comes from
[plan 01](01-measure-it-and-take-the-stack-decision.md) instead**: whether the stack decision made
container queries available without a plugin. Tailwind 4 has them built in; Tailwind 3.4 needs
`@tailwindcss/container-queries`, which is not installed. Plain CSS has them regardless. This plan
reads the answer rather than assuming it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Not every breakpoint is wrong, and replacing all 392 would be.**

A page's overall column count genuinely depends on the window. A card inside a drawer genuinely does
not. The deliverable is a rule for telling them apart, applied to the components
[05](05-the-components-that-own-the-styles.md) built, not a sweep.

**The rule is a question, not a category.**

"Would this look different if the same component were dropped into a narrow panel on a wide screen?"
If yes, it is the container. If the only thing that matters is whether the person is holding a
phone, it is the viewport.

**A container query needs a container, and that is the part that breaks.**

The component asking the question is not the one that has to declare `container-type`. Its parent
does. So a card that works in one drawer and not in another is almost always a missing declaration
on the second drawer rather than a wrong query on the card, and that is the failure to expect.

**Mobile as its own layout means choosing which journeys get one.**

Designing every screen twice is not what this plan asks for. The create-event wizard and the
provider list are the two journeys the product turns on, and both are currently unusable-shaped on a
phone rather than merely tight. Everything else keeps its breakpoints and gets revisited when it is
touched.

**This plan decides mobile; `the-event-workspace` builds the screens.**

Scope 11 owns the persistent shell, the wizard's navigation state and the convergence dashboard. If
this plan starts redesigning wizard steps it is doing that scope's work with none of that scope's
context. What this plan produces is the layout decision and the rules, written down where scope 11
will read them.

**Both checks are physical and neither can be asserted.**

Dragging a drawer's edge and watching a card not change when the window does is the only proof a
container query is doing what it claims. Walking the wizard at phone width is the only way to find
out that a layout is a shrunk desktop.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A card in a 380px drawer on a 1920px monitor is told the screen is extra large**, and there are
fifteen files in this app where that is the wrong answer.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

This app is built out of drawers, sidebars and split panes. That is not incidental: the whole
booking journey is a list beside a detail, and the checkout is a sheet over a page. Fifteen files
put a component into a narrow space beside a wide one.

Every one of those components asks the window how wide it is. So the same card is correct in the
grid and wrong in the drawer, and the only fix available with viewport breakpoints is a second
component, or a prop that says "I am in a drawer now", which is the component being told about its
context by hand in every place it is used.

Container queries make that a property of the component. It works in the grid, in the drawer, in the
sidebar and in whatever `the-event-workspace` builds next, without anybody passing it a flag.

The mobile half is the same argument at a different scale. A wizard designed for a wide screen and
then squeezed is a wizard that works on a phone by accident, and the create-event journey is the one
this whole programme is named after.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE                          1920px window
  ┌──────────────────────────────────────────────┬───────────────┐
  │  grid: 3 provider cards, comfortable          │  drawer 380px │
  │  ┌────┐ ┌────┐ ┌────┐                         │  ┌─────────┐  │
  │  │card│ │card│ │card│                         │  │ card    │  │
  │  └────┘ └────┘ └────┘                         │  │ overflow│  │
  │       │       │       │                       │  └────┬────┘  │
  └───────┼───────┼───────┼───────────────────────┴───────┼───────┘
          └───────┴───────┴──── all four ask ─────────────┘
                              "how wide is the WINDOW?"   ◄── 392 breakpoints
                                                              0 container queries

  AFTER
      grid cards ask the grid.   drawer card asks the drawer.
      the window is asked only where the window is the question.

      + mobile: the wizard and the provider list get a layout
        somebody designed, not one somebody shrank.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is closed by what this plan builds.

**Subject: every card is told the window's width.** The grid card and the drawer card reaching the
same viewport ruler, with the short empty ruler above the drawer where the container's own should
be.
[Piece 6](../diagram-prompts.md#piece-6-every-card-is-told-the-windows-width-planned--not-rendered).
Save as `../diagrams/subject-06-every-card-is-told-the-windows-width.png`. *(image not yet
generated)*

The top panel of this scope's subject capstone shows the end state: one of its four page cards is a
drawer whose component is laid out for the drawer, with its own ruler.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**Container queries on the components that go into narrow spaces**, with `container-type` declared
on the containers that hold them, starting with the fifteen files that render into a drawer, a
sidebar or an aside.

**One layout rules document**, at `artifacts/notes/the-design-system/what-decides-this-layout.md`,
holding three sections.

1. **The question**, stated as a test somebody can apply to a component in ten seconds, with three
   worked examples from this app: one where the container decides, one where the viewport does, and
   one where it is genuinely both.
2. **The containers**, listing each of the fifteen narrow spaces, whether it now declares
   `container-type`, and which components are laid out inside it.
3. **Mobile**, naming the two journeys that get their own layout, what each looks like at phone
   width, and what everything else does in the meantime.

**Two mobile layouts**, for the create-event wizard and the provider list, decided and written down
here, built by `the-event-workspace` where they are that scope's screens.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 5](../MASTER_PLAN.md#objectives), letting a component answer to the
space it is in.

**Goal.** The components from [05](05-the-components-that-own-the-styles.md) respond to their
container; every one of the fifteen narrow spaces has been checked and either declares
`container-type` or carries a reason it does not; the layout question is written as a test with
three worked examples; and the two mobile journeys have a layout somebody decided rather than one
somebody derived.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/06-cards-that-answer-to-their-container.md`

▶ **Next: [task 1.1](#1--find-out-what-container-queries-cost-here)**.

### 1. 📖 Find out what container queries cost here

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read what the stack decision made available**
  - `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`, the container-query column
    of the candidate table from
    [task 3.1 of plan 01](01-measure-it-and-take-the-stack-decision.md#3--build-the-candidate-table).
  - Produces: one line saying whether container queries need a plugin, a version upgrade, or
    nothing. Tailwind 4 has them built in; Tailwind 3.4 needs `@tailwindcss/container-queries`,
    which is not in `frontend/package.json`; plain CSS has them regardless.
  - Done when: the answer is quoted from the decision record, and if a plugin is needed, this plan
    says so before any query is written rather than discovering it mid-build.

- [ ] **1.2 List the fifteen narrow spaces and what is inside each**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -rln "Drawer\|Sidebar\|<aside" --include=*.jsx . | sort
  ```
  - For each file, record what the narrow space is (a drawer, a sidebar, an aside, a split pane),
    roughly how wide it is, and which components render inside it.
  - Produces: the containers section of the layout rules document.
  - Done when: all fifteen have a row. On 2026-08-23 the list was `ArtistPostSidebar.jsx`,
    `ArtistProfilePage.jsx`, `HomePage.jsx`, `ListingStep3.jsx` through `ListingStep8.jsx`,
    `TourDetailPage.jsx`, `components/FilterSidebar.jsx`,
    `components/booking/EventBookingSummaryDrawer.jsx`,
    `components/booking/MockCheckoutSheet.jsx`, `pages/SelectArtists.jsx` and
    `pages/SelectVendors.jsx`.
  - ❌ If a file matches the search but has no narrow space (the word appears in a variable name),
    say so in its row and exclude it. A count inflated by false matches makes the next plan's
    after-number meaningless.

- [ ] **1.3 Write the question as a test, with three worked examples from this app**
  - The question: would this look different if the same component were dropped into a narrow panel
    on a wide screen?
  - Three examples, each named with its file: one where the container decides (the provider card in
    `EventBookingSummaryDrawer.jsx`), one where the viewport decides (the page's own column count),
    and one where it is genuinely both.
  - Done when: somebody can apply the test to a component they have never seen in ten seconds. This
    is what [07](07-prove-it-and-write-it-down.md)'s runbook recipe quotes.

▶ **Next: [task 2.1](#2--make-the-components-read-their-container)**.

### 2. 📐 Make the components read their container

◀ **Needs: [task 1](#1--find-out-what-container-queries-cost-here)**.

- [ ] **2.1 Declare `container-type` on the narrow spaces**
  - Every one of the fifteen from [task 1.2](#1--find-out-what-container-queries-cost-here) that
    holds a component from [05](05-the-components-that-own-the-styles.md).
  - Produces: the declaration on the container, which is the part that is easy to forget and the
    reason a query silently falls back to the viewport.
  - Done when: each of the fifteen either declares it or has a written reason in its row. A space
    that only ever holds text needs no declaration, and saying so is a decision.

- [ ] **2.2 Convert the components' internal breakpoints to container queries**
  - The components from [05](05-the-components-that-own-the-styles.md), plus the provider card and
    whatever else the fifteen spaces hold.
  - Produces: components whose layout responds to their container.
  - Done when: a component's own breakpoints are container queries, and the page-level column counts
    around them are still viewport breakpoints. Both kinds coexisting is the correct end state, not
    a half-finished one.
  - ❌ If a component turns out to need both (its type size follows the device, its column count
    follows the container), that is the third worked example from
    [task 1.3](#1--find-out-what-container-queries-cost-here). Write it down there rather than
    picking one and moving on.

- [ ] **2.3 Take the after-numbers with the same commands**
  - Re-run [task 2.6 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged: the container-query count and the breakpoint counts.
  - Done when: both are recorded beside the before-numbers, with a line saying how many of the 392
    breakpoints were replaced and how many were kept on purpose. **The breakpoint count is not meant
    to reach zero**, and a plan that drove it there would have converted decisions that genuinely
    belong to the viewport.

▶ **Next: [instruction 4.1](#4--drag-the-drawer-then-drag-the-window)**.

### 3. 📱 Decide mobile for the two journeys

◀ **Needs: [instruction 5](#5--walk-the-wizard-at-phone-width)** done, so the decision is made
against what a phone actually shows rather than against a guess.

- [ ] **3.1 Write down what the create-event wizard is on a phone**
  - From what [instruction 5](#5--walk-the-wizard-at-phone-width) found: which steps are unusable
    rather than merely tight, and what each should be instead.
  - Produces: the mobile section of the layout rules document, naming the layout rather than
    describing adjustments to the desktop one.
  - Done when: it says what the layout **is**, not which paddings shrink.
    `the-event-workspace` builds it; this is what that scope reads.

- [ ] **3.2 Write down what the provider list is on a phone**
  - Same shape. The provider list is the other journey the product turns on, and it is one of the
    fifteen narrow-space files, so its card is already answering to a container.
  - Done when: the layout is named, and it says what happens to the filter sidebar, which has
    nowhere to go at phone width.

- [ ] **3.3 Say what every other screen does in the meantime**
  - Produces: one line. The honest answer is likely "keeps its breakpoints and gets a decided layout
    when it is next touched", and writing that down is what stops it being read as an oversight.
  - Done when: the line exists and names who revisits it.

- [ ] **3.4 Write the grouping's card entry**
  - Add the layout rules document to `artifacts/notes/the-design-system/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the provenance is in the card as prose.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--decide-mobile-for-the-two-journeys)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🖱️ Drag the drawer, then drag the window

◀ **Needs: [task 2](#2--make-the-components-read-their-container)** done, so there is something to
drag.

A container query is either watched working or it is a claim, and the two halves of the claim need
two different drags.

4.1 **Get a booking on screen with its drawer open**
   - Bring the whole stack up per
     [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md),
     and seed the booking scenarios per
     [seeding § 2](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md#2-seed-the-booking-scenarios).
   - Open Chrome at `http://localhost:5173` at a wide window size, log in as the organizer, and open
     the booking summary drawer.
   - Expected result: a drawer with at least one card in it.
   - ❌ The drawer is empty: the scenarios are not seeded, or availability slots are not
     materialized per
     [what makes a provider bookable](../../../../../environment/django-admin/scheduling-availability.md).
     Both return an empty list rather than an error, which looks like a layout problem and is not.

4.2 **Widen the drawer and watch the card change**
   - In DevTools, select the drawer element and edit its width in the Styles pane, taking it from
     its normal width to roughly double.
   - Expected result: the card inside relays out as the drawer gets wider.
   - ✅ It changes: the container query is live. Screenshot the narrow and wide states in one capture
     and save it as `artifacts/figures/the-design-system/one-card-two-container-widths.png`.
   - ❌ Nothing changes: the container almost certainly does not declare `container-type`. That is
     the expected failure, per
     [task 2.1](#2--make-the-components-read-their-container). Check the parent element rather than
     the card.

4.3 **Now drag the window and watch the card not change**
   - Put the drawer back to its normal width and drag the browser window from wide to narrow,
     stopping before the page's own layout switches.
   - Expected result: the card inside the drawer does not change at all.
   - ✅ It does not change: that is the whole point of this plan, on your screen. Add this state to
     the same capture.
   - ❌ It does change: the card still has a viewport breakpoint in it. Find it and convert it.

4.4 **Check the same card in the grid**
   - Go to the provider list and look at the same card in the open grid.
   - ✅ It is laid out for the grid without anybody passing it a prop about where it is: one
     component, two contexts, no flag.
   - ❌ It looks wrong in the grid now: the container query's breakpoints were tuned for the drawer
     only. Both contexts have to work, and the grid is the one people see more often.

▶ **Next: [instruction 5.1](#5--walk-the-wizard-at-phone-width)**.

### 5. 📱 Walk the wizard at phone width

◀ **Needs: [instruction 4](#4--drag-the-drawer-then-drag-the-window)**.

The only way to find out whether a layout is a shrunk desktop is to use it as one.

5.1 **Set the device toolbar to a small real phone**
   - In Chrome, press Ctrl+Shift+M for the device toolbar and choose iPhone SE, which is the
     narrowest common width and the one that exposes a shrunk desktop fastest.
   - Reload.

5.2 **Walk every step of the create-event wizard, using it rather than looking at it**
   - Fill each step as an organizer would, per
     [walking the event wizard](../../../../../runbook/driving-the-app/walking-the-event-wizard.md).
   - Screenshot every step. Save them as
     `artifacts/figures/the-design-system/mobile-wizard-step-NN.png`.
   - ✅ For each step, write down one of three verdicts: **works**, **tight but usable**, or
     **unusable**. Only the third earns a redesign in
     [task 3.1](#3--decide-mobile-for-the-two-journeys).
   - ❌ You cannot complete a step at all: that is the strongest possible finding and it goes at the
     top of the notes. Say which control you could not reach or read.

5.3 **Do the same for the provider list**
   - Open the provider list at the same width, and try to filter.
   - ✅ You have a verdict, and you have said what happened to the filter sidebar: it is the control
     with nowhere to go at phone width, and what it becomes is a decision.
   - ❌ The filters are simply absent: write that down. A control that vanishes on a phone is a
     feature that does not exist on a phone.

5.4 **Say which two journeys get a designed layout, out loud**
   - ✅ You can name them and say what each becomes in one sentence:
     [task 3](#3--decide-mobile-for-the-two-journeys) writes it down.
   - ❌ Everything looked tight but nothing looked unusable: that is a real and useful finding, and
     it means this plan's mobile half is smaller than expected. Record it rather than manufacturing
     a redesign to fill the section.

▶ **Next: [task 3.1](#3--decide-mobile-for-the-two-journeys)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody widened a drawer and watched the card inside change, then narrowed
> the window and watched it not change.

Pass:

- Whether container queries need a plugin here is quoted from the stack decision, and if one was
  needed it was installed before any query was written.
- All fifteen narrow spaces have a row, and each either declares `container-type` or carries a
  reason it does not.
- The layout question is written as a ten-second test with three worked examples named by file,
  including one where it is genuinely both.
- Both drags were performed and the result screenshotted: the card changed with the drawer and did
  not change with the window.
- The same card was checked in the open grid and still works there.
- The wizard was walked at iPhone SE width with a verdict per step, and the provider list with a
  verdict and an answer about the filter sidebar.
- Two mobile layouts are named as layouts rather than as adjustments, or the finding that no step
  was unusable is recorded instead.
- The after-numbers are recorded with the same commands, with a line saying how many breakpoints
  were kept on purpose.

Fail, and what it means:

- The card changing when the window is dragged. Then a viewport breakpoint is still inside it and
  the container query is decorative.
- A query written on a container with no `container-type`. It falls back to the viewport silently,
  so it looks like it works until somebody puts the component somewhere narrow.
- The breakpoint count driven toward zero. Decisions that genuinely belong to the viewport were
  converted, and the app now ignores the device.
- Mobile written as "reduce padding and stack the columns". That is the shrunk desktop with
  instructions.
- The wizard walked by looking rather than by filling it in. A step reads fine and cannot be
  completed, and only using it finds that.

Partial pass is acceptable on the mobile half. Container queries working, with the mobile walk done
and its verdicts recorded but the two layouts not yet designed, is a real result as long as the
verdicts are written down.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| Container queries on the components, `container-type` on the containers | `frontend/src`, the fifteen narrow-space files and the component folder | — | not started |
| The layout rules, three sections | `artifacts/notes/the-design-system/what-decides-this-layout.md` | — | not started |
| The fifteen narrow spaces, each with its decision | inside the layout rules | — | not started |
| The two mobile layouts, named as layouts | inside the layout rules | — | not started |
| The after-numbers, with the same commands | inside the layout rules | — | not started |
| One card at two container widths, and unchanged at two window widths | `artifacts/figures/the-design-system/one-card-two-container-widths.png` | — | not started |
| Every wizard step at iPhone SE width | `artifacts/figures/the-design-system/mobile-wizard-step-NN.png` | — | not started |
| Every card is told the window's width | [piece 6](../diagram-prompts.md#piece-6-every-card-is-told-the-windows-width-planned--not-rendered) → `../diagrams/subject-06-every-card-is-told-the-windows-width.png` | subject | ⏳ not rendered |
| Seven plans, seven gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-seven-plans-seven-gates-planned--not-rendered) → `../diagrams/process-02-seven-plans-seven-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/06-cards-that-answer-to-their-container.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the file where the same card renders in a grid and in a sidebar | `/unpack frontend/src/pages/SelectArtists.jsx` | task 1.2 | Both contexts of one component read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the stack decision](01-measure-it-and-take-the-stack-decision.md#3--build-the-candidate-table): the container-query column, which says whether a plugin is needed.
- [the decisions taken here](../decisions-taken-here.md#seven-plans-not-five): why container queries and mobile are one plan.
- [what makes a provider bookable](../../../../../environment/django-admin/scheduling-availability.md): why a provider list can be empty with no error.
- [walking the event wizard](../../../../../runbook/driving-the-app/walking-the-event-wizard.md): the click path instruction 5.2 follows.
- `frontend/src/components/booking/EventBookingSummaryDrawer.jsx`, `frontend/src/components/FilterSidebar.jsx`, `frontend/src/pages/SelectArtists.jsx`: three of the fifteen narrow spaces.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[07-prove-it-and-write-it-down.md](07-prove-it-and-write-it-down.md), which builds the check that
catches an invented style, removes the five dead class names, and writes the two runbook recipes
this scope owes.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is a layout rule applied to components and
checked by dragging things.
   also: `/unpack frontend/src/pages/SelectArtists.jsx` at task 1.2, and `/ux-scout` is worth
   considering before instruction 5.2 if a second reading of the wizard's mobile behaviour would
   help, though the walk itself is not delegable.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A container query silently does nothing | Any component whose parent has no `container-type` | The query falls back to the viewport with no error. Check the parent, not the component. |
| A provider list or drawer is empty with no error | Instruction 4.1 and 5.3 | Availability slots are not materialized, or the booking scenarios are not seeded. Both return an empty list rather than failing. |
| The browser suite runs logged out | Any attempt to check this plan with Playwright | `fixing-create-event` fixes it. Both checks here are a person at a screen. |
| A step reads fine and cannot be completed | Instruction 5.2, when the wizard is looked at rather than used | Fill every step in. A control that is off-screen or unreachable looks correct in a screenshot. |
