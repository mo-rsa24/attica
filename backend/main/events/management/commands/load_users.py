import csv

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
# from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Load users from a CSV file"

    def handle(self, *args, **kwargs):
        csv_file_path = "sample_data/realistic_users_dummy_data.csv"  # Update this path if needed

        try:
            with open(csv_file_path, "r") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    # Create user if not already present
                    User = get_user_model()
                    user, created = User.objects.get_or_create(
                        id=row["id"],
                        defaults={
                            "username": row["username"],
                            "email": row["email"],
                            "first_name": row["first_name"],
                            "last_name": row["last_name"],
                        },
                    )

                    if created:
                        user.set_password(row["password"])
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"User '{row['username']}' created."))
                    else:
                        self.stdout.write(self.style.WARNING(f"User '{row['username']}' already exists."))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File '{csv_file_path}' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
