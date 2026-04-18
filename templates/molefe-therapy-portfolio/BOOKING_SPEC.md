# Booking System — Technical Specification

> **Version:** 1.0  
> **Date:** 2026-02-28  
> **Stack:** React 18 + Vite, Tailwind CSS, Supabase (Postgres + Edge Functions + Auth + Storage)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Database Entities & Relationships](#2-core-database-entities--relationships)
3. [Service Configuration](#3-service-configuration)
4. [Availability Engine](#4-availability-engine)
5. [Slot Locking & Concurrency](#5-slot-locking--concurrency)
6. [Booking Lifecycle (State Machine)](#6-booking-lifecycle-state-machine)
7. [Patient Onboarding Flow](#7-patient-onboarding-flow)
8. [Recurring Series](#8-recurring-series)
9. [Patient Portal & Self-Service](#9-patient-portal--self-service)
10. [Waitlist](#10-waitlist)
11. [Notifications](#11-notifications)
12. [Payments & Fees](#12-payments--fees)
13. [Reporting & Analytics](#13-reporting--analytics)
14. [Role-Based Access Control (RBAC)](#14-role-based-access-control-rbac)
15. [Audit Logging](#15-audit-logging)
16. [Compliance & Healthcare Considerations](#16-compliance--healthcare-considerations)
17. [Scalability & Performance](#17-scalability--performance)
18. [Architectural Decisions & Justifications](#18-architectural-decisions--justifications)
19. [Requirements Traceability](#19-requirements-traceability)

---

## 1. System Overview

The booking system is a full-lifecycle appointment management platform for a solo/small-practice clinical psychology setting. It supports unauthenticated patient self-booking with progressive onboarding, admin-controlled scheduling, recurring series, real-time slot locking, multi-channel notifications, and healthcare-grade audit logging.

**Key actors:** Patient (unauthenticated or magic-link authenticated), Admin (authenticated via email/password + role check).

**Key flows:** Service selection → date/time selection → slot lock → patient onboarding (info, OTP verification, consent, emergency contact, intake, assessments, document upload) → booking creation → admin confirmation → session completion.

---

## 2. Core Database Entities & Relationships

### 2.1 Entity Reference

| Table | Purpose | Key Columns |
|---|---|---|
| `patients` | Patient demographics, verification state | `id`, `email`, `user_id`, `email_verified`, `onboarding_completed`, `verification_code` |
| `bookings` | Individual appointment records | `id`, `patient_id`, `appointment_date`, `start_time`, `duration_minutes`, `status`, `series_id`, `access_token` |
| `booking_series` | Recurring appointment templates | `id`, `patient_id`, `recurrence_pattern`, `day_of_week`, `total_sessions`, `status` |
| `service_types` | Configurable service catalog | `id`, `name`, `duration_minutes`, `category`, `mode`, `price_cents`, `requires_intake` |
| `practitioner_schedules` | Weekly recurring availability windows | `id`, `day_of_week`, `start_time`, `end_time`, `is_active`, `effective_from/until` |
| `practitioner_breaks` | Breaks within schedule windows | `id`, `schedule_id`, `start_time`, `end_time` |
| `availability_blocks` | Date-specific unavailability (full/partial day) | `id`, `block_date`, `is_full_day`, `start_time`, `end_time` |
| `public_holidays` | Country-specific holidays | `id`, `date`, `name`, `country_code`, `is_active` |
| `scheduling_rules` | Global scheduling parameters (singleton) | `buffer_minutes`, `min_notice_hours`, `max_advance_days`, `max_daily_sessions`, etc. |
| `slot_locks` | Temporary slot reservations during onboarding | `id`, `appointment_date`, `start_time`, `locked_by`, `expires_at` |
| `waitlist` | Overflow interest capture | `id`, `patient_email`, `preferred_date`, `service_type`, `status` |
| `patient_consents` | POPIA/treatment consent records | `id`, `patient_id`, `consent_type`, `accepted`, `version` |
| `medical_intake` | Clinical intake questionnaire responses | `id`, `patient_id`, `presenting_concerns`, `referral_source` |
| `patient_assessments` | Standardized screening results (PHQ-9, GAD-7) | `id`, `patient_id`, `assessment_type`, `total_score`, `severity` |
| `patient_documents` | Uploaded files (IDs, referrals) | `id`, `patient_id`, `file_path`, `document_type` |
| `emergency_contacts` | Patient emergency contacts | `id`, `patient_id`, `name`, `phone`, `relationship` |
| `session_notes` | Clinical notes per session | `id`, `booking_id`, `clinical_notes`, `risk_level`, `mood_rating` |
| `session_notes_history` | Versioned history of note edits | `id`, `session_note_id`, `version_number`, `changed_by` |
| `communication_log` | All outbound notification records | `id`, `patient_id`, `booking_id`, `channel`, `status` |
| `audit_log` | System-wide change tracking | `id`, `table_name`, `record_id`, `action`, `old_data`, `new_data` |
| `user_roles` | RBAC role assignments | `id`, `user_id`, `role` (enum: `admin`, `user`) |
| `profiles` | Auth user display metadata | `id`, `user_id`, `display_name` |

### 2.2 Key Relationships

```
patients 1──* bookings
patients 1──* booking_series
patients 1──1 medical_intake
patients 1──* patient_assessments
patients 1──* patient_consents
patients 1──* patient_documents
patients 1──* emergency_contacts
booking_series 1──* bookings (via series_id)
bookings 1──0..1 session_notes
session_notes 1──* session_notes_history
bookings *──0..1 bookings (self-ref via rescheduled_from_id)
practitioner_schedules 1──* practitioner_breaks
```

---

## 3. Service Configuration

Services are stored in `service_types` and define the bookable offerings.

Each service specifies a `duration_minutes`, `category` (individual/couples/group/assessment), `mode` (in_person/telehealth/both), optional `price_cents`, and flags like `requires_intake`, `is_first_consult`, `is_follow_up`. The `sort_order` field controls display ordering. Only services with `is_active = true` are shown to patients.

Services drive the onboarding flow: `requires_intake` determines whether the intake and assessment steps are shown during booking.

---

## 4. Availability Engine

**Location:** `src/hooks/useAvailability.ts`

The availability engine computes bookable time slots by layering multiple constraint sources.

### 4.1 Slot Generation Algorithm

1. **Schedule lookup** — Filter `practitioner_schedules` by `day_of_week` and `is_active`.
2. **Slot gridding** — Generate 30-minute interval candidates from schedule `start_time` to `end_time`, ensuring `slot_start + duration ≤ schedule_end`.
3. **Break exclusion** — Remove slots overlapping any `practitioner_breaks` for the matched schedule.
4. **Block exclusion** — Remove slots overlapping date-specific `availability_blocks` (partial-day blocks check time overlap; full-day blocks eliminate the entire date).
5. **Holiday exclusion** — `isDateAvailable()` rejects dates matching active `public_holidays`.
6. **Booking collision** — Remove slots where `slot ± buffer_minutes` overlaps any non-cancelled booking.
7. **Lock collision** — Remove slots locked by other sessions (filtered by `locked_by ≠ currentSessionId` and `expires_at > now()`).
8. **Min notice** — For same-day slots, reject if `slot_time < now() + min_notice_hours`.
9. **Max daily cap** — If `existing_bookings_count ≥ max_daily_sessions`, return empty.
10. **Max advance** — `isDateAvailable()` rejects dates beyond `today + max_advance_days`.

### 4.2 Date-Level Availability

`isDateAvailable(date)` is a fast-path check used by the calendar to grey out unselectable dates. It checks: schedule exists for day-of-week, not a holiday, not a full-day block, not in the past, within advance window, and respects `min_notice_hours` / `allow_same_day_booking`.

### 4.3 Data Freshness

All underlying queries use `@tanstack/react-query` with default stale times. Slot locks refresh every 30 seconds (`refetchInterval: 30000`) to reflect other users' reservations.

---

## 5. Slot Locking & Concurrency

**Location:** `src/hooks/useSlotLock.ts`

Slot locking prevents double-booking during the multi-step onboarding flow.

### 5.1 Mechanism

- **Session identity:** Each browser tab generates a `crypto.randomUUID()` session ID (stable for the tab's lifetime via `useRef`).
- **Acquire:** Calls `cleanup_expired_locks` RPC, checks for existing non-expired locks by other sessions, then inserts into `slot_locks` with a configurable TTL (default 10 minutes).
- **Auto-extend:** A `setInterval` extends the lock by 5 minutes every 4 minutes while active.
- **Release:** Deletes the lock row on explicit release or component unmount.

### 5.2 Concurrency Handling

The availability engine excludes locked slots from results for other users. If two users race to lock the same slot, the second user's `acquireLock()` will detect the existing lock and return `false`, prompting them to choose another slot. Expired locks are garbage-collected by the `cleanup_expired_locks` Postgres function.

### 5.3 Overlap Prevention (DB-Level)

A database trigger `check_booking_overlap()` fires on `INSERT`/`UPDATE` to `bookings`, raising an exception if the new booking's time range overlaps any existing non-cancelled booking on the same date. This is the last line of defense against race conditions.

---

## 6. Booking Lifecycle (State Machine)

### 6.1 States

| Status | Description |
|---|---|
| `requested` | Patient submitted; awaiting admin review |
| `confirmed` | Admin approved; patient notified |
| `completed` | Session occurred; notes may be attached |
| `cancelled` | Cancelled by admin or patient |
| `no_show` | Patient did not attend |

### 6.2 Transitions

```
requested → confirmed    (admin action)
requested → cancelled    (admin or patient action)
confirmed → completed    (admin marks post-session)
confirmed → cancelled    (admin or patient, subject to cutoff)
confirmed → no_show      (admin marks; optional fee recorded)
```

### 6.3 Transition Side Effects

- **→ confirmed:** Sets `confirmed_at`, sends WhatsApp/SMS + email notification.
- **→ cancelled:** Sets `cancelled_at`, stores `cancellation_reason`, sends cancellation notification. Subject to `cancellation_cutoff_hours` for patient-initiated.
- **→ completed:** Sets `completed_at`.
- **→ no_show:** Sets `no_show_at`, optionally records `no_show_fee_cents`.

### 6.4 Rescheduling

Rescheduling creates a conceptual link via `rescheduled_from_id` and increments `reschedule_count`. Constrained by `max_reschedules` (default 2) and `reschedule_cutoff_hours` (default 24h). Admin-side rescheduling sends a notification with the new date/time.

---

## 7. Patient Onboarding Flow

**Location:** `src/components/booking/PatientOnboarding.tsx` + step components

The onboarding flow is a multi-step wizard that runs after slot selection and lock acquisition.

### 7.1 Steps (in order)

| Step | Component | Required? | Description |
|---|---|---|---|
| Patient Info | `PatientInfoStep` | Always | Collects name, email, phone. Creates/updates `patients` record. |
| Email Verify | `EmailVerifyStep` | If not verified | 6-digit OTP sent via Edge Function, stored in `verification_code` with 10-min expiry. |
| Consent | `ConsentStep` | Always | POPIA + Treatment consent checkboxes, stored in `patient_consents`. |
| Emergency Contact | `EmergencyContactStep` | Always | Stored in `emergency_contacts`. |
| Document Upload | `DocumentUploadStep` | Always | Files uploaded to `patient-documents` storage bucket, metadata in `patient_documents`. |
| Medical Intake | `IntakeStep` | If `requires_intake` | Presenting concerns, medications, therapy history → `medical_intake`. |
| Assessment | `AssessmentStep` | If `requires_intake` | PHQ-9 (depression) and GAD-7 (anxiety) screenings with auto-scoring → `patient_assessments`. |

### 7.2 Patient Deduplication

`PatientInfoStep` checks for existing patients by email. If found, it updates the record rather than creating a duplicate. If the patient's email is already verified, the OTP step is skipped.

### 7.3 Finalization

After the last step, `finalizeBooking()` inserts into `bookings` with status `requested`, releases the slot lock, and invokes the `send-booking-email` Edge Function.

---

## 8. Recurring Series

**Location:** `src/components/admin/tabs/SeriesTab.tsx`

Admins can create recurring appointment sequences linked to a patient.

### 8.1 Configuration

- **Patterns:** Weekly, biweekly, monthly, or custom interval (N days).
- **Parameters:** `day_of_week`, `start_time`, `duration_minutes`, `total_sessions`, `series_start_date`.
- **Storage:** Parent record in `booking_series`; individual appointments in `bookings` with `series_id` and `series_index`.

### 8.2 Operations

- **Create:** Generates all future booking records at creation time based on the recurrence pattern.
- **Edit single:** Modify date/time of one occurrence; sends patient notification.
- **Pause/Resume:** Toggles `booking_series.status` between `active` and `paused`.
- **Cancel series:** Cancels all future bookings (status ≠ completed/cancelled) and sets series status to `cancelled`.

---

## 9. Patient Portal & Self-Service

**Location:** `src/pages/MyAppointments.tsx`, `src/hooks/usePatientAuth.ts`

### 9.1 Authentication

Patients authenticate via magic link (email-based, passwordless). `usePatientAuth` resolves the auth user to a `patients` record by matching `user_id` or `email`, and auto-links `user_id` if not already set.

### 9.2 Features

- View upcoming and past appointments.
- Self-service rescheduling within `reschedule_cutoff_hours` and `max_reschedules` limits.
- Self-service cancellation within `cancellation_cutoff_hours`.
- Profile and emergency contact management.
- Legacy `access_token`-based access from old booking confirmation emails is supported for backward compatibility.

---

## 10. Waitlist

**Location:** `src/components/booking/WaitlistForm.tsx`, `src/components/admin/tabs/WaitlistTab.tsx`

When no slots are available for a selected date, patients can join a waitlist by providing name, email, phone, and optional preferred time window. Entries are stored in the `waitlist` table with status `waiting`. Admins can update status to `notified` (records `notified_at`) or `booked`, and can delete entries.

---

## 11. Notifications

### 11.1 Channels

| Channel | Provider | Priority |
|---|---|---|
| WhatsApp | Twilio | Primary |
| SMS | Twilio | Fallback (auto) |
| Email | Resend | Always sent |

### 11.2 Notification Types

- **Booking confirmation** — Email to patient + admin on new booking.
- **Status change** — WhatsApp/SMS to patient on confirm, cancel, reschedule.
- **Appointment reminders** — Daily cron (06:00 UTC) for confirmed bookings via `send-whatsapp-reminder`.
- **Email verification** — OTP code via `send-verification-code`.

### 11.3 Communication Logging

Every outbound message is recorded in `communication_log` with `channel`, `direction`, `status`, `body`, and optional `booking_id`/`patient_id` references.

### 11.4 Edge Functions

| Function | Purpose |
|---|---|
| `send-booking-email` | Patient confirmation + admin notification emails via Resend |
| `send-booking-notification` | WhatsApp/SMS lifecycle notifications via Twilio |
| `send-verification-code` | OTP email for patient identity verification |
| `send-whatsapp-reminder` | Cron-triggered appointment reminders |

---

## 12. Payments & Fees

### 12.1 Current Implementation

- `service_types.price_cents` stores the service price (nullable, informational).
- `bookings.no_show_fee_cents` records a fee when a patient is marked as no-show.
- `scheduling_rules.cancellation_fee_cents` defines the late-cancellation fee amount.

### 12.2 Payment Processing

Full payment processing (Stripe integration) is not yet implemented. The schema supports fee tracking for future integration.

---

## 13. Reporting & Analytics

**Location:** `src/components/admin/tabs/ReportsTab.tsx`

### 13.1 PDF Generation

The system generates downloadable PDF reports using `jspdf` + `jspdf-autotable`:

- **Invoices** (`src/lib/pdf/invoice.ts`) — Per-booking financial documents.
- **Progress Reports** (`src/lib/pdf/progressReport.ts`) — Patient treatment summaries.
- **Referral Letters** (`src/lib/pdf/referralLetter.ts`) — Clinical referral documentation.

### 13.2 Dashboard Metrics

The Agenda Dashboard (`AgendaDashboard.tsx`) provides at-a-glance stats: today's appointments, upcoming count, and status distribution.

---

## 14. Role-Based Access Control (RBAC)

### 14.1 Architecture

Roles are stored in a dedicated `user_roles` table (not on `profiles` or `auth.users`) to prevent privilege escalation.

### 14.2 Role Check Function

```sql
public.has_role(_user_id uuid, _role app_role) RETURNS boolean
-- SECURITY DEFINER, bypasses RLS to prevent recursion
```

### 14.3 RLS Policy Summary

| Resource | Public Read | Public Write | Admin Only |
|---|---|---|---|
| `bookings` | ✅ (view slots) | ✅ (create) | Update, Delete |
| `patients` | ✅ | ✅ (create) | — (update via token) |
| `service_types` | ✅ | — | Full CRUD |
| `practitioner_schedules` | ✅ | — | Full CRUD |
| `session_notes` | — | — | Full CRUD |
| `audit_log` | — | — | Read only |
| `slot_locks` | ✅ | ✅ | ✅ |
| `waitlist` | ✅ | ✅ (insert) | Update, Delete |

### 14.4 Security Model

- Admin authentication: email/password via Supabase Auth → role checked via `has_role()`.
- Patient booking: unauthenticated (no Supabase auth required); identity verified via 6-digit OTP.
- Patient portal: magic-link auth → patient record linked via `user_id`.
- All admin-only tables enforce RLS using the `has_role()` security definer function.

---

## 15. Audit Logging

### 15.1 Mechanism

A database trigger function `fn_audit_log()` captures INSERT, UPDATE, and DELETE operations on audited tables. Each entry records:

- `table_name`, `record_id`, `action` (INSERT/UPDATE/DELETE)
- `old_data` / `new_data` as full JSONB snapshots
- `changed_by` (auth.uid())
- `changed_at` timestamp

### 15.2 Session Notes Versioning

A separate versioning system via `fn_session_notes_version()` trigger creates explicit version records in `session_notes_history` on every update, with `version_number`, `changed_by`, and optional `change_reason`.

### 15.3 Access

Audit logs are read-only and visible only to admins via `AuditLogTab`.

---

## 16. Compliance & Healthcare Considerations

### 16.1 POPIA (South Africa)

- Explicit consent collection for data processing (`patient_consents` with `consent_type = 'popia'`).
- Consent versioning (`version` field) supports regulatory updates.
- `ip_address` captured at consent time for accountability.
- `revoked_at` field supports right-to-withdraw.

### 16.2 Clinical Data Protection

- Session notes and clinical assessments are behind admin-only RLS — no patient-facing read access.
- Patient documents stored in a private storage bucket (`patient-documents`, `is_public: false`).
- All clinical data changes are audit-logged with before/after JSONB diffs.
- Session notes maintain full version history with author attribution.

### 16.3 Data Minimization

- Verification codes have explicit expiry timestamps (`verification_code_expires_at`).
- Slot locks auto-expire and are garbage-collected via `cleanup_expired_locks()`.
- Access tokens on bookings have creation timestamps for potential rotation.

---

## 17. Scalability & Performance

### 17.1 Current Design (Solo Practice)

The system is optimized for a single-practitioner practice with moderate booking volume.

### 17.2 Performance Considerations

- **Slot computation** is client-side, pulling all schedules/bookings/locks into memory. Acceptable for < 1000 bookings; would need server-side computation for scale.
- **Lock cleanup** runs as an RPC before lock acquisition and before lock queries, preventing stale lock accumulation.
- **Query caching** via React Query with automatic stale invalidation reduces redundant fetches.
- **Lock polling** at 30-second intervals balances freshness against API load.

### 17.3 Scaling Path

For multi-practitioner or high-volume scenarios:
- Move slot computation to a Postgres function or Edge Function.
- Add `practitioner_id` to schedules, bookings, and locks.
- Implement database-level advisory locks for slot reservation instead of table-based locks.
- Add connection pooling and read replicas for reporting queries.

---

## 18. Architectural Decisions & Justifications

| Decision | Justification |
|---|---|
| **Client-side slot computation** | Simplicity for solo practice; all constraint data is small enough to fetch client-side. Avoids complex server-side scheduling logic during MVP. |
| **Table-based slot locks (not advisory locks)** | Visible to all clients via standard queries; compatible with RLS; auto-expire without background jobs. |
| **Unauthenticated booking with OTP** | Reduces friction for new patients who don't have accounts. OTP verifies identity without requiring full auth signup. |
| **Separate `user_roles` table** | Prevents privilege escalation attacks; `SECURITY DEFINER` function avoids RLS recursion. |
| **JSONB audit diffs** | Full before/after snapshots enable precise change reconstruction without schema coupling. |
| **Edge Functions for notifications** | Keeps API keys server-side; supports async processing; auto-deployed with the project. |
| **`booking_series` + individual `bookings`** | Series defines the template; individual bookings allow per-occurrence edits, cancellations, and independent status tracking. |
| **Magic-link auth for patient portal** | Passwordless reduces support burden; appropriate for infrequent patient access patterns. |
| **DB trigger for overlap prevention** | Last line of defense; cannot be bypassed by application bugs or race conditions. |
| **30-minute slot grid** | Standard clinical session alignment; simplifies UI while supporting variable-duration services. |

---

## 19. Requirements Traceability

| Requirement | Status | Implementation |
|---|---|---|
| Service catalog management | ✅ Satisfied | `service_types` table + `ServicesTab` admin UI |
| Weekly schedule configuration | ✅ Satisfied | `practitioner_schedules` + `practitioner_breaks` + `SchedulesTab` |
| Holiday management | ✅ Satisfied | `public_holidays` + `HolidaysTab` |
| Date-specific availability blocks | ✅ Satisfied | `availability_blocks` + `AvailabilityTab` |
| Patient self-service booking | ✅ Satisfied | `BookAppointment` page with service → date → time → onboarding flow |
| Slot locking during onboarding | ✅ Satisfied | `useSlotLock` hook + `slot_locks` table + auto-extend |
| Double-booking prevention | ✅ Satisfied | Client-side collision check + DB trigger `check_booking_overlap()` |
| Email verification (OTP) | ✅ Satisfied | 6-digit code via `send-verification-code` Edge Function |
| POPIA consent collection | ✅ Satisfied | `ConsentStep` + `patient_consents` table with versioning |
| Medical intake forms | ✅ Satisfied | `IntakeStep` + `medical_intake` table |
| Clinical assessments (PHQ-9, GAD-7) | ✅ Satisfied | `AssessmentStep` + `patient_assessments` with auto-scoring |
| Document uploads | ✅ Satisfied | Private `patient-documents` bucket + `patient_documents` metadata |
| Emergency contacts | ✅ Satisfied | `EmergencyContactStep` + `emergency_contacts` table |
| Booking lifecycle management | ✅ Satisfied | Status state machine with admin controls in `BookingsTab` |
| Recurring appointment series | ✅ Satisfied | `booking_series` + `SeriesTab` with pause/resume/cancel |
| Patient portal (view/reschedule/cancel) | ✅ Satisfied | `MyAppointments` page + magic-link auth |
| Waitlist | ✅ Satisfied | `WaitlistForm` + `WaitlistTab` admin management |
| Multi-channel notifications | ✅ Satisfied | WhatsApp (primary) + SMS (fallback) + Email via Edge Functions |
| Communication logging | ✅ Satisfied | `communication_log` table with channel/status tracking |
| Session notes with versioning | ✅ Satisfied | `session_notes` + `session_notes_history` with trigger |
| PDF report generation | ✅ Satisfied | Invoice, progress report, referral letter via jspdf |
| Calendar views (week/month) | ✅ Satisfied | `CalendarViewTab` with drag-and-drop rescheduling |
| Audit logging | ✅ Satisfied | `fn_audit_log()` trigger + `audit_log` table |
| RBAC with admin isolation | ✅ Satisfied | `user_roles` + `has_role()` SECURITY DEFINER + RLS policies |
| No-show tracking & fees | ✅ Satisfied | `no_show_at` + `no_show_fee_cents` on bookings |
| Rescheduling limits | ✅ Satisfied | `max_reschedules` + `reschedule_cutoff_hours` enforcement |
| Payment processing | ⏳ Planned | Schema supports `price_cents` and fee tracking; Stripe not yet integrated |
