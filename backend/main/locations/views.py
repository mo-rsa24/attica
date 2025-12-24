from django.contrib.postgres.search import SearchQuery, SearchVector, SearchRank
from django_filters.rest_framework import DjangoFilterBackend
from geopy import Nominatim
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models.functions import Cos, Sin, Radians
from django.db.models import F
from rest_framework.views import APIView
from django.db.models import Q
from .filters import LocationFilter
from .models import Location, VenueBooking, Wish, WaitlistEntry, Question
from .serializers import VenueSerializer, VenueBookingSerializer, PopularVenueSerializer, LocationReviewSerializer, \
    WaitlistEntrySerializer, QuestionSerializer, WishSerializer, QuoteSerializer, LocationMapSerializer


class LocationSearchView(APIView):
    """
    Provides location suggestions based on a search query and optional region filter.
    """

    def get(self, request):
        query = request.GET.get('q', '')
        region_name = request.GET.get('region')

        locations = Location.objects.filter(
            Q(name__icontains=query) | Q(address__icontains=query)
        )

        if region_name:
            locations = locations.filter(region__name__iexact=region_name)

        # Prioritize by a scoring metric if available, otherwise just limit
        results = locations.order_by('-is_featured')[:10]
        serializer = VenueSerializer(results, many=True)
        return Response(serializer.data)


class ReverseGeocodeView(APIView):
    """
    Converts latitude and longitude to a human-readable address.
    """

    def get(self, request):
        lat = request.GET.get('lat')
        lng = request.GET.get('lng')

        if not lat or not lng:
            return Response({'error': 'Latitude and Longitude are required'}, status=400)

        try:
            geolocator = Nominatim(user_agent="event-organizer-app")
            location = geolocator.reverse((lat, lng), exactly_one=True)
            address = location.address if location else "Unknown location"
            return Response({'address': address})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = LocationFilter

    # --- New Action for Map Data ---
    @action(detail=False, methods=['get'], url_path='map-data')
    def map_data(self, request):
        """
        A lightweight endpoint to provide only the necessary data for map markers.
        """
        locations = Location.objects.filter(latitude__isnull=False, longitude__isnull=False)
        serializer = LocationMapSerializer(locations, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        location = self.get_object()
        serializer = VenueBookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, location=location)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        location = self.get_object()
        similar_locations = Location.objects.filter(capacity__gte=location.capacity - 50,
                                                    capacity__lte=location.capacity + 50).exclude(id=pk)[:5]
        serializer = self.get_serializer(similar_locations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def request_quote(self, request, pk=None):
        location = self.get_object()
        serializer = QuoteSerializer(data=request.data)
        if serializer.is_valid():
            # Assign the current user and location to the quote
            serializer.save(user=request.user, location=location)
            # Future enhancement: Send an email notification to the location's agent
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        location = self.get_object()
        reviews = location.reviews.all()
        serializer = LocationReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def near(self, request):
        lat = float(request.query_params.get('lat'))
        lng = float(request.query_params.get('lng'))
        radius = float(request.query_params.get('radius_km', 10))

        queryset = Location.objects.annotate(
            distance=(
                    6371 * Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                    Cos(Radians(F('longitude')) - Radians(lng)) +
                    Sin(Radians(lat)) * Sin(Radians(F('latitude')))
            )
        ).filter(distance__lte=radius)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query_string = request.query_params.get('q', '')
        query = SearchQuery(query_string)

        # Vector and Rank for relevance
        vector = SearchVector('name', 'description')
        rank = SearchRank(vector, query)

        queryset = (
            Location.objects.annotate(rank=rank)
            .filter(search_vector=query)
            .order_by('-rank')
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        location = self.get_object()
        recommendations = Location.objects.filter(
            capacity__gte=location.capacity - 20,
            capacity__lte=location.capacity + 20
        ).exclude(id=pk)[:5]
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='popular', permission_classes=[permissions.AllowAny])
    def popular(self, request):
        locations = Location.objects.order_by('-venue_count')[:10]
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)

class PopularLocationsAPIView(generics.ListAPIView):
    queryset = Location.objects.order_by('-venue_count')[:10]
    serializer_class = PopularVenueSerializer
    permission_classes = [AllowAny]


class VenueBookingViewSet(viewsets.ModelViewSet):
    queryset = VenueBooking.objects.all()
    serializer_class = VenueBookingSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class WaitlistEntryViewSet(viewsets.ModelViewSet):
    queryset = WaitlistEntry.objects.all()
    serializer_class = WaitlistEntrySerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class WishViewSet(viewsets.ModelViewSet):
    queryset = Wish.objects.all()
    serializer_class = WishSerializer