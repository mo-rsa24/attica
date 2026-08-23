# Diagram prompts: the system in layers

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph and no new colour meaning.

This map is the zoom-in on the layers glyph in the parent's subject capstone, the one standing in the
"alongside, from day one" column. The parent capstone keeps it as a single glyph.

**What this scope draws is documents, so it draws document glyphs**, the way the parent capstone
already carries a layers glyph and a deploy glyph and the parent's subject piece 4 carries command
glyphs. A document glyph belongs to no tier and sits wherever the tier it describes sits. That is the
one thing worth saying, and it is a use of the parent's vocabulary rather than an addition to it.

**Two things not to confuse.** This file is the picture of the scope's own shape. The nine system
diagrams the scope produces are its deliverables and live in
[the environment folder](../../../../environment/) and in `artifacts/figures/`, drawn in the same
direction but not from this file.

---

## Subject lane

### Piece 1: the file with no picture `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-the-file-with-no-picture.png`

**Visual thesis.** The one document a session is told to read cold describes a four-process,
three-path, two-database system entirely in paragraphs.

A single large document glyph in the centre, labelled `overview.md`, its body drawn as ruled lines of
text with no image block anywhere in it. Radiating from it, six small unlabelled outline glyphs in
the tiers they belong to (three browser-tier cards, a worker gear, a queue tray, a cylinder), each
connected to the document by a thin grey line and each drawn as an empty outline rather than a
finished glossy icon, because the document names them and shows none of them. Bottom right, a small
index-document glyph labelled `00-INDEX.md` with one visible row reading "Pictures: none yet".

**Faithfulness note.** The document glyph carries no image block. Every component glyph is an empty
outline, not a finished icon. The index row reads exactly "Pictures: none yet".

### Piece 2: one concept, four state machines `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-one-concept-four-machines.png`

**Visual thesis.** The booking state machine cannot be drawn as one page while four of them are live,
and drawing all four is what makes the choice between them decidable.

Four application-tier panels in a row, at the same height because they can all be drawn at the same
time. Each holds a state-machine glyph with a visibly different number of states, and each carries
two chips: a state count and a reference count. Above the row, a single question-mark glyph in the
decide colour labelled "which survives", with a grey dashed hedge outline around the whole row and an
"unconfirmed live" tag, because no answer exists. To the right, outside the row, one empty framed
slot labelled with the scope that owes the surviving machine.

**Faithfulness note.** Four panels, not one and not three. The four state counts differ visibly. The
question-mark glyph carries no answer. The frame to the right is empty.

### Piece 3: two answers to when a hold starts `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-03-two-answers-one-hold.png`

**Visual thesis.** The code answers the contention question one way, a review answers it the other,
and the drawing says which is which rather than picking.

One horizontal time bar drawn twice, stacked. The lower bar is solid and labelled "what the code
does": two organizer figures with blue dashed arrows into it, the bar still coloured available, then
a provider figure accepting and the bar turning to hold colour. The upper bar carries the grey dashed
hedge outline and the "unconfirmed live" tag, labelled "what a review proposes": the first blue
dashed arrow turns the bar to hold colour immediately and the second is refused. Between the two
bars, in the decide colour, the policy field with its three values and no arrow chosen.

**Faithfulness note.** The lower bar is solid, the upper is hedged, and the labels say which is which.
No arrow is drawn from the policy field to either bar.

### Piece 4: every happy path without its failure `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-the-missing-half.png`

**Visual thesis.** Every diagram this repo has draws the path that works, and the half that is missing
is the half that wakes someone up.

Two columns of small document glyphs, side by side. The left column is filled, each glyph a finished
diagram page with a green tick chip. The right column has the same number of slots, each an empty
dashed frame with a red cross chip, and the column is titled with what belongs there. One horizontal
line pairs each filled page with its empty frame, so the pairing reads as one-to-one rather than as
two unrelated stacks.

**Faithfulness note.** Both columns hold the same number of slots. Every left glyph is finished, every
right frame is empty, and the pairing lines run straight across.

### Piece 5: the same diagram planned twice `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-planned-twice.png`

**Visual thesis.** Four diagrams are written as briefs in one scope and listed again in this one, and
the cheapest moment to notice is before either draws them.

Two plan-document glyphs facing each other, one labelled with the onboarding plan and one with this
scope. Four brief-glyphs sit between them, each connected to both documents by a thin line, so each
brief visibly has two owners. A single ownership chip is drawn on the line running to this scope's
document and not on the other, showing which way the reconciliation goes.

**Faithfulness note.** Exactly four briefs. Each connects to both documents. Exactly one ownership
chip, on this scope's side.

### Piece 6: the socket that carries one path and not the other `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-06-one-path-and-not-the-other.png`

**Visual thesis.** A change made in chat reaches the other person's screen and a change made to a
booking stops at a database row, and the two paths look identical until you follow them to the end.

Two horizontal tracks, one above the other, sharing a start and not an end. The upper track: a
handler glyph, a green solid write into a cylinder, then a purple dashed arrow reaching a browser
card. The lower track: a handler glyph, a green solid write into the same cylinder, an orange dashed
arrow to a worker gear, then a second green solid write into the cylinder and nothing after it. The
browser card at the end of the upper track is repeated at the end of the lower track as an empty
outline with no arrow arriving. One chip on the lower track names the function where it stops.

**Faithfulness note.** Both tracks start at the same shape. Exactly one purple dashed arrow in the
image, on the upper track. The lower track's browser card has no arrow arriving and is drawn as an
outline. The chip names a function, not a file.

---

## Subject capstone

### The layers glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-layers-glyph-opened-up.png`

**Visual thesis.** One map of the whole underneath, nine diagrams above it, and three of the nine
drawn hedged because nobody has decided what they show yet.

Three levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One wide panel holding the layers map itself: the browser tier with two separate HTTP
arrows leaving it, one through a proxy glyph and one straight past it, a purple dashed websocket
arrow beside them, the application tier with four process glyphs of which one is drawn as an outline
and tagged with what its absence costs, and the data tier with one cylinder and one Redis glyph split
into two labelled compartments. Nothing sits below this panel, because nothing this scope draws
depends on less than it.

**Middle.** Two lanes side by side at the same height, because they can be drawn at the same time.
The left lane holds five finished document glyphs: the four briefs that already exist, plus the
delivery-path document, drawn with the two unequal tracks of piece 6 visible inside it. The right
lane holds their failure twins as the same five shapes with a red cross chip. An upward arrow runs
from the layers panel into both lanes.

**Top.** Three document glyphs, all carrying the grey dashed hedge outline and an "unconfirmed live"
tag: the four-way state machine, the two-bar hold, the convergence projection. Each has one short
arrow leaving it sideways to a small scope glyph labelled with the scope that owes its target
version. No arrow leaves the top of the image, because the target versions are not this scope's to
draw.

**Faithfulness note.** Three levels, bottom to top. The bottom panel shows two HTTP arrows and a
split Redis glyph. The middle is two lanes of five at the same height. All three top glyphs are
hedged and each has exactly one sideways arrow. Nothing leaves the top edge.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

Version 01. Authored from the four plan files in running order. Its gates and failure branches come
from each plan's engagement gate and its ❌ branches; nothing here is invented.

### Version 01: the scope as four stages `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-01-four-stages.png`

**Visual thesis.** Read it, draw it, brief it, render it, and the one check that can send you back
to the first stage.

The same cast as the subject lane, drawn under operation, left to right along the dominant axis with
numbered badges on each stage.

**Stage 1, read.** A person figure at a code-tier panel with the six model glyphs of the subject
lane's piece 2 fanned in front of them, and a green solid arrow into a findings-document glyph.
Beside it, a browser card with DevTools open on a websocket row, because this stage ends in the
browser rather than in the editor. Gate chip beneath: "someone can write a brief from this file
without opening a source file".

**Stage 2, draw the layers map.** The `overview.md` document glyph from piece 1, now with an image
block in it drawn as an empty frame, and a prompt-document glyph feeding that frame. Gate chip:
"a stranger can paste one prompt and get a picture that would not mislead them". Failure branch
drawn downward in red: "a claim in the prompt does not match what you just watched", looping back
into stage 1's findings document rather than into stage 2, because the fix is a fact and not a
drawing.

**Stage 3, brief the other eight.** Eight brief-glyphs in two groups of four, the left group carrying
the ownership chip from piece 5 and the right group carrying the hedge outline on three of its
members. Gate chip: "none of them answers a question that belongs to another scope".

**Stage 4, render and check.** A ChatGPT glyph with nine images fanning out of it into a folder tray,
and two recipe-document glyphs leaving the tray toward the runbook tray. Gate chip: "each was checked
before it was filed, and the next person can make another one without asking anybody".

**The trap, drawn once and prominently.** A loop on stage 4 labelled "regenerate", with a crossed-out
branch beside it labelled "file it and explain the gap in a caption" leading to a dead end chip
reading "the caption does not travel with the picture". This is the failure most likely to quietly
pass, so it is drawn at full size rather than as a footnote.

**One backward arrow.** From stage 3's neutrality check back to stage 1, labelled "the brief leaked a
preference", because that branch reopens what was established rather than how it was drawn.

**Faithfulness note.** Four numbered stages left to right. Every stage carries exactly one gate chip.
The stage 2 failure branch lands in stage 1's findings document, not in stage 2. The regenerate loop
sits on stage 4 and its crossed-out alternative ends in a dead end. Exactly one backward arrow in the
image.

### Process capstone `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-capstone-four-stages.png`

**Visual thesis.** Four stages, four gates, one trap, and the one loop that goes all the way back.

Metro-journey shaped: a single line left to right with four numbered stations, each station carrying
its gate chip below the line. The regenerate loop sits above the line at station 4 and returns to it.
The leaked-a-preference loop runs above the line from station 3 back to station 1. The
caption-around-it branch leaves the line at station 4 and terminates in a buffer. Nothing else
crosses the line.

**Faithfulness note.** Four stations, four gate chips. Two loops above the line and one buffer below.
The station-3 loop reaches station 1 and not station 2.

---

## What is outstanding

Nine prompts, none rendered: six subject pieces, the subject capstone, the process lane and the
process capstone. Nothing in `diagrams/` yet.
