from django.http import HttpResponseRedirect, Http404
from django.shortcuts import render
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, get_object_or_404

from vendors.models import VendorPost
from .models import CartItem, Event


# Add to Cart View
class AddToCartView(LoginRequiredMixin, View):
    def post(self, request, post_id, event_id):
        # Validate the post
        post = get_object_or_404(VendorPost, id=post_id)

        # Validate the event
        try:
            event = Event.objects.get(id=event_id, user=request.user)
        except Event.DoesNotExist:
            raise Http404("Event does not exist or you are not the organizer.")

        # Add item to cart
        CartItem.objects.get_or_create(user=request.user, post=post, event=event)
        return redirect('cart_view')
# Cart View
class CartView(LoginRequiredMixin, View):
    def get(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        total_cost = sum(item.post.vendor.price_range for item in cart_items if item.post)
        return render(request, 'cart/cart.html', {'cart_items': cart_items, 'total_cost': total_cost})

class RemoveFromCartView(LoginRequiredMixin, View):
    def post(self, request, cart_item_id):
        cart_item = get_object_or_404(CartItem, id=cart_item_id, user=request.user)
        cart_item.delete()
        return redirect('cart_view')
