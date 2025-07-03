import csv
from django.core.management.base import BaseCommand
from artists.models import Artist
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Load artists from csv'

    def handle(self, *args, **options):
        path = 'sample_data/artists.csv'
        with open(path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                owner = User.objects.get(id=row['owner_id'])
                Artist.objects.update_or_create(
                    id=row['id'],
                    defaults={'name': row['name'], 'bio': row['bio'], 'owner': owner, 'user': owner}
                )
        self.stdout.write(self.style.SUCCESS('Artists loaded'))