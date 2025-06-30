import csv
from decimal import Decimal
import requests
from requests.exceptions import RequestException
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from vendors.models import Vendor, Category, Service, ServiceImage

class Command(BaseCommand):
    help = "Load services from CSV files"

    def handle(self, *args, **kwargs):
        files = [
            "sample_data/realistic_services_dummy_data.csv",
            "sample_data/realistic_services_extra_dummy_data.csv",
        ]
        for path in files:
            try:
                with open(path, "r") as file:
                    reader = csv.DictReader(file)
                    for row in reader:
                        try:
                            vendor = Vendor.objects.get(id=row["vendor_id"])
                            category = Category.objects.get(id=row["category_id"])
                            service_data = {
                                "name": row["name"],
                                "vendor": vendor,
                                "category": category,
                                "number_of_guests": int(row["number_of_guests"]),
                                "price": Decimal(row.get("price", "0")),
                                "rating": Decimal(row.get("rating", "0")),
                                "description": row.get("description", ""),
                                "location_tags": row.get("location_tags", "JHB"),
                            }
                            if row.get("id"):
                                service_data["id"] = int(row["id"])
                            service = Service.objects.create(**service_data)
                            if row.get("image_url"):
                                try:
                                    resp = requests.get(row["image_url"], timeout=5)
                                    if resp.status_code == 200:
                                        name = row["image_url"].split("/")[-1].split("?")[0]
                                        service.image.save(name, ContentFile(resp.content), save=True)
                                except RequestException:
                                    pass
                            gallery_urls = row.get("gallery_urls", "")
                            if gallery_urls:
                                for url in gallery_urls.split(";"):
                                    if not url:
                                        continue
                                    try:
                                        resp = requests.get(url, timeout=5)
                                        if resp.status_code == 200:
                                            name = url.split("/")[-1].split("?")[0]
                                            ServiceImage.objects.create(service=service, image=ContentFile(resp.content, name=name))
                                    except RequestException:
                                        continue
                            self.stdout.write(self.style.SUCCESS(f"Service '{service.name}' loaded."))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"Error processing row {row}: {e}"))
            except FileNotFoundError:
                self.stdout.write(self.style.WARNING(f"File '{path}' not found, skipping."))
        self.stdout.write(self.style.SUCCESS("Services loaded successfully."))