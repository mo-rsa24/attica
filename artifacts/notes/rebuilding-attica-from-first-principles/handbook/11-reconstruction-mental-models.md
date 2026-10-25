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
- A [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> event is a delivery mechanism, not a persistence model.
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
  - ignoring [authorization](../../../../../../Obsidian/Information%20Technology/Security/Authorization.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=322 "Systems analysis and design, chapter 8, Access control requirements, Works example requirements: only department managers may change inventory in their own d..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=324 "System design big archive, Access Control Clearly Explained, Role-based access control, attribute-based access control and access control lists, with what ea..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, An API gateway checking a user's JWT claims, or a developer's API key against a key store, before it forwards ..."), [▶1](https://www.youtube.com/watch?v=DT6Zy1X3ytM&t=174s "Hayk Simonyan, Authorization Explained: When to Use RBAC, ABAC, ACL & More, RBAC: Role-Based Access Control, 2:54 to 3:58, Role-based access control, after t..."), [▶2](https://www.youtube.com/watch?v=ZV5yTm4pT8g&t=0s "ByteByteGo, OAuth 2 Explained In Simple Terms, 0:00 to 4:32, OAuth 2, the delegated form, where one site gets limited access to your data on another without ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/16-the-permission-filter.md "Filter by role before ranking, and measure what it changed, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan...")</sub> scoping
  - coupling external side effects directly into correctness-sensitive transactions

## Final Engineering Standard
You understand the system well enough to rebuild it from scratch when you can:
- explain each major subsystem as a set of abstractions and tradeoffs
- describe where state lives and why
- identify which workflows need stronger correctness guarantees than others
- replace implementation details or libraries without losing the underlying design
