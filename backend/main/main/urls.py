"""
URL configuration for main project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from vendors.views import VendorPostsListView
from .views import ReactAppView
from .views import index

def hello_world(request):
    return JsonResponse({"message": "Hello from Django!"})
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world),
    path('', VendorPostsListView.as_view(), name='index'),
    # path('', ReactAppView.as_view(), name='index'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('events/', include('events.urls')),
    path('chat/', include('chat.urls')),
    path('accounts/', include('users.urls')),
    path('vendors/', include('vendors.urls')),
    path('cart/', include('cart.urls')),
    path('checkout/', include('checkout.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += staticfiles_urlpatterns()     # serves files from STATICFILES_DIRS
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)