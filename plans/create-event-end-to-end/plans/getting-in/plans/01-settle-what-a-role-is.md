# 🧭 Settle What a Role Is

Step 1 of 4 in this scope. Waits on nothing.
Next: [02-grant-every-role.md](02-grant-every-role.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to settle](#description-what-to-settle)
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

Scope: [getting-in](../MASTER_PLAN.md). First of three, and it must go first: the fix in
[02](02-grant-every-role.md) is a different fix depending on how this comes out.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Attica carries two ways of saying what kind of user someone is, and they disagree.

`Role` is a table with five uppercase values, joined to a user many-to-many. `CustomUser.user_type`
is a single lowercase field with five different values. Nothing anywhere says which one decides what
a person can see, and both are populated.

Until that is settled, granting a missing role is guesswork: you might grant the thing nothing reads.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- The frontend reaches the backend two different ways with no bridge. The Vite [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> handles most
  paths; `useAxios` hardcodes `http://127.0.0.1:8000` at `frontend/src/utils/useAxios.js:10`.
- `CORS_ALLOWED_ORIGINS` names `http://localhost:5173` and `http://localhost:3000` only. Vite binds
  5174 when 5173 is taken, and a login from 5174 fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> rather than on credentials.
- Tokens live in `localStorage` under the key `tokens`.
- The Python environment is `/home/molef/lobola`.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a reading plan, not a changing plan.**

Nothing here edits a model, a serializer or a seed. The deliverable is a decision written down where
the next person will find it. Resist fixing anything you notice on the way: write it into
[02](02-grant-every-role.md) instead.

**The answer may be "both, for different things".**

That is a legitimate outcome and it must be written as plainly as a single winner would be. What is
not acceptable is leaving it undecided, because every plan after this one assumes an answer.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

One sentence in `context/` naming which classification decides what a user may see is worth more
than any code change in this scope, because it is what makes the code changes correct.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Two systems that mean the same thing and disagree is the cheapest kind of bug to create and the most
expensive to live with. Somebody will grant `SERVICE_PROVIDER` and a vendor still will not see the
vendor page, because the component was branching on `user_type` all along.

This plan costs an afternoon of reading. Skipping it costs the same afternoon later, plus the wrong
fix shipped in between.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  ONE USER, TWO ANSWERS

  Role (m2m table)            CustomUser.user_type (one field)
  EVENT_ORGANIZER             organizer
  ARTIST                      artist
  SERVICE_PROVIDER            vendor
  VENUE_MANAGER               venue
  TICKET_BUYER                attendee
        │                            │
        │  11 frontend sites         │  ? sites
        │  read roles.includes       │
        └──────────┬─────────────────┘
                   │
             which one decides?
                   │
                   ▼
        one sentence in context/world/
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-settle) ➡️

One piece in this scope's map draws this plan.

**Subject: two names for one thing.** The ASCII above, rendered.
[Piece 3](../diagram-prompts.md#piece-3-two-names-for-one-thing-planned).
Save as `../diagrams/subject-03-two-names-for-one-thing.png`. *(image not yet generated)*

## Description: what to settle

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Find every place either classification is read, in the frontend and the backend. Watch one real
login and see which field the interface actually branches on. Then write the decision, and its
reason, into `context/world/`.

## Purpose and goal

Navigation: ⬅️ [Description: what to settle](#description-what-to-settle) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Make the next two plans correct rather than plausible.

**Goal.** `context/world/role.md` exists and answers, in one sentence a tired reader gets in one
pass, which classification decides what a user may see, with the call sites that prove it.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/01-settle-what-a-role-is.md`

▶ **Next: [task 1.1](#1--find-every-place-either-one-is-read)**.

### 1. 🔍 Find every place either one is read

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 List every frontend read of each classification**
  ```
  cd /home/molef/Work/attica/frontend
  grep -rn "roles" src --include=*.jsx | grep -E "includes|some|find"
  grep -rn "user_type" src --include=*.jsx
  ```
  - Produces: two counts and two file lists, written into this plan's Outputs table.
  - Done when: you can say how many components branch on each, by name.

- [ ] **1.2 List every backend read**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "has_role" . --include=*.py | grep -v test
  grep -rn "user_type" . --include=*.py | grep -v test | grep -v migrations
  ```
  - Produces: the same two lists for the API side.
  - Done when: every gate in `vendors/`, `artists/` and `locations/` is accounted for.

- [ ] **1.3 Check whether the login response even carries both**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -n "roles\|user_type" users/serializers.py
  ```
  - Done when: you know which fields a logged-in client actually receives. A classification the
    client never receives cannot be the one the interface branches on.

▶ **Next: [instruction 3.1](#3--watch-one-real-login)**, because the greps say what the code could
read and only a live login says what it does read.

### 2. ✍️ Write the decision down

◀ **Needs: [instruction 3.2](#3--watch-one-real-login)**, the observed answer.

- [ ] **2.1 Write `context/world/role.md`**
  - Follow `~/.claude/CONTEXT_FORMAT.md`.
  - It answers one question: which classification decides what a user may see.
  - It names the call sites that prove it, and says plainly what the other one is for, or that it is
    vestigial and should be removed.
  - If the honest answer is "both, for different things", say which for which. Do not round it to a
    single winner for tidiness.
  - Done when: a reader who has never seen this codebase can act on it without opening a file.

- [ ] **2.2 Register it in the context index**
  - Add the row to [the context index](../../../../../context/00-INDEX.md), phrased as the question
    it answers.
  - Done when: the term is findable by someone who does not know the filename.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 2](#2--write-the-decision-down)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
  - Two classifications for one concept is a pattern worth a catalog entry regardless of how this
    one resolved.
- [ ] **Run the following prompt:** `/context-pulse @context` — this plan owes `context/` an entry
      and the pulse is what confirms it landed where a reader will find it.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 👀 Watch one real login

◀ **Needs: [task 1](#1--find-every-place-either-one-is-read)**, so you know what to look for.

3.1 **Bring the stack up and confirm the port**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Look at the Vite banner. It must say `http://localhost:5173/`.
   - ✅ 5173: continue.
   - ❌ 5174: stop and free 5173 first. `CORS_ALLOWED_ORIGINS` does not name 5174, so every login
     from there fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> and looks exactly like a wrong password.

3.2 **Log in with DevTools open and read the response**
   - Chrome DevTools → Network, filter Fetch/XHR, Preserve log on. Then log in at
     `http://localhost:5173/login` as `test_organizer` / `Test123!`.
   - Click the `POST /api/accounts/login/` row → Response.
   - Expected result: a JSON body with a `user` object. Note whether it carries `roles`, or
     `user_type`, or both.
   - ✅ Write down exactly which fields are present, verbatim.
   - ❌ CORS error in the Console instead of a response: you are on 5174. Go back to 3.1.

3.3 **Find the branch in the running app**
   - DevTools → Sources → search the loaded bundle for `roles.includes` and for `user_type`.
   - Set a breakpoint on whichever appears in the navbar or dashboard routing code, then reload.
   - Expected result: the breakpoint hits, and you can read which value the component compared.
   - ✅ You have the observed answer. That beats every grep in task 1.
   - ❌ Neither breaks: the branch is elsewhere. Note where the navbar's role label comes from and
     say so in task 2.1 rather than guessing.

▶ **Next: [task 2.1](#2--write-the-decision-down)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is done when `context/world/role.md` exists and a person who has never opened this
codebase can read it and know which classification to grant.

Finding the answer and not writing it down leaves this scope exactly where it started, because the
next plan needs the sentence, not the investigation.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Frontend and backend read counts for both classifications | recorded in task 1.1 and 1.2 | not started |
| The observed field the interface branches on | recorded in instruction 3.3 | not started |
| The decision, written as context | `context/world/role.md` | not started |
| The index row | `context/00-INDEX.md` | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/01-settle-what-a-role-is.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Land the context entry | `/context-pulse @context` | the close out | The new term is findable, not just written |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): the port trap, the two access paths, where tokens live.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): the four processes, in order.
- [the context index](../../../../../context/00-INDEX.md): where the decision gets registered.
- `backend/main/users/models.py:12-17` and `:25-35`: the two classifications, side by side.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[02-grant-every-role.md](02-grant-every-role.md), which grants whatever this plan decided is the one
that counts.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet — populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A login attempt fails with a [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> error that reads like bad credentials | The browser, when Vite bound 5174 because 5173 was taken | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite. |
