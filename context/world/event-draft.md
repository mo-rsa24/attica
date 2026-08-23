# 🌍 Event draft

An event draft is **an event being built, before anyone else can see it**. The organizer works
through a multi-step wizard and the draft holds whatever they have entered so far. When they
publish, a real [event](event.md#what-an-event-is) is created from it.

The draft and the event are two different rows in two different tables, and confusing them is the
most common mistake in this part of the system.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What an event draft is](#what-an-event-draft-is)
- [What it looks like](#what-it-looks-like)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-an-event-draft-is) ➡️

- **wizard**: the multi-step form an organizer fills in to create an event. Each step is a screen.
- **publish**: the action that turns a draft into a live event other people can see.
- **asset**: a file the organizer uploaded while building the draft, such as a poster or a seating
  chart.

## What an event draft is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#what-it-looks-like) ➡️

**One row per event being built, owned by one organizer.** ✅

It carries a status of `draft` or `published`, the step the organizer last reached, everything they
have typed, and the timestamps. It exists from the moment the organizer starts and survives them
closing the tab.

**Everything the organizer typed lives in one JSON blob.** ✅

The `data` field is a `JSONField` holding the whole wizard state. There is no column per wizard
field. What is in there is whatever the frontend put there, and the shape is not enforced by the
database.

**The step the organizer is on is free text.** ✅

`current_step` is a `CharField(max_length=100)` with no `choices`. Nothing at the database level
restricts it to the wizard's real steps, so a typo is a legal value.

**Uploaded files are rows, not blob contents.** ✅

Assets live in `EventDraftAsset`, one row per file, each typed as `media` or `seating_chart`. They
land on local disk under `media/event_draft_assets/organizer_<id>/draft_<id>/`.

## What it looks like

Navigation: ⬅️ [What an event draft is](#what-an-event-draft-is) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

> 📷 **Picture wanted**: the event creation wizard mid-flow, with the step indicator visible and
> some fields filled. Nine step-by-step screenshots of this exact flow already exist at
> `/home/molef/goal-setting/learning/attica-event-creation/artifacts/figures/walking-the-event-creation-flow/`, taken 2026-08-16;
> `step-02-event-details-form.png` is the closest match. Save as
> `images/world/02-wizard-mid-flow.png`.

## Why the project cares

Navigation: ⬅️ [What it looks like](#what-it-looks-like) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**Planning an event is long and interrupted, so the draft is what makes that survivable.** ✍️

Nobody plans an event in one sitting. The organizer comes back over days, and the draft is what
lets them. That is why the wizard state persists server-side rather than living in the browser.

**It is where provisional bookings accumulate before anything is committed.** ✅

An organizer secures providers while the event is still a draft. Those bookings are settled against
the real event only at publish, by `finalize_draft_bookings`. So a draft is not just a form, it is
a basket.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `status` | whether this draft has been published yet | `draft` (one of two) | [Dictionary § status](../data/02-dictionary.md#status-eventdraft) |
| `current_step` | the wizard screen the organizer last reached | `step3` (example; free text, not constrained) | [Dictionary § current_step](../data/02-dictionary.md#current_step) |
| `data` | everything the organizer typed, whole | a JSON object; shape set by the frontend | [Dictionary § data](../data/02-dictionary.md#data) |
| `organizer_id` | the user building this draft | `21` (example) | [Dictionary § organizer_id](../data/02-dictionary.md#organizer_id) |
| `published_at` | when publish happened, null until it does | `null` | [Dictionary § published_at](../data/02-dictionary.md#published_at) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Assuming a draft becomes an event. It does not; an event is created from it.** ✅

`EventDraft` and `Event` are separate tables. Publishing creates or updates an `Event` row from the
draft's contents (`_upsert_event_from_draft`, `events/views.py:415`) and marks the draft
`published`. The draft still exists afterwards. So one planned event can be two rows in two tables,
and counting `events_event` and counting `events_eventdraft` answer different questions.

**Both tables have a `status` field with the same two values, meaning different things.** ✅

`EventDraft.status` says whether this draft has been published. `Event.status` says whether the
listing is live. They can be read as the same field and are not.

**`Event` also carries `is_draft`, a boolean saying the same thing as its own `status`.** ✅

Two fields on the same row encoding one fact, with nothing keeping them consistent.

**Expecting the wizard's fields to be columns.** ✅

They are keys in a JSON blob. A query for events with a guest count over 200 works against
`events_event` and does not work against a draft, where the value is inside `data`.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The draft model, its JSON `data` field and free-text `current_step` | Read `backend/main/events/models.py:99-126` | 2026-08-22 |
| Assets are separate rows typed `media` or `seating_chart` | Read `backend/main/events/models.py:127-150` | 2026-08-22 |
| Publishing upserts an `Event` from the draft | Read `_upsert_event_from_draft` at `backend/main/events/views.py:415` and the publish action at `:496` | 2026-08-22 |
| `Event` carries both `is_draft` and `status` | Read `backend/main/events/models.py:43-49` | 2026-08-22 |
| Draft bookings are settled at publish | Read `finalize_draft_bookings` at `backend/main/scheduling/services.py:1814` | 2026-08-22 |
| The asset upload path shape | Recorded in [sources.md § 1](../sources.md#1-the-event-creation-flow-map), Step 10, observed live 2026-08-16 | 2026-08-16 |
