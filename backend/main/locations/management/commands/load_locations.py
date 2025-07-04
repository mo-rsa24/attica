import csv
from django.core.management.base import BaseCommand
from locations.models import Location
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Load venues from csv'

    def handle(self, *args, **options):
        path = 'sample_data/locations.csv'
        with open(path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                owner = User.objects.get(id=row['owner_id'])
                Location.objects.update_or_create(
                    id=row['id'],
                    defaults={
                        'name': row['name'],
                        'address': row['address'],
                        'capacity': row['capacity'],
                        'owner': owner,
                        'is_approved': row['is_approved'].lower() == 'true'
                    }
                )
        self.stdout.write(self.style.SUCCESS('Venues loaded'))