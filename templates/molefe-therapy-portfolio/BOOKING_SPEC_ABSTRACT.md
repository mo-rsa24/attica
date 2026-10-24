# Booking System — Domain-Agnostic Blueprint

> **Version:** 1.0
> **Applicability:** Any industry requiring appointment/reservation management (healthcare, salons, consulting, events, rentals, fitness, legal, etc.)

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Core Concepts & Vocabulary](#2-core-concepts--vocabulary-domain-agnostic-glossary)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Booking Lifecycle (State Machine)](#5-booking-lifecycle-state-machine)
6. [Scheduling & Availability Engine](#6-scheduling--availability-engine)
7. [Data Model](#7-data-model-entities--relationships)
8. [Key Workflows](#8-key-workflows-sequence-descriptions)
9. [Architecture & System Design](#9-architecture--system-design)
10. [Extensibility & Configuration](#10-extensibility--configuration)
11. [Acceptance Criteria / Definition of Done](#11-acceptance-criteria--definition-of-done)
12. [Implementation Checklist (Phased Plan)](#12-implementation-checklist-phased-plan)

---

## 1. Purpose & Scope

### 1.1 Purpose

This blueprint defines a **full-lifecycle booking management system** applicable to any domain where time-bounded appointments or reservations are made between a **client** and a **provider** for a **service** or **resource**. It is intentionally domain-neutral; domain-specific terminology and rules are injected via configuration and adapter layers.

### 1.2 Scope

The system covers:

- Client-facing self-service booking (authenticated or unauthenticated)
- Provider/admin schedule and resource management
- Concurrent slot reservation with conflict prevention
- Multi-step client onboarding during the booking flow
- Recurring appointment series
- Waitlist management
- Multi-channel notifications
- [Role-based access control](../../../../Obsidian/Information%20Technology/Security/Authorization.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=322 "Systems analysis and design, chapter 8, Access control requirements, Works example requirements: only department managers may change inventory in their own d..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=324 "System design big archive, Access Control Clearly Explained, Role-based access control, attribute-based access control and access control lists, with what ea..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, An API gateway checking a user's JWT claims, or a developer's API key against a key store, before it forwards ..."), [▶1](https://www.youtube.com/watch?v=DT6Zy1X3ytM&t=174s "Hayk Simonyan, Authorization Explained: When to Use RBAC, ABAC, ACL & More, RBAC: Role-Based Access Control, 2:54 to 3:58, Role-based access control, after t..."), [▶2](https://www.youtube.com/watch?v=ZV5yTm4pT8g&t=0s "ByteByteGo, OAuth 2 Explained In Simple Terms, 0:00 to 4:32, OAuth 2, the delegated form, where one site gets limited access to your data on another without ..."), [◆](../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/16-the-permission-filter.md "Filter by role before ranking, and measure what it changed, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan...")</sub> and audit logging
- Configurable compliance controls (privacy consent, identity verification, data retention)

### 1.3 Out of Scope (configurable extensions)

- Full payment processing gateway integration (schema hooks provided)
- Domain-specific clinical/legal/regulatory logic beyond configurable compliance knobs
- Multi-provider marketplace (architecture notes provided for scaling path)

---

## 2. Core Concepts & Vocabulary (Domain-Agnostic Glossary)

| Term | Definition |
|---|---|
| **Client** | The end-user requesting a booking (e.g., patient, customer, student, tenant) |
| **Provider** | The entity delivering the service (e.g., practitioner, stylist, consultant, instructor) |
| **Service** | A bookable offering with defined duration, capacity, and rules (e.g., session type, class, rental unit) |
| **Resource** | An optional physical or virtual asset tied to a booking (e.g., room, equipment, vehicle) |
| **Slot** | A discrete time window computed from the provider's schedule and service duration |
| **Booking** | A confirmed or pending reservation of a slot for a service by a client |
| **Series** | A recurring sequence of bookings linked by a common recurrence rule |
| **Admin / Operator** | Authenticated user with elevated privileges to manage schedules, bookings, and clients |
| **Slot Lock** | A short-lived reservation that holds a slot during multi-step checkout/onboarding |
| **Availability Block** | A date-specific or recurring period during which a provider or resource is unavailable |
| **Onboarding Flow** | The multi-step information collection process a client completes before a booking is finalised |
| **Policy Rules** | Configurable business rules governing lead times, cancellation windows, reschedule limits, capacity caps, etc. |
| **Identity Verification** | The mechanism used to confirm client identity (OTP, magic link, SSO, document upload) |
| **Consent Record** | A timestamped, versioned record of a client's agreement to one or more terms or policies |
| **Audit Log** | An immutable, append-only record of all state changes to sensitive entities |

---

## 3. Functional Requirements

### 3.1 Frontend (Client-Facing)

- Must display available services with name, duration, mode (in-person/remote/hybrid), and optional price
- Must render a calendar that greys out unavailable dates based on server-computed availability
- Must display time slots for a selected date; slots must reflect real-time lock state
- Must acquire a slot lock immediately upon slot selection and hold it for the duration of onboarding
- Must guide the client through a configurable multi-step onboarding form before finalising the booking
- Must support unauthenticated client booking with configurable identity verification (default: OTP via email/SMS)
- Must deduplicate returning clients by a unique identifier (e.g., email) and skip completed steps
- Must show a waitlist opt-in when no slots are available for a selected date
- Must provide a client self-service portal (authenticated) for viewing, rescheduling, and cancelling bookings
- Should support legacy token-based portal access from confirmation links

### 3.2 Backend

- Must compute available slots server-side or client-side by composing: provider schedule, breaks, blocks, holidays, existing bookings, active locks, and policy rules
- Must enforce slot locking with configurable [TTL](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Time%20To%20Live.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=17 "System design interview, chapter 1, Content delivery network, Works one image through a CDN step by step: the origin returns it with a TTL header, the CDN se..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, The expiration policy for a cache tier: too short reloads the database too often, too long serves stale data."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=246 "System design big archive, How can cache systems go wrong?, What goes wrong when many keys expire at the same moment or a hot key expires, and the fixes: a r..."), [▶1](https://www.youtube.com/watch?v=wh98s0XhMmQ&t=42s "ByteByteGo, Caching Pitfalls Every Developer Should Know, Understanding cache stampede, 0:42 to 2:52, The cache stampede, where a popular entry expires and e..."), [▶2](https://www.youtube.com/watch?v=z4XdfFscxSk&t=120s "Hussein Nasser, Browser Caching Best Practices, Pattern 1: Immutable content + long max-age, 2:00 to 5:40, The browser's TTL, `max-age`, set long on content ..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/08-dnsmasq-answers-shop-test.md "dnsmasq answers shop.test, system-design/foundations, plan 08. A DNS answer read with `dig`, including its TTL: the seconds anyone who asked may keep the add...")</sub> and auto-extension
- Must prevent [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> via application-layer collision checks and a database-level trigger as last-line defence
- Must implement a booking state machine with defined statuses and permitted transitions
- Must enforce policy rules: minimum notice, maximum advance window, cancellation cutoff, reschedule limit, daily capacity cap
- Must support recurring series creation, per-occurrence editing, pause, resume, and cancellation
- Must store all consent records with version, timestamp, and IP address
- Must write immutable audit log entries on every state change to sensitive entities
- Must expose a [REST API](../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub> for all booking, scheduling, and admin operations
- Should support [webhook](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> or event emission on booking lifecycle transitions

### 3.3 Admin / Operator

- Must provide schedule management: define recurring weekly availability windows with breaks
- Must provide calendar views (day/week/month) with drag-and-drop rescheduling
- Must allow creation and management of date-specific availability blocks and public holidays
- Must allow full booking lifecycle control: confirm, complete, cancel, mark no-show, reschedule
- Must allow creation and management of recurring series on behalf of clients
- Must provide a waitlist management view with status update and notification trigger
- Must provide read-only audit log access
- Must provide configurable global scheduling policy rules (singleton record)
- Should provide reporting views (status distribution, capacity utilisation, no-show rates)
- Should support PDF/export generation for records, invoices, and summaries

### 3.4 Notifications & Communications

- Must send notifications on booking creation, confirmation, cancellation, and rescheduling
- Must send configurable appointment reminders ahead of scheduled times
- Must support at least one transactional email channel
- Should support at least one real-time channel (SMS, WhatsApp, push)
- Must log every outbound communication with channel, status, timestamp, and linked booking/client
- Must support configurable fallback channel ordering (e.g., primary → secondary on failure)
- Should respect client-level communication preferences (channel, language)

---

## 4. Non-Functional Requirements

### 4.1 Security & Privacy

- All admin routes must be protected by authenticated sessions with role verification
- Sensitive client data must be accessible only to authorised roles via row-level security or equivalent
- Uploaded files must be stored in access-controlled private storage (not publicly accessible URLs)
- Identity verification tokens/codes must have short, explicit expiry times
- Slot locks must auto-expire and be garbage-collected; no manual cleanup required
- All admin-only data mutations must produce an immutable audit log entry

### 4.2 Reliability & Availability

- Slot collision prevention must be enforced at the database level, not solely in application code
- Booking state transitions must be atomic; partial writes must not leave the system in an inconsistent state
- Slot lock auto-extension must be implemented to tolerate slow onboarding without lock expiry
- Notification delivery failures must be logged and must not block booking finalisation

### 4.3 Performance & Scalability

- Slot computation for a single date must complete in < 500 ms for typical load
- Availability queries must use [caching](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> with configurable stale times to reduce redundant fetches
- Slot lock state must be refreshed at a configurable [polling](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> interval (default: 30 s) to reflect [concurrent users](../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub>
- The system must remain correct under concurrent booking attempts for the same slot
- Design must document a clear scaling path to multi-provider or high-volume operation

### 4.4 Compliance Knobs (Configurable Controls)

The following behaviours must be controlled by configuration, not hard-coded:

| Knob | Default | Description |
|---|---|---|
| `identity_verification_method` | `otp_email` | How client identity is verified (`otp_email`, `otp_sms`, `magic_link`, `none`) |
| `consent_types_required` | `[]` | List of consent types the client must accept before booking |
| `data_retention_days` | `null` | Soft-delete or anonymisation schedule for client records |
| `require_document_upload` | `false` | Whether document upload is mandatory during onboarding |
| `require_intake_form` | Per service | Whether a domain-specific intake questionnaire is required |
| `require_emergency_contact` | `false` | Whether an emergency/secondary contact is mandatory |
| `audit_tables` | Configurable list | Which tables are covered by the audit log trigger |

---

## 5. Booking Lifecycle (State Machine)

### 5.1 Generic Statuses

| Status | Description |
|---|---|
| `requested` | Client submitted; awaiting operator review or auto-confirmation |
| `confirmed` | Operator approved or auto-confirmed; client notified |
| `completed` | Appointment occurred; post-session actions may be triggered |
| `cancelled` | Cancelled by operator or client, subject to policy rules |
| `no_show` | Client did not attend; optional fee or penalty may be recorded |

> Implementations may extend statuses (e.g., `pending_payment`, `on_hold`) via the domain adapter layer.

### 5.2 Permitted Transitions

```
requested  → confirmed    (operator action or auto-confirm rule)
requested  → cancelled    (operator or client, within lead-time window)
confirmed  → completed    (operator marks post-session)
confirmed  → cancelled    (operator or client, subject to cancellation_cutoff_hours)
confirmed  → no_show      (operator marks; optional fee recorded)
```

### 5.3 Transition Side Effects

- **→ confirmed:** Set `confirmed_at`; trigger confirmation notification
- **→ cancelled:** Set `cancelled_at`, store `cancellation_reason`; trigger cancellation notification; enforce `cancellation_cutoff_hours` for client-initiated cancellations
- **→ completed:** Set `completed_at`; optionally trigger post-session workflow (notes, follow-up, invoice)
- **→ no_show:** Set `no_show_at`; optionally record `no_show_fee`; trigger no-show notification

### 5.4 Rescheduling Rules

- Rescheduling must link the new booking to its predecessor via `rescheduled_from_id` and increment `reschedule_count`
- Must enforce `max_reschedules` (configurable; default 2) and `reschedule_cutoff_hours` (configurable; default 24h)
- Must trigger a rescheduling notification to the client with new date/time

### 5.5 Cancellation Policy

- `cancellation_cutoff_hours`: minimum notice required for client-initiated cancellation without penalty (configurable)
- `cancellation_fee`: optional flat or percentage fee recorded when cutoff is breached (configurable)
- Late-cancellation fee is recorded but payment collection is delegated to the payments extension

### 5.6 Auto-Expiry (Optional)

- Bookings in `requested` state beyond a configurable `auto_cancel_after_hours` may be auto-cancelled by a scheduled job
- Slot locks expire after configurable [TTL](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Time%20To%20Live.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=17 "System design interview, chapter 1, Content delivery network, Works one image through a CDN step by step: the origin returns it with a TTL header, the CDN se..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, The expiration policy for a cache tier: too short reloads the database too often, too long serves stale data."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=246 "System design big archive, How can cache systems go wrong?, What goes wrong when many keys expire at the same moment or a hot key expires, and the fixes: a r..."), [▶1](https://www.youtube.com/watch?v=wh98s0XhMmQ&t=42s "ByteByteGo, Caching Pitfalls Every Developer Should Know, Understanding cache stampede, 0:42 to 2:52, The cache stampede, where a popular entry expires and e..."), [▶2](https://www.youtube.com/watch?v=z4XdfFscxSk&t=120s "Hussein Nasser, Browser Caching Best Practices, Pattern 1: Immutable content + long max-age, 2:00 to 5:40, The browser's TTL, `max-age`, set long on content ..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/08-dnsmasq-answers-shop-test.md "dnsmasq answers shop.test, system-design/foundations, plan 08. A DNS answer read with `dig`, including its TTL: the seconds anyone who asked may keep the add...")</sub>; expiry is enforced at query time and by the garbage-collection RPC

---

## 6. Scheduling & Availability Engine

### 6.1 Schedule Definition

- Providers define **recurring weekly availability windows** per day-of-week with `start_time` and `end_time`
- Windows may have **breaks** (sub-periods of unavailability) associated
- Windows have optional `effective_from` / `effective_until` date bounds for seasonal or temporary schedules
- Multiple windows per day are supported (e.g., morning and afternoon)

### 6.2 Slot Generation Algorithm

Slots for a given date and service are computed by composing the following layers in order:

1. **Schedule lookup** — Match windows by `day_of_week` and `is_active`
2. **Slot gridding** — Generate candidates at a configurable interval (default: 30 min) from `start_time` to `end_time`, ensuring `slot_start + service_duration ≤ window_end`
3. **Break exclusion** — Remove slots overlapping any breaks for the matched window
4. **Block exclusion** — Remove slots overlapping date-specific `availability_blocks` (partial-day: time overlap; full-day: entire date eliminated)
5. **Holiday exclusion** — Reject dates matching active entries in the `public_holidays` table (filterable by `country_code`)
6. **Booking collision** — Remove slots where `[slot_start − buffer, slot_end + buffer]` overlaps any non-cancelled booking
7. **Lock collision** — Remove slots locked by sessions other than the current one with `expires_at > now()`
8. **Min notice** — Reject same-day slots where `slot_time < now() + min_notice_hours`
9. **Daily capacity cap** — Return empty if `confirmed_bookings_count ≥ max_daily_bookings`
10. **Max advance window** — Reject dates beyond `today + max_advance_days`

### 6.3 Date-Level Fast-Path Check

`isDateAvailable(date)` must be implemented as a lightweight pre-filter used by the calendar UI to grey out dates. It checks: schedule exists, not a holiday, not a full-day block, not in the past, within advance window, notice threshold met. It does not perform slot-level collision checks.

### 6.4 Recurrence Rules

Series bookings must support at minimum:

| Pattern | Description |
|---|---|
| `weekly` | Same day-of-week every week |
| `biweekly` | Same day-of-week every two weeks |
| `monthly` | Same day-of-month or ordinal weekday each month |
| `custom` | Every N days (configurable interval) |

Each occurrence is stored as an individual booking record linked via `series_id` and `series_index`.

### 6.5 Conflict Detection & Concurrency Strategy

- **Application layer:** Slot availability check before lock acquisition
- **Lock layer:** Slot lock table prevents concurrent onboarding sessions from holding the same slot
- **Database layer:** Trigger on `bookings` INSERT/UPDATE raises an exception if the time range overlaps any non-cancelled booking on the same date for the same provider/resource
- The trigger is the authoritative last-line defence and cannot be bypassed by application logic

---

## 7. Data Model (Entities & Relationships)

### 7.1 Core Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| `clients` | Client demographics and verification state | `id`, `email`, `phone`, `identity_verified`, `onboarding_completed`, `verification_code`, `verification_code_expires_at`, `preferred_language`, `preferred_contact_method` |
| `bookings` | Individual appointment records | `id`, `client_id`, `service_id`, `provider_id`, `resource_id`, `appointment_date`, `start_time`, `duration_minutes`, `status`, `series_id`, `series_index`, `confirmed_at`, `completed_at`, `cancelled_at`, `cancellation_reason`, `no_show_at`, `no_show_fee`, `rescheduled_from_id`, `reschedule_count`, `access_token` |
| `booking_series` | Recurring appointment templates | `id`, `client_id`, `provider_id`, `service_id`, `recurrence_pattern`, `interval_days`, `day_of_week`, `start_time`, `total_sessions`, `series_start_date`, `status` |
| `services` | Bookable service catalogue | `id`, `name`, `description`, `duration_minutes`, `category`, `mode`, `price`, `currency`, `capacity`, `requires_intake`, `is_active`, `sort_order`, `color`, `metadata` |
| `provider_schedules` | Weekly recurring availability windows | `id`, `provider_id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `effective_from`, `effective_until` |
| `schedule_breaks` | Breaks within schedule windows | `id`, `schedule_id`, `start_time`, `end_time` |
| `availability_blocks` | Date-specific unavailability | `id`, `provider_id`, `resource_id`, `block_date`, `is_full_day`, `start_time`, `end_time`, `reason` |
| `public_holidays` | Country/region-specific holidays | `id`, `date`, `name`, `country_code`, `is_active` |
| `scheduling_rules` | Global policy parameters (singleton per provider or tenant) | `buffer_minutes`, `min_notice_hours`, `max_advance_days`, `max_daily_bookings`, `allow_same_day`, `cancellation_cutoff_hours`, `cancellation_fee`, `max_reschedules`, `reschedule_cutoff_hours`, `auto_confirm`, `slot_lock_ttl_minutes` |
| `slot_locks` | Temporary slot reservations during checkout | `id`, `provider_id`, `appointment_date`, `start_time`, `locked_by_session`, `expires_at` |
| `waitlist` | Overflow interest capture | `id`, `client_email`, `client_name`, `client_phone`, `provider_id`, `service_id`, `preferred_date`, `preferred_time_start`, `preferred_time_end`, `status`, `notified_at` |
| `client_consents` | Versioned consent records | `id`, `client_id`, `consent_type`, `accepted`, `version`, `ip_address`, `accepted_at`, `revoked_at` |
| `intake_responses` | Domain-specific intake form answers | `id`, `client_id`, `booking_id`, `form_schema_version`, `responses` (JSONB) |
| `client_assessments` | Standardised screening or evaluation results | `id`, `client_id`, `assessment_type`, `responses` (JSONB), `total_score`, `severity_label` |
| `client_documents` | Uploaded files linked to a client | `id`, `client_id`, `storage_path`, `document_type`, `uploaded_at` |
| `secondary_contacts` | Emergency or next-of-kin contacts | `id`, `client_id`, `name`, `phone`, `relationship` |
| `session_records` | Post-appointment notes or summaries | `id`, `booking_id`, `notes`, `outcome`, `risk_level`, `follow_up_recommended`, `follow_up_notes`, `metadata` (JSONB) |
| `session_records_history` | Versioned edit history of session records | `id`, `session_record_id`, `version_number`, `snapshot` (JSONB), `changed_by`, `change_reason`, `changed_at` |
| `communication_log` | All outbound notifications | `id`, `client_id`, `booking_id`, `channel`, `direction`, `status`, `body`, `sent_at` |
| `audit_log` | Immutable change log | `id`, `table_name`, `record_id`, `action`, `old_data` (JSONB), `new_data` (JSONB), `changed_by`, `changed_at` |
| `user_roles` | [RBAC](../../../../Obsidian/Information%20Technology/Security/Authorization.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=322 "Systems analysis and design, chapter 8, Access control requirements, Works example requirements: only department managers may change inventory in their own d..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=324 "System design big archive, Access Control Clearly Explained, Role-based access control, attribute-based access control and access control lists, with what ea..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, An API gateway checking a user's JWT claims, or a developer's API key against a key store, before it forwards ..."), [▶1](https://www.youtube.com/watch?v=DT6Zy1X3ytM&t=174s "Hayk Simonyan, Authorization Explained: When to Use RBAC, ABAC, ACL & More, RBAC: Role-Based Access Control, 2:54 to 3:58, Role-based access control, after t..."), [▶2](https://www.youtube.com/watch?v=ZV5yTm4pT8g&t=0s "ByteByteGo, OAuth 2 Explained In Simple Terms, 0:00 to 4:32, OAuth 2, the delegated form, where one site gets limited access to your data on another without ..."), [◆](../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/16-the-permission-filter.md "Filter by role before ranking, and measure what it changed, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan...")</sub> role assignments | `id`, `user_id`, `role` |
| `resources` | Optional physical/virtual assets | `id`, `name`, `type`, `capacity`, `is_active` |

### 7.2 Key Relationships

```
clients 1──* bookings
clients 1──* booking_series
clients 1──* client_consents
clients 1──* client_assessments
clients 1──* client_documents
clients 1──* secondary_contacts
clients 1──0..1 intake_responses
booking_series 1──* bookings            (via series_id)
bookings 1──0..1 session_records
session_records 1──* session_records_history
bookings *──0..1 bookings               (self-ref via rescheduled_from_id)
provider_schedules 1──* schedule_breaks
services *──* resources                 (optional; for resource-constrained services)
```

### 7.3 Multi-Tenant Considerations

- Add `tenant_id` to all entities above when operating as a multi-provider or SaaS platform
- `scheduling_rules` becomes one record per `(tenant_id, provider_id)` rather than a global singleton
- RLS policies must filter all queries by `tenant_id`
- `user_roles` must scope roles per tenant

---

## 8. Key Workflows (Sequence Descriptions)

### 8.1 Happy Path — New Client Self-Booking

1. Client selects a service from the catalogue
2. Client selects an available date from the calendar (dates pre-filtered by `isDateAvailable()`)
3. Client selects an available time slot (slots computed by availability engine)
4. System acquires a slot lock for the client's session; lock [TTL](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Time%20To%20Live.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=17 "System design interview, chapter 1, Content delivery network, Works one image through a CDN step by step: the origin returns it with a TTL header, the CDN se..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, The expiration policy for a cache tier: too short reloads the database too often, too long serves stale data."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=246 "System design big archive, How can cache systems go wrong?, What goes wrong when many keys expire at the same moment or a hot key expires, and the fixes: a r..."), [▶1](https://www.youtube.com/watch?v=wh98s0XhMmQ&t=42s "ByteByteGo, Caching Pitfalls Every Developer Should Know, Understanding cache stampede, 0:42 to 2:52, The cache stampede, where a popular entry expires and e..."), [▶2](https://www.youtube.com/watch?v=z4XdfFscxSk&t=120s "Hussein Nasser, Browser Caching Best Practices, Pattern 1: Immutable content + long max-age, 2:00 to 5:40, The browser's TTL, `max-age`, set long on content ..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/08-dnsmasq-answers-shop-test.md "dnsmasq answers shop.test, system-design/foundations, plan 08. A DNS answer read with `dig`, including its TTL: the seconds anyone who asked may keep the add...")</sub> starts
5. Client completes the onboarding wizard (configurable steps; see §3.1)
6. System finalises the booking: inserts record with status `requested`, releases slot lock
7. System triggers booking confirmation notification to client and operator
8. Operator reviews and transitions booking to `confirmed`
9. System triggers confirmation notification to client

### 8.2 Happy Path — Returning Client Booking

1–4. Same as above
5. System detects existing client by email; skips completed onboarding steps (deduplication)
6–9. Same as above

### 8.3 Happy Path — Admin Creates Recurring Series

1. Admin selects client, service, recurrence pattern, start date, total sessions
2. System generates all individual booking records at creation time
3. System sends notification to client confirming the series

### 8.4 Edge Case — Slot Already Locked by Another Session

- Availability engine excludes the slot from results for all sessions except the lock holder
- If two sessions race to lock the same slot simultaneously, the second `acquireLock()` call detects the existing lock and returns `false`
- Client is prompted to select a different slot; no booking is created

### 8.5 Edge Case — Database-Level Double-Booking Race

- Even if application-level checks pass, the `check_booking_overlap()` trigger raises an exception on INSERT
- The transaction is rolled back; the client receives an error and is prompted to select another slot

### 8.6 Edge Case — Lock Expiry During Onboarding

- Lock TTL is auto-extended by the client session every N minutes while the onboarding wizard is active
- If the client becomes inactive and the lock expires, a subsequent lock acquisition attempt at finalisation will fail
- Client must restart slot selection; existing onboarding form data should be preserved in session state

### 8.7 Edge Case — No-Show

1. Admin marks booking as `no_show`
2. System records `no_show_at`; optionally records `no_show_fee`
3. Slot is freed for future bookings
4. Waitlist is optionally notified of newly available capacity

### 8.8 Edge Case — Waitlist Conversion

1. Admin opens waitlist entry and manually notifies the client (status → `notified`)
2. Client uses the standard booking flow to secure a slot
3. Admin updates waitlist entry to `booked`

---

## 9. Architecture & System Design

### 9.1 Suggested Module Boundaries

| Module | Responsibility |
|---|---|
| **Booking Engine** | State machine, transitions, policy enforcement |
| **Availability Engine** | Slot computation, date-level checks, holiday resolution |
| **Lock Manager** | Slot lock acquire/extend/release, expiry cleanup |
| **Onboarding Wizard** | Step orchestration, deduplication, finalisation |
| **Series Manager** | Recurrence generation, series-level operations |
| **Notification Service** | Channel routing, template rendering, communication logging |
| **Client Portal** | Authenticated self-service views and mutations |
| **Admin Dashboard** | Schedule management, booking management, reporting |
| **Audit Logger** | Trigger-based immutable log writer |
| **Identity Verifier** | OTP/magic-link/SSO adapter |
| **Document Store** | Private file upload and retrieval |

### 9.2 High-Level API Endpoints

```
# Services
GET    /services                          — list active services
GET    /services/:id                      — service detail

# Availability
GET    /availability?date=&service_id=    — available slots for date
GET    /availability/calendar?month=      — date-level availability map

# Slot Locks
POST   /slot-locks                        — acquire lock
PATCH  /slot-locks/:id/extend             — extend TTL
DELETE /slot-locks/:id                    — release lock

# Bookings
POST   /bookings                          — create booking (finalise onboarding)
GET    /bookings/:id                      — booking detail (token or auth)
PATCH  /bookings/:id/status               — transition status (admin)
PATCH  /bookings/:id/reschedule           — reschedule (admin or client)
DELETE /bookings/:id                      — cancel

# Series
POST   /series                            — create recurring series (admin)
PATCH  /series/:id                        — pause / resume / cancel series
PATCH  /series/:id/occurrences/:occ_id    — edit single occurrence

# Clients
POST   /clients                           — create or upsert client
POST   /clients/verify                    — submit OTP
GET    /clients/:id/bookings              — client's bookings (portal)

# Waitlist
POST   /waitlist                          — join waitlist
GET    /waitlist                          — list entries (admin)
PATCH  /waitlist/:id                      — update status (admin)

# Admin
GET    /admin/schedules                   — provider schedules
POST   /admin/schedules                   — create schedule window
GET    /admin/blocks                      — availability blocks
POST   /admin/blocks                      — create block
GET    /admin/holidays                    — public holidays
GET    /admin/rules                       — scheduling rules singleton
PATCH  /admin/rules                       — update rules
GET    /admin/audit-log                   — read audit log
```

### 9.3 Background Jobs & Event-Driven Components

| Job / Event | Trigger | Action |
|---|---|---|
| Appointment reminder | Scheduled cron (configurable time before appointment) | Send reminder via preferred channel |
| Lock garbage collection | On-demand RPC before lock queries | Delete expired `slot_locks` rows |
| Auto-cancel stale requests | Scheduled cron | Cancel `requested` bookings beyond `auto_cancel_after_hours` |
| Booking lifecycle [webhook](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> | On status transition | POST to configured webhook URL with booking payload |
| Communication log flush | After every notification attempt | Write `communication_log` record with delivery status |

### 9.4 Data Freshness Strategy

- Slot availability queries: short stale time (≤ 60 s) via query [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>
- Slot lock state: polled at configurable interval (default 30 s) to reflect [concurrent users](../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub>
- Admin views: manual refresh or configurable [polling](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub>

---

## 10. Extensibility & Configuration

### 10.1 Domain Adapters

To specialise the blueprint for a specific domain, implement the following adapter interfaces:

| Adapter | Purpose | Example Implementations |
|---|---|---|
| **IdentityVerifier** | Client identity verification | OTP email, OTP SMS, magic link, SSO, document scan |
| **OnboardingStepRegistry** | Define which steps are included and in what order | Intake form, assessments, consents, uploads, emergency contact |
| **NotificationTemplateProvider** | Domain-specific message content | Clinical confirmation, rental receipt, class schedule |
| **IntakeFormSchema** | JSON schema for domain-specific intake questions | Medical history, project brief, booking preferences |
| **AssessmentEngine** | Standardised scoring tools | PHQ-9/GAD-7 (mental health), fitness screening, NPS |
| **ReportGenerator** | Domain-specific PDF/export templates | Invoice, session summary, referral letter, rental agreement |
| **PostSessionWorkflow** | Actions triggered on `completed` transition | Clinical notes, follow-up task creation, invoice generation |

### 10.2 Feature Toggles

| Toggle | Effect |
|---|---|
| `auto_confirm_bookings` | Skip `requested` state; go directly to `confirmed` |
| `allow_unauthenticated_booking` | Enable public booking flow without account creation |
| `require_identity_verification` | Enforce OTP/verification during onboarding |
| `enable_recurring_series` | Expose series creation in admin UI |
| `enable_waitlist` | Show waitlist option when no slots are available |
| `enable_client_portal` | Expose self-service portal routes |
| `enable_payments` | Activate payment integration hooks |
| `enable_reminders` | Activate scheduled reminder job |
| `enable_audit_log` | Activate DB trigger-based audit logging |
| `enable_resource_management` | Link bookings to physical/virtual resources |

### 10.3 Policy Rules Reference

All policy rules are stored in the `scheduling_rules` entity and are runtime-configurable without a deployment:

| Rule | Type | Default |
|---|---|---|
| `buffer_minutes` | integer | 0 |
| `min_notice_hours` | integer | 24 |
| `max_advance_days` | integer | 60 |
| `max_daily_bookings` | integer | unlimited |
| `allow_same_day_booking` | boolean | false |
| `cancellation_cutoff_hours` | integer | 24 |
| `cancellation_fee` | decimal | 0 |
| `max_reschedules` | integer | 2 |
| `reschedule_cutoff_hours` | integer | 24 |
| `slot_lock_ttl_minutes` | integer | 10 |
| `slot_lock_extend_minutes` | integer | 5 |
| `auto_cancel_after_hours` | integer | null (disabled) |

---

## 11. Acceptance Criteria / Definition of Done

A booking system implementation satisfies this blueprint when:

### Core Booking
- [ ] Clients can self-book without a pre-existing account
- [ ] Clients who re-book are deduplicated and skip completed onboarding steps
- [ ] Slot locks prevent two concurrent sessions from booking the same slot
- [ ] Database-level trigger prevents double-booking even under [race conditions](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub>
- [ ] All booking status transitions are enforced per the state machine

### Scheduling
- [ ] Provider schedules with breaks produce correct slot grids
- [ ] Availability blocks and holidays eliminate affected slots and dates
- [ ] All policy rules (notice, advance, buffer, cap) are applied in slot computation
- [ ] Calendar greys out unavailable dates using the fast-path check

### Onboarding
- [ ] Onboarding wizard is configurable (steps can be added, removed, reordered)
- [ ] Each completed step is persisted incrementally (browser refresh does not lose data)
- [ ] Booking is only finalised after all required steps are complete
- [ ] Slot lock is released on finalisation or abandonment

### Notifications
- [ ] Client receives confirmation notification on booking creation
- [ ] Client receives notification on every status transition affecting them
- [ ] Every outbound notification is logged in `communication_log`
- [ ] Reminder job executes at the configured time and sends to the correct channel

### Admin
- [ ] Admin can manage schedules, blocks, holidays, and policy rules without a deployment
- [ ] Admin can perform all booking lifecycle actions
- [ ] Admin can create, pause, resume, and cancel recurring series
- [ ] Audit log captures all state changes with before/after snapshots

### Security & Compliance
- [ ] Admin routes are inaccessible without [authentication](../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, How a login is remembered: a server-side session with a ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the `csrftoken` ...")</sub> and correct role
- [ ] Client data is inaccessible to unauthenticated requests except as permitted by RLS policies
- [ ] All consent records include version, timestamp, and IP address
- [ ] Uploaded files are stored in private storage; presigned URLs are used for access
- [ ] Audit log is append-only and cannot be modified by application code

---

## 12. Implementation Checklist (Phased Plan)

### Phase 1 — Foundation

- [ ] [Database schema](../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Schema.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=256 "System design interview, chapter 15, Metadata database, Works a real schema: Google Drive's metadata tables (user, device, namespace, file, file version and ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=445 "Systems analysis and design, chapter 11, Moving from logical to physical data models, The steps that turn a diagram into a schema: entities to tables, attrib..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=20 "Grokking the system design interview, section 16.3, Differences: SQL vs. NoSQL, A relational schema is fixed before data goes in and costly to change, agains..."), [▶1](https://www.youtube.com/watch?v=TUcPS6dsWx4&t=1034s "Hello Interview, Data Modeling in System Design Interviews, Entities, Keys, & Relationships, 17:14 to 21:31, Laying out the entities, their keys and the rela..."), [▶2](https://www.youtube.com/watch?v=t7diJPGxCGo&t=671s "BugBytes, Django ORM Deep Dive - Models, Migrations and Admin UI Integration, Migrations in Django to apply database changes, 11:11 to 15:31, Django migratio..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/06-the-ddl-written-and-run.md "The DDL written and run, with CHECK constraints encoding the three kinds of till row, ai-engineering/one-business-end-to-end, plan 06. Works it on the shop: ...")</sub>: clients, services, provider_schedules, schedule_breaks, availability_blocks, public_holidays, scheduling_rules
- [ ] RLS policies and [RBAC](../../../../Obsidian/Information%20Technology/Security/Authorization.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=322 "Systems analysis and design, chapter 8, Access control requirements, Works example requirements: only department managers may change inventory in their own d..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=324 "System design big archive, Access Control Clearly Explained, Role-based access control, attribute-based access control and access control lists, with what ea..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, An API gateway checking a user's JWT claims, or a developer's API key against a key store, before it forwards ..."), [▶1](https://www.youtube.com/watch?v=DT6Zy1X3ytM&t=174s "Hayk Simonyan, Authorization Explained: When to Use RBAC, ABAC, ACL & More, RBAC: Role-Based Access Control, 2:54 to 3:58, Role-based access control, after t..."), [▶2](https://www.youtube.com/watch?v=ZV5yTm4pT8g&t=0s "ByteByteGo, OAuth 2 Explained In Simple Terms, 0:00 to 4:32, OAuth 2, the delegated form, where one site gets limited access to your data on another without ..."), [◆](../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/16-the-permission-filter.md "Filter by role before ranking, and measure what it changed, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan...")</sub> setup (user_roles, has_role function)
- [ ] Availability engine: slot generation algorithm with all 10 layers
- [ ] Service catalogue admin UI (CRUD)
- [ ] Schedule management admin UI
- [ ] Basic booking creation (no onboarding, no lock)

### Phase 2 — Booking Flow

- [ ] Slot lock table, acquire/extend/release logic, expiry cleanup
- [ ] Multi-step onboarding wizard framework (step registry, state machine)
- [ ] Identity verification adapter (OTP email as default)
- [ ] Consent recording
- [ ] Booking finalisation (status: requested)
- [ ] Booking confirmation notification (email)
- [ ] Admin booking management UI (confirm, complete, cancel, no-show)
- [ ] Booking state machine with all transitions and side effects

### Phase 3 — Client Experience

- [ ] Client portal (magic link or SSO auth)
- [ ] Self-service reschedule and cancel (policy-enforced)
- [ ] Waitlist form and admin management
- [ ] Legacy access token support

### Phase 4 — Advanced Features

- [ ] Recurring series: creation, editing, pause/resume/cancel
- [ ] Domain-specific onboarding steps (intake form, assessments, document upload)
- [ ] Audit logging (DB triggers)
- [ ] Session records with versioned history
- [ ] Communication logging

### Phase 5 — Notifications & Automation

- [ ] Multi-channel notification service (email + SMS/WhatsApp)
- [ ] Client communication preferences (channel, language)
- [ ] Scheduled appointment reminder job
- [ ] Auto-cancel stale bookings job (optional)
- [ ] [Webhook](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> emission on lifecycle events (optional)

### Phase 6 — Reporting & Extensions

- [ ] Dashboard metrics (capacity, status distribution, no-show rate)
- [ ] PDF/export report generation
- [ ] Calendar views with drag-and-drop
- [ ] Payment integration hooks (deposit, cancellation fee, no-show fee)
- [ ] Resource management (optional)
- [ ] Multi-tenant/multi-provider support (optional)
