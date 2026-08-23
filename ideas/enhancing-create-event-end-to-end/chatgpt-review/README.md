# Architecture reviews

The three reviews `WHERE-WE-LANDED.md` was checked against. Save them here as:

- `01-system-architecture.md`: the target architecture. Bounded domains inside a modular monolith,
  PostgreSQL with range exclusion constraints, `BookingClaim`, availability versioning, persist
  first and push second, the event envelope, eight diagrams, and a ten-step build order.
- `02-performance-and-experience.md`: the two tracks the first one left out. Screen-shaped read
  endpoints, query budgets, journey-derived indexes, the caching rule, and a frontend design system
  of Tailwind 4, shadcn on Base UI, TanStack Query and a motion language.
- `03-booking-journey.md`: the booking journey end to end. Hold on acceptance, a payment provider
  interface behind a mock, cancellation with policy, two-level notifications, and the two-browser
  acceptance test.

They are cited in `WHERE-WE-LANDED.md` sections 3 and 4, so the decisions there can be traced back
to which review argued what, and where two of them disagree.
