from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Prefetch
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views import generic
from django.views.generic import CreateView, DeleteView, UpdateView, ListView

from events.models import Event
from .models import Vendor, Category, VendorPost, Service
import pdb

# Create your views here.

class VendorListView(generic.ListView):
    model = Vendor
    template_name = "vendors/vendor_explore.html"
    paginate_by = 15
    context_object_name = 'vendors'

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.GET.get('category')
        price_min = self.request.GET.get('price_min')
        price_max = self.request.GET.get('price_max')
        rating = self.request.GET.get('rating')
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if price_min:
            queryset = queryset.filter(price_range__gte=price_min)
        if price_max:
            queryset = queryset.filter(price_range__lte=price_max)
        if rating:
            queryset = queryset.filter(rating__gte=rating)

        return queryset


class VendorPostDashboardView(generic.DetailView): #VendorPostListView
    model = Vendor
    template_name = "post/vendor_post_list.html"
    context_object_name = 'vendor'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['posts'] = self.object.posts.all()
        context['event'] = Event.objects.filter(user=self.request.user).first()  # Replace with your event selection logic
        context['is_vendor'] = self.request.user.user_type == 'vendor'
        return context

class VendorPostCreateView(LoginRequiredMixin, CreateView):
    model = VendorPost
    fields = ['image', 'caption']
    template_name = 'post/vendor_post_form.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.user_type != 'vendor':
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            return self.request.user.user_type == 'vendor' and post.vendor.user == self.request.user
        except VendorPost.DoesNotExist:
            raise Http404("Post does not exist")

    def form_valid(self, form):
        form.instance.vendor = get_object_or_404(Vendor, user=self.request.user)
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('vendor_dashboard', kwargs={'pk': self.request.user.vendor_profile.id})

class VendorPostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = VendorPost
    fields = ['image', 'caption']
    template_name = 'post/vendor_post_form.html'

    def dispatch(self, request, *args, **kwargs):
        post = self.get_object()
        if request.user.user_type != 'vendor' or post.vendor.user != request.user:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            return self.request.user.user_type == 'vendor' and post.vendor.user == self.request.user
        except VendorPost.DoesNotExist:
            raise Http404("Post does not exist")

    def get_success_url(self):
        return reverse('vendor_dashboard', kwargs={'pk': self.request.user.vendor_profile.id})


class VendorProfileUpdateView(LoginRequiredMixin, generic.edit.UpdateView):
    model = Vendor
    fields = ['name', 'category', 'price_range', 'description', 'testimonial', 'portfolio']
    template_name = 'profile/vendor_profile_form.html'
    success_url = reverse_lazy('vendor_dashboard')

    def get_object(self, queryset=None):
        return get_object_or_404(Vendor, user=self.request.user)

    def get_success_url(self):
        return reverse('vendor_dashboard', kwargs={'pk': self.request.user.vendor_profile.id})

class VendorPostDeleteView(LoginRequiredMixin, DeleteView):
    model = VendorPost
    template_name = 'post/vendor_post_confirm_delete.html'

    def dispatch(self, request, *args, **kwargs):
        post = self.get_object()
        if request.user.user_type != 'vendor' or post.vendor.user != request.user:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            return self.request.user.user_type == 'vendor' and post.vendor.user == self.request.user
        except VendorPost.DoesNotExist:
            raise Http404("Post does not exist")

    def get_success_url(self):
        return reverse('vendor_dashboard', kwargs={'pk': self.request.user.vendor_profile.id})

class VendorPostsListView(ListView):
    print("Hello world")
    model = VendorPost
    template_name = 'index.html'  # Template to render
    context_object_name = 'posts'
    paginate_by = 12  # Add pagination for better usability

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Get services grouped by category
        categories = Category.objects.prefetch_related(
            Prefetch("servicecategory", queryset=Service.objects.all())
        )

        # Pass grouped data to the context
        context['categories_with_services'] = categories
        return context
