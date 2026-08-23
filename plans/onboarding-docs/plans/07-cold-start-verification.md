# 🧪 Cold-Start Verification

Step 4 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on steps 2 and 3
([02](02-backend-setup-docs.md), [03](03-frontend-setup-docs.md)) for the guides it walks.
Next: [Architecture diagrams](04-architecture-diagrams.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Description: what to do](#description-what-to-do)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [onboarding-docs](../MASTER_PLAN.md). This is the fourth step of six and the only one that
tests rather than writes. Steps 2 and 3 produced the guides; this one proves them.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

All three setup guides are written and committed. None has been proven by someone following it on a
machine that has nothing installed. That walk is the only thing standing between the guides and the
handoff to Mongezi.

**This plan is almost entirely yours to run.** The Tasks lane holds the preflight, the guide
corrections Claude applies once you report what broke, and the close-out. Everything else is in the
Instructions lane, because it is a person at a keyboard on a bare machine and cannot be anything
else.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority. Do not restate a fact
here; if this walk needs one that file does not carry, stop and ask.

- Nothing auto-starts. Running Attica means four processes started by hand, and the guides must say
  so or they are wrong.
- Redis must be up on `127.0.0.1:6379` before the backend starts.
- The app is run from the virtual environment at `/home/molef/lobola`. **The guides deliberately
  tell a new developer to create their own environment inside the repo instead**, which is correct
  for them and different from what this machine does. Do not "fix" the guides to match this machine.
- `CORS_ALLOWED_ORIGINS` defaults to ports 5173 and 3000 only. If Vite binds 5174 during the walk,
  part of the app will fail and the guide needs to say what to do about it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A machine that already has the tools cannot test the install instructions.**

It can only test the run instructions. Moving `venv/` aside proves nothing about whether
`00-machine-setup.md` works, because Python is still installed. Use a bare machine or VM, or
`wsl --unregister Ubuntu`, or accept that the machine-setup leg is untested and say so.

**The temptation is to fix the problem instead of the guide.**

When a command fails, the reflex is to work out the right command, run it, and carry on. That
leaves the guide exactly as broken as it was. The fix belongs in the guide file, and then the step
gets re-run to confirm the fix holds.

**Unregistering a WSL distro destroys everything in it.**

`wsl --unregister Ubuntu` is not reversible. Anything in that distro's filesystem that is not
committed and pushed is gone. Check before running it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

A developer with Django and React experience and no prior knowledge of Attica can follow these three
guides on a machine with nothing installed and reach a running, seeded, logged-in state, without
asking anyone a question.

The walk either supports that claim or produces the list of corrections that would.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A guide that reads well can still fail in practice: a missing prerequisite, a stale command, an
assumption about local state that was already true on the author's machine. Reading it again does
not find those, because the author's eyes supply what the page omits.

Doing this before the handoff means Mongezi's first experience of Attica is not debugging someone
else's onboarding document.

**One trap has already been found this way, which is the argument for the rest.**
`backend/requirements.txt` was a stale pip-freeze that shadowed `backend/main/requirements.txt` and
pulled operating-system packages into a fresh virtual environment. Nothing about reading the guide
would have surfaced it.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-do) ➡️

```
  bare machine
       │
       ▼
  00-machine-setup.md ──► git, python3.12, node, npm, redis-cli all answer
       │                        │
       │                        └── any command fails ──► fix the GUIDE ──┐
       ▼                                                                  │
  backend-setup.md ─────► :8000 serves, REST call works, Redis pings      │
       │                        │                                         │
       │                        └── any command fails ──► fix the GUIDE ──┤
       ▼                                                                  │
  frontend-setup.md ────► :5173, logged in as e2e-organizer, data flowing │
       │                        │                                         │
       │                        └── any command fails ──► fix the GUIDE ──┤
       ▼                                                                  │
  clean run, zero corrections needed ◄────── re-run from the fixed step ──┘
```

The loop is the point. A walk that finds nothing on the first pass has almost certainly been done
on a machine that was not cold.

## Description: what to do

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Prove the three setup guides work when followed literally from a genuinely cold start: no WSL2, no
Python, no Node, no Redis, no repository clone. Not merely an absent `venv/` and `node_modules/`.

All three are walked, `00-machine-setup.md` first, and every deviation is corrected in the guide
file itself rather than noted on the side.

## Purpose and goal

Navigation: ⬅️ [Description: what to do](#description-what-to-do) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Turn "the docs are written" into "the docs are verified" before the handoff.

**Goal.** A dry run of all three guides end to end, from a machine with no WSL2 distro provisioned,
no `backend/venv/` and no `frontend/node_modules/`, reaching the guides' own stated target states
(backend serving `:8000` with a working REST call and a WebSocket connection; frontend on `:5173`,
logged in as `e2e-organizer`, real API and WebSocket data flowing), with every deviation corrected
in the guide itself.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these. This lane is short on purpose: the walk itself is
manual and lives in [Instructions](#instructions).

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/07-cold-start-verification.md`
  - Confirms the structure, the handoff pointers and the environment-facts field before you spend a
    block of time on the walk.

▶ **Next: [instruction 2.1](#2--isolate-the-machine)**, which needs nothing from Claude and starts the walk.

### 1. 🔧 Apply the corrections the walk finds

◀ **Needs: [instructions 3, 4 and 5](#3--walk-artifactsnotesonboarding-a-new-developer00-machine-setupmd)** to have produced a list of deviations.

- [ ] **Fix each reported gap in the guide file itself**
  - Give Claude the command as printed, what actually happened, and which guide and step it was.
  - Claude edits `artifacts/notes/onboarding-a-new-developer/00-machine-setup.md`, `artifacts/notes/onboarding-a-new-developer/backend-setup.md` or
    `artifacts/notes/onboarding-a-new-developer/frontend-setup.md`, and adds a matching troubleshooting entry where the failure was not
    obvious from the command.
  - [x] Backend install: `backend/requirements.txt` was a stale pip-freeze that shadowed
    `backend/main/requirements.txt` and pulled operating-system packages (`cloud-init`,
    `dbus-python`) into a fresh virtual environment. The stale file is deleted, and
    `artifacts/notes/onboarding-a-new-developer/backend-setup.md` now has the reader confirm the file is the 62-line one before
    installing (step 3), with a matching troubleshooting entry.
  - [ ] Every other gap the full three-guide walk turns up.

- [ ] **Correct the Django version wherever the guides still say 5.1**
  - It is 5.2.3, verified against `backend/main/requirements.txt:17`.
  - Known stale: `slides/backend-setup.md:22`, and this scope's plan 02 at lines 36 and 91.

▶ **Next: [instruction 6.1](#6--re-run-from-the-fixed-step)**, which confirms the fix holds.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 6.2](#6--re-run-from-the-fixed-step)**, a clean run with zero corrections.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for each failure the walk found
  - Every guide gap is an error pattern someone else will hit. This is cheapest to write down while
    the failure is still in front of you and effectively unrecoverable a month later.
- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`
  - Flips this plan's status and moves it to `completed/` once the walk is clean.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself. This is the bulk of the plan.

### 2. 🖥️ Isolate the machine

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)** to have passed.

2.1 **Set aside a real block of time**
   - This needs undivided attention, not a spare ten minutes. A partial walk that gets abandoned
     halfway leaves the guides in a half-corrected state that is worse than untouched.
   - Expected result: a calendar block of at least two hours.

2.2 **Get a genuinely cold environment**
   - Best: a fresh machine or VM with nothing installed.
   - Acceptable: Windows Terminal → `wsl --unregister Ubuntu`, then reinstall the distro.
   - ⚠️ **`wsl --unregister` destroys everything in that distro and cannot be undone.** Before
     running it: `cd /home/molef/Work/attica && git status && git log origin/main..HEAD` and confirm
     nothing uncommitted or unpushed matters to you.
   - Weakest, and say so in the report: leave the machine as it is and move `backend/venv/` and
     `frontend/node_modules/` aside. This tests the run instructions only, never the install ones.
   - Expected result: `python3 --version`, `node --version` and `redis-cli --version` all return
     "command not found". ✅ that is a cold machine. ❌ anything answers with a version, and the
     machine-setup leg cannot be tested.

▶ **Next: [instruction 3.1](#3--walk-artifactsnotesonboarding-a-new-developer00-machine-setupmd)**.

### 3. 📖 Walk `artifacts/notes/onboarding-a-new-developer/00-machine-setup.md`

◀ **Needs: [instruction 2.2](#2--isolate-the-machine)**, a cold machine.

3.1 **Follow it literally, command by command**
   - Open `artifacts/notes/onboarding-a-new-developer/00-machine-setup.md`. Type every command exactly as printed. Do
     not substitute a command you know is better.
   - Record, for each deviation: the step number, the command as printed, and what actually
     happened.

3.2 **Run the guide's own verify section**
   - The guide's "Verify: ready for backend-setup.md" section.
   - Expected result: `git`, `python3.12`, `node`, `npm` and `redis-cli` all return a version.
   - ✅ all five answer, move to the backend guide. ❌ any fails, that is a gap; record it and
     carry on to see whether anything downstream also breaks.

▶ **Next: [instruction 4.1](#4--walk-artifactsnotesonboarding-a-new-developerbackend-setupmd)**.

### 4. 📖 Walk `artifacts/notes/onboarding-a-new-developer/backend-setup.md`

◀ **Needs: [instruction 3.2](#3--walk-artifactsnotesonboarding-a-new-developer00-machine-setupmd)**.

4.1 **Follow it literally, command by command**
   - Watch particularly at step 3, the requirements file check. That is where the known trap was.
   - Record every deviation as in 3.1.

4.2 **Run the guide's own verify section**
   - A REST call, a WebSocket connection, and a Redis ping.
   - Expected result: the REST call returns JSON, the WebSocket connects and stays open, and
     `redis-cli ping` returns `PONG`.
   - ✅ all three, move to the frontend guide. ❌ the WebSocket fails, check you started `daphne`
     and not `runserver`, and if the guide did not tell you that, it is a gap.

▶ **Next: [instruction 5.1](#5--walk-artifactsnotesonboarding-a-new-developerfrontend-setupmd)**.

### 5. 📖 Walk `artifacts/notes/onboarding-a-new-developer/frontend-setup.md`

◀ **Needs: [instruction 4.2](#4--walk-artifactsnotesonboarding-a-new-developerbackend-setupmd)**.

5.1 **Follow it literally, and note the port Vite actually binds**
   - If it binds 5174 because 5173 was taken, expect part of the app to fail on CORS. Record
     whether the guide warned you.

5.2 **Log in and run the guide's "Verify Everything Works" checklist**
   - Credentials: `e2e-organizer` / `E2eOrganizerPass!23`.
   - Expected result: tokens stored in `localStorage` under the key `tokens`, authenticated API
     calls returning data, token refresh working, WebSocket connected.
   - ✅ the checklist passes end to end. ❌ any item fails, record which and what you saw in the
     browser console.

▶ **Next: [task 1](#1--apply-the-corrections-the-walk-finds)**, handing Claude the list of deviations.

### 6. 🔁 Re-run from the fixed step

◀ **Needs: [task 1](#1--apply-the-corrections-the-walk-finds)**, the guide files corrected.

6.1 **Re-run each corrected step and confirm the fix holds**
   - Not the whole walk, just from the step that was wrong.
   - Expected result: the corrected command works as the guide now prints it.

6.2 **Do one clean pass end to end**
   - Expected result: all three guides walked with zero corrections needed.
   - ✅ zero corrections, the plan is done. ❌ anything still needs fixing, back to task 1.

6.3 **Restore or discard the test environment**
   - Confirm the original working copy at `/home/molef/Work/attica` is untouched:
     `git status` should show only the changes you meant to make.

6.4 **Mark the Attica "Project Setup" Todoist task done**

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is not done because the tasks are ticked. It is done when one uninterrupted walk of all
three guides, on a machine that started cold, needed **zero** corrections.

A walk that found nothing on its first pass is evidence the machine was not cold, not evidence the
guides are right. Say which of the three isolation levels in instruction 2.2 you actually used.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Corrected machine-setup guide | `artifacts/notes/onboarding-a-new-developer/00-machine-setup.md` | exists, unverified by a cold walk |
| Corrected backend guide | `artifacts/notes/onboarding-a-new-developer/backend-setup.md` | exists, one trap already fixed |
| Corrected frontend guide | `artifacts/notes/onboarding-a-new-developer/frontend-setup.md` | exists, unverified by a cold walk |
| The record of what broke | `CHANGELOG.md` | one entry so far |

No figures. This plan produces corrections to existing documents, not new artifacts.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

When this plan's walk changes a guide, three things move together:

- The guide file itself, which is the deliverable.
- `CHANGELOG.md`, which is the one place the history of what was wrong belongs.
- The scope's [running order](../MASTER_PLAN.md#running-order), via `/sync-plan-tree`, in the close out.

Nothing here writes to the Figure Catalog, because this plan has no figures.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): how Attica actually runs on this machine, and the
  known gaps. Read before deciding whether a guide is wrong or the machine is unusual.
- [The context index](../../../context/00-INDEX.md): what Attica means, if a guide's wording
  needs a term explained.
- [The machine setup guide](../../../artifacts/notes/onboarding-a-new-developer/00-machine-setup.md), [the backend setup guide](../../../artifacts/notes/onboarding-a-new-developer/backend-setup.md),
  [The frontend setup guide](../../../artifacts/notes/onboarding-a-new-developer/frontend-setup.md): the three documents under test.
- [The master plan](../MASTER_PLAN.md): the scope and its running order.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[Architecture diagrams](04-architecture-diagrams.md), step 5 of 6. It does not wait on this
plan's outcome, so a blocked cold-start walk does not block the diagrams.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/run` (drive the app to confirm each step works). Alternative: `/demonstrate` if you want the
verification captured as evidence (terminal output, screenshots) rather than a pass or fail.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A fresh venv install pulls in `cloud-init`, `dbus-python` and other operating-system packages | `artifacts/notes/onboarding-a-new-developer/backend-setup.md`, step 3 | `backend/requirements.txt` was a stale pip-freeze shadowing `backend/main/requirements.txt`. The stale file is deleted; the guide now has the reader confirm the file is the 62-line one before installing. |

(No global catalog entries apply to this scope yet. The close out adds project entries as the walk
finds them.)
