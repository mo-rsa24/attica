# 🌍 Social post

A social post is **something a user publishes so other people find them**. It is how an organizer
discovers an artist by seeing their work rather than by filtering a list, and it is the part of
Attica that makes it a social platform rather than a booking directory.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a social post is](#what-a-social-post-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-social-post-is) ➡️

- **feed**: the stream of posts a user sees.
- **follow**: a user subscribing to an artist's posts.

## What a social post is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**Text, optionally an image, from one user.** ✅

`SocialPost` carries the author, the text, an optional image, the users who liked it as a
many-to-many, a share count, and timestamps. Comments are separate rows in `SocialPostComment`.

**There are three separate post models, one per kind of author.** ✅

`SocialPost` for any user, `ArtistPost` for artists, and `VendorPost` for vendors. They are not one
model with an author type; they are three tables.

**Only `VendorPost` connects to the commerce side.** ✅

`CartItem` points at a `VendorPost`. So a vendor's post is something an organizer can add to an
event, while an artist's post is only something to look at.

**Following exists for artists only.** ✅

`Follow` joins a user to an `Artist`. There is no equivalent for vendors or venues.

## Why the project cares

Navigation: ⬅️ [What a social post is](#what-a-social-post-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**Discovery is a social problem, not a search problem.** ✍️

Organizers find performers by seeing what they do. A filter on genre and price returns a list of
strangers; a feed returns people whose work you have watched. The intent is a social platform that
transacts, not a booking tool with a feed attached.

**It is the signal that separates a good outcome from a mediocre one.** ✍️

An organizer booking an artist because of a post, rather than because of a search filter, is what
[what working means](../purpose/03-what-working-means.md#what-a-good-result-looks-like) names as
the good result.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `likes` | which users liked this, as a join table | a set of user ids | [Dictionary § likes](../data/02-dictionary.md#likes) |
| `shares_count` | how many times it was shared | `0` (the default) | [Dictionary § shares_count](../data/02-dictionary.md#shares_count) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Expecting one feed table.** ✅

There are three post models in three apps. A combined feed has to read all three and merge them,
and nothing in the schema does that for you.

**Reading `shares_count` as a count of anything recorded.** ✅

`likes` is a many-to-many, so a like is a row and can be traced. `shares_count` is a plain integer
someone increments. There is no share record, so the number cannot be audited or undone.

**Assuming follows work for every provider kind.** ✅

`Follow` points at `Artist` specifically. A user cannot follow a venue or a vendor.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| `SocialPost` and `SocialPostComment` fields | Read `backend/main/users/models.py:59-86` | 2026-08-22 |
| Three separate post models exist | Listed classes across `users/`, `artists/` and `vendors/models.py` | 2026-08-22 |
| `Follow` points at `Artist` only | Read `backend/main/artists/models.py:52-64` | 2026-08-22 |
| `CartItem` points at a `VendorPost` | Read `backend/main/cart/models.py:9-20` | 2026-08-22 |
| The social layer is core to the premise, not a side feature | Stated by the product owner in conversation | 2026-08-22 |
