import csv
from django.core.management.base import BaseCommand
from vendors.models import Vendor, Category
from decimal import Decimal
import requests
from requests.exceptions import RequestException
from django.core.files.base import ContentFile


class Command(BaseCommand):
    help = "Load vendors from a CSV file"

    def handle(self, *args, **kwargs):
        with open('realistic_vendors_dummy_data.csv', 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    category = Category.objects.get(id=row['category_id'])
                    price_range = Decimal(row['price_range'])
                    rating = Decimal(row['rating']) if row['rating'] else Decimal('0.00')
                    image_url_image = None
                    if row['image_url']:
                        try:
                            image_response = requests.get(row['image_url'], timeout=5)
                            if image_response.status_code == 200:
                                image_name = f"image_url_{row['name'].replace(' ', '_')}.jpg"
                                image_url_image = ContentFile(image_response.content, name=image_name)
                        except RequestException as e:
                            self.stdout.write(self.style.WARNING(f"Image download failed for {row['image_url']}: {e}"))
                            image_url_image = None  # Continue without the image
                    Vendor.objects.create(
                        name=row['name'],
                        category=category,
                        price_range=price_range,
                        rating=rating,
                        testimonial=row['testimonial'],
                        description=row['description'],
                        portfolio=image_url_image
                    )
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row {row}: {e}"))
        self.stdout.write(self.style.SUCCESS("Vendors loaded successfully."))
