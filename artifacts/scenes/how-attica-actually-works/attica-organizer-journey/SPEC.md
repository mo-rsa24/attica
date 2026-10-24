# Scene spec: attica-organizer-journey

```
ran under:  none
built from: /home/molef/Work/attica (the repository itself)
why:        get back into this codebase after time away, by tracing one organizer end to end
depends on: ../../../environment/overview.md, ../../../context/00-INDEX.md
```

The gate output this scene was built from, plus the three places the build corrected it.

## Claim card

| | |
|---|---|
| **Claim** | A per-request trace across all four layers tells you what the system does. The route table and the model names tell you what someone intended. |
| **Alternative** | Reading `App.jsx`'s `<Route>` list plus `events/models.py`: the map you rebuild from names after time away. |
| **Use it** | "Resume a draft". The route table says `CreateEventPage` owns `/listing/:id`, so you look there. The resume read is actually `GET /api/events/event-drafts/{id}/`, fired from `ListingWizardLayout.jsx:71` into `reactContext.jsx:310` on the layout's mount. `CreateEventPage` only POSTs new drafts. |
| **Do not** | When you need the intended shape rather than the current one. The trace shows `OrganizerProfilePage` as dead weight and says nothing about whether it should be wired up. Names carry intent; the trace does not. |
| **Consequence** | The journey map runs both readings over the same four stages, same layout. Every stage diverges, and each divergence is clickable into the request that proved it. |

## Components

Every one is inspect, toggle and parameterize. The value marked `repo` is what is true at `/home/molef/Work/attica` today.

| Component | Values | What breaks, with the real string |
|---|---|---|
| `user_type` in `UserSerializer.fields` | absent `repo` / present | Absent: the client never sees `user_type` and falls back to `roles[0]`, `"EVENT_ORGANIZER"`, a different enum from `user_type`'s `"organizer"` |
| Artist row for this user | none `repo` / found by query / on the user object | None: `/profile` falls through to `/profile/edit`, a bio and a picture |
| A link to `/organizers/:id` | none `repo` / exists | None: `grep -rn "organizers/" frontend/src` returns one hit, the route at `App.jsx:148` |
| `MarketplaceResource` for the artist | absent `repo` / opted in | Absent: `"Not available for online booking"` instead of a form |
| my-events payload shape | `{drafts, published}` `repo` / bare array / `{results}` | Real shape: `Array.isArray(x) ? x : (x?.results ?? [])` yields `[]`, the dropdown holds only its placeholder |
| `Idempotency-Key` header | sent `repo` / omitted | Omitted: a double submit writes a second `BookingRequest`. Sent: the replay writes nothing at all |
| A `BookingRequest` the bid can match | no match `repo` / match | No match: `chat/signals.py:48` logs at debug and returns. No row, no error |
| Booking submitted from | `BookArtistPage` `repo` / `ProviderCard` | The fork axis. Only `ProviderCard` sends `event_draft_id` |
| `data.steps.<key>` | which of step1, step3..step8 are filled | step2 does not exist: `App.jsx:121` redirects it to step1 |
| `EventDraft.status` | draft / published | Published: the row survives, `published_event_id` goes inside `data`, my-events still lists it under `drafts` |

## Stages

| Stage | Medium | What it establishes |
|---|---|---|
| 0 the problem | visual | The journey map's two rows: what the names promise against what the trace produced |
| 1 login | visual | One request through all four layers, plus the second read `AuthProvider` fires straight after |
| 2 draft and resume | visual | The wizard as PATCHes into one JSON column, resume as a single GET on layout mount, publish as a field-mapping transform |
| 3 the four gaps | code | Real payloads and real error strings, each reproducible by an intervention |
| 4 build it | code | The source drawer, syncing the responsible line to whatever the scene is doing |

## Model

A pure reducer over ordered journey steps. `run(knobs, cursor)` folds the first `cursor` steps and returns the whole world. Order is load-bearing: a draft must exist before resume, an Event before `finalize_draft_bookings` can attach anything.

Observables: rows per table with the fields that moved, the call log (method, path, trigger, view, serializer, tables), a verdict per stage, a why-chain per explained change, and seven probes.

**Provenance is step-scoped where it needs to be.** `client.route` changes for a different reason in almost every step, so its chains are keyed `login:client.route`, `open_profile:client.route`, and only offered on the step that emitted them. A later change never inherits an earlier explanation.

## Probes

| Probe | Serves |
|---|---|
| rows written so far | claim: the trace, not the names |
| EventDraft rows | gap: publish does not consume the draft |
| my-events `drafts` length | gap: the published draft still lists |
| event dropdown options | gap: the payload parse |
| BookingRequest rows | [idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub>, and the 400 |
| AvailabilitySlot rows | nothing is reserved at request time |
| times `user_type` crossed the API | gap: two role systems, one exposed |

Invariants: EventDraft rows never decrease; no AvailabilitySlot is touched before approval; `user_type` never crosses the API boundary.

## Counterfactual

One fork, invoked from the toolbar rather than permanent. Both worlds assume the artist opted in, so the only difference is the page the booking came from. Same layout, same cursor, same other switches.

## Atlas

Map-first. Entry level: journey. Three levels: journey (four stage cards) → stage (its requests in order) → call (frontend, wire, Django, tables). Opening a call keeps the journey strip and the breadcrumbs.

## Engagement

Tour: five stops, generated from the surfaces, first visit only, skippable, re-runnable from the toolbar.

Predictions before publish, before the booking submit, and before the ChatBid accept.

Excursions: the `organizers/` grep (checked against 1 hit) and the stored `current_step` after saving step 5 (checked against `^step[13-8]$`).

## Corrections the build made to the gate

1. **The claim card said three of four stages diverge. All four do.** Login diverges too: `user_type` never crosses the API, and `navigate('/')` runs for every role.
2. **The publish call's serializer pointer moved from `views.py:337` to `views.py:384`.** `_build_event_payload` starts at 337, but the `event_payload` dict that does the actual field mapping starts at 384, and that is the line worth highlighting.
3. **Shiki was dropped for a small built-in highlighter.** Shiki loads grammar bundles asynchronously, and the scene needed nothing beyond Python and JSX keywords, strings, numbers and call names. The rest of the pinned stack is unchanged.
