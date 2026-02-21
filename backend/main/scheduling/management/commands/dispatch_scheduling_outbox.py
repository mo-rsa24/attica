from django.core.management.base import BaseCommand, CommandError

from scheduling.services import dispatch_outbox_events


class Command(BaseCommand):
    help = "Dispatch pending scheduling outbox events."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument(
            "--notifications-only",
            action="store_true",
            help="Dispatch only in-app notification consumers.",
        )
        parser.add_argument(
            "--webhooks-only",
            action="store_true",
            help="Dispatch only webhook consumers.",
        )

    def handle(self, *args, **options):
        notifications_only = options["notifications_only"]
        webhooks_only = options["webhooks_only"]

        if notifications_only and webhooks_only:
            raise CommandError("Use either --notifications-only or --webhooks-only, not both.")

        consume_notifications = not webhooks_only
        consume_webhooks = not notifications_only
        result = dispatch_outbox_events(
            limit=options["limit"],
            consume_notifications=consume_notifications,
            consume_webhooks=consume_webhooks,
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Outbox dispatched: "
                f"processed={result['processed']} "
                f"failed={result['failed']} "
                f"dead_lettered={result.get('dead_lettered', 0)}"
            )
        )
