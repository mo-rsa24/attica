import csv
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model

CustomUser = get_user_model()  # Dynamically get the user model from settings.AUTH_USER_MODEL


class Command(BaseCommand):
    help = "Load users from a CSV file into the custom user model"

    def handle(self, *args, **kwargs):
        csv_file_path = "realistic_users_dummy_data.csv"  # Update this path if needed

        try:
            with open(csv_file_path, "r") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    # Create user if not already present
                    user, created = CustomUser.objects.get_or_create(
                        id=row["id"],
                        defaults={
                            "username": row["username"],
                            "email": row["email"],
                            "first_name": row["first_name"],
                            "last_name": row["last_name"],
                            "user_type": row["user_type"],
                            "is_superuser": row["is_superuser"].lower() == "true",
                            "is_staff": row["is_staff"].lower() == "true",
                        },
                    )

                    if created:
                        user.set_password(row["password"])  # Hash password
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"User '{row['username']}' created."))
                    else:
                        self.stdout.write(self.style.WARNING(f"User '{row['username']}' already exists."))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File '{csv_file_path}' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
