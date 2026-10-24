# 13. Design Patterns and Architectural Decisions

## Purpose
This chapter explains the architectural design patterns visible in Attica and the decision frameworks that led to them. It bridges low-level code choices and high-level product architecture.

Prerequisites: [01 System Map](./01-system-map.md), [04 Backend Foundations](./04-backend-foundations.md), [11 Reconstruction Mental Models](./11-reconstruction-mental-models.md).

## Architectural Patterns

### Service Layer Pattern
**What it is**: a layer of functions between views and models that orchestrates complex workflows, policy enforcement, and side effects.

**Where it appears**: `backend/main/scheduling/services.py` contains functions like:
- `approve_request(request_obj, approver)` — validates state, creates booking, emits notification
- `complete_booking(booking_obj)` — marks complete, may trigger [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> events
- `withdraw_request(request_obj)` — validates ownership, cancels hold, notifies provider

**Why it exists**: views should orchestrate requests, but they shouldn't contain transaction logic, conflict detection, or notification side effects. Moving these to a service layer makes them:
- Testable: you can test `approve_request()` without [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>
- Reusable: other code paths can call the same service function
- Clear: the service name (`approve_request`) is self-documenting

**When to introduce it**: if a view is more than ~50 lines because of logic, extract the logic to a service. Don't build a massive service layer upfront; grow it as needed.

**Common mistake**: writing a 200-line view because you wanted to avoid "over-engineering." It's not over-engineering to separate concerns.

### Repository Pattern (Light)
**What it is**: a layer that abstracts data access, making queries composable and testable without hitting the database.

**Where it appears**: not explicitly, but implied in querysets like:
```python
# Instead of: events = Event.objects.filter(...).filter(...).select_related(...)
# Consider: events = EventRepository.upcoming_public_events(limit=10)
```

**Why it exists**: complex queries are hard to test and reuse. A repository function gives the query a name and hides the implementation.

**When to use it**: when a query is complex (multiple filters, annotations, prefetches) and used in multiple places. Don't create repositories for simple queries.

**Example**:
```python
class BookingRepository:
    @staticmethod
    def organizer_bookings_by_status(organizer, status):
        return Booking.objects.filter(
            event__organizer=organizer,
            status=status
        ).select_related('marketplace_resource', 'event').order_by('-created_at')

# Usage in views
def BookingListView(APIView):
    def get(self, request):
        bookings = BookingRepository.organizer_bookings_by_status(request.user, 'confirmed')
        return Response(BookingSerializer(bookings, many=True).data)
```

### Notification Pattern
**What it is**: a system where domain events trigger user-facing notifications, separate from the event itself.

**Where it appears**: 
- When a booking is approved, a `Notification` is created
- When a message arrives, a `Notification` is created
- Notifications have read/unread states and are listed separately from the domain data

**Why it exists**: users need awareness without cluttering the domain model. A notification is a *signal* to pay attention, not the source of truth.

**Common mistake**: using notifications as the source of truth. The booking is the source of truth; the notification just alerts the user.

### Outbox Pattern
**What it is**: a pattern where side effects (emails, [webhooks](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub>, etc.) are written to a table in the same transaction as the domain change, then processed asynchronously.

**Where it appears**: `backend/main/scheduling/models.py` has an `OutboxEvent` model. Services emit `OutboxEvent` records, and a management command processes them.

**Why it exists**: 
- If a booking is approved but the email fails to send, the booking is still safely created in the database.
- The side effect can be retried without re-running the entire workflow.
- You have visibility into what side effects are pending or have failed.

**When to use it**: critical side effects (emails, webhooks) that must be reliable. Don't use it for in-process logging or metrics.

## Frontend Design Patterns

### Component Composition Over Props Drilling
**What it is**: using React composition and children props to avoid passing data through many intermediate components.

**Bad pattern** (props drilling):
```javascript
// LayoutComponent passes resource through 5 levels
<LayoutComponent>
  <SectionComponent resource={resource}>
    <CardComponent resource={resource}>
      <DetailsComponent resource={resource}>
        <StatusBadge resource={resource} />
```

**Good pattern** (composition):
```javascript
// StatusBadge lives where it's needed, not passed down
<LayoutComponent>
  <ResourceContext.Provider value={resource}>
    <SectionComponent>
      <CardComponent>
        <DetailsComponent>
          <StatusBadge /> {/* reads from context */}
```

**When to use context**: data is truly global (auth, current role) or needs to be accessible from multiple unrelated routes. When in doubt, lift state to the lowest common ancestor, not to a provider.

### Controlled Input Pattern
**What it is**: form inputs whose state lives in component state, not the DOM.

**Why it matters**: Attica has complex forms (event creation, booking requests). Controlled inputs let you:
- Validate before submission
- Disable submit while invalid
- Show live error messages
- Pre-fill from saved drafts

**Example**:
```javascript
function BookingRequestForm({ resourceId, draftData }) {
  const [form, setForm] = useState(draftData || {});
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate
    const newErrors = validateBookingRequest(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Submit
    await submitBookingRequest(form);
  };

  return (
    <form>
      <input
        value={form.startDate}
        onChange={e => handleChange('startDate', e.target.value)}
      />
      {errors.startDate && <span>{errors.startDate}</span>}
      <button disabled={Object.keys(errors).length > 0} onClick={handleSubmit}>
        Request Booking
      </button>
    </form>
  );
}
```

### Fetching with useEffect and Cleanup
**What it is**: the idiomatic React pattern for async data loading.

**Why it matters**: 
- Fetch in useEffect, not in event handlers (event handlers are for user actions, not data flow).
- Cleanup to prevent memory leaks (cancel in-flight requests, clear timers).
- Dependencies declare when the effect should re-run.

**Example**:
```javascript
function BookingDetail({ bookingId }) {
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/scheduling/bookings/${bookingId}/`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      }
    })();

    return () => controller.abort();
  }, [bookingId]); // Re-fetch if bookingId changes

  if (error) return <div>Error: {error}</div>;
  if (!booking) return <div>Loading...</div>;
  return <div>Booking: {booking.status}</div>;
}
```

## Backend Design Patterns

### ORM Query Optimization
**Pattern**: shape queries to fetch exactly what you need, prefetch related data.

**Bad**:
```python
# In a loop, fetches each booking's event separately
bookings = Booking.objects.all()[:10]
for booking in bookings:
    print(booking.event.name)  # 11 SQL queries (1 for list, 10 for events)
```

**Good**:
```python
bookings = Booking.objects.select_related('event')[:10]
for booking in bookings:
    print(booking.event.name)  # 1 SQL query
```

**Complex example** (annotation):
```python
# List artists with their average rating and review count
artists = Artist.objects.annotate(
    avg_rating=Avg('marketplace_resource__reviews__rating'),
    review_count=Count('marketplace_resource__reviews')
).filter(
    review_count__gte=5  # Only artists with at least 5 reviews
).order_by('-avg_rating')
```

### Permission Scoping in Querysets
**Pattern**: override `get_queryset()` to enforce ownership at the query level.

**Why it matters**: it's impossible to accidentally leak data; the query itself is scoped.

**Example**:
```python
class BookingRequestViewSet(ModelViewSet):
    serializer_class = BookingRequestSerializer

    def get_queryset(self):
        # Organizers see their own requests
        if self.request.user.is_organizer:
            return BookingRequest.objects.filter(organizer=self.request.user)
        # Providers see requests for their resources
        elif self.request.user.is_provider:
            return BookingRequest.objects.filter(
                marketplace_resource__owner=self.request.user
            )
        return BookingRequest.objects.none()
```

### Serializer Hierarchy for Output Shaping
**Pattern**: use different serializers for list vs detail, or for different roles.

**Why it matters**: list endpoints can be lightweight (just name, rating); detail endpoints can be rich (includes description, reviews, availability).

**Example**:
```python
class ArtistListSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    class Meta:
        model = Artist
        fields = ['id', 'name', 'image_url', 'average_rating']

class ArtistDetailSerializer(serializers.ModelSerializer):
    portfolio = PortfolioSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'image_url', 'portfolio', 'reviews']

class ArtistViewSet(ModelViewSet):
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArtistDetailSerializer
        return ArtistListSerializer
```

## Deciding Between Approaches

### Optimistic Update vs Server Authority
**Optimistic update**: update the UI immediately, then sync with server.
- **Use for**: low-stake actions (liking a post, marking read)
- **Avoid for**: high-stake actions (approving bookings, completing payments)

**Server authority**: fetch the result from the server after every action.
- **Use for**: bookings, payments, state transitions
- **Safer but slower**: you're guaranteed to have correct state

**Example**:
```javascript
// Optimistic: mark notification read instantly
async function markRead(notificationId) {
  setNotification(prev => ({ ...prev, unread: false }));
  await fetch(`/api/notifications/${notificationId}/read/`, { method: 'POST' });
}

// Server authority: booking requires confirmation
async function approveBooking(bookingId) {
  const response = await fetch(`/api/scheduling/bookings/${bookingId}/approve/`, {
    method: 'POST'
  });
  if (!response.ok) {
    // Refetch to see the real state
    const booking = await fetch(`/api/scheduling/bookings/${bookingId}/`).then(r => r.json());
    setBooking(booking);
    throw new Error('Approval failed');
  }
  setBooking(await response.json());
}
```

### When to Add Abstraction vs Keeping It Simple
**Add abstraction when**:
- The same pattern repeats 3+ times
- The pattern is complex and worth naming (service layer, repository)
- The pattern hides a detail that's not always needed

**Keep it simple when**:
- It's a one-off, even if it's complex
- Adding abstraction obscures the code (a simple loop is clearer than a helper function)
- The abstraction only saves a few lines

**Example of good vs bad abstraction**:
```python
# Bad: overly abstract
def query_builder(model, filters, relations=None, annotations=None):
    qs = model.objects.all()
    for key, value in (filters or {}).items():
        qs = qs.filter(**{key: value})
    for relation in (relations or []):
        qs = qs.select_related(relation)
    for name, agg in (annotations or {}).items():
        qs = qs.annotate(**{name: agg})
    return qs

# Good: named repository function
class BookingRepository:
    @staticmethod
    def organizer_completed_bookings(organizer):
        return Booking.objects.filter(
            event__organizer=organizer,
            status='completed'
        ).select_related('marketplace_resource').order_by('-completed_at')
```

The second is longer but much clearer.

## Key Takeaway
Good architecture is about making dependencies explicit and putting code where its responsibility belongs. When you're uncertain, ask: "If I change this requirement, how many files do I have to touch?" The fewer, the better the architecture.
