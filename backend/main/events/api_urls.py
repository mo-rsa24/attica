from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet, SimilarEventsAPIView, EventDraftViewSet, MyEventsAPIView

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"event-drafts", EventDraftViewSet, basename="event-draft")

urlpatterns = [
    path("", include(router.urls)),
    path("upcoming/", EventViewSet.as_view({'get': 'upcoming'}), name="event-upcoming"),
    path("similar/", SimilarEventsAPIView.as_view(), name="popular_events"),
    path("my-events/", MyEventsAPIView.as_view(), name="my-events"),
]
