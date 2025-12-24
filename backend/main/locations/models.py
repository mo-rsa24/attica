from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models
from common.models import TimeStampedModel, OwnedModel

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True) # For icon class names, e.g., 'wifi', 'projector'

    def __str__(self):
        return self.name

class Location(TimeStampedModel, OwnedModel):
    from vendors.models import Region
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField()
    is_approved = models.BooleanField(default=False)
    venue_count = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    listed_date = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    image = models.ImageField(upload_to='location_images/', null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)
    virtual_tour_url = models.URLField(max_length=1024, blank=True, null=True)
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_locations',
        help_text="The primary contact or agent for this venue (e.g., Shaun Bird)."
    )
    agent_name = models.CharField(max_length=100, blank=True, null=True)
    agent_avatar_url = models.URLField(max_length=100, blank=True, null=True)
    agent_organization = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    search_vector = SearchVectorField(null=True)

    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False, help_text="Featured locations appear at the top.")
    has_variable_pricing = models.BooleanField(default=False,
                                               help_text="True for venues that require a custom quote (e.g., SCC).")

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # Enhanced Fields
    parking_info = models.CharField(max_length=255, blank=True, help_text="e.g., 'On-site parking for 50 cars'")
    is_wheelchair_accessible = models.BooleanField(default=False)
    budget_estimate_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_estimate_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amenities = models.ManyToManyField(Amenity, blank=True)
    organizer_notes = models.TextField(blank=True, help_text="Internal notes for the event organizer")
    preferred_dates = models.JSONField(default=list, blank=True,
                                       help_text="A list of preferred date ranges, e.g., [{'start': '2024-12-20', 'end': '2024-12-25'}]")
    is_indoor = models.BooleanField(default=True)
    is_outdoor = models.BooleanField(default=False)
    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
        ]

    def __str__(self):
        return self.name

class LocationImage(models.Model):
    IMAGE_TYPE_CHOICES = [
        ('main', 'Main Image'),
        ('gallery', 'Gallery Image'),
        ('thumbnail', 'Thumbnail Image'),
    ]
    location = models.ForeignKey(Location, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField(max_length=1024)
    image_type = models.CharField(max_length=10, choices=IMAGE_TYPE_CHOICES, default='gallery')


    def __str__(self):
        return f"{self.get_image_type_display()} for {self.location.name}"

class Feature(models.Model):
    location = models.ForeignKey(Location, related_name='features', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, null=True) # For icon library class names

    def __str__(self):
        return self.name

class FloorPlan(models.Model):
    location = models.ForeignKey(Location, related_name='floor_plans', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    image_url = models.URLField(max_length=1024)

    def __str__(self):
        return f"Floor plan for {self.location.name}"

class VenueBooking(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking for {self.location.name} by {self.user.username} at {self.event.name}"
# backend/main/locations/models.py

class WaitlistEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    desired_date = models.DateField()

    def __str__(self):
        return f"{self.user.username} on waitlist for {self.location.name}"

class LocationReview(models.Model):
    location = models.ForeignKey(Location, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.location.name} by {self.user.username}"


class Question(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    text = models.TextField()
    answer_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Question about {self.location.name} by {self.user.username}"

class Quote(models.Model):
    """
    Represents a quote request and its lifecycle for a specific location.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='quotes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quote_requests')
    event_details = models.TextField(help_text="Brief description of the event, number of guests, etc.")
    requested_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Fields to be filled in by the venue manager (e.g., Shaun Bird)
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Notes from the venue manager, terms, etc.")
    pro_forma_invoice = models.FileField(upload_to='invoices/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote for {self.location.name} by {self.user.username}"

class Wish(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'location')

    def __str__(self):
        return f"{self.user.username} wishes for {self.location.name}"