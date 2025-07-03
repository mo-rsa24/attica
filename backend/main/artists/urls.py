from rest_framework.routers import DefaultRouter
from .views import ArtistViewSet, ArtistBookingViewSet

router = DefaultRouter()
router.register(r'artists', ArtistViewSet)
router.register(r'artist-bookings', ArtistBookingViewSet)

urlpatterns = router.urls