from django.core.management.base import BaseCommand

from scheduling.services import expire_checkout_sessions


class Command(BaseCommand):
    help = "Expire active checkout holds whose timer has elapsed."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=500)

    def handle(self, *args, **options):
        expired = expire_checkout_sessions(limit=options["limit"])
        self.stdout.write(self.style.SUCCESS(f"Expired {expired} checkout hold(s)."))
