# Decisions taken while writing this scope

This scope is written in unattended passes, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with its reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused. The decomposition's choices come first, then the
plan set's.

The source for the scope's content is item 10 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#10-one-client-truth),
and the state of the world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

Two of these correct a claim the programme's own planning notes make. Those two are first, because
they change what the scope is, not only how it is written.

---

## The eight-second poll is a fallback, not a second model

**Decision.** The scope describes one realtime model with a degraded fallback, and names the actual
defect as the fallback being permanent in one of the two components. Both planning sources that said
two models coexist are corrected to match.

**Why.** Both poll effects are guarded. `frontend/src/components/chat/ChatRoom.jsx:45` and
`frontend/src/pages/DirectMessagePage.jsx:259` both open with
`if (!socketError) return undefined`, so no poll runs while the socket is healthy. "Two realtime
models coexist in chat: a [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> and an eight-second poll. Pick one" describes a client that
polls and sockets at the same time, and a plan written from that sentence would go looking for a
duplicate stream to delete and find a fallback that is doing its job.

**Why it is still a defect, and a worse one than the sentence claims.**
`ChatRoom` never reconnects: `socket.onclose` sets the error flag and stops
(`frontend/src/components/chat/ChatRoom.jsx:67`). So one dropped socket moves that room to
eight-second [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> for the rest of the session, with no path back. `DirectMessagePage` reconnects
after 4000ms and clears the flag on open, so its fallback is temporary. Same code shape, two
different consequences, and only one of them is a real problem. "Pick one" is the wrong instruction:
the fix is a shared transport with one reconnect policy, which retires the question rather than
answering it.

**What was done about the sources.** Both present-tense planning sources are corrected, so the next
scope that reads them does not plan against the wrong picture.
[The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#10-one-client-truth)
and [where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#2-the-state-of-the-world)
both now say the poll is a fallback and name `ChatRoom`'s missing reconnect as the defect.
[The plan walk](../../../../ideas/enhancing-create-event-end-to-end/PLAN_WALK.md) is untouched: it is
the record of a session on a day, and editing a record to fix a number falsifies the record.

## The envelope is half wired already, and the planning notes call it entirely missing

**Decision.** The scope treats the entity version as partly built and mostly unwired, rather than as
something to design from nothing, and says so in its Definition of Done by naming the two bump sites
that have to be resolved.

**Why.** [Where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#2-the-state-of-the-world)
lists "a real-time event envelope with a monotonic version and gap detection" under Missing. Four
models already carry `version = models.PositiveIntegerField(default=1)`: `ResourcePolicy`
(`backend/main/scheduling/models.py:114`), `AvailabilityRule` (line 153), `AvailabilitySlot`
(line 224) and `Booking` (line 458). Five serializer field lists already expose it. `OutboxEvent`
already carries `aggregate_type` and `aggregate_id` as real columns (lines 605 to 606), which is the
identity half of an envelope.

**What is actually missing**, which is a shorter and more specific list: the version never leaves the
[REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> layer, `BookingRequest` has no version field at all, and the two sites that bump a version use
`F("version") + 1` (`backend/main/scheduling/services.py:2189` and `:2549`), so the code that just
saved the row cannot read the new number off the instance to put it on the wire. That last one is a
constraint a plan has to design around, and it is invisible from a Missing list.

**Why this matters for the shape of the scope.** A scope told the envelope is missing writes a plan
that designs a versioning scheme. A scope told the fields exist and do not travel writes a plan that
connects two things, which is smaller, and puts its design effort on the part that genuinely has no
answer: what a client does with a version once it has one.

---

## Whether this scope waits on D1 or is written against it

**Decision.** Both. The running order already answers D1 before this scope starts, and the plans are
still written as though it were open.

**Why.** Scope 10 waits on scope 6, which waits on scope 4, `one-booking-truth`, where D1 is taken.
By the time anybody executes here the answer exists. But these plans are being authored now, and a
plan that says "[cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> the scheduling representation's entities" would be a guess dressed as an
instruction. The master plan states the rule as "read the answer, never assume it" and names the two
places D1 bites: which entities the cache is keyed on, and whether the chat poll is deleted or
repaired.

**The alternative rejected.** Waiting for D1 before authoring. That would have left the scope
undecomposed for the length of two other scopes, and most of its content does not depend on the
answer: the transport, the reconnect policy, the recovery rule and the badge-versus-list defect are
the same whichever representation wins.

## What "written against D2 being unmade" means concretely

**Decision.** The envelope is structure and the event catalogue is configuration. This scope defines
the shape every message carries and the rules for applying one, and adding an event type is a line of
configuration in whichever scope introduces it.

**Why.** D2 decides when a hold starts, which changes which events exist rather than what an event
looks like. A hold at request time needs a "this window is now held" event that today's catalogue
does not have; a hold at acceptance keeps the events that exist. Neither reading changes the fields
of an envelope or what a client does when the version it receives is two ahead of the version it
holds.

**The test this rule has to survive.** When `contention-and-holds` adds its event, the change here
should be one entry in a catalogue and no change to the envelope, the transport, or the apply rule.
If it turns out to need more than that, this decision was wrong and the envelope was designed too
close to today's events.

## The cache decision is left open rather than answered here

**Decision.** Which library owns remote state, or whether one is written by hand, is not answered in
this master plan. The plan that takes it lays out the candidates and the criteria.

**Why.** It is the one genuine decision this scope contains, and answering it in a master plan
written unattended would have hidden the reasoning inside a sentence. The obvious candidate is
TanStack Query, and "obvious" is exactly the condition under which a decision gets taken without its
alternatives being written down, which is what makes it impossible to revisit later.

**What the master plan does say**, so the plan is not starting from nothing: there is no data layer
in `frontend/package.json` today, the thing being replaced is 132 `fetch` call sites across 38 of 110
files, and the decision has to state which of its candidates a Tailwind or Material UI decision would
invalidate.

## D10 is named as a constraint on the cache decision without becoming a dependency

**Decision.** The frontend stack decision is named as something the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision must state its
exposure to, and this scope does not wait on it.

**Why.** `the-design-system`, scope 12, owns D10 and waits on nothing after the blockers, so the two
scopes can easily run at the same time. They touch at one point, which is what ships in the bundle,
and at no point in the API a component calls: a cache exposes hooks and a design system exposes
components. Making this scope wait on that one would serialise two independent pieces of work over a
question that changes neither's interface.

## The server-side push gap belongs to `running-the-workers`, not here

**Decision.** This scope does not fix `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`), the writer that persists a notification row and never
pushes it.

**Why.** [The sibling scope's definition of done](../running-the-workers/MASTER_PLAN.md#definition-of-done)
already claims it, in the criterion about the scheduling notification path pushing as well as
persisting over the same group the chat path uses. One line owned by two scopes is one line fixed
twice, or, more likely, one line each scope assumes the other did.

**Where the boundary sits.** Scope 6 owns whether a message is sent. This scope owns what is inside
it and what the client does when it arrives. The two meet at the payload, which is why this scope's
Definition of Done names the two writers by file rather than by behaviour.

## The screens belong to `the-event-workspace`, not here

**Decision.** No optimistic updates, no autosave, no persistent shell, no convergence dashboard.

**Why.** Those are item 11 in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#11-the-event-workspace),
which waits on this one. They are also the things most likely to pull a [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> scope into rewriting
screens, because each of them is easier to demonstrate than a cache is. The separation is worth
holding: this scope is finished when the data is right and no screen has necessarily changed
appearance at all.

**The one place it is nearly violated.** The badge-and-list disagreement in
`frontend/src/components/notifications/useNotifications.js` is a screen defect with a cache cause,
and it stays here because fixing it means deleting a poll and deriving two values from one cached
collection, which is cache work. The panel it renders into is untouched.

---

## The map adds nothing to the parent's vocabulary, and this was checked rather than asserted

**Decision.** The child map declares no new glyph, no new colour meaning and no new tier.

**Why it holds.** Everything this scope draws is already in the parent's list. The browser card, the
person figure, the handler glyph, the worker gear, the queue tray and the cylinder are the six
glyphs it needs. Blue dashed already means an [HTTP request](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub>, purple dashed already means a [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>
push, orange dashed already means a queued or [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event, red already means a confirmed defect, and
the grey dashed hedge outline already means unconfirmed. The one thing this scope is about, a client
holding several copies of one fact, is drawn by repeating the browser card, which needs no new
vocabulary at all.

**What was resisted.** A new glyph for the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>. It would have been the natural thing to invent, and
it is unnecessary: a cache in this art direction is a cylinder in the browser tier, and the tier is
what says it is not the database.

## The parent capstone gets three labelled glyphs, not one

**Decision.** The experience panel in [the parent's subject capstone](../../diagram-prompts.md) now
holds three labelled component glyphs, one per experience-plane scope, rather than only the one this
decomposition needed.

**Why.** The capstone's domain panel already names all five of its scopes, decomposed or not, so the
picture describes the scope structure rather than the decomposition state. Adding one label to the
experience panel and leaving two components unnamed would have made that panel read as though it
held one scope, and would have forced the same amendment twice more when
`the-event-workspace` and `the-design-system` are decomposed.

**What it costs.** The capstone is `[built]` and its rendered image at
`diagrams/whole-scope-in-one-picture.png` does not show these labels, so the prompt and the image
disagree by one more item than they already did. That disagreement is recorded in the capstone's own
list of things waiting on the next render, alongside the three that were already there, rather than
being left for a reader to spot.

**The performance panel was left alone.** It holds one scope, so the panel is that scope's glyph and
labelling it twice would say nothing.

## The planning notes' count of coming capstone amendments was corrected

**Decision.** The paragraph in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
that predicts four capstone amendments is rewritten to what is true after this commit.

**Why.** It listed `performance-architecture`, `the-event-workspace`, `the-design-system` and
`getting-it-out` as the scopes with no glyph to zoom into, which was wrong in both directions by the
time this run started. `getting-it-out` has had a labelled deploy glyph since the capstone was
amended to name it, and `one-client-truth` was not on the list despite having no glyph. Leaving a
prediction that is wrong in two ways is worse than leaving no prediction, because the next
decomposition trusts it and skips a check.

## Where this scope's row sits in the parent's running order

**Decision.** One placeholder row at step 16, immediately after `running-the-workers`, marked as
having no plan files yet.

**Why.** The skill's rule is to interleave a child's plans into the parent table at the step numbers
where they belong, and to add one placeholder row naming the scope when the child has no plans yet.
This scope waits on scope 6 and on nothing else, so the step after 15 is where it belongs. The
undecomposed domain scopes 7, 8 and 9 will land above it when they are decomposed, which the table's
note already explains for the two that sit below step 11.

**What this does not claim.** A placeholder row is not a plan. When `populate-plans` runs here it
replaces that one row with a row per plan file, and the numbers below it move.

## The plans folder starts empty, and carries a `.gitkeep`

**Decision.** `plans/` is created empty with a single `.gitkeep` file inside it.

**Why.** The skill's rule is that plan files are authored later by `populate-plans` and never invented
at decomposition time. Git does not track an empty directory, so without the placeholder file the
folder would exist on this machine and not in the commit, and the next person to clone would find the
master plan pointing at a folder that is not there.

## Two prose references to this scope became links

**Decision.** The two places in
[the sibling scope's fourth plan](../running-the-workers/plans/04-close-the-two-silent-losses.md)
that name `one-client-truth` in backticks now link to this master plan.

**Why.** They were written as backticked names because the scope did not exist. It exists now, and a
name a reader has to go and find is a name that does not get followed. Nothing else about those two
lines changed.

## The process lane was not authored

**Decision.** This scope's map carries the subject lane and its capstone, and says the process lane
comes later.

**Why.** A process lane draws the scope's plan files as stages, and this scope has no plan files.
Authoring one now would mean inventing the plans it draws, which is exactly what decomposition is not
allowed to do. The parent's own map makes the same call for the same reason.

## The findings live in the master plan rather than in a plan file

**Decision.** The thirteen `path:line` findings are in the master plan under "What is true today",
not held back for the plans to rediscover.

**Why.** They are what the scope is for, and several of them change what the plans should say: the
`F("version")` constraint, the absent `BookingRequest` version, the badge-and-list split, the
permanent fallback in one component and not the other. A plan file authored without them would
propose work that the code already does or misses work the code needs. The sibling scope made the
same call, so the two read alike.

---

## What was checked before this run finished

**Every claim in the master plan carries a file and a line**, and each was read rather than
remembered. The counts (132 fetch call sites, 38 of 110 files, 73 files with `useState`, three
`new WebSocket` sites, zero `transaction.on_commit`) came from running the search, not from an
estimate.

**No handoff pointer was broken.** The parent master plan carries no `▶ Next:` or `◀ Needs:` lines,
and the parent has no plan files of its own, so there was nothing pointing at the row this run
replaced. This was confirmed by searching for both markers in the parent before and after.

**Every relative link in the three new files resolves** from this folder, checked by resolving each
path against the filesystem rather than by pattern.

## What this run did not do

**No image was rendered.** Every prompt in this scope's map is `[planned]` and unrendered, which
matches the sibling scopes and the parent. Rendering is a separate act with its own read-back check,
and doing it unattended would have filed images nobody compared against their notes.

**No plan file was authored.** `populate-plans` owns that, and running it here would have written the
work breakdown for a scope whose one real decision is still open.

## The two untracked images were committed, and the map they belong to was made true

**Decision.** The two rendered PNGs sitting untracked under `fixing-create-event/diagrams/` are
committed, and the five stale status marks in that scope's map are corrected against the images.

**Why they were left out of the decomposition commit.** They predate this run and belong to a
different scope, so sweeping them into a commit about `one-client-truth` would have mixed two
unrelated changes under one message. Holding them back was right for that commit and wrong as a final
answer, because it left two rendered diagrams outside version control.

**Why committing is the right call rather than leaving them alone.** They sit at exactly the paths
that scope's map names in its own `Save as` lines, and the three other diagrams in that folder are
already tracked, so the convention is settled. Adding a file to git is reversible and destroys
nothing; the caution that applied here was about deletion, which this is the opposite of.

**Why the map had to move in the same act.** All six of that scope's prompts were marked
`⏳ not rendered` while five of the six had images on disk. Committing two images under a map that
denies they exist would have replaced one wrong state with a different wrong state. So each of the
five was read back against its own faithfulness note before its mark was flipped, which is the same
standard this scope's own map is held to.

**What the read-back found.** Three are faithful with nothing outstanding. Two carry a fix waiting on
a re-render: `subject-02` puts badge 1 on the create-event wizard where the defect is the organizer
dashboard's fetch, and it contradicts the subject capstone, which places the same badge correctly;
and the process capstone draws the runbook twice, breaking its own prompt's "no duplicated
components" rule, and labels stage one with two words that appear in no text list. Both prompts were
corrected so the next render does not repeat them, and both discrepancies are recorded beside the
prompts rather than quietly fixed.

**What was deliberately not done.** The missing sixth image was not generated. Rendering unattended is
the thing this run already declined to do for its own map, and doing it for somebody else's scope
would be worse.

---

# Decisions taken while writing the plan set

The same rule applies to the six plan files: nobody to ask, so every choice is taken and recorded
rather than deferred.

## Six plans, split at the contract

**Decision.** Six plan files: the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision, the envelope contract, the server side, the client
side, the transport, and the proving. Steps 18 and 19 in
[the parent's running order](../../MASTER_PLAN.md#running-order) are the two sides of one contract
and run at the same time.

**Why.** Each of the six has its own deliverable that a person could hand over: a decision record, an
interface contract, a set of frames carrying a version, a cache with a tested apply rule, a transport
with one policy, and a set of by-hand results with two recipes. Collapsing the server and client
halves into one plan would have lost the thing that makes them parallelisable, which is that both
read the contract rather than each other.

**The alternative rejected.** Four plans, folding the two defect fixes (`ChatRoom`'s permanent
fallback and the badge-versus-list disagreement) into a single "close the client defects" plan. Both
defects are consequences of the two architectural changes rather than separate work: the badge fix is
cache work and lands in the cache plan; the `ChatRoom` fix is transport work and lands in the
transport plan. A plan collecting them would have been a plan about symptoms.

## Prerequisite inference was run automatically, and four things came out of it

**Decision.** Unstated setup work was inferred and written into the plans as real tasks, rather than
left for whoever executes to discover.

**Why.** The skill's default is to ask which mode to use, and there is nobody to ask. Inferring and
marking is recoverable; not inferring leaves a plan that stops halfway through a session for a
reason nobody wrote down.

**What was inferred.** A staff account for the Django admin, because no seed creates one and the
duplicate test replays an [outbox row](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> from there
([06, task 1.1](plans/06-prove-it-and-write-it-down.md#1--set-the-stage-for-three-tests-that-need-a-person)).
The frontend having no unit test runner at all, which decides where the apply rule's proof can run
([01, task 3.3](plans/01-read-the-answer-and-choose-the-cache.md#3--write-the-decision-record)).
Recording which two backend tests are already red before touching the backend, so a red run afterwards
means something
([03, task 1.1](plans/03-put-the-envelope-on-the-wire.md#1--record-the-starting-state-so-after-means-something)).
And amending the project's own instructions when a third file lands in `docs/`, because that file
otherwise becomes a finding the moment it is written
([02, task 2.3](plans/02-define-the-envelope.md#2--write-the-contract)).

## The direct-fetch count is pinned to a command rather than to a number

**Decision.** The plans record the counting command and its answer, and name which of the two
circulating numbers is the ruler. The scope's definition of done keeps its baseline of 132 across 38
files, and nothing about it is rewritten.

**Why.** `grep -rn "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l` answers 144 across
40 files on the same tree, while 110 total JavaScript files and 73 files holding `useState` both
reproduce exactly. So the fetch figure came from a differently worded search and the two others did
not. Picking whichever number flatters the after-comparison is how a migration reports progress it
did not make.

**What was not done, and why.** The definition of done was not edited to say 144. That criterion is
the scope's, and changing a number in it while authoring the plans that will be measured against it
is the wrong direction of travel. The discrepancy is written into
[01](plans/01-read-the-answer-and-choose-the-cache.md) where the measurement is taken, and both
numbers go into the notes file.

## The envelope's contract lives in `docs/`, and the project's own instructions move with it

**Decision.** `docs/realtime_event_envelope.md`, and
[02](plans/02-define-the-envelope.md) edits the sentence in the project's instructions that names
two qualifying files so it names three.

**Why.** The project's instructions say `docs/` holds interface contracts and nothing else, and call
anything else that lands there a finding. A payload shape both sides of a socket integrate against is
exactly an interface contract, so it belongs there rather than in `artifacts/`, which holds what the
work produced rather than what another system builds against.

**Why the amendment is in the same plan.** A third file in `docs/` under a sentence that says two is
a finding by the repository's own rule, and a finding left for `tidy-repo` to report is a finding
somebody has to re-derive the answer to.

## The apply rule's proof route is recommended, not taken

**Decision.** [01](plans/01-read-the-answer-and-choose-the-cache.md) records a recommendation to add
`vitest`, and [instruction 4.4](plans/01-read-the-answer-and-choose-the-cache.md#4--take-the-cache-decision-and-sign-it)
is where a person takes or overrules it.

**Why the recommendation is vitest.** The apply rule is a pure function of two version numbers. Vite
is already the build tool, so the runner needs no new configuration file, and it is a development
dependency that ships nothing, so it does not touch D10. Proving a pure function through a browser is
slower, less precise, and needs a running backend and a seeded database.

**Why it is not taken here.** It adds a dependency to `frontend/package.json`, and the one criterion
this scope owes `the-design-system` is a statement of what ships in the bundle. A dependency decision
taken silently in a plan file is exactly the kind that is impossible to revisit later.

## The three by-hand tests are all in the last plan

**Decision.** The duplicate test, the gap test and the refresh test are all instructions in
[06](plans/06-prove-it-and-write-it-down.md), rather than each sitting in the plan that built the
thing it checks.

**Why.** All three need the whole system: the duplicate test needs an envelope with a version and a
[cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> that compares it, the gap test needs a transport that refetches into a cache, and the refresh
test needs all of it. Putting the duplicate test in the cache plan would mean running it before the
envelope carries a version, which proves that nothing arrived rather than that a duplicate was
ignored.

**What the earlier plans keep.** Each still has its own narrower manual check: reading a frame
([03](plans/03-put-the-envelope-on-the-wire.md)), watching the badge and the list agree
([04](plans/04-build-the-one-cache.md)), and breaking the socket once
([05](plans/05-one-transport-that-recovers.md)). Those are checks that the plan's own work landed,
not the scope's acceptance.

## `useNotifications` keeps its own socket until the transport plan

**Decision.** [04](plans/04-build-the-one-cache.md) rebuilds that file's state on the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> and
leaves its `new WebSocket` and its 5000ms reconnect alone.
[05](plans/05-one-transport-that-recovers.md) replaces all three sockets together.

**Why.** Replacing one socket while two others keep their own policies means writing a fourth policy
and then deleting it. The file's state and the file's socket are separable, and the state half is
what the cache plan is actually about.

## The runbook pair goes into the theme that already exists

**Decision.** Both recipes land under `runbook/driving-the-app/` rather than in a new theme folder.

**Why.** The runbook's themes are grouped by the kind of work being done, and watching a frame arrive
and forcing a reconnect are both things done while driving the app with it running. A new theme for
two recipes would be a folder created for one group of two, and the existing theme is where somebody
looking for them would look first.

## The subject lane was refined rather than extended

**Decision.** The five subject pieces stay at five. Piece 1's counter chip now names the two numbers
the pinned command answers, and the lane opens with one paragraph mapping each piece to the plan that
closes it.

**Why.** The lane's five pieces are each a picture of one thing that is wrong today, and the capstone
already draws the end state the six plans add up to. Adding a piece for the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> or the transport
would draw the capstone twice at lower resolution, and the map's own rule keeps a lane at six pieces
or fewer.

## The parent capstone was not amended, because it did not need to be

**Decision.** No change to [the parent's map](../../diagram-prompts.md).

**Why.** Its experience panel already holds three labelled component glyphs, one of them "one client
truth", from the amendment made when this scope was decomposed. A scope with no glyph in the parent
capstone amends it in the same commit; this scope has one, so there is nothing to amend. This was
checked by reading the capstone's prompt rather than assumed from the earlier decision record.

## No image was rendered, and no sibling scope's files were touched

**Decision.** All nine prompts in this scope's map stay `[planned]` and unrendered, and nothing under
`running-the-workers`, `getting-in`, `fixing-create-event` or `the-system-in-layers` was edited.

**Why.** Rendering unattended files images nobody compared against their faithfulness notes, which is
the same call the decomposition made and the same one the parent map makes. And the plans here point
at sibling scopes several times, in every case to read something rather than to change it, so no
sibling file needed an edit to keep a link honest.

## The empty-folder placeholder was removed

**Decision.** `plans/.gitkeep` is deleted now that the folder holds six files.

**Why.** It existed so git would track an otherwise empty directory. The two sibling scopes that have
plan files carry no such file, so removing it matches the convention rather than inventing one. It is
tracked by git, so the removal is recoverable.

## The plan set was committed, on `main`, as one unit

**Decision.** One commit carrying the six plan files, the process lane and its first snapshot, the
scope's Plans table, the parent's running order, and this record. Committed to `main` rather than to
a branch.

**Why one commit.** The six plan files, the lane that draws them as stages and the running-order rows
that sequence them are one statement. Split across commits, any one of them is a tree that disagrees
with itself: a lane drawing plans that are not there, or a running order pointing at files that do
not exist.

**Why `main` rather than a branch.** Every commit that built this plan tree is on `main`, this repo
has one author, and the parent map and the child map have to move together. A branch nobody merges
would leave the parent's running order and the child's plan files in two places, which is the exact
disagreement the single commit exists to prevent.

**What this does not include.** No rendered image, and no change to any sibling scope. Both were
declined for reasons recorded above, and neither is affected by the commit.
