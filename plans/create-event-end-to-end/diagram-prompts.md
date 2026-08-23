# Diagram prompts: create event end to end

## Art direction

Inherited, not invented. The existing eleven-piece flow map at
`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md` already establishes the look,
and this scope adopts it so both sets read as one.

**Style.** Premium system-design infographic. Clean white or very light gray background. Glossy
semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms.
Flows drawn as vivid colour-coded dashed arrow lines, each colour meaning exactly one kind of flow,
with a small legend inside the image. Related components grouped inside rounded soft-tinted panels
with a short title on the panel. A bold title banner across the top. Official product logos only on
components that are that product; every other component gets a clean generic glyph. Small cartoon
figures for external actors. Clean sans-serif labels under every icon, short and lowercase-friendly.
Generous spacing, no clutter, no watermark.

**Meaning palette.** Blue dashed is an HTTP request. Green solid is a database write. Orange dashed
is a queued or outbox event. Purple dashed is a WebSocket push. Red is a confirmed defect. A grey
dashed hedge outline with an "unconfirmed live" tag marks anything not directly observed.

**Glyph vocabulary and tier.** Browser tier: a browser card, a person figure, a form row. Application
tier: a handler glyph, a worker gear, a queue tray. Data tier: a cylinder. External: a globe. Each
glyph appears only in its own tier.

**Reading axes.** The dominant axis is vertical: upward dependency, blockers at the bottom and
acceptance at the top. The secondary axis is horizontal, and it encodes only one thing: two lanes
side by side means those two can run at the same time.

These four are pinned at scope birth. Every child scope inherits them, and every later regeneration
of the process lane is compared against the snapshots before it.

---

## Subject lane

### Piece 1: the way in `[planned]`

**Visual thesis.** Five roles are gated on and two are ever granted, so most of the product is
unreachable.

Five person figures in the browser tier labelled organizer, artist, vendor, venue manager, ticket
buyer. Each has an arrow toward its own dashboard card. Two arrows are green and complete; three
end at a closed red gate labelled with the role constant nothing grants. Below, a data-tier cylinder
labelled `users_customuser` with a small table glyph showing nine seeded users carrying no role
chip at all. Every element hedged, since nothing here is built yet.

### Piece 2: four bookings, one concept `[planned]`

**Visual thesis.** Four live representations of the same idea, each with its own states and its own
notion of availability, and the most-used one is not the most complete one.

Four application-tier panels side by side, each containing a state-machine glyph with a different
number of states and its own small availability cylinder. A reference-count chip on each. One panel
carries a crown glyph labelled "most complete", a different panel carries a weight glyph labelled
"most used". A single question-mark glyph above them labelled "which survives" in the decide colour.

### Piece 3: what a request holds `[planned]`

**Visual thesis.** Two organizers can both be waiting on the same window, and the hold does not start
until someone accepts.

A horizontal time bar labelled 18:00 to 22:00, drawn three times in a vertical stack. Top bar: two
organizer figures each with a blue dashed arrow into it, the bar still coloured available, a red
chip reading "neither is told". Middle bar: one provider figure pressing accept, the bar turning to
hold colour with a countdown glyph labelled `hold_expires_at`. Bottom bar: a payment glyph, the bar
turning to booked. A side panel shows the policy field with its three values and an arrow indicating
which value chooses which behaviour.

### Piece 4: built and inert `[planned]`

**Visual thesis.** The machinery exists and nothing turns it.

An application-tier panel holding eleven command glyphs in a row, all drawn in muted grey with no
outbound arrows. Beside them an outbox tray glyph, full, with an orange dashed arrow that stops at a
gap. In the browser tier, a socket glyph connected at the client end and open at the server end, with
a chip reading "subscribed, nothing publishes". A single missing gear glyph in the centre, drawn as
an outline, labelled with the one decision that starts all of it.

### Piece 5: the change that reaches a screen `[planned]`

**Visual thesis.** Persist first, push second, and a version on every message so a client can tell a
duplicate from a gap.

Left to right across three tiers: a command arrow into a handler, a green solid write into a
cylinder carrying two rows written in one transaction, one business row and one outbox row, then an
orange dashed arrow to a worker, then a purple dashed fan-out to two browser cards. Each browser card
carries a small version counter, one showing an applied increment and one showing a detected gap with
a refetch arrow looping back to the application tier.

---

## Subject capstone

### The whole scope in one picture `[built]`

Rendered to [diagrams/whole-scope-in-one-picture.png](diagrams/whole-scope-in-one-picture.png),
1024x1536, 2026-08-23. Reads correctly: the four panels stack, the gating label sits on the arrow
out of blockers, the two upper planes are drawn side by side at the same height with the band
between them, and the acceptance panel carries two browsers with the refresh crossed through.

Three things to fix on the next render. The five domain glyphs are unlabelled apart from "booking
truth", so a reader cannot tell contention from workers from availability from the journey; the
label belongs on each glyph. The arrows inside the domain panel point inward toward booking truth,
and the dependency runs the other way. And the deploy glyph in the alongside column carries no label.

**Visual thesis.** Nothing above the blockers is measurable until the blockers land, the domain plane
gates both other planes, and the two upper planes run side by side.

Four stacked rounded panels, bottom to top. The bottom panel, blockers, holds two glyphs: a test
suite card with a red cross and a login card with three closed gates. An upward arrow leaves it
carrying the label "nothing above is measurable until this is green". The panel above, domain, holds
five component glyphs with the booking-truth glyph feeding the other four. Above that, two panels
drawn side by side at the same height, performance on the left and experience on the right, both
receiving an upward arrow from domain, with a horizontal band between them labelled "these two run at
the same time". The top panel, acceptance, holds two browser cards facing each other with a purple
dashed arrow between them and a refresh glyph crossed through.

To the right of the whole stack, outside the panels, two smaller glyphs on their own vertical line
labelled "alongside, from day one": a layers diagram glyph labelled "the system in layers", and a
deploy glyph.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

Not authored yet. `populate-plans` writes it once this scope has plan files, and each changed
regeneration is stamped into `diagrams/process-versions/`.
