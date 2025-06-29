from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.shortcuts import render, redirect
from cart.models import CartItem

class CheckoutView(LoginRequiredMixin, View):
    def get(self, request):
        cart_items = CartItem.objects.filter(user=request.user)
        if not cart_items:
            return redirect('cart_detail')
        total_cost = sum(item.vendor.price_range for item in cart_items)
        return render(request, 'checkout.html', {'cart_items': cart_items, 'total_cost': total_cost})

    def post(self, request):
        # Simulate payment processing
        # In real implementation, integrate with a payment gateway
        CartItem.objects.filter(user=request.user).delete()
        return render(request, 'checkout_success.html')
