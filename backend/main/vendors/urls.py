from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter

from .views import VendorPostDashboardView, VendorListView, VendorPostCreateView, VendorPostUpdateView, \
    VendorPostDeleteView, VendorProfileUpdateView, ServiceDetailView, like_service_view, VendorProfileView, \
    PopularServicesAPIView, CategoriesWithServicesAPIView, ServiceViewSet, VendorViewSet, VendorPostViewSet

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"vendors", VendorViewSet, basename="vendor")
router.register(r"posts", VendorPostViewSet, basename="vendorpost")


urlpatterns = [
    path('', VendorListView.as_view(), name='vendor_explore'),
    path('profile/<int:pk>/', VendorPostDashboardView.as_view(), name='vendor_dashboard'),
    path('profile/update/', VendorProfileUpdateView.as_view(), name='vendor_profile_update'),
    path('post/create/', VendorPostCreateView.as_view(), name='vendor_post_create'),
    path('post/<int:pk>/update/', VendorPostUpdateView.as_view(), name='vendor_post_update'),
    path('post/<int:pk>/delete/', VendorPostDeleteView.as_view(), name='vendor_post_delete'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service_detail'),
    path('services/<int:pk>/like/', like_service_view, name='like_service'),
    path('vendor/<str:username>/', VendorProfileView.as_view(), name='vendor_profile'),
    path('api/popular-services/', PopularServicesAPIView.as_view(), name='api_popular_services'),
    path('api/categories-with-services/', CategoriesWithServicesAPIView.as_view(), name='api_categories_with_services'),
path("", include(router.urls)),
    path("services/popular/", PopularServicesAPIView.as_view(), name="popular_services"),
    path(
        "categories-with-services/",
        CategoriesWithServicesAPIView.as_view(),
        name="categories_with_services",
    ),
]
urlpatterns += router.urls