# 🌍 The problem Attica solves

Planning an event means coordinating people who do not share a system: the venue, the performers,
the caterer, the sound company, the guests. Today that coordination happens across half a dozen
tools that do not talk to each other. Attica's premise is that all of it belongs in one place.

## Table of contents

- [Who has the problem](#who-has-the-problem)
- [What it costs them today](#what-it-costs-them-today)
- [What this project does about it](#what-this-project-does-about-it)
- [Where this came from](#where-this-came-from)

## Who has the problem

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-it-costs-them-today) ➡️

**Four kinds of people, and none of them is only a customer.** ✍️

An **event organizer** is planning something and needs a place, performers and services for it.
A **venue stakeholder** has a space that sits empty on the days nobody books it. An **artist** has
dates to fill. A **service provider** (catering, sound, décor, photography) sells against those
same dates.

**Every one of them is both a buyer and a seller, which is the whole design.** ✍️

An artist booking a rehearsal space is an organizer that day. A venue manager running their own
launch party is an organizer that day. Attica is built so one account can be any of these, which is
why a user carries roles rather than a single type. See
[Organizer § What people get wrong](../world/organizer.md#what-people-get-wrong), where that idea
is currently implemented twice in two incompatible ways.

**The guest is the fifth person and the one furthest from done.** 🔍

Someone who buys a ticket to an event they did not organise. The database has a place for them and
very little else. See [Ticket § What people get wrong](../world/ticket.md#what-people-get-wrong).

## What it costs them today

Navigation: ⬅️ [Who has the problem](#who-has-the-problem) | 📋 [TOC](#table-of-contents) | [Next](#what-this-project-does-about-it) ➡️

**The work is spread across at least five tools that do not know about each other.** ✍️

WhatsApp for the fast back-and-forth. A spreadsheet for who has been booked and what they cost.
Email for anything that needs a record. Direct messages on whatever social platform each performer
actually reads. And face-to-face meetings for the things that will not resolve any other way.

**Nothing holds the whole picture, so the organizer is the integration layer.** ✍️

The state of an event lives in one person's head and their memory of six conversations. Nobody else
can see whether the caterer has confirmed. There is no record that survives the organizer being
unavailable, and no way to answer "where are we" without re-reading five threads.

**The same disintegration costs the sellers differently.** ✍️

A venue with an empty Saturday has no way to tell the people looking for a Saturday. An artist
fields the same availability question in five inboxes. Neither has a calendar anybody else can see.

## What this project does about it

Navigation: ⬅️ [What it costs them today](#what-it-costs-them-today) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Put every party in one system, so the event itself holds the state instead of the organizer.** ✍️

The organizer builds the event once, in a guided flow, and the venue, the artists and the services
are booked from inside it. The record of who agreed to what is the system, not a thread.

**Make availability something a provider publishes rather than answers.** 🔍

A venue, an artist and a vendor all publish when they are free in the same shape, so an organizer
searches instead of asking. This is what the scheduling side of the system is for, and it is the
part with the most engineering in it. See
[Availability § What availability is](../world/availability.md#what-availability-is).

**Treat the three kinds of seller as one kind of thing.** ✅

A venue, an artist and a service provider are commercially different and structurally identical:
each is something an organizer books for a window of time on a date. Attica models them as one
[marketplace resource](../world/marketplace-resource.md#what-a-marketplace-resource-is) so that
searching, availability, requesting and booking are written once rather than three times.

**Keep the social layer, because the discovery problem is a social one.** ✍️

Organizers find performers by seeing their work. So artists and vendors post, users follow artists,
and posts carry likes and comments. The intent is a social platform that happens to transact, not a
booking tool with a feed bolted on.

## Where this came from

Navigation: ⬅️ [What this project does about it](#what-this-project-does-about-it) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The four participant kinds, and that each is both buyer and seller | Stated by the product owner in conversation | 2026-08-22 |
| The five scattered tools organizers use today | Stated by the product owner in conversation | 2026-08-22 |
| One table stands for all three seller kinds | Read `backend/main/scheduling/models.py:14-76`, including the `clean()` that enforces exactly one link | 2026-08-22 |
| Availability is published in one shape across the three kinds | Read `backend/main/scheduling/models.py:133-253` | 2026-08-22 |
| The guest side is barely modelled | Read `backend/main/tickets/models.py`, one model, and `backend/main/checkout/models.py`, empty | 2026-08-22 |
