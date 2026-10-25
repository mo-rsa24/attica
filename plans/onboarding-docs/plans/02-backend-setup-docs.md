# ⚙️ Backend Setup Documentation

Step 2 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on step 1
([Source analysis](01-source-analysis.md)). Next: [Frontend setup docs](03-frontend-setup-docs.md).

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

Scope: [onboarding-docs](../MASTER_PLAN.md). Second of six. Its three artifacts are the model that
[frontend setup docs](03-frontend-setup-docs.md) mirrors for the frontend.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

All four tasks are done. The procedure diagram, the slide deck and the written guide all exist.

**Written is not verified.** The guide has never been walked on a machine with nothing installed;
that is [Cold-start verification](07-cold-start-verification.md), and it has already found one
trap in this guide.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority.

- Django is **5.2.3**, pinned at `backend/main/requirements.txt:17`. Earlier drafts of this deck said
  5.1 and were wrong.
- [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> must be running on `127.0.0.1:6379` before the backend starts, for both the channel layer
  and the page [cache](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>.
- `daphne` serves [websockets](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>; `runserver` serves [HTTP](../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> only and fails websockets with no clear error.
- This machine runs the app from `/home/molef/lobola`. **The guide correctly tells a new developer
  to create their own environment inside the repo instead.** Do not change it to match this machine.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Three artifacts describing one procedure will drift unless they share one step order.**

The diagram, the deck and the guide all cover the same six steps. When a step changes, all three
change or the reader gets three different answers. The guide is the one people follow, so it wins
where they disagree.

**The requirements file is the known trap and the guide now guards it.**

`backend/requirements.txt` was a stale pip-freeze that shadowed `backend/main/requirements.txt` and
pulled operating-system packages into a fresh virtual environment. The stale file is deleted, and
the guide's step 3 now has the reader confirm the file is the 62-line one before installing.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

A developer who knows Django but not Attica can reach a backend serving `:8000` with working
[websockets](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>, using only these three artifacts and no help.

The claim is untested until [07](07-cold-start-verification.md) walks it cold.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The backend is the harder half to set up: a virtual environment, a dependency install with a known
trap in it, migrations, optional seed data, a choice between two servers that behave differently,
and an external [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> nobody mentions until it fails.

Three artifacts rather than one because they answer different questions: the diagram shows the
shape, the deck explains why each step exists, and the guide is what you follow with your hands.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  onboarding-source.md ──┬──► /visualize-procedure ──► diagrams/backend-setup-procedure.md  ✅
   setup-sequence.md     ├──► /progress-brief      ──► slides/backend-setup.md              ✅
   design-decisions.md   └──► written by hand      ──► guides/backend-setup.md              ✅
                                                              │
                                              all three share one six-step order
                                                              │
                                                              ▼
                                                   07-cold-start-verification
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Step-by-step setup documentation for the Django, DRF and Channels backend: virtual environment,
dependency install, migrations, seed data, and server startup, each paired with a visual.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Let a new developer set up the backend independently, understanding both the commands
and the reasons behind them.

**Goal.** Three cohesive artifacts sharing one terminology and one step order: a fork/join procedure
diagram, a Marp deck of six to eight slides, and a written guide with command blocks, expected
output and a troubleshooting section.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. All four are done.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/02-backend-setup-docs.md`

▶ **Next: [task 1](#1--produce-the-three-artifacts)**.

### 1. 🔧 Produce the three artifacts

- [x] ✅ **Create the procedure diagram (fork/join flowchart)**
  - [x] Input: a bare repo, `git clone` done
  - [x] Step 1: create the virtual environment, forking on shell (bash and zsh against Windows) and rejoining
  - [x] Step 2: install from the requirements file
  - [x] Step 3: run migrations
  - [x] Step 4: seed data, an optional fork joining the with-data and without-data paths
  - [x] Step 5: start Daphne, with `runserver` as the HTTP-only fallback
  - [x] Output: backend running on `:8000` with [websockets](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> ready
  - [x] Produced by `/visualize-procedure` into [the backend setup flowchart](../../../artifacts/figures/onboarding-a-new-developer/backend-setup-procedure.md)

- [x] ✅ **Create the Marp slide deck**
  - [x] Title, architecture overview, virtual environment and install, migrations, seed data, server startup, verification
  - [x] Produced by `/progress-brief` in novice mode into [the backend setup deck](../../../artifacts/decks/onboarding-a-new-developer/backend-setup.md)
  - [x] ✅ Title slide corrected to Django 5.2.3 (`slides/backend-setup.md:22`)

- [x] ✅ **Write the guide**
  - [x] Sections: prerequisites, virtual environment, installation, database, seed data, server startup, troubleshooting
  - [x] Each section carries a plain-English introduction, the exact command, the expected output, and why the step exists
  - [x] Written to [the backend setup guide](../../../artifacts/notes/onboarding-a-new-developer/backend-setup.md), 278 lines

- [x] ✅ **Link the three together**
  - [x] The diagram is the shape of the process, the deck is the reasoning, the guide is what you follow

▶ **Next: [instruction 2.1](#2--read-the-three-artifacts-as-a-set)**.

### Close out. 🔄 Record what this plan taught

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 2. 👀 Read the three artifacts as a set

◀ **Needs: [task 1](#1--produce-the-three-artifacts)**.

2.1 **Open all three side by side and check the step order matches**
   - [The backend setup flowchart](../../../artifacts/figures/onboarding-a-new-developer/backend-setup-procedure.md),
     [The backend setup deck](../../../artifacts/decks/onboarding-a-new-developer/backend-setup.md),
     [The backend setup guide](../../../artifacts/notes/onboarding-a-new-developer/backend-setup.md).
   - Expected result: the same six steps in the same order, using the same words for each.
   - ✅ they agree. ❌ they diverge, the guide wins and the other two are corrected to it.

2.2 **Render the Marp deck and look at it**
   - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/backend-setup.md --preview`, or open it
     in VS Code with the Marp extension.
   - Expected result: every slide fits, no text overflows its slide, the title says Django 5.2.3.
   - ✅ it reads cleanly. ❌ overflow or a wrong version, fix the markdown and re-render.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**, and then
[cold-start verification](07-cold-start-verification.md), which is where the guide is actually
tested.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The four tasks are ticked and the three artifacts exist, which is what this plan promised.

It does not mean the guide works. That is [07](07-cold-start-verification.md)'s job, and until that
walk comes back with zero corrections, this scope's claim about onboarding is unproven.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Procedure diagram | [The backend setup flowchart](../../../artifacts/figures/onboarding-a-new-developer/backend-setup-procedure.md) | written |
| Marp slide deck | [The backend setup deck](../../../artifacts/decks/onboarding-a-new-developer/backend-setup.md) | written, one stale version string |
| Written guide, 278 lines | [The backend setup guide](../../../artifacts/notes/onboarding-a-new-developer/backend-setup.md) | written, one trap already fixed |

An earlier draft of the guide lived inside this plan file as a section. It was a skeleton with
placeholder text, superseded by the real guide above, and has been removed rather than kept as a
second copy that would drift.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Three artifacts move together. A change to the guide's step order means the diagram and the deck are
now wrong, and nothing checks that automatically.

The deck is also merged into the master deck by [The merged deck](05-slides.md), so a correction made
here after step 6 has run must be carried into that deck by hand.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): the Django version, the [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> requirement, and the
  daphne-versus-runserver difference.
- [The setup sequence source](../source/setup-sequence.md): the canonical command order this plan documents.
- [The design decisions source](../source/design-decisions.md): why Django, Channels, SQLite and Redis.
- [The changelog](../CHANGELOG.md): the requirements-file trap and how it was fixed.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[Frontend setup docs](03-frontend-setup-docs.md), which mirrors this plan for the frontend.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/visualize-procedure` for the fork/join diagram. Alternative: `/flowspec` for a more formal
flowchart. ▶ `/progress-brief` in novice mode for the explanatory slide content.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A fresh venv install pulls in `cloud-init`, `dbus-python` and other operating-system packages | `artifacts/notes/onboarding-a-new-developer/backend-setup.md`, step 3 | `backend/requirements.txt` was a stale pip-freeze shadowing `backend/main/requirements.txt`. The stale file is deleted; the guide now has the reader confirm the file is the 62-line one before installing. |
| [Websockets](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> fail with no clear error | Server startup | `runserver` serves [HTTP](../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> only. Use `daphne -b 0.0.0.0 -p 8000 main.asgi:application`. |
| `ConnectionRefusedError` on first cached read | Server startup | [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is not running. Start `redis-server` before the backend. |
| Documentation states Django 5.1 | This deck's title slide, and formerly the repository `CLAUDE.md` | The version is 5.2.3, pinned at `backend/main/requirements.txt:17`. |
