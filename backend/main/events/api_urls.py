from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet, SimilarEventsAPIView

router = DefaultRouter()
router.register(r"", EventViewSet, basename="events")

urlpatterns = [
    path("/similar/", SimilarEventsAPIView.as_view(), name="popular_events"),
    path("", include(router.urls)),
]
