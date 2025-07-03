from rest_framework.routers import DefaultRouter
from .views import VenueViewSet, VenueBookingViewSet

router = DefaultRouter()
router.register(r'venues', VenueViewSet)
router.register(r'venue-bookings', VenueBookingViewSet)

urlpatterns = router.urls