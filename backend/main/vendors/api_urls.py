from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ServiceViewSet,
    VendorViewSet,
    VendorPostViewSet,
    PopularServicesAPIView,
    CategoriesWithServicesAPIView,
    VendorByUsernameAPIView,
    CurrentVendorAPIView,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"vendors", VendorViewSet, basename="vendor")
router.register(r"vendor-posts", VendorPostViewSet, basename="vendorpost")

urlpatterns = [
    path("services/popular/", PopularServicesAPIView.as_view(), name="popular_services"),
    path("categories-with-services/", CategoriesWithServicesAPIView.as_view(), name="categories_with_services"),
    path("profile/", CurrentVendorAPIView.as_view(), name="current_vendor"),
    path("vendors/<str:username>/", VendorByUsernameAPIView.as_view(), name="vendor_profile"),
    path("", include(router.urls)),
]
