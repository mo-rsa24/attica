# Decisions taken while writing this scope

This scope was written in one unattended pass, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with its reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused.

The source for the scope's content is item 6 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers),
and the state of the world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

Three of these correct a count or a claim the programme's own planning notes make. Those three are
first, because they change what the scope is, not only how it is written.

---

## The count is ten commands, not eleven

**Decision.** The count everywhere is ten, and both planning sources that said eleven are corrected
to match rather than being left to disagree with the scope that reads them.

**Why.** `ls backend/main/scheduling/management/commands/*.py` on 2026-08-23 returns ten files
excluding `__init__.py`. The parent arrives at eleven as "one materialiser, five expiry commands,
two outbox workers, three seeds", and there are four expiry commands, not five. Carrying a wrong
count forward would have made the scope's first plan spend its time looking for a command that does
not exist.

**What was done about the parent.** Every document that carries the wrong count is corrected, so
nobody plans against it a second time. Four of them.
[The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers)
says ten and names the seeds-versus-runner split.
[Where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#2-the-state-of-the-world)
says ten, four expiry, two outbox, and names the two commands that are broken as well as inert. The
[parent master plan](../../MASTER_PLAN.md)'s mission says ten scheduling commands that nothing runs.
And piece 4 of [the parent's subject lane](../../diagram-prompts.md), which draws exactly this scope's
machinery, now specifies ten command glyphs rather than eleven.

**Why the parent's picture had to move too.** This scope's map is the zoom-in on that glyph, and a
zoom-in that shows ten where the wide shot shows eleven is a contradiction a reader has to resolve
by picking one. Piece 4 is `[planned]` and unrendered, so the correction costs a word and no image.
The parent stays coarse: the seven-versus-three split lives in
[this scope's piece 1](diagram-prompts.md#subject-lane) and is not pushed upward, because the child
map is where the detail belongs and the parent adds no vocabulary it does not need.

**Why correct them rather than leave the correction here.** Both are present-tense sources somebody
reads before planning, and a count that is wrong in the source gets copied into the next scope that
reads it. Recording the correction only in this folder would have protected this scope and nothing
else. The one cost, that a reader of the corrected source no longer sees the discrepancy, is paid
for by this entry, which is where a disagreement should be argued.

**What was deliberately not corrected.**
[The plan walk](../../../../ideas/enhancing-create-event-end-to-end/PLAN_WALK.md) also says eleven,
and stays as it is. It is the record of the session that produced the first scope cut, and that cut
is superseded anyway: it describes seven scopes and twenty plan files where the programme now has
thirteen. Editing a record of what was said on a day would falsify the record to fix a number nobody
acts on from there.

## Three of the ten must never be on a runner

**Decision.** `seed_marketplace`, `seed_booking_workflow` and `seed_booking_summary_demo` are
excluded from the runner by name, and the Definition of Done says "by name" rather than "by
omission".

**Why.** A bare "wire up the scheduling management commands" reads as though all of them want a
schedule. Three of them write test data. A seed on a clock would rewrite the development database on
an interval, which is the kind of thing that gets discovered at the end of a long debugging session.
Naming them in the criterion costs one line and makes the exclusion checkable.

## The runbook already answers one of the three questions it was said to be missing

**Decision.** The Runbook section says which of the three questions is already answered and which two
are not. The Owes line in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers)
said all three were missing, on the grounds that "everything written about Redis stops at
`redis-cli ping`", and it is corrected to name the one that exists.

**Why.** [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
carries a real run from 2026-08-22 with the pending count query and its output pasted in, so "how
many events are pending" has a written answer. "What dead-lettered and why" and "what is stranded in
`processing`" do not. Writing the recipe as though nothing existed would have produced a second file
answering a question the first already answers, which is exactly the duplication the runbook format
exists to prevent. So the second recipe finishes Stack § 4's question rather than opening beside it,
and the Definition of Done says update rather than add.

---

## Whether this scope waits on D1 or is written against it

**Decision.** The master plan names D1, says the parent's running order answers it before this scope
starts, and still writes the plans as though it is open, with the first act being to read the answer.

**Why.** The instruction for this pass is that a scope whose content depends on D1 or D2 writes its
plans against the decision being unmade. D1 genuinely bites here even though the running order
covers it: the two notification writers found in the code belong to two different booking
representations, and D1 decides which one is kept and which is migrated. The alternative readings
were both worse. Assuming scheduling wins would have written a plan that says "fix
`_create_in_app_notification`" as though that were settled, when the more-used representation is the
one whose delivery already works. Blocking the whole scope on D1 would have contradicted the
parent's own running order, which has scope 6 waiting on scope 4 and therefore starting after the
answer exists.

## What "written against D2 being unmade" means concretely

**Decision.** The runner is built so that what it runs and how often are configuration, and this
scope implements neither hold semantics.

**Why.** D2 is taken in `contention-and-holds`, which waits on scope 4 exactly as this scope does, so
the two run at the same time and D2 is open for the whole of this one. D2 changes the expiry job set
and its cadence and changes nothing else about a runner. Making the job list configuration turns a
decision that would otherwise reopen this scope's work into a line somebody adds. The alternative,
hard-coding today's two expiry jobs, would have been correct-looking and would have needed
rewriting the moment D2 landed on request-time holds.

## D7 is left open rather than answered here

**Decision.** The candidates for what runs the recurring work are not chosen in this folder. The plan
that takes D7 is this scope's first, and this master plan states only the criteria and the
constraint.

**Why.** `decide` in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
means an open question with no correct implementation until it is answered, and pre-answering it in
the master plan would have made the scope's own first plan ceremonial. The pass's instruction to
decide rather than ask covers how to write the scope; it does not cover a decision the scope exists
to take. `run_outbox_worker`'s docstring already leans toward a process supervisor, and that is
evidence for the D7 plan to weigh, not a decision already made.

## D9 is named as a constraint on D7 without becoming a dependency

**Decision.** The master plan says the D7 plan must state which of its candidates a deployment
decision would invalidate, and does not make this scope wait on `getting-it-out`.

**Why.** The two interact: a supervisor chosen for one machine may not exist wherever Attica ends up
running. But the parent's running order has `getting-it-out` at 13 waiting on scope 4, in parallel
with this one, and inventing a dependency edge the parent does not have would have changed the
programme's shape from inside a child scope. Asking the D7 plan to label its candidates by
deployment-fragility gets the same protection for the cost of one paragraph.

---

## The four code findings, and why they are in the master plan rather than in a plan file

**Decision.** A "What is true today" section sits in the master plan with a `path:line` on every
claim, rather than being left for the scope's first plan to establish.

**Why.** Three of the four change what the scope's Goals say. `expire_draft_holds` being a copy of
`expire_checkout_holds` turns "wire up the commands" into "one of these commands does not do its
job". `expire_and_materialize` not materialising, and writing its own inline update that skips the
outbox, is the single counter-example to the persist-then-push rule this scope is meant to establish,
so it belongs in the statement of the rule. The stranded `processing` state is the ninth architecture
test in the acceptance list, arriving from the other direction. A master plan whose Goals were
written without these would have described a smaller and easier scope than the real one.

**The risk this takes on.** These claims were read, not run. Each carries its file and line so a
disagreement is one `sed -n` away, and the date they were read is on the section.

## `expire_draft_holds` is left as a fork rather than pre-resolved

**Decision.** The Definition of Done says the command expires draft holds and emits an event, **or**
it is deleted and the lazy read-path expiry is written down as intended, and does not pick.

**Why.** The lazy expiry genuinely works for the thing that matters most: a lapsed hold is excluded
from contention queries and reported as `checkout_hold_expired`, so the time really is released
without any job. What is missing is that nobody is told. Deleting the command and emitting the event
from somewhere else is a defensible answer, and so is making the command do what its name says.
Choosing between them needs D2, which is open. Writing the criterion as a fork keeps the scope
honest about that rather than committing to the version that happens to be more code.

## `expire_and_materialize` gets the same treatment for a different reason

**Decision.** Rename-or-implement is a fork, but replacing its inline update with the service call is
not a fork: it is required either way.

**Why.** Whether the daemon should also materialise is a judgement about how the jobs are grouped,
and that depends on D7. Whether an expiry path may skip the outbox is not a judgement: it is the
rule this scope exists to make universal, and the daemon is the only place in the codebase that
breaks it. Splitting the criterion means the part that is settled cannot be lost inside the part that
is not.

---

## The map adds nothing to the parent's vocabulary, and this was checked rather than asserted

**Decision.** The child map declares no new glyph, no new colour meaning and no new tier, and its
Art direction section says why that was easy here.

**Why.** The parent's palette already carries orange dashed for a queued or outbox event and purple
dashed for a WebSocket push, and its application tier already carries a worker gear and a queue
tray. This scope is about the place where an orange dashed arrow fails to become a purple dashed
one, which the existing vocabulary states exactly. The sibling scope `the-system-in-layers` had to
justify a document glyph; this one had nothing to justify, and saying so is worth a sentence so a
later reader does not go looking for the addition.

## The parent capstone gets labels, not a new glyph

**Decision.** No glyph was added to [the parent's subject capstone](../../diagram-prompts.md). Its
five domain glyphs are now named in the prompt, one of those names being this scope's, and the
deploy glyph in the alongside column is named too.

**Why no new glyph.** The rule is that a scope with no glyph in the parent capstone gets one added in
the same commit. This scope has one: it is among the five component glyphs in the capstone's domain
panel, and [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md) names the
four scopes that lack a glyph, which are `performance-architecture`, `the-event-workspace`,
`the-design-system` and `getting-it-out`. This is not one of them.

**Why the labels anyway.** A glyph nobody can identify does not carry the scope into the parent
picture, which is the thing the rule exists to guarantee. The capstone's own render note said the
five domain glyphs came out unlabelled and that the label belongs on each; it recorded the fault
without saying what the labels are, so the next render would have had to re-derive five names.
Naming them costs a line and settles it. The five are the parent's own sub-scope names, already in
[its Sub-Scopes table](../../MASTER_PLAN.md#sub-scopes), so nothing is invented and no vocabulary is
added: the pinned art direction already calls for a clean label under every icon.

**What was deliberately left alone.** The arrow structure inside the domain panel. The prompt says
booking truth feeds the other four, and the running order is finer than that (scopes 7 and 8 wait on
5 and 6, not directly on 4). The capstone is the coarse view and it is `[built]`, so re-cutting its
dependency structure is a bigger claim than labelling and belongs to whoever redraws it, not to a
scope correcting its own glyph. The render note keeps the arrow fault on the list.

## Where this scope's rows sit in the parent's running order

**Decision.** Steps 11 to 15, appended after the layers scope's four, with the two cells that depend
on `one-booking-truth` naming it in words rather than by a step number.

**Why.** Scopes 4 and 5 sit between the layers scope and this one and neither is decomposed, so
there is no step number to point at. A number would promise an ordering the table cannot yet
express. Naming the scope keeps the dependency readable and stays true when those rows arrive.
Appending rather than inserting also renumbers nothing that already exists.

---

## What this scope does not touch, and why that is a decision

**Decision.** No new outbox emit site is added to any booking representation.

**Why.** Nineteen emit sites already exist in `scheduling/services.py` and the chat representation has
none. Adding them to chat would be work deleted if D1 keeps scheduling; adding more to scheduling
would be work deleted if D1 keeps chat. The delivery of events that are already emitted is
improvable under either answer, so that is where the scope's build work sits.

**Decision.** PostgreSQL is not assumed, and the single-worker assumption is stated instead.

**Why.** D6 recommends PostgreSQL and `contention-and-holds` owns it, running in parallel with this
scope. The outbox dispatcher's claim uses a conditional `UPDATE` rather than `select_for_update`, so
it is safe on SQLite for one worker and unproven for two. Stating the assumption is honest; designing
for a second worker process on a database that cannot arbitrate would be a concurrency bug written
deliberately.

---

## The fifth plan was written rather than the other four trimmed to fit

**Decision.** `plans/05-prove-it-and-write-it-down.md` now exists. The scope is five plans, which is
what plans 01 to 04 always said it was.

**Why.** The four plan files on disk were authored as a set of five: each opens with "of five", and
fourteen references across three of them point at `05-prove-it-and-write-it-down.md` by name. The
population run that wrote them stopped before the last file. That left two possible repairs, and
only one of them is honest.

Editing the four to say "of four" and stripping the fourteen references would have deleted real
work rather than finishing it, and the work is not optional: the scope's Definition of Done carries
six items no other plan owns. Nothing else finishes the runbook pair's second half, rewrites the two
environment statements this scope makes false, or walks the dead-letter path. Writing the fifth file
was the smaller change and the only one that leaves the Definition of Done reachable.

**What the fifth plan owns, and where each item came from.** Nothing in it was invented. The four
existing plans hand it work by name, and the master plan lists the rest.

The second half of the runbook pair, "what is stuck" and "what died and why", is handed over
explicitly by [03](plans/03-build-the-runner.md), which says it owns the first of the three questions
and that 05 owns the other two, and that the second recipe finishes
[Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
rather than opening a file beside it. The environment rewrites are handed over by
[03](plans/03-build-the-runner.md), whose runner makes the four-hand-started-processes sentence
wrong, and by [04](plans/04-close-the-two-silent-losses.md), which says of the never-pushes gap that
"it stops being true in this plan, and 05 rewrites it". The three environment facts from
[01](plans/01-take-the-execution-decision.md) task 4.4 are handed to `/env-pulse` here by that plan's
own wording. The dead-letter walk is [04](plans/04-close-the-two-silent-losses.md)'s stated next
step: 05 "gives the dead-letter table a way to be read and replayed". The cold-terminal test and the
two pulses are Definition-of-Done items with no other owner.

**What it deliberately does not do.** It changes no code, and says so in its own Description. A code
change surfacing at this point belongs in one of the four plans before it, and putting it here would
hide a gap in them behind a document.

## The dead-letter walk is instruction 4 of plan 05, not of plan 04

**Decision.** The by-hand dead-letter walk lives in the fifth plan even though the dead-lettering it
exercises is built in the fourth.

**Why.** [04](plans/04-close-the-two-silent-losses.md)'s own Next step says 05 is what "gives the
dead-letter table a way to be read and replayed", and its engagement gate lists four pass conditions,
none of which is the dead-letter walk. So the fourth plan was written expecting the walk to sit here.
It also reads better here: the walk produces the real `error_message` and the real replay output that
the recipe has to quote, so doing it one task before writing it down means the evidence is still on
screen. A walk done a plan earlier would be written up from memory.

## Committing the four plan files that were already on disk

**Decision.** All five plan files are committed together, along with the three documents that said
this scope had none.

**Why.** The four were untracked, so nothing recorded that they existed and any `git clean` would
have taken them. Committing four alone was the one option to reject outright: fourteen links pointing
at a file that is not there is worse in the tree than the same four files sitting outside it, because
a tracked broken link reads as a mistake somebody made rather than as work in progress.

The three documents were each stating something false once the files existed: this scope's own Plans
section said "(none yet)", the parent's running order carried a placeholder row reading "plans not
authored yet", and this scope's map said the process lane could not be written "because this scope
has no plan files". All three now say what is true.

**What was checked before committing.** Every relative link and every in-file anchor across the five
plans, the master plan, the map and this file resolves to something that exists. The fifth plan
carries the same twenty sections as its four siblings. No existing plan file was renumbered or
overwritten, and no row in the parent's running order above step 11 changed.

## The map's process lane, and the run that asked for a decomposition already done

**Decision.** The request was `decompose-plan` for this scope. This scope was already decomposed, so
the decomposition was not re-run. The one thing that skill owes a child scope and that was still
missing here, the map's process lane, was written instead, in three prompts, with its version 01
stamped in `diagrams/process-versions/`.

**Why.** Every write `decompose-plan` makes was already on disk: this folder, its master plan, its
five plans, its map, the parent's Sub-Scopes entry, and the parent's running-order rows 11 to 15.
Re-running it would have rewritten the master plan and re-created a `plans/` folder that already
holds five files, which is the one outcome that cannot be undone by reading the diff. The process
lane was the only genuine gap, and its own stub already said it was authorable because the five plan
files it draws from exist.

**Why three prompts and not five.** One prompt per plan would have drawn the same five stages five
times. The three each do a different job: why steps 11 and 12 come before anything is scheduled,
what each of the five gates actually checks, and the before-and-after of the whole scope. Prompt 1
and prompt 2 overlap on the same two stages on purpose, at different zoom.

**How the pinned reading axes survived a lane about time.** The parent pins vertical to upward
dependency and horizontal to "these two can run at the same time", and a process lane is usually
drawn left to right as time. Here they did not have to be traded: steps 11 and 12 both wait on
`one-booking-truth` and on nothing else, and 13 waits on both, so time and dependency point the same
way and the two side-by-side panels mean exactly what the parent says side by side means. Sequence is
carried by the running-order step badges, and the lane says so in its opening paragraph rather than
leaving a reader to assume a new axis meaning.

**What the lane was allowed to use.** Only the five pinned colours (blue dashed a request, green
solid a write, orange dashed a queued or outbox event, purple dashed a WebSocket push, red a
confirmed defect), the four glyphs this scope's art direction already names, and the sequencing
devices the format contract grants every process lane: numbered step badges, phase containers and
gate bars. No new colour meaning, no new glyph, no sixth tier.

**One faithfulness rule runs through all three notes.** Purple dashed appears only where step 14 has
already happened. Prompt 1 forbids it outright, because drawing delivery at the point where the two
commands are made honest would claim the scope finished two steps early, and that is the exact
misreading this scope exists to correct: the machinery looking finished while nothing reaches a
person.

## The parent's process lane was left alone, and its stub was corrected

**Decision.** The parent scope's process lane was not authored. Its stub was rewritten, because the
reason it gave for its own gap was wrong.

**Why not author it.** The lane's stages are the parent's running order, and nine of its thirteen
scopes have no plan files yet, so the table will grow by most of its eventual length. The lane is
regenerated whole rather than patched, so drawing it now means drawing it again. Nothing is waiting
on it either: a child's lane draws that child's own plans and does not read the parent's.

**Why the stub had to change anyway.** It said `populate-plans` writes the lane "once this scope has
plan files". The parent has no plan files of its own and may never have any, since its steps live in
the sub-scopes, so that sentence made the lane wait on a thing that is not coming. The stub now names
the real gap, which is the nine undecomposed scopes. This is the same failure that was corrected in
this scope's own map: a document explaining its gap with a false reason is worse than one that simply
names the gap.

## What was checked before this run finished

**Decision.** The verification sweep `decompose-plan` closes with was run across this scope, not
assumed from the fact that nothing had been renumbered.

**What it covered and what it found.** Every in-file anchor and every relative path across the five
plans resolves to something that exists, checked by script rather than by eye. All five plans carry
their `▶ Next` and `◀ Needs` pointers on every task and instruction group, and every section number
they cite resolves. Nothing was broken, so nothing was repaired.

## The sibling plan's count was removed rather than corrected

**Decision.** Task 3.3 of
[Read the system before drawing it](../the-system-in-layers/plans/01-read-the-system-before-drawing-it.md)
was "Establish which of the eleven scheduling commands has a runner" and is now "Establish which
scheduling commands have a runner". The number is gone, not replaced with ten.

**Why touch a sibling scope's plan at all.** It asked a reader to account for eleven of a thing there
are ten of. The reader would have run the `ls` that task already carries, counted ten, and spent
their time looking for the eleventh. That is a defect this scope had the evidence to fix and the
sibling had no way to notice.

**Why remove the number rather than correct it.** That task's own job is to produce the count by
running `ls scheduling/management/commands/`. Any number in its title pre-supposes the answer the
task exists to establish, so ten would have been the same mistake with a currently-true value. A
count baked into a heading also goes stale the first time somebody adds a command.

**What was deliberately not touched.** Nothing else in that scope. This is one word in one task
title, not a re-population of a sibling, and the rest of that plan is its own scope's to change.

## What this run found already done

**Decision.** `populate-plans` was re-run against this scope and wrote no plan file, because the five
it would have written are on disk and cover the scope.

**What was checked, and by what.** Every mark in
[item 6 of the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers)
resolves to at least one task: the **decide** to plan 01, the **wire up** of the ten commands to plan
03, the **wire up** of the outbox worker to plans 03 and 05, and the **build** of persist-then-push to
plans 02 and 04. Every one of the fourteen Definition-of-Done items resolves to at least one task or
instruction, including the three named seeds, the reaper, both by-hand walks, the dead-letter replay,
the `drip-runbook` and `runbook-pulse` pair, the Stack § 4 update and `env-pulse`. The Owes line's
three obligations each land in a task: the execution-model fact in plan 05, the start-and-stop recipe
in plan 03, and the finish of the drain-the-outbox recipe rather than a duplicate of it in plan 05.
All five plans carry group 0 and a close out with this scope's real path already in the prompt.

**Why record a run that changed nothing here.** A second unattended pass that finds the work done
looks identical to a pass that never happened. Saying which coverage was checked and against what is
what makes the difference readable later.
