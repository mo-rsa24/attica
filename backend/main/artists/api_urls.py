from django.urls import path, include
from rest_framework_nested import routers
from rest_framework.routers import DefaultRouter
from artists.views import ArtistViewSet, PopularArtistsAPIView, ArtistPostViewSet, GenreListView

router = DefaultRouter()
router.register(r"artists", ArtistViewSet, basename="artist")
artists_router = routers.NestedSimpleRouter(router, r'artists', lookup='artist')
artists_router.register(r'posts', ArtistPostViewSet, basename='artist-posts')

urlpatterns = [
    path("", include(router.urls)),
    path('genres/', GenreListView.as_view(), name='artist-genres'),
    path("", include(artists_router.urls)),  # <-- Add the nested router URLs
    path("popular/", PopularArtistsAPIView.as_view(), name="popular_artists"),
]

