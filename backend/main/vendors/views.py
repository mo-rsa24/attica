from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Prefetch
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views import generic
from django.views.generic import CreateView, DeleteView, UpdateView, ListView
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from events.models import Event
from .models import Vendor, Category, VendorPost, Service, Region, Policy, Amenity, Booking, BookingRequest
import pdb

from .serializers import ServiceSerializer, CategorySerializer, VendorSerializer, ServiceDetailSerializer, \
    VendorPostSerializer, VendorDetailSerializer, RegionSerializer, PolicySerializer, AmenitySerializer, \
    BookingSerializer, BookingRequestSerializer


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
        where = self.request.GET.get('where')
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if price_min:
            queryset = queryset.filter(price_range__gte=price_min)
        if price_max:
            queryset = queryset.filter(price_range__lte=price_max)
        if rating:
            queryset = queryset.filter(rating__gte=rating)
        if where:
            queryset = queryset.filter(vendorservices__location_tags__icontains=where).distinct()
        return queryset


class VendorPostDashboardView(generic.DetailView): #VendorPostListView
    model = Vendor
    template_name = "post/vendor_post_list.html"
    context_object_name = 'vendor'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['posts'] = self.object.posts.all()
        context['event'] = Event.objects.filter(user=self.request.user).first()  # Replace with your event selection logic
        from users.models import Role
        context['is_vendor'] = self.request.user.has_role(Role.SERVICE_PROVIDER)
        return context

class VendorPostCreateView(LoginRequiredMixin, CreateView):
    model = VendorPost
    fields = ['image', 'caption']
    template_name = 'post/vendor_post_form.html'

    def dispatch(self, request, *args, **kwargs):
        from users.models import Role
        if not request.user.has_role(Role.SERVICE_PROVIDER):
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            from users.models import Role
            return self.request.user.has_role(Role.SERVICE_PROVIDER) and post.vendor.user == self.request.user
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
        from users.models import Role
        if not request.user.has_role(Role.SERVICE_PROVIDER) or post.vendor.user != request.user:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            from users.models import Role
            return self.request.user.has_role(Role.SERVICE_PROVIDER) and post.vendor.user == self.request.user
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
        from users.models import Role
        if not request.user.has_role(Role.SERVICE_PROVIDER) or post.vendor.user != request.user:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def test_func(self):
        # Check if the logged-in user is the owner of the vendor post
        try:
            post = self.get_object()
            from users.models import Role
            return self.request.user.has_role(Role.SERVICE_PROVIDER) and post.vendor.user == self.request.user
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

        context["popular_services"] = Service.objects.order_by("-rating")[:10]

        # Pass grouped data to the context
        context['categories_with_services'] = categories
        return context

class ServiceDetailView(generic.DetailView):
    model = Service
    template_name = 'services/service_detail.html'
    context_object_name = 'service'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['reviews'] = self.object.reviews.all()
        context['gallery'] = self.object.images.all()
        return context


class VendorProfileView(generic.DetailView):
    model = Vendor
    template_name = 'vendors/vendor_profile.html'
    context_object_name = 'vendor'

    def get_object(self, queryset=None):
        return get_object_or_404(Vendor, user__username=self.kwargs['username'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['services'] = self.object.vendorservices.all()
        return context



class VendorByUsernameAPIView(generics.RetrieveAPIView):
    queryset = Vendor.objects.prefetch_related("vendorservices", "posts")
    serializer_class = VendorDetailSerializer
    lookup_field = "user__username"     # filter by Vendor.user__username
    lookup_url_kwarg = "username"       # read from <str:username> in the URL
    permission_classes = [AllowAny]



class CurrentVendorAPIView(generics.RetrieveAPIView):
    """Return the vendor profile for the logged-in user"""

    serializer_class = VendorDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.vendor_profile


@login_required
@require_POST
def like_service_view(request, pk):
    service = get_object_or_404(Service, pk=pk)
    if request.user in service.likes.all():
        service.likes.remove(request.user)
    else:
        service.likes.add(request.user)
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', service.get_absolute_url()))

class PopularServicesAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ServiceSerializer

    def get_queryset(self):
        return (
            Service.objects.select_related("vendor", "category")
            .prefetch_related("images")
            .order_by("-rating")[:10]
        )

class CategoriesWithServicesAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = (
        Category.objects.prefetch_related(
            Prefetch(
                "servicecategory",
                queryset=Service.objects.select_related("vendor", "category"),
            )
        ).all()
    )

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for listing and retrieving services"""

    queryset = Service.objects.select_related("vendor", "category").prefetch_related(
        "images", "reviews"
    )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ServiceDetailSerializer
        return ServiceSerializer

    @action(detail=False, methods=["get"], url_path="popular", permission_classes=[AllowAny])
    def popular(self, request):
        services = (
            Service.objects.select_related("vendor", "category")
            .order_by("-rating")[:10]
        )
        serializer = ServiceSerializer(services, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post", "delete"], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        service = self.get_object()
        if request.method == "POST":
            service.likes.add(request.user)
        else:
            service.likes.remove(request.user)
        return Response(
            {
                "likes": service.likes.count(),
                "liked": request.user in service.likes.all(),
            }
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def similar(self, request, pk=None):
        service = self.get_object()
        queryset = service.similar_services.all()
        if not queryset.exists():
            queryset = (
                Service.objects.filter(
                    category=service.category,
                    location_tags=service.location_tags,
                )
                .exclude(id=service.id)[:10]
            )
        serializer = ServiceSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

class VendorViewSet(viewsets.ModelViewSet):
    """API for viewing and editing vendors."""

    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Vendor.objects.prefetch_related("vendorservices", "posts")

    def get_serializer_class(self):
        if self.action in ["list"]:
            return VendorSerializer
        return VendorDetailSerializer

    def perform_update(self, serializer):
        from users.models import Role
        if not self.request.user.has_role(Role.SERVICE_PROVIDER):
            raise permissions.PermissionDenied()
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get", "post"], serializer_class=VendorPostSerializer)
    def posts(self, request, pk=None):
        """List or create posts for a vendor."""
        vendor = self.get_object()
        if request.method == "GET":
            posts = vendor.posts.all().order_by("-created_at")
            serializer = VendorPostSerializer(posts, many=True, context={"request": request})
            return Response(serializer.data)
        # POST
        if request.user != vendor.user:
            raise permissions.PermissionDenied()
        serializer = VendorPostSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(vendor=vendor)
        return Response(serializer.data)


class VendorPostViewSet(viewsets.ModelViewSet):
    """CRUD operations for individual vendor posts"""

    serializer_class = VendorPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return VendorPost.objects.all().select_related("vendor")

    def perform_update(self, serializer):
        post = self.get_object()
        if self.request.user != post.vendor.user:
            raise permissions.PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.vendor.user:
            raise permissions.PermissionDenied()
        instance.delete()

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Booking.objects.select_related("user", "service")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return BookingRequest.objects.select_related("user", "service")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [AllowAny]


class PolicyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    permission_classes = [AllowAny]


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]