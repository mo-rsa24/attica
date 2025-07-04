import csv
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from events.models import Event
from locations.models import Location  # Import the Location model


class Command(BaseCommand):
    help = "Load events from a CSV file"

    def handle(self, *args, **kwargs):
        csv_file_path = "sample_data/realistic_events_dummy_data.csv"

        try:
            with open(csv_file_path, "r") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    try:
                        User = get_user_model()
                        user = User.objects.get(id=row["user_id"])

                        # Get or create the Location object
                        location_obj, created = Location.objects.get_or_create(
                            name=row["location"],
                            # You can add default values for other fields if needed
                            defaults={'address': '', 'capacity': 0, 'owner': user}
                        )

                        Event.objects.create(
                            user=user,
                            name=row["event_name"],
                            date=row["date"],
                            location=location_obj,  # Assign the Location object
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