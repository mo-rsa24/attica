from django.urls import path, include
from rest_framework.routers import DefaultRouter
from locations.views import VenueViewSet, PopularLocationsAPIView

router = DefaultRouter()
router.register(r"locations", VenueViewSet, basename="locations")

urlpatterns = [
    path("locations/popular/", PopularLocationsAPIView.as_view(), name="popular_locations"),
    path("", include(router.urls)),
]
