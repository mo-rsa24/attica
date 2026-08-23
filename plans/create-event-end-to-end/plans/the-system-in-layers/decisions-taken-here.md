# Decisions taken while writing this scope

This scope was written in one unattended pass, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with the reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused.

The source for the scope's content is section 3 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md), and the state of the
world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

---

## What the scope may draw while three decisions are open

**Decision.** The scope draws the system as it is on the day it is drawn, never as a decision might
make it, and the target-state versions of the three decision-dependent pictures belong to the scopes
that make those decisions.

**Why.** The scope waits on nothing in the parent's running order and is meant to start immediately,
so it cannot be written as a thing that blocks on D1, D2 and D3. The alternative readings were both
worse: guessing an answer would put a confidently wrong picture in front of a reader who believes
diagrams without checking them, and deferring the whole scope would remove the one thing that would
make those decisions easier to take. Four booking state machines drawn side by side, with their state
counts and their reference counts on them, is the evidence D1 needs.

## Naming D3 alongside D1 and D2

**Decision.** The master plan names D3 (whether an event is a set) in the same section as D1 and D2.

**Why.** D1 and D2 were the two named as mandatory. D3 bites the same way and on the same deliverable:
event convergence cannot be drawn as a projection until someone says what happens to nine outstanding
requests when a critical one is refused. Leaving it out would have made the section describe two
thirds of its own problem.

## Where the layers map is filed

**Decision.** The layers map becomes `environment/diagram-prompts.md` plus `environment/diagrams/`,
with `environment/overview.md` carrying a diagram-wanted slot until the image exists and the image
afterwards.

**Why.** `~/.claude/ENVIRONMENT_CONTEXT_FORMAT.md` already specifies exactly this shape for pictures
of an environment, including the slot-not-embed rule and the requirement that `env-pulse` audits the
render count. The alternative, a loose picture file beside `overview.md`, would have been the same
work filed where no check looks at it.

## Where the other diagrams are filed

**Decision.** The five diagrams the reviews ask for land in a new grouping,
`artifacts/figures/how-a-booking-happens/`, with a README card per diagram.

**Why.** The four-folder convention puts produced figures under `artifacts/figures/<grouping>/`, and
the grouping is the genre of the pile in plain words. All five describe what happens when someone
books something: one booking's states, two bookings competing, a booking change reaching the other
party's screen, a set of bookings converging, and their failures. The two existing groupings did not
fit. `how-attica-actually-works` holds screenshots of interactive scenes and would be muddied by
architecture diagrams; `onboarding-a-new-developer` is where the four folded-in ones already belong
and stay.

## How far "a failure diagram beside every happy path" reaches

**Decision.** It covers the nine diagrams this scope owns, and no others.

**Why.** Read literally it could mean every happy path drawn anywhere, which would include the eleven
storyboard steps of the event-creation flow map. That file lives in the learning tree at
`/home/molef/goal-setting/learning/attica-event-creation/`, which this repo's own instructions say is
read from and never written to. A criterion this scope cannot satisfy without breaking that rule is
not a criterion.

## The four diagrams folded in from onboarding-docs

**Decision.** Reconciling them is a Definition of Done item in this scope, executed when its plans
run. `plans/onboarding-docs/` was not edited during this decomposition.

**Why.** The fold-in is genuinely this scope's content. But `onboarding-docs` is a sibling top-level
scope with its own running order and its own state, and editing it while decomposing a child of a
different parent is a change next door made on a guess about that scope's current state. Naming the
reconciliation as a criterion here keeps the duplicate visible without reaching into a scope this run
did not read in full.

**What to watch.** Until that criterion is met, step 5 of `onboarding-docs` and this scope both list
the same four briefs. Whoever runs either one first should do the reconciliation rather than the
drawing.

## The parent capstone amendment

**Decision.** The parent capstone's alongside column now labels its layers glyph. No glyph was added.

**Why.** This scope already had a glyph there, so the rule about amending the parent capstone when a
scope has none did not apply as an addition. It applied as a repair: the capstone's own render note
records that the two glyphs in that column carry no labels, which is exactly the reason the child map
could not point at one of them unambiguously. Labelling the one this scope zooms into is the smallest
change that makes the zoom-in legible. The deploy glyph beside it is `getting-it-out`'s and stays for
that scope's decomposition to label.

## Where the child's placeholder row sits in the parent's running order

**Decision.** Appended after the existing six rows, marked as waiting on nothing, with a sentence
under the table saying it runs alongside steps 1 and 4.

**Why.** The table's existing convention is to group by scope and let the prose carry the parallelism:
step 4 also waits on nothing and sits at 4 rather than at 1. Inserting at position 3 would have
renumbered three existing rows for no gain in truth. `populate-plans` interleaves the real rows when
this scope has plan files.

## The child map carries render marks the parent and sibling do not

**Decision.** Every prompt in this scope's `diagram-prompts.md` carries a `Save as:` path and a
`⏳ not rendered` mark. The parent map and the `getting-in` map were not retrofitted.

**Why.** `~/.claude/DIAGRAM_PROMPTS_FORMAT.md` requires both, and they are orthogonal to art
direction: they say whether a file exists, not what the picture looks like. Adding them breaks no
inheritance. Retrofitting the two existing maps would have been a rewrite of files this run was not
asked to touch.

## The master plan's section set

**Decision.** The same sections as the `getting-in` sibling, not the longer list in
`~/.claude/PLAN_TREE_FORMAT.md`, plus one section named "What this scope may draw while D1 and D2 are
open".

**Why.** A child scope in this tree should read like its siblings, and `getting-in` is the most recent
one written. The extra section exists because the instruction to write against the decisions being
unmade needs somewhere to live that a reader cannot skip.

## The runbook pair this scope owes

**Decision.** How to turn a prompt into a filed image, and how to prove a rendered diagram still
matches the code.

**Why.** The scope's Owes line in
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md) names only
`environment/`, but that file's closing line and the parent's Definition of Done both require a
runbook pair from every scope. For a scope whose output is pictures, the two recurring by-hand jobs
are rendering one and checking one, and neither has a written recipe today.

## The empty plans folder carries a placeholder file

**Decision.** `plans/.gitkeep`, a zero-byte file.

**Why.** Git cannot carry an empty directory, so without it the commit would not contain the folder
this decomposition is supposed to create. No other folder in this repository uses `.gitkeep`, so this
is a new file kind here, and it can be deleted the moment `populate-plans` writes the first real plan.

## References out of the repository are written as paths, not links

**Decision.** `~/.claude/DIAGRAM_PROMPTS_FORMAT.md` and the flow map under
`/home/molef/goal-setting/learning/` appear as inline paths rather than as markdown links.

**Why.** A relative link out of the repository resolves only from this machine, and an absolute one
resolves nowhere a reader is likely to be. The repository's own `CLAUDE.md` refers to the same files
the same way.

## This file rather than a changelog entry

**Decision.** The decisions live here, and `CHANGELOG.md` was not created for this scope.

**Why.** `~/.claude/PLAN_TREE_FORMAT.md` fixes the changelog's register at two or three plain
sentences per dated entry, with no headings and no labels, which cannot carry twelve decisions and
their reasons. A changelog also records what changed about a plan; nothing here has changed yet.

## Committing on main rather than on a branch

**Decision.** The decomposition was committed directly to `main`.

**Why.** The commit immediately before it is `checkpoint before unattended decompose+populate run`,
made deliberately so this run would have something to roll back to. Branching would have separated
the run from the checkpoint that exists for it. Rolling back is one `git revert` or one reset to that
checkpoint.

---

# Decisions taken while populating this scope's plans

## Populating the plans in the same unattended run

**Decision.** `populate-plans` was run on this scope immediately after the decomposition, in the same
session, rather than left as a suggestion for a later one.

**Why.** The commit two before this one is `checkpoint before unattended decompose+populate run`, so
the run this scope was written inside is a decompose-and-populate run, not a decompose-only one.
Stopping at the master plan would have left the scope in the same state as `getting-in` was before its
plans were authored, which is the state the checkpoint exists to move past.

## Prerequisite inference: automatic

**Decision.** The populate run inferred unstated setup work and folded it in, marked `[inferred]`,
rather than drafting only from what the Definition of Done spells out.

**Why.** The skill offers three modes and defaults to asking. With nobody to ask, automatic is the
mode that fails safest: an inferred task is visible and can be struck, whereas an omitted one is
invisible. What it inferred is [plan 01](plans/01-read-the-system-before-drawing-it.md) as a whole,
plus two tasks inside it. The Definition of Done says the briefs are "checked against the code" and
never says the reading is its own deliverable, which would have left eight briefs each re-deriving
the same facts.

## Four plans, not three or six

**Decision.** Read, draw the layers map, brief the other eight, then render and write it down.

**Why.** Each has its own deliverable and its own gate. The two splits worth naming: the layers map
is separate from the other eight because it is filed in `environment/` under a different format
contract for a different reader, and rendering is separate from briefing because a prompt nobody
renders is invisible, which is the failure the whole render-status machinery exists for. Rendering
and writing the runbook pair were merged into one plan, following the sibling `getting-in`, whose
plan 03 does the same.

## A count in a brief must carry the command that printed it

**Decision.** Plan 01 requires every count to be written beside the command that produced it, and no
count was carried forward from the planning documents into the plans.

**Why.** The state counts and reference counts are the evidence D1 gets decided on. A number nobody
can reproduce is decoration, and a number carried from a planning note inherits that note's age. The
plan therefore asserts state counts only where this run read them out of the model file, and cites
those as starting points to confirm rather than as facts.

## A finding that corrects the planning notes

**Decision.** Plan 01 is written to test the claim that nothing publishes to the notification
channel, rather than to draw it.

**Why.** `notifications/utils.py:25` does publish to the per-user group, and `chat/views.py` calls
it. Separately, `scheduling/services.py::_create_in_app_notification` writes a `Notification` row and
returns without touching the channel layer. So the blanket claim in
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md) is too
broad, and the real-time delivery diagram is a different picture depending on which half is true.
Plan 01 settles it by reading and then by watching, and plan 03 draws whatever it found. This run did
not edit the planning notes, because they are the record of what that session concluded; the
disagreement is recorded in the findings file instead.

## The four plans sit after the blockers in the parent's running order

**Decision.** Steps 7 to 10, grouped, rather than interleaved through steps 1 to 6.

**Why.** Nothing gates in either direction: the layers scope needs no login and no green browser
suite, and no blocker needs a diagram. Interleaving would imply a dependency that does not exist. The
prose under the table and the `Do this next` block both say it is startable now, which is the fact
that matters.

## The placeholder file was removed

**Decision.** `plans/.gitkeep` is gone, as the earlier entry said it would be.

**Why.** Four real plan files now hold the folder open.

## Populating this scope again adds no plan file, and corrects what it finds

**Decision.** The scope's `plans/` folder is finished at four files, and a further populating pass
verifies them and fixes what the verification catches, rather than adding a fifth. Nothing here was
renumbered, overwritten or duplicated.

**Why.** `populate-plans` is incremental: it adds to an existing set and never rewrites one. The four
plans already cover every Definition-of-Done item, so a fifth file would either repeat work already
owned by one of them or invent scope the master plan does not ask for. Authoring a plan nobody needs
is worse than authoring none, because `sync-plan-tree` then tracks it forever and every reader has to
work out why it exists.

**What was checked, and what it found.**

Each of the eleven Definition-of-Done items resolves to at least one task line. The environment map
and the layers prompt are plan 02 tasks 1.1 to 1.4 and 2.1; the five briefs checked against code are
plan 01 in full and plan 03 tasks 1.1 to 1.4; the `onboarding-docs` reconciliation is plan 03 tasks
2.1 to 2.3; the three human items (rendering, reading each image back against its faithfulness note,
and checking the layers map against four processes started by hand) are plan 04 instructions 4, 5 and
6; the artifact card is plan 03 task 1.5; the runbook pair is plan 04 tasks 2.1 to 2.3; and the close
out running `/env-pulse` is in plans 02 and 04.

Every relative link in the master plan, the four plans, the map and the decisions file resolves to a
file that exists. The one apparent exception is the `diagram-prompts.md` link inside plan 02's task
2.1, which sits in a fenced block destined for `environment/overview.md`, where it resolves as a
sibling. Every in-file `▶ Next` and `◀ Needs` anchor resolves to a heading in its own file.

The parent capstone already carries the glyph this scope zooms into, labelled "the system in layers"
in the alongside column, so no amendment to it is owed. The parent's running order carries steps 7 to
10 and its `Do this next` names plan 01 as startable now.

**The one thing the item-by-item check does not catch is a count**, and there was one. Nine is the
number of system diagrams this scope owes, and it was being used in a second sense it does not carry:
the number of images to render. Those differ, because
[02](plans/02-draw-the-layers-map.md) task 1.2 writes three or four subject pieces into
`environment/diagram-prompts.md` and task 1.4 writes a process lane, each with its own `Save as:`
path, and only the capstone of that file is one of the nine. So
[04](plans/04-render-check-and-write-it-down.md) was headed "Render the nine" while its own
instruction 4.4 listed ten items, its Description said the scope's own map gets rendered too, and its
Outputs table named no row at all for the environment map's subject pieces.

**How it is resolved.** The render set is whatever
[04's worklist](plans/04-render-check-and-write-it-down.md#1--build-the-render-worklist) finds on the
day, which is what that task already builds by sweeping every `Save as:` line and checking each path
against the filesystem. Every fixed count in 04's instruction lane and its framing prose now says
that instead of saying nine, its Outputs table carries the missing row, and Goal 3 in the master plan
says in one line that nine is what the scope owes rather than what it renders. The alternative,
keeping a number, means five places to hold in sync and a set that quietly files short.

**The scope's own map is rendered at nine prompts, not eight.**
[04](plans/04-render-check-and-write-it-down.md) listed six subject pieces, the subject capstone and
the process capstone, and left out the process lane version itself, which carries a `Save as:` path
and a not-rendered mark like every other prompt in
[the map](diagram-prompts.md#what-is-outstanding). The lane version is a render target: the map's own
outstanding count says nine, and `fixing-create-event` has both of its lane versions rendered to
`process-01-unblock-then-reclassify.png` and `process-02-three-plans-three-gates.png` beside its
capstone, so that is the tree's practice rather than a reading of the contract. 04 now names the lane
in its Description, its render order and its Outputs table. The dated copy of the lane under
`diagrams/process-versions/` is a record rather than a tenth prompt, and task 1.1's sweep does not
reach that folder, so nothing is counted twice.

**One happy path had no failure beside it.** The failure criterion was scoped to the nine, and the
environment map's process lane, one request from an organizer to a provider's screen, is a happy path
outside them. [02](plans/02-draw-the-layers-map.md) task 1.4 now states the failure choice the same
way every brief in [03](plans/03-brief-the-other-eight.md) does, with the outbox worker not running
as the candidate, because that is the failure the environment folder already calls silent.

**The process lane is not regenerated for this.** Its four stages, its gate and its failure branches
are the same as when it was authored, and the shared contract at `~/.claude/DIAGRAM_PROMPTS_FORMAT.md`
regenerates a lane whole or leaves it alone, never patches one. Stage 4's nine images are the nine
owed diagrams, which is still what the picture means. So the live lane still equals snapshot
[01](diagrams/process-versions/01-2026-08-23.md) and no snapshot 02 was stamped.

**What this leaves open.** D1, D2 and D3 are still unanswered, and the plans are written for that: no
picture here waits on them and none guesses at them.

## The boilerplate prompt header stays out

**Decision.** No plan here carries a `## Recommended prompt (after this plan completes)` header, even
though the template lists one, and none was added.

**Why.** All ten plan files across the three populated scopes in this tree agree: none has that
header, and every one instead carries `/ingest-error-pattern` as a real checkbox in its close out.
The checkbox is the stronger form, because `sync-plan-tree` walks it and a header it cannot see. Two
files were checked in each sibling scope before deciding, so this is the tree's settled shape rather
than an omission repeated three times. Adding the header to these four alone would make this scope
the only one that differs, for no gain a reader could act on.

## Decomposing this scope again writes nothing

**Decision.** The scope is already decomposed, so a further decomposing pass verifies the wiring and
records what it found rather than rewriting anything. No file in `plans/` was touched, nothing was
renumbered, and no second scope was spawned under another name for the same work. A different scope
was not substituted either: the eight still undecomposed are named in
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md) and each is its own
run.

**Why.** `decompose-plan` creates a scope; it does not recreate one. Run against a scope that already
has a master plan, a map and four plan files, it can only overwrite files that are correct or
duplicate them beside themselves. A plan file is the only copy of what it says, so overwriting one
costs more than skipping the pass costs.

**What was checked, and what it found.** All six writes the decomposition is responsible for are
present.

The scope directory holds a `MASTER_PLAN.md`, a map, and a `plans/` folder with four files in it. The
parent's Sub-Scopes table carries row 3 linking this scope's master plan. The parent's running order
carries steps 7 to 10, interleaved after the two blockers rather than appended as a block, with the
reason for that placement written under the table. This master plan opens with the pointer at the
parent's running order, above its Mission, and declares no competing table of its own. The map
inherits from the parent map by name, declares no new glyph and no new colour meaning, and says the
parent capstone keeps the layers glyph whole. The parent capstone already carries that glyph, in the
"alongside, from day one" column, so this scope owes the parent no amendment.

Two of the writes do not apply here. There is no parent task line to replace with a link, because the
parent scope has no plan files of its own and its `## Plans` section says so. For the same reason no
`▶ Next` or `◀ Needs` pointer anywhere in the parent could have named a decomposed line, so there was
none to repair.

Every relative link in the master plan, the four plans, the map and this file resolves to a file that
exists. The three `![](...)` strings in plan 02 are literal illustrations of a broken embed, written
inside prose about broken embeds, not links.

The requirement that a scope depending on an unmade decision says so is met: the master plan's
section on what this scope may draw while three decisions are open names D1, D2 and D3, and the four
plans draw what the code does on the day it is drawn rather than what an answer might make it.

**What this run found next door.** `running-the-workers` had four plan files on disk, untracked, out
of a set of five, with the fifth never written and fourteen links across three of them pointing at
it by name. The repair belongs to that scope and is recorded in
[its own decisions](../running-the-workers/decisions-taken-here.md), not here.
