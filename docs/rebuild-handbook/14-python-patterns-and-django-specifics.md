# 14. Python Patterns and Django Specifics

## Purpose
This chapter covers Python and Django idioms that are load-bearing in Attica. It focuses on patterns that appear in the codebase and their tradeoffs.

Prerequisites: basic Python syntax, [04 Backend Foundations](./04-backend-foundations.md).

## Python Patterns

### Dataclasses vs Dictionaries for Intermediate Values
**What to use**: dataclasses for structured data that will be passed around; dictionaries for temporary data.

**Dataclass** (structured, typed, intentional):
```python
from dataclasses import dataclass

@dataclass
class BookingApprovalContext:
    booking_request: BookingRequest
    approver: CustomUser
    comment: str = ""
    
    def validate(self):
        if self.booking_request.status != 'pending':
            raise ValueError("Cannot approve non-pending request")

# Usage
context = BookingApprovalContext(
    booking_request=req,
    approver=request.user,
    comment="Sounds good!"
)
```

**Dictionary** (temporary, flexible):
```python
# In a view function, extracting request data
booking_data = {
    'start_date': request.data['start_date'],
    'end_date': request.data['end_date'],
    'notes': request.data.get('notes', '')
}
serializer = BookingSerializer(data=booking_data)
```

**When to use dataclasses**: when the structure has invariants (like `validate()`), when you'll pass it to multiple functions, or when the cost of typing is worth the clarity.

### Context Managers for Resource Cleanup
**What it is**: the `with` statement ensures setup and teardown happen correctly.

**Example**: transaction management in Django is built on context managers.
```python
from django.db import transaction

# Bad: if something fails, partial state is saved
def approve_booking(booking_request):
    booking = Booking.objects.create(...)
    booking_request.status = 'approved'
    booking_request.save()
    NotificationService.notify_organizer(booking)

# Good: either everything succeeds or nothing does
def approve_booking(booking_request):
    with transaction.atomic():
        booking = Booking.objects.create(...)
        booking_request.status = 'approved'
        booking_request.save()
        NotificationService.notify_organizer(booking)
```

If `NotificationService.notify_organizer()` raises an exception, the database changes are rolled back.

**Custom context manager example** (rare, but useful):
```python
@contextmanager
def audit_logged_action(action_name, user):
    """Log an action and when it completes."""
    print(f"Starting: {action_name} by {user}")
    try:
        yield
        print(f"Completed: {action_name}")
    except Exception as e:
        print(f"Failed: {action_name}: {e}")
        raise
        
# Usage
with audit_logged_action('approve_booking', request.user):
    # Do the approval
    pass
```

### Generators and Lazy Evaluation
**What it is**: functions that `yield` values one at a time, rather than returning a list.

**Why it matters**: if you have 10,000 bookings but only need the first 100, a generator doesn't load all 10,000 into memory.

**Example**:
```python
# Bad: loads all bookings into memory
def get_upcoming_bookings():
    bookings = Booking.objects.filter(status='upcoming')
    results = []
    for booking in bookings:
        results.append(booking)
    return results

# Good: yields one at a time
def get_upcoming_bookings():
    bookings = Booking.objects.filter(status='upcoming')
    for booking in bookings:
        yield booking

# Usage
for booking in get_upcoming_bookings():
    print(booking.id)  # Only the current booking is in memory
```

**Django QuerySets are lazy**: `Booking.objects.all()` doesn't fetch the database until you iterate or convert to a list.

### Decorators for Cross-Cutting Concerns
**What it is**: a function that wraps another function, adding behavior before/after.

**Example**: permission checking as a decorator.
```python
def require_organizer(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_organizer:
            raise PermissionDenied("Only organizers can access this.")
        return view_func(request, *args, **kwargs)
    return wrapper

# Usage
@require_organizer
def create_event(request):
    # Only organizers can reach this code
    pass
```

**Built-in Django decorators** you'll see in Attica:
- `@login_required` — redirect if not authenticated
- `@permission_required('permission_name')` — check a permission
- `@transaction.atomic()` — wrap in a transaction
- `@cache_page(60)` — cache the response for 60 seconds

## Django ORM Patterns

### Queryset Chaining and Reuse
**Pattern**: build querysets incrementally, reusing them.

```python
# Define a base queryset
class BookingQuerySet(models.QuerySet):
    def by_organizer(self, organizer):
        return self.filter(event__organizer=organizer)
    
    def upcoming(self):
        return self.filter(start_time__gte=now())
    
    def with_related(self):
        return self.select_related('event', 'marketplace_resource')

# Usage: chain methods
upcoming_bookings = Booking.objects.by_organizer(
    request.user
).upcoming().with_related()

# Or in a different combination
completed = Booking.objects.by_organizer(
    request.user
).filter(status='completed').with_related()
```

### Model Validation and Constraints
**Model-level validation** happens in the `clean()` method. **Database-level constraints** prevent invalid data from ever being saved.

```python
class BookingRequest(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    marketplace_resource = models.ForeignKey(MarketplaceResource, ...)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='booking_request_time_order'
            )
        ]

    def clean(self):
        # Model validation (Python level)
        if self.status not in dict(self.STATUS_CHOICES):
            raise ValidationError(f"Invalid status: {self.status}")
        
        # Business rule validation
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Call validation before saving
        super().save(*args, **kwargs)
```

**Why both?** 
- Model validation catches programming errors early.
- Database constraints prevent corruption from race conditions or direct SQL.

### Signals for Side Effects
**What it is**: Django's event system. When a model is saved, deleted, or changed, signals are fired.

**Example**:
```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Booking)
def notify_on_booking_created(sender, instance, created, **kwargs):
    if created:
        NotificationService.notify_provider(
            f"New booking: {instance.event.name}",
            instance.marketplace_resource.owner
        )

# This function runs automatically whenever a Booking is created
```

**When to use signals**: creation of related records (Invoice on Booking created), cleanup (delete temp files on User deleted).

**When NOT to use signals**: critical workflows that need transaction safety. Use services instead, so you control the transaction.

### F() Expressions for Database Operations
**What it is**: represent a model field as a value that the database can compute.

**Why it matters**: atomic updates without race conditions.

```python
from django.db.models import F

# Bad: load, modify, save (not atomic)
booking = Booking.objects.get(id=1)
booking.total_cost += 100
booking.save()

# Good: database does the update atomically
Booking.objects.filter(id=1).update(total_cost=F('total_cost') + 100)
```

This is especially important in high-concurrency scenarios (overbooking checks, bid updates).

### Aggregation and Annotation
**Pattern**: compute summaries and derived fields at the database level.

```python
from django.db.models import Avg, Count, Sum

# Get artists with their average rating and review count
artists = Artist.objects.annotate(
    avg_rating=Avg('marketplace_resource__reviews__rating'),
    review_count=Count('marketplace_resource__reviews')
)

for artist in artists:
    print(f"{artist.name}: {artist.avg_rating} ({artist.review_count} reviews)")

# Filter by aggregated values
high_rated = Artist.objects.annotate(
    avg_rating=Avg('marketplace_resource__reviews__rating')
).filter(avg_rating__gte=4.5)

# Compute totals
totals = Booking.objects.aggregate(
    total_revenue=Sum('total_cost'),
    average_cost=Avg('total_cost'),
    booking_count=Count('id')
)
# Returns: {'total_revenue': 50000, 'average_cost': 500, 'booking_count': 100}
```

**Why it matters**: these operations are much faster at the database level than in Python.

## Django REST Framework Patterns

### Nested Serializers for Related Data
**What it is**: including related objects in a single API response.

**Example**:
```python
class BookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)  # Include full event data
    marketplace_resource = MarketplaceResourceSerializer(read_only=True)
    organizer = UserSerializer(source='event.organizer', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'event', 'marketplace_resource', 'organizer', 'status']
```

Response:
```json
{
  "id": 1,
  "status": "confirmed",
  "event": {
    "id": 10,
    "name": "Wedding",
    "date": "2026-06-15"
  },
  "marketplace_resource": {
    "id": 5,
    "name": "John's DJ Services",
    "owner": "john_dj"
  },
  "organizer": {
    "id": 100,
    "username": "jane_organizer"
  }
}
```

### Custom Field Methods for Computed Data
**What it is**: add fields to the serializer that don't map 1:1 to model fields.

```python
class BookingSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()
    
    def get_status_display(self, obj):
        return obj.get_status_display()  # Django's choice labels
    
    def get_can_approve(self, obj):
        request = self.context['request']
        return (
            obj.status == 'pending' and
            obj.marketplace_resource.owner == request.user
        )
    
    class Meta:
        model = Booking
        fields = ['id', 'status', 'status_display', 'can_approve']
```

Response:
```json
{
  "id": 1,
  "status": "pending",
  "status_display": "Pending Approval",
  "can_approve": true
}
```

### Validation in Serializers
**Serializer-level validation** runs when the data is deserialized and should validate based on the request context.

```python
class BookingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = ['marketplace_resource_id', 'start_time', 'end_time']
    
    def validate(self, data):
        # Check if the slot is available (depends on multiple fields)
        resource = data['marketplace_resource']
        conflicts = BookingRequest.objects.filter(
            marketplace_resource=resource,
            status='pending',
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        )
        if conflicts.exists():
            raise serializers.ValidationError("Time slot is already booked.")
        
        # Check organizer permissions
        request = self.context['request']
        if not request.user.is_organizer:
            raise serializers.ValidationError("Only organizers can create booking requests.")
        
        return data
```

### Filtering, Searching, and Pagination
**Django REST Framework provides built-in filtering**.

```python
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class BookingViewSet(ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Exact filtering
    filterset_fields = ['status', 'event__organizer']
    
    # Partial text search
    search_fields = ['event__name', 'marketplace_resource__name']
    
    # Ordering
    ordering_fields = ['created_at', 'start_time']
    ordering = ['-created_at']
    
    # Pagination
    pagination_class = LargeResultsSetPagination
```

Usage from the frontend:
```
GET /api/bookings/?status=confirmed&search=wedding&ordering=-start_time
```

## Common Gotchas

### QuerySet Evaluation
QuerySets are lazy. They're only evaluated when you:
- Iterate over them
- Convert to a list
- Use `[0]` indexing
- Call `count()`, `exists()`, etc.

```python
# Not evaluated yet
qs = Booking.objects.filter(status='pending')

# Evaluated now (SQL is run)
for booking in qs:
    print(booking)
```

### N+1 Query Problem
Accessing a related field inside a loop causes multiple queries.

```python
# Bad: 101 queries (1 for bookings, 100 for each event)
bookings = Booking.objects.all()[:100]
for booking in bookings:
    print(booking.event.name)

# Good: 2 queries
bookings = Booking.objects.select_related('event')[:100]
for booking in bookings:
    print(booking.event.name)
```

### Mutable Default Arguments
Python's mutable defaults are shared across function calls. Don't use them.

```python
# Bad: the list is shared
def add_booking(booking, bookings=[]):
    bookings.append(booking)
    return bookings

add_booking(1)  # [1]
add_booking(2)  # [1, 2] — second call still has the first!

# Good: create a new list each time
def add_booking(booking, bookings=None):
    if bookings is None:
        bookings = []
    bookings.append(booking)
    return bookings
```

## Key Takeaway
Python and Django offer powerful abstractions (querysets, signals, context managers). Master them and you can write concise, safe code. Ignore them and you'll spend days debugging N+1 queries and race conditions.
