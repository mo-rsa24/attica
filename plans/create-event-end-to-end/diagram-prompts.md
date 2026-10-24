# Diagram prompts: create event end to end

## Art direction

Inherited, not invented. The existing eleven-piece flow map at
`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md` already establishes the look,
and this scope adopts it so both sets read as one.

**Style.** Premium system-design infographic. Clean white or very light gray background. Glossy
semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms.
Flows drawn as vivid colour-coded dashed arrow lines, each colour meaning exactly one kind of flow,
with a small legend inside the image. Related components grouped inside rounded soft-tinted panels
with a short title on the panel. A bold title banner across the top. Official product logos only on
components that are that product; every other component gets a clean generic glyph. Small cartoon
figures for external actors. Clean sans-serif labels under every icon, short and lowercase-friendly.
Generous spacing, no clutter, no watermark.

**Meaning palette.** Blue dashed is an [HTTP request](../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>. Green solid is a database write. Orange dashed
is a queued or [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event. Purple dashed is a [WebSocket](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> push. Red is a confirmed defect. A grey
dashed hedge outline with an "unconfirmed live" tag marks anything not directly observed.

**Glyph vocabulary and tier.** Browser tier: a browser card, a person figure, a form row. Application
tier: a handler glyph, a worker gear, a queue tray. Data tier: a cylinder. External: a globe. Each
glyph appears only in its own tier.

**Reading axes.** The dominant axis is vertical: upward dependency, blockers at the bottom and
acceptance at the top. The secondary axis is horizontal, and it encodes only one thing: two lanes
side by side means those two can run at the same time.

These four are pinned at scope birth. Every child scope inherits them, and every later regeneration
of the process lane is compared against the snapshots before it.

---

## Subject lane

### Piece 1: the way in `[planned]`

**Visual thesis.** Five roles are gated on and two are ever granted, so most of the product is
unreachable.

Five person figures in the browser tier labelled organizer, artist, vendor, venue manager, ticket
buyer. Each has an arrow toward its own dashboard card. Two arrows are green and complete; three
end at a closed red gate labelled with the role constant nothing grants. Below, a data-tier cylinder
labelled `users_customuser` with a small table glyph showing nine seeded users carrying no role
chip at all. Every element hedged, since nothing here is built yet.

### Piece 2: four bookings, one concept `[planned]`

**Visual thesis.** Four live representations of the same idea, each with its own states and its own
notion of availability, and the most-used one is not the most complete one.

Four application-tier panels side by side, each containing a state-machine glyph with a different
number of states and its own small availability cylinder. A reference-count chip on each. One panel
carries a crown glyph labelled "most complete", a different panel carries a weight glyph labelled
"most used". A single question-mark glyph above them labelled "which survives" in the decide colour.

### Piece 3: what a request holds `[planned]`

**Visual thesis.** Two organizers can both be waiting on the same window, and the hold does not start
until someone accepts.

A horizontal time bar labelled 18:00 to 22:00, drawn three times in a vertical stack. Top bar: two
organizer figures each with a blue dashed arrow into it, the bar still coloured available, a red
chip reading "neither is told". Middle bar: one provider figure pressing accept, the bar turning to
hold colour with a countdown glyph labelled `hold_expires_at`. Bottom bar: a payment glyph, the bar
turning to booked. A side panel shows the policy field with its three values and an arrow indicating
which value chooses which behaviour.

### Piece 4: built and inert `[planned]`

**Visual thesis.** The machinery exists and nothing turns it.

An application-tier panel holding ten command glyphs in a row, all drawn in muted grey with no
outbound arrows. Beside them an [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> tray glyph, full, with an orange dashed arrow that stops at a
gap. In the browser tier, a socket glyph connected at the client end and open at the server end, with
a chip reading "subscribed, nothing publishes". A single missing gear glyph in the centre, drawn as
an outline, labelled with the one decision that starts all of it.

### Piece 5: the change that reaches a screen `[planned]`

**Visual thesis.** Persist first, push second, and a version on every message so a client can tell a
duplicate from a gap.

Left to right across three tiers: a command arrow into a handler, a green solid write into a
cylinder carrying two rows written in one transaction, one business row and one outbox row, then an
orange dashed arrow to a worker, then a purple dashed fan-out to two browser cards. Each browser card
carries a small version counter, one showing an applied increment and one showing a detected gap with
a refetch arrow looping back to the application tier.

---

## Subject capstone

### The whole scope in one picture `[built]`

Rendered to [diagrams/whole-scope-in-one-picture.png](diagrams/whole-scope-in-one-picture.png),
1024x1536, 2026-08-23. Reads correctly: the four panels stack, the gating label sits on the arrow
out of blockers, the two upper planes are drawn side by side at the same height with the band
between them, and the acceptance panel carries two browsers with the refresh crossed through.

Four things the rendered image gets wrong, all fixed in the prompt below and waiting on the next
render. The five domain glyphs came out unlabelled apart from "booking truth", so a reader cannot
tell contention from workers from availability from the journey; the prompt now names all five. The
arrows inside the domain panel point inward toward booking truth where the dependency runs outward
from it, which the prompt has always said. The deploy glyph in the alongside column came out
unlabelled; the prompt now labels it. And the experience panel is drawn as one undivided panel where
it holds three scopes; the prompt now names its three component glyphs, the way the domain panel
names its five.

**Visual thesis.** Nothing above the blockers is measurable until the blockers land, the domain plane
gates both other planes, and the two upper planes run side by side.

Four stacked rounded panels, bottom to top. The bottom panel, blockers, holds two glyphs: a test
suite card with a red cross and a login card with three closed gates. An upward arrow leaves it
carrying the label "nothing above is measurable until this is green". The panel above, domain, holds
five component glyphs, each carrying its own label under it: "booking truth", "contention and holds",
"the workers", "availability" and "the booking journey". The booking-truth glyph feeds the other
four. Above that, two panels drawn side by side at the same height, performance on the left and
experience on the right, both receiving an upward arrow from domain, with a horizontal band between
them labelled "these two run at the same time". The performance panel holds one scope, so the panel
is its glyph and carries no components inside it. The experience panel holds three, each drawn as its
own component glyph carrying its own label under it: "one client truth", "the event workspace" and
"the design system". The top panel, acceptance, holds two browser cards facing each other with a
purple dashed arrow between them and a refresh glyph crossed through.

To the right of the whole stack, outside the panels, two smaller glyphs on their own vertical line
labelled "alongside, from day one": a layers diagram glyph labelled "the system in layers", and a
deploy glyph labelled "getting it out".

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

Not authored yet, and what it waits on is not this scope's own plan files. Its stages are the
[running order](MASTER_PLAN.md#running-order), whose steps live in the sub-scopes rather than here,
so the lane draws the thirteen scopes with those steps laid over them. Four of the thirteen have plan
files and nine do not, so the table is going to grow by most of its eventual length, and this lane is
regenerated whole rather than patched. Authoring it now means drawing it again.

Nothing is waiting on it. Each sub-scope's map carries its own process lane over its own plans, and
[running the workers](plans/running-the-workers/diagram-prompts.md#process-lane) and
[fixing create event](plans/fixing-create-event/diagram-prompts.md#process-lane) already have one.

Each changed regeneration is stamped into `diagrams/process-versions/`.
