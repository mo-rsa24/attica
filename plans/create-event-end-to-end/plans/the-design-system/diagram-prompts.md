# Diagram prompts: the design system

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph, no new colour meaning and no new tier.

This map is the zoom-in on the design-system glyph in
[the parent's subject capstone](../../diagram-prompts.md), one of the three component glyphs in the
experience panel. The parent capstone keeps it as a single glyph.

**Everything this scope draws lives in the browser tier**, which is why it needs no addition. The
browser card, the person figure and the form row are the three glyphs it uses, and a user interface
component is browser-tier furniture: a card holding a form row. Panels, chips and labels are the
parent's own compositional elements rather than glyphs, so a colour chip, a counter chip and a
duration chip are the same device the parent capstone already uses for a reference count and the
same one the sibling maps use for a version and a clock.

**This scope draws almost no flow, and that is correct rather than a gap.** The meaning palette
assigns each colour to exactly one kind of flow: blue dashed is an [HTTP request](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>, green solid is a
database write, orange dashed is a queued event, purple dashed is a [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> push. Nothing in a
design system is any of those. So the coloured flow arrows are absent from every prompt here, and
what remains is what the parent capstone itself uses for structure: plain arrows, panels, bands and
labels. Using a flow colour for a build-time relationship would break the palette's one rule, which
is that a colour means one thing everywhere.

**Three parts of the palette do carry meaning here**, and they carry it unchanged. Red is a
confirmed defect, so the dead class names and the duplicated skeletons are red. The decide colour
marks the unmade decision, drawn as the parent's empty framed slot: a frame the size of the thing
that should be there, visibly empty. The grey dashed hedge outline with an "unconfirmed live" tag
marks anything not directly observed, and every count in this map came from a command run against
the repository rather than from a running app, so the counts themselves are stated plainly and the
screens they are drawn on are hedged.

**Two things not to confuse.** This file is the picture of the scope's own shape. Any picture of
Attica's runtime layers drawn for a reader of the system is a deliverable of `the-system-in-layers`,
drawn in the same direction and not from this file.

---

## Subject lane

Six pieces, each the picture of one thing that is true today, and each closed by a named plan.
[Piece 1](#piece-1-three-empty-rooms-planned--not-rendered) and
[piece 2](#piece-2-the-inventory-nobody-chose-planned--not-rendered) are closed by
[the stack decision](plans/01-measure-it-and-take-the-stack-decision.md), and piece 1 is filled in
by [the tokens](plans/02-name-the-colours-and-the-spacing.md),
[the type roles](plans/03-give-type-its-roles.md) and
[the duration bands](plans/04-say-what-moves-and-what-does-not.md).
[Pieces 3](#piece-3-one-button-sixty-four-times-planned--not-rendered) and
[4](#piece-4-the-same-skeleton-four-times-planned--not-rendered) are closed by
[the component layer](plans/05-the-components-that-own-the-styles.md).
[Piece 5](#piece-5-five-names-that-render-nothing-planned--not-rendered) is closed by
[the check](plans/07-prove-it-and-write-it-down.md).
[Piece 6](#piece-6-every-card-is-told-the-windows-width-planned--not-rendered) is closed by
[the container queries](plans/06-cards-that-answer-to-their-container.md). The capstone is the end
state all seven plans add up to, and it is what
[the proving plan](plans/07-prove-it-and-write-it-down.md) checks the built system against.

### Piece 1: three empty rooms `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-three-empty-rooms.png`

**Visual thesis.** Every place a style decision could be written down exists and all three of them
are empty, so every style in the app was chosen where it was typed.

Across the bottom of the browser tier, three empty framed slots in the decide colour, side by side
at the same height, each sized like a small panel and each visibly holding nothing. Each carries a
label naming the file it stands for and a short caption stating what is in it today: the Tailwind
config with an empty theme, the theme call with no argument, and the two stylesheets with no custom
property. Above them, filling the upper two thirds, eight browser cards scattered at different
heights, each holding a form row and each carrying its own small cluster of chips: a colour chip, a
size chip, a corner chip and a shadow chip, with every card's cluster visibly different from every
other card's. No arrow runs from any card down to any of the three slots. Along the top edge, a row
of counter chips carrying the four numbers: distinct colour utilities, colour families, hand-written
hex values, and the size-and-weight pairs.

**Faithfulness note.** The three slots must be at the same height and must be visibly empty frames
rather than panels containing a small amount. Not one arrow may connect a card to a slot; the
absence of that arrow is the entire claim. The eight cards must differ from each other in their
chips at a glance, because identical cards would draw a design system that exists and is undeclared,
which is a different and much smaller problem.

### Piece 2: the inventory nobody chose `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-the-inventory-nobody-chose.png`

**Visual thesis.** Two styling systems and ten libraries were each added by somebody solving one
problem, and no one has ever compared them, so the question of what this frontend is built on has
never been asked.

One wide panel in the browser tier holding a row of platform tiles, one per installed library, each
carrying its own product mark where it is that product and a clean generic glyph where it is not.
Under each tile, a counter chip giving the number of files that import it, sized so the two extremes
are obvious: one tile with a large count, several with counts in single figures, and two tiles drawn
in the defect colour with a count of zero and a red label reading that no file imports them. Above
the row, a single question-mark glyph in the decide colour labelled with the decision nobody has
taken, with plain arrows reaching down to every tile at once rather than to any one of them. Off to
one side, outside the panel, a small card showing three lines of code in the defect colour with a
red chip reading that they render nothing, and a label naming them as a class from the next major
version written into this one.

**Faithfulness note.** Every tile carries a file count and the counts must be visibly unequal. The
two zero-count tiles are in the defect colour. The question-mark glyph reaches every tile, not a
subset, because the decision is about the whole set. The three-line card sits outside the panel,
because it is evidence for the decision rather than one of the candidates.

### Piece 3: one button, sixty-four times `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-03-one-button-sixty-four-times.png`

**Visual thesis.** The same button was written from scratch in sixty-four files, so there is no
place where it is right and sixty-four places where it can be slightly wrong.

A dense grid of small browser cards filling most of the frame, each holding one form row with a
button in it, and every button visibly different from its neighbours in corner radius, padding,
weight and colour, while all of them plainly want to be the same button. Two counter chips at the
top: the number of button elements and the number of files they live in. In the centre of the grid,
one cell is not a card but an empty framed slot in the decide colour, sized like a single button and
labelled for the shared component that does not exist. Every card in the grid is drawn with no
connection to that slot.

**Faithfulness note.** The grid must read as one repeated thing rather than as a catalogue of
different things, so the buttons share a silhouette and differ in detail. The empty slot sits inside
the grid, not beside it. No arrows anywhere in this image.

### Piece 4: the same skeleton, four times `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-the-same-skeleton-four-times.png`

**Visual thesis.** The one loading state this app has was written three times inside three page
files, and the shared copy somebody wrote for everyone is the one nothing uses.

Three browser cards side by side at the same height, each labelled with its page file and each
containing a small skeleton card drawn identically to the other two: a wide bar, a circle, three
short bars. A short plain arrow inside each card runs from the page to its own copy, and each arrow
stays entirely inside its own card. Below and to one side, a fourth skeleton card of the same shape,
drawn in the defect colour, sitting alone with a red chip reading that no file imports it, and with
no arrow of any kind touching it. Along the bottom edge, a caption chip stating that this is the
whole of the loading state in the application.

**Faithfulness note.** All four skeletons are drawn identically, because their sameness is the
argument. The three arrows must each stay inside their own card and must not cross between cards.
The fourth skeleton has zero arrows touching it and is the only element in the defect colour.

### Piece 5: five names that render nothing `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-five-names-that-render-nothing.png`

**Visual thesis.** A style somebody invented and a style somebody misspelled look the same from the
outside, so five class names have been sitting in the tree producing no effect and nothing has ever
said so.

Five browser cards in a row at the same height, each labelled with the file and line it comes from
and each holding a form row with a class name written on it in the defect colour. From each card, a
plain arrow points right to a small result panel showing what actually renders, and all five result
panels show the plain unstyled element, drawn identically. Below the row, spanning its full width, a
horizontal band labelled for the check that would have caught them, drawn as an empty framed slot in
the decide colour running the length of the band, with nothing inside it. No arrow crosses that
band in either direction.

**Faithfulness note.** All five result panels are drawn identically and none of them shows any
effect, because the claim is that nothing happened rather than that something wrong happened. The
band beneath must be an empty frame in the decide colour, not a panel with contents, and nothing may
cross it, since the point is that no check runs.

### Piece 6: every card is told the window's width `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-06-every-card-is-told-the-windows-width.png`

**Visual thesis.** Layout in this app is decided by how wide the window is, and fifteen files put
things into narrow drawers and sidebars where the window's width is the wrong question.

One browser card drawn large, filling the frame, with a ruler running across its full top edge
labelled for the viewport and carrying four breakpoint marks with a counter chip on each giving how
many times that breakpoint is used. Inside the card, two regions. On the left, a wide open grid
holding three identical provider cards laid out comfortably, each with a plain arrow reaching up to
the ruler. On the right, a narrow drawer panel holding the same provider card, cramped and
overflowing its edges, drawn in the defect colour, with its own plain arrow reaching up to the same
ruler. Between the drawer and the ruler, an empty framed slot in the decide colour sized like a
short ruler of its own, labelled for the container the card should be measuring instead. A counter
chip beside the drawer states how many files render into a drawer, a sidebar or an aside, beside a
second chip reading zero for container queries.

**Faithfulness note.** Both the grid card and the drawer card reach the same viewport ruler; that
shared arrow is the defect. The drawer card is visibly the same component as the grid cards and
visibly does not fit. The short empty ruler above the drawer must be empty and in the decide colour.

---

## Subject capstone

### The design-system glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-design-system-glyph-opened-up.png`

**Visual thesis.** Three named vocabularies at the bottom, a component layer that is the only thing
allowed to read them, and pages above that arrange components and choose nothing.

Three levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One wide panel labelled for the named decisions, holding three groups side by side at
the same height. The left group is a strip of colour chips, each with a name label under it reading
as a job rather than as a hue, beside a short column of spacing chips, corner chips and shadow
chips, all named. The middle group is a short stack of type rows, each drawn at its own size and
weight with a role name beside it. The right group is a row of duration chips with band names on
them, and beneath them a small list card headed for what does not animate. A chip on the panel edge
names the file all three live in, and the fact that there is one.

**Middle.** One panel holding a row of browser-tier cards, each holding one form row, drawn as the
shared components: a button, a card, a skeleton, a status row with words on it rather than a bare
spinner. Every one of them receives a plain arrow from the panel below. Each component card carries
small chips that visibly match chips from the bottom panel rather than chips of their own.

**Top.** One panel holding four browser cards side by side at the same height, each an arrangement
of the components from the middle panel and each carrying no chip of its own. One of the four is
drawn as a narrow drawer, and the component inside it is laid out for the drawer rather than
overflowing, with a short ruler across the drawer's own top edge rather than the window's. Every
arrow entering this panel originates in the middle panel.

To the right of the whole stack, outside the panels, two things on their own vertical line. An open
book receiving plain arrows from all three levels, with two answered questions on its facing page.
Beneath it, a gate glyph on the edge of the stack with a person figure at it, labelled for the check
that fails on a hand-written colour and on a name that matches no rule.

**Faithfulness note.** Three levels, bottom to top. No card in the top panel carries a chip of its
own, and no arrow reaches the top panel from anywhere but the middle panel: a page that styles
itself would refute the whole picture. The chips in the middle panel visibly match chips in the
bottom panel. The drawer in the top panel has its own ruler and the window's ruler appears nowhere.
Nothing is in the defect colour and no empty framed slot appears anywhere, because this is the end
state. Nothing leaves the top edge.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

The same cast as the subject lane with the seven plan files drawn over it: what runs when, and what
each gate actually checks. Sequence is carried by the numbered step badges, which are the parent's
running-order numbers 22 to 28, so the pinned reading axes hold unchanged. Upward is still
dependency, and two things side by side still means they can run at the same time.

History: `diagrams/process-versions/`. This lane is regenerated whole, never patched.

### Prompt 1 (Process): one decision, then three vocabularies at once `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-01-one-decision-then-three-at-once.png`

**Visual thesis.** One decision has to be taken before anything can be written down, and then the
three vocabularies are three separate pieces of work by three separate people who never need to
speak.

Three levels on the dominant vertical axis.

At the bottom, one panel carrying step badge 22. Inside it, the row of platform tiles from subject
piece 2 with their file counts, a question-mark glyph in the decide colour above them, and a person
figure at a terminal card to one side with a plain arrow into a counter strip, because every
before-number in that strip comes from a command run on this machine. The counter strip carries all
eight numbers as separate chips.

Above it, spanning the full width, one horizontal gate bar. The bar holds a single document card
with a signature line on its face and a chip reading which system won, and it is captioned with what
must be true to cross it: that a losing candidate can be named along with the reason it lost.
Exactly one arrow enters the bar from below.

Above the bar, three panels side by side at the same height, because none of them waits on either
other. The left panel carries step badge 23 and holds the strip of named colour chips with spacing,
corner and shadow chips beside them. The middle panel carries step badge 24 and holds the stack of
type rows with role names. The right panel carries step badge 25 and holds the row of named duration
chips with the what-does-not-animate list card beneath them. Each of the three receives its own
arrow from the gate bar and no arrow runs between them.

**Faithfulness note.** The three upper panels are the same height and no arrow runs between them;
that separation is the claim. All three receive an arrow from the gate bar and from nothing else.
The question-mark glyph appears only in the bottom panel and must not appear above the gate bar,
because the decision is taken there and stays taken. Nothing above the gate bar is in the decide
colour.

### Prompt 2 (Process): seven plans, seven gates `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-02-seven-plans-seven-gates.png`

**Visual thesis.** Four of the seven gates here are a person looking at a real screen, because most
of what this scope claims is a thing you can see and cannot assert.

Seven stages on the dominant vertical axis, read bottom to top, each carrying its running-order step
badge and each closed on its upper edge by a gate bar holding one icon that names what it checks.
Steps 23, 24 and 25 are drawn side by side at the same height; 22, 26, 27 and 28 stack singly.

Step 22, the decision: the platform tiles with their counts, the counter strip, and the
question-mark glyph. Gate holds a signed sheet, captioned that every loser has its paragraph.

Step 23, the tokens: the strip of named colour chips beside spacing, corner and shadow chips, with a
mapping card next to it showing counted values on the left and names on the right. Gate holds a
counter, captioned as the count of hand-written colours taken with the same command as before.

Step 24, the type roles: the stack of type rows at their own sizes and weights with role names. Gate
holds a person figure at a browser card, captioned that two things meaning the same now look the
same.

Step 25, the motion language: the row of named duration chips, the what-does-not-animate list card,
and a single reduced-motion chip where three partial ones were. Gate holds a person figure at a
browser card with a reduced-motion chip on it, captioned that the ambient movement stopped.

Step 26, the components: the row of browser-tier component cards from the capstone's middle panel,
each carrying chips that match the panels below, and one skeleton card where four stood. Gate holds
a person figure at a browser card with a stopwatch chip, captioned as one card built from the files
alone.

Step 27, the container: the large browser card from subject piece 6 with its drawer now carrying its
own short ruler, and the window's ruler reaching only the open grid. Gate holds a person figure
dragging a window edge, captioned that the drawer's card did not change when the window did.

Step 28, the writing down: an open book with plain arrows entering it, a gate glyph beside it with a
person figure at it, and a small card for the two questions the recipes answer. Gate holds the same
open book with two answered questions on its facing page, captioned that both were answered from the
recipe alone.

One thick route line runs upward through all seven gates. Two thin arrows leave steps 26 and 27
sideways into step 28's book, because the recipes are written from what those steps produced rather
than from the plan.

**Faithfulness note.** All seven gates are drawn at equal weight. Five of them carry a person or a
person's screen and only steps 22 and 23 carry an object and a number, which is the actual balance
of this scope. Steps 23, 24 and 25 sit at the same height with no arrow between them. Step 26 shows
exactly one skeleton card, since four becoming one is its visible deliverable. Nothing leaves the
top edge.

### Process capstone: from chosen where it was typed, to asked for by name `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-capstone-typed-to-asked-for-by-name.png`

**Visual thesis.** The interface looked the way it looked because of who wrote which file on which
day. What changes here is not any single screen: it is that a style becomes something you ask for
and something that can be got wrong out loud.

One journey read bottom to top.

At the bottom, outside any panel, the dense grid of small browser cards from subject piece 3, each
holding a form row with a visibly different button, and beneath them three empty framed slots in the
decide colour side by side. A person figure sits beside the grid at a browser card with a magnifying
glass, captioned that today the only way to find out what a colour means is to search every file. A
counter strip runs along the bottom edge carrying the eight before-numbers as chips.

Above them, the seven step stages drawn small and compressed, 22 alone, then 23, 24 and 25 side by
side, then 26, 27 and 28 stacked, because they are the middle of the journey rather than its point.

At the top, one wide panel holding three levels in miniature, exactly as the subject capstone
arranges them: the strip of named chips and type rows and duration chips at the bottom of the panel,
the row of shared component cards above it drawing its chips from below, and four page cards above
that carrying no chips of their own, one of them a drawer with its own ruler. A counter strip on the
panel edge carries the same eight numbers as the bottom of the image, with different values.

Beside the top panel, outside it, an open book receiving two plain arrows with two answered
questions on its facing page, and a gate glyph with a person figure at it, labelled for the check
that fails on a hand-written colour.

**Faithfulness note.** The buttons at the bottom are visibly different from each other and the
component cards at the top are visibly one thing, because that difference is the entire argument.
The counter strip appears at both the bottom and the top with the same eight labels and different
values, so the change is readable as a measurement rather than as a mood. The person figure with the
magnifying glass appears only at the bottom and must not appear anywhere above it. The empty framed
slots appear only at the bottom. The book and the gate sit outside the panel and only receive
arrows. Nothing leaves the top edge.

---

## What is outstanding

Ten prompts, none rendered: six subject pieces, the subject capstone, two process prompts and the
process capstone. No rendered image in `diagrams/` yet. The process lane's version 01 is stamped at
[the first process snapshot](diagrams/process-versions/01-2026-08-23.md), and the live lane above
always equals the newest snapshot there.
