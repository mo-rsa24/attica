from rest_framework import viewsets, permissions, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event
from .serializer import EventSerializer, SimilarEventSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the events
        for the currently authenticated user.
        """
        return self.request.user.events_created.all()

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

class SimilarEventsAPIView(generics.ListAPIView):
    serializer_class = SimilarEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_events = Event.objects.filter(organizer=user)
        if user_events.exists():
            latest_event = user_events.latest('start_date')
            return Event.objects.filter(
                location=latest_event.location
            ).exclude(id=latest_event.id)[:10]
        return Event.objects.order_by('-start_date')[:10]