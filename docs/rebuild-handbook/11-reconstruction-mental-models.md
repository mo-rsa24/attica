# 11. Reconstruction Mental Models

## Purpose
This chapter explains how an engineer should think while rebuilding a system like this from scratch. It focuses on design decisions, tradeoffs, and common mistakes rather than framework syntax.

Prerequisites: all earlier chapters, especially [06](./06-event-creation-and-draft-workflows.md), [07](./07-scheduling-and-booking-engine.md), and [09](./09-full-stack-integration-patterns.md).

## Frontend Shell Mental Model
- Think in route groups, not isolated screens.
- Put identity and cross-route workflow state in providers.
- Keep page orchestration local unless multiple routes truly need the same state.
- Common pitfall: globalizing too much state too early and making every render path harder to reason about.

## Backend Domain Model Mental Model
- Start from stable domain nouns, not endpoints.
- Distinguish public read models from correctness-sensitive write workflows.
- Put invariants near the data model, but move orchestration into services when workflows become transaction-heavy.
- Common pitfall: forcing every behavior into CRUD-shaped endpoints.

## Scheduling Engine Mental Model
- Separate “what can be booked” from “under what policy” from “at what times” from “what lifecycle stage the interaction is in.”
- Treat requests, holds, and bookings as different commitments.
- Expect retries and collisions; design for them early.
- Common pitfall: collapsing negotiation, temporary reservation, and confirmed booking into one record.

## Realtime and Feedback Mental Model
- Keep domain truth and user feedback distinct.
- A notification is not the source of truth; it points toward truth.
- A websocket event is a delivery mechanism, not a persistence model.
- Common pitfall: making pushed events the only way to recover state.

## Simplification Strategy For Independent Rebuilds
- Safe simplifications:
  - fewer roles at first
  - fewer provider types
  - simpler dashboard surfaces
  - dynamic availability computation before full slot materialization
- Dangerous simplifications:
  - removing the distinction between draft and published state
  - removing the distinction between request and confirmed booking
  - ignoring authorization scoping
  - coupling external side effects directly into correctness-sensitive transactions

## Final Engineering Standard
You understand the system well enough to rebuild it from scratch when you can:
- explain each major subsystem as a set of abstractions and tradeoffs
- describe where state lives and why
- identify which workflows need stronger correctness guarantees than others
- replace implementation details or libraries without losing the underlying design
