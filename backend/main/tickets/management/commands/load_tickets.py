import csv
from django.core.management.base import BaseCommand
from tickets.models import Ticket
from django.contrib.auth import get_user_model
from events.models import Event

User = get_user_model()

class Command(BaseCommand):
    help = 'Load tickets from csv'

    def handle(self, *args, **options):
        path = 'sample_data/tickets.csv'
        with open(path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                buyer = User.objects.get(id=row['buyer_id'])
                event = Event.objects.get(id=row['event_id'])
                Ticket.objects.update_or_create(
                    id=row['id'],
                    defaults={'event': event, 'buyer': buyer, 'quantity': row['quantity'], 'payment_status': row['payment_status']}
                )
        self.stdout.write(self.style.SUCCESS('Tickets loaded'))