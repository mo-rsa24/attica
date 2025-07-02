import csv
from django.core.management.base import BaseCommand
from vendors.models import Region


class Command(BaseCommand):
    help = "Load regions from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_regions_dummy_data.csv"
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                Region.objects.get_or_create(
                    id=row["id"],
                    defaults={"name": row["name"], "slug": row["slug"]},
                )
        self.stdout.write(self.style.SUCCESS("Regions loaded successfully."))