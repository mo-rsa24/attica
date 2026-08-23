# 🌍 Context: Attica

What Attica is about in the real world: the problem it solves, the people and things behind the
data, where the data comes from, and what every field means. What the system *is* lives in
[../environment/overview.md](../environment/overview.md). This folder is only the meaning.

Attica is a South African events platform. An organizer plans an event in one place instead of
across WhatsApp, spreadsheets, email and social media direct messages, and books the venue, the
artists and the service providers they need without leaving it.

## I want to know...

| The question | Where it is answered |
|---|---|
| What is Attica actually for, and who is waiting on it | [The problem § Who has the problem](purpose/01-the-problem.md#who-has-the-problem) |
| What does an organizer get out of it | [What we produce § The output, concretely](purpose/02-what-we-produce.md#the-output-concretely) |
| How would we know this is working | [What working means § The test](purpose/03-what-working-means.md#the-test) |
| Why is there one table for venues, artists and vendors | [Marketplace resource § What a marketplace resource is](world/marketplace-resource.md#what-a-marketplace-resource-is) |
| There are five tables called Booking. Which one is real | [Booking § What people get wrong](world/booking.md#what-people-get-wrong) |
| What is the difference between a booking and a booking request | [Booking request § What a booking request is](world/booking-request.md#what-a-booking-request-is) |
| What is an event, and how is it different from a draft | [Event draft § What people get wrong](world/event-draft.md#what-people-get-wrong) |
| Why does a user have two different kinds of role | [Organizer § What people get wrong](world/organizer.md#what-people-get-wrong) |
| What does a provider publish so organizers can find them | [Availability § What availability is](world/availability.md#what-availability-is) |
| How do an organizer and a provider agree a price | [Chat room § What a bid is](world/chat-room.md#what-a-bid-is) |
| What is a ticket here, and what is not built yet | [Ticket § What people get wrong](world/ticket.md#what-people-get-wrong) |
| Where does the data come from at all | [Where it comes from § The journey](data/01-where-it-comes-from.md#the-journey) |
| What does `current_step` or `resource_type` mean | [Dictionary](data/02-dictionary.md) |

## The themes

| Folder | What it answers | Files |
|---|---|---|
| [purpose/](purpose/) | Why Attica exists, what it produces, what working looks like | 3 |
| [world/](world/) | The real people and things behind the data | 13 |
| [diagram-prompts.md](diagram-prompts.md) | Picture prompts, 7 written, 0 rendered | 1 |
| [data/](data/) | Where the data comes from, and what every field means | 2 |

Picture prompts are in [diagram-prompts.md](diagram-prompts.md); rendered images sit in
`diagrams/`. Documents outside the repo that this folder draws on are listed in
[sources.md](sources.md).

## Still open

The things nobody could say yet. Each carries who or what would settle it.

- [ ] Which of the two role systems is meant to survive. Both are enforced today, in different
      apps. Would settle it: a decision from the product owner. See
      [Organizer § What people get wrong](world/organizer.md#what-people-get-wrong).
- [ ] Whether the four vestigial booking tables are kept deliberately or are dead weight nobody
      removed. Would settle it: the product owner. See
      [Booking § What people get wrong](world/booking.md#what-people-get-wrong).
- [ ] What a successful event means to an organizer, in their own words, well enough to measure.
      "Facilitates a successful event" is the mission; the measurable version does not exist yet.
      Would settle it: talking to a real organizer. See
      [What working means § What this cannot tell you](purpose/03-what-working-means.md#what-this-cannot-tell-you).
- [ ] Whether anyone outside the builder has used Attica to plan a real event. Nothing in the
      repository indicates real usage. Would settle it: the product owner.
- [ ] Whether the platform is meant to take payment, and if so for what. The `Event` model carries
      prices and the `Ticket` model carries a paid flag, but no payment integration exists. Would
      settle it: the product owner. See [Ticket § What people get wrong](world/ticket.md#what-people-get-wrong).

## Pictures still missing

- [ ] 📷 [world/event.md § What it looks like](world/event.md#what-it-looks-like): a screenshot of
      a published event listing as an attendee sees it. Save as `images/world/01-event-listing.png`.
- [ ] 📷 [world/event-draft.md § What it looks like](world/event-draft.md#what-it-looks-like): the
      event creation wizard mid-flow, showing the step indicator. Nine step screenshots already
      exist in the learning journey at
      `/home/molef/goal-setting/learning/attica-event-creation/artifacts/figures/walking-the-event-creation-flow/` and one can be
      copied here. Save as `images/world/02-wizard-mid-flow.png`.
- [ ] 📷 [world/chat-room.md § What a bid is](world/chat-room.md#what-a-bid-is): the chat panel
      with a bid card in the thread. Save as `images/world/03-bid-in-thread.png`.
- [ ] 🖼️ [diagram-prompts.md § Prompt 1 (Subject)](diagram-prompts.md#prompt-1-subject-one-table-three-kinds):
      the three provider kinds collapsing into one marketplace resource. Paste, render, save as
      `diagrams/world-01-one-table-three-kinds.png`.
- [ ] 🖼️ [diagram-prompts.md § Prompt 1 (Process)](diagram-prompts.md#prompt-1-process-draft-to-published-event):
      draft to published event, and what the publish step promotes. Paste, render, save as
      `diagrams/data-01-draft-to-event.png`.
- [ ] 🖼️ Five more prompts are written and unrendered: two subject, one subject capstone, one
      process, one process capstone. All are in [diagram-prompts.md](diagram-prompts.md), which
      carries the running count.
