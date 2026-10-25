# 🗺️ Draw The Layers Map

Step 2 of 4 in this scope. Waits on [01](01-read-the-system-before-drawing-it.md).
Next: [03-brief-the-other-eight.md](03-brief-the-other-eight.md).

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

Scope: [the-system-in-layers](../MASTER_PLAN.md). Second of four. It waits on
[01](01-read-the-system-before-drawing-it.md) for the facts, and
[03](03-brief-the-other-eight.md) waits on it for the art direction, because the environment map is
where this scope's inherited direction gets written down in the folder that will hold most of it.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The findings file from [01](01-read-the-system-before-drawing-it.md) exists. Nothing is drawn.

`environment/` has no `diagram-prompts.md` and no `diagrams/`. Its index says so out loud: the
Pictures section reads "None yet", and points at the interactive scenes instead. Those scenes are
worth keeping and are not a substitute, because a scene is something you run and operate, and what
`overview.md` needs is a picture you glance at before reading a word.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

These five are the map's content, so getting one wrong is not a detail, it is the deliverable being
wrong. All from [the environment overview](../../../../../environment/overview.md), which is the
authority, and confirmed by [01](01-read-the-system-before-drawing-it.md).

- **Four processes run and none starts or supervises another**: Vite, Django under Daphne, [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>,
  and the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker. The outbox worker's absence is silent: the app keeps working and the
  notifications never arrive.
- **The frontend reaches the backend two different ways with no bridge.** Most paths go through the
  Vite [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>; `useAxios` hardcodes `http://127.0.0.1:8000` at `frontend/src/utils/useAxios.js:10`
  and therefore needs [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>.
- **The `/ws` proxy rule exists** and forwards with `ws: true`. [Websockets](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> do reach the backend in
  development. The flow map says otherwise and is wrong.
- **Websockets authenticate by `?token=<jwt>` query parameter**, not by an `Authorization` header,
  because a websocket cannot set headers.
- **Redis is one server carrying two unrelated logical databases**: the channel layer on the default,
  the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1 at `redis://127.0.0.1:6379/1`. Flushing the wrong one silently drops
  live websocket groups.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**The art direction is inherited three levels up, and none of it is chosen here.**

[The parent map](../../../diagram-prompts.md) is the vocabulary authority: the style paragraph, the
meaning palette, the glyph tiers and the reading axes. It in turn adopted them from the eleven-piece
flow map. This plan copies the style paragraph verbatim into the new file and adds nothing. A restyle
is a decision made at the root of the tree, never in a leaf.

**The environment map is its own file, not a section of this scope's map.**

Two files, two jobs. `environment/diagram-prompts.md` draws the system for anyone who works on
Attica and outlives this scope entirely. This scope's own
[`diagram-prompts.md`](../diagram-prompts.md) draws the shape of this scope's work and dies with it.
Do not merge them, and do not let a piece appear in both.

**One picture, one job, and this one's job is the shape.**

The temptation is to put the booking path, the auth flow and the wizard into the layers map because
they are all true. They each get their own diagram in [03](03-brief-the-other-eight.md). This map
answers exactly one question: what is running, and what talks to what. If it needs a paragraph to
make sense, it is wrong, and more detail will not save it.

**A slot is not a failure, and a broken embed is.**

Until the image exists, `overview.md` carries a diagram-wanted block naming the prompt. That reads as
work outstanding, which it is. An `![](...)` pointing at a file that is not there reads as a fault in
the document.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

The one document every session is told to read cold gets a picture, so the shape of Attica lands
before the first paragraph rather than after the sixth.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

`overview.md` opens by saying the thing a plan gets wrong most often is treating "run the app" as one
action. It then spends four sections correcting that in prose, and a reader who skims lands on the
wrong model anyway.

A shape is faster to see than to read, and this shape in particular (four things running, three ways
in, two [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> databases, one of the four silent when missing) is almost impossible to hold from text
and trivial to hold from one image.

The second reason is that the folder is set up for this and nobody has done it.
`ENVIRONMENT_CONTEXT_FORMAT.md` specifies where the prompts live, where the images go, what the slot
looks like, and which pulse audits them. Every part of the machinery exists except the file.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  WHAT THE MAP HAS TO SHOW

  browser tier   [ react app ]
                    │   │   └──── purple dashed, ?token=  ──┐
                    │   └──────── blue dashed, via proxy ───┤
                    └──────────── blue dashed, 127.0.0.1 ───┤  (no bridge
                                          needs CORS        │   between
                                                            │   these two)
  app tier       ┌──── daphne ◄───────────────────────────────┘
                 │       │
                 │       └─ green solid write ──┐
                 └ [outbox worker] ← OUTLINE ONLY: nothing starts it
                          │                     │
  data tier          orange dashed        ┌─────▼──────┐
                          └──────────────►│  sqlite    │
                                          └────────────┘
                     ┌─────────────────────────────────┐
                     │ redis: [ ch. layer ] [ cache/1 ] │  one server,
                     └─────────────────────────────────┘  two databases
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

This plan produces a prompt in a different file from this scope's map, and one piece of this scope's
map draws the gap it closes.

**Subject: the file with no picture.** What `overview.md` looks like today, which is what this plan
ends.
[Piece 1](../diagram-prompts.md#piece-1-the-file-with-no-picture-planned--not-rendered).
Save as `../diagrams/subject-01-the-file-with-no-picture.png`. *(image not yet generated)*

**The deliverable itself** is the layers prompt in `environment/diagram-prompts.md`, rendering to
`environment/diagrams/attica-01-the-system-in-layers.png`. It is not part of this scope's map,
because it draws Attica rather than this scope.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Three things, all text until [04](04-render-check-and-write-it-down.md) renders them.

1. **`environment/diagram-prompts.md`**, to `~/.claude/DIAGRAM_PROMPTS_FORMAT.md`: art direction
   inherited verbatim from the parent map, a subject lane drawing the systems themselves, a process
   lane drawing how one unit of work travels end to end, each prompt carrying its faithfulness note,
   its `Save as:` path and its render status.
2. **The layers prompt itself**, the subject capstone of that file.
3. **The wiring**: a diagram-wanted slot in `overview.md`, and the Pictures section of
   `environment/00-INDEX.md` naming the new file instead of reading "None yet".

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), and pay the scope's debt to
`environment/`, which is the one folder it owes.

**Goal.** `environment/diagram-prompts.md` exists and conforms; `overview.md` carries the slot;
`00-INDEX.md`'s Pictures section names the map. Someone can paste the capstone prompt into ChatGPT
and get a picture of Attica without opening another file first.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/02-draw-the-layers-map.md`

▶ **Next: [task 1.1](#1--create-the-environment-map)**.

### 1. 🎨 Create the environment map

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**, and the findings file
from [01](01-read-the-system-before-drawing-it.md).

- [ ] **1.1 Write the art direction header of `environment/diagram-prompts.md`**
  - Copy the style paragraph, the meaning palette, the glyph vocabulary with its tiers, and the
    reading axes from [the parent map](../../../diagram-prompts.md) verbatim.
  - Open with one line naming that file as the vocabulary authority, the way this scope's own map
    does.
  - Add nothing. If the layers map needs a glyph the parent has none for, say so in the task's notes
    rather than declaring one here: a new glyph is a scope-wide decision.
  - Done when: a reader can render any prompt in the file without opening the parent map, and the
    file declares no colour meaning the parent has not.

- [ ] **1.2 Write the subject lane: three or four pieces, one per thing worth seeing alone**
  - Candidates, and each has to earn its place: the four processes and what each one's absence costs;
    the two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients and the [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> boundary between them; the [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> path with its query-string
    token; the two [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> databases.
  - Each piece gets a visual thesis, the description, a faithfulness note, a `Save as:` path under
    `environment/diagrams/`, and `⏳ not rendered`.
  - Done when: every piece names its own `Save as:` path and no two pieces show the same thing.

- [ ] **1.3 Write the subject capstone: the layers map**
  - Three tiers on the vertical axis, per the inherited reading axes: browser, application, data.
  - It must show, and the faithfulness note must name each one as a clause to check:
    the two separate HTTP arrows with only one passing through a [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> glyph; the websocket arrow
    carrying a `?token=` label; four process glyphs with the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker drawn as an outline and
    tagged with what its absence costs; one Redis glyph split into two labelled compartments; one
    SQLite cylinder drawn as a single file rather than a server.
  - `Save as: environment/diagrams/attica-01-the-system-in-layers.png`, `⏳ not rendered`.
  - Done when: the faithfulness note has one clause per bullet above, so the render can be checked
    clause by clause rather than judged as a whole.

- [ ] **1.4 Write the process lane: one unit of work, end to end**
  - The unit: an organizer sends a booking request and the provider's screen finds out.
  - Draw it as far as the code actually goes, using [01](01-read-the-system-before-drawing-it.md)'s
    section 5. Where the path stops before a screen, draw it stopping. That is the finding, not a
    gap in the drawing.
  - This is the one happy path this plan draws, so it carries the same failure choice every other
    happy path in the scope carries: state in the prompt whether the failure is a branch inside this
    image or its own page, and write the failure content either way. The candidate here is the
    stage the request dies at when the outbox worker is not running, which is the silence
    [the execution model](../../../../../environment/overview.md#execution-model) names.
  - `Save as: environment/diagrams/attica-02-one-request-end-to-end.png`, `⏳ not rendered`.
  - Done when: the lane's last stage is whatever the code's last step is, the note says so, and the
    failure choice is stated rather than left silent.

▶ **Next: [task 2.1](#2--wire-it-into-the-files-people-read)**.

### 2. 🔗 Wire it into the files people read

◀ **Needs: [task 1](#1--create-the-environment-map)**, so there is a prompt to point at.

- [ ] **2.1 Put the slot in `environment/overview.md`**
  - Directly under the opening paragraph, before the table of contents, because the picture is the
    orientation and a reader who scrolls past it has already started reading prose.
  - Use the block form from `~/.claude/ENVIRONMENT_CONTEXT_FORMAT.md`:
  ```markdown
  > 🖼️ **Diagram wanted**: the whole system in one picture, three tiers, four processes, two HTTP
  > paths, two Redis databases.
  > Prompt: [the layers map](diagram-prompts.md#the-system-in-layers). Paste it into ChatGPT, then
  > save the result as `diagrams/attica-01-the-system-in-layers.png` and this block becomes the
  > image.
  ```
  - Done when: the block is in `overview.md` and its anchor resolves to the capstone prompt. Never an
    `![](...)` while the file is absent.

- [ ] **2.2 Replace the Pictures section of `environment/00-INDEX.md`**
  - It currently reads "None yet. There is no `diagram-prompts.md` in this folder", which stops
    being true the moment task 1.1 lands.
  - Rewrite it to name the new map and what it shows, and keep the pointer to the interactive scenes,
    saying what each is for: the map is what you glance at, the scenes are what you operate.
  - Done when: nothing in `environment/` still says there are no pictures.

- [ ] **2.3 Add the map's rows to `environment/provenance.md`**
  - Every fact in that folder carries a mark and how it was established. The map's facts came from
    the overview and from [01](01-read-the-system-before-drawing-it.md), so they inherit those marks
    rather than getting new ones.
  - Done when: a reader can tell which parts of the picture were observed and which were read from
    configuration.

▶ **Next: [instruction 3.1](#3--read-the-capstone-prompt-back-as-a-stranger)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--read-the-capstone-prompt-back-as-a-stranger)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/env-pulse @environment`, because this plan is the first thing ever to
      put a picture in that folder, and the pulse is what confirms the prompts, the slot and the
      index row agree with each other.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 👓 Read the capstone prompt back as a stranger

◀ **Needs: [task 1.3](#1--create-the-environment-map)**, the capstone written.

Rendering happens in [04](04-render-check-and-write-it-down.md). This is the cheaper check that comes
first: a prompt that does not read right will not render right, and finding that out now costs a
minute instead of an image.

3.1 **Read the capstone prompt aloud, without looking at `overview.md`**
   - Open `environment/diagram-prompts.md` in your editor and read only the capstone section.
   - Then say out loud, from memory, what the picture will show.
   - Expected result: you name three tiers, four processes, two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> arrows, two [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> compartments.
   - ✅ All four land: the prompt is self-contained.
   - ❌ You reach for the overview to answer: the prompt is leaning on context the renderer will not
     have. Go back to task 1.3 and put the missing fact in the prompt text itself.

3.2 **Check the prompt against the running system, not against the prose**
   - Bring the stack up per
     [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Count the terminals you actually opened. Compare with the process count in the prompt.
   - Run `redis-cli -n 0 dbsize` then `redis-cli -n 1 dbsize`. Two different numbers on two different
     databases is the fact the prompt claims.
   - Open Chrome DevTools → Network on `http://localhost:5173`, and look at the Host column across
     the requests. You should see requests to both `localhost:5173` (proxied) and `127.0.0.1:8000`
     (direct).
   - Expected result: every claim in the prompt matches something you just watched.
   - ✅ All match: the prompt is ready to render.
   - ❌ A claim does not match, for instance only one host appears: do not adjust the picture to
     match the prose. Correct the prompt to match what you saw, and add a line to
     [01](01-read-the-system-before-drawing-it.md)'s disagreements section saying the overview is
     stale here.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when someone who has never seen Attica can paste one prompt into ChatGPT and get
> a picture that would not mislead them.

Pass:

- `environment/diagram-prompts.md` exists, declares its inherited direction, and every prompt in it
  carries a faithfulness note, a `Save as:` path and a render status.
- The capstone's faithfulness note has one checkable clause per required element, so
  [04](04-render-check-and-write-it-down.md) has something to check against rather than a judgement
  call.
- `overview.md` carries the slot, not an embed.
- Nothing in `environment/` still says there are no pictures.
- Instruction 3.2 was actually run, and any mismatch it found was written down rather than smoothed
  over.

Fail, and what it means:

- The file exists but its art direction is described rather than copied. A renderer given a summary
  of a style produces a different style, and the set stops reading as one.
- The capstone note says "shows the system accurately". That cannot be checked, so it will not be,
  and a near-miss will get filed.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The environment folder's map | `environment/diagram-prompts.md` | — | not started |
| The layers prompt | its subject capstone → `environment/diagrams/attica-01-the-system-in-layers.png` | subject | ⏳ not rendered |
| One request end to end | its process lane → `environment/diagrams/attica-02-one-request-end-to-end.png` | process | ⏳ not rendered |
| The diagram-wanted slot | `environment/overview.md` | — | not started |
| The Pictures section, rewritten | `environment/00-INDEX.md` | — | not started |
| The map's provenance rows | `environment/provenance.md` | — | not started |
| The file with no picture | [piece 1](../diagram-prompts.md#piece-1-the-file-with-no-picture-planned--not-rendered) → `../diagrams/subject-01-the-file-with-no-picture.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/02-draw-the-layers-map.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Land the pictures | `/env-pulse @environment` | the close out | Prompts, slot and index row agree; the render count is reported |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): everything the map draws, in prose, and the file that gains the slot.
- [the environment index](../../../../../environment/00-INDEX.md): the Pictures section this plan rewrites.
- [the parent map](../../../diagram-prompts.md): the vocabulary authority. Style, palette, tiers and axes are copied from here verbatim.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): the four terminals instruction 3.2 counts.
- [the scenes on how Attica actually works](../../../../../artifacts/scenes/how-attica-actually-works/): the interactive topology this map complements rather than replaces.
- `~/.claude/ENVIRONMENT_CONTEXT_FORMAT.md`: the folder shape, the slot block, and what `env-pulse` audits.
- `~/.claude/DIAGRAM_PROMPTS_FORMAT.md`: faithfulness notes, `Save as:` lines, render status.
- `frontend/src/utils/useAxios.js:10`: the hardcoded client, one of the two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> paths the map must draw.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[03-brief-the-other-eight.md](03-brief-the-other-eight.md), which writes the remaining eight briefs
in the direction this plan just pinned into `environment/`.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/prompt-storyboard @environment` ✅ : extends a lane using a file's pinned vocabulary and never
introduces a second direction, which is exactly this plan's constraint.
   alt: `/env-pulse @environment` first, to see what that folder is already missing before adding to
   it.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A rendered set stops reading as one, image to image | Any map whose art direction was summarised instead of copied | Paste the style paragraph verbatim into every prompt. It has to survive being pasted alone. |
| Live [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> groups vanish and reconnects behave strangely | [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>, after flushing the wrong logical database | The channel layer is on the default database and the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1. Name the database in every `redis-cli` call. |
| A picture in a document reads as a broken file | Any `![](...)` written before the image exists | Use the diagram-wanted slot block until the file is on disk, then swap it. |
