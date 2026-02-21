from django.core.management.base import BaseCommand

from scheduling.services import expire_pending_requests


class Command(BaseCommand):
    help = "Expire stale pending booking requests in scheduling module."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=500)

    def handle(self, *args, **options):
        updated = expire_pending_requests(limit=options["limit"])
        self.stdout.write(self.style.SUCCESS(f"Expired {updated} booking request(s)."))
