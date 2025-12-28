from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
# Create your tests here.

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
        self.assertEqual(draft.current_step, "details")
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