from django.db import models
from django.urls import reverse
from django.conf import settings
from users.models import CustomUser


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Vendor(models.Model): # Vendor
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='vendor_profile',null=True, blank=True)
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

class Service(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='servicecategory')
    image = models.ImageField(upload_to='service/')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='vendorservices')
    number_of_guests = models.IntegerField()
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Price with 2 decimal places
    rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
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

class Review(models.Model):
    comment = models.TextField(null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews')
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='reviewer', null=True, blank=True)
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
