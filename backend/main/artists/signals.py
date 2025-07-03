from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ArtistBooking

@receiver(post_save, sender=ArtistBooking)
def notify_artist_booking(sender, instance, created, **kwargs):
    if created:
        print(f"Artist {instance.artist.name} booked for event {instance.event.name}")