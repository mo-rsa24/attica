# ✅ Prove It And Write It Down

Step 7 of 7 in this scope. Waits on
[06](06-cards-that-answer-to-their-container.md), and reads outputs from every plan before it. Last
in this scope.

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

Scope: [the design system](../MASTER_PLAN.md). Last of seven.

It closes three things nothing else in the scope closes: the check that makes an invented style
visible, the five class names that render nothing, and the two runbook recipes this scope owes.

It also runs the pulses. The runbook pair is written and checked here. Whether `env-pulse` runs at
all depends on what [01](01-measure-it-and-take-the-stack-decision.md) decided, per
[the decisions taken here](../decisions-taken-here.md#the-owes-line-says-nothing-for-environment-and-one-possible-answer-to-d10-would-make-that-false).
No `context-pulse` runs, and the reason is in [the scope's Context section](../MASTER_PLAN.md#context).

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 28.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Six plans have produced a vocabulary, a component layer and a set of rules. **None of it is
enforceable and none of it is findable.**

**Nothing in this toolchain reports a style somebody invented.** ESLint 9 is installed with
`@eslint/js`, `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`, none of which reads
`className` strings. That is why five class names have been sitting in the tree rendering nothing:
`shadow-xs` at `frontend/src/ListingReview.jsx:374`, `:381` and `:389`, which is Tailwind v4's name
for v3's `shadow-sm`, and `animate-fade-in-down` at `frontend/src/EventListingPage.jsx:19` and
`animate-fade-in` at `frontend/src/PostCard.jsx:21`, which are defined nowhere at all. An invented
style and a misspelled one are indistinguishable from the outside.

**[The runbook index](../../../../../runbook/00-INDEX.md) has no frontend theme at all.** Its three
themes are running the web app, preparing the data and driving the app, and every recipe in them is
a terminal command, the Django admin, or a click path through a running screen. Nothing in it is
about changing the interface. So a person who wants to add a component has one place to look and it
has nothing to say.

**Two dependencies are imported by no file**: `react-calendar` and `websocket`.
[Instruction 3.5 of plan 01](01-measure-it-and-take-the-stack-decision.md#3--see-it-on-a-screen-then-take-the-decision)
decided what happens to them; this plan acts on it.

**This plan closes the loop.** A check that fails on the two things that are silent today, the five
dead names removed or defined, and two recipes that make the six plans before this one usable by
somebody who was not here.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Instruction 4 needs
  `npm run dev` running.
- **Two backend tests already fail**, so a red `python manage.py test` says nothing about this
  scope. Nothing here touches the backend.
- **The browser suite runs logged out today**, which `fixing-create-event` fixes, so the check this
  plan builds must be a static one over the source rather than something Playwright asserts.

**Two facts this plan needs are not in `environment/` and must not be inferred.**

**There is no unit test runner.** `frontend/package.json` carries `@playwright/test` and no vitest
and no jest, and the three test scripts are `test:e2e`, `test:e2e:ui` and `test:e2e:report`. So a
check written as a test has nowhere to run today, which is one of the two constraints that decides
what the check can be.

**Nothing reads `className` strings.** ESLint sees JavaScript, and a Tailwind class name is a string
inside a prop. Catching a hand-written hex value and catching a class name that matches no rule are
two different jobs, and this is the second constraint.

**One fact this plan depends on comes from
[plan 01](01-measure-it-and-take-the-stack-decision.md) instead of from `environment/`**: whether
the stack decision changed how the frontend is built or started. That one line decides whether
[task 4.2](#4--write-the-recipes-and-run-the-pulses) runs `/env-pulse` or records that it was not needed.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**The check is specified by what it must catch, not by what it is.**

A hand-written hex value, and a class name that matches no rule. Those two are the failures that are
silent today. Whether the mechanism is an ESLint rule, a Tailwind configuration setting, a script
run by an npm script, or something the stack decision made available is a judgement about this
toolchain, made here rather than guessed at decomposition time. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#the-invented-style-check-is-specified-by-what-it-must-catch-not-by-what-it-is).

**A check nobody runs is a check that does not exist.**

Wherever it ends up, it needs a command a person can type and a place it runs without being asked.
An npm script is the floor. Whether it also runs in [continuous integration](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> is worth deciding rather
than assuming, because continuous integration exists in this repository and nothing ships from it.

**A check that fires on everything gets switched off in a week.**

There are 58 hand-written hex values in nine files and none of them is going away today. The check
has to start with a recorded allowance for what exists and fail only on what is added, or it will
report 58 failures on its first run and be disabled on its second. That allowance is a list with a
date on it, not a permanent exemption.

**The recipes are written from what happened, not from what was planned.**

Both come out of the six plans before this one, and the second one has an unusual source: the
questions the builder could not answer in
[instruction 4.2 of plan 05](05-the-components-that-own-the-styles.md#4--build-one-card-and-time-yourself).
Those questions are the recipe's contents, because they are the things somebody actually needed and
could not find.

**Two recipes, and the runbook has no place to put them.**

There is no frontend theme in that index. This plan adds one, which is a change to the index's
structure rather than a new file in an existing folder, and `/runbook-pulse` is what checks that the
index still reads as questions afterwards.

**The five dead names are removed or defined, and their intended behaviour is already decided.**

[Task 3.3 of plan 02](02-name-the-colours-and-the-spacing.md#3--name-the-spacing-radius-and-elevation)
decided what the three `shadow-xs` cards were meant to have.
[Task 2.5 of plan 04](04-say-what-moves-and-what-does-not.md#2--write-the-bands-and-the-rule)
decided what the two animation classes were meant to do. This plan edits the lines; it does not
decide them, because deciding them here means deciding them in the middle of a different job.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A design system with no check is a document**, and the five dead class names are the proof that
this repository cannot currently tell an invented style from a misspelled one.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Six plans produce a vocabulary that is correct and voluntary. Voluntary is the failure mode for
every design system that has ever been abandoned: the rules are right, nobody disagrees with them,
and the next deadline produces one more page that invented its own styles because inventing was
faster than looking up and nothing said otherwise.

Two things change that. A check makes the invention visible at the moment it happens rather than in
a count six months later. A recipe makes looking up faster than inventing, which is the only durable
version of the same argument.

The five dead class names are what happens without either. Somebody wrote a class from the next
major version, somebody else wrote two animation names that were never defined, all five render
nothing, and the app has carried them silently for as long as they have existed.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  WHAT IS SILENT TODAY

  ListingReview.jsx:374 :381 :389   shadow-xs           ─┐
  EventListingPage.jsx:19           animate-fade-in-down ├─► render nothing
  PostCard.jsx:21                   animate-fade-in     ─┘   nothing reports it

  58 hand-written hex values in 9 files                  ─► nothing reports it

  THE CHECK
    fails on: a hand-written hex value
    fails on: a class name matching no rule
    allows:   what exists today, listed with a date
    runs:     from a command a person can type

  THE RECIPES                     the runbook has no frontend theme. this adds one.
    how to add a component without inventing a style
    how to find out whether a page invented one

  THE PULSES
    runbook-pulse    always
    env-pulse        only if 01's answer changed how the frontend builds
    context-pulse    never. no word here is about Attica's world.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is closed by what this plan builds, and the capstones are what it
checks the finished scope against.

**Subject: five names that render nothing.** The five sites, five identical unstyled results, and
the empty framed band beneath them where the check should be.
[Piece 5](../diagram-prompts.md#piece-5-five-names-that-render-nothing-planned--not-rendered).
Save as `../diagrams/subject-05-five-names-that-render-nothing.png`. *(image not yet generated)*

**Subject capstone: the design-system glyph, opened up.** The end state all seven plans add up to,
including the gate glyph and the open book this plan produces.
[The capstone](../diagram-prompts.md#the-design-system-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-design-system-glyph-opened-up.png`. *(image not yet
generated)*

**Process capstone: from chosen where it was typed, to asked for by name.** The before-and-after with
the eight counted numbers at both ends, which is what
[task 3.1](#3--collect-the-eight-after-numbers) fills in.
[The process capstone](../diagram-prompts.md#process-capstone-from-chosen-where-it-was-typed-to-asked-for-by-name-planned--not-rendered).
Save as `../diagrams/process-capstone-typed-to-asked-for-by-name.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**One check**, in whatever mechanism this toolchain can actually run, failing on a hand-written hex
value and on a class name that matches no rule, with a dated allowance for what exists today and a
command a person can type.

**Five edited lines**, applying the decisions plans 02 and 04 already took.

**Two runbook recipes**, in a new frontend theme in [the runbook](../../../../../runbook/00-INDEX.md),
written with `/drip-runbook` and checked with `/runbook-pulse`.

1. **How to add a component without inventing a style.** Which file to open, what a token is called,
   which role to use for a title, which band to use for a hover, how to tell whether a layout
   decision belongs to the container or the viewport, and what to do when the thing you need has no
   name yet.
2. **How to find out whether a page invented one.** The command, what its output means, and what to
   do about each kind of failure.

**One closing note**, at `artifacts/notes/the-design-system/what-changed-and-what-did-not.md`,
carrying all eight after-numbers beside their before-numbers with the commands, and an honest list
of what this scope did not do.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 6](../MASTER_PLAN.md#objectives), making an invented style visible,
and close the scope's runbook debt.

**Goal.** The check exists, runs from a typed command, fails on both silent failures and passes on
the tree as it stands; the five dead class names are gone or defined; both recipes exist in a
frontend theme in the runbook index; `/runbook-pulse` has run; `/env-pulse` has either run or been
recorded as not needed with the reason; and all eight after-numbers sit beside their before-numbers.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/07-prove-it-and-write-it-down.md`

▶ **Next: [task 1.1](#1--build-the-check)**.

### 1. 🔍 Build the check

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Choose the mechanism, against what this toolchain can run**
  - The constraints, both established rather than assumed: there is no unit test runner, and nothing
    reads `className` strings. ESLint 9 is present. Whatever the stack decision in
    [01](01-measure-it-and-take-the-stack-decision.md) chose may have added options.
  - Produces: one paragraph naming the mechanism and why, with the alternatives that lost.
  - Done when: the mechanism can run today, with what is installed or with one dependency this task
    names. A check that needs infrastructure this repository does not have is a check that does not
    exist.

- [ ] **1.2 Make it fail on a hand-written hex value**
  - Produces: the rule, plus a demonstration that it fires: add a hex value to a scratch file, run
    the check, watch it fail, remove it.
  - Done when: the failure names the file and the line. A check that says "failed" without saying
    where is a check people learn to ignore.

- [ ] **1.3 Make it fail on a class name that matches no rule**
  - The five known cases are the test data: `shadow-xs`, `animate-fade-in-down` and
    `animate-fade-in`.
  - Produces: the rule, plus a run against the tree **before**
    [task 2](#2--close-the-five-dead-names) that finds all five.
  - Done when: the run finds five and names all five sites. **Run this before fixing them**, because
    a check verified against a tree with nothing wrong in it has not been verified.
  - ❌ If the mechanism cannot see class names in strings, say so and name what it does catch
    instead, then write the gap into the closing note. A partial check that is honest about its gap
    beats a full one that does not exist.

- [ ] **1.4 Record the allowance for what exists today**
  - The 58 hand-written hex values in nine files, and anything else the first full run reports.
  - Produces: a list with a date on it, held wherever the mechanism holds such things, plus one line
    in the closing note saying what it covers and that it is meant to shrink.
  - Done when: a clean run passes on the tree as it stands. **A check that reports 58 failures on
    its first run gets disabled on its second**, and the allowance is what stops that.
  - ❌ If any entry on the allowance list is a value plan 02 already mapped to a token, take it off
    the list and use the token instead. The allowance is for what has not been converted, not for
    what nobody got around to.

- [ ] **1.5 Give it a command a person can type**
  - Add it to `frontend/package.json` as an npm script with a name that says what it does.
  - Produces: the command the second runbook recipe is written around.
  - Done when: running it from a cold terminal in `frontend/` works and prints something a person
    can act on.

▶ **Next: [task 2.1](#2--close-the-five-dead-names)**.

### 2. 🧹 Close the five dead names

◀ **Needs: [task 1](#1--build-the-check)** done, so the check has been verified against them first.

- [ ] **2.1 Fix the three `shadow-xs` sites**
  - `frontend/src/ListingReview.jsx:374`, `:381` and `:389`. The elevation level they were meant to
    have was decided in
    [task 3.3 of plan 02](02-name-the-colours-and-the-spacing.md#3--name-the-spacing-radius-and-elevation).
  - Done when: all three carry the token for that level and render a shadow. Confirm in the DevTools
    Styles pane rather than by reading the source, which is what everyone did last time.

- [ ] **2.2 Fix the two animation class names**
  - `frontend/src/EventListingPage.jsx:19` and `frontend/src/PostCard.jsx:21`. What each was meant
    to do was decided in
    [task 2.5 of plan 04](04-say-what-moves-and-what-does-not.md#2--write-the-bands-and-the-rule).
  - Done when: each carries a named band or the class is removed, per that decision.

- [ ] **2.3 Act on the two unimported dependencies**
  - `react-calendar` and `websocket`, per
    [instruction 3.5 of plan 01](01-measure-it-and-take-the-stack-decision.md#3--see-it-on-a-screen-then-take-the-decision).
  - Produces: either their removal from `frontend/package.json` with `npm install` run and the lock
    file updated, or a line in the closing note saying why each is kept.
  - Done when: the decision is applied rather than restated. ❌ If removing one breaks the build,
    put it back, say what imported it that the search missed, and correct the claim in the scope's
    master plan.

- [ ] **2.4 Run the check on the whole tree and confirm it passes**
  - Done when: a clean run. If it does not pass, the remaining failures are either things
    [task 1.4](#1--build-the-check)'s allowance should cover or real problems, and each is named as
    one or the other.

▶ **Next: [task 3.1](#3--collect-the-eight-after-numbers)**.

### 3. 📊 Collect the eight after-numbers

◀ **Needs: [task 2](#2--close-the-five-dead-names)**.

- [ ] **3.1 Run all eight pinned commands one final time**
  - Every command from
    [task 2 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged, plus `git rev-parse --short HEAD` and the date.
  - Produces: the closing note at
    `artifacts/notes/the-design-system/what-changed-and-what-did-not.md`, with each after-number
    beside its before-number and the command between them.
  - Done when: all eight are there, including the ones that barely moved. **Several will barely have
    moved and that is the honest result**: plans 02, 03 and 04 named a vocabulary rather than
    repainting the app, and only plans 05 and 06 migrated anything.

- [ ] **3.2 Write what this scope did not do**
  - The unmigrated button sites from
    [task 2.5 of plan 05](05-the-components-that-own-the-styles.md#2--build-the-four-components), the
    screens that keep their breakpoints from
    [task 3.3 of plan 06](06-cards-that-answer-to-their-container.md#3--decide-mobile-for-the-two-journeys),
    anything left on the check's allowance list, and any gap the check has.
  - Done when: the list exists and names who picks each item up. `the-event-workspace` inherits most
    of the screen work; say so rather than leaving it implied.

▶ **Next: [instruction 5.1](#5--use-the-recipes-without-asking-anyone)**, after
[task 4](#4--write-the-recipes-and-run-the-pulses) has produced something to use.

### 4. 📖 Write the recipes and run the pulses

◀ **Needs: [task 3](#3--collect-the-eight-after-numbers)**.

- [ ] **4.1 Write both recipes with `/drip-runbook`**
  - **Run the following prompt:** `/drip-runbook` for "how to add a component without inventing a
    style" and "how to find out whether a page invented one", into a new frontend theme in
    [the runbook](../../../../../runbook/00-INDEX.md).
  - The first recipe's contents come from
    `artifacts/notes/the-design-system/where-the-components-live.md` and, crucially, from the
    questions the builder could not answer in
    [instruction 4.2 of plan 05](05-the-components-that-own-the-styles.md#4--build-one-card-and-time-yourself).
    Those questions are what somebody actually needed and could not find.
  - The second is written around the command from [task 1.5](#1--build-the-check): what to type,
    what each kind of output means, and what to do about it.
  - Done when: both exist, the index lists them as questions somebody would actually ask, and the
    first one answers what to do when the thing you need has no token yet. **That last step is the
    one every design system forgets to write and the one that decides whether it survives a
    deadline.**

- [ ] **4.2 Run `/runbook-pulse`, and `/env-pulse` only if the stack decision made it necessary**
  - **Run the following prompt:** `/runbook-pulse`
  - Then read the line
    [task 4.3 of plan 01](01-measure-it-and-take-the-stack-decision.md#4--write-the-decision-record)
    wrote about whether the stack answer changed how the frontend is built or started.
  - **If it did**, run `/env-pulse` and give
    [the environment overview](../../../../../environment/overview.md) the new fact about how the
    frontend builds.
  - **If it did not**, write one line in the closing note saying so, and that
    [the scopes](../../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system)'
    Owes line held. Per
    [the decisions taken here](../decisions-taken-here.md#the-owes-line-says-nothing-for-environment-and-one-possible-answer-to-d10-would-make-that-false),
    running a pulse with nothing to report trains people to skip pulses.
  - **No `/context-pulse` runs.** A token, a duration band and a container query are facts about the
    machinery, not about events, providers or bookings. Write that line too, so the omission reads
    as a decision rather than an oversight.
  - Done when: the runbook pulse has run, and the environment question is answered either way in
    writing.

- [ ] **4.3 Write the grouping's card entry**
  - Add the closing note to `artifacts/notes/the-design-system/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the provenance is in the card as prose.

▶ **Next: [instruction 5.1](#5--use-the-recipes-without-asking-anyone)**.

### Close out. 🔄 Record what this scope taught

◀ **Needs: [instruction 5](#5--use-the-recipes-without-asking-anyone)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 📕 Use the recipes without asking anyone

◀ **Needs: [task 4](#4--write-the-recipes-and-run-the-pulses)** done, so there are recipes to use.

A recipe is proved by somebody following it and getting the answer, not by somebody reading it and
agreeing with it.

5.1 **Break something on purpose**
   - Open any page file and change one colour to a hand-written hex value. Save.
   - Run the check's command from `frontend/`.
   - ✅ It fails, and it names your file and your line: the check works.
   - ❌ It passes: the rule from [task 1.2](#1--build-the-check) is not covering that shape. Note
     what you wrote and what it missed.

5.2 **Break it the other way**
   - In the same file, add a class name that does not exist, such as `shadow-huge`. Save. Run the
     check again.
   - ✅ It fails and names the line: both silent failures are now loud.
   - ❌ It passes: this is the harder of the two rules, and it may be the gap
     [task 1.3](#1--build-the-check) allowed for. Confirm the gap is written into the closing note
     rather than leaving it as a surprise.
   - Undo both changes.

5.3 **Answer the second recipe's question from the recipe alone**
   - Pick a page file you have not looked at during this scope. Using only the second recipe, find
     out whether it invented a style.
   - ✅ You got an answer without opening the check's source or asking anyone: the recipe is
     complete.
   - ❌ You had to work something out: that gap is the recipe's next paragraph. Add it.

5.4 **Add a component from the first recipe alone**
   - Build a small component the app does not have, using only the first recipe. Then deliberately
     need something that has no token: a colour, a size or a movement that is not named.
   - ✅ The recipe tells you what to do about it: that step is the one that decides whether this
     survives a deadline, and it is present.
   - ❌ The recipe stops there: write that step now. Somebody will hit it in week two, and what they
     do is either what the recipe says or whatever is fastest.

5.5 **Look at the whole scope against its own picture**
   - Open the subject capstone prompt in
     [the scope's map](../diagram-prompts.md#the-design-system-glyph-opened-up-planned--not-rendered)
     and read it against what now exists.
   - ✅ Each part of the picture has a real thing behind it: the named vocabularies, the component
     layer that reads them, the pages that carry no chips of their own, the drawer with its own
     ruler, the book and the gate.
   - ❌ A part has nothing behind it: that is the honest state of the scope and it belongs at the top
     of [task 3.2](#3--collect-the-eight-after-numbers)'s list of what was not done.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody broke a style on purpose, ran one command, and was told exactly
> where, and when somebody else added a component from a recipe without asking anyone.

Pass:

- The check exists, runs from a typed command in `frontend/`, and names the file and line on
  failure.
- It was run against the tree **before** the five dead names were fixed and found all five.
- It has a dated allowance for what exists today, and a clean run passes on the tree as it stands.
- The five dead class names are gone or defined, per the decisions plans 02 and 04 already took, and
  the three shadows were confirmed in the DevTools Styles pane.
- The two unimported dependencies are removed or kept with a written reason.
- Both recipes exist in a frontend theme in the runbook index, and the first one answers what to do
  when a needed token does not exist.
- Both recipes were used by a person to get an answer without asking anyone.
- `/runbook-pulse` has run, and the environment question is answered in writing either way.
- All eight after-numbers sit beside their before-numbers with the commands, including the ones that
  barely moved.
- What this scope did not do is written down with who picks each item up.

Fail, and what it means:

- The check verified only after the five dead names were fixed. Then it has never been shown to
  catch anything, and the first thing it misses will be found by a person.
- No allowance list. The first run reports 58 failures and the second run does not happen.
- The recipe stopping before "what to do when the thing you need has no name yet". That is the step
  people hit in week two, and its absence is what turns a design system into a document.
- After-numbers that barely moved being presented as a disappointment. Plans 02, 03 and 04 named a
  vocabulary; they never promised to repaint the app, and reporting the flat numbers honestly is the
  result.
- `/env-pulse` run to be safe, with nothing to report. That trains the reader to skip pulses, which
  costs more than the omission it was protecting against.
- `/context-pulse` run. Nothing in this scope is a word about Attica's world.

Partial pass is acceptable on the class-name half of the check. A check that catches hand-written
hex values and honestly reports that it cannot see class names in strings is a real deliverable, as
long as the gap is in the closing note and not discovered later.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The check, with its allowance and its npm script | `frontend/`, mechanism named in task 1.1 | — | not started |
| The five dead class names, closed | `ListingReview.jsx`, `EventListingPage.jsx`, `PostCard.jsx` | — | not started |
| The two unimported dependencies, removed or kept with a reason | `frontend/package.json` | — | not started |
| How to add a component without inventing a style | a new frontend theme in [the runbook](../../../../../runbook/00-INDEX.md) | — | not started |
| How to find out whether a page invented one | the same theme | — | not started |
| The eight after-numbers beside their before-numbers | `artifacts/notes/the-design-system/what-changed-and-what-did-not.md` | — | not started |
| What this scope did not do, and who picks it up | inside the closing note | — | not started |
| Five names that render nothing | [piece 5](../diagram-prompts.md#piece-5-five-names-that-render-nothing-planned--not-rendered) → `../diagrams/subject-05-five-names-that-render-nothing.png` | subject | ⏳ not rendered |
| The design-system glyph, opened up | [the subject capstone](../diagram-prompts.md#the-design-system-glyph-opened-up-planned--not-rendered) → `../diagrams/subject-capstone-the-design-system-glyph-opened-up.png` | subject | ⏳ not rendered |
| From chosen where it was typed, to asked for by name | [the process capstone](../diagram-prompts.md#process-capstone-from-chosen-where-it-was-typed-to-asked-for-by-name-planned--not-rendered) → `../diagrams/process-capstone-typed-to-asked-for-by-name.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/07-prove-it-and-write-it-down.md` | task 0, before any work | Conformance and thin instructions reported |
| Write the two recipes | `/drip-runbook` | task 4.1 | A frontend theme in the runbook with both recipes as questions |
| Check the runbook still reads as questions | `/runbook-pulse` | task 4.2 | The index and the new theme audited |
| Give `environment/` the new build fact | `/env-pulse` | task 4.2, **only if** the stack answer changed how the frontend builds | The overview says how the frontend is built now |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the decisions taken here](../decisions-taken-here.md#the-invented-style-check-is-specified-by-what-it-must-catch-not-by-what-it-is): why the mechanism was left to this plan.
- [the runbook index](../../../../../runbook/00-INDEX.md): the three themes that exist, none of them about the frontend.
- [the scope's Context section](../MASTER_PLAN.md#context): why no `context-pulse` runs.
- [the scopes](../../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system): the Owes line this plan discharges.
- `frontend/src/ListingReview.jsx:374`, `:381`, `:389`; `frontend/src/EventListingPage.jsx:19`; `frontend/src/PostCard.jsx:21`: the five dead names.
- `frontend/package.json`: ESLint 9 with three plugins, `@playwright/test`, no unit runner, and the two dependencies nothing imports.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

Out of this scope. `the-event-workspace`, scope 11, builds the screens out of what this scope
produced, and it waits on `the-booking-journey` and `one-client-truth` as well as on this one. The
[parent's running order](../../../MASTER_PLAN.md#running-order) is the sequence that matters.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

`/drip-runbook` at task 4.1, which is the whole of that task, and `/runbook-pulse` at task 4.2.
   also: `/env-pulse` at task 4.2, conditionally.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A check verified against a clean tree | Task 1.3, if the dead names are fixed first | Run it before task 2. Five known failures are the only test data this repository offers. |
| A check reports dozens of failures on its first run | Task 1.4, with no allowance list | Record what exists today with a date, and fail only on what is added. |
| A class name renders nothing and nothing reports it | The five sites this plan closes | Confirm in the DevTools Styles pane rather than by reading the source. |
| The browser suite runs logged out | Any attempt to make the check a Playwright assertion | `fixing-create-event` fixes it. The check here is static over the source. |
| A dependency removal breaks the build | Task 2.3 | Something imported it that the search missed. Put it back, name the importer, and correct the claim in the scope's master plan. |
