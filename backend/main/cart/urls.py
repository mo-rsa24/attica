from django.urls import path

from . import views
from .views import AddToCartView, CartView, RemoveFromCartView

urlpatterns = [
path('add/<int:post_id>/<int:event_id>/', AddToCartView.as_view(), name='add_to_cart'),
path('remove/<int:cart_item_id>/', RemoveFromCartView.as_view(), name='remove_from_cart'),
path('', CartView.as_view(), name='cart_view')

]
