# 06. Event Creation and Draft Workflows

## Purpose
This chapter explains how the system treats event creation as a staged workflow instead of a single form submission. It is the clearest example of long-lived shared state spanning frontend and backend concerns.

Prerequisites: [03 Frontend Foundations](./03-frontend-foundations.md), [04 Backend Foundations](./04-backend-foundations.md), [05 Marketplace and Role Model](./05-marketplace-and-role-model.md).  
Follow-up: [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md), [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).

## Core Concepts

### Draft as a First-Class Artifact
- Why it exists: event creation is incomplete for much of its life.
- Where it appears: event drafts, wizard pages, “my events” surfaces, publish actions.
- Mastery unlocks: you can model incomplete work explicitly rather than hiding it in temporary frontend state.

### Multi-Step UI as a Workflow, Not Just a Form
- Why it exists: location selection, provider selection, event details, pricing, policy, media, and review unfold over multiple screens.
- Where it appears: listing wizard routes and event creation context.
- Mastery unlocks: you can decompose complex creation flows into understandable states.

### Progressive Persistence
- Why it exists: users may leave and return; state should survive navigation and refreshes.
- Where it appears: localStorage-backed step state and backend draft persistence.
- Mastery unlocks: you can separate convenience persistence from authoritative persistence.

### Validation Boundaries
- Why it exists: not every step needs full object validation, but publish time requires a stronger completeness check.
- Where it appears: step-specific field whitelists and publish guards.
- Mastery unlocks: you can design workflows that are flexible during creation but strict at publication.

## Concept Cluster: Minimum Knowledge To Rebuild
- route-based wizard structure
- shared provider state
- draft persistence model
- step-specific validation
- publish transition

How they combine into working features:
- The route tree makes each step addressable.
- Shared client state remembers cross-step progress.
- Draft records anchor server-side truth.
- Validation evolves from partial to complete as the artifact approaches publication.

## Grounded Example
Small example:
- The event creation context keeps `steps`, selected providers, event details, current step, and persistence helpers. The events backend distinguishes draft-like and published states and protects published records from regressing.

General pattern:
- A draft workflow needs both mutable working state and a controlled finalization step.

Intent behind the design:
- Users should be able to assemble a complex event gradually, while the system still protects published artifacts from accidental corruption.

How to recreate without copying:
- Define draft state separately from published state.
- Decide what can be incomplete early.
- Decide what must be true before publishing.
- Treat publishing as a state transition, not just a Boolean field flip.
