from django.db import models
from django.conf import settings
from events.models import Event

class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artists')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artist_profile')
    profile_image = models.ImageField(upload_to='artist_profiles/', null=True, blank=True)
    genres = models.CharField(max_length=255, blank=True)
    rating = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)

    # --- Enriched Fields ---
    booking_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                      help_text="Cost per performance or hourly rate.")
    contact_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    instagram_handle = models.CharField(max_length=100, blank=True)
    availability = models.JSONField(default=dict, blank=True, help_text='e.g., {"2024-07-25": "unavailable"}')
    is_popular = models.BooleanField(default=False)  # To replace mock data logic


    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

class ArtistPortfolioItem(models.Model):
    """
    A new model to store an artist's portfolio items (e.g., images, videos).
    """
    artist = models.ForeignKey(Artist, related_name='portfolio_items', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='artists/portfolio/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Portfolio item for {self.artist.name}"

class Follow(models.Model):
    """
    A new model to represent the relationship between a user and an artist they follow.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='following', on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'artist') # A user can only follow an artist once

    def __str__(self):
        return f"{self.user.username} follows {self.artist.name}"

class ArtistBooking(models.Model):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='artist_bookings')
    date_booked = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    # Removed start_time and end_time as they are on the Event model

    class Meta:
        unique_together = ('artist', 'event')  # An artist can only be booked once per event

    def __str__(self):
        return f"{self.artist.name} for {self.event.name} - {self.status}"

class ArtistPost(models.Model):
    artist = models.ForeignKey('Artist', on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='artist_posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.artist.name} at {self.created_at.strftime('%Y-%m-%d')}"