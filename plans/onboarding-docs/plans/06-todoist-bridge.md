# ✅ Todoist Task Bridge

Unnumbered in the [running order](../MASTER_PLAN.md#running-order): nothing blocks it and
nothing waits on it. Worth running once the remaining plans have settled, so the exported
tasks are not immediately stale.

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
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

Scope: [onboarding-docs](../MASTER_PLAN.md). Outside the numbered sequence. It reads every other
plan in the scope, so running it early means exporting tasks that are about to change.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing is started, and that is correct: three of the seven plans have open tasks, so an export made
now would be stale within a week.

**This plan reads seven plans, and an earlier draft of it said five.** The briefs listed 01 through
05 and silently omitted 06 and 07, which would have exported an incomplete task set. Corrected
below.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

None apply. This plan reads and writes markdown and talks to Todoist over its own connector. It does
not touch Attica's runtime, database, or auth.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Export too early and you maintain the export instead of the plans.**

Every task exported is a task that can now drift from its plan. With three plans still open, an
export made today needs re-doing after each one lands. The running order deliberately gives this
plan no step number for that reason.

**The task count has changed and any expectation of "25 to 35" is now wrong.**

The template retrofit added a preflight task and a close-out task to every plan, and moved the
manual work of plans 04 and 07 into Instructions. Count what is actually there rather than checking
against a remembered number.

**Todoist tasks and plan tasks are two copies of one thing.**

The bridge is one-way. Ticking a task in Todoist does not tick it in the plan; that reconciliation
is `sync-plan-tree`'s job, from a natural-language statement of what you did.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Every task line in this scope, across all seven plans, appears in Todoist with enough of its
context attached that a calendar block can be worked from the Todoist task alone, with nothing else
open.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Plans live in a repository and work happens against a calendar. A task nobody sees on the day they
have time for it does not get done.

The bridge is what puts each plan's task where the work is actually scheduled, carrying its
description and its prompt, so the plan file does not have to be open to act on it.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  seven plan files ──► /todoist-bridge (folder mode) ──► todoist/00-INDEX.md
                                                        todoist/<one file per plan>
                                                                │
                                                    eyeball the leaf folder
                                                                │
                                                                ▼
                                              /todoist-publish ──► Todoist project
                                                                    "Attica Onboarding"
```

One-way. The reverse direction is `sync-plan-tree`, from what you say you did.

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Translate every plan file in this scope into Todoist structure: the scope becomes a project, each
plan a section, each task line a task, each subtask a subtask, with the task's description and
prompt bundled into the Todoist description field.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Let this work be tracked where it is actually scheduled, without the plan file open.

**Goal.** A leaf folder under `plans/onboarding-docs/todoist/` holding an index and one file per plan,
published into a Todoist project, with no task lost and every description complete.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/06-todoist-bridge.md`

▶ **Next: [task 1.1](#1--build-the-leaf-folder)**.

### 1. 🔧 Build the leaf folder

◀ **Needs:** the other six plans settled. Check the running order first; three still have open tasks.

- [ ] **1.1 Read all seven plan files and count the task lines**
  - `01-source-analysis.md`, `02-backend-setup-docs.md`, `03-frontend-setup-docs.md`,
    `04-architecture-diagrams.md`, `05-slides.md`, `06-todoist-bridge.md`,
    `07-cold-start-verification.md`.
  - All seven, including this one. An earlier draft listed five and omitted 06 and 07.
  - Report the count rather than checking it against an expected number.

- [ ] **1.2 Run the following prompt:** `/todoist-bridge /home/molef/Work/attica/onboarding-docs --folder`
  - Folder-output mode, so `/todoist-publish` has something to write from.
  - Writes `plans/onboarding-docs/todoist/00-INDEX.md` plus one markdown file per plan.
  - Each task carries its description, its purpose, and its prompt where it has one, so a calendar
    block needs nothing else open.

- [ ] **1.3 Check the folder against the plans before anything is published**
  - Every plan has a file. Every task line in each plan appears. No task appears twice.
  - Every `Run the following prompt:` line survived with its prompt text intact.
  - Checkboxes are all `- [ ]`, with no `[x]` or other variants carried across.

▶ **Next: [instruction 2.1](#2--publish-and-check-it-in-todoist)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 2.2](#2--publish-and-check-it-in-todoist)**.

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 2. 📱 Publish and check it in Todoist

◀ **Needs: [task 1.3](#1--build-the-leaf-folder)**, the leaf folder checked.

2.1 **Run the publish and approve it at the gate**
   - Ask Claude: `/todoist-publish /home/molef/Work/attica/onboarding-docs/todoist`
   - It gates on the account and shows a dry run before writing. Read the dry run; that is the
     last point at which a wrong project is cheap to fix.
   - Expected result: it names the Todoist account and proposes a project named
     `Attica Onboarding`, with one section per plan.
   - ✅ the account and project are right, approve. ❌ wrong account, stop and say so; do not
     approve and clean up afterwards.

2.2 **Open Todoist and check three tasks by hand**
   - Todoist → Projects → `Attica Onboarding`.
   - Expected result: seven sections, one per plan. Pick one task from an early plan, one from
     plan 07, and one subtask.
   - For each: the title matches the plan's task line, and the description carries the prompt or
     click path, readable without opening the repository.
   - ✅ all three read correctly. ❌ a description is empty or truncated, that is a bridge problem;
     fix the leaf-folder file and re-publish that section rather than editing in Todoist.

2.3 **Place calendar blocks by hand**
   - Todoist does not schedule this for you. Put the blocks in Google Calendar where the work
     actually fits.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

Done is: you opened Todoist on a day you had time, picked a task with the repository closed, and
could act on it from the description alone.

An export that exists but has to be read next to the plan file has not saved anybody anything.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Leaf folder: index plus one file per plan | `plans/onboarding-docs/todoist/` | not created |
| Todoist project | `Attica Onboarding` | not created |

The output format example that used to sit in this plan has been removed. `/todoist-bridge` owns
the format, and a second copy of it here would be the one that goes stale.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

This plan reads every other plan in the scope, so it is downstream of all of them. Any plan edited
after the export makes the corresponding Todoist task stale, and nothing detects that.

The reverse direction, Todoist back to the plans, is `sync-plan-tree` from a natural-language
statement of what you did. There is no automatic reconciliation.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The master plan](../MASTER_PLAN.md): the running order, which says which plans have settled.
- `~/.claude/skills/todoist-bridge/`: the folder-output format this plan produces.
- `~/.claude/skills/todoist-publish/references/leaf-folder-format.md`: what the publish step
  consumes.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

Nothing waits on this plan. After it, the scope's remaining work is whatever the running order still
shows open.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/todoist-bridge` in folder-output mode, then ▶ `/todoist-publish` to write it into Todoist.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| The bridge brief lists five plan files when the scope has seven | This plan's own briefs, before correction | List all seven explicitly, including this plan and 07. An omitted plan exports silently and nobody notices until a task is missing. |

(No global catalog entries apply to this scope yet.)
