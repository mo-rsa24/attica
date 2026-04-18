# 08. Realtime and User Feedback

## Purpose
This chapter explains how the system keeps users informed while negotiation and booking work is happening. It connects structured domain state to chat, notifications, and websocket delivery.

Prerequisites: [04 Backend Foundations](./04-backend-foundations.md), [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md).  
Follow-up: [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).

## Core Concepts

### Chat Rooms as Negotiation Context
- Why it exists: booking and bidding often need conversation, not just status changes.
- Where it appears: chat room creation/detail/message APIs and booking-linked room usage.
- Mastery unlocks: you can attach human communication to a structured workflow without collapsing them into the same table.

### Messages and Attachments
- Why they exist: users need both text coordination and supporting files.
- Where it appears: message list/create and attachment upload endpoints.
- Mastery unlocks: you can separate communication content from domain-state transitions.

### Notifications as Lightweight Attention Signals
- Why they exist: users should know when something relevant changed, even if they are not inside the chat or planner.
- Where it appears: notification list/unread count/mark-read endpoints and notification utility calls.
- Mastery unlocks: you can design a second feedback channel optimized for awareness instead of full conversation.

### Websocket Delivery vs REST Polling
- Why it exists: some changes are worth pushing immediately, but the system still keeps REST endpoints as authoritative state surfaces.
- Where it appears: chat and notification websocket routing plus API endpoints.
- Mastery unlocks: you can decide which surfaces need low latency and which can remain request-driven.

## Concept Cluster: Minimum Knowledge To Rebuild
- conversation model
- notification model
- websocket delivery mechanism
- API fallback/read model
- domain-event-to-user-feedback mapping

How they combine into working features:
- a booking-related action produces a message or structured state change
- notification utilities create attention signals
- websocket channels push updates quickly
- REST endpoints remain the source for full state refresh or history loading

## Grounded Example
Small example:
- Chat message creation broadcasts a room event and also triggers a notification for the other participant. Notification APIs separately expose unread counts and mark-read actions.

General pattern:
- One user action can create both domain data and user-facing feedback artifacts.

Intent behind the design:
- Conversation state and notification state serve different UX goals and should not be conflated.

How to recreate without copying:
- Model communication, notifications, and workflow states separately.
- Then define which transitions emit which user-facing signals.
