"""
Seed test MarketplaceResource data for the booking workspace (Step 3).

Usage:
    python manage.py seed_marketplace
    python manage.py seed_marketplace --clear   # delete existing seed data first

Creates:
  - 4 artist users + Artist profiles + MarketplaceResources + AvailabilityRules
  - 3 vendor users + Vendor profiles + MarketplaceResources + AvailabilityRules
  - 2 venue users + Location profiles + MarketplaceResources + AvailabilityRules

All resources get a ResourcePolicy with min_notice_hours=0 so bookings can be
requested immediately (useful for local dev / demo).
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

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------
ARTISTS = [
    {
        "username": "seed_artist_zola",
        "display_name": "Zola & The Band",
        "bio": "South Africa's hottest Afrobeats collective. Electric performances for any stage.",
        "genres": "Afrobeats, Kwaito, House",
        "booking_fee": 8500,
        "booking_fee_min": 6000,
        "booking_fee_max": 15000,
        "city": "Johannesburg",
        "rating": 4.8,
    },
    {
        "username": "seed_artist_nandi",
        "display_name": "Nandi Dlamini",
        "bio": "Award-winning jazz vocalist and songwriter with 10+ years of live experience.",
        "genres": "Jazz, Soul, R&B",
        "booking_fee": 12000,
        "booking_fee_min": 10000,
        "booking_fee_max": 20000,
        "city": "Cape Town",
        "rating": 4.9,
    },
    {
        "username": "seed_artist_dj_karabo",
        "display_name": "DJ Karabo",
        "bio": "Internationally acclaimed DJ specialising in deep house, amapiano, and commercial sets.",
        "genres": "House, Amapiano, Commercial",
        "booking_fee": 5000,
        "booking_fee_min": 3500,
        "booking_fee_max": 10000,
        "city": "Pretoria",
        "rating": 4.6,
    },
    {
        "username": "seed_artist_brass_co",
        "display_name": "The Brass Co.",
        "bio": "High-energy brass band that turns any event into a party.",
        "genres": "Jazz, Brass, Pop",
        "booking_fee": 15000,
        "booking_fee_min": 12000,
        "booking_fee_max": 25000,
        "city": "Durban",
        "rating": 4.7,
    },
]

VENDORS = [
    {
        "username": "seed_vendor_feast",
        "display_name": "Feast Cape Town",
        "description": "Premium catering specialising in Cape Malay and international cuisine.",
        "price_range": 350,
        "category_name": "Catering",
        "city": "Cape Town",
        "rating": 4.5,
    },
    {
        "username": "seed_vendor_luminary",
        "display_name": "Luminary Productions",
        "description": "Full-service sound, lighting, staging, and AV for concerts and festivals.",
        "price_range": 25000,
        "category_name": "Production",
        "city": "Johannesburg",
        "rating": 4.8,
    },
    {
        "username": "seed_vendor_petal",
        "display_name": "Petal & Push Décor",
        "description": "Bespoke event décor and floral arrangements for weddings, galas, and corporate events.",
        "price_range": 8000,
        "category_name": "Décor",
        "city": "Johannesburg",
        "rating": 4.7,
    },
]

VENUES = [
    {
        "username": "seed_venue_atrium",
        "display_name": "The Atrium Event Space",
        "address": "14 Sandton Drive, Sandton, Johannesburg",
        "capacity": 800,
        "price": 18000,
        "city": "Johannesburg",
        "latitude": -26.1076,
        "longitude": 28.0567,
        "rating": 4.6,
    },
    {
        "username": "seed_venue_horizon",
        "display_name": "Horizon Rooftop Venue",
        "address": "1 Long Street, Cape Town",
        "capacity": 300,
        "price": 12000,
        "city": "Cape Town",
        "latitude": -33.9249,
        "longitude": 18.4241,
        "rating": 4.8,
    },
]

# Weekly rule covering every day, 09:00–22:00 local time
WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]  # Mon–Sun
RULE_START = date.today()
RULE_END = date.today() + timedelta(days=730)  # 2 years ahead


# ---------------------------------------------------------------------------
class Command(BaseCommand):
    help = "Seed test MarketplaceResource data (artists, vendors, venues) for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all seeded resources before creating new ones.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()

        with transaction.atomic():
            self._seed_artists()
            self._seed_vendors()
            self._seed_venues()

        self.stdout.write(self.style.SUCCESS(
            "\nSeed complete. "
            f"{len(ARTISTS)} artists, {len(VENDORS)} vendors, {len(VENUES)} venues created (or already existed).\n"
            "Run 'python manage.py materialize_availability_slots --days 90' to materialise slots if needed."
        ))

    # -----------------------------------------------------------------------
    def _clear(self):
        usernames = (
            [a["username"] for a in ARTISTS]
            + [v["username"] for v in VENDORS]
            + [v["username"] for v in VENUES]
        )
        deleted_resources = MarketplaceResource.objects.filter(
            owner__username__in=usernames
        ).delete()
        deleted_users = User.objects.filter(username__in=usernames).delete()
        self.stdout.write(f"Cleared: {deleted_resources}, {deleted_users}")

    # -----------------------------------------------------------------------
    def _get_or_create_user(self, username: str) -> "User":
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": f"{username}@seed.attica.local",
                "user_type": "artist",  # generic; doesn't affect scheduling
            },
        )
        if created:
            user.set_password("seed_pass_123!")
            user.save(update_fields=["password"])
        return user

    def _make_rule(self, resource: MarketplaceResource):
        AvailabilityRule.objects.get_or_create(
            resource=resource,
            name="All week 09:00–22:00",
            defaults={
                "is_active": True,
                "timezone": "Africa/Johannesburg",
                "frequency": AvailabilityRule.Frequency.WEEKLY,
                "weekdays": WEEKDAYS_ALL,
                "effective_start_date": RULE_START,
                "effective_end_date": RULE_END,
                "local_start_time": time(9, 0),
                "local_end_time": time(22, 0),
                "capacity": 1,
            },
        )

    def _make_policy(self, resource: MarketplaceResource):
        ResourcePolicy.objects.update_or_create(
            resource=resource,
            defaults={
                "booking_mode": ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
                "min_notice_hours": 0,   # no lead-time restriction for dev
                "max_horizon_days": 730,
                "buffer_before_minutes": 0,
                "buffer_after_minutes": 0,
            },
        )

    # -----------------------------------------------------------------------
    def _seed_artists(self):
        for data in ARTISTS:
            user = self._get_or_create_user(data["username"])
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
            status = "created" if created else "exists"
            self.stdout.write(f"  Artist resource [{status}]: {data['display_name']}")

    # -----------------------------------------------------------------------
    def _seed_vendors(self):
        for data in VENDORS:
            user = self._get_or_create_user(data["username"])
            category, _ = Category.objects.get_or_create(name=data["category_name"])
            vendor, _ = Vendor.objects.get_or_create(
                user=user,
                defaults={
                    "name": data["display_name"],
                    "category": category,
                    "price_range": data["price_range"],
                    "description": data["description"],
                    "rating": data["rating"],
                    "portfolio": "",  # no image for seed data
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
            status = "created" if created else "exists"
            self.stdout.write(f"  Vendor resource [{status}]: {data['display_name']}")

    # -----------------------------------------------------------------------
    def _seed_venues(self):
        for data in VENUES:
            user = self._get_or_create_user(data["username"])
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
            status = "created" if created else "exists"
            self.stdout.write(f"  Venue resource [{status}]: {data['display_name']}")
