from django.urls import path, include, re_path
from .views import VendorPostDashboardView, VendorListView, VendorPostCreateView, VendorPostUpdateView, \
    VendorPostDeleteView,VendorProfileUpdateView

urlpatterns = [
    path('', VendorListView.as_view(), name='vendor_explore'),
    path('profile/<int:pk>/', VendorPostDashboardView.as_view(), name='vendor_dashboard'),
    path('profile/update/', VendorProfileUpdateView.as_view(), name='vendor_profile_update'),
    path('post/create/', VendorPostCreateView.as_view(), name='vendor_post_create'),
    path('post/<int:pk>/update/', VendorPostUpdateView.as_view(), name='vendor_post_update'),
    path('post/<int:pk>/delete/', VendorPostDeleteView.as_view(), name='vendor_post_delete'),
]
