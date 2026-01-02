from rest_framework import viewsets, permissions, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from .models import Event, PromoCode, EventDraft
from .serializer import EventSerializer, SimilarEventSerializer, EventDetailSerializer, PromoCodeSerializer, \
    EventListSerializer, EventDraftSerializer, MyEventSummarySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models.functions import Cos, Sin, Radians
from django.db.models import F, Q
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied

def _enforce_published_guard(instance, validated_data):
    """Ensure published events stay published and keep their publish timestamp."""
    if instance.status == 'published':
        validated_data['status'] = 'published'
        validated_data['published_at'] = instance.published_at
    return validated_data


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    """
    queryset = Event.objects.select_related("location")
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        This view should return a list of all the events
        for the currently authenticated user.
        """
        if self.action in ['list', 'retrieve', 'upcoming', 'popular']:
            return self.queryset
        return self.queryset.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        validated_data = serializer.validated_data
        serializer.save(**_enforce_published_guard(instance, validated_data))

    @action(detail=True, methods=['post'], url_path='publish', permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        event = self.get_object()
        event.status = 'published'
        event.is_draft = False
        event.published_at = timezone.now()
        event.save(update_fields=['status', 'is_draft', 'published_at', 'updated_at'])
        serializer = self.get_serializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if lat and lng:
            try:
                lat_val = float(lat)
                lng_val = float(lng)
                queryset = queryset.filter(
                    location__latitude__isnull=False,
                    location__longitude__isnull=False
                ).annotate(
                    distance_km=(
                            6371 * Cos(Radians(lat_val)) * Cos(Radians(F('location__latitude'))) *
                            Cos(Radians(F('location__longitude')) - Radians(lng_val)) +
                            Sin(Radians(lat_val)) * Sin(Radians(F('location__latitude')))
                    )
                ).order_by('-date', 'distance_km')
            except ValueError:
                queryset = queryset.order_by('-date', '-created_at')
        else:
            queryset = queryset.order_by('-date', '-created_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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

class EventDraftViewSet(viewsets.ModelViewSet):
    """
    Organizer-only endpoints for managing event drafts and publishing.
    """

    serializer_class = EventDraftSerializer
    permission_classes = [IsAuthenticated]
    queryset = EventDraft.objects.all()
    FIRST_STEP = "step1"

    def get_queryset(self):
        return self.queryset.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            organizer=self.request.user,
            current_step=serializer.validated_data.get("current_step") or self.FIRST_STEP,
        )

    def get_object(self):
        obj = get_object_or_404(EventDraft, pk=self.kwargs["pk"])
        if obj.organizer != self.request.user:
            raise PermissionDenied("You do not have permission to access this event.")
        return obj

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        mine = request.query_params.get("mine")
        queryset = self.get_queryset()
        if mine and mine.lower() in ["1", "true", "yes"]:
            queryset = queryset.filter(organizer=request.user)
        else:
            queryset = queryset.none()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        instance = self.get_object()
        return Response(self.get_serializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to edit this event."}, status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Merge data payloads if provided
        incoming_data = serializer.validated_data.get("data")
        if incoming_data is not None:
            serializer.validated_data["data"] = {**(instance.data or {}), **incoming_data}
        if not serializer.validated_data.get("current_step"):
            serializer.validated_data["current_step"] = instance.current_step
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to publish this event."}, status=status.HTTP_403_FORBIDDEN)

        if instance.status == EventDraft.Status.PUBLISHED:
            return Response(self.get_serializer(instance).data)

        instance.status = EventDraft.Status.PUBLISHED
        instance.published_at = timezone.now()
        instance.save(update_fields=["status", "published_at", "updated_at"])
        return Response(self.get_serializer(instance).data)

class MyEventsAPIView(generics.GenericAPIView):
    """
    Organizer-only listing of drafts and published events for the authenticated user.
    """

    serializer_class = MyEventSummarySerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        organizer = request.user
        drafts = EventDraft.objects.filter(organizer=organizer).order_by("-updated_at")
        published = Event.objects.filter(
            Q(organizer=organizer) | Q(user=organizer)
        ).filter(status="published").order_by("-updated_at")

        return Response({
            "drafts": self.get_serializer(drafts, many=True).data,
            "published": self.get_serializer(published, many=True).data,
        })