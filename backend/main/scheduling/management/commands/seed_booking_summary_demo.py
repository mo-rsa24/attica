"""
Seed a self-contained demo scenario for the Event Booking Summary feature.

Creates entirely new fictional artists, one venue, one vendor, plus a test
organizer account. All usernames use the prefix "bsdemo_" so they are easy to
identify and will never collide with the seed_marketplace command.

Usage:
    python manage.py seed_booking_summary_demo
    python manage.py seed_booking_summary_demo --clear   # wipe + re-seed

Then materialise slots:
    python manage.py materialize_availability_slots --days 90

Demo accounts printed on stdout after seeding.
"""
from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from artists.models import Artist
from locations.models import Location
from scheduling.models import AvailabilityRule, MarketplaceResource, ResourcePolicy
from vendors.models import Category, Vendor

User = get_user_model()

ORGANIZER = {
    "username": "bsdemo_organizer",
    "password": "Demo@1234!",
    "email": "organizer@bsdemo.attica.local",
    "first_name": "Lerato",
    "last_name": "Mokoena",
}

ARTISTS = [
    {
        "username": "bsdemo_artist_siya",
        "password": "Demo@1234!",
        "display_name": "Siya Mthembu",
        "bio": "Neo-soul vocalist and multi-instrumentalist redefining township sounds for the modern era.",
        "genres": "Neo-Soul, Afro-R&B, Township Jazz",
        "booking_fee": 9500,
        "booking_fee_min": 7000,
        "booking_fee_max": 18000,
        "city": "Johannesburg",
        "rating": 4.9,
    },
    {
        "username": "bsdemo_artist_luna",
        "password": "Demo@1234!",
        "display_name": "Luna Dlamini",
        "bio": "Electronic producer and DJ fusing Afrotech with experimental beats. Headline slots only.",
        "genres": "Afrotech, Electronic, Experimental",
        "booking_fee": 12000,
        "booking_fee_min": 8000,
        "booking_fee_max": 22000,
        "city": "Cape Town",
        "rating": 4.7,
    },
    {
        "username": "bsdemo_artist_trio",
        "password": "Demo@1234!",
        "display_name": "The Venda Trio",
        "bio": "Traditional Venda instruments fused with contemporary jazz — a uniquely South African soundscape.",
        "genres": "Traditional, Jazz, Fusion",
        "booking_fee": 7500,
        "booking_fee_min": 5000,
        "booking_fee_max": 14000,
        "city": "Pretoria",
        "rating": 4.8,
    },
]

VENDORS = [
    {
        "username": "bsdemo_vendor_spice",
        "password": "Demo@1234!",
        "display_name": "Spice & Salt Catering",
        "description": "Contemporary South African cuisine — small plates, bunny chow stations, and live braai setups.",
        "price_range": 280,
        "category_name": "Catering",
        "city": "Durban",
        "rating": 4.6,
    },
]

VENUES = [
    {
        "username": "bsdemo_venue_rise",
        "password": "Demo@1234!",
        "display_name": "Rise Rooftop, Sandton",
        "address": "22 West Street, Sandton, Johannesburg",
        "capacity": 450,
        "price": 14000,
        "city": "Johannesburg",
        "latitude": -26.1067,
        "longitude": 28.0560,
        "rating": 4.7,
    },
]

WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]
RULE_START = date.today()
RULE_END = date.today() + timedelta(days=365)


class Command(BaseCommand):
    help = "Seed the Event Booking Summary demo scenario (bsdemo_ prefixed accounts)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all bsdemo_ seeded data before re-creating.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()

        with transaction.atomic():
            organizer = self._seed_organizer()
            self._seed_artists()
            self._seed_vendor()
            self._seed_venue()

        self._print_credentials(organizer)

    # -----------------------------------------------------------------------
    def _clear(self):
        all_usernames = (
            [ORGANIZER["username"]]
            + [a["username"] for a in ARTISTS]
            + [v["username"] for v in VENDORS]
            + [v["username"] for v in VENUES]
        )
        MarketplaceResource.objects.filter(owner__username__in=all_usernames).delete()
        User.objects.filter(username__in=all_usernames).delete()
        self.stdout.write("Cleared existing bsdemo_ accounts.")

    # -----------------------------------------------------------------------
    def _get_or_create_user(self, data: dict) -> "User":
        user, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data.get("email", f"{data['username']}@bsdemo.attica.local"),
                "first_name": data.get("first_name", ""),
                "last_name": data.get("last_name", ""),
                "user_type": data.get("user_type", "artist"),
            },
        )
        if created:
            user.set_password(data["password"])
            user.save(update_fields=["password"])
        return user

    def _make_rule(self, resource: MarketplaceResource):
        AvailabilityRule.objects.get_or_create(
            resource=resource,
            name="All week 08:00–23:00",
            defaults={
                "is_active": True,
                "timezone": "Africa/Johannesburg",
                "frequency": AvailabilityRule.Frequency.WEEKLY,
                "weekdays": WEEKDAYS_ALL,
                "effective_start_date": RULE_START,
                "effective_end_date": RULE_END,
                "local_start_time": time(8, 0),
                "local_end_time": time(23, 0),
                "capacity": 1,
            },
        )

    def _make_policy(self, resource: MarketplaceResource):
        ResourcePolicy.objects.update_or_create(
            resource=resource,
            defaults={
                "booking_mode": ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
                "min_notice_hours": 0,
                "max_horizon_days": 365,
                "buffer_before_minutes": 0,
                "buffer_after_minutes": 0,
            },
        )

    # -----------------------------------------------------------------------
    def _seed_organizer(self):
        data = dict(ORGANIZER, user_type="organizer")
        user = self._get_or_create_user(data)
        self.stdout.write(f"  Organizer: {user.username}")
        return user

    def _seed_artists(self):
        for data in ARTISTS:
            user_data = dict(data, user_type="artist")
            user = self._get_or_create_user(user_data)
            artist, _ = Artist.objects.get_or_create(
                user=user,
                defaults={
                    "name": data["display_name"],
                    "owner": user,
                    "bio": data["bio"],
                    "genres": data["genres"],
                    "booking_fee": data["booking_fee"],
                    "booking_fee_min": data["booking_fee_min"],
                    "booking_fee_max": data["booking_fee_max"],
                    "rating": data["rating"],
                },
            )
            resource, created = MarketplaceResource.objects.get_or_create(
                artist=artist,
                defaults={
                    "owner": user,
                    "resource_type": MarketplaceResource.ResourceType.ARTIST,
                    "display_name": data["display_name"],
                    "city": data["city"],
                    "is_active": True,
                },
            )
            self._make_policy(resource)
            self._make_rule(resource)
            self.stdout.write(f"  Artist {'created' if created else 'exists'}: {data['display_name']}")

    def _seed_vendor(self):
        for data in VENDORS:
            user_data = dict(data, user_type="vendor")
            user = self._get_or_create_user(user_data)
            category, _ = Category.objects.get_or_create(name=data["category_name"])
            vendor, _ = Vendor.objects.get_or_create(
                user=user,
                defaults={
                    "name": data["display_name"],
                    "category": category,
                    "price_range": data["price_range"],
                    "description": data["description"],
                    "rating": data["rating"],
                    "portfolio": "",
                },
            )
            resource, created = MarketplaceResource.objects.get_or_create(
                vendor=vendor,
                defaults={
                    "owner": user,
                    "resource_type": MarketplaceResource.ResourceType.VENDOR,
                    "display_name": data["display_name"],
                    "city": data["city"],
                    "is_active": True,
                },
            )
            self._make_policy(resource)
            self._make_rule(resource)
            self.stdout.write(f"  Vendor {'created' if created else 'exists'}: {data['display_name']}")

    def _seed_venue(self):
        for data in VENUES:
            user_data = dict(data, user_type="venue_manager")
            user = self._get_or_create_user(user_data)
            location, _ = Location.objects.get_or_create(
                name=data["display_name"],
                defaults={
                    "owner": user,
                    "address": data["address"],
                    "capacity": data["capacity"],
                    "price": data["price"],
                    "latitude": data["latitude"],
                    "longitude": data["longitude"],
                    "is_approved": True,
                    "rating": data["rating"],
                },
            )
            resource, created = MarketplaceResource.objects.get_or_create(
                venue=location,
                defaults={
                    "owner": user,
                    "resource_type": MarketplaceResource.ResourceType.VENUE,
                    "display_name": data["display_name"],
                    "city": data["city"],
                    "is_active": True,
                },
            )
            self._make_policy(resource)
            self._make_rule(resource)
            self.stdout.write(f"  Venue {'created' if created else 'exists'}: {data['display_name']}")

    # -----------------------------------------------------------------------
    def _print_credentials(self, organizer):
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS("Event Booking Summary — Demo Credentials"))
        self.stdout.write("=" * 60)
        self.stdout.write(f"\nORGANIZER (creates the event draft):")
        self.stdout.write(f"  Username : {ORGANIZER['username']}")
        self.stdout.write(f"  Password : {ORGANIZER['password']}")
        self.stdout.write(f"\nARTISTS (log in to accept/decline requests):")
        for a in ARTISTS:
            self.stdout.write(f"  {a['display_name']}")
            self.stdout.write(f"    Username : {a['username']}")
            self.stdout.write(f"    Password : {a['password']}")
            self.stdout.write(f"    Fee      : R{a['booking_fee']:,}")
        self.stdout.write(f"\nVENDOR:")
        for v in VENDORS:
            self.stdout.write(f"  {v['display_name']}")
            self.stdout.write(f"    Username : {v['username']}")
            self.stdout.write(f"    Password : {v['password']}")
        self.stdout.write(f"\nVENUE:")
        for v in VENUES:
            self.stdout.write(f"  {v['display_name']}")
            self.stdout.write(f"    Username : {v['username']}")
            self.stdout.write(f"    Password : {v['password']}")
        self.stdout.write("\nNEXT STEPS:")
        self.stdout.write("  1. Run: python manage.py materialize_availability_slots --days 90")
        self.stdout.write("  2. Log in as the organizer and create an event draft.")
        self.stdout.write("  3. In Step 3, search for providers (use any date window).")
        self.stdout.write("     The bsdemo_ providers will appear in search results.")
        self.stdout.write("  4. Send booking requests to at least 2 providers.")
        self.stdout.write("  5. Open the Event Booking Summary to see pending spend.")
        self.stdout.write("  6. Log in as a provider and accept a request.")
        self.stdout.write("  7. Log back in as the organizer and see the summary update.")
        self.stdout.write("  8. Publish the draft — approved holds become real bookings.")
        self.stdout.write("=" * 60 + "\n")
