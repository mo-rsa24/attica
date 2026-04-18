"""
Seed the full booking-workflow test data for local QA and demo.

Creates
-------
Users (idempotent – won't overwrite existing):
  test_organizer  (EVENT_ORGANIZER)  password: Test123!
  test_artist     (ARTIST)           password: Test123!

Resources:
  test_artist gets a MarketplaceResource + ResourcePolicy + AvailabilityRule so
  the "live" scenario can be tested end-to-end from the UI.

Scenarios (7 Events + 7 BookingRequests + 2 Bookings + 1 Review):
  A  pending          — waiting for provider action
  B  counter_proposed — provider countered, organizer must respond
  C  confirmed        — APPROVED request → CONFIRMED booking
  D  completed        — past CONFIRMED booking → COMPLETED + Review submitted
  E  declined         — provider declined the request
  F  withdrawn        — organizer withdrew the request
  G  live             — PENDING to test_artist (interactive: log in as
                        test_artist to approve / decline / counter)

Usage
-----
  python manage.py seed_booking_workflow
  python manage.py seed_booking_workflow --clear   # wipe seed rows first
"""
from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from artists.models import Artist
from events.models import Event
from notifications.models import Notification
from scheduling.models import (
    AvailabilityRule,
    Booking,
    BookingRequest,
    MarketplaceResource,
    ResourcePolicy,
    Review,
)
from users.models import Role

User = get_user_model()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
PASSWORD = "Test123!"
ORGANIZER_USERNAME = "test_organizer"
ARTIST_USERNAME = "test_artist"

WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]
TODAY = date.today()
RULE_END = TODAY + timedelta(days=730)

# Pre-built scenario definitions
SCENARIOS = [
    {
        "label": "pending",
        "resource_username": "seed_artist_zola",
        "event_name": "Afrobeats Night [seed]",
        "request_status": BookingRequest.Status.PENDING,
        "request_message": "We'd love Zola & The Band for our outdoor concert on 15 March.",
        "start_delta_days": 30,
        "duration_hours": 3,
    },
    {
        "label": "counter_proposed",
        "resource_username": "seed_artist_nandi",
        "event_name": "Jazz Under the Stars [seed]",
        "request_status": BookingRequest.Status.COUNTER_PROPOSED,
        "request_message": "Nandi, we need you for our gala dinner on the 20th.",
        "provider_message": "I'm available but need a different slot — see counter-proposal.",
        "counter_delta_days": 22,  # counter window starts 2 days after original
        "counter_duration_hours": 2,
        "counter_rate": "14000.00",
        "counter_message": "Can do it on the 22nd instead. Adjusted rate applies.",
        "start_delta_days": 20,
        "duration_hours": 3,
    },
    {
        "label": "confirmed",
        "resource_username": "seed_artist_dj_karabo",
        "event_name": "House Music Festival [seed]",
        "request_status": BookingRequest.Status.APPROVED,
        "booking_status": Booking.Status.CONFIRMED,
        "request_message": "DJ Karabo for our festival mainstage on the 1st of next month.",
        "start_delta_days": 45,
        "duration_hours": 4,
    },
    {
        "label": "completed",
        "resource_username": "seed_artist_brass_co",
        "event_name": "New Year's Eve Gala [seed]",
        "request_status": BookingRequest.Status.APPROVED,
        "booking_status": Booking.Status.COMPLETED,
        "request_message": "Brass Co for our NYE party. We need a 3-hour set.",
        "start_delta_days": -21,   # happened 3 weeks ago
        "duration_hours": 3,
        "review_rating": 5,
        "review_comment": (
            "Absolutely incredible performance! The crowd loved every moment. "
            "Highly professional — would book again without hesitation."
        ),
    },
    {
        "label": "declined",
        "resource_username": "seed_vendor_feast",
        "event_name": "Corporate Gala Dinner [seed]",
        "request_status": BookingRequest.Status.DECLINED,
        "request_message": "We need catering for 300 guests at our annual gala.",
        "provider_message": "Unfortunately fully booked for that date. Try another slot.",
        "start_delta_days": 60,
        "duration_hours": 6,
    },
    {
        "label": "withdrawn",
        "resource_username": "seed_vendor_luminary",
        "event_name": "Tech Conference Afterparty [seed]",
        "request_status": BookingRequest.Status.WITHDRAWN,
        "request_message": "Full AV + staging for a 400-person conference afterparty.",
        "start_delta_days": 90,
        "duration_hours": 8,
    },
    {
        "label": "live",
        "resource_username": ARTIST_USERNAME,  # test_artist resource
        "event_name": "Demo Event – Live Test [seed]",
        "request_status": BookingRequest.Status.PENDING,
        "request_message": (
            "This is the live interactive test request. "
            "Log in as test_artist to approve, decline, or counter it."
        ),
        "start_delta_days": 14,
        "duration_hours": 2,
    },
]


# ---------------------------------------------------------------------------
class Command(BaseCommand):
    help = "Seed booking-workflow test data (users, events, requests, bookings, review)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all seed rows created by this command before re-creating them.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()

        with transaction.atomic():
            organizer = self._get_or_create_organizer()
            artist_user = self._get_or_create_artist_user()
            test_artist_resource = self._get_or_create_artist_resource(artist_user)
            self._seed_scenarios(organizer, test_artist_resource)

        self.stdout.write(self.style.SUCCESS(
            "\n✓ Booking workflow seed complete.\n\n"
            "  test_organizer → password: Test123!  (role: EVENT_ORGANIZER)\n"
            "  test_artist    → password: Test123!  (role: ARTIST)\n\n"
            "  7 scenarios seeded:  pending · counter_proposed · confirmed ·\n"
            "                       completed+review · declined · withdrawn · live\n"
        ))

    # -----------------------------------------------------------------------
    # Clear
    # -----------------------------------------------------------------------
    def _clear(self):
        seed_event_names = [s["event_name"] for s in SCENARIOS]

        # Delete bookings linked to seed events
        reviews_del = Review.objects.filter(
            booking__event__name__in=seed_event_names
        ).delete()
        bookings_del = Booking.objects.filter(
            event__name__in=seed_event_names
        ).delete()
        requests_del = BookingRequest.objects.filter(
            event__name__in=seed_event_names
        ).delete()
        events_del = Event.objects.filter(name__in=seed_event_names).delete()

        # Delete test_artist resource
        artist_resource_del = MarketplaceResource.objects.filter(
            owner__username=ARTIST_USERNAME
        ).delete()
        users_del = User.objects.filter(
            username__in=[ORGANIZER_USERNAME, ARTIST_USERNAME]
        ).delete()

        self.stdout.write(
            f"Cleared: {reviews_del} reviews, {bookings_del} bookings, "
            f"{requests_del} requests, {events_del} events, "
            f"{artist_resource_del} resources, {users_del} users."
        )

    # -----------------------------------------------------------------------
    # User helpers
    # -----------------------------------------------------------------------
    def _get_or_create_user(self, username: str, user_type: str, role_name: str) -> "User":
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": f"{username}@seed.attica.local",
                "first_name": username.replace("_", " ").title(),
                "user_type": user_type,
            },
        )
        if created:
            user.set_password(PASSWORD)
            user.save(update_fields=["password"])

        # Assign role
        role, _ = Role.objects.get_or_create(name=role_name)
        user.roles.add(role)

        status = "created" if created else "exists"
        self.stdout.write(f"  User [{status}]: {username}  ({role_name})")
        return user

    def _get_or_create_organizer(self) -> "User":
        return self._get_or_create_user(
            ORGANIZER_USERNAME,
            user_type="organizer",
            role_name=Role.Names.EVENT_ORGANIZER,
        )

    def _get_or_create_artist_user(self) -> "User":
        return self._get_or_create_user(
            ARTIST_USERNAME,
            user_type="artist",
            role_name=Role.Names.ARTIST,
        )

    # -----------------------------------------------------------------------
    # test_artist resource
    # -----------------------------------------------------------------------
    def _get_or_create_artist_resource(self, user: "User") -> MarketplaceResource:
        artist, _ = Artist.objects.get_or_create(
            user=user,
            defaults={
                "name": "Test Artist",
                "owner": user,
                "bio": "Seed artist for end-to-end booking workflow testing.",
                "genres": "Pop, Rock",
                "booking_fee": 5000,
                "booking_fee_min": 3000,
                "booking_fee_max": 8000,
                "rating": 4.5,
            },
        )
        resource, created = MarketplaceResource.objects.get_or_create(
            artist=artist,
            defaults={
                "owner": user,
                "resource_type": MarketplaceResource.ResourceType.ARTIST,
                "display_name": "Test Artist",
                "city": "Johannesburg",
                "is_active": True,
            },
        )
        ResourcePolicy.objects.update_or_create(
            resource=resource,
            defaults={
                "booking_mode": ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
                "min_notice_hours": 0,
                "max_horizon_days": 730,
                "buffer_before_minutes": 0,
                "buffer_after_minutes": 0,
            },
        )
        AvailabilityRule.objects.get_or_create(
            resource=resource,
            name="All week 09:00–22:00",
            defaults={
                "is_active": True,
                "timezone": "Africa/Johannesburg",
                "frequency": AvailabilityRule.Frequency.WEEKLY,
                "weekdays": WEEKDAYS_ALL,
                "effective_start_date": TODAY,
                "effective_end_date": RULE_END,
                "local_start_time": time(9, 0),
                "local_end_time": time(22, 0),
                "capacity": 1,
            },
        )
        status = "created" if created else "exists"
        self.stdout.write(f"  Artist resource [{status}]: Test Artist")
        return resource

    # -----------------------------------------------------------------------
    # Scenario seeding
    # -----------------------------------------------------------------------
    def _get_resource_for_scenario(self, scenario: dict) -> MarketplaceResource | None:
        username = scenario["resource_username"]
        try:
            return MarketplaceResource.objects.get(owner__username=username)
        except MarketplaceResource.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(
                    f"  ⚠  Resource for '{username}' not found — skipping scenario '{scenario['label']}'.\n"
                    "     Run 'python manage.py seed_marketplace' first."
                )
            )
            return None

    def _make_event(self, organizer: "User", name: str, delta_days: int) -> Event:
        event_date = TODAY + timedelta(days=delta_days)
        event, created = Event.objects.get_or_create(
            name=name,
            user=organizer,
            defaults={
                "organizer": organizer,
                "date": event_date,
                "start_time": timezone.now() + timedelta(days=delta_days, hours=18),
                "is_draft": False,
                "status": "published",
                "category": "Music",
                "notes": "Seeded for booking workflow QA.",
            },
        )
        return event

    def _seed_scenarios(self, organizer: "User", test_artist_resource: MarketplaceResource):
        now = timezone.now()

        for scenario in SCENARIOS:
            label = scenario["label"]

            resource = (
                test_artist_resource
                if scenario["resource_username"] == ARTIST_USERNAME
                else self._get_resource_for_scenario(scenario)
            )
            if resource is None:
                continue

            event = self._make_event(organizer, scenario["event_name"], scenario["start_delta_days"])

            start_at = now + timedelta(days=scenario["start_delta_days"], hours=18)
            end_at = start_at + timedelta(hours=scenario["duration_hours"])

            # ---- Create or update BookingRequest ----
            br, br_created = BookingRequest.objects.get_or_create(
                organizer=organizer,
                resource=resource,
                event=event,
                defaults={
                    "requested_start_at": start_at,
                    "requested_end_at": end_at,
                    "attendee_count": 200,
                    "message": scenario["request_message"],
                    "status": scenario["request_status"],
                    "provider_message": scenario.get("provider_message", ""),
                },
            )

            # Patch counter-proposal fields if needed
            if scenario["request_status"] == BookingRequest.Status.COUNTER_PROPOSED and br_created:
                counter_start = now + timedelta(days=scenario["counter_delta_days"], hours=18)
                counter_end = counter_start + timedelta(hours=scenario["counter_duration_hours"])
                br.counter_start_at = counter_start
                br.counter_end_at = counter_end
                br.counter_rate = scenario["counter_rate"]
                br.counter_message = scenario["counter_message"]
                br.save(update_fields=[
                    "counter_start_at", "counter_end_at",
                    "counter_rate", "counter_message",
                ])

            # ---- Create Booking for confirmed / completed scenarios ----
            booking = None
            if "booking_status" in scenario:
                booking, bk_created = Booking.objects.get_or_create(
                    source_request=br,
                    defaults={
                        "event": event,
                        "organizer": organizer,
                        "resource": resource,
                        "start_at": start_at,
                        "end_at": end_at,
                        "attendee_count": 200,
                        "status": scenario["booking_status"],
                        "source": Booking.Source.REQUEST,
                    },
                )

            # ---- Create Review for completed scenario ----
            if scenario.get("review_rating") and booking:
                Review.objects.get_or_create(
                    booking=booking,
                    defaults={
                        "reviewer": organizer,
                        "resource": resource,
                        "rating": scenario["review_rating"],
                        "comment": scenario["review_comment"],
                    },
                )

            # ---- Create Notifications ----
            self._seed_notifications(scenario, br, booking, organizer, resource)

            status = "created" if br_created else "exists"
            self.stdout.write(
                f"  Scenario [{label}] request [{status}]: "
                f"{scenario['event_name']} → {resource.display_name}"
            )

    # -----------------------------------------------------------------------
    # Notifications
    # -----------------------------------------------------------------------
    def _seed_notifications(
        self,
        scenario: dict,
        br: BookingRequest,
        booking: Booking | None,
        organizer: "User",
        resource: MarketplaceResource,
    ):
        provider = resource.owner
        label = scenario["label"]

        if label == "pending" or label == "live":
            # Notify provider of new request
            Notification.objects.get_or_create(
                recipient=provider,
                notification_type=Notification.NotificationType.BOOKING_REQUEST,
                link_type="booking",
                link_id=br.id,
                defaults={
                    "sender": organizer,
                    "title": "New booking request",
                    "message": f"{organizer.username} wants to book you.",
                },
            )

        elif label == "counter_proposed":
            # Notify organizer of counter-proposal
            Notification.objects.get_or_create(
                recipient=organizer,
                notification_type=Notification.NotificationType.COUNTER_PROPOSED,
                link_type="booking",
                link_id=br.id,
                defaults={
                    "sender": provider,
                    "title": "Counter-proposal received",
                    "message": (
                        f"{resource.display_name} has proposed different terms for your booking request."
                    ),
                },
            )

        elif label == "confirmed" and booking:
            # Notify organizer of confirmation
            Notification.objects.get_or_create(
                recipient=organizer,
                notification_type=Notification.NotificationType.BOOKING_CONFIRMED,
                link_type="confirmed_booking",
                link_id=booking.id,
                defaults={
                    "sender": provider,
                    "title": "Booking confirmed!",
                    "message": (
                        f"Your booking with {resource.display_name} has been confirmed."
                    ),
                },
            )

        elif label == "declined":
            # Notify organizer of rejection
            Notification.objects.get_or_create(
                recipient=organizer,
                notification_type=Notification.NotificationType.BOOKING_REJECTED,
                link_type="booking",
                link_id=br.id,
                defaults={
                    "sender": provider,
                    "title": "Booking request declined",
                    "message": (
                        f"{resource.display_name} declined your booking request."
                    ),
                },
            )
