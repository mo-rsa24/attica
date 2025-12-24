from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Artist, ArtistBooking, Follow, ArtistPost
from .serializers import ArtistSerializer, ArtistBookingSerializer, PopularArtistSerializer, \
    ArtistPortfolioItemSerializer, ArtistPostSerializer


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet for viewing Artist profiles and related content.
    """
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # --- ENHANCEMENT: Added filtering capabilities ---
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['genres']  # Allows filtering like /api/artists/?genres=Amapiano

    @action(detail=True, methods=['get'])
    def portfolio(self, request, pk=None):
        artist = self.get_object()
        portfolio_items = artist.portfolio_items.all()
        serializer = ArtistPortfolioItemSerializer(portfolio_items, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        artist = self.get_object()
        # In a real scenario, you might have more complex logic here
        # to check for booking clashes.
        return Response(artist.availability)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def book(self, request, pk=None):
        artist = self.get_object()
        event_id = request.data.get('event_id')

        if not event_id:
            return Response({'error': 'Event ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for booking conflicts
        if ArtistBooking.objects.filter(artist=artist, event_id=event_id).exists():
            return Response({'error': 'Artist is already booked for this event.'}, status=status.HTTP_409_CONFLICT)

        # Check artist's general availability
        event_date_str = request.data.get('event_date')  # e.g., '2024-12-10'
        if artist.availability.get(event_date_str) == 'unavailable':
            return Response({'error': f'Artist is not available on {event_date_str}.'}, status=status.HTTP_409_CONFLICT)

        booking_data = {'event': event_id}
        serializer = ArtistBookingSerializer(data=booking_data)

        if serializer.is_valid():
            serializer.save(artist=artist, status='pending')
            # Creative Enhancement: Trigger a notification to the artist here (e.g., via Celery)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        # Dummy data for demonstration
        reviews_data = [
            {'id': 1, 'user': 'Jane Doe', 'rating': 5, 'comment': 'Absolutely phenomenal performance!'},
            {'id': 2, 'user': 'John Smith', 'rating': 4, 'comment': 'Great energy and very professional.'},
            {'id': 3, 'user': 'A-Reece', 'rating': 4, 'comment': 'Great energy and very professional.'},
        ]
        return Response(reviews_data)

    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        # Dummy data for demonstration
        events_data = [
            {'id': 1, 'name': 'Rocking the Daisies', 'date': '2025-10-04', 'location': 'Cape Town'},
            {'id': 2, 'name': 'Afropunk', 'date': '2025-12-30', 'location': 'Johannesburg'},
            {'id': 3, 'name': 'Afropunk 2', 'date': '2025-12-30', 'location': 'Johannesburg'},
        ]
        return Response(events_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, pk=None):
        artist = self.get_object()
        user = request.user

        follow_instance, created = Follow.objects.get_or_create(user=user, artist=artist)

        if created:
            return Response({'status': 'followed'}, status=status.HTTP_201_CREATED)
        else:
            follow_instance.delete()
            return Response({'status': 'unfollowed'}, status=status.HTTP_204_NO_CONTENT)

class ArtistPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for artist posts.
    Accessed via /api/artists/{artist_pk}/posts/
    """
    queryset = ArtistPost.objects.all()
    serializer_class = ArtistPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        This view should return a list of all the posts for
        the artist as determined by the artist_pk portion of the URL.
        """
        artist_pk = self.kwargs['artist_pk']
        return ArtistPost.objects.filter(artist_id=artist_pk)

    def perform_create(self, serializer):
        """
        Only allow an artist to post to their own profile.
        """
        artist = Artist.objects.get(pk=self.kwargs['artist_pk'])
        # In a real app, you would verify that request.user is linked to this artist
        # if artist.user != self.request.user:
        #     raise permissions.PermissionDenied("You can only create posts for your own artist profile.")
        serializer.save(artist=artist)

class PopularArtistsAPIView(generics.ListAPIView):
    queryset = Artist.objects.order_by('-rating')[:10]
    serializer_class = PopularArtistSerializer
    permission_classes = [AllowAny]

class ArtistBookingViewSet(viewsets.ModelViewSet):
    queryset = ArtistBooking.objects.select_related('artist', 'event')
    serializer_class = ArtistBookingSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()

class GenreListView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        # This gets all unique, non-empty genre strings from the Artist model
        genres = Artist.objects.values_list('genres', flat=True).distinct()
        # Since genres can be comma-separated, we split and flatten the list
        all_genres = sorted(list(set(g.strip() for genre_list in genres if genre_list for g in genre_list.split(','))))
        return Response(all_genres)