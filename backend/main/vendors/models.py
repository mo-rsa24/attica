from django.db import models
from django.db.models import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.urls import reverse
from django.conf import settings
from users.models import CustomUser


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Vendor(models.Model): # Vendor
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='vendor',null=True, blank=True)
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE,related_name='serviceprovider')
    price_range = models.DecimalField(max_digits=10, decimal_places=2)  # Price with 2 decimal places
    description = models.TextField()
    rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    testimonial = models.TextField(blank=True)
    portfolio = models.ImageField(upload_to='portfolio/')

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        """Return URL to access a detail record for this vendor."""
        return reverse('vendor_dashboard', kwargs={'pk': self.pk})

    def update_rating(self):
        avg = self.vendorservices.aggregate(avg=Avg("rating"))['avg'] or 0
        self.rating = round(avg, 2)
        self.save(update_fields=["rating"])

class Region(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    icon = models.ImageField(upload_to='amenities/', null=True, blank=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='servicecategory')
    image = models.ImageField(upload_to='service/')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='vendorservices')
    number_of_guests = models.IntegerField()
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Price with 2 decimal places
    rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    amenities = models.ManyToManyField(Amenity, related_name="services", blank=True)
    regions = models.ManyToManyField(Region, related_name="services", blank=True)
    similar_services = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="similar_to",
    )
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_services",
        blank=True,
    )
    location_tags = models.CharField(max_length=50, choices=[
        ('JHB', 'JHB'),
        ('CPT', 'CPT'),
        ('PTA', 'PTA'),
    ],default='JHB' )
    # service = Service(name="Catering", category=catering, image="service/catering.jpg", vendor=toni, number_of_guests=100, rating=4.9, location_tags='JHB')

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        """Return URL to access a detail record for this vendor."""
        return reverse('service_detail', kwargs={'pk': self.pk})

    def total_likes(self):
        return self.likes.count()

    def update_rating(self):
        avg = self.reviews.aggregate(avg=Avg("rating"))['avg'] or 0
        self.rating = round(avg, 2)
        self.save(update_fields=["rating"])
        self.vendor.update_rating()

class Review(models.Model):
    comment = models.TextField(null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews')
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='reviewer', null=True, blank=True)
    rating = models.IntegerField(default=5)
    likes = models.IntegerField(default=0)

class Comment(models.Model):
    comment = models.TextField(null=True, blank=True)
    likes = models.IntegerField(default=0)

class VendorPost(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE,related_name='posts')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE,related_name='postcomment', null=True, blank=True)
    image = models.ImageField(upload_to='posts/')
    caption = models.TextField()
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.vendor.name} at {self.created_at}"

class ServiceImage(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='service_gallery/')


class VendorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vendor_profile')

    # Contact & Basic Information
    company_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    website = models.URLField(max_length=200, blank=True)
    profile_picture = models.ImageField(upload_to='vendor_profile_pics/', null=True, blank=True)

    # Business Details
    service_description = models.TextField(blank=True, help_text="A short description of the services you offer.")
    years_in_business = models.PositiveIntegerField(null=True, blank=True)

    # Address Information
    address_line_1 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)

    # Verification Status for administrative purposes
    is_verified = models.BooleanField(default=False, help_text="Indicates if the vendor has been verified by an admin.")

    def __str__(self):
        # Display the company name if available, otherwise fall back to the username.
        display_name = self.company_name or self.user.username
        return f"{display_name}'s Vendor Profile"


# --- These signal handlers automatically create a VendorProfile for every new user. ---

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_vendor_profile(sender, instance, created, **kwargs):
    """
    Signal handler to create a VendorProfile when a new User is created.
    """
    if created:
        # This check ensures we don't try to create a profile if one already exists.
        if not hasattr(instance, 'profile'):
            VendorProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_vendor_profile(sender, instance, **kwargs):
    """
    Signal handler to save the VendorProfile whenever the User object is saved.
    """
    # Use hasattr to check if the profile exists to prevent errors during initial creation.
    if hasattr(instance, 'profile'):
        instance.profile.save()

class Policy(models.Model):
    POLICY_TYPES = [
        ('cancellation', 'Cancellation'),
        ('safety', 'Safety'),
        ('other', 'Other'),
    ]
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='policies')
    type = models.CharField(max_length=20, choices=POLICY_TYPES)
    text = models.TextField()

    def __str__(self):
        return f"{self.get_type_display()} policy for {self.service.name}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    timeslot = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.service.name} by {self.user.username}"

class BookingRequest(models.Model):
    """A pending booking request created from the request-to-book page."""

    PAYMENT_CHOICES = [
        ("full", "Pay in full"),
        ("partial", "Pay part now, part later"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="booking_requests")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="booking_requests")
    start_date = models.DateField()
    end_date = models.DateField()
    guests = models.PositiveIntegerField(default=1)
    payment_option = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="full")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking request for {self.service.name} by {self.user.username}"


@receiver(post_save, sender=Review)
def update_service_rating_on_save(sender, instance, **kwargs):
    instance.service.update_rating()


@receiver(post_delete, sender=Review)
def update_service_rating_on_delete(sender, instance, **kwargs):
    instance.service.update_rating()