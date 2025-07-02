import csv
import requests
from requests.exceptions import RequestException
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from vendors.models import Amenity


class Command(BaseCommand):
    help = "Load amenities from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_amenities_dummy_data.csv"
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                icon = None
                if row.get("icon_url"):
                    try:
                        resp = requests.get(row["icon_url"], timeout=5)
                        if resp.status_code == 200:
                            name = row["icon_url"].split("/")[-1].split("?")[0]
                            icon = ContentFile(resp.content, name=name)
                    except RequestException:
                        self.stdout.write(self.style.WARNING(f"Icon download failed for {row['icon_url']}"))
                Amenity.objects.create(id=row.get("id"), name=row["name"], icon=icon)
        self.stdout.write(self.style.SUCCESS("Amenities loaded successfully."))