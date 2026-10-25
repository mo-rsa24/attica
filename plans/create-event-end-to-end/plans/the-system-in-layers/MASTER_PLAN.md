# The System In Layers

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Attica has one picture of itself, and every diagram a reader is sent to exists, is checked against
the code, and reads in the same visual language as every other.

[The environment overview](../../../../environment/overview.md) describes four processes, three ways
the frontend reaches the backend, and one [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> serving two unrelated things, entirely in prose. It
has no image, and its own index says so: the Pictures row reads "None yet". The four diagrams the
architecture reviews ask for (the booking state machine on its own page, the contention sequence,
the real-time delivery path, and event convergence) are drawn nowhere. Four more are written as
briefs in [the onboarding architecture-diagrams plan](../../../onboarding-docs/plans/04-architecture-diagrams.md)
and have never been rendered.

This scope draws all of it, once, in one direction, and files each picture where the person who
needs it is already looking.

---

## What this scope may draw while D1 and D2 are open

Three of the pictures this scope owes describe things nobody has decided yet, and the decisions are
[D1, D2 and D3 in the state of the world](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions).

**D1 is which of the four live booking representations survives.** Until it is answered there is no
such thing as "the" booking state machine, because there are four, with different states each.

**D2 is when a hold starts**, at request time or at acceptance. The two reviews contradict each
other and the code does the second. Until it is answered the contention sequence has two possible
shapes.

**D3 is whether an event is a set**, which decides what event convergence projects when one critical
request is refused.

**The rule this scope works under: draw what is, never what a decision might make it.** Every
picture here is of the code as it stands on the day it is drawn, carries that date, and names the
files and lines it was read from. Where four things exist, it draws four. Where the code resolves
contention one way and a review proposes another, it draws what the code does and draws the proposal
beside it as a proposal, hedged, with nobody's name on the answer.

**That makes this scope an input to those decisions rather than a thing waiting on them**, which is
why it waits on nothing in the parent's running order. Four booking state machines side by side,
with their state counts and their reference counts, is the evidence D1 gets decided on. A drawing of
what a hold does today is the evidence D2 gets decided on.

**The target-state versions of those three pictures are not this scope's.** They belong to the scope
that makes each decision: `one-booking-truth` owes the surviving state machine, `contention-and-holds`
owes the settled contention sequence, and `the-booking-journey` owes the convergence projection. Each
of the three as-is pictures here carries one line naming the scope that owes its replacement, so
neither goes missing and neither gets drawn twice.

---

## Objectives

1. **Give the environment overview the picture it has always been missing.** A shape is faster to
   see than to read, and this one is four processes, three access paths and two [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> databases that
   currently exist only as paragraphs.
2. **Draw the four things the reviews ask for and the repo lacks**, so an architecture argument has
   something to point at.
3. **Render the four briefs that already exist and were never drawn**, rather than writing a fifth
   description of the same flows.
4. **Put a failure beside every happy path.** A diagram of the path that works teaches half the
   system, and the half it leaves out is the half that pages someone.
5. **One visual language across the whole set.** Every picture in this repo inherits the direction
   the flow map established, so a reader who has learnt one legend has learnt all of them.

---

## Goals

1. `environment/diagram-prompts.md` exists, and [the environment index](../../../../environment/00-INDEX.md)'s
   Pictures section names the layers map instead of reading "None yet".
2. `environment/overview.md` carries the layers map, as an image once it is rendered and as a
   diagram-wanted slot until then, never as a broken embed.
3. Nine system diagrams exist. That is what this scope owes, not what it renders: the four written
   as briefs in `onboarding-docs`, and the five the reviews ask for (the booking state machine, the
   contention sequence, the real-time delivery path, event convergence, and the layers map itself).
   The environment map carries further pieces of its own, so the number of images to make is
   whatever [the render worklist](plans/04-render-check-and-write-it-down.md#1--build-the-render-worklist)
   finds on the day.
4. Every prompt in the set carries the file-and-line references it was checked against, and the date
   it was checked.
5. Every happy path in the set has its failure drawn, either as branches inside the same image or as
   its own page, with the choice stated per diagram.
6. The three decision-dependent pictures each carry the date they describe and the name of the scope
   that owes the target version.
7. No picture in the set declares a new art direction, a new colour meaning or a new glyph tier.

---

## Expected Outcome

Someone who has been away from Attica for two months opens the environment overview and sees the
system in one image before reading a word of it. Someone arguing about where a hold should start
opens one page and sees what the code does today, with the two proposals drawn beside it. Nobody
draws the same diagram twice, and nobody is taught something the code does not do.

---

## Definition of Done

- [ ] `environment/diagram-prompts.md` written to
      the shared diagram contract at `~/.claude/DIAGRAM_PROMPTS_FORMAT.md`: one art
      direction inherited from [the parent map](../../diagram-prompts.md), the style paragraph
      verbatim at the head of every prompt, a faithfulness note, a `Save as:` path and a render
      status on each
- [ ] The layers map prompt written, and `environment/overview.md` carrying either the rendered
      image or the diagram-wanted slot pointing at it
- [ ] Five diagram briefs written and checked against the code: the booking state machine as four,
      the contention sequence, the real-time delivery path, event convergence, and the layers map
- [ ] The four briefs in [the onboarding architecture-diagrams plan](../../../onboarding-docs/plans/04-architecture-diagrams.md)
      reconciled: rendered from here, and that plan's step 5 row and its own Quick context updated to
      say this scope owns them, so they are not drawn twice
- [ ] ⚠️ Every prompt in the set pasted into ChatGPT image generation and the result saved to its
      `Save as:` path, at the size the prompt names `[owner: human]`
- [ ] ⚠️ Every rendered image opened and read back against its faithfulness note clause by clause,
      per the render-checking procedure in `~/.claude/DIAGRAM_PROMPTS_FORMAT.md` ("Checking a render against its note"):
      each clause confirmed, every hedged piece visibly hedged, the visual thesis said out loud and
      checked against what the image actually teaches. A near-miss is regenerated, never captioned
      around `[owner: human]`
- [ ] ⚠️ The layers map checked against the running system rather than against the prose: all four
      processes started by hand per [the runbook index](../../../../runbook/00-INDEX.md), then the
      image read beside them, confirming it draws two [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients rather than one, `/ws` reaching
      the backend rather than dying at the [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>, and [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> as two logical databases rather than one
      box `[owner: human]`
- [ ] The three decision-dependent diagrams each carry their as-of date and the scope that owes the
      target version
- [ ] `artifacts/figures/how-a-booking-happens/README.md` written with an entry per diagram, saying
      what it shows and how it was established, per
      the artifact tree convention at `~/.claude/ARTIFACT_TREE_FORMAT.md`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to render
      a prompt into a filed image, and how to prove a rendered diagram still matches the code
- [ ] Close out: `/env-pulse`, because this scope files the environment folder's first pictures, then
      `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers`

---

## Sub-Scopes

(none)

---

## Plans

This folder's contents. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order).

| Plan | What it does | Status |
|---|---|---|
| [01 Read the system before drawing it](plans/01-read-the-system-before-drawing-it.md) | Establish, with a `path:line` on every claim, what a booking is, what happens under contention, what reaches a screen, and whether convergence exists | ⚠️ not started |
| [02 Draw the layers map](plans/02-draw-the-layers-map.md) | Give `environment/` its first pictures: the folder's map, the layers prompt, and the slot in `overview.md` | ⚠️ not started |
| [03 Brief the other eight](plans/03-brief-the-other-eight.md) | The four the reviews ask for, the four already briefed in `onboarding-docs`, and a failure beside every one | ⚠️ not started |
| [04 Render it, check it, and write down how](plans/04-render-check-and-write-it-down.md) | Every prompt in the scope rendered, each read back against its note before filing, and the two recipes for doing it again | ⚠️ not started |

---

## Decisions taken while writing this scope

Every choice made without asking, with its reason, is in
[the decisions taken here](decisions-taken-here.md). Read it before changing anything above, because
several of the lines above are one of two defensible readings rather than the only one.

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) before drawing anything, because in this scope
the overview is both the source and one of the deliverables.

Five facts decide whether the layers map is right or confidently wrong.

**The `/ws` [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> rule exists.** The event-creation flow map at `/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`'s
Step 0 says the Vite proxy forwards only `/api`, `/vendors`, `/cart` and `/checkout`, so [websockets](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>
die in development. That claim is wrong, and this repo's own instructions say so. `/ws` is proxied
with `ws: true`. This is the single most likely way to draw a dead path that works.

**There are two [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients and no bridge between them**, per
[the access paths section](../../../../environment/overview.md#access-paths): one goes through the
Vite proxy, one hardcodes `127.0.0.1:8000` and therefore needs [CORS](../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>. A layers map drawing one arrow
from browser to backend is wrong.

**[Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is one server carrying two unrelated logical databases.** The websocket channel layer uses
the default; the page [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> uses database 1. Drawing one Redis box loses the fact that flushing the
wrong one silently drops live websocket groups.

**Four processes run and none starts or supervises another**, per
[the execution model](../../../../environment/overview.md#execution-model). The [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker is the
one whose absence is silent. The layers map has to show that silence, not just the four boxes.

**Two tests already fail**, per [the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints),
so "the suite is green" is not available as a check that a diagram is right. The check here is
reading the file and line the diagram claims.

Where a fact this scope needs is not written there, stop and ask rather than inferring it. A wrong
diagram is worse than a missing one, because a diagram is believed without being checked.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the four
processes up is a recipe there and this scope links it rather than restating it.

This scope writes back a pair that nothing covers today: how to turn a prompt into a filed image
(paste it into ChatGPT image generation, save it at the `Save as:` path and the size the prompt
names, read it back against its faithfulness note, flip the render status), and how to prove a
rendered diagram still matches the code (open the file and line it names, confirm the claim, and say
what to do when it no longer holds).

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
This scope reads it and owes it nothing: every word it draws already has an owner there, and the
words that do not yet exist (`hold`, `claim`, the event envelope, convergence, the checkout session)
are owed by the scopes that introduce them. Where a diagram needs one of those words before its
owning scope has defined it, the diagram uses the code's own identifier and says so, rather than
coining a term.

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph tiers and reading axes exactly, and adds no vocabulary of its own.

That map is the picture of this scope's own shape, and it is not the deliverable. The deliverables
are the nine system diagrams named in the Goals above, which land in
[the environment folder](../../../../environment/) and in `artifacts/figures/`.
