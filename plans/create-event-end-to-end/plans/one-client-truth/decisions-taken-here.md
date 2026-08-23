# Decisions taken while writing this scope

This scope was written in one unattended pass, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with its reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused.

The source for the scope's content is item 10 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#10-one-client-truth),
and the state of the world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

Two of these correct a claim the programme's own planning notes make. Those two are first, because
they change what the scope is, not only how it is written.

---

## The eight-second poll is a fallback, not a second model

**Decision.** The scope describes one realtime model with a degraded fallback, and names the actual
defect as the fallback being permanent in one of the two components. Both planning sources that said
two models coexist are corrected to match.

**Why.** Both poll effects are guarded. `frontend/src/components/chat/ChatRoom.jsx:45` and
`frontend/src/pages/DirectMessagePage.jsx:259` both open with
`if (!socketError) return undefined`, so no poll runs while the socket is healthy. "Two realtime
models coexist in chat: a WebSocket and an eight-second poll. Pick one" describes a client that
polls and sockets at the same time, and a plan written from that sentence would go looking for a
duplicate stream to delete and find a fallback that is doing its job.

**Why it is still a defect, and a worse one than the sentence claims.**
`ChatRoom` never reconnects: `socket.onclose` sets the error flag and stops
(`frontend/src/components/chat/ChatRoom.jsx:67`). So one dropped socket moves that room to
eight-second polling for the rest of the session, with no path back. `DirectMessagePage` reconnects
after 4000ms and clears the flag on open, so its fallback is temporary. Same code shape, two
different consequences, and only one of them is a real problem. "Pick one" is the wrong instruction:
the fix is a shared transport with one reconnect policy, which retires the question rather than
answering it.

**What was done about the sources.** Both present-tense planning sources are corrected, so the next
scope that reads them does not plan against the wrong picture.
[The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#10-one-client-truth)
and [where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#2-the-state-of-the-world)
both now say the poll is a fallback and name `ChatRoom`'s missing reconnect as the defect.
[The plan walk](../../../../ideas/enhancing-create-event-end-to-end/PLAN_WALK.md) is untouched: it is
the record of a session on a day, and editing a record to fix a number falsifies the record.

## The envelope is half wired already, and the planning notes call it entirely missing

**Decision.** The scope treats the entity version as partly built and mostly unwired, rather than as
something to design from nothing, and says so in its Definition of Done by naming the two bump sites
that have to be resolved.

**Why.** [Where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#2-the-state-of-the-world)
lists "a real-time event envelope with a monotonic version and gap detection" under Missing. Four
models already carry `version = models.PositiveIntegerField(default=1)`: `ResourcePolicy`
(`backend/main/scheduling/models.py:114`), `AvailabilityRule` (line 153), `AvailabilitySlot`
(line 224) and `Booking` (line 458). Five serializer field lists already expose it. `OutboxEvent`
already carries `aggregate_type` and `aggregate_id` as real columns (lines 605 to 606), which is the
identity half of an envelope.

**What is actually missing**, which is a shorter and more specific list: the version never leaves the
REST layer, `BookingRequest` has no version field at all, and the two sites that bump a version use
`F("version") + 1` (`backend/main/scheduling/services.py:2189` and `:2549`), so the code that just
saved the row cannot read the new number off the instance to put it on the wire. That last one is a
constraint a plan has to design around, and it is invisible from a Missing list.

**Why this matters for the shape of the scope.** A scope told the envelope is missing writes a plan
that designs a versioning scheme. A scope told the fields exist and do not travel writes a plan that
connects two things, which is smaller, and puts its design effort on the part that genuinely has no
answer: what a client does with a version once it has one.

---

## Whether this scope waits on D1 or is written against it

**Decision.** Both. The running order already answers D1 before this scope starts, and the plans are
still written as though it were open.

**Why.** Scope 10 waits on scope 6, which waits on scope 4, `one-booking-truth`, where D1 is taken.
By the time anybody executes here the answer exists. But these plans are being authored now, and a
plan that says "cache the scheduling representation's entities" would be a guess dressed as an
instruction. The master plan states the rule as "read the answer, never assume it" and names the two
places D1 bites: which entities the cache is keyed on, and whether the chat poll is deleted or
repaired.

**The alternative rejected.** Waiting for D1 before authoring. That would have left the scope
undecomposed for the length of two other scopes, and most of its content does not depend on the
answer: the transport, the reconnect policy, the recovery rule and the badge-versus-list defect are
the same whichever representation wins.

## What "written against D2 being unmade" means concretely

**Decision.** The envelope is structure and the event catalogue is configuration. This scope defines
the shape every message carries and the rules for applying one, and adding an event type is a line of
configuration in whichever scope introduces it.

**Why.** D2 decides when a hold starts, which changes which events exist rather than what an event
looks like. A hold at request time needs a "this window is now held" event that today's catalogue
does not have; a hold at acceptance keeps the events that exist. Neither reading changes the fields
of an envelope or what a client does when the version it receives is two ahead of the version it
holds.

**The test this rule has to survive.** When `contention-and-holds` adds its event, the change here
should be one entry in a catalogue and no change to the envelope, the transport, or the apply rule.
If it turns out to need more than that, this decision was wrong and the envelope was designed too
close to today's events.

## The cache decision is left open rather than answered here

**Decision.** Which library owns remote state, or whether one is written by hand, is not answered in
this master plan. The plan that takes it lays out the candidates and the criteria.

**Why.** It is the one genuine decision this scope contains, and answering it in a master plan
written unattended would have hidden the reasoning inside a sentence. The obvious candidate is
TanStack Query, and "obvious" is exactly the condition under which a decision gets taken without its
alternatives being written down, which is what makes it impossible to revisit later.

**What the master plan does say**, so the plan is not starting from nothing: there is no data layer
in `frontend/package.json` today, the thing being replaced is 132 `fetch` call sites across 38 of 110
files, and the decision has to state which of its candidates a Tailwind or Material UI decision would
invalidate.

## D10 is named as a constraint on the cache decision without becoming a dependency

**Decision.** The frontend stack decision is named as something the cache decision must state its
exposure to, and this scope does not wait on it.

**Why.** `the-design-system`, scope 12, owns D10 and waits on nothing after the blockers, so the two
scopes can easily run at the same time. They touch at one point, which is what ships in the bundle,
and at no point in the API a component calls: a cache exposes hooks and a design system exposes
components. Making this scope wait on that one would serialise two independent pieces of work over a
question that changes neither's interface.

## The server-side push gap belongs to `running-the-workers`, not here

**Decision.** This scope does not fix `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`), the writer that persists a notification row and never
pushes it.

**Why.** [The sibling scope's definition of done](../running-the-workers/MASTER_PLAN.md#definition-of-done)
already claims it, in the criterion about the scheduling notification path pushing as well as
persisting over the same group the chat path uses. One line owned by two scopes is one line fixed
twice, or, more likely, one line each scope assumes the other did.

**Where the boundary sits.** Scope 6 owns whether a message is sent. This scope owns what is inside
it and what the client does when it arrives. The two meet at the payload, which is why this scope's
Definition of Done names the two writers by file rather than by behaviour.

## The screens belong to `the-event-workspace`, not here

**Decision.** No optimistic updates, no autosave, no persistent shell, no convergence dashboard.

**Why.** Those are item 11 in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#11-the-event-workspace),
which waits on this one. They are also the things most likely to pull a cache scope into rewriting
screens, because each of them is easier to demonstrate than a cache is. The separation is worth
holding: this scope is finished when the data is right and no screen has necessarily changed
appearance at all.

**The one place it is nearly violated.** The badge-and-list disagreement in
`frontend/src/components/notifications/useNotifications.js` is a screen defect with a cache cause,
and it stays here because fixing it means deleting a poll and deriving two values from one cached
collection, which is cache work. The panel it renders into is untouched.

---

## The map adds nothing to the parent's vocabulary, and this was checked rather than asserted

**Decision.** The child map declares no new glyph, no new colour meaning and no new tier.

**Why it holds.** Everything this scope draws is already in the parent's list. The browser card, the
person figure, the handler glyph, the worker gear, the queue tray and the cylinder are the six
glyphs it needs. Blue dashed already means an HTTP request, purple dashed already means a WebSocket
push, orange dashed already means a queued or outbox event, red already means a confirmed defect, and
the grey dashed hedge outline already means unconfirmed. The one thing this scope is about, a client
holding several copies of one fact, is drawn by repeating the browser card, which needs no new
vocabulary at all.

**What was resisted.** A new glyph for the cache. It would have been the natural thing to invent, and
it is unnecessary: a cache in this art direction is a cylinder in the browser tier, and the tier is
what says it is not the database.

## The parent capstone gets three labelled glyphs, not one

**Decision.** The experience panel in [the parent's subject capstone](../../diagram-prompts.md) now
holds three labelled component glyphs, one per experience-plane scope, rather than only the one this
decomposition needed.

**Why.** The capstone's domain panel already names all five of its scopes, decomposed or not, so the
picture describes the scope structure rather than the decomposition state. Adding one label to the
experience panel and leaving two components unnamed would have made that panel read as though it
held one scope, and would have forced the same amendment twice more when
`the-event-workspace` and `the-design-system` are decomposed.

**What it costs.** The capstone is `[built]` and its rendered image at
`diagrams/whole-scope-in-one-picture.png` does not show these labels, so the prompt and the image
disagree by one more item than they already did. That disagreement is recorded in the capstone's own
list of things waiting on the next render, alongside the three that were already there, rather than
being left for a reader to spot.

**The performance panel was left alone.** It holds one scope, so the panel is that scope's glyph and
labelling it twice would say nothing.

## The planning notes' count of coming capstone amendments was corrected

**Decision.** The paragraph in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
that predicts four capstone amendments is rewritten to what is true after this commit.

**Why.** It listed `performance-architecture`, `the-event-workspace`, `the-design-system` and
`getting-it-out` as the scopes with no glyph to zoom into, which was wrong in both directions by the
time this run started. `getting-it-out` has had a labelled deploy glyph since the capstone was
amended to name it, and `one-client-truth` was not on the list despite having no glyph. Leaving a
prediction that is wrong in two ways is worse than leaving no prediction, because the next
decomposition trusts it and skips a check.

## Where this scope's row sits in the parent's running order

**Decision.** One placeholder row at step 16, immediately after `running-the-workers`, marked as
having no plan files yet.

**Why.** The skill's rule is to interleave a child's plans into the parent table at the step numbers
where they belong, and to add one placeholder row naming the scope when the child has no plans yet.
This scope waits on scope 6 and on nothing else, so the step after 15 is where it belongs. The
undecomposed domain scopes 7, 8 and 9 will land above it when they are decomposed, which the table's
note already explains for the two that sit below step 11.

**What this does not claim.** A placeholder row is not a plan. When `populate-plans` runs here it
replaces that one row with a row per plan file, and the numbers below it move.

## The plans folder starts empty, and carries a `.gitkeep`

**Decision.** `plans/` is created empty with a single `.gitkeep` file inside it.

**Why.** The skill's rule is that plan files are authored later by `populate-plans` and never invented
at decomposition time. Git does not track an empty directory, so without the placeholder file the
folder would exist on this machine and not in the commit, and the next person to clone would find the
master plan pointing at a folder that is not there.

## Two prose references to this scope became links

**Decision.** The two places in
[the sibling scope's fourth plan](../running-the-workers/plans/04-close-the-two-silent-losses.md)
that name `one-client-truth` in backticks now link to this master plan.

**Why.** They were written as backticked names because the scope did not exist. It exists now, and a
name a reader has to go and find is a name that does not get followed. Nothing else about those two
lines changed.

## The process lane was not authored

**Decision.** This scope's map carries the subject lane and its capstone, and says the process lane
comes later.

**Why.** A process lane draws the scope's plan files as stages, and this scope has no plan files.
Authoring one now would mean inventing the plans it draws, which is exactly what decomposition is not
allowed to do. The parent's own map makes the same call for the same reason.

## The findings live in the master plan rather than in a plan file

**Decision.** The thirteen `path:line` findings are in the master plan under "What is true today",
not held back for the plans to rediscover.

**Why.** They are what the scope is for, and several of them change what the plans should say: the
`F("version")` constraint, the absent `BookingRequest` version, the badge-and-list split, the
permanent fallback in one component and not the other. A plan file authored without them would
propose work that the code already does or misses work the code needs. The sibling scope made the
same call, so the two read alike.

---

## What was checked before this run finished

**Every claim in the master plan carries a file and a line**, and each was read rather than
remembered. The counts (132 fetch call sites, 38 of 110 files, 73 files with `useState`, three
`new WebSocket` sites, zero `transaction.on_commit`) came from running the search, not from an
estimate.

**No handoff pointer was broken.** The parent master plan carries no `▶ Next:` or `◀ Needs:` lines,
and the parent has no plan files of its own, so there was nothing pointing at the row this run
replaced. This was confirmed by searching for both markers in the parent before and after.

**Every relative link in the three new files resolves** from this folder, checked by resolving each
path against the filesystem rather than by pattern.

## What this run did not do

**No image was rendered.** Every prompt in this scope's map is `[planned]` and unrendered, which
matches the sibling scopes and the parent. Rendering is a separate act with its own read-back check,
and doing it unattended would have filed images nobody compared against their notes.

**No plan file was authored.** `populate-plans` owns that, and running it here would have written the
work breakdown for a scope whose one real decision is still open.
