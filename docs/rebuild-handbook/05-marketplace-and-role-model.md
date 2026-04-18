# 05. Marketplace and Role Model

## Purpose
This chapter explains how the product supports multiple participant types inside one platform. It shows how user roles, provider profiles, and shared marketplace behaviors combine to create a unified product rather than separate apps pretending not to be related.

Prerequisites: [03 Frontend Foundations](./03-frontend-foundations.md), [04 Backend Foundations](./04-backend-foundations.md).  
Follow-up: [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md), [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md).

## Core Concepts

### Roles as Product Capability Flags
- Why it exists: organizers, artists, service providers, venue managers, and admins need different actions and dashboards.
- Where it appears: user APIs, frontend route choices, provider create permissions, planner role logic.
- Mastery unlocks: you can model access in terms of product capabilities instead of hard-coding one-off checks.

### Provider Profiles as Domain-Specific Extensions
- Why it exists: artists, vendors, and locations share booking behavior but keep different domain attributes.
- Where it appears: separate apps and serializers for artists, vendors, and locations.
- Mastery unlocks: you can preserve domain richness while still finding common abstractions.

### Shared Marketplace Patterns
- Why it exists: list/detail pages, popularity endpoints, profile pages, and booking-related actions repeat across provider types.
- Where it appears: public listing APIs, profile detail pages, similar/popular endpoints.
- Mastery unlocks: you can distinguish repeated product patterns from app-specific implementation choices.

### Dashboard Variation on a Shared Theme
- Why it exists: dashboards differ by persona but still revolve around “my things, my activity, my next actions.”
- Where it appears: organizer, artist, service-provider, and venue-manager dashboards.
- Mastery unlocks: you can design reusable dashboard architecture around role-conditioned data panels.

## Concept Cluster: Minimum Knowledge To Rebuild
- user identity and roles
- provider-specific profile models
- public listing and detail read models
- owner-scoped edit surfaces
- role-aware navigation and dashboards

How they combine into working features:
- Roles decide what the user can create or manage.
- Provider profiles supply provider-specific data.
- Shared listing/detail patterns expose these profiles to organizers or browsers.
- Dashboards surface role-relevant state and actions.

## Grounded Example
Small example:
- The repo contains separate `artists`, `vendors`, and `locations` apps with their own viewsets and serializers, but the scheduling subsystem later introduces a generalized `MarketplaceResource` that can link to a venue, artist, or vendor.

General pattern:
- Start with rich, domain-specific provider models. Introduce normalization later when a cross-domain workflow genuinely needs it.

Intent behind the design:
- Booking and availability logic want one bookable abstraction; discovery and profile richness still want specialized models.

How to recreate without copying:
- Do not prematurely flatten all provider types into one generic table.
- First identify the shared workflows.
- Then add a normalization layer only for the parts of the system that truly need one.
