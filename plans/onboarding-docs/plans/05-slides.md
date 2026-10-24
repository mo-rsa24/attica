# 📊 Marp Slides Deck

Step 6 of 6, the last, in the [running order](../MASTER_PLAN.md#running-order). Waits on
steps 2, 3, and 5 ([02](02-backend-setup-docs.md), [03](03-frontend-setup-docs.md),
[04](04-architecture-diagrams.md)) for the decks and diagrams it merges.

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

Scope: [onboarding-docs](../MASTER_PLAN.md). Last of six, and the only one that consumes rather
than produces source material. Everything it merges must be settled first.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing is started, and it is correctly blocked: plan 04's four diagrams do not exist yet, and this
plan merges them.

The two source decks (`artifacts/decks/onboarding-a-new-developer/backend-setup.md`, `artifacts/decks/onboarding-a-new-developer/frontend-setup.md`) do exist.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority. The deck states facts
about the system on its architecture slides, so it inherits every correctness obligation the source
documents have.

- Django is **5.2.3**. The backend deck's title slide currently says 5.1 and must be corrected
  before it is merged, or the error propagates into the master deck.
- The frontend reaches the backend two ways, only one of which goes through the Vite [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub>. An
  architecture slide claiming a single clean proxy path is wrong.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Merging copies every error in the sources into a fourth document.**

This plan does not check facts, it combines slides. Two known errors are sitting in the sources
right now: the Django 5.1 title slide in the backend deck, and plan 04's diagram briefs, which were
wrong about the draft being deleted at publish until they were corrected. Merge before those are
fixed and the master deck carries them.

**The output filename was ambiguous and is now fixed.**

An earlier draft named the goal `onboarding-slides.md` and the tasks `onboarding-master-deck.md`.
The source of truth is `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`; the exports take the shorter name.

**A deck is read at 16:9 from across a room, not on the author's laptop.**

Slides that fit in a markdown preview routinely overflow when rendered. That is what instruction 3
is for, and it cannot be done by reading the markdown.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

One deck can be handed to a new hire, or presented in a walkthrough, and take them from knowing
nothing about Attica to understanding both how to run it and why it is built the way it is.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The setup guides are for doing. The diagrams are for understanding one flow. Neither is presentable,
and neither gives the whole arc in one sitting.

A single deck is the artifact you actually hand someone, or stand up and talk through, and it is the
only output of this scope that works without a keyboard.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  slides/backend-setup.md   ─┐
  slides/frontend-setup.md  ─┼──► slides/onboarding-master-deck.md ──┬──► onboarding-slides.pdf
  diagrams/ws-auth.md       ─┤              (~15-20 slides)          └──► onboarding-slides.html
  diagrams/rest-vs-ws.md    ─┤                     │
  diagrams/jwt-refresh.md   ─┤            rendered and read at 16:9
  diagrams/event-wizard.md  ─┘                     │
      (from plan 04, ⚠️ not built yet)             ▼
                                          handed to a new hire
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Consolidate the backend and frontend decks and the four architecture diagrams into one cohesive Marp
deck, logically grouped and visually consistent, and export it to PDF and HTML.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Produce the one presentation-ready artifact this scope hands over.

**Goal.** `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`, roughly 15 to 20 slides: title and project overview,
architecture, backend setup, frontend setup, the four architecture flows, then verification and next
steps. Consistent colours, fonts and code blocks, readable at 16:9.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/05-slides.md`

▶ **Next: [task 1.1](#1--fix-the-sources-before-merging)**.

### 1. 🧹 Fix the sources before merging

◀ **Needs: [Architecture diagrams](04-architecture-diagrams.md)** complete, all four diagrams
written and checked against the code.

- [ ] **1.1 Correct the Django version in the backend deck**
  - `slides/backend-setup.md:22` says "Django 5.1". It is 5.2.3.
  - Do this before merging, not after; a fixed source and a stale merged copy is the worst outcome.

- [ ] **1.2 Confirm the four diagrams exist and passed their check**
  - `artifacts/figures/onboarding-a-new-developer/ws-auth.md`, `rest-vs-ws.md`, `jwt-refresh.md`, `event-wizard.md`.
  - Plan 04's instruction 3.2 must have confirmed the wizard diagram shows the draft surviving
    publish. Merging an unchecked diagram propagates whatever it says.

▶ **Next: [task 2.1](#2--merge-into-one-deck)**.

### 2. 🔧 Merge into one deck

◀ **Needs: [task 1](#1--fix-the-sources-before-merging)**.

- [ ] **2.1 Build `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`**
  - Slide 1: title, "Attica Onboarding: From Zero to Running System"
  - Slide 2: project overview, what Attica is and who it is for
  - Slide 3: architecture at a high level, [REST](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub> plus [websocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub>, SQLite plus [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub>
  - Slides 4 to 6: backend setup, from `artifacts/decks/onboarding-a-new-developer/backend-setup.md`
  - Slides 7 to 9: frontend setup, from `artifacts/decks/onboarding-a-new-developer/frontend-setup.md`
  - Slides 10 to 13: the four architecture flows, from `diagrams/`
  - Slides 14 to 15: verification and where to go next
  - Check while merging: consistent terminology across the two source decks, no duplicated slide, a
    flow that reads in one pass.

- [ ] **2.2 Polish the formatting**
  - A Marp theme with a consistent colour scheme and fonts.
  - Slide numbers, and a footer reading "Attica Onboarding".
  - Syntax highlighting on every code block: bash, JavaScript, Python.
  - Diagrams embedded rather than linked, so the deck survives being sent as a file.

▶ **Next: [instruction 4.1](#4--render-it-and-look-at-it)**.

### 3. 📦 Export

◀ **Needs: [instruction 4.3](#4--render-it-and-look-at-it)**, the deck read at full size and its
facts spot-checked.

- [ ] **3.1 Export both formats**
  - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md -o artifacts/decks/onboarding-a-new-developer/onboarding-slides.pdf`
  - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md -o artifacts/decks/onboarding-a-new-developer/onboarding-slides.html`
  - The markdown stays as the source of truth; the exports are generated and regenerable.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`
  - This is the last plan in the running order, so this sync is also the scope's close-out. If every
    plan comes back done, run `/recap-plan-tree @plans/onboarding-docs/MASTER_PLAN.md`.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 👁️ Render it and look at it

◀ **Needs: [task 2](#2--merge-into-one-deck)**.

4.1 **Render the deck at full size**
   - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md --preview`,
     or open it in VS Code with the Marp extension and press the preview button.
   - Put the preview full screen. A deck judged in a side panel is judged at the wrong size.
   - Expected result: every slide fits, no code block is cut off, no text runs past the edge.
   - ✅ all slides fit, move on. ❌ anything overflows, fix the markdown and re-render that slide.

4.2 **Read it as the person receiving it**
   - Go through once at presentation pace, without stopping to fix anything, as though you knew
     nothing about Attica.
   - Expected result: you can say what Attica is, what to install, and how auth works, by the end.
   - ✅ the arc holds. ❌ you lost the thread somewhere, note the slide number; that is a gap in
     the order, not in any one slide.

4.3 **Spot-check two facts against the source**
   - The title slide's Django version, and whatever the wizard diagram slide says happens to the
     draft at publish.
   - Expected result: 5.2.3, and the draft surviving publish.
   - ✅ both right. ❌ either wrong, a source was merged before it was fixed; go back to task 1.

▶ **Next: [task 3.1](#3--export)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The deck is done when you have read it at full size, at presentation pace, and could hand it to
someone without narrating over the gaps.

A merged markdown file that has never been rendered is not a deck; it is a document that will
overflow in front of an audience.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Master deck source | `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md` | not created |
| PDF export | `slides/onboarding-slides.pdf` | not created |
| HTML export | `slides/onboarding-slides.html` | not created |

The draft slide text that used to sit in this plan as sections has been removed. The two source
decks are the real content and are longer; a third copy here would be the one that goes stale.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

This plan is downstream of everything. Six documents feed it and nothing feeds back, so after the
merge there are two copies of every slide: the source deck and the master deck.

Nothing keeps them in sync. Correct the source first and re-merge, rather than editing the master
deck in place, or the next merge silently reverts your fix.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): the facts the architecture slides assert.
- [The backend setup deck](../../../artifacts/decks/onboarding-a-new-developer/backend-setup.md) and
  [The frontend setup deck](../../../artifacts/decks/onboarding-a-new-developer/frontend-setup.md): the two source decks.
- [The onboarding figures](../../../artifacts/figures/onboarding-a-new-developer/): the procedure diagrams, and the four architecture diagrams once plan 04 has written them.
- Marp: `https://marp.app/`.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

This is the last plan in the running order. When it is done, every plan in the scope is done, and
the close-out in the close out applies.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/slidecraft` for deck structure and slide-level editing. ▶ `/speaker-notes` if the deck is going
to be presented rather than only read.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Two different output filenames for one deck | This plan's goal versus its tasks, before correction | The source is `artifacts/decks/onboarding-a-new-developer/onboarding-master-deck.md`; the exports are `onboarding-slides.pdf` and `.html`. |
| A merged deck carries an error already fixed in its source | Anticipated, from the Django 5.1 title slide | Fix sources first (task 1), then merge. Never edit the master deck in place to fix a source error. |
