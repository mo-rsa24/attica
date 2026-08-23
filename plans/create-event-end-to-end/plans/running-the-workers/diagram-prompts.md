# Diagram prompts: running the workers

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph, no new colour meaning and no new tier.

This map is the zoom-in on the workers glyph in [the parent's subject capstone](../../diagram-prompts.md),
one of the five component glyphs in the domain panel. The parent capstone keeps it as a single
glyph.

**Everything this scope draws is already in the parent's vocabulary**, which is why there is nothing
to add. The worker gear, the queue tray, the cylinder and the browser card are the four glyphs it
needs, orange dashed already means a queued or outbox event and purple dashed already means a
WebSocket push, and the one thing this scope is about is where an orange dashed arrow fails to
become a purple dashed one.

**Two things not to confuse.** This file is the picture of the scope's own shape. The delivery-path
and contention diagrams that describe the same machinery for a reader of the system are deliverables
of `the-system-in-layers`, drawn in the same direction and not from this file.

---

## Subject lane

### Piece 1: ten commands and nothing that starts them `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-nothing-starts-them.png`

**Visual thesis.** Every piece of recurring work exists as a command somebody has to remember, and
the thing that would remember is not in the picture because it is not in the repository.

An application-tier panel holding ten command glyphs in two rows: seven drawn in muted grey with no
inbound arrow at all, and three drawn the same way but grouped inside a small sub-panel titled with
what they are for, so they read as deliberately outside the group rather than forgotten with it.
Above the panel, centred, one worker gear drawn as an empty outline with a question-mark glyph on
it in the decide colour, and no arrow leaving it. To the left, outside everything, a small person
figure at a terminal card with ten short blue dashed arrows leaving it, one to each command, because
today the person is the scheduler.

**Faithfulness note.** Ten command glyphs, seven loose and three inside their own sub-panel. The gear
above them is an outline with no arrow leaving it. Every arrow in the image starts at the person
figure. Nothing is coloured as running.

### Piece 2: the command named for a job it does not do `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-named-for-a-job-it-does-not-do.png`

**Visual thesis.** Two commands with different names run the same code, so the job one of them is
named after is done by nothing, and the field it would have swept is swept only by whoever happens
to read it.

Two command glyphs side by side, each labelled with its own name, each with an arrow into the *same*
service glyph below them, and a red chip on the pair reading that they are identical. To the right,
separated by a gap, a cylinder with one field row highlighted and no arrow arriving at it from
either command. Below that cylinder, a browser card with a blue dashed arrow leaving it into the
field row, labelled to show that a read is what notices, and a purple dashed arrow drawn as a stub
that stops at a gap before reaching the browser card, marked with the red defect colour, because
nobody is told.

**Faithfulness note.** Both command glyphs point at one service glyph. The cylinder's highlighted
field has exactly one arrow arriving and it comes from the browser card, not from a command. The
purple dashed stub stops short of the browser card and is drawn in the defect colour.

### Piece 3: two writers, one socket `[planned]` ⏳ not rendered

**Visual thesis.** Two pieces of code write the same notification row and only one of them tells
anybody, and the one that stays silent is the one on the path the whole booking journey uses.

**Save as:** `diagrams/subject-03-two-writers-one-socket.png`

Two horizontal tracks, one above the other, sharing an end and not a start. The upper track begins at
a handler glyph, runs a green solid write into a cylinder, and continues as a purple dashed arrow
into a browser card. The lower track begins at a queue tray, runs an orange dashed arrow into a
worker gear, a green solid write into the *same* cylinder, and then nothing: the browser card at its
end is repeated as an empty outline with no arrow arriving. Between the two tracks, one shared
group glyph both purple dashed arrows would use, connected to the upper track only. A chip on each
track names the function that writes the row.

**Faithfulness note.** Both tracks write into one cylinder, drawn once. Exactly one purple dashed
arrow in the image, on the upper track. The lower track's browser card is an outline with no arrow
arriving. The shared group glyph has one connection, not two.

### Piece 4: the state you cannot leave `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-the-state-you-cannot-leave.png`

**Visual thesis.** The worker claims an event before doing the work, and the claim is what survives
if the worker does not.

A queue tray on the left holding five event rows. A worker gear beside it with a circular arrow
showing a claim, and one event row lifted out of the tray into a small holding pen labelled with the
claimed state. The gear is drawn cracked and greyed, with a red chip reading that the process died.
Below, the selection the next cycle makes: a bracket around the tray covering four of the five rows
and visibly excluding the one in the holding pen, with the two states it does cover named on the
bracket. No arrow leaves the holding pen in any direction. To the right, an empty framed slot in the
decide colour, sized like a gear, labelled with what does not exist yet.

**Faithfulness note.** Five event rows. Exactly one sits in the holding pen and has no arrow leaving
it. The bracket visibly covers four rows and excludes the fifth. The frame to the right is empty.

### Piece 5: one clock, three cadences, and the one still open `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-one-clock-three-cadences.png`

**Visual thesis.** Three jobs that look like three problems are one problem with three intervals, and
a fourth interval is waiting on a decision this scope does not take.

One large gear glyph in the centre in the decide colour, drawn as an outline with a question mark,
labelled with the decision it stands for. Three orange dashed arrows leave it to the right, each
ending at a job glyph with an interval chip on it. A fourth arrow leaves the same gear, drawn with
the grey dashed hedge outline and an "unconfirmed live" tag, ending at an empty job frame with an
empty interval chip and a label naming the sibling scope that owes it. Below the gear, a row of
candidate glyphs in muted grey with no arrow chosen between any of them and the gear, so the
drawing visibly declines to answer.

**Faithfulness note.** Four arrows leave the gear: three solid-ended at filled jobs, one hedged at an
empty frame. The candidate row below has no arrow connecting it to the gear. Every interval chip on
the three filled jobs carries a number; the fourth is empty.

---

## Subject capstone

### The workers glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-workers-glyph-opened-up.png`

**Visual thesis.** One thing that runs at the bottom, the jobs it runs above it side by side because
they do not wait on each other, and the delivery at the top that is the only place a person finds
out any of it happened.

Three levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One wide panel holding the runner: a single gear glyph, currently drawn in the decide
colour as an outline with a question mark on it, sitting on a platform labelled with what it must do
(start it, restart it when it dies, run it on a clock). Beside the gear inside the same panel, a
small candidate row in muted grey with nothing chosen. Nothing sits below this panel, because
nothing this scope builds depends on less than it.

**Middle.** Three lanes side by side at the same height, because the three jobs do not wait on each
other. Left lane: a queue tray with an orange dashed arrow into a worker gear, and a reaper glyph
drawn as a second small gear returning one row from a holding pen back into the tray. Middle lane:
two expiry job glyphs, one carrying a green tick and one carrying a red defect chip, with the second
paired to a cylinder field that has no arrow arriving. Right lane: a materialisation job glyph
feeding a cylinder of slot rows, drawn with the grey dashed hedge outline because the scope that owns
what a slot means is a different one. An upward arrow runs from the runner panel into all three
lanes.

**Top.** One panel holding two browser cards facing each other with a single purple dashed arrow
between them, and a small group glyph in the middle that both connect to. One green solid arrow
arrives at this panel from the left lane below. A short red chip sits on the panel edge naming the
one place today's code stops, drawn crossed through, because closing it is what this scope is for.

**Faithfulness note.** Three levels, bottom to top. The bottom gear is an outline in the decide
colour with nothing chosen beside it. The middle is three lanes at the same height, and the hedged
lane is the rightmost. The top panel has exactly one purple dashed arrow and its red chip is crossed
through. Nothing leaves the top edge.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

Not authored yet. `populate-plans` writes it once this scope has plan files, and each changed
regeneration is stamped into `diagrams/process-versions/`.

---

## What is outstanding

Six prompts, none rendered: five subject pieces and the subject capstone. The process lane and its
capstone do not exist yet, because this scope has no plan files. Nothing in `diagrams/` yet.
