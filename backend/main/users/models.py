from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPES = [
        ('organizer', 'Organizer'),
        ('vendor','Vendor'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='organizer')
