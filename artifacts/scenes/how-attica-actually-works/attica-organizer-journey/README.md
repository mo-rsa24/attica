# The organizer journey, as it actually runs

An interactive trace of one organizer going through Attica end to end: log in, look for a profile, build and resume an event, book an artist. Every request in it is real, taken from `/home/molef/Work/attica`. Every file, line number, payload and error string is copied out of the repo rather than described.

It exists for re-orientation on this codebase after time away, so it shows the current behaviour including the parts that are broken, not an idealised version.

## Run it

```bash
cd artifacts/scenes/how-attica-actually-works/attica-organizer-journey
npm install
npm run dev          # http://localhost:5180
```

If `npm run dev` dies with `ENOSPC: System limit for number of file watchers reached` (common under WSL), build once and serve the output instead:

```bash
npm run build && npx vite preview --port 5180
```

## How to use it

Press **run next request** twenty-two times. Each press fires the next real call and drops the view onto it: the frontend file that triggered it, the wire, the Django view and serializer, and the tables it touched. Under that, the changeset lists the fields that actually moved with the line that moved them, and `why?` opens the chain the model emitted for that change.

The left rail holds every switch. Each one is a real condition in the repo, and the value tagged `repo` is what is true today. Flip one and the whole trace recomputes from step zero.

The toolbar holds **source** (the verbatim code for the selected call, with the responsible line highlighted), **probes** (seven counters, three invariants, two go-and-check-it-yourself excursions), **history**, and **fork**.

## The four gaps it refuses to smooth over

**Two role systems, one exposed.** `CustomUser` has `user_type` (organizer, vendor, artist, venue, attendee) and a `roles` many-to-many to a separate `Role` model (EVENT_ORGANIZER, ARTIST, ...). `UserSerializer.fields` lists `roles` and not `user_type`, so only one of them ever reaches the client. `Login.jsx:18` then calls `navigate('/')` for everyone.

**`/profile` is not the organizer's profile.** `ProfileRedirect` asks one question, "is there an `Artist` row for this user?", and never reads `roles` or `user_type`. An organizer has no Artist row, so it always lands on `/profile/edit`: a bio and a picture. `OrganizerProfilePage` exists, works, and is routed at `App.jsx:148`, but `grep -rn "organizers/" frontend/src` returns exactly that one hit. Nothing navigates to it.

**Publishing does not consume the draft.** `EventDraftViewSet.publish` maps `data.steps.*` onto a new `Event` row, then sets `status=published` on the draft and writes `published_event_id` *into* the JSON blob. That is deliberate: republishing reuses the id instead of creating a second Event. The cost is that `MyEventsAPIView` filters `EventDraft` by organizer and nothing else, so the published draft keeps showing up under `drafts`.

**The Book Artist form cannot submit.** `MyEventsAPIView` returns `{drafts, published}`. `BookArtistPage` parses it with `Array.isArray(x) ? x : (x?.results ?? [])`, which matches neither arm, so the event dropdown is always empty. Its only option is the placeholder, whose value is `""`, so no `event_id` goes in the body, and `CreateRequestAPIView` returns `400 {"detail": "Either event_id or event_draft_id is required."}`. `MyEventsPage` reads the same endpoint correctly, which is why the bug is invisible from the events screen.

A fifth thing the fork drawer makes visible: `finalize_draft_bookings` selects on `event_draft=draft`, and `BookArtistPage` only ever sends `event_id`. Even if the dropdown were fixed, a booking made from that page could not become a `Booking` row at publish. Only `ProviderCard`, inside the wizard, sends `event_draft_id`.

## What is in here

| Path | What it is |
|---|---|
| `src/model/journey.ts` | The one model. `run(knobs, cursor)` returns the whole world; every panel reads it and nothing computes its own version |
| `src/model/code.ts` | Verbatim excerpts from the repo with their real starting line numbers |
| `src/model/types.ts` | State, observables and provenance, named apart |
| `src/store.ts` | Zustand. Records semantic interventions; history and rewind derive from them |
| `src/engagement.ts` | Tour stops, predictions, excursions |
| `src/components/` | The atlas, the call view, the changeset strip, the popover, the four drawers |
| `SPEC.md` | The gate output, and the three places the build corrected it |

## Where this ends

It ends at the trace. Fixing any of the four gaps is `/learn-codebase` or ordinary work in the repo; sequencing this against other things to relearn is `/learning-path`.
