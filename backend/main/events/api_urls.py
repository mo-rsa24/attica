from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet, SimilarEventsAPIView

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),
    path("upcoming/", EventViewSet.as_view({'get': 'upcoming'}), name="event-upcoming"),
    path("similar/", SimilarEventsAPIView.as_view(), name="popular_events"),
]
