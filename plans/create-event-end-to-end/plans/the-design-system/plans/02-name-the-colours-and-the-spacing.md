# 🎨 Name The Colours And The Spacing

Step 2 of 7 in this scope. Waits on [01](01-measure-it-and-take-the-stack-decision.md) and on
nothing else, so it runs at the same time as [03](03-give-type-its-roles.md) and
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

Scope: [the design system](../MASTER_PLAN.md). Second of seven, and the first of the three that fill
in the empty file [01](01-measure-it-and-take-the-stack-decision.md) chose.

This plan owns colour, spacing, radius and elevation. [03](03-give-type-its-roles.md) owns type and
[04](04-say-what-moves-and-what-does-not.md) owns motion. The three touch nothing of each other's,
which is why they run at the same time, and the one thing they share is the file and the notation,
both settled in [01](01-measure-it-and-take-the-stack-decision.md)'s contract.

[05](05-the-components-that-own-the-styles.md) waits on all three, because a button consumes a
colour, a type role and a duration.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 23.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**287 distinct colour utility classes are in use, drawing on 19 colour families.** Two of those
families are greys and they are different greys: `text-gray-500` appears 238 times and
`text-slate-700` 71 times, and nothing in the repository says which one a new muted line should use.
Two more are accents: `text-pink-600` 55 times against `text-rose-700` 17, `bg-pink-600` 42 against
`bg-rose-600` 10.

**58 more colours are written by hand**, in 9 files, 95 times, 52 of them as Tailwind arbitrary
values in square brackets. The bracket notation is the language's own way of saying "the palette
does not have this". Six carry an alpha suffix, such as `[#fff3ea1a]` and `[#f7d8c6a3]`, so opacity
is being baked into the colour rather than named separately.

**Shape is the same story quieter.** Seven corner radii, led by `rounded-xl` at 268 uses and
`rounded-lg` at 225, with no rule about which belongs to a card and which to a chip. Eight elevation
steps, one of which (`shadow-xs`, three uses) does not exist in this version of Tailwind and renders
nothing.

**This plan names all of it.** It does not repaint the app. The deliverable is a vocabulary in one
file plus a mapping that says which of the counted values each name replaces, so
[05](05-the-components-that-own-the-styles.md) has something to build components out of and
[07](07-prove-it-and-write-it-down.md) has something to check pages against.

**The exact numbers and the commands that produced them are in
[plan 01](01-measure-it-and-take-the-stack-decision.md)'s notes file**, and this plan's after-numbers
are those same commands run again.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Instruction 4 drives
  a real browser, so `npm run dev` has to be running in its own terminal. Nothing else does.
- **Vite pre-bundles dependencies and caches what it optimised.** Editing `tailwind.config.js` or
  adding a stylesheet import is the class of change that needs the dev server restarted rather than
  the page reloaded. A token that "did not take effect" is more often this than a wrong value.
- **Nothing here touches the backend.** The two already-failing backend tests are irrelevant to this
  plan in both directions.

One fact this plan needs is not in `environment/` and comes from
[plan 01](01-measure-it-and-take-the-stack-decision.md) instead: **which file tokens live in and in
what notation**. That is the stack decision, and this plan reads it rather than assuming it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A token is named for its job, never for its value.**

`brand-pink-600` is a value with a prefix. `action-primary` is a job. The test is whether the name
survives the value changing: if the accent moves from pink to rose, `action-primary` is still
correct and `brand-pink-600` is now a lie that will be believed for two years. This is the one rule
in this plan that everything else follows from.

**Every counted value gets mapped, including the ones that get merged away.**

58 hand-written hex values and 287 utility classes will not become 58 and 287 tokens; most of them
collapse. The mapping table is what records the collapse, so somebody later can find out what
`#fff3ea` became rather than concluding it was lost.

**Two greys and two accents is the finding, not a rounding error.**

`gray` and `slate` are different palettes and both are in heavy use. So are `pink` and `rose`. This
plan picks one of each pair and says so, and the mapping table sends the loser's values to the
winner's tokens. Picking neither, and defining a token for each, keeps the ambiguity with a new name
on it.

**Opacity is a separate decision from colour.**

Six of the hand-written values carry an alpha channel in the hex itself. A token with baked-in
opacity cannot be reused at a different opacity, and the six will multiply. Name the colour, and
name the opacity separately.

**This plan does not repaint the application.**

Rewriting 110 files to use the new names is not a task here and is not a task in this scope at all.
[05](05-the-components-that-own-the-styles.md) makes the shared components consume tokens, and pages
follow when they are next touched. A plan that tried to do both would produce a large diff nobody
could review and a token file nobody had thought hard about.

**Spacing is the one part with no before-number, and that is deliberate.**

The counts in [01](01-measure-it-and-take-the-stack-decision.md) cover colour, type, radius,
elevation, motion, components and layout. Spacing utilities in Tailwind are already a named scale
that the app uses as intended, so there is no ad-hoc spacing problem to measure. What is missing is
semantic spacing: names for the gaps that recur, such as the gap inside a card and the gap between
cards. That is a small addition rather than a migration, and it is [task 3](#3--name-the-spacing-radius-and-elevation).

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A token named for its job survives the value changing, and a token named for its value becomes a
lie the first time somebody changes the accent.**

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Somebody building a card today has to decide what colour the muted line under the title is. There is
no answer to look up, so they look at a nearby card, and the nearby card was built the same way. Two
different greys are in heavy use because two people made that decision on two days and both were
being careful.

The cost is not that it looks bad. It is that nobody can change it. An accent that lives in 55
places as `text-pink-600` and 17 places as `text-rose-700` and 7 places as `#FF5A5F` cannot be
adjusted, so it never is, and every future decision is made around a colour nobody chose on purpose.

Naming the vocabulary is what makes the rest of this scope possible.
[05](05-the-components-that-own-the-styles.md) has nothing to build a button out of until this
exists, and [07](07-prove-it-and-write-it-down.md)'s check has no definition of "invented" to test
against.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE                                       AFTER

  text-gray-500     238x  ─┐
  text-slate-500     62x  ─┼──────────────►   text-muted
  #6a4d43             2x  ─┘

  bg-pink-600        42x  ─┐
  bg-rose-600        10x  ─┼──────────────►   action-primary
  #FF5A5F             7x  ─┘

  rounded-xl        268x  ─┐
  rounded-2xl       135x  ─┼──────────────►   radius-card
  rounded-lg        225x  ─┘                  radius-control
                                              radius-pill

     287 utilities                            one file
    + 58 hex values      ──── mapped to ────► a name per job
      19 families                             a table saying what became what

  and NOT: 110 files rewritten. That is 05, and only for shared components.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is filled in by what this plan builds.

**Subject: three empty rooms.** The three places a style decision could live, all empty. This plan
fills the colour, spacing, radius and elevation part of whichever one
[01](01-measure-it-and-take-the-stack-decision.md) chose.
[Piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered).
Save as `../diagrams/subject-01-three-empty-rooms.png`. *(image not yet generated)*

The counter chips along that piece's top edge carry the distinct-utility count, the family count and
the hex count, which are three of the numbers this plan moves.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**One token file**, at the path [01](01-measure-it-and-take-the-stack-decision.md)'s contract names,
holding four groups.

1. **Colour.** Names for jobs: surface, raised surface, border, text at each of its levels, the
   primary action and its hover and disabled forms, and one name per status the interface reports.
   Opacity named separately from colour.
2. **Spacing.** Names for the gaps that recur: inside a card, between cards, between a label and its
   field, and around a page's content.
3. **Radius.** One name per kind of thing that has corners, not one per value.
4. **Elevation.** One name per level of "how far off the page is this", with the level's job in the
   name.

**One mapping table**, at `artifacts/notes/the-design-system/what-became-what.md`, with a row per
counted value: the old class or hex, how many times it appeared, the token it maps to, and a blank
allowed only where the value is being dropped rather than replaced, with a reason in that row.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), putting every style decision in one
place a person can read in a minute, for the four properties that carry most of an interface's
character.

**Goal.** The token file exists at the contract's path, every token is named for its job, the
mapping table accounts for all 58 hand-written hex values and every colour utility family, and the
two greys and two accents have each been reduced to one.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/02-name-the-colours-and-the-spacing.md`

▶ **Next: [task 1.1](#1--read-the-contract-this-plan-writes-into)**.

### 1. 📖 Read the contract this plan writes into

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read the stack decision and quote the contract verbatim**
  - `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`, the section written by
    [task 4.2 of plan 01](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record).
  - Produces: the file tokens live in, the notation, how a component reads one, and what to do when
    a needed token does not exist yet, quoted into this plan's working notes.
  - Done when: the answer is quoted, not summarised. This plan writes into that file and only that
    file.
  - ❌ If plan 01 has taken no decision, stop. Writing tokens into a file chosen by this plan is the
    drift plan 01 exists to prevent, and it is invisible afterwards.

- [ ] **1.2 Pull the colour and shape counts forward**
  - Re-run [tasks 2.1 and 2.3 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them)
    and confirm the answers still match what that plan recorded.
  - Produces: the current numbers, and a note if any has moved since plan 01 ran.
  - Done when: this plan is working from live numbers rather than from a quotation of a quotation.
    A number that moved means somebody changed the tree between the two plans, which is worth one
    line and not worth stopping for.

▶ **Next: [task 2.1](#2--name-the-colours)**.

### 2. 🎨 Name the colours

◀ **Needs: [task 1](#1--read-the-contract-this-plan-writes-into)**.

- [ ] **2.1 Group the 287 utilities and the 58 hex values by the job they are doing**
  - Read the actual usage rather than sorting by hue: what is this colour on, and what is it
    telling the reader. Page background, card background, hairline border, heading text, body text,
    muted text, the primary action, a destructive action, and one group per status the interface
    reports.
  - Produces: one group per job, each listing every class and hex value currently doing that job
    with its usage count.
  - Done when: every one of the 58 hex values is in exactly one group, and every colour family from
    the count appears somewhere. A value that fits no group goes in a named "unclear" group with the
    file it came from, not into the nearest group.
  - 💡 `/unpack frontend/src/pages/SelectArtists.jsx` first: it is one of the nine files carrying
    hand-written hex, it renders both into a grid and into a sidebar, and it is the clearest single
    example of the same colour doing two different jobs.

- [ ] **2.2 Settle the two greys and the two accents, and record which lost**
  - `gray` against `slate`; `pink` against `rose`. Pick one of each.
  - Produces: two sentences naming the winner and the reason, and a line in the mapping table
    sending every one of the loser's values to the winner's token.
  - Done when: neither loser has a token of its own. Defining a token for both keeps the ambiguity
    and gives it a name, which is worse than leaving it alone because it looks solved.

- [ ] **2.3 Write the colour tokens, named for their jobs**
  - Into the file from [task 1.1](#1--read-the-contract-this-plan-writes-into).
  - The naming test, applied to every token before it is written: **if the value changed, would the
    name still be correct?** `action-primary` passes. `brand-pink-600` fails.
  - Produces: the colour group of the token file.
  - Done when: no token name contains a hue word or a numeric shade from Tailwind's scale, and every
    token has a one-line comment saying what it is for.

- [ ] **2.4 Name opacity separately from colour**
  - Six hand-written values carry an alpha suffix in the hex: `[#fff3ea1a]`, `[#f7d8c6a3]` and
    `[#f6dacb66]` among them.
  - Produces: a small set of named opacity steps, and mapping rows sending each of the six to a
    colour token plus an opacity token.
  - Done when: no colour token has opacity baked into its value.

▶ **Next: [task 3.1](#3--name-the-spacing-radius-and-elevation)**.

### 3. 📐 Name the spacing, radius and elevation

◀ **Needs: [task 2](#2--name-the-colours)**.

- [ ] **3.1 Name the gaps that recur**
  - Read what the app actually does rather than inventing a scale: the gap inside a card, the gap
    between cards in a grid, the gap between a label and its field, and the padding around a page's
    content.
  - Produces: the spacing group of the token file, each name saying where the gap is.
  - Done when: each name is a place rather than a size. Tailwind's numeric scale stays as it is for
    one-off spacing; these are names for the gaps that repeat.

- [ ] **3.2 Reduce seven radii to one name per kind of thing with corners**
  - The counts: `rounded-xl` 268, `rounded-lg` 225, `rounded-full` 219, `rounded-2xl` 135, bare
    `rounded` 52, `rounded-3xl` 35, `rounded-md` 26.
  - Produces: a small set of names such as the card corner, the control corner and the pill, each
    with its value, and mapping rows sending all seven current values to one of them.
  - Done when: the number of names is smaller than seven and every one of the seven values has a
    destination. If a value genuinely has no home, that row says so and says which file uses it.

- [ ] **3.3 Reduce eight elevation steps to named levels, and account for the dead one**
  - The counts: `shadow-sm` 96, bare `shadow` 58, `shadow-lg` 54, `shadow-md` 37, `shadow-xl` 20,
    `shadow-2xl` 13, `shadow-inner` 3, `shadow-xs` 3.
  - `shadow-xs` does not exist in Tailwind 3.4.17 and renders nothing at
    `frontend/src/ListingReview.jsx:374`, `:381` and `:389`. Its mapping row says which level those
    three cards were meant to have.
  - Produces: named levels with their values, and mapping rows for all eight.
  - Done when: every level's name says how far off the page the thing is, and the `shadow-xs` row
    names its intended level. [07](07-prove-it-and-write-it-down.md) edits those three lines; this
    plan decides what they should say.

- [ ] **3.4 Write the mapping table**
  - `artifacts/notes/the-design-system/what-became-what.md`, one row per counted value: the old
    class or hex, its usage count, the token it maps to, and the file it came from where that helps.
  - Produces: the record of the collapse, so a value that disappeared can be traced.
  - Done when: all 58 hex values have a row, all seven radii and all eight elevation steps have a
    row, and every colour family from the count is represented. A row with a blank destination
    carries a reason in the same row.

- [ ] **3.5 Take the after-numbers with the same commands**
  - Re-run [task 2.1 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged.
  - Produces: the distinct-utility count and the hand-written hex count, after.
  - Done when: both are recorded beside the before-numbers. **These will barely move, and that is
    the correct outcome for this plan.** This plan names the vocabulary; the counts fall in
    [05](05-the-components-that-own-the-styles.md) and in every later file that gets touched.
    Recording an unmoved number here is what stops a later plan claiming credit for a move this one
    never promised.

- [ ] **3.6 Write the grouping's card entry**
  - Add the mapping table to `artifacts/notes/the-design-system/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`: what it holds, how it was established, what it lets you
    say, what it cannot say.
  - Done when: the provenance is in the card as prose.

▶ **Next: [instruction 4.1](#4--look-at-the-palette-on-a-screen)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4](#4--look-at-the-palette-on-a-screen)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 👀 Look at the palette on a screen

◀ **Needs: [task 3](#3--name-the-spacing-radius-and-elevation)** done, so there is a token file to
look at.

A palette is judged by eye and by name, and neither judgement can be made from a list of hex codes
in a text file.

4.1 **Put every colour token on one page and look at it**
   - Build a scratch page that renders one swatch per colour token with its name under it, grouped
     as the token file groups them. Save it as `frontend/src/TokenPreview.jsx` and route to it
     temporarily, or open it in whatever preview the stack decision made available.
   - Start the frontend: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Expected result: one page, every token, names visible.
   - ✅ Two swatches that are meant to be different are visibly different: the set is doing its job.
     Screenshot it as `artifacts/figures/the-design-system/the-palette-on-one-page.png`.
   - ❌ Two swatches look the same to you: they are one token wearing two names. Merge them and note
     the merge in the mapping table.

4.2 **Read the names without looking at the swatches**
   - Cover the colours and read only the names, in order.
   - ✅ You can say what each one is for: the names are jobs.
   - ❌ A name tells you a colour rather than a job: rewrite it. `brand-pink-600` is the failure
     shape; `action-primary` is the target.

4.3 **Try to break the naming rule on purpose**
   - Pick one token and imagine the accent changing from pink to something else. Say out loud
     whether its name is still correct.
   - ✅ Every name survives: [task 2.3](#2--name-the-colours)'s test held.
   - ❌ One does not: that is the token to rename, and it is usually the one somebody was most sure
     about.

4.4 **Check the three dead shadows have a destination**
   - Open the mapping table and find the `shadow-xs` row.
   - ✅ It names the elevation level those three cards in `ListingReview.jsx` were meant to have:
     [07](07-prove-it-and-write-it-down.md) knows what to write.
   - ❌ The row is blank: decide it now. A blank there means [07](07-prove-it-and-write-it-down.md)
     guesses, and it will guess `shadow-sm` because the names look similar, which may not be what
     the author meant.

4.5 **Delete the scratch page**
   - Remove `frontend/src/TokenPreview.jsx` and its temporary route once the screenshot is saved.
   - The screenshot is the artifact. A preview page left in the tree becomes a file somebody
     maintains.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody building a card can find out what the muted line under the title
> should be by reading one file, and the answer is a name rather than a hex code.

Pass:

- The token file exists at the path plan 01's contract named, in that notation.
- Every token name survives its value changing, checked out loud in instruction 4.3.
- The two greys are one and the two accents are one, with the losers recorded.
- Opacity is named separately, and no colour token has an alpha channel in its value.
- All 58 hand-written hex values, all seven radii and all eight elevation steps have a row in the
  mapping table, and a blank destination carries a reason.
- The `shadow-xs` row names the level those three cards were meant to have.
- The after-numbers are recorded with the same commands as the before-numbers, including where they
  did not move.

Fail, and what it means:

- A token named for its value. That is the one failure that gets worse with time, because the name
  is believed long after the value has changed.
- A token defined for both greys or both accents. The ambiguity survived and now has documentation.
- The mapping table missing hex values. Then a colour vanished and nobody can find out what it
  became, which is the specific thing the table exists to prevent.
- An after-number reported as a win. This plan names things; it does not repaint the app, and
  claiming the count fell here is claiming [05](05-the-components-that-own-the-styles.md)'s work.

Partial pass is acceptable on the status colours alone. Which statuses the interface reports depends
on decisions taken in other scopes, so a short set now with a note saying it will grow beats
inventing statuses to fill the group out.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The colour, spacing, radius and elevation tokens | the file plan 01's contract names | — | not started |
| The mapping table, one row per counted value | `artifacts/notes/the-design-system/what-became-what.md` | — | not started |
| The two greys and two accents settled, losers recorded | inside the mapping table | — | not started |
| The `shadow-xs` destination | inside the mapping table | — | not started |
| The after-numbers, with the same commands | inside the mapping table | — | not started |
| Every colour token on one page with its name | `artifacts/figures/the-design-system/the-palette-on-one-page.png` | — | not started |
| Three empty rooms | [piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered) → `../diagrams/subject-01-three-empty-rooms.png` | subject | ⏳ not rendered |
| Seven plans, seven gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-seven-plans-seven-gates-planned--not-rendered) → `../diagrams/process-02-seven-plans-seven-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/02-name-the-colours-and-the-spacing.md` | task 0, before any work | Conformance and thin instructions reported |
| Read one file where a colour does two jobs | `/unpack frontend/src/pages/SelectArtists.jsx` | task 2.1 | The grid use and the sidebar use of the same colour read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the stack decision](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record): the contract this plan writes into.
- [the scope's master plan](../MASTER_PLAN.md): the counts, with the commands behind them in plan 01.
- `frontend/src/ListingReview.jsx:374`, `:381`, `:389`: the three cards whose elevation renders as nothing.
- `frontend/src/pages/SelectArtists.jsx`: hand-written hex, and the same card in a grid and in a sidebar.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-the-components-that-own-the-styles.md](05-the-components-that-own-the-styles.md), which builds
the shared components that consume these tokens. It waits on this plan,
[03](03-give-type-its-roles.md) and [04](04-say-what-moves-and-what-does-not.md), all three of which
run at the same time.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is a vocabulary decision checked by eye.
   also: `/unpack frontend/src/pages/SelectArtists.jsx` at task 2.1, and `/dataviz`'s palette
   guidance in `references/palette.md` is worth reading before task 2.3 for the accessibility
   floor a colour set has to clear, though its subject is charts rather than interfaces.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A config change appears not to take effect | `tailwind.config.js` edits under a running Vite dev server | Restart the dev server rather than reloading the page. Vite caches its pre-bundle. |
| A class name renders nothing and nothing reports it | `shadow-xs` at `ListingReview.jsx:374`, `:381`, `:389` | Confirm in the DevTools Styles pane rather than by reading the source. [Plan 07](07-prove-it-and-write-it-down.md) builds the check. |
| A count that moved without the code moving | Any before-and-after in this scope | Use the pinned commands from [plan 01 task 2](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them) at both ends. |
