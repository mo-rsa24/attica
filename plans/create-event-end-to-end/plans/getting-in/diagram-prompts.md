# Diagram prompts: getting in

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope adds no
new glyphs: every component it draws already has one there.

This map is the zoom-in on the parent's subject piece 1, "the way in". The parent capstone keeps
that as a single glyph.

---

## Subject lane

### Piece 1: five gates, two keys `[planned]`

**Visual thesis.** The code checks five roles and the seeds hand out two, so three gates have no key
cut for them.

Browser tier: five person figures in a row, each with an arrow toward its own dashboard card. The
organizer and artist arrows are green and complete. The other three stop at a closed red gate, each
gate labelled with the role constant that nothing grants. Beneath each gate, a small chip naming the
dashboard route that therefore never renders.

### Piece 2: nine users, no role `[planned]`

**Visual thesis.** The marketplace seed creates the providers and gives none of them a role, so a
vendor logs in and then fails every vendor check.

Data tier: a cylinder labelled `users_customuser`, holding a stack of row cards. Two rows carry a
role chip. Nine rows, grouped and labelled by what they are for (four artists, three vendors, two
venues), carry an empty chip outline. A green solid arrow from the seed-command glyph into the
cylinder, drawn deliberately without any role chip travelling along it.

### Piece 3: two names for one thing `[planned]`

**Visual thesis.** Two classifications with different values sit on the same user, and nothing says
which one decides.

Two side-by-side value lists on one user-row card: five uppercase values on the left, five lowercase
values on the right, with lines drawn between the pairs that nearly match and no line at all where
they do not. A single question-mark glyph above, in the decide colour, labelled with the question
rather than an answer.

---

## Subject capstone

### The way in, opened up `[planned]`

**Visual thesis.** Three gates have no key, nine providers have no role, and one question decides
which system grants either.

The three pieces above composed into one image across the two tiers. Browser tier on top: five
figures, two green paths, three red gates. Data tier below: the user cylinder with two role chips
and nine empty outlines. Between the tiers, a vertical band labelled with the unanswered question,
drawn in the decide colour, with arrows showing that whichever way it is answered determines what
the gates read.

To the right, outside the panels, a small camera glyph with five frames labelled "the proof", since
this scope is finished by screenshots rather than by files.

Every piece hedged. Nothing here is built.

---

## Process lane

Version 01. Authored from the three plan files in running order. Its gates and failure branches come
from each plan's engagement gate and its ❌ branches; nothing here is invented.

### Version 01: the way in, as three stages `[planned]`

**Visual thesis.** One decision, one change, one proof, and the two places it can stop.

The same cast as the subject lane, drawn under operation, left to right along the dominant axis with
numbered badges on each stage.

**Stage 1, decide.** A person figure at a browser card with DevTools open, a breakpoint glyph on the
branch, and a green solid arrow into a context-file glyph. Gate chip beneath: "a reader who has
never opened this codebase can act on it".

**Stage 2, grant.** A seed-command glyph with a green solid arrow into the user cylinder, now
carrying role chips on every row. Beside it, the admin glyph with a magnifying-glass, reading one
assignment back. Gate chip: "five roles, each held by at least one user, two read back by eye".
Failure branch drawn downward in red: "a role with count 0", looping back to stage 2.

**Stage 3, prove.** A browser card with five small framed screenshots fanned beside it, and two
recipe-document glyphs leaving it toward the runbook tray. Gate chip: "five screenshots, two recipes
in the index".

**The trap, drawn once and prominently.** A port glyph on the arrow entering stage 3, labelled
5173, with a red crossed branch labelled 5174 leading to a dead end chip reading "CORS, reads as a
wrong password". This is the failure most likely to waste the stage, so it is drawn at full size
rather than as a footnote.

**One backward arrow.** From stage 3's dashboard-redirect failure back to stage 1, labelled "the
decision was wrong", because that branch reopens the first plan rather than the second.

### Process capstone `[planned]`

**Visual thesis.** Three stages, two gates, one trap, and the one loop that goes all the way back.

Metro-journey shaped: a single line left to right with three numbered stations, each station
carrying its gate chip below the line. The 5174 branch leaves the line between stations 2 and 3 and
terminates in a buffer. The decision-was-wrong loop runs above the line from station 3 back to
station 1. Nothing else crosses the line.

