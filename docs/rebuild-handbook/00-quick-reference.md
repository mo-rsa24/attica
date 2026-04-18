# 00. Quick Reference — Concepts, Patterns, and Tradeoffs

## Purpose
This chapter is a glossary and decision tree for concepts that appear throughout the handbook. Use it to quickly find where a concept is explained or to navigate to the right chapter when you're uncertain.

## Concept Index

### Frontend Concepts

| Concept | Short Explanation | Where Explained | When You Need It |
| --- | --- | --- | --- |
| Protected Routes | Routes that only render if user is authenticated | 03 Foundations, 11 Mental Models | Building login-gated pages |
| Shared Provider State | Context that survives route changes | 03 Foundations | Auth, event creation, role state |
| Local Component State | State that lives in one page | 03 Foundations | Form data, loading flags |
| useEffect Dependencies | Array of values that trigger re-runs | 03 Foundations, 12 JS Patterns | Data fetching, side effects |
| AbortController | Cancel in-flight requests to prevent races | 12 JS Patterns | Pages with route params, search |
| Optimistic Update | Update UI before server responds | 09 Integration, 13 Patterns | Low-stake actions (liking, marking read) |
| Server Authority | Fetch result from server after action | 09 Integration, 13 Patterns | High-stake actions (bookings, approvals) |
| Controlled Form | Input state lives in component state | 03 Foundations, 13 Patterns | Multi-field forms, validation |
| Async/Await | Promise-based syntax for fetching | 12 JS Patterns | All data loading |

### Backend Concepts

| Concept | Short Explanation | Where Explained | When You Need It |
| --- | --- | --- | --- |
| ModelViewSet | DRF class that generates full CRUD | 04 Foundations | Simple resources (events, artists) |
| APIView | Custom view for non-CRUD endpoints | 04 Foundations | Workflow actions (approve, withdraw) |
| Serializer | Validates API input, shapes API output | 04 Foundations, 14 Django Patterns | All REST endpoints |
| Queryset | Lazy database query builder | 04 Foundations, 14 Django Patterns | Fetching data |
| select_related | Join related objects in one query | 04 Foundations, 14 Django Patterns | Avoiding N+1 queries |
| prefetch_related | Fetch related collections in parallel | 04 Foundations, 14 Django Patterns | Avoiding N+1 queries |
| Annotation | Compute fields at database level | 04 Foundations, 14 Django Patterns | Averages, counts, sums |
| Service Layer | Functions that orchestrate workflows | 04 Foundations, 13 Patterns | Complex business logic |
| Model.clean() | Validation that holds regardless of save path | 04 Foundations, 14 Django Patterns | Invariants, state rules |
| Transaction | Database atomicity for multiple changes | 04 Foundations, 14 Django Patterns | Multi-step workflows |
| Signal | Django event system (post_save, etc.) | 14 Django Patterns | Creation of related records |
| Management Command | Long-running operational scripts | 01 System Map | Batch operations, scheduling |

### Architecture Concepts

| Concept | Short Explanation | Where Explained | When You Need It |
| --- | --- | --- | --- |
| Draft vs Published | Temporary state vs final state | 01 System Map, 06 Event Drafts | Event creation, booking lifecycle |
| Request vs Booking | Negotiation state vs confirmed state | 07 Scheduling, 11 Mental Models | Booking workflows |
| Marketplace Resource | Normalized representation of bookable item | 05 Marketplace, 07 Scheduling | Handling multiple provider types |
| Availability Window | Time range when resource is bookable | 07 Scheduling | Scheduling engine |
| Policy | Rules that govern what can be booked | 07 Scheduling | Constraints on bookings |
| Idempotency | Same request, same result (safe to retry) | 04 Foundations, 13 Patterns | Background jobs, webhooks |
| Source of Truth | Authoritative record of state | 09 Integration, 11 Mental Models | Deciding what to fetch vs cache |
| Transactional | All-or-nothing state change | 04 Foundations, 14 Django Patterns | Booking approvals, payments |

### Realtime Concepts

| Concept | Short Explanation | Where Explained | When You Need It |
| --- | --- | --- | --- |
| WebSocket | Persistent two-way connection | 01 System Map, 08 Realtime | Chat, live notifications |
| Chat Room | Conversation context for booking negotiation | 08 Realtime | Messaging system |
| Notification | User awareness signal (not source of truth) | 08 Realtime | Alerting users to changes |
| Outbox Pattern | Queue side effects for async processing | 01 System Map, 13 Patterns | Reliable emails, webhooks |

## Decision Trees

### "Should I use a provider or component state?"

```
Is the data needed by multiple unrelated routes?
├─ YES → Use provider (auth, current role)
└─ NO → Is the data needed across multiple pages in the same flow?
    ├─ YES → Use provider (event creation)
    └─ NO → Use component state (form input, loading flag)
```

### "Should I fetch in useEffect or in an event handler?"

```
Is this data needed to render the page?
├─ YES → Fetch in useEffect (initial load, filters changing)
└─ NO → Fetch in event handler (form submission, button click)

If fetching in useEffect:
├─ Include all dependencies that affect the fetch URL
├─ Use AbortController to cancel on route change
└─ Handle the AbortError separately from real errors
```

### "Should I use optimistic or server-authority?"

```
Is this action low-stake?
├─ YES (like/follow/read) → Optimistic update
└─ NO (booking/payment) → Server authority
    └─ Fetch from server after action succeeds
```

### "Should I create a service function or put logic in the view?"

```
Does the logic exceed 50 lines?
├─ YES → Extract to service
└─ NO → Does it involve transactions, conflict checks, or side effects?
    ├─ YES → Extract to service (correctness matters)
    └─ NO → Keep in view (simple read/write)
```

### "Should I validate in the model, serializer, or service?"

```
Is this an invariant that must always hold?
├─ YES → Model.clean() or database constraint
└─ NO → Does it depend on the request context?
    ├─ YES → Serializer
    └─ NO → Does it involve multiple records or transactions?
        ├─ YES → Service
        └─ NO → Serializer
```

### "What database optimization do I need?"

```
Is the view fetching more than one object type?
├─ YES (booking + event + resource) → Use select_related()
└─ NO → Is the view listing objects and accessing related data?
    ├─ YES (list bookings + show event name) → select_related() or prefetch_related()
    └─ NO → Does the view need aggregated data?
        ├─ YES (avg rating, review count) → Use annotate()
        └─ NO → QuerySet is fine as-is
```

## Error Handling Checklist

When a fetch fails, ask:

```
Network error (can't reach server)?
├─ YES → "Network error. Check your connection."
└─ NO → HTTP error (4xx/5xx)?
    ├─ 401/403 (auth) → "Session expired. Please log in."
    ├─ 422 (validation) → Show detailed error from server
    ├─ 5xx (server) → "Server error. Please try again."
    └─ Other (4xx) → "Request failed: {reason from server}"
```

## Performance Checklist

Before calling your work done:

- [ ] Pages with lists use pagination or virtualization
- [ ] Detail pages use `select_related()` to avoid N+1 queries
- [ ] List endpoints with rich data use `prefetch_related()` or `annotate()`
- [ ] Forms don't re-fetch data on every keystroke
- [ ] Routes with params use `AbortController` to cancel stale requests
- [ ] Authentication token refresh happens in one place (the provider)
- [ ] Slow operations (bookings, payments) don't block the UI
- [ ] Long-running operations use a management command or background task

## Testing Mindset

### Frontend Testing
- Routes render when authenticated, redirect when not
- Forms accept valid input and reject invalid input
- Failed requests show error messages, not blank screens
- Switching routes cancels in-flight requests (AbortController works)
- State survives a page refresh if it should (localStorage check)

### Backend Testing
- Authenticated endpoints deny unauthenticated requests
- Querysets return only owned records (permission scoping works)
- Complex workflows maintain database consistency (transactions work)
- Services are idempotent (same input = same output)
- Validation rejects invalid state at multiple levels

## Tradeoff Summary

| Tradeoff | Choice A | Choice B | When A | When B |
| --- | --- | --- | --- | --- |
| Fetch location | useEffect | Event handler | Need data to render | User-triggered action |
| Update strategy | Optimistic | Server authority | Low-stake action | High-stake action |
| Validation level | Model | Serializer | Always true | Context-dependent |
| State location | Provider | Component | Multiple routes need it | One page needs it |
| Query complexity | Simple filter | Annotation | Straightforward | Need computed fields |
| View style | ViewSet | APIView | CRUD-heavy | Workflow-heavy |
| Side effects | Signal | Service | Automatic cleanup | Multi-step operation |

## Key Antipatterns to Avoid

1. **Global state bloat**: Every piece of fetched data in a provider makes rendering slower and reasoning harder. Only truly cross-cutting state belongs in providers.

2. **N+1 queries**: Accessing a related field inside a loop without `select_related()` or `prefetch_related()` causes exponential database queries.

3. **Stale closures**: Using a value inside a `useEffect` without including it in dependencies. The effect sees an old value.

4. **Race conditions**: Multiple async calls updating the same state without AbortController. Last response wins, even if it's stale.

5. **Optimistic updates for high-stakes actions**: Showing a booking as approved before the server confirms it. User sees success, then error appears later.

6. **Validation in views only**: If a model can be created via API or directly in Python, validation in the view alone doesn't prevent invalid state.

7. **Logic in signals**: Signals are convenient but hard to test and debug. Complex workflows belong in services.

8. **Tight coupling of side effects**: Notification creation directly in the booking approval view. Makes both harder to test and reuse.

9. **No abort handling**: Fetch calls that don't handle AbortError separately lead to "cannot set state on unmounted component" warnings.

10. **Assuming the URL is always correct**: Fetching by URL param without validating ownership. A malicious user can change the URL and read others' data.

## When to Reference Each Chapter

- **Unsure about the system**: 01 System Map
- **Lost in the details**: 02 Knowledge Graph
- **React code feels wrong**: 03 Foundations, 12 JS Patterns
- **Django code feels wrong**: 04 Foundations, 14 Django Patterns
- **Designing a new feature**: 05 Marketplace, 06 Event Drafts, 07 Scheduling
- **Building full-stack flows**: 09 Full-Stack Integration
- **Stuck on architectural decisions**: 11 Mental Models, 13 Design Patterns
- **Writing async code**: 12 JS Patterns
- **Optimizing queries or refactoring**: 14 Django Patterns
- **Comparing approaches**: 13 Design Patterns

## Core Engineering Standard

You understand Attica when you can:

1. Explain each major subsystem (marketplace, event creation, scheduling, chat, notifications) as a set of abstractions and tradeoffs.
2. Describe where state lives (browser, server, database) and why it lives there.
3. Identify which workflows need stronger correctness guarantees (transactions, idempotency) than others.
4. Replace implementation details or libraries without losing the underlying design.
5. Design error handling that respects domain meaning (network vs auth vs policy errors).
6. Choose between optimistic and server-authority updates based on risk, not convenience.
7. Place business logic in the right layer (model, serializer, service, view) without duplicating it.
8. Write async code that handles races, stale data, and cleanup correctly.
9. Build queries that are both correct and performant.
10. Reason about your system's failure modes and design for reliability, not just happy path.
