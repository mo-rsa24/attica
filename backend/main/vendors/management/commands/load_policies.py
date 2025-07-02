import csv
from django.core.management.base import BaseCommand
from vendors.models import Service, Policy


class Command(BaseCommand):
    help = "Load policies from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_policies_dummy_data.csv"
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    service = Service.objects.get(id=row["service_id"])
                    Policy.objects.create(
                        service=service,
                        type=row["type"],
                        text=row["text"],
                    )
                except Service.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Service {row['service_id']} not found, skipping."))
        self.stdout.write(self.style.SUCCESS("Policies loaded successfully."))