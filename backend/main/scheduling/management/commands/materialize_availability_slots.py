from __future__ import annotations

from datetime import date

from django.core.management.base import BaseCommand, CommandError

from scheduling.services import materialize_availability_slots


class Command(BaseCommand):
    help = "Materialize availability rules into explicit AvailabilitySlot records."

    def add_arguments(self, parser):
        parser.add_argument("--start-date", type=str, default=None, help="Inclusive start date (YYYY-MM-DD).")
        parser.add_argument("--end-date", type=str, default=None, help="Inclusive end date (YYYY-MM-DD).")
        parser.add_argument("--days", type=int, default=180, help="Horizon days when --end-date is not provided.")
        parser.add_argument("--resource-id", type=int, default=None, help="Optional marketplace resource id.")

    def _parse_date(self, value: str | None, option_name: str):
        if value is None:
            return None
        try:
            return date.fromisoformat(value)
        except ValueError as exc:
            raise CommandError(f"Invalid {option_name} value: '{value}'. Expected YYYY-MM-DD.") from exc

    def handle(self, *args, **options):
        start_date = self._parse_date(options["start_date"], "--start-date")
        end_date = self._parse_date(options["end_date"], "--end-date")
        days = options["days"]
        if days < 0:
            raise CommandError("--days must be >= 0.")

        result = materialize_availability_slots(
            start_date=start_date,
            end_date=end_date,
            horizon_days=days,
            resource_id=options["resource_id"],
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Materialization complete: "
                f"rules={result['rules_processed']} "
                f"created={result['slots_created']} "
                f"updated={result['slots_updated']} "
                f"skipped_nonexistent={result['skipped_nonexistent']} "
                f"range={result['range_start']}..{result['range_end']}"
            )
        )
