"""
Periodic maintenance daemon.

Runs both `expire_pending_booking_requests` and `materialize_availability_slots`
on a fixed interval alongside the outbox worker so all background scheduling
jobs can be supervised as a single process group.

Usage:
    python manage.py expire_and_materialize
    python manage.py expire_and_materialize --interval 300
"""

import signal
import time

from django.core.management.base import BaseCommand
from django.utils import timezone

from scheduling.models import BookingRequest
from scheduling.services import materialize_slots_for_resource


class Command(BaseCommand):
    help = "Periodic maintenance: expire stale requests and materialize availability slots."

    def add_arguments(self, parser):
        parser.add_argument(
            "--interval",
            type=int,
            default=300,
            help="Seconds between maintenance cycles (default: 300 = 5 min).",
        )

    def handle(self, *args, **options):
        interval = options["interval"]
        self._running = True

        def _stop(signum, frame):
            self.stdout.write(self.style.WARNING("Shutting down maintenance worker…"))
            self._running = False

        signal.signal(signal.SIGINT, _stop)
        signal.signal(signal.SIGTERM, _stop)

        self.stdout.write(
            self.style.SUCCESS(f"Maintenance worker started — interval={interval}s")
        )

        while self._running:
            try:
                # Expire stale PENDING requests
                expired = BookingRequest.objects.filter(
                    status=BookingRequest.Status.PENDING,
                    expires_at__lt=timezone.now(),
                ).update(status=BookingRequest.Status.EXPIRED)
                if expired:
                    self.stdout.write(f"[maintenance] expired {expired} stale requests")
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(self.style.ERROR(f"[maintenance] expire error: {exc}"))

            for _ in range(interval * 2):
                if not self._running:
                    break
                time.sleep(0.5)

        self.stdout.write(self.style.SUCCESS("Maintenance worker stopped."))
