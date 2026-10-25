# 📐 Define The Envelope

Step 2 of 6 in this scope. Waits on [01](01-read-the-answer-and-choose-the-cache.md).
Next: [03-put-the-envelope-on-the-wire.md](03-put-the-envelope-on-the-wire.md).

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
- [Code references](#code-references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [one client truth](../MASTER_PLAN.md). Second of six, and it sits between the decision and
both builds.

[03](03-put-the-envelope-on-the-wire.md) puts what this plan specifies onto the wire, and
[04](04-build-the-one-cache.md) implements the rule this plan writes for what a client does when a
message arrives. Both read this document rather than each other, which is the point of writing it:
two builds on two sides of a socket agreeing by having read the same file, rather than by one of
them being written second and copying the other.

It waits on [01](01-read-the-answer-and-choose-the-cache.md) for one thing only, and it is the
important one: the entity list. An envelope names the entity it is about, and which entities exist
is D1's answer, not this plan's guess.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing on the wire carries a version. The chat consumer sends
`{'type': 'message', 'message': serialized}` (`backend/main/chat/consumers.py:109`) and the
notification writer sends `{'type': 'notification', 'notification': {...}}` with eight fields, none
of them a version (`backend/main/notifications/utils.py:41`). Both pass their payload straight to
the browser through a `chat.event` or `notification.new` handler
(`backend/main/chat/consumers.py:137`, `backend/main/notifications/consumers.py:43`).

**Half the envelope already exists in the database and stops at the [REST](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> boundary.** Four scheduling
models carry `version = models.PositiveIntegerField(default=1)`: `ResourcePolicy`
(`backend/main/scheduling/models.py:114`), `AvailabilityRule` (line 153), `AvailabilitySlot`
(line 224) and `Booking` (line 458). Five serializer field lists expose it
(`backend/main/scheduling/serializers.py:91`, `:193`, `:233`, `:678`, `:701`). `OutboxEvent` carries
`aggregate_type` and `aggregate_id` as real columns (`backend/main/scheduling/models.py:605` to
`:606`), which is the identity half of an envelope already modelled.

**So this plan is not designing a versioning scheme from nothing.** It is naming the shape that
connects four existing fields to a client that can use them, and putting its design effort on the
part that genuinely has no answer: what a client does with a version once it has one.

**Two programme decisions reach in.** D1 decides which entities exist, and
[01](01-read-the-answer-and-choose-the-cache.md) has read the answer by the time this plan runs. D2
decides when a hold starts and is expected to still be open, which changes which events exist and
not what an event looks like. The rule this plan works under, from
[the decisions taken here](../decisions-taken-here.md#what-written-against-d2-being-unmade-means-concretely):
**the envelope is structure and the event catalogue is configuration.**

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **[Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is one server carrying two unrelated logical databases**: the [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> channel layer on
  the default, and the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1. Every message this envelope describes travels
  through the first. Flushing the wrong one drops live websocket groups with no error, which is
  worth knowing before anybody debugs a message that did not arrive.
- **Daphne, not `runserver`**, for anything touching websockets:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
  [the execution model](../../../../../environment/overview.md#execution-model). This plan writes a
  document and needs nothing running, but [instruction 4](#4--read-two-real-frames-before-specifying-a-third)
  reads real frames and needs Daphne up.
- **The websocket authenticates by query parameter**, so the access token is in the socket URL. It
  does not change the envelope, and it is named here because the envelope's document is where a
  reader will look for it first.
- **Delivery is at-least-once.** The [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatcher reclaims and retries, so the same event
  reaching a client twice is the normal case rather than a fault. The envelope has to make that safe
  rather than pretend it does not happen.

**One fact this plan needs is not written in `environment/` and must not be inferred**: whether
`docs/` may hold a third file. [The project's own instructions](../../../../../CLAUDE.md) say `docs/`
holds interface contracts and nothing else, name two files that qualify today, and call anything
else that lands there a finding. The envelope is a payload shape another system integrates against,
so it qualifies, and [task 2.3](#2--write-the-contract) amends that sentence in the same change
rather than leaving a third file to be discovered as a finding.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This plan writes a document and changes no code.**

[03](03-put-the-envelope-on-the-wire.md) changes the server and [04](04-build-the-one-cache.md)
changes the client. Writing a line of either here means the document describes what was built rather
than the build satisfying the document, and the two sides stop being independently checkable.

**The apply rule is three outcomes, and all three have to be stated.**

Apply, ignore, and notice-a-gap-and-refetch. A specification that says what to do when the version
is one ahead and goes quiet on two ahead has specified a client that guesses. Every comparison of
held version against incoming version gets a row.

**The event catalogue is configuration, and this is what makes D2 survivable.**

D2 changes which events exist. A hold at request time needs a "this window is now held" event that
today's catalogue does not have. So the catalogue lands in one place a person can add a line to, and
`contention-and-holds` adds its event with that line and no change to the envelope, the transport or
the apply rule. The test this rule has to survive is written into
[task 2.2](#2--write-the-contract) as an explicit check, because a rule nobody checks is a hope.

**An entity that D1 did not settle does not get an envelope.**

[01](01-read-the-answer-and-choose-the-cache.md) produces two lists: the entities the [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> is keyed
on, and anything unsettled. This plan specifies envelopes for the first list. Writing one for the
second is how a migration target acquires a protocol.

**Ordering is not a guarantee this envelope offers.**

[Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> group sends do not promise the order two messages arrive in, and a client that assumes they do
will apply an old state over a new one. The version is what makes ordering not matter: a message
whose version is at or below what the client holds is ignored, whatever order it arrived in. Say
that in the document, because the alternative reading, that versions arrive in order, is the
comfortable one and it is wrong.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**One document that both sides of the socket were built from is what makes the two builds agree**,
and it is cheaper to write now than to recover later from two implementations that nearly match.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

What arrives over the socket today is prose for a person: a title and a message string. A person can
read it. A [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> cannot do anything with it except append, which is why the badge double-counts on a
retry and why a client cannot tell a duplicate from a new fact.

The number that would settle it already exists on four models and stops at the [REST](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> boundary. The
work is not inventing a versioning scheme, it is deciding what the client does with a number it can
already be given, and writing that down where both builds can read it. That is
[objective 2](../MASTER_PLAN.md#objectives): apply it, ignore it, or notice something is missing and
go and get it.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  WHAT ARRIVES TODAY            WHAT THIS PLAN SPECIFIES

  { title:  "Booking            { entity:  "<from D1's list>",
      accepted",                  id:      41,
    message: "Ana                 version: 7,
      accepted your               type:    "<from the catalogue>",
      request" }                  at:      "2026-08-23T10:14:02Z" }

  a client can render it        a client can compare it
  and nothing else
                                held 6, incoming 7  ──►  apply
                                held 7, incoming 7  ──►  ignore
                                held 7, incoming 6  ──►  ignore
                                held 5, incoming 7  ──►  refetch
                                nothing held        ──►  refetch

  the catalogue of types is a list a person edits.
  D2 adds a line to it and changes nothing above.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is the picture of what this plan closes.

**Subject: a message with nothing to compare.** The empty version chip on the purple dashed arrow,
and the three greyed stubs at the fork, are exactly what this document fills in.
[Piece 3](../diagram-prompts.md#piece-3-a-message-with-nothing-to-compare-planned--not-rendered).
Save as `../diagrams/subject-03-nothing-to-compare.png`. *(image not yet generated)*

The three stubs in that picture are apply, ignore and refetch, and the table in
[task 2.1](#2--write-the-contract) is what un-greys them.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `docs/realtime_event_envelope.md`, an interface contract in the sense the
project's own instructions use, holding six sections.

1. **What an envelope is, in two sentences**, for a reader who has never seen one. This is the
   wording [06](06-prove-it-and-write-it-down.md) hands to `/context-pulse`, so it is written for a
   person and not for a serializer.
2. **The fields.** Each with its type, whether it is required, and one real example value. At
   minimum: the entity name, the entity id, the entity's version, the event type, and the time the
   change happened on the server.
3. **The apply rule**, as a table with one row per comparison of held version against incoming
   version, and the outcome named as apply, ignore or refetch. Including the two edge rows: nothing
   held, and a version more than one ahead.
4. **The event catalogue**, as a list a person edits. Every type that exists today, each mapped to
   the entity it is about, plus the statement that adding a type is an edit to this list and nothing
   else.
5. **What this envelope does not promise.** Ordering, exactly-once delivery, and completeness of the
   payload. Each stated as a sentence a reader can act on, not as a caveat.
6. **The two writers this applies to**, named by file: `backend/main/notifications/utils.py` and
   `backend/main/chat/utils.py`, with the third path (`backend/main/chat/consumers.py:109`, the
   consumer's own `_broadcast`) named as the one that sends from inside the socket rather than from
   a request.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objectives 2 and 3](../MASTER_PLAN.md#objectives): make a message something a
client can reason about, and make at-least-once delivery safe rather than pretending it is
exactly-once.

**Goal.** `docs/realtime_event_envelope.md` exists with all six sections; every field carries a real
example value; the apply rule table has a row for every comparison including the two edge cases; the
catalogue lists every event type that exists today; and
[the project's instructions](../../../../../CLAUDE.md) name three qualifying files in `docs/` rather
than two.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/02-define-the-envelope.md`

▶ **Next: [task 1.1](#1--collect-what-is-sent-today)**.

### 1. 📖 Collect what is sent today

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 List every push in the repository, with its shape**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "group_send" --include=*.py .
  grep -rn "async_to_sync" --include=*.py .
  ```
  - Produces: one row per call site: the file and line, the group name it sends to, the top-level
    keys of the payload, and which of the three shapes it is (a notification row, a chat event, or
    something else).
  - Known starting points, to be confirmed rather than trusted:
    `backend/main/notifications/utils.py:41` sends `notification.new` with eight fields;
    `backend/main/chat/utils.py` sends through `_safe_group_send` under `chat.event`;
    `backend/main/chat/consumers.py:125` sends `chat.event` from inside the socket.
  - Done when: no `group_send` in `backend/main` is missing from the list. A push nobody listed is a
    message that will still be prose after [03](03-put-the-envelope-on-the-wire.md) is done.

- [ ] **1.2 List every event type a client can receive today**
  ```
  cd /home/molef/Work/attica
  grep -rn "data.type ===\|payload.type ===" frontend/src
  grep -rn "notification_type" backend/main/notifications/models.py
  ```
  - Produces: the catalogue's starting contents: every string a client currently branches on, and
    every notification type the backend can write.
  - Done when: the two lists are reconciled and the ones that appear on only one side are marked as
    such. A type the server sends and no client handles, and a type a client waits for and no server
    sends, are both real findings and both belong in the catalogue with a note.
  - 💡 `/unpack backend/main/scheduling/services.py` around lines 2640 to 2670: the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
    dispatch's `_create_in_app_notification` and the `payload={"request_id": request_id}` shape are
    what the catalogue's booking half is derived from. Whether that path pushes at all belongs to
    `running-the-workers`, not here.

- [ ] **1.3 Read the entity list from [01](01-read-the-answer-and-choose-the-cache.md)**
  - Open `artifacts/notes/one-client-truth/what-owns-remote-state.md` and take the entity list and
    the unsettled list.
  - Produces: the set of entity names the envelope may use, and the set it may not.
  - Done when: both lists are copied into this plan's working notes verbatim.
  - ❌ If the notes file does not exist, stop. This plan cannot name entities without D1's answer,
    and naming them anyway is the guess the whole scope is written to avoid.

▶ **Next: [instruction 4.1](#4--read-two-real-frames-before-specifying-a-third)**, because a
specification written without looking at a real frame specifies what the writer remembers.

### 2. ✍️ Write the contract

◀ **Needs: [instruction 4](#4--read-two-real-frames-before-specifying-a-third)** done, so the
fields are named against frames somebody read.

- [ ] **2.1 Write the apply rule as a table before writing anything else**
  - Rows, at minimum: incoming is exactly one ahead of held; incoming equals held; incoming is
    behind held; incoming is more than one ahead of held; the client holds nothing for this entity.
  - Each row carries the outcome (apply, ignore, refetch) and one sentence saying why.
  - Produces: the table [04](04-build-the-one-cache.md) implements as a pure function and tests.
  - Done when: every row's outcome is one of the three words, and the "more than one ahead" row says
    refetch rather than apply. That row is the whole gap-detection mechanism, and applying a state
    two ahead is how a client silently skips a change it never saw.
  - Also state in one line that ordering is not guaranteed, and that this table is what makes
    ordering not matter.

- [ ] **2.2 Write the event catalogue as an editable list, and check it against D2**
  - One entry per type from [task 1.2](#1--collect-what-is-sent-today): the type string, the entity
    it is about, and one sentence on what a person sees when it arrives.
  - Then the check, written into the document: **name the event a request-time hold would need, and
    confirm adding it is one entry here and no change to the fields, the apply rule or the
    transport.** If it is not, this design is too close to today's events and the fields need
    revisiting.
  - Produces: the configuration surface `contention-and-holds` edits when D2 lands.
  - Done when: the check is written out with its answer, not merely asserted to pass.

- [ ] **2.3 Write `docs/realtime_event_envelope.md` and make the project's own instructions true**
  - Six sections, in the order given in [Description](#description-what-to-build).
  - Every field carries a real example value taken from a frame read in
    [instruction 4](#4--read-two-real-frames-before-specifying-a-third), not an invented one.
  - Then edit [the project's instructions](../../../../../CLAUDE.md): the sentence naming the two
    files that qualify for `docs/` names three, and says in a clause why this one is an interface
    contract.
  - Done when: `grep -n "qualify today" /home/molef/Work/attica/CLAUDE.md` shows a sentence naming
    three files, and `ls /home/molef/Work/attica/docs/` lists exactly those three.

- [ ] **2.4 Write the two-sentence definition [06](06-prove-it-and-write-it-down.md) hands to `/context-pulse`**
  - Section 1 of the document, written for a person who does not know what a socket is.
  - Produces: the wording that becomes the `context/` entry, so the definition is written once by
    the people who designed the thing rather than twice by two different readers.
  - Done when: it says what a version means to somebody reading a screen, which is the difference
    between "this is older than what you have" and "something happened that you missed".

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 2](#2--write-the-contract)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🔍 Read two real frames before specifying a third

◀ **Needs: [task 1](#1--collect-what-is-sent-today)**.

A specification written from the source code describes what the code was meant to send. The frame is
what it does send, and the two differ often enough that this is worth twenty minutes.

4.1 **Bring the stack up with Daphne**
   - Follow [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md).
   - The line that matters:
     ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     daphne -b 0.0.0.0 -p 8000 main.asgi:application
     ```
   - Expected result: Daphne prints `Listening on TCP address 0.0.0.0:8000`.
   - ✅ That line appears: sockets will connect.
   - ❌ You started `runserver` instead: the app loads, every socket fails, and nothing says why.
     This is the failure that looks exactly like the bug this scope is fixing. Stop and start Daphne.

4.2 **Open the socket frames panel in Chrome**
   - Open Chrome at `http://localhost:5173` and log in.
   - Press F12 for DevTools, click the **Network** tab, click the **WS** filter.
   - Open a direct message conversation, which is the surface that reliably opens a socket.
   - Click the row whose name starts `rooms/`, then click the **Messages** tab inside it.
   - Expected result: a list of frames with arrows showing direction, green out and red in.
   - ✅ Frames are listed: this is the panel every recovery claim in this scope is read in, and
     [06](06-prove-it-and-write-it-down.md) writes the recipe for it.
   - ❌ The WS filter shows no row: the socket did not connect. Check that Daphne is running and
     that the URL in the row carries a `?token=` query parameter, because the [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>
     authenticates by query parameter and a missing token fails the handshake quietly.

4.3 **Copy one chat frame and one notification frame out verbatim**
   - Click a frame to expand it, then copy its JSON.
   - Get one of each: a `message` frame from the room socket, and a `notification` frame from the
     notifications socket. Triggering the second means doing something that notifies you, so send a
     message from a second browser logged in as the other party.
   - Expected result: two JSON objects, pasted into the working notes with the date.
   - ✅ Both captured: [task 2.3](#2--write-the-contract) takes its example values from these.
   - ❌ The notification frame never arrives: write down that it did not, and which action you took.
     The scheduling notification path writes a row and never pushes, which is
     `running-the-workers`' criterion and not this plan's bug. A chat notification should still
     arrive, so try chat before concluding the socket is broken.

4.4 **Say what a client could do with each frame, out loud**
   - Read each frame and answer: could a [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> tell whether it has seen this before?
   - ✅ The answer is no for both: that is the defect, in your own words, with the evidence in front
     of you.
   - ❌ The answer is yes for either: something in the payload is doing the job of a version. Write
     down which field, because the envelope should use it rather than adding a second one.

▶ **Next: [task 2.1](#2--write-the-contract)**, which writes the rule the frames showed is missing.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when the server build and the client build can each be done by a different
> person, from this document, without either of them talking to the other.

Pass:

- `docs/realtime_event_envelope.md` has all six sections, and every field carries a real example
  value taken from a captured frame.
- The apply rule table has a row for every version comparison including "nothing held" and "more
  than one ahead", and the second of those says refetch.
- The catalogue names every type from both the server list and the client list, with the mismatches
  marked.
- The D2 check is written out with its answer.
- The project's instructions name three qualifying files in `docs/`, and `docs/` holds exactly
  three.
- The two-sentence definition is written for a person, not for a serializer.

Fail, and what it means:

- Example values invented rather than captured. That is the failure this plan is most exposed to,
  because an invented example is always well-formed and a real one is where the surprises are.
- An entity named in the envelope that D1's answer did not settle. Then the envelope has quietly
  taken a decision that belongs to another scope.
- The apply rule missing the "more than one ahead" row. Then there is no gap detection, and
  [05](05-one-transport-that-recovers.md) has nothing to hang recovery on.
- The catalogue written as a section of the specification rather than as a list a person edits. Then
  D2's event becomes a change to the contract instead of a line in a list, which is exactly what
  this design is arranged to avoid.

Partial pass is acceptable on the catalogue's completeness. A catalogue with three types marked
"server sends this, no client handles it" is more useful than a tidy one that dropped them.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The envelope contract, six sections | `docs/realtime_event_envelope.md` | — | not started |
| The apply rule table | inside the contract | — | not started |
| The event catalogue, editable | inside the contract | — | not started |
| The two captured frames, verbatim | inside the contract, as example values | — | not started |
| The two-sentence definition for `/context-pulse` | inside the contract, section 1 | — | not started |
| Three qualifying files named in the project's instructions | `CLAUDE.md` | — | not started |
| A message with nothing to compare | [piece 3](../diagram-prompts.md#piece-3-a-message-with-nothing-to-compare-planned--not-rendered) → `../diagrams/subject-03-nothing-to-compare.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/02-define-the-envelope.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatch's notification writer | `/unpack backend/main/scheduling/services.py` | task 1.2 | The payload shape read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

Nothing in this plan changes code. These are the sites the document describes, and the shapes it has
to be true about.

`backend/main/notifications/utils.py:41` — the notification push, eight fields, no version:

```python
async_to_sync(channel_layer.group_send)(
    f'notifications_{recipient.id}',
    {'type': 'notification.new',
     'notification': {'id': ..., 'notification_type': ..., 'title': ..., 'message': ...,
                      'link_type': ..., 'link_id': ..., 'sender_username': ..., 'created_at': ...}}
)
```

`backend/main/chat/consumers.py:109` — the chat push, a serialized message under a type string:

```python
sent = await self._broadcast({'type': 'message', 'message': serialized})
```

`backend/main/chat/utils.py` — `_safe_group_send` and `broadcast_room_event`, the request-side path
into the same group, which swallows channel-layer errors so a [REST](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> handler survives [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> being
down. The envelope document says what that means for a client: a push that never happened is
indistinguishable from a gap, which is why recovery is a refetch rather than a replay.

`backend/main/scheduling/models.py:605` to `:606` — `aggregate_type` and `aggregate_id` on
`OutboxEvent`, the identity half of the envelope, already columns.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[03-put-the-envelope-on-the-wire.md](03-put-the-envelope-on-the-wire.md), which makes the server send
what this document specifies, including resolving the two version-bump sites that cannot be read
back. [04](04-build-the-one-cache.md) reads the same document and can be done at the same time.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The deliverable is an interface contract written against captured frames,
and the nearest skills do adjacent jobs: `/flowspec` transcribes a structure into a diagram and
never writes a payload contract, `/docstrings` documents functions rather than a wire format.
   also: `/context-pulse` in [06](06-prove-it-and-write-it-down.md) takes section 1 of this document
   verbatim, so the definition is written once here rather than twice.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| The WS filter in DevTools shows no row | Instruction 4.2, with `runserver` running instead of Daphne | Start Daphne. Under `runserver` every socket fails and nothing on the screen says so. |
| A notification frame never arrives while chat frames do | Instruction 4.3, on a booking action | The scheduling notification path persists and never pushes. That is `running-the-workers`' criterion, not a bug in this scope. Record it and use a chat notification for the example value. |
