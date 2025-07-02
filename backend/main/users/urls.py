from django.urls import path
from django.contrib.auth import views as auth_views
from .views import CustomUserRegisterView, CurrentUserAPIView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('me/', CurrentUserAPIView.as_view(), name='api_current_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]