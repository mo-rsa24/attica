# Diagram prompts: getting it out

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph, no new colour meaning and no new tier.

This map is the zoom-in on the deploy glyph in
[the parent's subject capstone](../../diagram-prompts.md), one of the two glyphs on the vertical line
to the right of the stack headed "alongside, from day one". The parent capstone keeps it as a single
glyph and needed no amendment.

**A deployment picture wants a host, an artifact and a commit, and none of the three is a glyph in
the parent's vocabulary.** The vocabulary is a browser card, a person figure and a form row in the
browser tier, a handler glyph, a worker gear and a queue tray in the application tier, a cylinder in
the data tier, and a globe for anything external. Nothing is added to that list. What the parent's
own capstone uses for structure covers the rest: a machine is a titled rounded panel of the kind the
parent groups components in, an artifact is a document card, a commit is a chip, a check is a gate
bar, and something that ought to exist and does not is an empty framed slot in the decide colour.
All five are the parent's devices applied to a new subject rather than new vocabulary.

**The deploy glyph itself appears exactly once in this map, in the capstone, meaning the same thing
it means in the parent.** It is not promoted into a general-purpose glyph for a step, because a glyph
that means "this scope" in one picture and "one stage" in another is a new vocabulary item wearing an
old name.

**Three of the four flow colours are absent here and that is correct rather than a gap.** The palette
gives each colour exactly one meaning. Blue dashed is an HTTP request, and it is used, because a
person reaching a deployed Attica over the internet is an HTTP request and nothing else. Green solid
is a database write, and it is used in one place, where a migration writes. Orange dashed is a queued
or outbox event and purple dashed is a WebSocket push, and neither is anything a deploy does, so
neither appears. Everything structural is a plain arrow, the way the parent capstone draws
dependency.

**The globe is the reader.** External tier already means outside the system, and the whole argument
of this scope is that today nothing outside can reach in. So the globe carries a person figure and
sits at the far edge, and in every piece except the capstone its arrow stops before it arrives.

**Red is a confirmed defect and the hedge outline is the unobserved.** Every count in this map came
from reading a file or running a command against this repository on 2026-08-23. The two workflow
runs and their outcomes were read live from `gh run list`, so they are stated plainly. The specific
reason the frontend job dies is inferred rather than read, because the log needs repository admin
rights, so that one element carries the grey dashed hedge outline and its "unconfirmed live" tag.

**Two things not to confuse.** This file is the picture of the scope's own shape. Any picture of
Attica's runtime layers drawn for a reader of the system is a deliverable of `the-system-in-layers`,
drawn in the same direction and not from this file.

---

## Subject lane

Five pieces, each the picture of one thing that is true today, closed by the capstone rather than by
named plans, because this scope has no plan files yet. When `populate-plans` authors them, each piece
gets the plan that closes it named here, the way the sibling maps do.

### Piece 1: one machine, and four hands to start it `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-one-machine-four-hands.png`

**Visual thesis.** Attica exists in exactly one place, it is started by a person four times in the
right order, and there is nothing outside it that anybody could reach.

One titled rounded panel filling most of the frame, labelled for the single machine, spanning all
three tiers. Inside it, bottom to top: a data-tier cylinder carrying a small file chip with a size on
it, beside a second cylinder drawn as a folder of images with its own counter chip giving the file
count and the total size. Above them, in the application tier, a handler glyph and a worker gear, the
gear drawn muted. Above those, in the browser tier, a browser card labelled for the development
server. Four short blue dashed arrows connect them in the order they must be started, each carrying a
small number badge, one to four.

To the left of the panel, outside it, one person figure at a terminal card with four separate plain
arrows leaving it, one into each numbered thing, because the person is the only thing that starts any
of them. No arrow runs between any two of the four.

At the far right, well outside the panel and separated by a wide gap, an external-tier globe with a
person figure beside it. One blue dashed arrow leaves the globe toward the panel and stops dead in
the gap, ending in nothing.

**Faithfulness note.** Every one of the four numbered things receives its arrow from the person
figure and from no other element; a supervisor arrow anywhere would refute the picture. The globe's
arrow must visibly stop short and must not touch the panel edge. The worker gear is muted, because it
is the one people forget to start. Nothing in this image is in the decide colour.

### Piece 2: the gate that has never been green `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-the-gate-that-has-never-been-green.png`

**Visual thesis.** There is a check on every change, it has run twice and failed twice, and the one
thing it builds is thrown away when it finishes.

Across the middle of the frame, one horizontal gate bar spanning the full width, drawn in the defect
colour, split into two halves side by side and labelled for the two jobs. The left half holds a small
stack of step chips reading down the job's steps, with the last chip in the defect colour and every
chip after it drawn greyed and struck. The right half holds its own stack of step chips, with the
failing chip much nearer the top of the stack and three greyed struck chips beneath it, so the two
halves visibly fail at different depths.

Below the bar, two commit chips side by side, each carrying a date, each with a plain arrow up into
the bar. Above the bar, nothing at all reaches upward: the space above it is empty.

Off to the right of the right half, outside the bar, a document card labelled for the built frontend,
with a plain arrow leaving the bar into it and a red cross over the card, and a caption chip stating
that it is produced and discarded on every run.

To one side of the right half's failing chip, a grey dashed hedge outline with an "unconfirmed live"
tag around a small card naming the suspected cause, because the log that would confirm it cannot be
read from this account.

**Faithfulness note.** The two halves must fail at visibly different depths, since one dies after
running its tests and the other dies before installing anything. Nothing crosses the top edge of the
gate bar. The document card sits outside the bar and carries the red cross, because the build is not
the failure, it is the waste. Only the suspected-cause card carries the hedge outline; the two runs
and their outcomes are stated plainly.

### Piece 3: written into the file, not read from the environment `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-03-written-into-the-file.png`

**Visual thesis.** Eight things can be told to the application from outside, every one of them has a
value that works on a laptop, and the four that decide where anything actually lives cannot be told
at all.

One wide application-tier panel in the centre, labelled for the settings file. Inside it, two groups
separated by a vertical divider.

The left group is a column of eight rows, each a small chip pair: the name on the left, and on the
right a second chip holding the value it falls back to, with a small open door glyph at the row's
outer edge showing the value can come from outside. Two of the eight rows are drawn in the defect
colour, and each of those carries a short caption naming what the fallback means.

The right group is a column of four rows drawn without any door at all, each name chip welded
directly to a value chip, and each value chip drawn as a literal: an engine name over a file path, a
host and a port, a host and a port and a number, and a local folder path. From each of those four
rows, a plain arrow points outward toward the panel edge and hits a solid wall drawn along that edge,
stopping there.

Outside the panel on the right, four things the four rows are trying to reach: a cylinder, a queue
tray, a second cylinder, and a folder of images, each sitting alone with no arrow arriving.

**Faithfulness note.** The eight rows on the left all have a door and a fallback value; the four on
the right have neither. The four outward arrows must visibly stop at a wall rather than fade, because
the claim is that a code change is required and not that the connection is weak. The two defect-colour
rows on the left are the debug flag and the secret key, and they are on the left rather than the right
because they can be set and are simply dangerous when they are not.

### Piece 4: a client that can only talk to a development server `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-only-talks-to-a-dev-server.png`

**Visual thesis.** Almost every call the interface makes is a path with no host on it, which resolves
only because a development server is standing in the middle, and the two calls that do name a host
name this laptop.

Across the top, the browser tier: one large browser card holding a dense column of form rows, each row
a short relative path with no host on it, with a counter chip on the card giving how many such call
sites there are. Two rows near the bottom of the column are drawn in the defect colour, each carrying
a full address beginning with a loopback number and each labelled with its file and line.

Below the browser card, spanning the width, one titled rounded panel labelled for the development
server, holding five small route chips, one per proxied prefix. Every relative row in the card above
sends a blue dashed arrow down into this panel, and the panel sends one blue dashed arrow onward down
to a handler glyph in the application tier. The two defect-colour rows send their own blue dashed
arrows that bypass the panel entirely and go straight to the handler, drawn crossing outside it.

To the right of the development-server panel, at the same height and the same size, an empty framed
slot in the decide colour, visibly holding nothing, labelled for what stands there when the
development server is not running.

Below and to the left of the handler glyph, a document card labelled for the built interface, sitting
inside the application tier with two thin plain arrows arriving at it from the settings panel, and
with no arrow of any kind leaving it toward the browser tier. A small caption chip beside it states
that nothing serves it.

**Faithfulness note.** The counter chip's number and the two defect rows are the whole argument, so
the column must read as overwhelmingly host-less with exactly two exceptions. Every relative arrow
passes through the development-server panel and the two defect arrows visibly do not. The empty
framed slot is the same size as the panel beside it, and it is empty. The document card has arrows
arriving and none leaving.

### Piece 5: two clones are not the same clone `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-two-clones-are-not-the-same.png`

**Visual thesis.** The backend half of this application pins every version and the frontend half pins
none, the list of what it needs from its environment is invisible to anyone who clones it, and all
the data lives on one disk that is in no repository at all.

Three columns at the same height, read left to right.

The left column is one panel labelled for the backend dependencies, holding a tall stack of thin rows
each showing a name locked to an exact version, with a counter chip giving the number of rows and a
small closed padlock on the panel. Two arrows leave it to the right, both arriving at one identical
document card, labelled to show that two installs give the same result.

The middle column is one panel labelled for the frontend dependencies, holding a short stack of rows
each showing a name beside a range rather than a version, with a counter chip for the dependency count
and an open padlock in the defect colour. Beside the panel, outside it, a document card drawn as the
lockfile with a red cross over it and a caption chip reading that it exists on this disk and is in no
commit. Two arrows leave the panel to the right and arrive at two document cards that are visibly
different from each other.

The right column is one panel labelled for what the application needs from its environment. Inside
it, a document card with a list of variable names on its face, drawn behind a closed barrier in the
defect colour that runs the full height of the panel, with a caption chip stating that a clone cannot
see it. Below the panel, outside it and below everything, two data-tier cylinders side by side, one a
file with a size chip and one a folder of images with a count and a size chip, each drawn on a small
disk platform, with a dashed boundary around both labelled to show that neither is in any repository.

**Faithfulness note.** The left column's two arrows arrive at one card and the middle column's arrive
at two different cards; that contrast is the argument and must be visible without reading a label.
The frontend lockfile card is outside its panel, because the problem is that it is not part of what a
clone gets. The barrier in the right column is closed and spans the full height. Nothing in this image
is in the decide colour, because none of it is an open question.

---

## Subject capstone

### The deploy glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-deploy-glyph-opened-up.png`

**Visual thesis.** A commit becomes one checked artifact, the artifact reaches four named roles that
happen to share one machine, a person outside reaches it over the internet, and there is a way back
down.

Four levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One panel labelled for this machine, holding a person figure at a terminal card and a
commit chip leaving it upward. Beside the commit chip, a small stack of two document cards drawn as
the things that make the clone reproducible, one for each half of the application, both with closed
padlocks, and both feeding the same upward arrow.

**Second level.** One horizontal gate bar spanning the full width, in the ordinary panel colour and
not the defect colour, holding two halves side by side with their step chips all complete. Exactly
one arrow enters it from below. Leaving its upper edge, one plain arrow carrying a document card: the
artifact the gate keeps rather than discards, drawn with the same silhouette as the discarded card in
subject piece 2 and without the red cross.

**Third level.** One titled rounded panel labelled to show it is one machine today and need not stay
one, holding four sub-panels side by side at the same height, each carrying its own title. The first
holds a handler glyph. The second holds a worker gear, turning, on a small clock platform. The third
holds a cylinder. The fourth holds a folder of images. Each of the four carries a small door glyph on
its outer edge with a configuration chip beside it, and each door has a short plain arrow leaving it
outward into open space beyond the panel edge, ending in an empty framed slot in the decide colour
sized like another machine, labelled for the second host that does not exist yet. The artifact arrow
from the gate bar enters the first two sub-panels and no others. One green solid arrow runs from the
first sub-panel into the cylinder, carrying a small migration chip.

**Top.** An external-tier globe with a person figure beside it, at the far right, with one blue dashed
arrow running from the globe down into the first sub-panel and, unlike in subject piece 1, arriving.
Beside the globe, a small browser card showing a commit chip on its face, labelled for the answer to
whether it landed.

Down the left-hand edge of the whole stack, outside every panel, one plain arrow running from the
third level back down to the second, labelled for putting a deploy back, drawn as the only downward
line in the image.

Beside the stack on the right, outside the panels, an open book receiving plain arrows from the second
and third levels, with two answered questions on its facing page, and a document card beneath it
labelled for the environment section this scope writes.

**Faithfulness note.** Four levels, bottom to top, with exactly one downward line, which is the
rollback on the left edge. The globe's arrow arrives, which is the single difference from subject
piece 1 and the whole point of the scope. All four sub-panels have a door and a configuration chip,
and their outward arrows end in the decide-colour slot, because a second machine is a possibility this
scope leaves open rather than a thing it builds. Nothing else is in the decide colour and nothing is
in the defect colour, because this is the end state. Nothing leaves the top edge.

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
