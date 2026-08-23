# 🖼️ Render It, Check It, And Write Down How

Step 4 of 4, the last, in this scope. Waits on [02](02-draw-the-layers-map.md) and
[03](03-brief-the-other-eight.md).
Next: this scope closes.

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

Scope: [the-system-in-layers](../MASTER_PLAN.md). Fourth of four, and the only one whose work is
mostly done by a person rather than by Claude. Everything before it produced text; this produces the
pictures and the two recipes for making more of them.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Every prompt this scope wrote exists and nothing has been rendered. Every render status in the
scope reads `⏳ not rendered`, and that is accurate rather than stale.

This is the plan that most often does not happen, which is why it is a plan rather than a line at the
end of another one. A prompt nobody renders is invisible: it breaks no check, and the document around
it reads as though the picture is there.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

Most of this plan happens outside the repository, so the environment facts that matter are the ones
for the one check that does not.

From [the environment overview](../../../../../environment/overview.md).

- **Four processes must be started by hand**, none supervised: Vite, Django under Daphne, Redis, and
  the outbox worker. Instruction 5.3 counts them, so knowing the number in advance defeats the check.
- **Vite binds 5174 when 5173 is taken**, and `CORS_ALLOWED_ORIGINS` names only 5173 and 3000. From
  5174 every request fails on CORS and reads like a wrong password.
- **Redis carries the channel layer on database 0 and the page cache on database 1.** `redis-cli`
  defaults to 0, so a size check without `-n` reports the wrong one.
- **`git status` shows `db.sqlite3` modified after the app runs.** That is normal here and is not a
  change to commit.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A near-miss that got saved is the failure this plan exists to catch.**

An image that is mostly right, filed with a caption explaining the part that is wrong, is worse than
no image. The caption is not what gets remembered and it does not travel when the picture is pasted
into a chat message. Regenerate instead. It costs one more paste.

**The render status is read off the filesystem, never asserted.**

`🖼️ rendered` means two things at once: the file exists at its `Save as:` path, and its faithfulness
note was read back against it clause by clause. A file on disk that nobody checked is filed as
`⏳ not rendered` with one line saying it exists and is unchecked. Never flip a mark because a prompt
looks finished.

**The layers map gets a different check from the other eight.**

The eight are checked against their own notes, which is a check of drawing against description. The
layers map is additionally checked against the running system, because its subject is something you
can start up and count. That is the strongest evidence available anywhere in this scope and it would
be a waste not to use it.

**The recipes are the part that outlives the scope.**

The images are worth having once. A written way to render one and a written way to prove one still
matches the code are worth having every time the code changes, and neither exists today. Everything
written about diagrams in this repository stops at the prompt.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Every prompt in the scope on disk as an image, each one read back against its own note before it was
filed, and two recipes so the next one does not need this plan.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Two failures, and this plan is aimed at both.

**The prompts never get rendered.** The person who wrote a prompt is the person who will forget it
exists. The whole render-status machinery exists because of this, and it only helps if something
actually walks the list.

**A rendered image goes stale silently.** The code moves, the picture does not, and nothing tells
anyone. A picture that was true in August and is read in November is believed exactly as hard as it
was on the day it was made. The second recipe is the answer to that, and it is why the scope owes
`runbook/` a pair rather than a single how-to.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  every prompt on
  the worklist
       │
       ▼
  paste into ChatGPT ──► save at the Save as: path
       │
       ▼
  read back against the faithfulness note, clause by clause
       │
       ├── every clause holds ──► flip to 🖼️ rendered ──┐
       │                                                 │
       └── any clause fails ──► regenerate ──┐           │
                    (never caption around it)│           │
                          ▲──────────────────┘           │
                                                         ▼
  the layers map only: also check against the running system
                                                         │
                                                         ▼
                                          two recipes ──► runbook/
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

This plan renders every piece in this scope's map rather than adding one, so its illustration is the
map's own capstone.

**Subject capstone: the layers glyph, opened up.** The whole scope in one image, and the last thing
this plan renders.
[The capstone](../diagram-prompts.md#the-layers-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-layers-glyph-opened-up.png`. *(image not yet generated)*

**Process capstone.** The four plans as four stages, authored alongside this plan set.
[The process lane](../diagram-prompts.md#process-lane).
Save as `../diagrams/process-capstone-four-stages.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

1. **Every prompt rendered**, each at its `Save as:` path, each checked against its note. How many
   that is comes from task 1.1's worklist rather than from a number written here: it is the nine
   system diagrams the scope owes plus the rest of the environment map's own pieces, and
   [02](02-draw-the-layers-map.md) task 1.2 decides whether that lane is three pieces or four.
2. **This scope's own map rendered too**: six subject pieces, the subject capstone, the process lane
   and the process capstone. Nine, which is the count [the map](../diagram-prompts.md#what-is-outstanding)
   itself gives. The lane version is rendered like any other prompt, the way the sibling scope renders
   both of its lane versions beside its capstone. The copy of the lane under
   `../diagrams/process-versions/` is a dated record, not a tenth prompt, and task 1.1 does not sweep
   that folder.
3. **Two runbook recipes**: turning a prompt into a filed image, and proving a filed image still
   matches the code.
4. **The scope's close out**: `env-pulse`, the recall gallery, and the sync that flips this scope to
   done.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 5](../MASTER_PLAN.md#objectives) and close the scope's debt to
`environment/` and `runbook/`.

**Goal.** Every render status in this scope reads `🖼️ rendered <date>` or reads `⏳ not rendered`
with one line saying why. Both recipes are in the runbook index. `/env-pulse` reports zero
outstanding pictures in `environment/`.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/04-render-check-and-write-it-down.md`

▶ **Next: [task 1.1](#1--build-the-render-worklist)**.

### 1. 📋 Build the render worklist

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 List every prompt in the scope with its `Save as:` path and current status**
  ```
  cd /home/molef/Work/attica
  grep -rn "Save as:" environment/diagram-prompts.md \
    plans/create-event-end-to-end/plans/the-system-in-layers/diagram-prompts.md \
    artifacts/figures/how-a-booking-happens/ \
    artifacts/figures/onboarding-a-new-developer/
  ```
  - Produces: one row per prompt: file, anchor, `Save as:` path, whether that path exists on disk.
  - Done when: the count matches what [02](02-draw-the-layers-map.md) and
    [03](03-brief-the-other-eight.md) produced. A prompt missing from the sweep is a prompt with no
    `Save as:` line, which is a defect in the prompt, so fix it there rather than adding the row by
    hand.

- [ ] **1.2 Set every status from the filesystem, not from the text**
  - For each row, check whether the file exists. Set `⏳ not rendered` or leave a `🖼️ rendered`
    that is already true.
  - Done when: no status in the scope was written because a prompt looked finished. Every one was
    read off a path.

▶ **Next: [instruction 4.1](#4--render-every-prompt-on-the-worklist)**, which is where the images
actually get made.

### 2. 📖 Write the two recipes

◀ **Needs: [instruction 5.3](#5--check-the-layers-map-against-the-running-system)**, because a recipe
written before doing the thing describes the intention rather than the job.

- [ ] **2.1 Write the rendering recipe**
  - **Run the following prompt:** `/drip-runbook turning a diagram prompt into a filed image`
  - It covers: finding the prompt, what to paste and what not to, the size to ask for, where to save,
    reading the faithfulness note back, and flipping the status. It names the traps: pasting the
    prompt without the style paragraph, and saving anywhere other than the `Save as:` path.
  - Files under `runbook/` per `~/.claude/RUNBOOK_FORMAT.md`.
  - Done when: someone who has never rendered one of these can do it from the recipe alone.

- [ ] **2.2 Write the checking recipe**
  - **Run the following prompt:** `/drip-runbook proving a filed diagram still matches the code`
  - It covers: reading the `path:line` references off the diagram's own file, opening each one,
    confirming the claim, and what to do when it no longer holds. The answer to that last one is to
    mark the prompt stale on the slot so nobody renders it by accident, not to quietly fix the
    caption.
  - Done when: it works for any diagram in the repository, not only this scope's own.

- [ ] **2.3 Register both in the runbook index**
  - Add both to [the runbook index](../../../../../runbook/00-INDEX.md), phrased as the question each
    answers.
  - Done when: both are findable by someone who does not know the filenames.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 2](#2--write-the-two-recipes)** and
[instruction 6.1](#6--file-the-images-and-read-the-set-as-a-set).

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/runbook-pulse @runbook`, because this plan owes `runbook/` a pair and
      the pulse is what confirms both landed where a reader will find them.
- [ ] **Run the following prompt:** `/env-pulse @environment`, which reports the render count. That is
      the number this plan exists to bring to zero outstanding.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers`
  - This is the sync that flips the scope to done and aggregates it into the parent's Sub-Scopes
    table.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself. This is the longest manual lane in the scope, because
rendering and judging an image is not something a command does.

### 4. 🎨 Render every prompt on the worklist

◀ **Needs: [task 1](#1--build-the-render-worklist)**, the worklist.

4.1 **Open ChatGPT and start one conversation for the whole set**
   - Go to `https://chatgpt.com` in a browser, signed in, and pick a model that generates images.
   - One conversation for the whole worklist, not one each. The set has to read as one, and a model
     that has just drawn three images in this style draws the fourth closer to them.
   - Expected result: an empty conversation ready for the first prompt.

4.2 **Paste the first prompt, whole, including the style paragraph**
   - Start with the layers map capstone from `environment/diagram-prompts.md`, because it is the one
     the rest of the set is judged against for consistency.
   - Copy from the start of the style paragraph to the end of the description. Include the style
     paragraph even though it feels repetitive: a prompt has to survive being pasted alone.
   - Ask for the size the prompt names. Where it names none, ask for 1024x1536, which is what the
     parent capstone was rendered at.
   - Expected result: one image, in the premium-infographic style, with a legend inside it.
   - ✅ It looks like the same family as
     [the parent capstone](../../../diagrams/whole-scope-in-one-picture.png): continue.
   - ❌ It comes back flat, or as a photo, or with no legend: the style paragraph did not make it
     into the paste. Check you copied from the start of the paragraph, not from the description.

4.3 **Save it at exactly the `Save as:` path from the worklist**
   - Download the image, then move it to the path the prompt names. Do not rename it, and do not
     save it to Downloads and file it later.
   - Expected result: the file exists at the path, and task 1.2's status check would now find it.
   - ✅ Saved: go to instruction 5 for this image before rendering the next one. Checking as you go
     is what stops eight near-misses accumulating.
   - ❌ You are not sure of the path: it is on the `Save as:` line under the prompt's title. Every
     prompt has one; a prompt without one is a defect to fix in the prompt.

4.4 **Repeat 4.2 and 4.3 for the rest of the worklist**
   - Order, by group rather than by count: the layers map, then the environment map's other subject
     pieces, then its process lane, then the four in `how-a-booking-happens`, then the four in
     `onboarding-a-new-developer`, then this scope's own map, whose lane version is rendered as well
     as its capstone.
   - Expected result: one file per row of the task 1.1 worklist, each at the `Save as:` path that
     row names, and no row left without a file.

▶ **Next: [instruction 5.1](#5--check-the-layers-map-against-the-running-system)**.

### 5. ✅ Check the layers map against the running system

◀ **Needs: [instruction 4.3](#4--render-every-prompt-on-the-worklist)**, the layers map on disk.

Every image gets the note check in instruction 6. This one gets an extra check that no other image
in the scope can have, because its subject is something you can start up and count.

5.1 **Read the faithfulness note back against the image, clause by clause**
   - Open `environment/diagrams/attica-01-the-system-in-layers.png` in an image viewer, and the
     capstone's faithfulness note beside it.
   - Take one clause at a time. Point at the thing in the image that satisfies it.
   - Expected result: every clause has something to point at.
   - ✅ All clauses hold: continue to 5.2.
   - ❌ A clause has nothing to point at: regenerate from 4.2 with that clause emphasised. Do not
     file it and note the gap in a caption.

5.2 **Bring the four processes up and count them against the picture**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Count the terminals you opened. Compare with the process glyphs in the image.
   - Expected result: the same number, and the one drawn as an outline is the one you had to start
     separately and would not have noticed missing.
   - ✅ They match: continue.
   - ❌ The picture has a process the runbook does not start, or the other way round: one of the two
     is wrong. Check which against
     [the execution model](../../../../../environment/overview.md#execution-model), then fix the one
     that disagrees with it.

5.3 **Confirm the three claims a picture is most likely to get wrong**
   - **Two HTTP paths.** Chrome DevTools → Network on `http://localhost:5173`. Look at the Host
     column. You should see both `localhost:5173` and `127.0.0.1:8000`.
     ✅ Both hosts appear: the two-arrow drawing is right.
     ❌ Only one: the image should show one arrow. Correct the prompt, not the fact.
   - **The websocket connects.** Network → filter **WS**. Status must read `101 Switching Protocols`,
     and the request URL must carry `?token=`.
     ✅ 101 with a token in the query string: the drawing is right and the flow map is wrong.
     ❌ No WS row: check `redis-cli ping` first. A websocket failing because Redis is down is a
     different picture from one failing at the proxy.
   - **Two Redis databases.** Run `redis-cli -n 0 dbsize` then `redis-cli -n 1 dbsize`.
     ✅ Two separate numbers: the split-compartment drawing is right.
     ❌ You forgot `-n` and got one number: that is the trap the picture exists to prevent, and you
     just walked into it. Run both again with the flag.

▶ **Next: [instruction 6.1](#6--file-the-images-and-read-the-set-as-a-set)**.

### 6. 🗂️ File the images and read the set as a set

◀ **Needs: [instruction 5.3](#5--check-the-layers-map-against-the-running-system)**, and every image
rendered.

6.1 **Read each remaining image back against its own note**
   - For every worklist row except the layers map, which instruction 5 already checked, open the
     image and its faithfulness note side by side.
   - Confirm each clause. Confirm every hedged piece is visibly hedged and every solid piece is
     solid. Then say out loud what the image taught you.
   - Expected result: what you said matches the visual thesis the prompt claimed.
   - ✅ It matches: flip that prompt's status to `🖼️ rendered <date>` and note the size.
   - ❌ What you said is not the thesis: the image is teaching something else, which is the failure a
     clause-by-clause check misses. Regenerate.

6.2 **Swap the diagram-wanted slot in `overview.md` for the image**
   - Replace the slot block with the embed now that the file exists.
   - Expected result: the picture renders in the document, above the first section.
   - ✅ It renders: `overview.md` finally opens with a shape.
   - ❌ Broken image icon: the path in the embed and the path on disk disagree. The `Save as:` line
     is the authority.

6.3 **Look at the whole set together and judge it as one**
   - Put every image in one folder view, or open them as tabs, and look at them side by side.
   - Expected result: they read as one family. Same background, same glyph weight, same legend
     placement, same label style.
   - ✅ One family: the set is done.
   - ❌ One is visibly the odd one out: regenerate that one in the same conversation as the others,
     asking for it to match the ones already made. This check catches what per-image checking
     cannot, and it is the reason the whole set is rendered in one conversation.

▶ **Next: [task 2.1](#2--write-the-two-recipes)**, which writes down what you just did.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when the pictures exist, each was checked before it was filed, and the next
> person can make another one without asking anybody.

Pass:

- Every prompt in the scope has a status read off the filesystem, and every `🖼️ rendered` one had
  its note read back clause by clause.
- The layers map passed instruction 5, including all three claims in 5.3 checked against a running
  system rather than against the prose.
- `overview.md` shows the image rather than the slot.
- Both recipes are in the runbook index, phrased as questions.
- `/env-pulse` reports no outstanding pictures in `environment/`.

Fail, and what it means:

- An image filed with a caption explaining what it gets wrong. Regenerate. The caption does not
  travel with the picture and is not what gets remembered.
- A `🖼️ rendered` mark on an image nobody read back. The mark then means "a file exists", which is
  not what it says, and the next reader trusts it.
- Recipes written before instruction 5 was done. They will describe the intention rather than the
  job, and the traps that make the job hard will be missing from them.

Partial pass is acceptable when a specific prompt cannot be rendered acceptably after three attempts.
Leave it `⏳ not rendered` with one line saying what the model would not draw, so the next person
starts from the problem rather than from the prompt.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The layers map, rendered | `environment/diagrams/attica-01-the-system-in-layers.png` | subject | ⏳ not rendered |
| The environment map's other subject pieces | `environment/diagrams/` | subject | ⏳ not rendered |
| One request end to end, rendered | `environment/diagrams/attica-02-one-request-end-to-end.png` | process | ⏳ not rendered |
| Four diagrams in the booking grouping | `artifacts/figures/how-a-booking-happens/` | subject | ⏳ not rendered |
| Four diagrams in the onboarding grouping | `artifacts/figures/onboarding-a-new-developer/` | subject | ⏳ not rendered |
| This scope's six subject pieces | `../diagrams/subject-0*.png` | subject | ⏳ not rendered |
| This scope's subject capstone | `../diagrams/subject-capstone-the-layers-glyph-opened-up.png` | subject | ⏳ not rendered |
| This scope's process lane, version 01 | `../diagrams/process-01-four-stages.png` | process | ⏳ not rendered |
| This scope's process capstone | `../diagrams/process-capstone-four-stages.png` | process | ⏳ not rendered |
| The rendering recipe | `runbook/` | — | not started |
| The checking recipe | `runbook/` | — | not started |
| `overview.md` showing the image | `environment/overview.md` | — | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/04-render-check-and-write-it-down.md` | task 0, before any work | Conformance and thin instructions reported |
| Write the rendering recipe | `/drip-runbook turning a diagram prompt into a filed image` | task 2.1 | One recipe to `RUNBOOK_FORMAT.md` |
| Write the checking recipe | `/drip-runbook proving a filed diagram still matches the code` | task 2.2 | The second recipe of the pair |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Land the recipes | `/runbook-pulse @runbook` | the close out | Both are reachable from the index |
| Land the pictures | `/env-pulse @environment` | the close out | The render count is reported and reads zero outstanding |
| Close the scope | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers` | the close out | All four plans ✅, ready to aggregate to the parent |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): the four processes, the two Redis databases, the CORS ports.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): the terminals instruction 5.2 counts.
- [the runbook index](../../../../../runbook/00-INDEX.md): where both new recipes get registered.
- [the parent capstone image](../../../diagrams/whole-scope-in-one-picture.png): what the rest of the set has to look like it belongs with.
- `~/.claude/DIAGRAM_PROMPTS_FORMAT.md`: the render-status marks, and the six-step read-back this plan's instruction 6.1 follows.
- `~/.claude/RUNBOOK_FORMAT.md`: the shape both recipes take.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

This scope closes. The parent's running order goes on to the domain plane, which starts at
[one-booking-truth](../../../MASTER_PLAN.md#sub-scopes) once the two blockers are also green. Three
of the diagrams this scope produced are the evidence D1, D2 and D3 get decided on, so the scope that
takes those decisions starts by reading them.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/drip-runbook` ✅ : both recipes in task 2 are written with it, and it sketches the pieces as it
walks so the recipe and its pictures come out of the same pass.
   alt: `/runbook-pulse @runbook` first, to see what shape the existing recipes take before adding
   two more.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A rendered image comes back flat, or as a photograph, with no legend | ChatGPT, when the prompt was pasted from the description instead of from the style paragraph | The style paragraph is part of every prompt and has to survive being pasted alone. Copy from its first word. |
| `redis-cli dbsize` reports one number and the two-database claim looks wrong | The terminal, without `-n` | `redis-cli` defaults to database 0. Pass `-n 0` and `-n 1` explicitly. |
| A document shows a broken image icon where a diagram should be | Any embed written before the file existed | Use the diagram-wanted slot until the file is on disk. The `Save as:` line is the authority on the path. |
| Every request fails from the browser and reads like a wrong password | The browser, when Vite bound 5174 | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite. |
