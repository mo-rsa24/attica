from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from .models import EventDraft, Event

from .models import EventDraft


User = get_user_model()


class EventDraftAPITests(APITestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(username="organizer", password="password")
        self.other_user = User.objects.create_user(username="intruder", password="password")

    def test_create_event_draft_sets_defaults(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.post("/api/events/event-drafts/", {"data": {"name": "My Event"}}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        draft = EventDraft.objects.get(pk=response.data["id"])
        self.assertEqual(draft.organizer, self.organizer)
        self.assertEqual(draft.status, EventDraft.Status.DRAFT)
        self.assertEqual(draft.current_step, "step1")
        self.assertEqual(draft.data["name"], "My Event")

    def test_mine_filter_returns_only_owned_drafts(self):
        EventDraft.objects.create(organizer=self.organizer, current_step="details")
        EventDraft.objects.create(organizer=self.other_user, current_step="details")

        self.client.force_authenticate(user=self.organizer)
        response = self.client.get("/api/events/event-drafts/?mine=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["organizer_id"], self.organizer.id)

    def test_partial_update_merges_data_and_updates_step(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="details", data={"a": 1})
        self.client.force_authenticate(user=self.organizer)

        response = self.client.patch(
            f"/api/events/event-drafts/{draft.id}/",
            {"data": {"b": 2}, "current_step": "tickets"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        draft.refresh_from_db()
        self.assertEqual(draft.data, {"a": 1, "b": 2})
        self.assertEqual(draft.current_step, "tickets")

    def test_publish_sets_status_and_timestamp(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="details")
        self.client.force_authenticate(user=self.organizer)

        response = self.client.post(f"/api/events/event-drafts/{draft.id}/publish/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        draft.refresh_from_db()
        self.assertEqual(draft.status, EventDraft.Status.PUBLISHED)
        self.assertIsNotNone(draft.published_at)
        self.assertLessEqual(draft.published_at, timezone.now())

    def test_cross_organizer_access_denied(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="details")
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(f"/api/events/event-drafts/{draft.id}/", {"current_step": "tickets"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.post(f"/api/events/event-drafts/{draft.id}/publish/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class MyEventsAPITests(APITestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(username="organizer", password="password")
        self.other_user = User.objects.create_user(username="intruder", password="password")
        self.published_event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Organizer Event",
            date=timezone.now().date(),
            status="published",
            is_draft=False,
        )
        self.other_event = Event.objects.create(
            user=self.other_user,
            organizer=self.other_user,
            name="Not Mine",
            date=timezone.now().date(),
            status="published",
            is_draft=False,
        )
        self.draft = EventDraft.objects.create(
            organizer=self.organizer,
            current_step="step3",
            data={"name": "Draft Event"},
        )
        self.foreign_draft = EventDraft.objects.create(
            organizer=self.other_user,
            current_step="step1",
            data={"name": "Other Draft"},
        )

    def test_authentication_required(self):
        response = self.client.get("/api/events/my-events/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_only_my_events(self):
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get("/api/events/my-events/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("drafts", response.data)
        self.assertIn("published", response.data)

        draft_ids = {item["id"] for item in response.data["drafts"]}
        event_ids = {item["id"] for item in response.data["published"]}

        self.assertIn(self.draft.id, draft_ids)
        self.assertNotIn(self.foreign_draft.id, draft_ids)

        self.assertIn(self.published_event.id, event_ids)
        self.assertNotIn(self.other_event.id, event_ids)

        first_published = response.data["published"][0]
        self.assertEqual(first_published["record_type"], "event")
        self.assertEqual(first_published["lifecycle_state"], "published")