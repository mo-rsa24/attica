from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.Model):
    """Simple role model so that a user can have multiple roles."""

    class Names(models.TextChoices):
        EVENT_ORGANIZER = "EVENT_ORGANIZER", "Event Organizer"
        ARTIST = "ARTIST", "Artist"
        SERVICE_PROVIDER = "SERVICE_PROVIDER", "Service Provider"
        VENUE_MANAGER = "VENUE_MANAGER", "Venue Manager"
        TICKET_BUYER = "TICKET_BUYER", "Ticket Buyer"

    name = models.CharField(max_length=30, choices=Names.choices, unique=True)

    def __str__(self):
        return self.get_name_display()


class CustomUser(AbstractUser):
    USER_TYPES = [
        ('organizer', 'Organizer'),
        ('vendor', 'Vendor'),
        ('artist', 'Artist'),
        ('venue', 'Venue Rep'),
        ('attendee', 'Attendee'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='organizer')
    profile_picture = models.ImageField(upload_to='profiles/', default='default_profile.jpg')
    roles = models.ManyToManyField(Role, blank=True)

    def has_role(self, role_name: str) -> bool:
        """Return True if the user has the given role name."""
        return self.roles.filter(name=role_name).exists()