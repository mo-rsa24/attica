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
| Serializer | Validates API input, shapes API output | 04 Foundations, 14 Django Patterns | All [REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> endpoints |
| Queryset | Lazy database query builder | 04 Foundations, 14 Django Patterns | Fetching data |
| select_related | Join related objects in one query | 04 Foundations, 14 Django Patterns | Avoiding N+1 queries |
| prefetch_related | Fetch related collections in parallel | 04 Foundations, 14 Django Patterns | Avoiding N+1 queries |
| Annotation | Compute fields at database level | 04 Foundations, 14 Django Patterns | Averages, counts, sums |
| Service Layer | Functions that orchestrate workflows | 04 Foundations, 13 Patterns | Complex business logic |
| Model.clean() | Validation that holds regardless of save path | 04 Foundations, 14 Django Patterns | Invariants, state rules |
| Transaction | Database [atomicity](../../../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Transaction.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=510 "Database systems textbook, section 10-1, What is a transaction?, Works a credit sale of one unit of product 89-WRE-Q to customer 10016 for $277.55 as three I..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=513 "Database systems textbook, section 10-1b, Transaction properties, ACID letter by letter, with atomicity as all four SQL requests of a transaction T1 completi..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=514 "Database systems textbook, section 10-1c and 10-1d, Transaction management with SQL, and the transaction log, 'COMMIT' and 'ROLLBACK' and the four events tha..."), [▶1](https://www.youtube.com/watch?v=pomxJOFVcQs&t=120s "Hussein Nasser, Relational Database ACID Transactions (Explained by Example), What is a Transaction?, 2:00 to 4:30, The opening definition of a long walk thr..."), [▶2](https://www.youtube.com/watch?v=P80Js_qClUE&t=0s "Hussein Nasser, What is a Database transaction?, 0:00 to 2:52, The idea in under three minutes. Whole video."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/04-transactions.md "What a transaction is: atomicity, commit, rollback, projects/attica/architecture-decisions, plan 04. Works it on Attica: two writes wrapped in 'transaction.a...")</sub> for multiple changes | 04 Foundations, 14 Django Patterns | Multi-step workflows |
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
| [Idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> | Same request, same result (safe to retry) | 04 Foundations, 13 Patterns | Background jobs, [webhooks](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> |
| Source of Truth | Authoritative record of state | 09 Integration, 11 Mental Models | Deciding what to fetch vs [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> |
| Transactional | All-or-nothing state change | 04 Foundations, 14 Django Patterns | Booking approvals, payments |

### Realtime Concepts

| Concept | Short Explanation | Where Explained | When You Need It |
| --- | --- | --- | --- |
| [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> | Persistent two-way connection | 01 System Map, 08 Realtime | Chat, live notifications |
| Chat Room | Conversation context for booking negotiation | 08 Realtime | Messaging system |
| Notification | User awareness signal (not source of truth) | 08 Realtime | Alerting users to changes |
| [Outbox Pattern](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> | Queue side effects for async processing | 01 System Map, 13 Patterns | Reliable emails, webhooks |

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

- [ ] Pages with lists use [pagination](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/Pagination.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Pagination with a concrete request, '?limit=10&offset=20', among the habits of a well-designed API."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Why APIs paginate (performance bottlenecks and payload bloat) and the three strate..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=270 "System design big archive, Best Practices in API Design, Offset-based and cursor-based pagination beside sorting, filtering and versioning."), [▶1](https://www.youtube.com/watch?v=zwDIN04lIpc&t=317s "PlanetScale, Pagination in MySQL - offset vs. cursor, Shifting records in offset pagination, 5:17 to 6:12, The failure offset pagination has when rows move, ..."), [▶2](https://www.youtube.com/watch?v=14K_a2kKTxU&t=85s "ByteByteGo, API Pagination: Making Billions of Products Scrolling Possible, Cursor based pagination, 1:25 to 2:12, Cursor pagination as the fix for the probl..."), [◆](../../../../../../goal-setting/learning/system-design/api-design-and-contracts/MASTER_PLAN.md "System Design: API Design and Contracts, system-design/api-design-and-contracts. Its goal implements cursor and offset pagination on the same dataset and dem...")</sub> or virtualization
- [ ] Detail pages use `select_related()` to avoid N+1 queries
- [ ] List endpoints with rich data use `prefetch_related()` or `annotate()`
- [ ] Forms don't re-fetch data on every keystroke
- [ ] Routes with params use `AbortController` to cancel stale requests
- [ ] [Authentication](../../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=651 "Computer networking: a top-down approach, section 8.4, End-point authentication, Builds an authentication protocol in five tries, ap1.0 to ap4.0: a bare clai..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the 'csrftoken' ...")</sub> token refresh happens in one place (the provider)
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
- Services are [idempotent](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> (same input = same output)
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

4. **[Race conditions](../../../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub>**: Multiple async calls updating the same state without AbortController. Last response wins, even if it's stale.

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
3. Identify which workflows need stronger correctness guarantees (transactions, [idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub>) than others.
4. Replace implementation details or libraries without losing the underlying design.
5. Design error handling that respects domain meaning (network vs auth vs policy errors).
6. Choose between optimistic and server-authority updates based on risk, not convenience.
7. Place business logic in the right layer (model, serializer, service, view) without duplicating it.
8. Write async code that handles races, stale data, and cleanup correctly.
9. Build queries that are both correct and performant.
10. Reason about your system's failure modes and design for reliability, not just happy path.
