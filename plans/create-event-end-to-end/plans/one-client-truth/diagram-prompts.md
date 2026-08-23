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
the cylinder are the six glyphs it needs. Blue dashed already means an HTTP request, purple dashed
already means a WebSocket push, orange dashed already means a queued or outbox event, red already
means a confirmed defect, and the grey dashed hedge outline already means unconfirmed. The one thing
this scope is about, a client holding several copies of one fact, is drawn by repeating the browser
card, which needs no new vocabulary at all.

**A cache is a cylinder in the browser tier.** No new glyph was invented for it. The parent's rule is
that each glyph appears only in its own tier, so a cylinder drawn among browser cards is a client
cache and a cylinder drawn in the data tier is the database, and the tier carries the meaning without
a label doing it.

**Two things not to confuse.** This file is the picture of the scope's own shape. The real-time
delivery path drawn for a reader of the system is a deliverable of `the-system-in-layers`, drawn in
the same direction and not from this file.

---

## Subject lane

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
live in.

**Faithfulness note.** Four browser cards, four separate arrows, and no arrow touching another. The
empty frame between the cards must be visibly empty and must sit in the browser tier, not the data
tier. The four copies must show visibly different values in the same field, because identical copies
would draw a caching inefficiency rather than a correctness defect.

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
database and stops at the REST boundary, so what arrives over the socket is prose for a person rather
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

Not authored yet, and what it waits on is this scope's own plan files, which do not exist. Its stages
are those plans, and drawing them now would mean inventing the work breakdown that `populate-plans`
owns. Nothing is waiting on it.

When it is authored, each changed regeneration is stamped into `diagrams/process-versions/`, and the
live lane always equals the newest snapshot there.

---

## What is outstanding

Six prompts, none rendered: five subject pieces and the subject capstone. Nothing in `diagrams/`
yet, and no process lane.
