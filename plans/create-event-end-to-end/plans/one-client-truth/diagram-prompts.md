# Diagram prompts: one client truth

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph, no new colour meaning and no new tier.

This map is the zoom-in on the client-truth glyph in
[the parent's subject capstone](../../diagram-prompts.md), one of the three component glyphs in the
experience panel. The parent capstone keeps it as a single glyph.

**Everything this scope draws is already in the parent's vocabulary**, which is why there is nothing
to add. The browser card, the person figure, the handler glyph, the worker gear, the queue tray and
the cylinder are the six glyphs it needs. Blue dashed already means an [HTTP request](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub>, purple dashed
already means a [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> push, orange dashed already means a queued or [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event, red already
means a confirmed defect, and the grey dashed hedge outline already means unconfirmed. The one thing
this scope is about, a client holding several copies of one fact, is drawn by repeating the browser
card, which needs no new vocabulary at all.

**A [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> is a cylinder in the browser tier.** No new glyph was invented for it. The parent's rule is
that each glyph appears only in its own tier, so a cylinder drawn among browser cards is a client
cache and a cylinder drawn in the data tier is the database, and the tier carries the meaning without
a label doing it.

**Two things not to confuse.** This file is the picture of the scope's own shape. The real-time
delivery path drawn for a reader of the system is a deliverable of `the-system-in-layers`, drawn in
the same direction and not from this file.

---

## Subject lane

Five pieces, each the picture of one thing that is wrong today, and each closed by a named plan.
[Piece 1](#piece-1-one-fact-many-copies-planned--not-rendered) is closed by
[the cache](plans/04-build-the-one-cache.md), which also closes
[piece 4](#piece-4-the-badge-and-the-list-planned--not-rendered).
[Piece 3](#piece-3-a-message-with-nothing-to-compare-planned--not-rendered) is closed by
[the envelope](plans/02-define-the-envelope.md) and
[the wire](plans/03-put-the-envelope-on-the-wire.md).
[Pieces 2](#piece-2-three-sockets-three-policies-planned--not-rendered) and
[5](#piece-5-the-gap-nobody-notices-planned--not-rendered) are closed by
[the transport](plans/05-one-transport-that-recovers.md). The capstone is the end state all six
plans add up to, and it is what
[the proving plan](plans/06-prove-it-and-write-it-down.md) checks the built system against.

### Piece 1: one fact, many copies `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-one-fact-many-copies.png`

**Visual thesis.** Nothing on the client owns remote state, so the same booking exists as several
independent copies that were correct at different moments and have no way to notice they disagree.

A single data-tier cylinder at the bottom holding one highlighted row, labelled as the one true
booking. Above it in the browser tier, four browser cards spread across the width, each holding its
own small copy of that row and each showing a different value in the same field. Four separate blue
dashed arrows run from the cylinder up to the four cards, never touching each other and never passing
through anything shared. Between the cards, the empty space where a shared cylinder would sit is
drawn as an empty framed slot in the decide colour, sized like a cylinder, with nothing in it. A
counter chip beside the fan of arrows carries the number of call sites and the number of files they
live in, which are the two numbers the pinned counting command answers: 144 across 40 of the 110
JavaScript files on 2026-08-23.

**Faithfulness note.** Four browser cards, four separate arrows, and no arrow touching another. The
empty frame between the cards must be visibly empty and must sit in the browser tier, not the data
tier. The four copies must show visibly different values in the same field, because identical copies
would draw a [caching](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> inefficiency rather than a correctness defect.

### Piece 2: three sockets, three policies `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-three-sockets-three-policies.png`

**Visual thesis.** Every component that wanted live updates built its own connection and its own rule
for what to do when it drops, so there are three answers to one question and none of them is written
down.

Three vertical lanes side by side at the same height, each holding one browser card with its own
purple dashed line running down to a single shared handler glyph at the bottom, so the three lines
converge only at the server. Each lane carries a small clock chip stating its own reconnect delay,
and the leftmost lane's chip is drawn crossed through in the defect colour with a red label reading
that it never reconnects. Across all three lanes at the same height, a horizontal band labelled with
the one thing none of them does, and no arrow of any kind crosses that band.

**Faithfulness note.** Three lanes at equal height, because they are three parallel implementations
and not a sequence. Exactly one shared handler glyph at the bottom. Three clock chips with three
different values, one crossed through. The band naming the shared omission must have no arrow
crossing it in either direction, since the point is that nothing does it.

### Piece 3: a message with nothing to compare `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-03-nothing-to-compare.png`

**Visual thesis.** The number that would let a client decide what to do with a message exists in the
database and stops at the [REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> boundary, so what arrives over the socket is prose for a person rather
than state for a cache.

Left to right across the tiers. A data-tier cylinder with four rows, each carrying a small version
chip with a number on it. Two arrows leave the cylinder. The upper one is blue dashed, runs to a
browser card, and carries a version chip along it, drawn intact. The lower one runs through a queue
tray and a worker gear as an orange dashed line, becomes a purple dashed line into a second browser
card, and carries an envelope glyph whose version chip slot is drawn as an empty outline. Beside the
lower arrow, the payload it actually carries is written out on a small card as a single identifier
field. At the receiving browser card, three outgoing branches are drawn as short stubs labelled
apply, ignore and refetch, all three greyed out, with one red chip over the fork reading that the
client cannot choose.

**Faithfulness note.** Both arrows leave the same cylinder. The version chip is present and filled on
the blue dashed arrow and present and empty on the purple dashed one; it must not be absent from the
purple arrow, because the claim is a slot nothing fills rather than a field nobody thought of. All
three stubs at the fork are greyed equally. The payload card shows one field only.

### Piece 4: the badge and the list `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-the-badge-and-the-list.png`

**Visual thesis.** One notification is drawn as two pieces of state that are updated by different
things, so the number and the list it is supposed to count disagree and nothing in the app can tell.

One browser card drawn large, holding two separate boxes: a small badge box showing a number, and a
list box showing rows. Three arrows arrive at the card and each reaches exactly one box. A purple
dashed arrow arrives from a worker gear and forks inside the card to both boxes, labelled with the
push. A blue dashed arrow arrives from a handler glyph carrying a clock chip with the poll interval
on it, and reaches the badge box only, with its path to the list box drawn as a short stub stopping
at a gap in the defect colour. Below the card, a small timeline strip shows the socket down for a
stretch, one event arriving during that stretch, and the socket back up. On the timeline's right-hand
end, the badge shows one number and the list shows one fewer row, with a red chip between them.

**Faithfulness note.** Two boxes inside one browser card, never two cards. The poll arrow reaches the
badge and stops short of the list, and the stub is in the defect colour. The final state shows the
badge number exceeding the list row count by exactly one, matching the single event on the timeline.

### Piece 5: the gap nobody notices `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-the-gap-nobody-notices.png`

**Visual thesis.** A socket that comes back carries on from the state it had when it died, so a
reconnect looks like a recovery and is not one.

A horizontal time bar running left to right across the image, divided into three stretches: connected,
disconnected, connected again. In the first stretch, a browser card with a purple dashed arrow
arriving and a version chip reading a low number. Across the disconnected stretch, three purple
dashed arrows are drawn arriving at nothing, ending at small crosses, each carrying a version chip
with a rising number. In the third stretch, the same browser card again with its version chip
unchanged from the first stretch, and a fresh purple dashed arrow arriving carrying a much higher
number. At the moment the socket returns, an empty framed slot in the decide colour sits above the
card, sized like a blue dashed arrow, labelled with the refetch that does not happen. The card's
displayed state is drawn in the defect colour.

**Faithfulness note.** Exactly three lost arrows across the middle stretch, each ending at a cross
rather than at the card. The card's version chip must read the same number before and after the gap.
The frame above the card at the reconnect must be empty, and no blue dashed arrow may appear anywhere
in the third stretch.

---

## Subject capstone

### The client-truth glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-client-truth-glyph-opened-up.png`

**Visual thesis.** One thing that holds what the server said, two ways in that both go through it,
and screens above that read it rather than each keeping their own answer.

Three levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One wide panel labelled for the wire, holding two paths that end at the same place. On
the left, a handler glyph with a blue dashed arrow rising out of it. On the right, a queue tray with
an orange dashed arrow into a worker gear and a purple dashed arrow rising out of that. Both arrows
carry an envelope glyph with three filled chips on it: what changed, which one, and its version. A
small chip on the panel edge states the delivery guarantee as at-least-once.

**Middle.** One cylinder in the browser tier, drawn centred and wide, receiving both arrows from
below. Three short outgoing stubs leave its right-hand side labelled apply, ignore and refetch, with
the refetch stub curving back down into the handler glyph in the bottom panel as a blue dashed arrow,
so the recovery route is visibly a request the client chose to make. Nothing else in the image
connects downward past this cylinder.

**Top.** One panel holding four browser cards side by side at the same height, because no screen waits
on another. Each card has one short arrow arriving from the cylinder below and holds no copy of its
own. One of the four is drawn with a badge box and a list box, both fed from the same single arrow.
No person figure touches any card.

**Faithfulness note.** Three levels, bottom to top. Every arrow entering the top panel originates at
the cylinder and nowhere else, because a single owner of remote state is the whole argument and one
card fetching past it would refute the picture. The envelope glyphs in the bottom panel have all
three chips filled, unlike piece 3 where one is empty. The refetch stub is the only line running
downward, and it is blue dashed. Nothing leaves the top edge.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

The same cast as the subject lane with the six plan files drawn over it: what runs when, and what
each gate actually checks. Sequence is carried by the numbered step badges, which are the parent's
running-order numbers 16 to 21, so the pinned reading axes hold unchanged. Upward is still
dependency, and two things side by side still means they can run at the same time.

History: `diagrams/process-versions/`. This lane is regenerated whole, never patched.

### Prompt 1 (Process): one page both sides were built from `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-01-one-page-both-sides-read.png`

**Visual thesis.** The server half and the client half are built at the same time by people who
never speak, and the only reason that works is that one page was written first and both of them read
it.

Three levels on the dominant vertical axis.

At the bottom, one panel carrying step badge 16. Inside it, a cylinder in the browser tier drawn as
an empty framed slot in the decide colour, a candidate row beneath it in muted grey with nothing
chosen, and a person figure at a terminal card to one side with a blue dashed arrow into the
candidate row, because the before-count in that row comes from a command run on this machine. A
counter chip on the panel edge carries the number of call sites and the number of files.

Above it, spanning the full width, one horizontal gate bar carrying step badge 17. The bar holds a
single document card with an envelope glyph on its face, and the envelope's three chips are drawn
filled. The bar is captioned with what must be true to cross it. Exactly one arrow enters the bar
from below.

Above the bar, two panels side by side at the same height, because neither waits on the other. The
left panel carries step badge 18 and holds a handler glyph and a worker gear, each with an arrow
rising out of it carrying the same filled envelope glyph, and a small cylinder in the data tier
beneath them with a version chip on one row. The right panel carries step badge 19 and holds one
wide cylinder in the browser tier with three short outgoing stubs labelled apply, ignore and
refetch, all three drawn solid rather than greyed, and a single browser card above it holding a
badge box and a list box both fed from one arrow.

**Faithfulness note.** The two upper panels are the same height and no arrow runs between them; that
separation is the claim. Both of them receive an arrow from the gate bar and from nothing else. The
envelope glyph in the gate bar and the envelope glyphs in the left panel have all three chips filled,
unlike subject piece 3 where one is empty. The cylinder at the bottom is an empty frame in the decide
colour and the cylinder at the top right is solid, because step 16 chooses and step 19 builds. No
purple dashed arrow reaches the right panel, since the transport is step 20 and drawing it here
claims the scope is finished a step early.

### Prompt 2 (Process): six plans, six gates `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-02-six-plans-six-gates.png`

**Visual thesis.** Every step here is closed by somebody checking something a test cannot, and four
of the six gates are a person at a screen rather than a suite going green.

Six stages on the dominant vertical axis, read bottom to top, each carrying its running-order step
badge and each closed on its upper edge by a gate bar holding one icon that names what it checks.
Steps 18 and 19 are drawn side by side at the same height; 16, 17, 20 and 21 stack singly.

Step 16, the decision: the empty framed cylinder and the candidate row, gate holding a signed sheet,
captioned that somebody else can build the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> from it without asking.

Step 17, the contract: a document card with a filled envelope glyph on its face and a small table
beside it showing three rows labelled apply, ignore and refetch. Gate holds the same document card,
captioned that two people on two sides can build from it without talking.

Step 18, the wire: a handler glyph and a worker gear with filled envelope glyphs rising out of both,
and a data-tier cylinder beneath carrying version chips. Gate holds a browser card with its
socket-frame panel open, captioned that the version was read in a frame rather than in a test.

Step 19, the cache: one wide browser-tier cylinder with four browser cards above it, each fed by one
short arrow and holding no copy of its own, and one of the four drawn with a badge box and a list box
sharing a single arrow. Gate holds a counter, captioned as a count taken before and the same command
run after.

Step 20, the transport: three browser cards feeding one purple dashed line down to one handler glyph,
with a single clock chip beside the line instead of three, and one blue dashed arrow curving back up
from the handler into the cylinder below the cards. Gate holds a cartoon figure at a browser card
with a network-off chip on it, captioned that somebody broke the socket on purpose and watched it
come back.

Step 21, the writing down: an open book with green solid arrows entering it, and beside it a document
card for the word this scope introduced. Gate holds the same open book with two answered question
marks on its facing page, captioned that both questions were answered from the recipe alone.

One thick route line runs upward through all six gates. Two thin arrows leave step 20 sideways into
step 21's book, because the recipe is written from what that step produced rather than from the plan.

**Faithfulness note.** All six gates are drawn at equal weight. Four of them carry a person or a
person's screen and only steps 17 and 19 carry an object and a number, which is the actual balance of
this scope. Steps 18 and 19 sit at the same height with no arrow between them. Step 20 has exactly
one purple dashed line and exactly one clock chip, since one policy replacing three is the whole
deliverable. The blue dashed arrow curving upward at step 20 is the only line in the image running
against the dominant axis, because the refetch is a request the client chose to make. Nothing leaves
the top edge.

### Process capstone: several copies of one fact, to one copy that catches up `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-capstone-many-copies-to-one-that-catches-up.png`

**Visual thesis.** The client held four answers and no way to tell which was right. What changes here
is not anything a person sees on a screen: it is that a message can be compared, a duplicate changes
nothing, and a dropped connection stops meaning a person has to press F5.

One journey read bottom to top.

At the bottom, outside any panel, four browser cards sit loose, each holding its own copy of the same
row with a different value in the same field, and a person figure beneath them at a browser card with
a refresh glyph in hand, captioned that today the person is the recovery mechanism. Four separate
blue dashed arrows run up to the four cards from a single data-tier cylinder, never touching each
other.

Above them, the six step stages drawn small and compressed, 16 and 17 stacked, 18 and 19 side by
side, 20 and 21 stacked, because they are the middle of the journey rather than its point.

At the top, one wide panel holding three things left to right. A handler glyph and a queue tray into
a worker gear, both sending filled envelope glyphs upward. One wide cylinder in the browser tier
receiving both, with three solid stubs labelled apply, ignore and refetch, and the refetch stub
curving back down into the handler glyph as a blue dashed arrow. Four browser cards above the
cylinder at the same height, each fed by one short arrow and holding no copy of its own, one of them
carrying a badge box and a list box on the same arrow. A small chip on the panel edge states the
delivery guarantee as at-least-once.

Beside the top panel, outside it, an open book receiving two green solid arrows, with two answered
question marks on its facing page, and a document card labelled for the word this scope defines.

**Faithfulness note.** The four browser cards at the bottom show visibly different values in the same
field and the four at the top show the same value, because that difference is the entire argument.
The person figure with the refresh glyph appears only at the bottom and must not appear anywhere
above it. Every arrow entering the top panel's browser cards originates at the cylinder and nowhere
else. The refetch stub is the only line running downward and it is blue dashed. The book sits outside
the panel and only receives arrows. Nothing leaves the top edge.

---

## What is outstanding

Nine prompts, none rendered: five subject pieces, the subject capstone, two process prompts and the
process capstone. No rendered image in `diagrams/` yet. The process lane's version 01 is stamped at
[the first process snapshot](diagrams/process-versions/01-2026-08-23.md), and the live lane above
always equals the newest snapshot there.
