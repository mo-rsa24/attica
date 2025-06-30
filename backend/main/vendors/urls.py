from django.urls import path, include, re_path
from .views import VendorPostDashboardView, VendorListView, VendorPostCreateView, VendorPostUpdateView, \
    VendorPostDeleteView, VendorProfileUpdateView, ServiceDetailView, like_service_view, VendorProfileView, \
    PopularServicesAPIView, CategoriesWithServicesAPIView

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
]
