import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from vendors.models import Service

class Command(BaseCommand):
    help = "Load service likes from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_service_likes_dummy_data.csv"
        User = get_user_model()
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                service = Service.objects.get(id=row["service_id"])
                user = User.objects.get(id=row["user_id"])
                service.likes.add(user)
        self.stdout.write(self.style.SUCCESS("Service likes loaded successfully."))