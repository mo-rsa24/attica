import tempfile
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from .models import EventDraft, Event, EventDraftAsset


User = get_user_model()


class EventDraftAPITests(APITestCase):
    def setUp(self):
        self.temp_media = tempfile.TemporaryDirectory()
        self.media_override = override_settings(MEDIA_ROOT=self.temp_media.name)
        self.media_override.enable()
        self.addCleanup(self.media_override.disable)
        self.addCleanup(self.temp_media.cleanup)
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

    def test_upload_asset_persists_on_draft(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="step8")
        self.client.force_authenticate(user=self.organizer)

        response = self.client.post(
            f"/api/events/event-drafts/{draft.id}/assets/",
            {
                "file": SimpleUploadedFile("poster.png", b"poster-bytes", content_type="image/png"),
                "asset_type": EventDraftAsset.AssetType.MEDIA,
                "current_step": "step8",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        draft.refresh_from_db()
        self.assertEqual(draft.current_step, "step8")
        self.assertEqual(draft.assets.count(), 1)
        asset = draft.assets.get()
        self.assertEqual(asset.asset_type, EventDraftAsset.AssetType.MEDIA)
        self.assertEqual(asset.mime_type, "image/png")
        self.assertEqual(response.data["assets"][0]["name"], "poster.png")

    def test_uploading_seating_chart_replaces_previous_file(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="step5")
        self.client.force_authenticate(user=self.organizer)

        first = self.client.post(
            f"/api/events/event-drafts/{draft.id}/assets/",
            {
                "file": SimpleUploadedFile("chart-a.pdf", b"%PDF-first", content_type="application/pdf"),
                "asset_type": EventDraftAsset.AssetType.SEATING_CHART,
                "current_step": "step5",
            },
            format="multipart",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            f"/api/events/event-drafts/{draft.id}/assets/",
            {
                "file": SimpleUploadedFile("chart-b.pdf", b"%PDF-second", content_type="application/pdf"),
                "asset_type": EventDraftAsset.AssetType.SEATING_CHART,
                "current_step": "step5",
            },
            format="multipart",
        )
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)

        draft.refresh_from_db()
        self.assertEqual(draft.assets.filter(asset_type=EventDraftAsset.AssetType.SEATING_CHART).count(), 1)
        self.assertEqual(draft.assets.get(asset_type=EventDraftAsset.AssetType.SEATING_CHART).name, "chart-b.pdf")

    def test_delete_asset_removes_the_asset_record(self):
        draft = EventDraft.objects.create(organizer=self.organizer, current_step="step8")
        asset = EventDraftAsset.objects.create(
            draft=draft,
            asset_type=EventDraftAsset.AssetType.MEDIA,
            name="poster.png",
            file=SimpleUploadedFile("poster.png", b"poster-bytes", content_type="image/png"),
            mime_type="image/png",
            size=12,
        )
        self.client.force_authenticate(user=self.organizer)

        response = self.client.delete(f"/api/events/event-drafts/{draft.id}/assets/{asset.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(draft.assets.filter(id=asset.id).exists())

    def test_publish_maps_uploaded_assets_to_the_event(self):
        draft = EventDraft.objects.create(
            organizer=self.organizer,
            current_step="step8",
            data={
                "steps": {
                    "step1": {
                        "name": "Launch Party",
                        "date": str(timezone.now().date()),
                        "guest_count": 120,
                        "category": "Music",
                    },
                    "step5": {
                        "base_price": "250.00",
                        "currency": "ZAR",
                        "refund_policy": "full",
                        "max_tickets_per_buyer": 6,
                        "is_seated": True,
                        "is_age_restricted": True,
                        "access_type": "private",
                    },
                }
            },
        )
        poster = EventDraftAsset.objects.create(
            draft=draft,
            asset_type=EventDraftAsset.AssetType.MEDIA,
            name="poster.png",
            file=SimpleUploadedFile("poster.png", b"poster-bytes", content_type="image/png"),
            mime_type="image/png",
            size=12,
        )
        EventDraftAsset.objects.create(
            draft=draft,
            asset_type=EventDraftAsset.AssetType.SEATING_CHART,
            name="chart.pdf",
            file=SimpleUploadedFile("chart.pdf", b"%PDF-chart", content_type="application/pdf"),
            mime_type="application/pdf",
            size=10,
        )
        self.client.force_authenticate(user=self.organizer)

        response = self.client.post(f"/api/events/event-drafts/{draft.id}/publish/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        published_event = Event.objects.get(id=response.data["published_event_id"])
        self.assertEqual(published_event.name, "Launch Party")
        self.assertEqual(published_event.status, "published")
        self.assertTrue(published_event.image_url.startswith("http://testserver/media/"))
        self.assertEqual(published_event.banner_image, published_event.image_url)
        self.assertEqual(published_event.seating_chart.name, draft.assets.get(asset_type=EventDraftAsset.AssetType.SEATING_CHART).file.name)
        self.assertEqual(str(published_event.base_price), "250.00")
        self.assertEqual(published_event.max_tickets_per_buyer, 6)
        self.assertTrue(published_event.is_seated)
        self.assertTrue(published_event.is_age_restricted)
        self.assertEqual(published_event.access_type, "private")
        self.assertIn(poster.file.name.split("/")[-1], published_event.image_url)

    def test_republish_updates_existing_event(self):
        existing_event = Event.objects.create(
            user=self.organizer,
            organizer=self.organizer,
            name="Original Name",
            date=timezone.now().date(),
            status="published",
            is_draft=False,
            image_url="https://example.com/original.png",
        )
        draft = EventDraft.objects.create(
            organizer=self.organizer,
            current_step="step8",
            status=EventDraft.Status.PUBLISHED,
            published_at=timezone.now(),
            data={
                "published_event_id": existing_event.id,
                "steps": {
                    "step1": {
                        "name": "Updated Name",
                        "date": str(timezone.now().date()),
                    },
                    "step5": {
                        "is_seated": False,
                    },
                },
            },
        )
        EventDraftAsset.objects.create(
            draft=draft,
            asset_type=EventDraftAsset.AssetType.MEDIA,
            name="fresh-poster.png",
            file=SimpleUploadedFile("fresh-poster.png", b"fresh-poster", content_type="image/png"),
            mime_type="image/png",
            size=12,
        )
        self.client.force_authenticate(user=self.organizer)

        response = self.client.post(f"/api/events/event-drafts/{draft.id}/publish/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        existing_event.refresh_from_db()
        self.assertEqual(existing_event.name, "Updated Name")
        self.assertTrue(existing_event.image_url.startswith("http://testserver/media/"))

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
