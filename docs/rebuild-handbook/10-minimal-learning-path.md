# 10. Minimal Learning Path

## Purpose
This chapter extracts the smallest set of topics required to rebuild a functional version of the system without overlearning. It is intentionally pragmatic.

Prerequisites: none beyond general programming ability.  
Recommended companion: keep [02 Knowledge Graph](./02-knowledge-graph.md) open while using this chapter.

## Smallest Viable Curriculum

### Stage 1: React Essentials
Must know:
- components, props, and state
- `useEffect`
- `useContext`
- React Router nested routes
- Fetch API and `localStorage`

Why it matters here:
- these concepts are sufficient to understand protected pages, auth state, multi-step routes, and browser persistence

Recommended sources:
- React docs on components, state, effects, and context
- React Router docs on nested routes and params
- MDN docs on Fetch API and localStorage

### Stage 2: Django Essentials
Must know:
- models and relationships
- migrations
- URL routing
- DRF serializers and viewsets
- `APIView` for custom workflows
- JWT auth basics

Why it matters here:
- these concepts are sufficient to understand domain apps, API contracts, custom workflow actions, and authenticated access

Recommended sources:
- Django docs on models, queries, and URL routing
- DRF docs on serializers, viewsets, generic views, and `APIView`
- SimpleJWT docs on access and refresh tokens

### Stage 3: System-Specific Concepts
Must know:
- draft workflows
- role-based marketplace modeling
- booking lifecycle
- scheduling policy and availability logic

Why it matters here:
- these are the product-specific abstractions that turn a generic React/Django stack into this system

Recommended reading order:
1. [03 Frontend Foundations](./03-frontend-foundations.md)
2. [04 Backend Foundations](./04-backend-foundations.md)
3. [05 Marketplace and Role Model](./05-marketplace-and-role-model.md)
4. [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md)
5. [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md)

## What You Can Skip Initially
- advanced UI libraries beyond what is needed to read route and state architecture
- deployment details
- deep websocket internals
- detailed ops workflows such as outbox dead-letter handling

These matter later, but they are not required to build a functional first reconstruction.

## What Functional Rebuild Competence Looks Like
You can:
- create a React route shell with protected pages
- maintain auth and shared draft state in providers
- design a Django project with domain apps and DRF endpoints
- model providers, events, requests, and bookings
- express a basic scheduling workflow with policies and availability windows
- write async code that handles network errors, HTTP errors, and domain errors correctly
- distinguish when to use optimistic updates vs server authority
- place business logic in services, not in views
- validate data at the right layer (models, serializers, services)

You are not yet optimizing for:
- production observability
- rich realtime behavior
- advanced concurrency hardening
- deep profiling and query optimization

Those come later through [08](./08-realtime-and-user-feedback.md), [09](./09-full-stack-integration-patterns.md), [11](./11-reconstruction-mental-models.md), and the deep-dive references [12](./12-javascript-es6-and-async-patterns.md), [13](./13-design-patterns-and-architectural-decisions.md), [14](./14-python-patterns-and-django-specifics.md).
