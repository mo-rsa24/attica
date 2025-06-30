import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from vendors.models import Review, Service

class Command(BaseCommand):
    help = "Load reviews from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_reviews_dummy_data.csv"
        User = get_user_model()
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    service = Service.objects.get(id=row["service_id"])
                    user = User.objects.get(id=row["user_id"])

                    if not Review.objects.filter(id=row["id"]).exists():
                        Review.objects.create(
                            id=row["id"],
                            service=service,
                            user=user,
                            comment=row.get("comment", ""),
                            likes=int(row.get("likes", 0)),
                        )
                except (Service.DoesNotExist, User.DoesNotExist) as e:
                    self.stdout.write(self.style.WARNING(f"Skipping row due to missing Service/User: {e}"))

        self.stdout.write(self.style.SUCCESS("Reviews loaded successfully."))
