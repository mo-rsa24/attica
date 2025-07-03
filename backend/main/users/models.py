from django.contrib.auth.models import AbstractUser
from django.db import models

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
