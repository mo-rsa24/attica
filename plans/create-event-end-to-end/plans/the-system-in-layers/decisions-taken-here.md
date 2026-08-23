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
