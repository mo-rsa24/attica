import csv
from django.core.management.base import BaseCommand
from vendors.models import Category

class Command(BaseCommand):
    help = "Load categories from a CSV file"

    def handle(self, *args, **kwargs):
        with open('realistic_categories_dummy_data.csv', 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                Category.objects.get_or_create(id=row['id'], name=row['name'])
        self.stdout.write(self.style.SUCCESS("Categories loaded successfully."))
