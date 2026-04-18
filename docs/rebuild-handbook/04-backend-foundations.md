# 04. Backend Foundations

## Purpose
This chapter teaches the Django and Django REST Framework material required to understand and independently reconstruct the backend architecture used in this system. It focuses on what the codebase actually relies on: domain apps, serializers, view classes, model-centric rules, service-layer workflows, and realtime support.

Prerequisites: [01 System Map](./01-system-map.md), [02 Knowledge Graph](./02-knowledge-graph.md).  
Follow-up: [05 Marketplace and Role Model](./05-marketplace-and-role-model.md), [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md), [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).

## Required Background

### You Should Already Know
- basic Python syntax
- functions, classes, and imports
- relational database basics
- HTTP methods and status codes

### This Chapter Will Teach
- Django project/app structure
- ORM and model design patterns visible in the repo
- DRF views, serializers, routers, and permissions
- architectural placement of business logic
- ASGI, Channels, Redis, and management command concepts at a practical level

### Deferred to Later Chapters
- domain-specific provider modeling
- event draft lifecycle design
- scheduling-specific policy and conflict logic
- deeper operational reliability patterns such as outbox and dead-letter handling

## Django Core Mental Model Needed for This System

### Project vs App
- Why it exists: the backend is one Django project containing multiple domain apps.
- Where it appears: `main/settings.py`, `main/urls.py`, installed apps such as `events`, `users`, `vendors`, `artists`, `locations`, `chat`, `notifications`, and `scheduling`.
- Mastery unlocks: you can partition a large backend by domain without fragmenting deployment.

### Settings, URLConf, Views, Models, Templates, Management Commands
- Why they exist: these are Django’s main extension points for configuring runtime behavior and domain code.
- Where they appear: settings file, app URLs, `views.py`, `models.py`, templates in legacy server-rendered areas, management commands in scheduling and events.
- Mastery unlocks: you can find the right home for configuration, routing, state, and operational scripts.

### Request/Response Lifecycle
- Why it exists: every API call enters through middleware, routing, view logic, serializer/model logic, then returns a response.
- Where it appears: all API surfaces, especially auth and scheduling.
- Mastery unlocks: you can debug where a failure belongs in the stack.

### Middleware as Cross-Cutting Processing
- Why it exists: some concerns apply to many requests at once.
- Where it appears: CORS middleware, auth/session middleware, custom API debug middleware.
- Mastery unlocks: you can tell when behavior belongs outside specific views.

## ORM and Model Design Material

### Fields and Relationships
- Why they exist: the product is centered on users, events, providers, resources, requests, and bookings.
- Where they appear: provider apps, events, chat, scheduling.
- Mastery unlocks: you can reconstruct the domain model as tables and relations instead of API-shaped blobs.

### Foreign Keys and One-to-One Modeling
- Why they exist: some relations are many-to-one, while others represent a unique extension of an entity.
- Where they appear: provider profiles tied to users, `MarketplaceResource` linking one provider-specific object, bookings tied to resources and events.
- Mastery unlocks: you can choose the right relational shape for domain invariants.

### Model Validation via `clean`
- Why it exists: some rules are true regardless of which API path writes the model.
- Where it appears: scheduling policy, resource, availability rule, and exception validation.
- Mastery unlocks: you can move invariant checks closer to the data model.

### Constraints and Indexes
- Why they exist: correctness and query performance matter for booking and availability data.
- Where it appears: uniqueness and check constraints in scheduling models, indexes on status/time/resource fields.
- Mastery unlocks: you can distinguish convenience validation from database-enforced safety.

### QuerySets, Filtering, Annotation, and `select_related`
- Why they exist: detail pages, search endpoints, nearby lists, and dashboards all need shaped queries rather than raw table dumps.
- Where it appears: event listing logic, location distance queries, artist bookings, chat message retrieval.
- Mastery unlocks: you can make API views express read models efficiently.

## Django REST Framework Material Required

### Serializers as Boundary Contracts
- Why they exist: the API needs a stable way to validate input and shape output.
- Where they appear: all domain apps with REST APIs.
- Mastery unlocks: you can separate transport concerns from core domain concerns.

### `ModelViewSet` for CRUD-Heavy Resources
- Why it exists: many domain entities are primarily created, listed, retrieved, updated, and deleted.
- Where it appears: events, artists, vendors, locations, scheduling resources and policies.
- Mastery unlocks: you can use DRF’s conventions where they fit instead of hand-writing every endpoint.

### `APIView` for Workflow Endpoints
- Why it exists: transitions such as approve, withdraw, refresh checkout, and mark notifications read are not plain CRUD.
- Where it appears: scheduling workflow endpoints, chat room creation, notifications actions.
- Mastery unlocks: you can model behavior-rich operations cleanly.

### Generic Views for Narrow Read/Write Cases
- Why they exist: some endpoints are narrower than full viewsets but still benefit from DRF conventions.
- Where it appears: profile retrieval/update, popular lists, similar item lists.
- Mastery unlocks: you can select the simplest view abstraction that matches the use case.

### Routers and URL Registration
- Why they exist: consistent REST URLs matter across many domain apps.
- Where it appears: app-level `api_urls.py`, scheduling router registrations.
- Mastery unlocks: you can create predictable API topologies and know when to step outside router defaults.

### Authentication, Permissions, Pagination, and Action Endpoints
- Why they exist: the API must distinguish public and private surfaces, constrain behavior, and support list endpoints at scale.
- Where they appear: auth settings, permission classes, view-specific filters, paginated list endpoints, `@action` methods.
- Mastery unlocks: you can turn one data model into multiple externally safe interfaces.

## Auth and API Concerns

### JWT with SimpleJWT
- Why it exists: the frontend authenticates through bearer tokens and refreshes them over time.
- Where it appears: accounts login/refresh endpoints, DRF auth settings, frontend auth provider.
- Mastery unlocks: you can reason about stateless API auth and token refresh behavior.

### Authenticated vs Public Endpoints
- Why it exists: some data is browseable while other operations depend on user identity and ownership.
- Where it appears: event public reads vs create/update, notification endpoints, scheduling actions.
- Mastery unlocks: you can classify APIs by exposure level and avoid accidental overexposure.

### Queryset Scoping by Request User
- Why it exists: “what you can see” is often not the whole table.
- Where it appears: promo codes for your events, current vendor profile, provider-owned records, organizer event lists.
- Mastery unlocks: you can encode ownership in read behavior, not just write behavior.

### Permission Enforcement at Multiple Levels
- Why it exists: some rules belong at view level, some at serializer level, some at domain/service level.
- Where it appears: role checks in create actions, object ownership tests, scheduling policy checks.
- Mastery unlocks: you can apply the right layer of defense for each rule.

## Architecture Material

### Models vs Serializers vs Views vs Services
- Models hold invariants and relationships.
- Serializers validate API-shaped input/output.
- Views orchestrate request handling and authorization.
- Services hold complex workflow logic that would otherwise make views unmaintainable.

- Why this matters: a rebuild that ignores these boundaries becomes brittle quickly.
- Where it appears: especially clear in the scheduling subsystem, where service functions own policy checks, conflict detection, idempotency, audit, and outbox emission.
- Mastery unlocks: you can place logic by responsibility instead of by convenience.

### Why a Service Layer Emerges
- Why it exists: scheduling transitions combine transactions, conflict detection, policy enforcement, and side effects.
- Where it appears: `backend/main/scheduling/services.py`.
- Mastery unlocks: you can identify when a view is too small a home for the domain behavior.

### Transaction Boundaries, Idempotency, and Consistency
- Why they matter: booking and scheduling workflows can be retried; they must produce the same result on repeated calls.
- Where it appears: scheduling service functions that check conflicts, lock holds, and emit outbox events.
- Mastery unlocks: you can identify when a workflow is unsafe to retry and how to harden it.

### Service Layer as Workflow Orchestrator
- Why it exists: views orchestrate requests; serializers validate boundaries; but services orchestrate domain logic.
- Where it appears: `backend/main/scheduling/services.py` contains functions like `complete_booking()`, `approve_request()`, `withdraw_request()` rather than burying logic in views.
- Common mistake: putting transaction logic, policy checks, and side effects into view classes, making them hard to test and reuse.
- How to apply: if a view would be more than ~50 lines because of transaction/policy/notification logic, move the logic to a service function and call it from the view.

### When to Validate in Models vs Serializers vs Services
- **Model layer** (`clean()` method): invariants that must hold regardless of how the model is created (constraint checks, state transitions that are always invalid).
- **Serializer layer**: API-shape validation, permission checks that depend on the request context.
- **Service layer**: complex workflows that involve multiple records, transactions, and side effects.
- Example: a `BookingRequest` cannot be approved if it's already in a terminal state. This check belongs in the service (`approve_request()`) because approval involves transactions and notifications.

## Query Patterns for Complex Reads

### Shaped Queries with Annotation and Aggregation
- Why it matters: list endpoints and dashboards often need computed fields like `average_rating`, `review_count`, `total_upcoming_bookings`.
- Pattern: use `annotate()` with `Avg()`, `Count()`, `Sum()` to compute these at the database level, not in Python.
- Common mistake: fetching all reviews in Python and computing averages, then doing it again for every item in a list.
- How to apply: `Booking.objects.annotate(total_cost=F('price') * F('duration')).filter(...)`

### Prefetch-Related and Select-Related
- Why it matters: detail pages often need related objects; fetching them one-by-one (N+1 problem) kills performance.
- Pattern: use `select_related()` for ForeignKey/OneToOne (one SQL join), `prefetch_related()` for reverse FK and M2M (separate queries, cached in Python).
- Common mistake: accessing `booking.marketplace_resource.artist` without prefetching, causing 100 extra queries on a list page.
- How to apply: `Booking.objects.select_related('marketplace_resource').prefetch_related('reviews')`

## Role-Based API Design

### Scoping Querysets by User Ownership
- Why it matters: users should only see and edit records they own, even if the URL is public.
- Pattern: override `get_queryset()` in views to filter by `request.user`.
- Common mistake: checking ownership only in update/delete, allowing any user to read other users' private data.
- How to apply: 
  ```python
  def get_queryset(self):
      return BookingRequest.objects.filter(organizer=self.request.user)
  ```

### Permission Layers: View vs Serializer vs Service
- **View level**: authentication (is there a user?), general role checks (is this user a provider?).
- **Serializer level**: request-context-dependent validation (can you create this because you own this resource?).
- **Service level**: business rule enforcement (can you approve this because the booking is in the right state?).
- Common mistake: one giant `if self.request.user.role != 'artist'` at the top of a view. Better to use permission classes and serialize the logic.

### Custom Action Endpoints vs New Viewsets
- When to use `@action` decorators: state transitions, non-CRUD operations tied to a single resource (approve, withdraw, review).
- When to create a new viewset: genuinely separate resources with their own CRUD (reviews, availability rules).
- Pattern: avoid creating 30 viewsets when 5 viewsets with 15 custom actions would be clearer.
- Why they exist: booking and checkout flows cannot tolerate double execution or inconsistent partial writes.
- Where they appear: scheduling service functions using transactions, idempotency records, and conflict handling.
- Mastery unlocks: you can reason about correctness under retries and concurrent requests.

## Async, Realtime, and Infrastructure Concepts

### ASGI vs WSGI
- Why it matters here: the project uses Channels and websocket routes, which pushes it beyond a classic synchronous-only Django mental model.
- Where it appears: ASGI application setting, routing config, websocket consumers.
- Mastery unlocks: you can understand why the backend supports both normal HTTP requests and realtime connections.

### Channels for Websocket Delivery
- Why it exists: chat rooms and notifications need server-pushed updates.
- Where it appears: chat and notifications routing, consumers, channel layer configuration.
- Mastery unlocks: you can separate message delivery mechanics from domain-state changes.

### Redis as Cache and Channel Layer Support
- Why it exists: the project uses Redis for caching and channel layer infrastructure.
- Where it appears: cache settings and Channels configuration in settings.
- Mastery unlocks: you can see Redis here as supporting infrastructure rather than product-domain logic.

### Management Commands for Operational Work
- Why they exist: some tasks are better run as explicit commands than as user-triggered requests.
- Where it appears: scheduling commands for expiring holds, materializing availability, running outbox workers, and seed/demo flows.
- Mastery unlocks: you can design operational routines without turning them into awkward API endpoints.

## Grounded Examples

### URL Topology Pattern
Small example:
- `main/urls.py` mounts separate API namespaces for events, accounts, locations, vendors, artists, chat, notifications, and scheduling.

General pattern:
- A domain-oriented URL tree makes the backend readable and lets apps evolve semi-independently.

Intent behind the design:
- The system is a platform of related domains, not one flat REST namespace.

How to recreate without copying:
- Group endpoints by business domain first, then decide which apps and routers own those namespaces.

### Service-Layer Scheduling Pattern
Small example:
- scheduling services compute request hashes, enforce policies, create audit records, detect checkout-hold conflicts, and emit outbox events.

General pattern:
- Complex workflows need a dedicated domain layer between the HTTP view and the database.

Intent behind the design:
- Correctness-sensitive logic becomes easier to test and reason about when it is explicit and reusable.

How to recreate without copying:
- Once a workflow needs transactions, idempotency, or multiple coordinated writes, move the logic into a service boundary with a clear input/output contract.

## Recommended Learning References
- Django docs:
  - projects and applications
  - models and queries
  - URL dispatcher
  - class-based views
  - middleware
  - settings
  - management commands
  - deployment overview
- Django REST Framework docs:
  - serializers
  - generic views
  - `APIView`
  - viewsets
  - routers
  - authentication and permissions
- SimpleJWT docs:
  - token pair flow
  - refresh lifecycle
- Django Channels docs:
  - ASGI overview
  - channel layers
  - websocket consumers
