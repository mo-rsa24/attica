from django.urls import path, include
from rest_framework.routers import DefaultRouter
from locations.views import VenueViewSet, PopularLocationsAPIView, LocationSearchView, ReverseGeocodeView

router = DefaultRouter()
router.register(r"locations", VenueViewSet, basename="locations")

urlpatterns = [
    path("popular/", PopularLocationsAPIView.as_view(), name="popular_locations"),
    path('search/', LocationSearchView.as_view(), name='location-search'),
    path('reverse/', ReverseGeocodeView.as_view(), name='reverse-geocode'),
    path("", include(router.urls)),
]
