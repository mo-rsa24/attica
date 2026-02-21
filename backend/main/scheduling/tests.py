import hashlib
import hmac
from datetime import date, datetime, time, timedelta, timezone as datetime_timezone
from urllib import error as urllib_error
from unittest.mock import patch

from django.core.cache import cache
from django.db import IntegrityError
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from events.models import Event
from notifications.models import Notification

from .models import (
    AvailabilityRule,
    AvailabilitySlot,
    BookingConflictIncident,
    Booking,
    BookingRequest,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    WebhookTarget,
)
from .services import dispatch_outbox_events, materialize_availability_slots, search_availability


class _DummyUrlOpenResponse:
    def __init__(self, status=200):
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class SchedulingWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organizer = self._make_user("organizer_user", "organizer")
        self.organizer_two = self._make_user("organizer_two", "organizer")
        self.provider = self._make_user("provider_user", "vendor")

        self.event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Wedding Expo",
            date=timezone.now().date() + timedelta(days=45),
        )
        self.event_two = Event.objects.create(
            user=self.organizer_two,
            organizer=self.organizer_two,
            name="Private Gala",
            date=timezone.now().date() + timedelta(days=46),
        )

        self.resource = MarketplaceResource.objects.create(
            owner=self.provider,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Premier Catering",
            timezone="UTC",
            city="Johannesburg",
            is_active=True,
        )

    @staticmethod
    def _make_user(username, user_type):
        from users.models import CustomUser

        return CustomUser.objects.create_user(
            username=username,
            password="test-pass-123",
            user_type=user_type,
            email=f"{username}@example.com",
        )

    def _time_window(self):
        start_at = timezone.now() + timedelta(days=14)
        end_at = start_at + timedelta(hours=4)
        return start_at, end_at

    def test_instant_booking_is_idempotent(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at, end_at = self._time_window()
        payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }

        self.client.force_authenticate(self.organizer)
        response_one = self.client.post(
            "/api/scheduling/bookings/create/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="idem-booking-1",
        )
        self.assertEqual(response_one.status_code, 201)

        response_two = self.client.post(
            "/api/scheduling/bookings/create/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="idem-booking-1",
        )
        self.assertEqual(response_two.status_code, 200)
        self.assertEqual(response_one.data["id"], response_two.data["id"])
        self.assertEqual(Booking.objects.count(), 1)

    def test_request_approval_creates_booking(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at, end_at = self._time_window()
        request_payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 2,
            "message": "Need premium package",
        }

        self.client.force_authenticate(self.organizer)
        create_response = self.client.post(
            "/api/scheduling/requests/create/",
            request_payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="idem-request-1",
        )
        self.assertEqual(create_response.status_code, 201)
        request_id = create_response.data["id"]

        self.client.force_authenticate(self.provider)
        approve_response = self.client.post(
            f"/api/scheduling/requests/{request_id}/approve/",
            {"provider_message": "Approved"},
            format="json",
        )
        self.assertEqual(approve_response.status_code, 200)
        self.assertEqual(approve_response.data["request"]["status"], BookingRequest.Status.APPROVED)
        self.assertEqual(approve_response.data["booking"]["status"], Booking.Status.CONFIRMED)
        self.assertEqual(Booking.objects.count(), 1)

    def test_double_booking_same_resource_is_rejected(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at, end_at = self._time_window()
        booking_payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }

        self.client.force_authenticate(self.organizer)
        first_response = self.client.post("/api/scheduling/bookings/create/", booking_payload, format="json")
        self.assertEqual(first_response.status_code, 201)

        self.client.force_authenticate(self.organizer_two)
        conflict_payload = {
            "event_id": self.event_two.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }
        conflict_response = self.client.post("/api/scheduling/bookings/create/", conflict_payload, format="json")
        self.assertEqual(conflict_response.status_code, 409)
        self.assertIn("already booked", str(conflict_response.data["detail"]).lower())

    def test_cancellation_window_blocks_non_admin_cancel(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
            cancellation_window_hours=24,
        )

        start_at = timezone.now() + timedelta(hours=2)
        end_at = start_at + timedelta(hours=3)
        booking_payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }

        self.client.force_authenticate(self.organizer)
        create_response = self.client.post("/api/scheduling/bookings/create/", booking_payload, format="json")
        self.assertEqual(create_response.status_code, 201)
        booking_id = create_response.data["id"]

        cancel_response = self.client.post(
            f"/api/scheduling/bookings/{booking_id}/cancel/",
            {"reason": "Need to cancel"},
            format="json",
        )
        self.assertEqual(cancel_response.status_code, 400)
        self.assertIn("cancellation window has passed", str(cancel_response.data["detail"]).lower())

        booking = Booking.objects.get(id=booking_id)
        self.assertEqual(booking.status, Booking.Status.CONFIRMED)

    def test_reschedule_rejects_overlapping_booking(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
            allow_reschedule=True,
        )

        first_start = timezone.now() + timedelta(days=14)
        first_end = first_start + timedelta(hours=4)
        second_start = first_end + timedelta(hours=1)
        second_end = second_start + timedelta(hours=4)

        self.client.force_authenticate(self.organizer)
        first_create = self.client.post(
            "/api/scheduling/bookings/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource.id,
                "start_at": first_start.isoformat(),
                "end_at": first_end.isoformat(),
                "attendee_count": 1,
            },
            format="json",
        )
        self.assertEqual(first_create.status_code, 201)

        self.client.force_authenticate(self.organizer_two)
        second_create = self.client.post(
            "/api/scheduling/bookings/create/",
            {
                "event_id": self.event_two.id,
                "resource_id": self.resource.id,
                "start_at": second_start.isoformat(),
                "end_at": second_end.isoformat(),
                "attendee_count": 1,
            },
            format="json",
        )
        self.assertEqual(second_create.status_code, 201)
        second_booking_id = second_create.data["id"]

        conflict_reschedule = self.client.post(
            f"/api/scheduling/bookings/{second_booking_id}/reschedule/",
            {
                "new_start_at": (first_start + timedelta(hours=1)).isoformat(),
                "new_end_at": (first_end + timedelta(hours=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(conflict_reschedule.status_code, 409)
        self.assertIn("conflicting booking", str(conflict_reschedule.data["detail"]).lower())

        second_booking = Booking.objects.get(id=second_booking_id)
        self.assertEqual(second_booking.start_at, second_start)
        self.assertEqual(second_booking.end_at, second_end)

    def test_db_integrity_conflict_returns_http_409(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at, end_at = self._time_window()
        payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }

        self.client.force_authenticate(self.organizer)
        with patch("scheduling.services.Booking.objects.create", side_effect=IntegrityError("overlap")):
            response = self.client.post("/api/scheduling/bookings/create/", payload, format="json")
        self.assertEqual(response.status_code, 409)
        self.assertIn("conflicting booking", str(response.data["detail"]).lower())


class SchedulingTimezoneEdgeCaseTests(TestCase):
    def setUp(self):
        self.provider = self._make_user("tz_provider", "vendor")
        self.resource = MarketplaceResource.objects.create(
            owner=self.provider,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Timezone Band",
            timezone="UTC",
            city="Global City",
            is_active=True,
        )

    @staticmethod
    def _make_user(username, user_type):
        from users.models import CustomUser

        return CustomUser.objects.create_user(
            username=username,
            password="test-pass-123",
            user_type=user_type,
            email=f"{username}@example.com",
        )

    def test_nonexistent_local_time_rule_is_skipped(self):
        rule = AvailabilityRule.objects.create(
            resource=self.resource,
            name="Spring DST gap",
            timezone="America/New_York",
            frequency=AvailabilityRule.Frequency.DAILY,
            effective_start_date=date(2026, 3, 8),
            effective_end_date=date(2026, 3, 8),
            local_start_time=time(2, 30),
            local_end_time=time(3, 30),
            capacity=5,
        )

        materialized = materialize_availability_slots(
            start_date=date(2026, 3, 8),
            end_date=date(2026, 3, 8),
            resource_id=self.resource.id,
        )
        self.assertEqual(materialized["rules_processed"], 1)
        self.assertEqual(materialized["slots_created"], 0)
        self.assertEqual(materialized["skipped_nonexistent"], 1)
        self.assertFalse(AvailabilitySlot.objects.filter(source_rule=rule).exists())

        results = search_availability(
            start_at=datetime(2026, 3, 8, 6, 0, tzinfo=datetime_timezone.utc),
            end_at=datetime(2026, 3, 8, 9, 0, tzinfo=datetime_timezone.utc),
            resource_type=MarketplaceResource.ResourceType.VENDOR,
        )
        self.assertEqual(results, [])

    def test_ambiguous_local_time_uses_earlier_fold(self):
        AvailabilityRule.objects.create(
            resource=self.resource,
            name="Fall DST overlap",
            timezone="America/New_York",
            frequency=AvailabilityRule.Frequency.DAILY,
            effective_start_date=date(2026, 11, 1),
            effective_end_date=date(2026, 11, 1),
            local_start_time=time(1, 30),
            local_end_time=time(2, 30),
            capacity=2,
        )

        results = search_availability(
            start_at=datetime(2026, 11, 1, 5, 0, tzinfo=datetime_timezone.utc),
            end_at=datetime(2026, 11, 1, 8, 0, tzinfo=datetime_timezone.utc),
            resource_type=MarketplaceResource.ResourceType.VENDOR,
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(len(results[0]["windows"]), 1)

        window = results[0]["windows"][0]
        self.assertEqual(window["start_at"], datetime(2026, 11, 1, 5, 30, tzinfo=datetime_timezone.utc))
        self.assertEqual(window["end_at"], datetime(2026, 11, 1, 7, 30, tzinfo=datetime_timezone.utc))

    def test_cross_timezone_search_window_alignment(self):
        AvailabilityRule.objects.create(
            resource=self.resource,
            name="Johannesburg prime slot",
            timezone="Africa/Johannesburg",
            frequency=AvailabilityRule.Frequency.DAILY,
            effective_start_date=date(2026, 6, 1),
            effective_end_date=date(2026, 6, 1),
            local_start_time=time(10, 0),
            local_end_time=time(12, 0),
            capacity=3,
        )

        results = search_availability(
            start_at=datetime(2026, 6, 1, 7, 0, tzinfo=datetime_timezone.utc),
            end_at=datetime(2026, 6, 1, 11, 0, tzinfo=datetime_timezone.utc),
            resource_type=MarketplaceResource.ResourceType.VENDOR,
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(len(results[0]["windows"]), 1)

        window = results[0]["windows"][0]
        self.assertEqual(window["start_at"], datetime(2026, 6, 1, 8, 0, tzinfo=datetime_timezone.utc))
        self.assertEqual(window["end_at"], datetime(2026, 6, 1, 10, 0, tzinfo=datetime_timezone.utc))


class SchedulingOutboxWorkerTests(TestCase):
    def setUp(self):
        cache.clear()
        self.organizer = self._make_user("outbox_organizer", "organizer")
        self.provider = self._make_user("outbox_provider", "vendor")
        self.event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Outbox Event",
            date=timezone.now().date() + timedelta(days=30),
        )
        self.resource = MarketplaceResource.objects.create(
            owner=self.provider,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Outbox Vendor",
            timezone="UTC",
            city="Johannesburg",
            is_active=True,
        )

    @staticmethod
    def _make_user(username, user_type, *, is_staff=False):
        from users.models import CustomUser

        return CustomUser.objects.create_user(
            username=username,
            password="test-pass-123",
            user_type=user_type,
            email=f"{username}@example.com",
            is_staff=is_staff,
        )

    def test_dispatch_creates_notification_for_request_created(self):
        booking_request = BookingRequest.objects.create(
            event=self.event,
            organizer=self.organizer,
            resource=self.resource,
            requested_start_at=timezone.now() + timedelta(days=10),
            requested_end_at=timezone.now() + timedelta(days=10, hours=2),
            attendee_count=1,
            status=BookingRequest.Status.PENDING,
        )
        outbox_event = OutboxEvent.objects.create(
            event_type="request.created",
            aggregate_type="booking_request",
            aggregate_id=str(booking_request.id),
            payload={"request_id": booking_request.id},
        )

        result = dispatch_outbox_events(limit=10)
        self.assertEqual(result["processed"], 1)
        self.assertEqual(result["failed"], 0)
        self.assertEqual(result["dead_lettered"], 0)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.status, OutboxEvent.Status.SENT)
        self.assertEqual(outbox_event.attempts, 1)

        notification = Notification.objects.get(recipient=self.provider)
        self.assertEqual(notification.notification_type, Notification.NotificationType.BOOKING_REQUEST)
        self.assertEqual(notification.link_id, booking_request.id)

    @override_settings(
        SCHEDULING_OUTBOX_MAX_ATTEMPTS=2,
        SCHEDULING_OUTBOX_RETRY_BASE_SECONDS=1,
        SCHEDULING_OUTBOX_RETRY_MAX_SECONDS=2,
    )
    def test_dispatch_retries_and_dead_letters_after_max_attempts(self):
        outbox_event = OutboxEvent.objects.create(
            event_type="booking.confirmed",
            aggregate_type="booking",
            aggregate_id="9999",
            payload={"booking_id": 9999},
        )

        with patch("scheduling.services._dispatch_webhooks_for_event", side_effect=RuntimeError("webhook down")):
            first = dispatch_outbox_events(limit=10)
        self.assertEqual(first["processed"], 0)
        self.assertEqual(first["failed"], 1)
        self.assertEqual(first["dead_lettered"], 0)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.status, OutboxEvent.Status.FAILED)
        self.assertEqual(outbox_event.attempts, 1)

        outbox_event.next_attempt_at = timezone.now() - timedelta(seconds=1)
        outbox_event.save(update_fields=["next_attempt_at"])

        with patch("scheduling.services._dispatch_webhooks_for_event", side_effect=RuntimeError("webhook down")):
            second = dispatch_outbox_events(limit=10)
        self.assertEqual(second["processed"], 0)
        self.assertEqual(second["failed"], 0)
        self.assertEqual(second["dead_lettered"], 1)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.status, OutboxEvent.Status.DEAD_LETTER)
        self.assertEqual(outbox_event.attempts, 2)

        dead_letter = OutboxDeadLetter.objects.get(outbox_event=outbox_event)
        self.assertEqual(dead_letter.event_type, outbox_event.event_type)
        self.assertIn("webhook down", dead_letter.error_message)

    @override_settings(
        SCHEDULING_WEBHOOK_URLS=["https://hooks.example/signing"],
        SCHEDULING_WEBHOOK_SECRET="test-secret",
        SCHEDULING_WEBHOOK_TIMEOUT_SECONDS=7,
    )
    def test_webhook_dispatch_adds_signature_and_idempotency_headers(self):
        outbox_event = OutboxEvent.objects.create(
            event_type="booking.confirmed",
            aggregate_type="booking",
            aggregate_id="777",
            payload={"booking_id": 777},
        )

        captured = {}

        def fake_urlopen(request_obj, timeout):
            captured["request"] = request_obj
            captured["timeout"] = timeout
            return _DummyUrlOpenResponse(status=200)

        with patch("scheduling.services.urllib_request.urlopen", side_effect=fake_urlopen):
            result = dispatch_outbox_events(
                limit=10,
                consume_notifications=False,
                consume_webhooks=True,
            )

        self.assertEqual(result["processed"], 1)
        self.assertEqual(captured["timeout"], 7)

        request_obj = captured["request"]
        body = request_obj.data.decode("utf-8")
        headers = {key.lower(): value for key, value in request_obj.header_items()}

        self.assertEqual(headers["x-scheduling-delivery-id"], str(outbox_event.id))
        self.assertEqual(headers["idempotency-key"], f"scheduling-outbox-{outbox_event.id}")
        self.assertIn("x-scheduling-signature", headers)

        timestamp = headers["x-scheduling-timestamp"]
        expected_signature = hmac.new(
            b"test-secret",
            f"{timestamp}.{body}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        self.assertEqual(headers["x-scheduling-signature"], f"v1={expected_signature}")

    @override_settings(
        SCHEDULING_WEBHOOK_URLS=["https://hooks.example/circuit"],
        SCHEDULING_WEBHOOK_CIRCUIT_FAILURE_THRESHOLD=2,
        SCHEDULING_WEBHOOK_CIRCUIT_OPEN_SECONDS=60,
        SCHEDULING_OUTBOX_MAX_ATTEMPTS=5,
        SCHEDULING_OUTBOX_RETRY_BASE_SECONDS=1,
        SCHEDULING_OUTBOX_RETRY_MAX_SECONDS=5,
    )
    def test_webhook_circuit_breaker_skips_without_consuming_attempt(self):
        outbox_event = OutboxEvent.objects.create(
            event_type="booking.confirmed",
            aggregate_type="booking",
            aggregate_id="888",
            payload={"booking_id": 888},
        )

        with patch("scheduling.services.urllib_request.urlopen", side_effect=urllib_error.URLError("network down")):
            first = dispatch_outbox_events(limit=10, consume_notifications=False, consume_webhooks=True)
        self.assertEqual(first["processed"], 0)
        self.assertEqual(first["failed"], 1)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.status, OutboxEvent.Status.FAILED)
        self.assertEqual(outbox_event.attempts, 1)

        outbox_event.next_attempt_at = timezone.now() - timedelta(seconds=1)
        outbox_event.save(update_fields=["next_attempt_at"])
        with patch("scheduling.services.urllib_request.urlopen", side_effect=urllib_error.URLError("network down")):
            second = dispatch_outbox_events(limit=10, consume_notifications=False, consume_webhooks=True)
        self.assertEqual(second["processed"], 0)
        self.assertEqual(second["failed"], 1)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.attempts, 2)
        self.assertIn("circuit opened", outbox_event.last_error.lower())

        outbox_event.next_attempt_at = timezone.now() - timedelta(seconds=1)
        outbox_event.save(update_fields=["next_attempt_at"])
        with patch(
            "scheduling.services.urllib_request.urlopen",
            side_effect=AssertionError("urlopen should not be called while circuit is open"),
        ):
            third = dispatch_outbox_events(limit=10, consume_notifications=False, consume_webhooks=True)

        self.assertEqual(third["processed"], 0)
        self.assertEqual(third["failed"], 1)
        self.assertEqual(third["dead_lettered"], 0)

        outbox_event.refresh_from_db()
        self.assertEqual(outbox_event.status, OutboxEvent.Status.FAILED)
        self.assertEqual(outbox_event.attempts, 2)
        self.assertIn("circuit is open", outbox_event.last_error.lower())


class SchedulingPermissionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.organizer = self._make_user("perm_organizer", "organizer")
        self.organizer_two = self._make_user("perm_organizer_two", "organizer")
        self.provider = self._make_user("perm_provider", "vendor")
        self.provider_two = self._make_user("perm_provider_two", "vendor")
        self.admin = self._make_user("perm_admin", "organizer", is_staff=True)

        self.event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Permission Event",
            date=timezone.now().date() + timedelta(days=40),
        )
        self.event_two = Event.objects.create(
            user=self.organizer_two,
            organizer=self.organizer_two,
            name="Permission Event Two",
            date=timezone.now().date() + timedelta(days=41),
        )

        self.resource = MarketplaceResource.objects.create(
            owner=self.provider,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Owner Resource",
            timezone="UTC",
            city="Johannesburg",
            is_active=True,
        )
        self.resource_two = MarketplaceResource.objects.create(
            owner=self.provider_two,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Other Resource",
            timezone="UTC",
            city="Cape Town",
            is_active=True,
        )

    @staticmethod
    def _make_user(username, user_type, *, is_staff=False):
        from users.models import CustomUser

        return CustomUser.objects.create_user(
            username=username,
            password="test-pass-123",
            user_type=user_type,
            email=f"{username}@example.com",
            is_staff=is_staff,
        )

    def _auth(self, user):
        self.client.force_authenticate(user)

    def test_event_ownership_required_for_booking_and_request_creation(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at = timezone.now() + timedelta(days=14)
        end_at = start_at + timedelta(hours=2)
        payload = {
            "event_id": self.event.id,
            "resource_id": self.resource.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "attendee_count": 1,
        }

        self._auth(self.organizer_two)
        forbidden_booking = self.client.post("/api/scheduling/bookings/create/", payload, format="json")
        self.assertEqual(forbidden_booking.status_code, 403)

        self._auth(self.provider)
        forbidden_request = self.client.post("/api/scheduling/requests/create/", payload, format="json")
        self.assertEqual(forbidden_request.status_code, 403)

        self._auth(self.organizer)
        allowed_booking = self.client.post("/api/scheduling/bookings/create/", payload, format="json")
        self.assertEqual(allowed_booking.status_code, 201)

    def test_provider_ownership_required_for_approve_and_availability_writes(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        start_at = timezone.now() + timedelta(days=12)
        end_at = start_at + timedelta(hours=3)

        self._auth(self.organizer)
        request_response = self.client.post(
            "/api/scheduling/requests/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource.id,
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
                "attendee_count": 2,
                "message": "Please approve",
            },
            format="json",
        )
        self.assertEqual(request_response.status_code, 201)
        request_id = request_response.data["id"]

        self._auth(self.provider_two)
        forbidden_approve = self.client.post(f"/api/scheduling/requests/{request_id}/approve/", {}, format="json")
        self.assertEqual(forbidden_approve.status_code, 403)
        forbidden_decline = self.client.post(f"/api/scheduling/requests/{request_id}/decline/", {}, format="json")
        self.assertEqual(forbidden_decline.status_code, 403)

        forbidden_rule = self.client.post(
            "/api/scheduling/availability-rules/",
            {
                "resource": self.resource.id,
                "name": "Bad write",
                "is_active": True,
                "timezone": "UTC",
                "frequency": "daily",
                "weekdays": [],
                "effective_start_date": (timezone.now().date() + timedelta(days=1)).isoformat(),
                "local_start_time": "10:00:00",
                "local_end_time": "12:00:00",
                "capacity": 1,
            },
            format="json",
        )
        self.assertEqual(forbidden_rule.status_code, 403)

        self._auth(self.provider)
        approve = self.client.post(f"/api/scheduling/requests/{request_id}/approve/", {}, format="json")
        self.assertEqual(approve.status_code, 200)

        self._auth(self.organizer)
        request_two_response = self.client.post(
            "/api/scheduling/requests/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource.id,
                "start_at": (start_at + timedelta(days=1)).isoformat(),
                "end_at": (end_at + timedelta(days=1)).isoformat(),
                "attendee_count": 2,
                "message": "Second request",
            },
            format="json",
        )
        self.assertEqual(request_two_response.status_code, 201)
        request_two_id = request_two_response.data["id"]

        self._auth(self.provider)
        decline = self.client.post(f"/api/scheduling/requests/{request_two_id}/decline/", {}, format="json")
        self.assertEqual(decline.status_code, 200)

        allowed_rule = self.client.post(
            "/api/scheduling/availability-rules/",
            {
                "resource": self.resource.id,
                "name": "Owner write",
                "is_active": True,
                "timezone": "UTC",
                "frequency": "daily",
                "weekdays": [],
                "effective_start_date": (timezone.now().date() + timedelta(days=1)).isoformat(),
                "local_start_time": "10:00:00",
                "local_end_time": "12:00:00",
                "capacity": 1,
            },
            format="json",
        )
        self.assertEqual(allowed_rule.status_code, 201)

    def test_calendar_scope_permissions(self):
        start_at = timezone.now() - timedelta(days=1)
        end_at = timezone.now() + timedelta(days=30)

        self._auth(self.organizer)
        organizer_admin_scope = self.client.get(
            "/api/scheduling/calendar/",
            {"scope": "admin", "start_at": start_at.isoformat(), "end_at": end_at.isoformat()},
        )
        self.assertEqual(organizer_admin_scope.status_code, 403)

        self._auth(self.provider_two)
        provider_wrong_resource_scope = self.client.get(
            "/api/scheduling/calendar/",
            {
                "scope": "resource",
                "resource_id": self.resource.id,
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
            },
        )
        self.assertEqual(provider_wrong_resource_scope.status_code, 403)

        self._auth(self.admin)
        admin_scope = self.client.get(
            "/api/scheduling/calendar/",
            {"scope": "admin", "start_at": start_at.isoformat(), "end_at": end_at.isoformat()},
        )
        self.assertEqual(admin_scope.status_code, 200)

    def test_cancel_and_reschedule_permissions(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
            cancellation_window_hours=1,
            allow_reschedule=True,
        )

        start_at = timezone.now() + timedelta(days=8)
        end_at = start_at + timedelta(hours=2)
        self._auth(self.organizer)
        create = self.client.post(
            "/api/scheduling/bookings/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource.id,
                "start_at": start_at.isoformat(),
                "end_at": end_at.isoformat(),
                "attendee_count": 1,
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        booking_id = create.data["id"]

        self._auth(self.organizer_two)
        forbidden_cancel = self.client.post(
            f"/api/scheduling/bookings/{booking_id}/cancel/",
            {"reason": "Not mine"},
            format="json",
        )
        self.assertEqual(forbidden_cancel.status_code, 403)

        self._auth(self.provider_two)
        forbidden_reschedule = self.client.post(
            f"/api/scheduling/bookings/{booking_id}/reschedule/",
            {
                "new_start_at": (start_at + timedelta(days=1)).isoformat(),
                "new_end_at": (end_at + timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(forbidden_reschedule.status_code, 403)

        self._auth(self.provider)
        allowed_reschedule = self.client.post(
            f"/api/scheduling/bookings/{booking_id}/reschedule/",
            {
                "new_start_at": (start_at + timedelta(days=1)).isoformat(),
                "new_end_at": (end_at + timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(allowed_reschedule.status_code, 200)

    def test_list_scopes_for_requests_and_bookings(self):
        ResourcePolicy.objects.create(
            resource=self.resource,
            booking_mode=ResourcePolicy.BookingMode.APPROVAL_REQUIRED,
            min_notice_hours=0,
            max_horizon_days=365,
        )
        ResourcePolicy.objects.create(
            resource=self.resource_two,
            booking_mode=ResourcePolicy.BookingMode.INSTANT,
            min_notice_hours=0,
            max_horizon_days=365,
        )

        request_start = timezone.now() + timedelta(days=9)
        request_end = request_start + timedelta(hours=2)

        self._auth(self.organizer)
        request_response = self.client.post(
            "/api/scheduling/requests/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource.id,
                "start_at": request_start.isoformat(),
                "end_at": request_end.isoformat(),
                "attendee_count": 1,
            },
            format="json",
        )
        self.assertEqual(request_response.status_code, 201)

        booking_response = self.client.post(
            "/api/scheduling/bookings/create/",
            {
                "event_id": self.event.id,
                "resource_id": self.resource_two.id,
                "start_at": (request_start + timedelta(days=1)).isoformat(),
                "end_at": (request_end + timedelta(days=1)).isoformat(),
                "attendee_count": 1,
            },
            format="json",
        )
        self.assertEqual(booking_response.status_code, 201)

        self._auth(self.provider)
        provider_requests = self.client.get("/api/scheduling/requests/", {"role": "provider"})
        self.assertEqual(provider_requests.status_code, 200)
        self.assertEqual(len(provider_requests.data), 1)

        self._auth(self.provider_two)
        provider_two_requests = self.client.get("/api/scheduling/requests/", {"role": "provider"})
        self.assertEqual(provider_two_requests.status_code, 200)
        self.assertEqual(len(provider_two_requests.data), 0)

        provider_two_bookings = self.client.get("/api/scheduling/bookings/", {"role": "provider"})
        self.assertEqual(provider_two_bookings.status_code, 200)
        self.assertEqual(len(provider_two_bookings.data), 1)

        self._auth(self.organizer_two)
        organizer_two_requests = self.client.get("/api/scheduling/requests/", {"role": "organizer"})
        self.assertEqual(organizer_two_requests.status_code, 200)
        self.assertEqual(len(organizer_two_requests.data), 0)

    def test_availability_search_requires_authentication(self):
        start_at = timezone.now() + timedelta(days=3)
        end_at = start_at + timedelta(hours=2)

        self.client.force_authenticate(None)
        unauthenticated = self.client.get(
            "/api/scheduling/availability/search/",
            {"start_at": start_at.isoformat(), "end_at": end_at.isoformat()},
        )
        self.assertEqual(unauthenticated.status_code, 401)

        self._auth(self.organizer)
        authenticated = self.client.get(
            "/api/scheduling/availability/search/",
            {"start_at": start_at.isoformat(), "end_at": end_at.isoformat()},
        )
        self.assertEqual(authenticated.status_code, 200)


class SchedulingAdminOpsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = self._make_user("ops_admin", "organizer", is_staff=True)
        self.organizer = self._make_user("ops_organizer", "organizer")
        self.provider = self._make_user("ops_provider", "vendor")
        self.resource = MarketplaceResource.objects.create(
            owner=self.provider,
            resource_type=MarketplaceResource.ResourceType.VENDOR,
            display_name="Ops Resource",
            timezone="UTC",
            city="Johannesburg",
            is_active=True,
        )
        self.event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Ops Event",
            date=timezone.now().date() + timedelta(days=12),
        )

    @staticmethod
    def _make_user(username, user_type, *, is_staff=False):
        from users.models import CustomUser

        return CustomUser.objects.create_user(
            username=username,
            password="test-pass-123",
            user_type=user_type,
            email=f"{username}@example.com",
            is_staff=is_staff,
        )

    def test_webhook_target_crud_requires_admin(self):
        self.client.force_authenticate(self.organizer)
        forbidden = self.client.get("/api/scheduling/webhook-targets/")
        self.assertEqual(forbidden.status_code, 403)

        self.client.force_authenticate(self.admin)
        created = self.client.post(
            "/api/scheduling/webhook-targets/",
            {
                "url": "https://hooks.example/ops",
                "description": "Ops hook",
                "secret": "super-secret",
                "timeout_seconds": 6,
                "failure_threshold": 3,
                "open_seconds": 45,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertNotIn("secret", created.data)
        self.assertTrue(created.data["has_secret"])

        target_id = created.data["id"]
        updated = self.client.patch(
            f"/api/scheduling/webhook-targets/{target_id}/",
            {"clear_secret": True, "is_active": False},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertFalse(updated.data["has_secret"])
        self.assertFalse(updated.data["is_active"])

    def test_dead_letter_replay_requires_admin(self):
        dead_letter = OutboxDeadLetter.objects.create(
            event_type="booking.confirmed",
            aggregate_type="booking",
            aggregate_id="77",
            payload={"booking_id": 77},
            attempts=5,
            error_message="Permanent webhook failure",
        )

        self.client.force_authenticate(self.organizer)
        forbidden = self.client.post(f"/api/scheduling/ops/dead-letters/{dead_letter.id}/replay/", {}, format="json")
        self.assertEqual(forbidden.status_code, 403)

        self.client.force_authenticate(self.admin)
        replay = self.client.post(f"/api/scheduling/ops/dead-letters/{dead_letter.id}/replay/", {}, format="json")
        self.assertEqual(replay.status_code, 201)

        replayed_event = OutboxEvent.objects.get(id=replay.data["replayed_outbox_event_id"])
        self.assertEqual(replayed_event.status, OutboxEvent.Status.PENDING)
        self.assertEqual(replayed_event.event_type, dead_letter.event_type)

        dead_letter.refresh_from_db()
        self.assertEqual(dead_letter.metadata.get("replay_count"), 1)
        self.assertEqual(dead_letter.metadata.get("last_replayed_outbox_event_id"), replayed_event.id)

    def test_ops_summary_includes_outbox_constraints_and_conflicts(self):
        WebhookTarget.objects.create(
            url="https://hooks.example/ops-summary",
            description="Summary Hook",
            is_active=True,
            secret="ops-secret",
            timeout_seconds=5,
            failure_threshold=2,
            open_seconds=30,
            created_by=self.admin,
            updated_by=self.admin,
        )
        OutboxEvent.objects.create(
            event_type="request.created",
            aggregate_type="booking_request",
            aggregate_id="1",
            payload={"request_id": 1},
            status=OutboxEvent.Status.PENDING,
        )
        OutboxDeadLetter.objects.create(
            event_type="booking.cancelled",
            aggregate_type="booking",
            aggregate_id="9",
            payload={"booking_id": 9},
            attempts=5,
            error_message="dlq",
        )
        BookingConflictIncident.objects.create(
            operation=BookingConflictIncident.Operation.CREATE,
            conflict_source=BookingConflictIncident.ConflictSource.APPLICATION_CHECK,
            resource=self.resource,
            event=self.event,
            organizer=self.organizer,
            requested_start_at=timezone.now() + timedelta(days=1),
            requested_end_at=timezone.now() + timedelta(days=1, hours=2),
            message="Conflict sample",
        )

        self.client.force_authenticate(self.organizer)
        forbidden = self.client.get("/api/scheduling/ops/summary/")
        self.assertEqual(forbidden.status_code, 403)

        self.client.force_authenticate(self.admin)
        summary = self.client.get("/api/scheduling/ops/summary/")
        self.assertEqual(summary.status_code, 200)
        self.assertIn("outbox_counts", summary.data)
        self.assertIn("constraints", summary.data)
        self.assertIn("webhooks", summary.data)
        self.assertIn("recent_conflict_incidents", summary.data)
        self.assertGreaterEqual(summary.data.get("dead_letter_count", 0), 1)
