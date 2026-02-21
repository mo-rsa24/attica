from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import (
    LogoutAPIView,
    RegisterAPIView,
    CurrentUserAPIView,
    ProfileUpdateAPIView,
    LoginAPIView,
    UserProfileView,
    SocialPostListCreateAPIView,
    SocialPostLikeToggleAPIView,
    SocialPostCommentListCreateAPIView,
    SocialPostShareAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('me/', CurrentUserAPIView.as_view(), name='api_current_user'),
    path('profile/', UserProfileView.as_view(), name='api_profile'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='api_profile_update'),
    path('social-posts/', SocialPostListCreateAPIView.as_view(), name='social_post_list_create'),
    path('social-posts/<int:pk>/like/', SocialPostLikeToggleAPIView.as_view(), name='social_post_like'),
    path('social-posts/<int:pk>/comments/', SocialPostCommentListCreateAPIView.as_view(), name='social_post_comments'),
    path('social-posts/<int:pk>/share/', SocialPostShareAPIView.as_view(), name='social_post_share'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
