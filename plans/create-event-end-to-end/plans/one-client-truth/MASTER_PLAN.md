# One Client Truth

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Attica's client holds one copy of what the server said, and every real-time message either updates
that copy or is recognised as a message the client cannot use.

Today the client holds many copies. There are 132 fetch call sites across 38 of the 110 files in
`frontend/src`, no library that owns remote state, and 73 files holding their own `useState`. Three
components open their own [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>, each with its own reconnect policy, and none of them refetches
anything after reconnecting. The messages those sockets carry are prose for a person, not state for
a [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>: an [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event's payload is `{"request_id": 41}` and the push a client receives is a
notification row with a title and a message string.

The consequence is that a client cannot tell a duplicate from a new fact, cannot tell a gap from
quiet, and cannot recover from a dropped socket by any route except the person pressing F5. This
scope gives the wire a versioned envelope, gives the client one cache that the envelope patches, and
makes a dropped socket degrade to slow rather than to wrong.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#10-one-client-truth),
and this scope is the whole of item 10 there.

**build** One server-state layer that owns remote state, with [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> events patching that [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>
rather than a parallel state tree. Without this the client keeps several disagreeing copies of the
truth however good the server protocol is.

**build** An event envelope carrying a monotonic entity version, so a client can tell apply from
ignore from gap-detected-and-refetch. Delivery is at-least-once, never exactly-once.

**build** Reconnect and snapshot recovery, so a dropped socket degrades to slow rather than to
wrong.

**fix** Two realtime models coexist in chat: a WebSocket and an eight-second poll. Pick one.

---

## What is true today, with a line number on every claim

Read before planning anything here. Each of these was established by reading the repository on
2026-08-23, not by running it, and each carries the file and line to check it against. Two of them
correct a claim the programme's own planning notes make, which is recorded in
[the decisions taken here](decisions-taken-here.md).

**There is no server-state library, and there is no shared [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>.** `frontend/package.json` lists no
data layer at all: no TanStack Query, no SWR, no Redux, no Zustand. The one shared store in the app
is `frontend/src/context/reactContext.jsx`, which is the event-creation wizard's own reducer
persisted to `localStorage` under `eventCreationStore`, not a cache of anything the server owns. The
scale of what has no owner: **132 `fetch` call sites across 38 of the 110 JavaScript files**, and 73
files holding their own `useState`.

**Three components open a socket, and each invented its own reconnect policy.**
`frontend/src/components/chat/ChatRoom.jsx:51` never reconnects at all: `socket.onclose` sets an
error flag and stops. `frontend/src/pages/DirectMessagePage.jsx:206` reconnects after 4000ms.
`frontend/src/components/notifications/useNotifications.js:86` reconnects after 5000ms. Three
policies, none of them written down anywhere, and no shared transport between them.

**Not one of the three refetches after a reconnect.** In every case the socket comes back and the
component carries on from the state it had when the socket died. Whatever happened during the gap is
simply absent, and nothing in the client knows a gap occurred.

**The eight-second poll is a fallback, not a parallel model.** Both poll effects are guarded by
`if (!socketError) return undefined` (`frontend/src/components/chat/ChatRoom.jsx:45` and
`frontend/src/pages/DirectMessagePage.jsx:259`), so the poll runs only after the socket has failed.
The programme's planning notes describe this as two realtime models coexisting; the accurate
statement is one model with a degraded fallback, and it is corrected in both planning sources and
recorded in [the decisions taken here](decisions-taken-here.md#the-eight-second-poll-is-a-fallback-not-a-second-model).
The defect is real and is a different defect: **in `ChatRoom` the fallback is permanent**, because
that component has no reconnect, so one dropped socket moves that room to [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> for the rest of
the session.

**The notification badge and the notification list are two states with two update paths, and only
one of them is ever corrected.** In `frontend/src/components/notifications/useNotifications.js`, a
push does `setNotifications(prev => [data.notification, ...prev])` and `setUnreadCount(prev => prev + 1)`
(lines 92 to 94). A 30-second poll refreshes the count and only the count
(`useNotifications.js:121`, calling `fetchUnreadCount`). So a notification that arrives while the
socket is down is recovered by neither: the count is corrected within 30 seconds by the poll and the
list is never corrected at all. The badge says three and the panel shows two, and the app offers no
way to notice.

**A duplicate push double-counts.** `setUnreadCount(prev => prev + 1)` has no idea whether it has
seen that notification before, and the push carries no identifier the client compares against. This
is not hypothetical: the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatcher reclaims and retries, so at-least-once is the delivery
guarantee it actually offers.

**Nothing on the wire carries a version.** The chat consumer sends `{'type': 'message', 'message':
serialized}` (`backend/main/chat/consumers.py:109`) and the notification writer sends
`{'type': 'notification', 'notification': {...}}` with eight fields, none of them a version
(`backend/main/notifications/utils.py:41`). Both go through a `chat.event` or `notification.new`
handler that passes the payload straight to the browser
(`backend/main/chat/consumers.py:137`, `backend/main/notifications/consumers.py:43`).

**The version fields already exist on four models, and never leave the REST layer.**
`ResourcePolicy` (`backend/main/scheduling/models.py:114`), `AvailabilityRule` (line 153),
`AvailabilitySlot` (line 224) and `Booking` (line 458) each carry
`version = models.PositiveIntegerField(default=1)`, and five serializer field lists expose it
(`backend/main/scheduling/serializers.py:91`, `:193`, `:233`, `:678`, `:701`). So a client fetching
over [REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> already receives a version and has nothing to do with it.

**`BookingRequest` has no version field**, and it is the entity the whole booking journey turns on.

**The version is bumped in exactly two places, and both bump it in a way that cannot be read back.**
`backend/main/scheduling/services.py:2189` and `:2549` both use `version=F("version") + 1`. An `F()`
expression is resolved by the database, so after the save the in-memory instance holds the
expression rather than the new number. A handler that wanted to put the new version into an outbox
payload cannot read it off the object it just saved without an extra query.

**The outbox payload is an identifier, not a state.** `payload={"request_id": request_id}`
(`backend/main/scheduling/services.py:2653`) is representative: the event says which row changed and
nothing about what it changed to. `OutboxEvent` does carry `aggregate_type` and `aggregate_id` as
real columns (`backend/main/scheduling/models.py:605` to `:606`), so the identity half of an envelope
is already modelled and only the version and the sequence are missing.

**No push in this repository waits for a commit.** `transaction.on_commit` appears nowhere in
`backend/main`. Every `group_send` runs inline in the same call that wrote the row
(`backend/main/notifications/utils.py:41`, `backend/main/chat/utils.py:18`,
`backend/main/chat/consumers.py:125`), so a transaction that rolls back after the push has already
told a client about a thing that does not exist.

**The [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> rule works and is not a gap.** `frontend/vite.config.js:19` proxies `/ws` with
`ws: true`, so all three sockets reach Daphne through the dev server. The flow map in the
event-creation learning journey claims there is no `/ws` rule, and the project's own instructions
already flag that claim as wrong.

---

## What this scope may build while D1 and D2 are open

Two of the programme's open decisions reach into this scope. Both are in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions).
Neither is taken here, and no plan in this folder is written as though either had been answered.

**D1 is which of the four live booking representations survives**, and the parent's running order
answers it before this scope starts: scope 10 waits on scope 6, which waits on scope 4,
`one-booking-truth`. It still bites the plans, because these plans are being written while it is
open, and it bites this scope in two specific places.

It decides **which entities the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> is keyed on**. A cache whose keys are the scheduling
representation's entities is a different cache from one keyed on the chat representation's, and
`BookingRequest` needing a version field at all depends on it surviving.

It decides **whether the chat poll is deleted or migrated**. The `ChatRoom` fallback is a defect
either way, but if the chat booking representation is the one being migrated away from, fixing that
component's reconnect is work on a component with a known end date, and the right fix is the shared
transport rather than a repair in place.

**The rule this scope works under: read the answer, never assume it.** The first thing this scope
does is read what scope 4 decided. No plan here presumes the scheduling representation won, and no
plan here adds a version field to an entity before knowing whether that entity survives.

**D2 is when a hold starts**, taken in scope 5, `contention-and-holds`. It changes **which events
exist**, not what an event looks like: a hold taken at request time means an organizer's screen must
show a window as held before anybody accepts, which is an event the current catalogue does not have.
**The rule this scope works under: the envelope is structure, the event catalogue is configuration.**
This scope defines the shape every message carries and the rules for applying one. Adding an event
type to that shape is a line of configuration in the scope that introduces it, not a change to the
envelope.

**The cache decision is this scope's own to take**, and it is not pre-answered anywhere in this
folder. Which library owns remote state, or whether one is written by hand, is settled by the plan
that takes it, with the candidates that lost and the reason each lost.

**D10, the frontend stack, constrains that decision and is not this scope's.** It belongs to
`the-design-system`, scope 12, which starts immediately and does not wait on this one. The two touch
at exactly one point, which is what ships in the bundle, and at no point in the API a component
calls. The cache decision states which of its candidates a Tailwind or Material UI decision would
invalidate, rather than waiting for one.

**What this scope does not touch.** The server-side push gap belongs to `running-the-workers`, scope
6, whose definition of done already claims it: the scheduling path writes a notification row and
never calls `group_send`, and one line fixed in two scopes is one line fixed twice. This scope owns
what is inside the message and what the client does when it arrives. It also builds no screens:
optimistic updates, autosave, the persistent shell and the convergence dashboard are
`the-event-workspace`, scope 11, which waits on this one.

---

## Objectives

1. **Give the client one place where remote state lives.** Several components each holding their own
   copy of the same booking is not a [caching](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> problem, it is a correctness problem, and no amount of
   protocol quality on the server fixes it.
2. **Make a message something a client can reason about.** Apply it, ignore it, or notice that
   something is missing and go and get it. Those three outcomes are impossible to distinguish from a
   payload that carries no version.
3. **Make at-least-once delivery safe rather than pretending it is exactly-once.** The dispatcher
   retries and the reaper redelivers, so duplicates are the normal case and the client is where they
   stop being visible.
4. **Make a dropped socket boring.** Recovery is a refetch the client decided to do, not a person
   pressing F5 because a number looked wrong.
5. **Have one realtime mechanism, not one per component.** Three sockets with three reconnect
   policies and no shared transport is three things to get right and three places to get it wrong.

---

## Goals

1. One [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> owns remote state, and a screen reading a booking gets the same object as every other
   screen reading that booking.
2. Every real-time message carries the entity it is about and that entity's version, and the client
   applies, ignores or refetches on the version alone.
3. Sending the same message twice changes nothing the second time, proved rather than asserted.
4. A socket dropped for two minutes, during which state changed, comes back and the screen is
   correct without anybody touching it.
5. The notification badge and the notification list cannot disagree, because they are one thing read
   two ways rather than two states updated separately.
6. `ChatRoom` no longer polls forever after one dropped socket.
7. `context/` has an entry for the event envelope, because a word that appears in every real-time
   message needs one definition.

---

## Expected Outcome

Two people watch the same booking on two screens. One acts, the other's screen changes. The worker
redelivers the same event and nothing moves twice. Somebody pulls the network cable for two minutes
and plugs it back in, and the screen catches up on its own. Nobody presses F5, and nothing on either
screen contradicts anything else on it.

---

## Definition of Done

- [ ] The [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision taken and written down: what owns remote state on the client, with the
      candidates that lost and the reason each lost, and a statement of which candidates a Tailwind
      or Material UI decision in `the-design-system` would invalidate
- [ ] One cache owns remote state, and the fetch call sites that read server state go through it.
      The count of direct `fetch` call sites outside it is recorded before and after, starting from
      the 132 counted on 2026-08-23
- [ ] The event envelope defined and documented: the entity it is about, that entity's version, the
      event type, and what a client does with each of apply, ignore and refetch
- [ ] Every message sent over `ws/notifications/` and `ws/chat/rooms/<id>/` carries that envelope,
      including the two writers in `backend/main/notifications/utils.py` and
      `backend/main/chat/utils.py`
- [ ] Whichever entities the surviving booking representation uses carry a version field, and the
      version is readable by the code that emits the event. The two `F("version") + 1` bump sites at
      `backend/main/scheduling/services.py:2189` and `:2549` are resolved so the new value can be put
      on the wire without a second query
- [ ] Reconnect and snapshot recovery: a reconnect refetches, and the refetch is what closes the gap
      rather than the socket's own replay
- [ ] One transport shared by the three components that currently open their own socket, with one
      reconnect policy, or a recorded reason why one of them keeps its own
- [ ] The `ChatRoom` permanent-fallback defect closed: a dropped socket in that component recovers
      rather than moving the room to [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> for the session
- [ ] The badge and the list in `useNotifications` derive from one cached collection, so the 30-second
      count poll can be removed rather than left as the thing that half-corrects the disagreement
- [ ] ⚠️ The duplicate test performed by hand: send one booking change, replay the same [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event
      from the Django admin at `:8000/admin/` under scheduling so it dispatches a second time, and
      confirm the receiving screen and its badge count do not move on the second delivery
      `[owner: human]`
- [ ] ⚠️ The gap test performed by hand in two browsers with Chrome DevTools open on the Network tab
      filtered to WS: take the second browser offline from the Network conditions panel, make three
      changes in the first, bring the second back online, and confirm the second browser issues a
      refetch and lands on the correct state, reading the frames in the WS Messages panel rather than
      inferring from the UI `[owner: human]`
- [ ] ⚠️ Refresh-is-boring checked at the same three points the parent scope names: press F5 straight
      after a request, after a payment and after a cancellation, and confirm the screen is the same
      before and after `[owner: human]`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to watch
      events arrive, and how to force a reconnect. Neither exists. The first is a click path in
      Chrome DevTools ending at a frame read in the WS Messages panel, and the second is the Network
      conditions panel's offline toggle, both named as the actual UI rather than as "the browser
      tools"
- [ ] `/context-pulse` run, because this scope introduces a word nobody has defined. The event
      envelope and its version get an entry in [the context index](../../../../context/00-INDEX.md),
      and [the booking entry](../../../../context/world/booking-request.md) says what a version on a
      booking request means to a person
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

---

## Sub-Scopes

(none)

---

## Plans

This folder's contents. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order).

| Plan | What it does | Status |
|---|---|---|
| [01 Read the answer and choose the cache](plans/01-read-the-answer-and-choose-the-cache.md) | Quote what `one-booking-truth` decided, pin the counting command, and take the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision with the candidates that lost | ⚠️ not started |
| [02 Define the envelope](plans/02-define-the-envelope.md) | The shape every real-time message carries, the apply rule, and the event catalogue as a list a person edits | ⚠️ not started |
| [03 Put the envelope on the wire](plans/03-put-the-envelope-on-the-wire.md) | Resolve the two version bumps that cannot be read back, and make three push sites send the envelope after commit | ⚠️ not started |
| [04 Build the one cache](plans/04-build-the-one-cache.md) | One cache the reads go through, the apply rule as a tested pure function, and the badge derived from the list | ⚠️ not started |
| [05 One transport that recovers](plans/05-one-transport-that-recovers.md) | One socket, one reconnect policy, a fresh token per connect, and a reconnect that refetches | ⚠️ not started |
| [06 Prove it and write it down](plans/06-prove-it-and-write-it-down.md) | The duplicate, gap and refresh tests by hand, the two runbook recipes, and the word this scope introduced | ⚠️ not started |

---

## Decisions taken while writing this scope

Every choice made without asking, with its reason, is in
[the decisions taken here](decisions-taken-here.md). Read it before changing anything above: several
lines above are one of two defensible readings rather than the only one, and two of them correct a
claim the programme's own planning notes make.

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) first.

Four facts decide whether work here lands or silently does nothing.

**Daphne, not `runserver`.** Anything that touches [websockets](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> needs
`daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
[the execution model](../../../../environment/overview.md#execution-model). Under `runserver` every
socket in this scope fails with no clear error, which is indistinguishable from the bugs it is
fixing.

**[Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is one server carrying two unrelated logical databases**, the websocket channel layer on the
default and the page [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1. Every push in this scope goes through the first. Flushing
the wrong one drops live websocket groups without an error.

**There are two [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients with no bridge between them**, per
[the access paths](../../../../environment/overview.md#access-paths): one goes through the Vite [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>
on relative paths and one hardcodes `http://127.0.0.1:8000` in
`frontend/src/utils/useAxios.js:10` and needs [CORS](../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>. A cache that owns remote state has to know which
of the two a call went through, because they fail differently and they authenticate differently.

**The websocket authenticates by query parameter**, not by header, so the access token is baked into
the socket URL at connect time. A reconnect that reuses a captured URL after the token has been
refreshed reconnects with a stale token. This is a fact about the transport this scope replaces, so
it is a constraint on the design rather than a defect to fix elsewhere.

**Two backend tests already fail**, so a red `python manage.py test` does not mean this scope broke
something. The checks here are the two-browser walk and the frames read in the WS Messages panel,
not a green suite.

Where a fact this scope needs is not written there, stop and ask rather than inferring it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack
up and driving the booking flow are recipes there, and this scope links them rather than restating
them.

This scope writes back a pair, and neither half exists in any form today. **How to watch events
arrive** is the click path that turns "the UI did not update" into a fact: which browser, which
DevTools panel, which filter, and what a good frame looks like next to a bad one. **How to force a
reconnect** is the other half, because every recovery claim in this scope is unprovable without a
way to break the socket on purpose and put it back.

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
This scope owes it an entry, and the reason is worth stating, because most of this scope's
vocabulary does not belong there.

`cache`, `socket`, `reconnect` and `refetch` are facts about the machinery, so they belong in
`environment/` if anywhere. **The event envelope is different**: it is the name of the thing that
carries every change a person sees, it appears in every real-time message, and no file in the
repository defines it. That gets an entry, along with what a version on a booking means to somebody
reading a screen, which is the difference between "this is older than what you have" and "something
happened that you missed".

The domain words this scope displays and does not define stay with the scopes that own them:
`hold` and `claim` with `contention-and-holds`, the checkout session and convergence with
`the-booking-journey`.

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph vocabulary and tiers, and reading axes exactly, and adds no vocabulary
of its own. It is the zoom-in on the client-truth glyph in
[the parent's subject capstone](../../diagram-prompts.md), which keeps it as one glyph in the
experience panel.

The map carries both lanes. The process lane's stages are the six plans above, drawn in the parent's
running-order numbers 16 to 21, and each changed regeneration is stamped into
`diagrams/process-versions/`. Nine prompts, none rendered.
