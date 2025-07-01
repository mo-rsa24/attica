from django.urls import path
from django.contrib.auth import views as auth_views
from .views import CustomUserRegisterView, CurrentUserAPIView

urlpatterns = [
    path('register/', CustomUserRegisterView.as_view(), name='register'),

    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),

    # Built-in logout view
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    path('api/me/', CurrentUserAPIView.as_view(), name='current_user'),

    path('login-redirect/', CustomUserRegisterView.as_view(), name='login_redirect'),
]