from rest_framework import viewsets, permissions, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from .models import Event, PromoCode
from .serializer import EventSerializer, SimilarEventSerializer, EventDetailSerializer, PromoCodeSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        This view should return a list of all the events
        for the currently authenticated user.
        """
        return self.queryset.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='upcoming', permission_classes=[AllowAny])
    def upcoming(self, request):
        """
        Returns a list of the next 8 upcoming events.
        This endpoint is public and does not require authentication.
        """
        now = timezone.now()
        upcoming_events = Event.objects.filter(date__gte=now).order_by('date')[:8]
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='popular', permission_classes=[permissions.AllowAny])
    def popular(self, request):
        events = Event.objects.order_by('-guest_count')[:10]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


class PromoCodeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing promo codes for events.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = PromoCode.objects.all()
    serializer_class = PromoCodeSerializer

    def get_queryset(self):
        # Users can only manage promo codes for events they own
        return self.queryset.filter(event__user=self.request.user)

    def perform_create(self, serializer):
        # Add validation to ensure user owns the event they are adding a code to
        event = serializer.validated_data.get('event')
        if event.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add promo codes to your own events.")
        serializer.save()
class SimilarEventsAPIView(generics.ListAPIView):
    serializer_class = SimilarEventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        user_events = Event.objects.filter(organizer=user)
        if user_events.exists():
            latest_event = user_events.latest('start_date')
            return Event.objects.filter(
                location=latest_event.location
            ).exclude(id=latest_event.id)[:10]
        return Event.objects.order_by('-start_date')[:10]