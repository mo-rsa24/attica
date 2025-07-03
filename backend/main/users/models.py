from django.conf import settings
from django.contrib.auth.models import AbstractUser, User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

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

class UserProfile(models.Model):
    """
    Extends the default Django User model to include additional profile information.
    """
    # This line is crucial. It creates a one-to-one link between a User and a UserProfile.
    # Each User will have exactly one UserProfile.
    # user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    # Additional fields for the profile
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    # You can add more fields here as needed, e.g., location, phone number, etc.
    # location = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'

# These functions ensure that a UserProfile is automatically created
# for every new User that is created. This is a common Django pattern.

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Signal handler to create a UserProfile when a new User is created."""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Signal handler to save the UserProfile whenever the User object is saved."""
    instance.profile.save()