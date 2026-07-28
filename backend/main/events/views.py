from rest_framework import viewsets, permissions, generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from .models import Event, PromoCode, EventDraft
from .serializer import EventSerializer, SimilarEventSerializer, EventDetailSerializer, PromoCodeSerializer, \
    EventListSerializer, EventDraftSerializer, EventDraftAssetSerializer, MyEventSummarySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime, parse_time
from django.db import transaction
from django.db.models.functions import Cos, Sin, Radians
from django.db.models import F, Q
from rest_framework.generics import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError

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

    @action(detail=True, methods=['get'], url_path='manifest', permission_classes=[IsAuthenticated])
    def manifest(self, request, pk=None):
        """
        Returns all providers (vendors, artists, venues) associated with the event,
        grouped by status and provider type.
        """
        event = self.get_object()

        # Verify user has access to this event
        if event.organizer != request.user and event.user != request.user:
            return Response(
                {"detail": "You don't have permission to view this event's manifest."},
                status=status.HTTP_403_FORBIDDEN
            )

        from chat.models import Booking
        from chat.serializers import BookingSerializer

        bookings = Booking.objects.filter(event=event).select_related(
            'provider', 'organizer', 'chatroom'
        ).order_by('provider_type', '-created_at')

        # Group by status
        result = {
            'drafts': [],
            'pending': [],
            'confirmed': [],
            'rejected': [],
            'cancelled': [],
        }

        status_map = {
            'draft': 'drafts',
            'pending': 'pending',
            'successful': 'confirmed',
            'rejected': 'rejected',
            'cancelled': 'cancelled',
        }

        for booking in bookings:
            key = status_map.get(booking.status, 'drafts')
            result[key].append(BookingSerializer(booking).data)

        # Also group by provider type
        by_type = {
            'vendors': [],
            'artists': [],
            'venues': [],
        }

        type_map = {
            'vendor': 'vendors',
            'artist': 'artists',
            'venue': 'venues',
        }

        for booking in bookings:
            key = type_map.get(booking.provider_type, 'vendors')
            by_type[key].append(BookingSerializer(booking).data)

        return Response({
            'event_id': event.id,
            'event_name': event.name,
            'by_status': result,
            'by_type': by_type,
            'totals': {
                'drafts': len(result['drafts']),
                'pending': len(result['pending']),
                'confirmed': len(result['confirmed']),
                'rejected': len(result['rejected']),
                'cancelled': len(result['cancelled']),
            }
        })


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

    @staticmethod
    def _draft_asset_model():
        return EventDraft._meta.get_field("assets").related_model

    def get_queryset(self):
        return self.queryset.filter(organizer=self.request.user).prefetch_related("assets")

    def perform_create(self, serializer):
        serializer.save(
            organizer=self.request.user,
            current_step=serializer.validated_data.get("current_step") or self.FIRST_STEP,
        )

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
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

    @staticmethod
    def _draft_steps(draft):
        payload = draft.data if isinstance(draft.data, dict) else {}
        steps = payload.get("steps")
        if isinstance(steps, dict):
            return steps
        return {}

    @staticmethod
    def _draft_step(draft, step_key):
        payload = draft.data if isinstance(draft.data, dict) else {}
        steps = EventDraftViewSet._draft_steps(draft)
        step_payload = steps.get(step_key)
        if isinstance(step_payload, dict):
            return step_payload
        direct_payload = payload.get(step_key)
        return direct_payload if isinstance(direct_payload, dict) else {}

    @staticmethod
    def _first_truthy(*values):
        for value in values:
            if value not in (None, ""):
                return value
        return None

    @staticmethod
    def _draft_assets(draft, asset_type=None):
        queryset = draft.assets.all()
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        return queryset.order_by("created_at", "id")

    def _asset_url(self, asset, request=None):
        if not asset or not asset.file:
            return None
        if request:
            return request.build_absolute_uri(asset.file.url)
        return asset.file.url

    def _build_event_payload(self, draft, request=None):
        from locations.models import Location

        draft_asset_model = self._draft_asset_model()
        step1 = self._draft_step(draft, "step1")
        step3 = self._draft_step(draft, "step3")
        step4 = self._draft_step(draft, "step4")
        step5 = self._draft_step(draft, "step5")
        step6 = self._draft_step(draft, "step6")
        step7 = self._draft_step(draft, "step7")
        step8 = self._draft_step(draft, "step8")
        payload = draft.data if isinstance(draft.data, dict) else {}

        start_dt = parse_datetime(str(self._first_truthy(step1.get("start_date"), payload.get("start_date")) or ""))
        end_dt = parse_datetime(str(self._first_truthy(step1.get("end_date"), payload.get("end_date")) or ""))
        date_value = self._first_truthy(step1.get("date"), payload.get("date"))
        parsed_date = parse_date(str(date_value)) if date_value else None
        event_date = parsed_date or (start_dt.date() if start_dt else timezone.localdate())

        end_time_value = self._first_truthy(step1.get("end_time"), payload.get("end_time"))
        parsed_end_time = None
        if end_time_value:
            parsed_end_time = parse_time(str(end_time_value))
            if parsed_end_time is None:
                parsed_end_dt = parse_datetime(str(end_time_value))
                parsed_end_time = parsed_end_dt.time() if parsed_end_dt else None

        location_id = self._first_truthy(
            step3.get("location"),
            step4.get("location_id"),
            (step4.get("location") or {}).get("id") if isinstance(step4.get("location"), dict) else None,
        )
        location = None
        if location_id:
            location = Location.objects.filter(id=location_id).first()

        media_assets = [
            asset for asset in self._draft_assets(draft, draft_asset_model.AssetType.MEDIA)
            if asset.mime_type.startswith("image/")
        ]
        primary_image_url = self._asset_url(media_assets[0], request) if media_assets else None
        banner_image_url = self._asset_url(media_assets[1], request) if len(media_assets) > 1 else primary_image_url
        seating_chart_asset = self._draft_assets(draft, draft_asset_model.AssetType.SEATING_CHART).last()
        is_seated = bool(self._first_truthy(step5.get("is_seated"), payload.get("is_seated"), False))
        seating_chart_name = seating_chart_asset.file.name if is_seated and seating_chart_asset and seating_chart_asset.file else None

        event_payload = {
            "location": location,
            "name": self._first_truthy(step1.get("name"), step1.get("eventName"), payload.get("name"), payload.get("eventName"), "Untitled event"),
            "date": event_date,
            "start_date": start_dt,
            "end_date": end_dt.date() if end_dt else None,
            "start_time": start_dt or timezone.now(),
            "end_time": parsed_end_time,
            "venue": self._first_truthy((step4.get("location") or {}).get("name") if isinstance(step4.get("location"), dict) else None, payload.get("venue")),
            "budget": self._first_truthy(step5.get("budget"), payload.get("budget")),
            "guest_count": self._first_truthy(step1.get("guest_count"), step1.get("capacity"), payload.get("guest_count")),
            "theme": self._first_truthy(step1.get("theme"), payload.get("theme")),
            "notes": self._first_truthy(step1.get("notes"), step1.get("description"), payload.get("notes"), payload.get("description")),
            "image_url": primary_image_url or self._first_truthy(step8.get("image_url"), payload.get("image_url")),
            "banner_image": banner_image_url or self._first_truthy(step8.get("banner_image"), payload.get("banner_image")),
            "category": self._first_truthy(step1.get("category"), step1.get("selectedEventType"), payload.get("category")),
            "is_draft": False,
            "status": "published",
            "base_price": self._first_truthy(step5.get("base_price"), step6.get("base_price"), payload.get("base_price"), 0),
            "currency": self._first_truthy(step5.get("currency"), step6.get("currency"), payload.get("currency"), "ZAR"),
            "tiered_prices": self._first_truthy(step6.get("tiered_prices"), payload.get("tiered_prices")),
            "refund_policy": self._first_truthy(step5.get("refund_policy"), step7.get("refund_policy"), payload.get("refund_policy")) or "",
            "max_tickets_per_buyer": self._first_truthy(step5.get("max_tickets_per_buyer"), payload.get("max_tickets_per_buyer"), 10),
            "is_seated": is_seated,
            "is_age_restricted": bool(self._first_truthy(step5.get("is_age_restricted"), step7.get("is_age_restricted"), payload.get("is_age_restricted"), False)),
            "access_type": self._first_truthy(step5.get("access_type"), step7.get("access_type"), payload.get("access_type"), "public"),
            "custom_questions": self._first_truthy(step7.get("custom_questions"), payload.get("custom_questions")),
            "features": step7.get("features") or payload.get("features") or None,
        }
        return event_payload, seating_chart_name

    def _upsert_event_from_draft(self, draft, request=None, event=None):
        event_payload, seating_chart_name = self._build_event_payload(draft, request=request)

        if event is None:
            if seating_chart_name:
                event_payload["seating_chart"] = seating_chart_name
            return Event.objects.create(
                user=draft.organizer,
                organizer=draft.organizer,
                published_at=timezone.now(),
                **event_payload,
            )

        for field, value in event_payload.items():
            setattr(event, field, value)

        event.seating_chart = seating_chart_name or None
        if not event.published_at:
            event.published_at = timezone.now()
        event.save()
        return event

    @action(detail=True, methods=["post"], url_path="assets", parser_classes=[MultiPartParser, FormParser])
    def upload_asset(self, request, *args, **kwargs):
        draft = self.get_object()
        draft_asset_model = self._draft_asset_model()
        upload = request.FILES.get("file")
        asset_type = request.data.get("asset_type")
        current_step = request.data.get("current_step")

        if upload is None:
            raise ValidationError({"file": "A file is required."})
        if asset_type not in draft_asset_model.AssetType.values:
            raise ValidationError({"asset_type": "Unsupported asset type."})

        max_size = getattr(settings, "MAX_UPLOAD_SIZE_BYTES", 50 * 1024 * 1024)
        upload_size = getattr(upload, "size", 0) or 0
        if upload_size > max_size:
            raise ValidationError(
                {"file": f"File too large. Max size is {max_size // (1024 * 1024)}MB."}
            )

        mime_type = getattr(upload, "content_type", "") or ""
        if asset_type == draft_asset_model.AssetType.MEDIA:
            is_allowed_media = mime_type.startswith("image/") or mime_type.startswith("video/")
            if not is_allowed_media:
                raise ValidationError({"file": "Only image and video files are supported for media uploads."})
        if asset_type == draft_asset_model.AssetType.SEATING_CHART:
            is_allowed_seating_chart = mime_type == "application/pdf" or mime_type.startswith("image/")
            if not is_allowed_seating_chart:
                raise ValidationError({"file": "Seating charts must be a PDF or image file."})
            draft.assets.filter(asset_type=draft_asset_model.AssetType.SEATING_CHART).delete()

        draft_asset_model.objects.create(
            draft=draft,
            asset_type=asset_type,
            name=upload.name,
            file=upload,
            mime_type=mime_type,
            size=getattr(upload, "size", 0) or 0,
        )

        draft.updated_at = timezone.now()
        update_fields = ["updated_at"]
        if current_step:
            draft.current_step = current_step
            update_fields.append("current_step")
        draft.save(update_fields=update_fields)

        serializer = self.get_serializer(draft)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path=r"assets/(?P<asset_id>[^/.]+)")
    def delete_asset(self, request, asset_id=None, *args, **kwargs):
        draft = self.get_object()
        asset = get_object_or_404(draft.assets.all(), pk=asset_id)
        asset.delete()
        draft.updated_at = timezone.now()
        draft.save(update_fields=["updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.organizer != request.user:
            return Response({"detail": "You do not have permission to publish this event."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            instance.status = EventDraft.Status.PUBLISHED
            if instance.published_at is None:
                instance.published_at = timezone.now()

            draft_payload = instance.data if isinstance(instance.data, dict) else {}
            published_event_id = draft_payload.get("published_event_id")
            event_id = request.data.get("event_id") or published_event_id

            if event_id:
                try:
                    published_event = Event.objects.select_for_update().get(id=event_id, organizer=request.user)
                    published_event = self._upsert_event_from_draft(instance, request=request, event=published_event)
                except Event.DoesNotExist:
                    published_event = self._upsert_event_from_draft(instance, request=request)
            else:
                published_event = self._upsert_event_from_draft(instance, request=request)

            if not isinstance(draft_payload, dict):
                draft_payload = {}
            draft_payload["published_event_id"] = published_event.id
            instance.data = draft_payload
            instance.save(update_fields=["status", "published_at", "data", "updated_at"])

            from scheduling.services import finalize_draft_bookings

            finalize_summary = finalize_draft_bookings(
                draft=instance,
                published_event=published_event,
                organizer=request.user,
            )

        response_payload = self.get_serializer(instance).data
        response_payload["published_event_id"] = published_event.id
        response_payload["booking_publish_summary"] = finalize_summary
        return Response(response_payload)

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
