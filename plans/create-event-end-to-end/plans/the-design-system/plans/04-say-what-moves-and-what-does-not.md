# 🎞️ Say What Moves And What Does Not

Step 4 of 7 in this scope. Waits on [01](01-measure-it-and-take-the-stack-decision.md) and on
nothing else, so it runs at the same time as [02](02-name-the-colours-and-the-spacing.md) and
[03](03-give-type-its-roles.md). Next:
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

Scope: [the design system](../MASTER_PLAN.md). Fourth of seven, and the third of the three that fill
in the file [01](01-measure-it-and-take-the-stack-decision.md) chose.

This plan owns motion and nothing else. [02](02-name-the-colours-and-the-spacing.md) owns colour,
spacing, radius and elevation; [03](03-give-type-its-roles.md) owns type. All three write into the
same file in the same notation and touch none of each other's content, which is why they run at the
same time.

Kept apart from [03](03-give-type-its-roles.md) because their checks are unrelated: this one is
checked by switching reduced motion on at the operating system level and watching seven ambient
animations stop. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#seven-plans-not-five).

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 25.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**Movement in this app comes from two systems with no rule about which to use.**

From the utility classes: `duration-300` 25 times, `duration-200` 13, `duration-500` 6, over 388
`transition` classes of one kind or another. From `frontend/src/index.css`: transitions at 250ms,
260ms, 300ms, 470ms and 620ms, plus a 300ms filter transition. So the same kind of movement is
written two ways with values that are close but not equal, and nothing says when to reach for which.

**`framer-motion` is imported in 17 files**, which is a third system again: whole-component
animation used in the wizard steps, the login and register pages, two booking modals and the
notifications modal.

**Seven animations run forever.** `index.css` declares `gradient-shift` at 4s, `navbar-mesh-pan` at
24s, `navbar-drift` at 12s, `home-drift` at 16s, `home-float` at 9s and again at 7s reversed, and
`tour-detail-drift` at 16s. All of them are `infinite`. Nothing in the repository says whether that
is a deliberate house style or six people each adding one.

**Two class names produce nothing at all.** `animate-fade-in-down` at
`frontend/src/EventListingPage.jsx:19` and `animate-fade-in` at `frontend/src/PostCard.jsx:21` are
neither Tailwind classes nor keyframes defined anywhere in `index.css`, `App.css` or
`tailwind.config.js`. Both elements are static and have always been.

**Reduced motion is honoured in three places and none of them completely.** `App.css:42` guards one
animation behind `prefers-reduced-motion: no-preference`. `index.css:38` and `index.css:576` are two
separate `prefers-reduced-motion: reduce` blocks, both using `!important`, written at different
times. Nobody has checked what actually stops.

**This plan writes the rules.** Named duration bands, one rule for which system a new movement uses,
a written list of what does not animate, and the three reduced-motion blocks reconciled into one
that is checked by a person with reduced motion switched on.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Instruction 4 needs
  it running. Nothing else does.
- **Vite pre-bundles and [caches](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>.** Config and stylesheet-import changes need the dev server
  restarted rather than the page reloaded.
- **Nothing here touches the backend.**

**One fact this plan needs is not in `environment/` and is not a repository fact at all**: how to
switch reduced motion on in the operating system this work is being done on. This is WSL2 on
Windows, so the browser reads the Windows setting rather than a Linux one, and it is
Settings → Accessibility → Visual effects → Animation effects. It is written here because it is the
plan's gate and because getting it wrong looks exactly like the rule not working.
[Instruction 4.2](#4--switch-reduced-motion-on-and-watch) also gives the DevTools route, which
emulates the same preference per tab and is the faster check.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Bands, not values.**

Naming nine durations gives nine names to choose between, which is the problem with a new label on
it. A small number of bands, each with a job (an instant state change, a normal transition, a
deliberate entrance), collapses the nine and makes the choice obvious.

**The list of what does not animate is the harder half and the one that gets skipped.**

Naming durations is pleasant. Writing down that a number changing does not animate, that a list
reordering does not animate, and that content arriving after a fetch does not slide in, is where a
motion language does its actual work: it stops movement being added because it is available.

**Seven infinite animations is a question for a person, not a rule to derive.**

`gradient-shift`, `navbar-mesh-pan`, `navbar-drift`, `home-drift`, `home-float` twice and
`tour-detail-drift` all run forever. Whether that is the house style or accumulated decoration is a
product judgement. This plan asks it, records the answer, and does not decide it in a task.

**Reduced motion is a correctness matter, not a preference.**

Three partial blocks written at three times means nobody knows what actually stops. The deliverable
is one rule and a person who has watched it work, which is why it is the gate rather than a task
tick.

**The two dead animation classes belong to [07](07-prove-it-and-write-it-down.md), and their
intended behaviour belongs here.**

This plan decides what `EventListingPage.jsx:19` and `PostCard.jsx:21` were meant to do:
a named entrance band, or nothing. [07](07-prove-it-and-write-it-down.md) edits the lines and builds
the check that would have caught them.

**This plan does not restyle the app.**

The duration count will barely move here. It falls when components and pages are next touched.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A motion language is mostly a list of things that do not move**, and the list is what stops an
interface acquiring movement one reasonable addition at a time.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Nine durations between 200ms and 620ms are all defensible individually. Together they mean the app
has no rhythm: a hover on one card settles at 200ms and the same hover on the next settles at 300ms,
and a reader feels the inconsistency without being able to name it.

Two class names that render nothing have been sitting in the tree because a movement that does not
happen looks the same as a movement somebody chose not to add. Nothing reports it, so nobody found
out.

And three reduced-motion blocks written at three different times means the app's answer to somebody
who has asked their operating system to stop animations is unknown. Not wrong necessarily, unknown,
which is worse because it cannot be relied on.

What this plan produces is what [05](05-the-components-that-own-the-styles.md) builds hover and
in-flight states out of, and what `the-event-workspace` will build a save indicator out of when it
needs one.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE                                    AFTER

  duration-200  ─┐
  250ms          │
  260ms          ├──────────────────────►   band: instant       (state change)
  duration-300   │                          band: normal        (transition)
  300ms          ├──────────────────────►   band: deliberate    (entrance)
  470ms          │
  duration-500   │                          + one rule: CSS transition, or framer-motion,
  560ms          │                            and when to use which
  620ms         ─┘

  7 infinite ambient animations  ──►  kept, trimmed or dropped: a person decides

  animate-fade-in-down  (renders nothing) ─┐
  animate-fade-in       (renders nothing) ─┴──►  a band, or removed. 07 edits the lines.

  3 partial prefers-reduced-motion blocks  ──►  one rule, watched working by a person

  and the list nobody writes:  WHAT DOES NOT ANIMATE
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is filled in by what this plan builds, and one process prompt draws
this plan's gate.

**Subject: three empty rooms.** The three places a style decision could live, all empty. This plan
fills the motion part of whichever one [01](01-measure-it-and-take-the-stack-decision.md) chose.
[Piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered).
Save as `../diagrams/subject-01-three-empty-rooms.png`. *(image not yet generated)*

**Process: seven plans, seven gates.** Step 25's stage draws the named duration chips, the
what-does-not-animate list card, and the single reduced-motion chip where three partial ones were.
[Process prompt 2](../diagram-prompts.md#prompt-2-process-seven-plans-seven-gates-planned--not-rendered).
Save as `../diagrams/process-02-seven-plans-seven-gates.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**One motion group in the token file**, at the path
[01](01-measure-it-and-take-the-stack-decision.md)'s contract names: named duration bands, each with
a value and a one-line statement of what it is for, and the easing that goes with each.

**One motion rules document**, at `artifacts/notes/the-design-system/how-things-move.md`, holding
four sections.

1. **The bands**, and which of the nine current durations maps to each.
2. **Which system for which movement.** When a CSS transition is right and when `framer-motion` is,
   stated as a test a person can apply rather than as a preference.
3. **What does not animate.** A written list, each entry with one line saying why.
4. **The ambient animations.** The seven infinite ones with the decision taken on each, and the
   reduced-motion rule as one rule with what it stops.

**One reconciled reduced-motion block**, replacing `App.css:42`, `index.css:38` and `index.css:576`.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 4](../MASTER_PLAN.md#objectives), saying what moves, how fast, and
what does not move at all.

**Goal.** The duration bands exist in the token file; all nine current durations map to one; the
rule for choosing between a CSS transition and `framer-motion` is written as a test; the list of
what does not animate exists; the seven ambient animations each have a decision; and one
reduced-motion rule has been watched working by a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/04-say-what-moves-and-what-does-not.md`

▶ **Next: [task 1.1](#1--read-the-contract-and-inventory-the-movement)**.

### 1. 📖 Read the contract and inventory the movement

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read the stack decision and quote the contract verbatim**
  - `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`, the section written by
    [task 4.2 of plan 01](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record).
  - Done when: the file, the notation and how a component reads a token are quoted, not summarised.
  - ❌ If plan 01 has taken no decision, stop.

- [ ] **1.2 Pull the motion counts forward and list every ambient animation with its line**
  - Re-run [task 2.4 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged.
  - Produces: the utility durations, the stylesheet durations, and the seven infinite animations with
    their `index.css` and `App.css` line numbers, live.
  - Done when: each of the seven ambient animations is named with its keyframe name, its duration
    and where it is applied. `gradient-shift`, `navbar-mesh-pan`, `navbar-drift`, `home-drift`,
    `home-float` twice and `tour-detail-drift` is the expected list; record what the tree actually
    says.

- [ ] **1.3 Establish what the three reduced-motion blocks actually stop**
  - Read `frontend/src/App.css:42`, `frontend/src/index.css:38` and `frontend/src/index.css:576`.
  - Produces: for each block, which selectors it covers and which of the seven ambient animations
    falls inside it, plus a list of any that fall inside none.
  - Done when: the coverage is a list rather than an impression. An animation covered by no block is
    what instruction [4.2](#4--switch-reduced-motion-on-and-watch) will see still running.
  - ❌ If the three blocks overlap in a way that makes coverage ambiguous, say so and list the
    ambiguous selectors. That ambiguity is the reason this plan exists and it is worth recording
    rather than resolving quietly.

- [ ] **1.4 Sort the 17 framer-motion files by what they are animating**
  - The files are five wizard steps, `CreateEventPage.jsx`, `EventsPage.jsx`,
    `LocationDetailPage.jsx`, `Login.jsx`, `Register.jsx`, `AdvancedSearchBar.jsx`, two booking
    modals, `NotificationsModal.jsx` and three selection pages.
  - Produces: each file grouped by what the animation does: a page or step entrance, a modal
    appearing, or something else.
  - Done when: the groups exist. They are the evidence for
    [task 2.2](#2--write-the-bands-and-the-rule)'s rule, which has to describe what is already there
    before it prescribes anything.

▶ **Next: [task 2.1](#2--write-the-bands-and-the-rule)**.

### 2. ✍️ Write the bands and the rule

◀ **Needs: [task 1](#1--read-the-contract-and-inventory-the-movement)**.

- [ ] **2.1 Collapse the nine durations into named bands**
  - The nine: `duration-200`, `duration-300`, `duration-500`, and 250ms, 260ms, 300ms, 470ms, 560ms
    and 620ms from the stylesheets.
  - Produces: a small set of bands, each with a value, an easing, and one line saying what it is
    for. Three or four is the expected range: an instant state change, a normal transition, and a
    deliberate entrance.
  - Done when: every one of the nine maps to a band, written into the motion rules document, and no
    band name is a number.

- [ ] **2.2 Write the rule for which system a movement uses**
  - Produces: a test a person can apply, derived from the groups in
    [task 1.4](#1--read-the-contract-and-inventory-the-movement) rather than invented. The shape it
    is likely to take: a CSS transition for a property changing on an element that is already there,
    and `framer-motion` for something entering or leaving the tree.
  - Done when: a person can read the rule and answer "which do I use for a card's hover" and "which
    do I use for a modal opening" without further discussion, and the rule says what to do about the
    17 files that already exist rather than only about new work.

- [ ] **2.3 Write the list of what does not animate**
  - Produces: a written list, each entry with one line saying why. Start from what the app already
    does and from what would be tempting to add: a number changing, a list reordering, content
    arriving after a fetch, a validation error appearing, and anything on a screen where the reader
    is waiting for a result.
  - Done when: the list exists and is not empty. **This is the section that gets skipped**, and it
    is the one that does the work: without it, movement gets added because it is available rather
    than because it helps.
  - The entry about scarce inventory is worth writing even though the screen belongs elsewhere:
    a booking window being claimed must not animate into place before the server has committed it,
    because a movement that says "done" before it is done is a lie the interface tells confidently.

- [ ] **2.4 Reconcile the three reduced-motion blocks into one**
  - Replace `App.css:42`, `index.css:38` and `index.css:576` with a single rule.
  - Produces: one block, covering every one of the seven ambient animations and every band, with the
    `!important` usage reduced to what is actually needed rather than carried forward by habit.
  - Done when: the coverage list from [task 1.3](#1--read-the-contract-and-inventory-the-movement)
    has no animation left outside the rule.
  - ❌ If removing an `!important` makes an animation survive the rule, keep it and write down
    which selector needed it and why. An `!important` with a reason is fine; three carried forward
    by habit is what this task is undoing.

- [ ] **2.5 Decide what the two dead class names were meant to do**
  - `animate-fade-in-down` at `frontend/src/EventListingPage.jsx:19` and `animate-fade-in` at
    `frontend/src/PostCard.jsx:21`.
  - Produces: for each, either the band it should use or a statement that the element should not
    animate, written into the motion rules document.
  - Done when: both have an answer. [07](07-prove-it-and-write-it-down.md) edits the two lines; this
    plan decides what they should say, because deciding it there means deciding it in the middle of
    a different job.

- [ ] **2.6 Write the grouping's card entry**
  - Add the motion rules document to `artifacts/notes/the-design-system/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`: what it holds, how it was established, what it lets you
    say, what it cannot say.
  - Done when: the provenance is in the card as prose.

▶ **Next: [instruction 4.1](#4--switch-reduced-motion-on-and-watch)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4](#4--switch-reduced-motion-on-and-watch)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 👀 Switch reduced motion on and watch

◀ **Needs: [task 2](#2--write-the-bands-and-the-rule)** done, so there is one rule to test rather
than three.

A reduced-motion rule is either watched working or it is a claim. No test in this repository can
make it, and there is no unit test runner to write one in.

4.1 **See the seven ambient animations running first**
   - Start the frontend: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Open Chrome at `http://localhost:5173` on the home page, with reduced motion off.
   - Expected result: the navbar's background drifts, and the home page's shapes float.
   - ✅ You can see movement that nobody asked for: that is the thing the rule has to stop. Record
     which movements you can actually see, because seven are declared and fewer may be visible.
   - ❌ You see nothing moving: check that the home page is the one with `home-drift` and
     `home-float` applied, per [task 1.2](#1--read-the-contract-and-inventory-the-movement)'s list.

4.2 **Switch reduced motion on, two ways, and compare**
   - **The fast way, per tab:** in DevTools press Ctrl+Shift+P, type "reduced motion", and choose
     "Emulate CSS prefers-reduced-motion: reduce". Reload.
   - **The real way, for the whole system:** Windows Settings → Accessibility → Visual effects →
     Animation effects, off. This is WSL2, so the browser reads the Windows setting, not a Linux
     one. Then reload Chrome.
   - Expected result: every one of the movements you listed in 4.1 stops.
   - ✅ All of them stop under both methods: the rule covers what it claims. Screenshot the home
     page under the emulation and save it as
     `artifacts/figures/the-design-system/reduced-motion-on.png`.
   - ❌ One keeps moving: that is exactly what
     [task 1.3](#1--read-the-contract-and-inventory-the-movement)'s coverage list predicts if an
     animation fell outside all three original blocks. Name it, add it to the rule, and run this
     step again. Do not tick the task with one still moving.
   - ❌ The DevTools emulation stops it and the Windows setting does not: then the browser is not
     reading the system preference, which is a fact about this machine rather than about the rule.
     Write that down and treat the emulation as the check.

4.3 **Feel the bands on a hover**
   - With reduced motion off again, hover over a provider card, then over a button, then over a
     navigation item.
   - ✅ Movements of the same kind settle at the same speed: the bands are doing their job.
   - ❌ Two hovers of the same kind settle at visibly different speeds: those two are on different
     bands, and one of them is wrong. Note which two.
   - This will still be true after this plan for anything not yet migrated, because the pages keep
     their own durations until they are touched. Note what you saw rather than fixing it here.

4.4 **Decide the seven ambient animations**
   - Read the list from [task 1.2](#1--read-the-contract-and-inventory-the-movement) with the home
     page and the navbar in front of you.
   - ✅ Each of the seven has a decision: keep, trim, or drop, with one line of reason. Whether
     perpetual ambient movement is this product's house style is a judgement, and it is yours.
   - ❌ You want to keep all seven without deciding: that is the accumulation this plan is here to
     stop, so at minimum write down that they were reviewed and kept on purpose, with the date. That
     sentence is what makes it a decision.

4.5 **Read the what-does-not-animate list and try to break it**
   - Read the list and think of one movement you would like to add to a screen.
   - ✅ The list either allows it with a band or forbids it with a reason: the list is doing work.
   - ❌ The list has nothing to say about it: add the entry now. A list that only covers what
     somebody already thought of is a list that will be ignored on the first new screen.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody has switched reduced motion on, watched every ambient animation
> stop, and can answer "should this move, and how fast" from one document.

Pass:

- Every one of the nine current durations maps to a named band, and no band name is a number.
- The rule for choosing between a CSS transition and `framer-motion` is a test a person can apply,
  and it says what happens to the 17 files that already use `framer-motion`.
- The list of what does not animate exists and is not empty.
- The three reduced-motion blocks are one, and the coverage list has no animation left outside it.
- A person has switched reduced motion on and confirmed every movement they listed stops, with a
  screenshot.
- The seven ambient animations each carry a decision, including "kept on purpose" with a date.
- Both dead class names have an intended behaviour recorded for
  [07](07-prove-it-and-write-it-down.md) to act on.

Fail, and what it means:

- The what-does-not-animate list missing or one line long. Then the document names durations and
  prescribes nothing, and the next screen adds movement because it can.
- The reduced-motion rule ticked without anybody watching it. Three partial blocks became one
  unverified block, which is the same unknown with fewer files.
- An animation still moving under reduced motion and the task ticked anyway. That is the specific
  failure the coverage list in task 1.3 exists to predict.
- Bands named for their values. `duration-300` with a new prefix is not a band.
- The ambient animations left undecided. Perpetual movement is a product decision, and no decision
  is how it grows.

Partial pass is acceptable on the `framer-motion` migration alone. The rule can say what new work
does and record the 17 existing files as "left as they are, revisit when touched", as long as that
sentence is written rather than implied.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The named duration bands | the file plan 01's contract names | — | not started |
| The motion rules, four sections | `artifacts/notes/the-design-system/how-things-move.md` | — | not started |
| One reduced-motion rule replacing three | `frontend/src/index.css`, `frontend/src/App.css` | — | not started |
| The seven ambient animations, each decided | inside the motion rules | — | not started |
| The intended behaviour of the two dead class names | inside the motion rules | — | not started |
| What the reduced-motion check showed: which movements were visible, which stopped under each method, and any hover pair still settling at two speeds | inside the motion rules | — | not started |
| The home page with reduced motion on | `artifacts/figures/the-design-system/reduced-motion-on.png` | — | not started |
| Three empty rooms | [piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered) → `../diagrams/subject-01-three-empty-rooms.png` | subject | ⏳ not rendered |
| Seven plans, seven gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-seven-plans-seven-gates-planned--not-rendered) → `../diagrams/process-02-seven-plans-seven-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/04-say-what-moves-and-what-does-not.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the stylesheet that holds every ambient animation | `/unpack frontend/src/index.css` | task 1.2 | The seven keyframes, their durations and the three reduced-motion blocks read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the stack decision](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record): the contract this plan writes into.
- [the decisions taken here](../decisions-taken-here.md#seven-plans-not-five): why motion and type are two plans rather than one.
- `frontend/src/index.css:23`, `:75`, `:83`, `:129`, `:165`, `:169`, `:253`: the seven infinite ambient animations.
- `frontend/src/index.css:38` and `:576`, `frontend/src/App.css:42`: the three reduced-motion blocks.
- `frontend/src/EventListingPage.jsx:19` and `frontend/src/PostCard.jsx:21`: the two class names that render nothing.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-the-components-that-own-the-styles.md](05-the-components-that-own-the-styles.md), which builds
the shared components that consume these bands. It waits on this plan,
[02](02-name-the-colours-and-the-spacing.md) and [03](03-give-type-its-roles.md), all three of which
run at the same time.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is an inventory, a set of rules, and a check
a person performs with an accessibility setting switched on.
   also: `/unpack frontend/src/index.css` at task 1.2, which is help with one task rather than the
   shape of the plan.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Reduced motion does not appear to take effect | Instruction 4.2, on WSL2 | The browser reads the Windows setting, not a Linux one: Settings → Accessibility → Visual effects → Animation effects. The DevTools emulation (Ctrl+Shift+P, "Emulate CSS prefers-reduced-motion") is the faster check and is per tab. |
| A class name renders nothing and nothing reports it | `animate-fade-in-down` at `EventListingPage.jsx:19`, `animate-fade-in` at `PostCard.jsx:21` | Confirm in the DevTools Styles pane. [Plan 07](07-prove-it-and-write-it-down.md) builds the check and edits the lines; task 2.5 here decides what they should say. |
| A stylesheet change appears not to take effect | `index.css` edits under a running Vite dev server | Restart the dev server rather than reloading the page. |
