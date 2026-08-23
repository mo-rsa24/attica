# Could you rebuild something like Attica without copying it?

A reverse-engineering curriculum: sixteen chapters teaching the concepts behind Attica well enough
to build a similar product from first principles. It is written as a textbook rather than a repo
tour, so each chapter teaches the idea, says why this system needed it, points at where it appears,
and names what mastery unlocks.

## What is in here

One set of sixteen markdown chapters plus its own reading-order index, under `handbook/`.

## The set

### handbook

**The question.** What would you have to understand to build this, rather than to read it?

**How it is sorted.** By reading order, `00` through `15`. `00-quick-reference.md` is the glossary
and decision trees; `10-minimal-learning-path.md` is the short route for anyone who cannot read all
sixteen. `handbook/README.md` carries the full order and two entry points.

**How many cells.** Seventeen files: sixteen chapters and the index.

**One example.** [`handbook/01-system-map.md`](handbook/01-system-map.md), the chapter that lays out
what talks to what.

**How we got these**

Written by reading the codebase, as a teaching document rather than a record of a run. Its own
opening calls it a curriculum for rebuilding "without copying the original implementation".

**What they let you say**

What each mechanism in Attica is for, and what a person would need to know to choose it themselves.

**What they cannot say**

Nothing about whether the code is correct, and nothing about the current state of the running
system. It teaches concepts and points at where they appear "at a high level", so a chapter and the
code can drift without the chapter looking wrong.

Two things it predates and therefore does not know: that five models are called some variant of
`Booking` with only `scheduling.Booking` live, and that a user carries two incompatible role
systems. Both are in [`../../../context/`](../../../context/00-INDEX.md).

**Where it came from and what judged it**

The repository. Nothing judged it; no review file exists.
**Held since 2026-08-23.** No plan in the tree names this handbook. Kept because it is the only
document in the project that explains the system as ideas rather than as files, and because the
`attica-event-creation` learning journey's rebuild lane covers the same ground and should be read
against it.
