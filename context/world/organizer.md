# 🌍 Organizer, and the other roles a user can hold

An organizer is **the person planning an event**. They are Attica's primary user and the reader
everything is arranged around. But "organizer" is not a kind of account, it is one of the hats an
account can wear, and the system currently records which hats a user wears **twice, in two
incompatible ways**.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What an organizer is](#what-an-organizer-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-an-organizer-is) ➡️

- **role**: a hat a user wears, determining what they may do. In this codebase the word refers to
  two different mechanisms, which is the problem this file describes.
- **provider**: an artist, venue or service provider, meaning anyone on the selling side.

## What an organizer is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**Whoever is planning the event, for as long as they are planning it.** ✍️

Not a separate class of user. An artist booking a rehearsal space is an organizer that afternoon.
A venue manager running their own launch party is an organizer that week. The platform is designed
so one account can be on either side of a transaction depending on the day.

**The five hats the system knows about.** ✅

Event organizer, artist, service provider, venue manager, and ticket buyer. Those are the five
values on the `Role` model. A second field on the user lists five slightly different ones, which is
the problem below.

## Why the project cares

Navigation: ⬅️ [What an organizer is](#what-an-organizer-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**Everyone being both buyer and seller is the premise, not a convenience.** ✍️

A platform where organizers and providers were separate account types would be a directory. The
interoperability (one account, many hats) is what the product is for, and it is why a user carries
a set of roles rather than a type.

**Permission checks are the place this becomes load-bearing.** ✅

Who may create an event, who may answer a booking request, who may post as a vendor: all of it
reads the user's roles. Which means a system that stores roles two ways has permission checks that
disagree with each other depending on which app you are in.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `user_type` | a single hat, on the user row itself | `organizer` (one of five) | [Dictionary § user_type](../data/02-dictionary.md#user_type) |
| `roles` | many hats, through a join table to `users_role` | a user holding both `EVENT_ORGANIZER` and `ARTIST` | [Dictionary § roles](../data/02-dictionary.md#roles) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**There are two role systems, both enforced, in different apps.** ✅

`CustomUser.user_type` is a single `CharField` with the values `organizer`, `vendor`, `artist`,
`venue`, `attendee`, defaulting to `organizer`. `CustomUser.roles` is a many-to-many to `Role`,
whose values are `EVENT_ORGANIZER`, `ARTIST`, `SERVICE_PROVIDER`, `VENUE_MANAGER`, `TICKET_BUYER`.

The lists overlap without matching. One is singular and one is plural, which means they cannot even
express the same thing: `user_type` cannot say a user is both an artist and an organizer, and that
is the case the product is built around.

**Which one governs depends on which app the request lands in.** ✅

`scheduling/permissions.py:28` and `:35` gate on `user_type`. `artists/views.py:48`,
`vendors/views.py` and `common/permissions.py` gate on `has_role()`, which reads the many-to-many.
A user correct under one is not necessarily correct under the other.

**`CLAUDE.md` describes a third list that matches neither.** ✅

It names "organizer, vendor, artist, service_provider". `user_type` has no `service_provider` and
`Role` has no `vendor`. Anyone orienting from that document starts with a list that exists nowhere
in the schema.

**Eleven permission checks reference role constants that do not exist.** ✅

Code in `vendors/views.py` (8 call sites) and `common/permissions.py` (3) writes
`Role.SERVICE_PROVIDER`, `Role.EVENT_ORGANIZER` and `Role.ARTIST`. Those attributes are on the
nested `Role.Names` class, not on `Role`. Checked live: `hasattr(Role, "SERVICE_PROVIDER")` returns
`False`, so each of those lines raises `AttributeError` when reached. The three in
`common/permissions.py` are never reached, because nothing imports that module.

This is a defect, not a meaning. It is named here because the meaning of "role" in this codebase
cannot be described honestly without it, and it is recorded properly in
[../../environment/overview.md](../../environment/overview.md).

**Two profile pictures per user.** ✅

`CustomUser.profile_picture` uploads to `profiles/` and `UserProfile.profile_picture` uploads to
`profile_pics/`. Both exist, both are populated, and which one a given screen reads is not
established. The two directories are visible under `backend/main/media/`.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Everyone is both buyer and seller; that is the premise | Stated by the product owner in conversation | 2026-08-22 |
| Two role systems exist with different value lists | Read `backend/main/users/models.py:9-40` | 2026-08-22 |
| Scheduling gates on `user_type`; artists and vendors gate on `has_role()` | Read `scheduling/permissions.py:28,35`, `artists/views.py:48`, `vendors/views.py:67` | 2026-08-22 |
| `Role.SERVICE_PROVIDER` does not exist | Ran `hasattr(Role, "SERVICE_PROVIDER")` in the project's Django shell; returned `False` | 2026-08-22 |
| `common/permissions.py` is imported nowhere | Grepped the tree for importers; no results | 2026-08-22 |
| Two profile picture fields exist on different models | Read `backend/main/users/models.py:31,49`; both media directories exist on disk | 2026-08-22 |
| Which of the two role systems is intended to survive | Not established. On the [Still open list](../00-INDEX.md#still-open) | 2026-08-22 |
