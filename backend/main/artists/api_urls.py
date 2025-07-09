from django.urls import path, include
from rest_framework.routers import DefaultRouter
from artists.views import ArtistViewSet, PopularArtistsAPIView

router = DefaultRouter()
router.register(r"artists", ArtistViewSet, basename="artist")
urlpatterns = [
    path("", include(router.urls)),
    path("popular/", PopularArtistsAPIView.as_view(), name="popular_artists"),
]

