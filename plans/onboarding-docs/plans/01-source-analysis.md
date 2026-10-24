# 📚 Source Analysis and Design Extraction

Step 1 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on nothing.
Next: [Backend setup docs](02-backend-setup-docs.md).

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

Scope: [onboarding-docs](../MASTER_PLAN.md). First of six, and the foundation: every other plan
reads the four documents this one produced.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

All seven tasks are done. Four source documents exist and are what plans 02 through 07 read.

**The two input files this plan analysed no longer exist.** `PHASE-1-SNAPSHOT.txt` and
`UNPACK-OUTPUT.txt` were never committed and are not on disk. That is not a [loss](../../../../../Obsidian/Artificial%20Intelligence/Machine%20Learning/Loss%20Function.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=33 "Understanding deep learning, section 2.2.2, Works the idea with numbers: each choice of intercept and slope for a line through twelve points gets one loss (7..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/pattern-recognition-and-machine-learning.pdf#page=60 "Pattern recognition and machine learning, section 1.5.2, A loss matrix for cancer diagnosis that charges 1000 for missing a cancer and 1 for a false alarm, a..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=70 "Understanding deep learning, sections 5.1 to 5.2, A recipe that builds a loss for any kind of output from maximum likelihood: choose a distribution over the ..."), [▶1](https://www.youtube.com/watch?v=pdqofxJeBN8&t=3230s "CS231n lecture 2, 53:50 to 57:30, Defines the loss as the average of per-example losses that optimisation will minimise, after showing data a line cannot sep..."), [▶2](https://www.youtube.com/watch?v=cmNIMjPYdgM&t=879s "CS229 lecture 2, 14:39 to 17:41, Chooses the line that minimises prediction errors on the training data, empirical risk minimisation, and contrasts it with a..."), [◆](../../../../../goal-setting/learning/machine-learning/classical-ml-from-scratch/MASTER_PLAN.md "Classical ML from Scratch, machine-learning/classical-ml-from-scratch. Goal 1 derives linear and logistic regression from a loss function and gradient descen...")</sub>: they were
transient tool output, and everything worth keeping from them is in the four documents below. It
does mean this plan cannot be re-run as written, and the [References](#references) section says so
rather than pointing at files that are gone.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority. This plan's outputs assert
facts about how Attica runs, so they inherit that file's obligations.

- Django is **5.2.3**, not 5.1. Any document produced here saying otherwise is stale.
- Nothing auto-starts: four processes by hand. The setup sequence this plan extracted must match.
- The frontend reaches the backend two ways, only one through the Vite [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub>.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This plan's outputs are the single point of failure for the whole scope.**

Five later plans read `onboarding-source.md`, `setup-sequence.md`, `design-decisions.md` and
`core-models.md` and never re-derive anything from the code. An error here propagates into a guide,
a deck, a diagram and a Todoist task before anyone notices.

**Two documents now cover overlapping ground and neither knows about the other.**

`design-decisions.md` and `core-models.md` explain why Attica is built as it is and what its models
mean. The repository now also carries [the context index](../../../context/00-INDEX.md), built later and from
the code directly, which covers the same territory in more depth and flags several places where the
obvious reading is wrong. Where they disagree, `context/` is the newer and better-evidenced one.

**The inputs were transient and the outputs are not.**

Tool output that was never committed cannot be re-read. Anything this plan concluded that is not
written into one of the four documents is gone.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Four documents hold the factual foundation for the whole scope: the setup sequence, the design
decisions with their reasons, the core models and their relationships, and the architecture flows,
each with real file paths, model names and commands rather than descriptions of them.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Writing five documents that each re-derive the same facts from the codebase guarantees five
different answers. Extracting the facts once, into documents the others cite, is what keeps the guides,
the decks and the diagrams saying the same thing.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  PHASE-1-SNAPSHOT.txt  ─┐                          ┌──► onboarding-source.md  ✅
  UNPACK-OUTPUT.txt     ─┼──► reviewed against ──►──┼──► setup-sequence.md     ✅
  the codebase itself   ─┘     the live code        ├──► design-decisions.md   ✅
   (inputs: gone, never                             └──► core-models.md        ✅
    committed)                                              │
                                            read by plans 02, 03, 04, 05, 07
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Extract the factual foundation for all the documentation in this scope: the setup sequence, the
design decisions, the architecture relationships and the terminology, consolidated into documents
every later plan cites rather than re-deriving.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Establish the facts once, so five downstream documents agree with each other.

**Goal.** A reviewed, consolidated `onboarding-source.md` plus three reference documents, carrying
real paths, model names, endpoint paths and commands.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. All seven are done.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/01-source-analysis.md`

▶ **Next: [task 1](#1--review-the-source-material)**.

### 1. 🔍 Review the source material

- [x] ✅ **Review the replicate output: archetype classification, file structure, current state**
  - [x] All 11 Django apps listed with their models
  - [x] All key models named: `Event`, `EventDraft`, `ChatRoom`, `ChatBid` and the rest
  - [x] Discrepancies against the current code noted

- [x] ✅ **Review the unpack output: setup sequence and design-decision explanations**
  - [x] Backend setup (venv, install, migrate, seed, Daphne) checked against the actual files
  - [x] Frontend setup (npm, Vite [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub>, auth) checked for completeness
  - [x] [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> auth flow and [websocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> integration explanations checked for clarity

▶ **Next: [task 2](#2--extract-and-consolidate)**.

### 2. ✍️ Extract and consolidate

◀ **Needs: [task 1](#1--review-the-source-material)**.

- [x] ✅ **Extract the canonical setup sequence**
  - [x] Backend: create the environment, install, migrate, seed, start Daphne
  - [x] Frontend: npm install, Vite dev server, proxy to `localhost:8000`
  - [x] External: [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> on port 6379

- [x] ✅ **Extract the design decisions with their reasons**
  - [x] REST-first: the database is the source of truth, websockets are the notification layer
  - [x] SQLite plus Redis: a file-based database with zero setup, Redis coordinating broadcasts
  - [x] JWT: [stateless](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub>, refreshable from the frontend on a 401
  - [x] Multi-role users: one account, several personas

- [x] ✅ **Document the core models and their relationships**
  - [x] User to Event, Vendor, Artist, ChatRoom, Booking
  - [x] Event to Location, ChatRoom, Booking, ArtistBooking
  - [x] ChatRoom to Message, ChatBid
  - [x] Relationships sketched in text, to be formalised by [Architecture diagrams](04-architecture-diagrams.md)

- [x] ✅ **Consolidate into [the consolidated onboarding source](../source/onboarding-source.md)**
  - [x] Sections: setup sequence, design decisions, core models, architecture flows
  - [x] Carries real file paths, model names and endpoint paths, not abstractions
  - [x] Carries real command examples, such as `daphne -b 0.0.0.0 -p 8000 main.asgi:application`

- [x] ✅ **Split the long-form detail into its own reference files**
  - [x] [the setup sequence source](../source/setup-sequence.md): the command-by-command order with decision
    points and failure symptoms
  - [x] [the design decisions source](../source/design-decisions.md): the reason behind each choice, with the
    code that proves it
  - [x] [the core models source](../source/core-models.md): the entity map, per-model relationship tables, and
    the relationships not yet wired
  - [x] All three linked from the scope's `## Source Documents` list

▶ **Next: [instruction 3.1](#3--reconcile-against-the-context-folder)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--reconcile-against-the-context-folder)**.

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 🔎 Reconcile against the context folder

◀ **Needs: [task 2](#2--extract-and-consolidate)**.

The repository gained [the context index](../../../context/00-INDEX.md) after this plan finished. It covers the
same ground as `design-decisions.md` and `core-models.md`, built from the code directly, and it
flags several places where the obvious reading of a name is wrong.

3.1 **Read `source/core-models.md` beside `context/world/booking.md` and `context/world/organizer.md`** ❌ done 2026-08-23
   - Both checks failed, and both are now pointers into `context/` rather than copies.
   - The bookings row said the scheduling app held "a third booking layer, not yet integrated",
     which reads as though the chat and vendor bookings are the working ones. The opposite is true:
     `scheduling.Booking` is the only live model and the other four are vestigial.
   - The entity map labelled `user_type` "legacy". It is enforced, by
     `scheduling/permissions.py`, while the artist and vendor apps enforce `has_role()`.

3.2 **Read `source/design-decisions.md` beside `context/purpose/03-what-working-means.md`** ✅ done 2026-08-23
   - The document does not overstate ticketing. It names `TICKET_BUYER` once, in the role list, as
     an intent rather than a built capability, and claims nothing about checkout.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The four documents exist and the tasks are ticked, which is what this plan promised.

What it cannot promise is that they are still accurate. They were extracted from tool output that no
longer exists, and the codebase has moved since. Instruction 3 is the cheapest available check
against something newer and independently derived.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Read by |
|---|---|---|
| Consolidated reference | [The consolidated onboarding source](../source/onboarding-source.md) | plans 02, 03, 04, 05 |
| Command-by-command setup order | [The setup sequence source](../source/setup-sequence.md) | plans 02, 03, 07 |
| Design decisions with their reasons | [The design decisions source](../source/design-decisions.md) | plans 02, 03, 05 |
| Entity map and relationships | [The core models source](../source/core-models.md) | plans 04, 05 |

An earlier version of this plan carried four of these as sections inside the plan file. They were
superseded by the documents above, which are longer and are what everything else cites, and have
been removed rather than kept as a second copy.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Everything in this scope is downstream of these four documents, and nothing feeds back. Correcting a
fact here after plans 02 through 05 have run does not correct the guides, decks or diagrams that
copied it.

So a correction here means checking the scope for the same sentence. The scope is small enough to
grep.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): how Attica actually runs, and the corrections this
  plan's outputs may predate.
- [The context index](../../../context/00-INDEX.md): what Attica means, built later and
  independently. The reconciliation target in instruction 3.
- [The project instructions](../../../CLAUDE.md): the repository's own overview.

**The two input files are gone.** `PHASE-1-SNAPSHOT.txt` and `UNPACK-OUTPUT.txt` sat at the
repository root, were never committed, and are no longer on disk. They cannot be recovered, so this
plan cannot be re-run as it was originally written. Re-deriving from the codebase, or from
`context/`, is the route if the outputs are ever in doubt.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[Backend setup docs](02-backend-setup-docs.md), which turns the setup sequence into a
diagram, a deck and a guide.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/unpack` for explaining a system from its code. Alternative: `/learn-codebase` where the aim is a
rebuild guide rather than a reference.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A plan's engagement instructions point at input files that no longer exist | This plan's original references to `PHASE-1-SNAPSHOT.txt` and `UNPACK-OUTPUT.txt` | Transient tool output was never committed. Either commit the input a plan analyses, or write the plan so its outputs stand without it. |
| Documentation states Django 5.1 | The repository `CLAUDE.md` and this scope's decks, before correction | The version is 5.2.3, pinned at `backend/main/requirements.txt:17`. |
