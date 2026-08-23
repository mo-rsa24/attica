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

**Decision.** The master plan says ten scheduling management commands and names the arithmetic, and
does not repeat the parent's "eleven".

**Why.** `ls backend/main/scheduling/management/commands/*.py` on 2026-08-23 returns ten files
excluding `__init__.py`. The parent arrives at eleven as "one materialiser, five expiry commands,
two outbox workers, three seeds", and there are four expiry commands, not five. Carrying a wrong
count forward would have made the scope's first plan spend its time looking for a command that does
not exist. The alternative, silently writing "ten" without saying the parent says otherwise, would
have left the next reader to rediscover the same discrepancy.

**What to do about the parent.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
is a planning-walk document in `ideas/`, not a plan file, and this pass did not edit it. Correcting
it is a one-line edit somebody should make; it is named here so it is not lost.

## Three of the ten must never be on a runner

**Decision.** `seed_marketplace`, `seed_booking_workflow` and `seed_booking_summary_demo` are
excluded from the runner by name, and the Definition of Done says "by name" rather than "by
omission".

**Why.** "Wire up eleven scheduling management commands" reads as though all of them want a
schedule. Three of them write test data. A seed on a clock would rewrite the development database on
an interval, which is the kind of thing that gets discovered at the end of a long debugging session.
Naming them in the criterion costs one line and makes the exclusion checkable.

## The runbook already answers one of the three questions the Owes line says it does not

**Decision.** The Runbook section says which of the three questions is already answered and which two
are not, rather than repeating the parent's "everything written about Redis stops at
`redis-cli ping`".

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

## The parent capstone was not amended

**Decision.** [The parent's subject capstone](../../diagram-prompts.md)
was left untouched.

**Why.** The rule is that a scope with no glyph in the parent capstone gets one added in the same
commit. This scope has one: it is among the five component glyphs in the capstone's domain panel,
and [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md) names the four
scopes that lack a glyph, which are `performance-architecture`, `the-event-workspace`,
`the-design-system` and `getting-it-out`. This is not one of them. The capstone is `[built]` and its
own render note already records that the five domain glyphs need labels on the next render, so
editing the prompt to name them would have re-recorded a fix that is already recorded, on a prompt
whose image already exists.

## Where the placeholder row went in the parent's running order

**Decision.** One placeholder row at position 11, with its "Waits on" cell naming
`one-booking-truth` in words rather than by a step number.

**Why.** Scopes 4 and 5 sit between the layers scope and this one and neither is decomposed, so
there is no step number to point at. A number would have promised an ordering the table cannot yet
express. Naming the scope keeps the dependency readable and stays true when those rows arrive.

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
