# Decisions taken while writing this scope

This scope was written in an unattended pass, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with its reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused. The decomposition's choices come first, then
the plan set's.

The source for the scope's content is item 12 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system),
and the state of the world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

---

## Neither D1 nor D2 reaches this scope, and the one place that nearly looks like it does

**Decision.** The scope states plainly that it does not depend on either open decision, and no plan
here is written as though it were waiting on one.

**Why.** The programme's rule is that a scope whose content depends on D1 or D2 must say so and plan
against the decision being unmade. Following that rule honestly means also saying when it does not
apply, because a scope that stays silent leaves the next reader to work out whether silence means
"checked and no" or "never checked".

D1 decides which of the four live booking representations survives. D2 decides whether a hold starts
at request time or at acceptance. Both change what a screen shows and what states exist. Neither
changes what a colour is called, how a corner is rounded, how long a transition runs, or whether a
card reads its container or the viewport. The entire content of this scope is the vocabulary an
interface is built from, and that vocabulary is the same whichever booking model wins.

**The one place it nearly bites**, and how the bite is avoided.
[Plan 05](plans/05-the-components-that-own-the-styles.md) builds explicit status text for actions
that can be in flight, and the *set of states* an action can be in is exactly what D1 and D2 decide.
So the rule that plan works under is: **it builds the mechanism and reads the list.** The component
that displays a state, the rule that a state gets words rather than a spinner alone, and the place
those words live are this scope's. Which states exist is read from wherever they are defined at the
time the plan runs, and if that is nowhere yet, the plan records the states it found and says where
it found them, rather than inventing a set that a later decision will contradict.

**The decision this scope does own is D10**, the frontend stack, and it is left open rather than
answered anywhere in this folder. See the entry below.

## The stack decision goes first, even though the scope's own wording says "tokens first"

**Decision.** [Plan 01](plans/01-measure-it-and-take-the-stack-decision.md) takes D10 and
[plan 02](plans/02-name-the-colours-and-the-spacing.md) writes the tokens, in that order.

**Why.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system)
opens item 12 with "Semantic tokens first", and that sentence is about priority within the design
work: name the values before styling anything, rather than shipping components and extracting tokens
afterwards. It is not a claim about where the stack decision sits, and reading it as one produces a
token file that has to be written twice.

A semantic token is a name and a value, and the two survive any stack answer. What does not survive
is the file it lives in and the notation it is written in. Under Tailwind it is
`tailwind.config.js`'s `theme.extend`. Under MUI it is the object passed to `createTheme()`. Under
neither, it is a block of CSS custom properties. Today all three of those places exist and all three
are empty (`theme: { extend: {} }`, `createTheme()` with no argument, and no `--name:` declaration
in either CSS file), so there is no default to fall into and the choice cannot be deferred by
inaction.

**What this costs, honestly.** Plan 01 produces no visible change, which makes it the plan most
likely to be skipped by someone in a hurry. That is why it also carries the measurement work: it
produces the before-numbers every later plan is checked against, so skipping it costs something
immediately rather than three plans later.

## Seven plans, not five

**Decision.** The scope is cut into seven plan files.

**Why.** Item 12 carries six marks, and the natural cut is close to one plan per mark: the stack
decision, the tokens, type, motion, the component layer, and container queries with mobile. The
seventh is the proving and writing down, which every scope in this programme carries and which is
where the runbook pair and the four by-hand tests live.

**Where a merge was considered and refused.** Type and motion look mergeable: both replace an
ad-hoc scale with named steps, and both are small. They were kept apart because their by-hand checks
are unrelated. Type is checked by reading a screen and asking whether two things that mean the same
look the same. Motion is checked by turning reduced motion on at the operating system level and
confirming seven ambient animations stop. Merging them makes one plan with two unrelated gates,
which is the shape that gets half-ticked.

**Where a merge was taken.** Container queries and mobile are one plan, because they are the same
question asked twice: what decides this layout, the space the component is in or the device it is
on. Answering it once and applying it to both is cheaper than two plans that have to agree.

## The rows are appended to the parent's running order as 22 to 28, not inserted at 7

**Decision.** This scope's seven plans take running-order numbers 22 to 28 in
[the parent's table](../../MASTER_PLAN.md#running-order), and the prose under that table says
explicitly that they wait only on step 6 and can run alongside everything from step 7 onward.

**Why not insert them at 7, which is where the dependency says they belong.** Inserting seven rows
at position 7 renumbers every existing row from 7 to 21. Those numbers are not only in that table:
`one-client-truth`'s map says its process lane draws "the parent's running-order numbers 16 to 21"
and repeats those numbers as step badges in four separate prompts, and its six plan files and
`running-the-workers`' five plan files refer to their positions. A renumber falsifies eleven plan
files and one diagram map, silently, in a pass whose subject is a different scope.

**Why appending is not dishonest.** The `Waits on` column carries the dependency and the step number
is an identifier. The parent's table header says the plans are listed "in the order they get done",
so the prose beneath it now states which rows are ordered by dependency and which are ordered by
when they were added, rather than leaving the number to imply something it does not mean.

**What would change this.** `sync-plan-tree` recomputes that table from the tree. If a future sync
renumbers everything at once and fixes the references in the same pass, the numbers can be made to
mean what they look like. That is a sweep, not a side effect of decomposing one scope.

## The scope both "waits on 2" and "starts immediately", and both are true

**Decision.** The `Waits on` cell stays as it is in the parent's table, and the master plan does not
try to reconcile the two statements by weakening either.

**Why.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#running-order)
says scope 12 waits on "nothing after 2" and, three lines later, that scopes 1, 2, 3 and 12 can all
start immediately. Those describe two different things and both hold. Nothing in plans 01 to 04
needs anybody to log in: they are counting, deciding, and writing values into a config file, and
they need Vite and nothing else. The four by-hand checks in plans 05 to 07 drive real screens as
real roles, and three of the five roles are currently granted by nothing, which is what
`getting-in` fixes. So the writing starts now and the proving waits.

## The Owes line says nothing for `environment/`, and one possible answer to D10 would make that false

**Decision.** The definition of done carries `/env-pulse` as a conditional rather than as a flat
requirement or a flat omission.

**Why.** Item 12's Owes line is explicit: the runbook gets a recipe, and `environment/` and
`context/` get nothing. That is correct for most answers to D10, because naming a colour changes
nothing about how Attica runs.

It stops being correct for one answer. Tailwind 4 replaces the PostCSS plugin with a Vite plugin and
moves configuration out of `tailwind.config.js`, so `frontend/postcss.config.js` and
`frontend/tailwind.config.js` change shape and the dev server's plugin chain changes with them. "How
the frontend is built" is the kind of fact
[the environment overview](../../../../environment/overview.md) exists to hold, and a fact that
becomes false silently is the failure that folder is meant to prevent.

**Why conditional rather than always.** Running a pulse that has nothing to report trains the reader
to skip pulses. The condition is written as a test a person can answer in one line: did the stack
decision change how the frontend is built or started.

## Five dead class names and two unimported dependencies became deliverables

**Decision.** The definition of done names `shadow-xs` at `ListingReview.jsx:374`, `:381` and
`:389`, `animate-fade-in-down` at `EventListingPage.jsx:19`, `animate-fade-in` at `PostCard.jsx:21`,
and the `react-calendar` and `websocket` dependencies that no file imports.

**Why, when item 12 names none of them.** They are not new scope, they are the evidence for the
scope's own claims, and leaving them out would mean the scope names a problem and walks past its
clearest instances. `shadow-xs` is a Tailwind v4 class name written into a v3 codebase: it renders
nothing, nobody noticed, and it is the strongest single argument in the repository for why the stack
has to be decided rather than drifted into. The two animation classes are defined nowhere and their
elements are static, which is the same silence from the other direction. All five exist because an
invented style and a misspelled one are indistinguishable from the outside, and that is exactly what
[plan 07](plans/07-prove-it-and-write-it-down.md)'s check is for.

The two unimported dependencies belong to the stack decision rather than to tidiness: any honest
inventory of what the frontend depends on has to say which dependencies are load-bearing, and two of
them are not.

## The invented-style check is specified by what it must catch, not by what it is

**Decision.** The definition of done asks for "a lint rule, a config-driven allowlist, or a script,
chosen for what this toolchain can actually run", and fixes only the two things it must fail on.

**Why.** The obvious answer is an ESLint rule, and ESLint is present (version 9, with the React
hooks and React refresh plugins). But ESLint sees JavaScript, and a Tailwind class name is a string
inside a `className` prop, so catching a class that matches no rule is a different kind of check
from catching a hand-written hex value. Which mechanism is right depends on what the stack decision
in plan 01 chose, and on a fact about this repository that
[the environment folder](../../../../environment/00-INDEX.md) does not record: there is no unit test
runner, so a check written as a test has nowhere to run today.

Naming the mechanism now would be guessing. Naming what it must fail on is not: a hand-written hex
value, because 58 of them exist and each one is a token that was never named, and a class name that
matches no rule, because five such names are live in the tree right now and nothing reported them.

## The counted numbers are pinned to commands rather than quoted as facts

**Decision.** Every number in this scope's master plan is repeated in
[plan 01](plans/01-measure-it-and-take-the-stack-decision.md) as a command with its output, and the
later plans are measured with those same commands.

**Why.** `one-client-truth` hit this exact problem: its master plan recorded 132 fetch call sites
across 38 files, and a differently worded grep on the same tree answered 144 across 40. Neither
number was wrong; they were two rulers. A before-and-after comparison taken with two rulers measures
nothing, and it is the easiest way for a plan to report progress it did not make.

This scope has eight such numbers rather than one, so the risk is eight times larger. The counting
commands are a deliverable of plan 01 for that reason, and every later plan's after-number is
specified as "the command from plan 01, run again".

## The scope was checked against its own preflight before being called done

**Decision.** `/verify-plan` was run over all seven plan files as the last act of authoring them,
rather than left for whoever opens plan 01 first.

**Why.** Every plan in this scope opens with a task 0 telling its reader to run that check before
working from the plan. A scope that ships seven plans none of which has been checked is asking the
first reader to do the author's proofreading, and it is the cheapest possible check to run.

**What it found, and what changed.** Structure, section order, breadcrumbs, hierarchical task
numbering, the Error Matrix subsections, the Orchestration columns, the three maintenance tasks with
their paths written in, and every `▶ Next` and `◀ Needs` pointer with a resolving anchor all passed
on all seven. One finding stood: four plans asked a person to write something down during a by-hand
check with no Outputs / Deliverables row to hold it, so the observation would have landed in a chat
message and been lost. Each of those four gained one row naming where it goes, and
[plan 05](plans/05-the-components-that-own-the-styles.md)'s task 3.2 gained the filename it had left
implicit.

**What was deliberately not repaired.** Nothing. The check surfaced one class of gap and it was
closed in the same pass.

## The master plan carries the counts rather than deferring them all to plan 01

**Decision.** The numbers appear in full in the master plan's "What is true today" section, not only
in the plan that pins them.

**Why.** The mission of this scope is a claim about scale: that nothing is named and the consequence
is measurable rather than aesthetic. A master plan that says "the styles are inconsistent" and
points at a plan file for the evidence asks the reader to take the scope's whole premise on trust
through one more hop. The counts are the argument, so they sit where the argument is made. Plan 01
carries the commands, which is the part that has to be repeatable.

## Populating this scope a second time writes nothing

**Decision.** A repeat `populate-plans` run over this scope adds no plan file, renumbers nothing and
rewrites nothing. It audits what is here and stops.

**Why.** The seven plans already cover every mark in
[item 12 of the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system)
and every item in [the definition of done](MASTER_PLAN.md#definition-of-done), so a new plan file
could only duplicate a deliverable one of the seven already owns. The numbering is what makes this
matter rather than tidiness: these plans are steps 22 to 28 in
[the parent's running order](../../MASTER_PLAN.md#running-order), and those numbers are written into
the plan files, into this scope's map and into the parent's own prose. A plan 08 authored so that a
run has something to show would move none of them, and would leave the next reader working out which
of two plans owns the tokens.

**What the audit covers**, recorded so it is not repeated. Every mark in item 12 has an owning plan:
the four `build` marks belong to plans 02, 03, 04, 05 and 06, and the `decide` mark, D10, belongs to
plan 01. Every Definition-of-Done item maps to at least one task line, and the four
`[owner: human]` checks each have a numbered Instruction group rather than a task line pretending a
person's judgement is Claude's to execute: the drawer test and the mobile walk in
[plan 06](plans/06-cards-that-answer-to-their-container.md), the ten-minute test in
[plan 05](plans/05-the-components-that-own-the-styles.md), the reduced-motion check in
[plan 04](plans/04-say-what-moves-and-what-does-not.md). The seven plans' section lists are identical
to those of the sibling scope [one client truth](../one-client-truth/MASTER_PLAN.md), so the template
is the same one across both. Every relative link in this scope resolves to a file that exists, and
every heading anchor a link points at resolves to a heading that exists, checked across the master
plan, this file, the map, all seven plans and the process snapshot.

**The parent capstone owes this scope no amendment.** It already names "the design system" as one of
the three component glyphs in its experience panel, which is the glyph
[this scope's map](diagram-prompts.md) zooms into.

**What is genuinely outstanding**, and is not a planning skill's to close. Ten prompts in the map
with no rendered image. The map says so in its own closing section, no Definition-of-Done item asks
for a rendered picture, and rendering is drawing work rather than planning work.
