from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import LogoutAPIView, RegisterAPIView, CurrentUserAPIView, ProfileUpdateAPIView, LoginAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('me/', CurrentUserAPIView.as_view(), name='api_current_user'),
    path('profile/', CurrentUserAPIView.as_view(), name='api_profile'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='api_profile_update'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]