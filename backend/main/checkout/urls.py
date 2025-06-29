from django.urls import path, include, re_path

from . import views
from .views import CheckoutView

urlpatterns = [
    path('', CheckoutView.as_view(), name='checkout')
]
