from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

E2E_USERNAME = "e2e-organizer"
E2E_EMAIL = "e2e-organizer@attica.test"
E2E_PASSWORD = "E2eOrganizerPass!23"


class Command(BaseCommand):
    help = "Idempotently create the deterministic organizer used by Playwright E2E tests."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=E2E_USERNAME,
            defaults={"email": E2E_EMAIL, "user_type": "organizer", "is_active": True},
        )
        # Always reset password + flags so a poisoned dev DB still yields a working fixture.
        user.email = E2E_EMAIL
        user.user_type = "organizer"
        user.is_active = True
        user.set_password(E2E_PASSWORD)
        user.save()
        self.stdout.write(
            self.style.SUCCESS(
                f"E2E organizer ready: username={E2E_USERNAME} (created={created}, id={user.pk})"
            )
        )
