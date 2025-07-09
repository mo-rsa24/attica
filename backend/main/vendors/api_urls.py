from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ServiceViewSet,
    VendorViewSet,
    VendorPostViewSet,
    PopularServicesAPIView,
    CategoriesWithServicesAPIView,
    VendorByUsernameAPIView,
    CurrentVendorAPIView, BookingViewSet, AmenityViewSet, PolicyViewSet, RegionViewSet, BookingRequestViewSet,
    ServiceAvailabilityAPIView, BookServiceAPIView, RequestToBookAPIView,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"", VendorViewSet, basename="vendor")
router.register(r"posts", VendorPostViewSet, basename="vendorpost")
router.register(r"bookings", BookingViewSet, basename="booking")
router.register(r"booking-requests", BookingRequestViewSet, basename="bookingrequest")
router.register(r"amenities", AmenityViewSet, basename="amenity")
router.register(r"policies", PolicyViewSet, basename="policy")
router.register(r"regions", RegionViewSet, basename="region")

urlpatterns = [
    *router.urls,
    path("services/popular/", PopularServicesAPIView.as_view(), name="popular_services"),
    path("categories-with-services/", CategoriesWithServicesAPIView.as_view(), name="categories_with_services"),
    path("profile/", CurrentVendorAPIView.as_view(), name="current_vendor"),

    path('services/<int:pk>/availability/', ServiceAvailabilityAPIView.as_view(), name='service-availability'),
    path('services/<int:pk>/book/', BookServiceAPIView.as_view(), name='service-book'),

    path('services/<int:pk>/request-book/', RequestToBookAPIView.as_view(), name='service-request-book'),

    path(
        "by-username/<str:username>/",
        VendorByUsernameAPIView.as_view(),
        name="vendor_profile",
    ),
    path("", include(router.urls)),
]
