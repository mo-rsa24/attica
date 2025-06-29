import csv
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from events.models import Event
# from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Load events from a CSV file"

    def handle(self, *args, **kwargs):
        csv_file_path = "realistic_events_dummy_data.csv"  # Update this path if needed

        try:
            with open(csv_file_path, "r") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    try:
                        # Fetch users
                        User = get_user_model()
                        user = User.objects.get(id=row["user_id"])
                        partner_user = User.objects.get(id=row["partner_user_id"])

                        # Create event
                        Event.objects.create(
                            user=user,
                            name=row["event_name"],
                            date=row["date"],
                            location=row["location"],
                            budget=Decimal(row["budget"]),
                            guest_count=row["guest_count"],
                            theme=row["theme"],
                            notes=row["notes"],
                        )
                        self.stdout.write(self.style.SUCCESS(f"Event '{row['event_name']}' created."))

                    except User.DoesNotExist as e:
                        self.stdout.write(self.style.ERROR(f"User not found: {e}"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing row {row}: {e}"))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File '{csv_file_path}' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
