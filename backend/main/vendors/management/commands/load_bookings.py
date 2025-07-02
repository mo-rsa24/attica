import csv
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from vendors.models import Service, Booking


class Command(BaseCommand):
    help = "Load bookings from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_bookings_dummy_data.csv"
        User = get_user_model()
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    service = Service.objects.get(id=row["service_id"])
                    user = User.objects.get(id=row["user_id"])
                    Booking.objects.create(
                        service=service,
                        user=user,
                        start_date=row["start_date"],
                        end_date=row["end_date"],
                        timeslot=row.get("timeslot", ""),
                        status=row.get("status", "pending"),
                    )
                except (Service.DoesNotExist, User.DoesNotExist) as e:
                    self.stdout.write(self.style.WARNING(f"Skipping row due to missing data: {e}"))
        self.stdout.write(self.style.SUCCESS("Bookings loaded successfully."))