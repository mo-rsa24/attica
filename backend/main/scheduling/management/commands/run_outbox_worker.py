"""
Continuous outbox worker daemon.

Runs the scheduling outbox dispatch in a tight loop so that bookings,
notifications, and webhooks are processed without requiring an external
task queue (Celery/etc.).

Usage:
    python manage.py run_outbox_worker
    python manage.py run_outbox_worker --interval 15 --limit 200

In production, run this process under a process supervisor (systemd,
supervisord, Docker CMD) so it restarts on crash.  A single worker process
is sufficient for most deployments; add --concurrency for higher throughput
once Celery is introduced.
"""

import signal
import time

from django.core.management.base import BaseCommand

from scheduling.services import dispatch_outbox_events


class Command(BaseCommand):
    help = "Run the outbox worker daemon — dispatches pending events on a fixed interval."

    def add_arguments(self, parser):
        parser.add_argument(
            "--interval",
            type=int,
            default=30,
            help="Seconds to sleep between dispatch cycles (default: 30).",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="Maximum outbox events to process per cycle (default: 100).",
        )

    def handle(self, *args, **options):
        interval = options["interval"]
        limit = options["limit"]

        # Graceful shutdown on SIGINT / SIGTERM
        self._running = True

        def _stop(signum, frame):
            self.stdout.write(self.style.WARNING("Shutting down outbox worker…"))
            self._running = False

        signal.signal(signal.SIGINT, _stop)
        signal.signal(signal.SIGTERM, _stop)

        self.stdout.write(
            self.style.SUCCESS(
                f"Outbox worker started — interval={interval}s, limit={limit}"
            )
        )

        while self._running:
            try:
                result = dispatch_outbox_events(
                    limit=limit,
                    consume_notifications=True,
                    consume_webhooks=True,
                )
                if result["processed"] or result["failed"]:
                    self.stdout.write(
                        f"[outbox] processed={result['processed']} "
                        f"failed={result['failed']} "
                        f"dead_lettered={result.get('dead_lettered', 0)}"
                    )
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(self.style.ERROR(f"[outbox] dispatch error: {exc}"))

            # Sleep in small increments so SIGTERM is handled promptly
            for _ in range(interval * 2):
                if not self._running:
                    break
                time.sleep(0.5)

        self.stdout.write(self.style.SUCCESS("Outbox worker stopped."))
