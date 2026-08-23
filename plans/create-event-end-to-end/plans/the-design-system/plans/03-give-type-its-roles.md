# 🔤 Give Type Its Roles

Step 3 of 7 in this scope. Waits on [01](01-measure-it-and-take-the-stack-decision.md) and on
nothing else, so it runs at the same time as [02](02-name-the-colours-and-the-spacing.md) and
[04](04-say-what-moves-and-what-does-not.md). Next:
[05-the-components-that-own-the-styles.md](05-the-components-that-own-the-styles.md).

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

Scope: [the design system](../MASTER_PLAN.md). Third of seven, and the second of the three that fill
in the file [01](01-measure-it-and-take-the-stack-decision.md) chose.

This plan owns type and nothing else. [02](02-name-the-colours-and-the-spacing.md) owns colour,
spacing, radius and elevation; [04](04-say-what-moves-and-what-does-not.md) owns motion. The three
share a file and a notation, both settled by
[01](01-measure-it-and-take-the-stack-decision.md)'s contract, and touch none of each other's
content, which is why they run at the same time.

Kept apart from [04](04-say-what-moves-and-what-does-not.md) on purpose: both replace an ad-hoc
scale with named steps, but their checks are unrelated. Type is checked by reading a screen and
asking whether two things that mean the same look the same. Motion is checked by turning reduced
motion on at the operating system level. Merging them makes one plan with two unrelated gates, which
is the shape that gets half-ticked. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#seven-plans-not-five).

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 24.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**Eleven text sizes and six font weights are in use, and no combination of them has a name.**

The sizes: `text-sm` 643 times, `text-xs` 256, `text-lg` 95, `text-xl` 81, `text-2xl` 78, `text-3xl`
and `text-4xl` 34 each, `text-base` 32, `text-5xl` 20, `text-6xl` 7, `text-7xl` 3.

The weights: `font-semibold` 498, `font-bold` 245, `font-medium` 156, `font-black` 36,
`font-normal` 9, `font-extrabold` 6.

Sixty-six pairs are possible and nothing says which of them is a card title. So a card title is
whatever the author of that card chose, and there is no way to find out what the previous author
chose except by opening their file. That is why `font-semibold` and `font-bold` are both in heavy
use for what is visually the same job.

**This plan gives the pairs names.** A role says the size, the weight, the line height and what it
is for, and after this plan a person writing a card title looks up "card title" instead of choosing
between eleven sizes.

**It does not rewrite the app.** The 110 files keep their utility classes until something touches
them. [05](05-the-components-that-own-the-styles.md) makes the shared components use roles, and
pages follow when they are next edited.

**The exact numbers and the commands that produced them are in
[plan 01](01-measure-it-and-take-the-stack-decision.md)'s notes file**, and this plan's after-numbers
are those same commands run again.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Instruction 4 reads
  real screens, so `npm run dev` has to be running. Nothing else does.
- **Vite pre-bundles and caches.** A change to `tailwind.config.js` or to a stylesheet import needs
  the dev server restarted rather than the page reloaded.
- **Nothing here touches the backend.**

One fact this plan needs is not in `environment/` and comes from
[plan 01](01-measure-it-and-take-the-stack-decision.md): **which file the roles live in and in what
notation.** This plan reads it rather than assuming it.

A second is not written anywhere and must be established rather than inferred: **which typeface the
app actually uses.** Neither `index.css` nor `tailwind.config.js` declares a font family, so the app
is rendering in Tailwind's default font stack, which resolves differently on different operating
systems. [Task 1.3](#1--read-the-contract-and-establish-the-typeface) settles what it is before any
role is written, because a line height chosen against the wrong typeface is wrong everywhere at
once.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A role names a job, not a size.**

`text-lg-semibold` is two utility classes with a hyphen. `card-title` is a role. The test is the same
one [02](02-name-the-colours-and-the-spacing.md) uses on colour: if the size changed, would the name
still be correct?

**Fewer roles than the app currently has pairs, deliberately.**

The goal is not to name all sixty-six possible pairs, nor even all the pairs actually in use. It is
to find the handful of jobs the interface really has and give each one a role. Six to ten is the
range this app's screens suggest. If the count comes out near twenty, the grouping was done by
appearance rather than by job.

**Line height is part of the role, and it is currently nobody's decision.**

The counts cover size and weight because those are what the utility classes carry. Line height is
mostly inherited, which means it is whatever Tailwind's default for that size is, which means a
heading and a paragraph at the same size get the same leading. A role that names size and weight and
leaves line height out has left out the thing that makes a paragraph readable.

**Two things that mean the same must look the same, and that is a screen check.**

The one honest test of a type scale is putting two screens side by side and asking whether the card
title on one and the card title on the other are the same thing. That cannot be done from a table.
It is instruction 4, and it is the gate.

**This plan does not restyle the app.**

The count of distinct sizes will barely move here. It falls in
[05](05-the-components-that-own-the-styles.md) and afterwards. Recording an unmoved number is what
stops a later plan claiming credit for a move this one never promised.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Eleven sizes and six weights is not a scale, it is sixty-six unmade decisions**, and naming the
handful of jobs the interface actually has removes sixty of them.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

`font-semibold` appears 498 times and `font-bold` 245 times. Nobody decided that a card title is
semibold and a page heading is bold; two groups of people each made a reasonable local choice and
the two groups never compared notes.

The effect on a reader is not that any single screen looks wrong. It is that the interface stops
teaching. When a title on one screen is bold and a title on the next is semibold, weight stops
carrying meaning, and the reader has to work out the hierarchy of every screen from scratch.

The effect on a builder is worse: there is no correct answer to look up, so every new screen adds
one more local decision, and the problem grows with the product.

Naming the roles is what lets [05](05-the-components-that-own-the-styles.md) build a card that is
right rather than plausible, and what gives [07](07-prove-it-and-write-it-down.md)'s check something
to test a page against.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE: 11 sizes x 6 weights, no names

    text-7xl  text-6xl  text-5xl  text-4xl  text-3xl  text-2xl
    text-xl   text-lg   text-base text-sm   text-xs
      x
    font-black  font-extrabold  font-bold  font-semibold
    font-medium font-normal
                                              = 66 possible pairs
                                                nothing says which is a card title

  AFTER: a handful of roles, each naming a job

    page-title      ─ size, weight, line height, and what it is for
    section-title   ─   "
    card-title      ─   "     <- the one the app disagrees with itself about
    body            ─   "
    body-muted      ─   "
    label           ─   "
    caption         ─   "

  and NOT: 110 files rewritten. That is 05, and only for shared components.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is filled in by what this plan builds.

**Subject: three empty rooms.** The three places a style decision could live, all empty. This plan
fills the type part of whichever one [01](01-measure-it-and-take-the-stack-decision.md) chose.
[Piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered).
Save as `../diagrams/subject-01-three-empty-rooms.png`. *(image not yet generated)*

The size chip on each of that piece's eight browser cards is what this plan replaces with a role
name.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**One type group in the token file**, at the path
[01](01-measure-it-and-take-the-stack-decision.md)'s contract names. Each role carries four things:
the size, the weight, the line height, and a one-line statement of what it is for.

**One mapping section** added to `artifacts/notes/the-design-system/what-became-what.md`, with a row
per size-and-weight pair currently in use: the pair, roughly how often it appears, the role it maps
to, and a reason where a pair is being dropped rather than replaced.

**One screenshot pair** showing the same job on two screens before the roles existed, which is the
evidence that the disagreement was real rather than assumed.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), putting every style decision in one
place a person can read in a minute, for the property that carries an interface's hierarchy.

**Goal.** The type roles exist in the token file, each with size, weight, line height and a purpose
line; the typeface the app renders in is established rather than assumed; every size-and-weight pair
in use maps to a role; and two screens showing the same job have been compared by eye.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/03-give-type-its-roles.md`

▶ **Next: [task 1.1](#1--read-the-contract-and-establish-the-typeface)**.

### 1. 📖 Read the contract and establish the typeface

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read the stack decision and quote the contract verbatim**
  - `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`, the section written by
    [task 4.2 of plan 01](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record).
  - Produces: the file roles live in, the notation, and how a component reads one.
  - Done when: it is quoted, not summarised.
  - ❌ If plan 01 has taken no decision, stop.

- [ ] **1.2 Pull the type counts forward**
  - Re-run [task 2.2 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged, and confirm the answers still match.
  - Produces: the two frequency tables, live.
  - Done when: this plan is working from current numbers rather than from a quotation.

- [ ] **1.3 Establish which typeface the app actually renders in**
  ```
  cd /home/molef/Work/attica/frontend
  grep -rn "font-family\|fontFamily\|@import.*fonts\|<link.*fonts" src/index.css src/App.css index.html tailwind.config.js src/App.jsx
  ```
  - Produces: either a declared font family with where it is declared, or an empty result meaning
    the app is rendering in Tailwind's default stack, which resolves to a different typeface per
    operating system.
  - Done when: the answer is written down as a fact rather than assumed. **If the result is empty,
    that is itself a finding and it belongs in the notes**, because a line height chosen against the
    wrong typeface is wrong on every screen at once, and because it means the app looks different on
    Windows and on macOS today with nobody having decided that.
  - ❌ If it is empty, do not pick a typeface here. Record the finding, name it as a decision for a
    person, and put it in instruction [4.4](#4--read-two-screens-side-by-side). Choosing a typeface
    is a product decision wearing a technical hat.

▶ **Next: [task 2.1](#2--find-the-jobs-the-interface-actually-has)**.

### 2. 🔎 Find the jobs the interface actually has

◀ **Needs: [task 1](#1--read-the-contract-and-establish-the-typeface)**.

- [ ] **2.1 List the distinct jobs text does in this app, from the screens rather than from theory**
  - Read the four screens the app is actually built around: the organizer dashboard
    (`frontend/src/EventOrganizerDashboard.jsx`), a provider list (`frontend/src/Artists.jsx`), a
    booking request page (`frontend/src/BookingRequestPage.jsx`) and one wizard step
    (`frontend/src/ListingStep1.jsx`).
  - Produces: one list of jobs, such as the page title, the section title, the card title, body
    text, muted body text, a form label, a caption and a number shown large.
  - Done when: every job on the list was found on a screen rather than proposed. A role nobody needs
    is a role somebody will use for the wrong thing.
  - 💡 `/unpack frontend/src/BookingRequestPage.jsx` first: at 1,132 lines it is the second largest
    file in the app and carries the widest range of text jobs on one screen.

- [ ] **2.2 Attach the current pairs to the jobs**
  - For each job, list the size-and-weight pairs currently used for it, with roughly how often.
  - Produces: the evidence of disagreement, per job. The card title is expected to carry both
    `font-semibold` and `font-bold`; write down what the actual split is rather than assuming it.
  - Done when: each job has its list, and any job with two or more competing pairs is flagged. Those
    flags are what instruction 4 goes and looks at.

- [ ] **2.3 Reduce the jobs to roles and settle each competing pair**
  - Produces: the final list of roles, six to ten, each with the pair that won and one line saying
    why.
  - Done when: no role is defined twice under two names, and every competing pair from
    [task 2.2](#2--find-the-jobs-the-interface-actually-has) has a winner.
  - ❌ If the list is heading past fifteen roles, stop and regroup: jobs are being split by
    appearance rather than by purpose, which produces a scale that is as hard to choose from as the
    sixty-six pairs it replaced.

▶ **Next: [task 3.1](#3--write-the-roles-and-map-what-they-replace)**.

### 3. ✍️ Write the roles and map what they replace

◀ **Needs: [task 2](#2--find-the-jobs-the-interface-actually-has)**.

- [ ] **3.1 Write each role with all four of its parts**
  - Size, weight, line height, and one line saying what it is for. Into the file from
    [task 1.1](#1--read-the-contract-and-establish-the-typeface).
  - Line height is chosen deliberately for each role rather than inherited: a heading and a
    paragraph at the same size need different leading, and inheriting is how they end up with the
    same.
  - The naming test, applied before each role is written: **if the size changed, would the name
    still be correct?** `card-title` passes. `text-lg-semibold` fails.
  - Done when: every role has all four parts and no role name contains a size or a weight.

- [ ] **3.2 Add the type section to the mapping table**
  - `artifacts/notes/the-design-system/what-became-what.md`, the file
    [02](02-name-the-colours-and-the-spacing.md) creates. One row per size-and-weight pair in use:
    the pair, roughly how often it appears, the role it maps to.
  - Done when: all eleven sizes and all six weights appear somewhere in the section, and a pair
    being dropped rather than mapped carries its reason in the same row.
  - Both plans write into this file. If [02](02-name-the-colours-and-the-spacing.md) has not created
    it yet, create it with the type section and leave the colour sections for that plan.

- [ ] **3.3 Take the after-numbers with the same commands**
  - Re-run [task 2.2 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged.
  - Done when: both counts are recorded beside the before-numbers. **They will barely move, and that
    is the correct outcome.** This plan names the roles; the counts fall in
    [05](05-the-components-that-own-the-styles.md) and afterwards.

▶ **Next: [instruction 4.1](#4--read-two-screens-side-by-side)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4](#4--read-two-screens-side-by-side)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 👀 Read two screens side by side

◀ **Needs: [task 3](#3--write-the-roles-and-map-what-they-replace)** done, so there are roles to
check the screens against.

A type scale is judged by looking at two screens and asking whether the same job looks the same on
both. Nothing in a table can answer that.

4.1 **Put two screens side by side at the same zoom**
   - Start the frontend: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Open two Chrome windows at `http://localhost:5173`, side by side, both at 100% zoom. Put the
     organizer dashboard in one and a provider list in the other.
   - Expected result: both show cards with titles.
   - ✅ You can see both card titles at once: this is the comparison.
   - ❌ One screen needs a login you do not have: three of the five roles are granted by nothing
     today, which `getting-in` fixes. Use two screens the organizer can reach and say which two you
     used.

4.2 **Compare the one job the app disagrees with itself about**
   - Look at the card title on the left and the card title on the right.
   - ✅ They look different: that is the defect, on your screen. Screenshot both windows in one
     capture and save it as
     `artifacts/figures/the-design-system/two-card-titles-two-weights.png`.
   - ❌ They look the same: then the disagreement recorded in
     [task 2.2](#2--find-the-jobs-the-interface-actually-has) is not visible on these two screens.
     Try a wizard step against a booking request page, and if it is still not visible, write that
     down. A counted difference that nobody can see is a smaller problem than this plan assumes, and
     saying so is worth more than proving the plan right.

4.3 **Read the role list without looking at the values**
   - Cover the sizes and weights and read only the role names, in order.
   - ✅ You can say what each one is for and where you would use it: the roles are jobs.
   - ❌ A name tells you a size: rename it.

4.4 **Decide the typeface, if task 1.3 found none declared**
   - If the app is rendering in Tailwind's default stack, it looks different on Windows and macOS
     today and nobody chose that.
   - ✅ You have either named a typeface and where it will be loaded from, or written down that the
     default stack is deliberate and why: either is a decision.
   - ❌ You want to defer: record it with a date. Line heights written against an unknown typeface
     are a guess, so note in the role file that they are provisional until this is settled.

4.5 **Count the roles out loud**
   - ✅ Between six and ten: the scale is choosable.
   - ❌ More than fifteen: go back to [task 2.3](#2--find-the-jobs-the-interface-actually-has). A
     scale that is hard to choose from has not replaced the problem, it has renamed it.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody writing a card title looks up "card title" instead of choosing
> between eleven sizes, and the card they build matches the card on the next screen.

Pass:

- Every role carries a size, a weight, a line height and a line saying what it is for.
- No role name contains a size or a weight, checked out loud in instruction 4.3.
- The typeface the app renders in is established as a fact, and if none is declared, that finding is
  written down and either decided or deferred with a date.
- Every one of the eleven sizes and six weights appears in the mapping section.
- Two screens have been compared by eye and the result is recorded, including if the expected
  disagreement was not visible.
- Six to ten roles.
- The after-numbers are recorded with the same commands as the before-numbers, including where they
  did not move.

Fail, and what it means:

- A role named for its value. The name outlives the value and then misleads.
- Line height omitted. Then a heading and a paragraph at the same size get the same leading, which
  is the specific thing a type scale is supposed to fix and the one most often skipped.
- Twenty roles. The sixty-six pairs were renamed rather than reduced.
- The typeface question answered by assumption. A line height chosen against the wrong typeface is
  wrong on every screen simultaneously, and it looks like a rendering problem rather than a
  decision.
- The screen comparison skipped because the table already showed the disagreement. The table shows a
  count; the screen shows whether it matters.

Partial pass is acceptable on the large-number role alone. Whether a dashboard shows a big count is
a screen decision that belongs to `the-event-workspace`, so a role for it can be deferred with a
note rather than invented here.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The type roles, four parts each | the file plan 01's contract names | — | not started |
| The type section of the mapping table | `artifacts/notes/the-design-system/what-became-what.md` | — | not started |
| The typeface finding, and the decision or the deferral | inside the mapping table | — | not started |
| The after-numbers, with the same commands | inside the mapping table | — | not started |
| Two card titles at two weights, on two screens | `artifacts/figures/the-design-system/two-card-titles-two-weights.png` | — | not started |
| Three empty rooms | [piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered) → `../diagrams/subject-01-three-empty-rooms.png` | subject | ⏳ not rendered |
| Seven plans, seven gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-seven-plans-seven-gates-planned--not-rendered) → `../diagrams/process-02-seven-plans-seven-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/03-give-type-its-roles.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the screen with the widest range of text jobs | `/unpack frontend/src/BookingRequestPage.jsx` | task 2.1 | The jobs text does on one real screen read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the stack decision](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record): the contract this plan writes into.
- [the decisions taken here](../decisions-taken-here.md#seven-plans-not-five): why type and motion are two plans rather than one.
- [the scope's master plan](../MASTER_PLAN.md): the counts, with the commands behind them in plan 01.
- `frontend/src/BookingRequestPage.jsx`: 1,132 lines and the widest range of text jobs on one screen.
- `frontend/src/EventOrganizerDashboard.jsx`, `frontend/src/Artists.jsx`, `frontend/src/ListingStep1.jsx`: the other three screens task 2.1 reads.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-the-components-that-own-the-styles.md](05-the-components-that-own-the-styles.md), which builds
the shared components that consume these roles. It waits on this plan,
[02](02-name-the-colours-and-the-spacing.md) and [04](04-say-what-moves-and-what-does-not.md), all
three of which run at the same time.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is reading four screens for the jobs text
does, then a decision checked by eye.
   also: `/unpack frontend/src/BookingRequestPage.jsx` at task 2.1, which is help with one task
   rather than the shape of the plan.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Three of five roles cannot log in | Instruction 4.1, comparing two screens that need different roles | `getting-in` fixes it. Until then, compare two screens the organizer can reach and say which two. |
| A config change appears not to take effect | `tailwind.config.js` edits under a running Vite dev server | Restart the dev server rather than reloading the page. |
| A count that moved without the code moving | Any before-and-after in this scope | Use the pinned commands from [plan 01 task 2](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them) at both ends. |
