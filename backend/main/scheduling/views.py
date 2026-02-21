from __future__ import annotations

from datetime import timedelta

from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event

from .exceptions import ConflictError, IdempotencyConflictError, PolicyViolationError, TransitionError
from .models import (
    AvailabilityException,
    AvailabilityRule,
    AvailabilitySlot,
    BookingConflictIncident,
    Booking,
    BookingRequest,
    MarketplaceResource,
    OutboxDeadLetter,
    OutboxEvent,
    ResourcePolicy,
    WebhookTarget,
)
from .permissions import IsSchedulingAdmin, can_manage_event, can_manage_resource, is_admin
from .serializers import (
    AvailabilityExceptionSerializer,
    AvailabilityRuleSerializer,
    AvailabilitySearchQuerySerializer,
    AvailabilitySlotSerializer,
    BookingConflictIncidentSerializer,
    BookingRequestSerializer,
    BookingSerializer,
    CalendarQuerySerializer,
    CancelBookingSerializer,
    CreateBookingSerializer,
    CreateRequestSerializer,
    MarketplaceResourceSerializer,
    OutboxDeadLetterSerializer,
    OutboxEventSerializer,
    RequestReviewSerializer,
    ResourcePolicySerializer,
    RescheduleBookingSerializer,
    WebhookTargetSerializer,
)
from .services import (
    approve_request,
    build_calendar_view,
    cancel_booking,
    create_booking,
    create_request,
    decline_request,
    get_scheduling_ops_summary,
    replay_dead_letter,
    reschedule_booking,
    search_availability,
)


class BaseSchedulingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _error_response(exc: Exception):
        if isinstance(exc, ConflictError):
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        if isinstance(exc, IdempotencyConflictError):
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        if isinstance(exc, TransitionError):
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, PolicyViolationError):
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Unexpected scheduling error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MarketplaceResourceViewSet(viewsets.ModelViewSet):
    serializer_class = MarketplaceResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MarketplaceResource.objects.all().select_related("owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        if self.action in {"list", "retrieve"}:
            return qs.filter(is_active=True)
        return qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        resource = self.get_object()
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to edit this resource.")
        serializer.save()


class ResourcePolicyViewSet(viewsets.ModelViewSet):
    serializer_class = ResourcePolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ResourcePolicy.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage this resource policy.")
        serializer.save()

    def perform_update(self, serializer):
        policy = self.get_object()
        if not can_manage_resource(self.request.user, policy.resource):
            raise PermissionDenied("You do not have permission to update this policy.")
        serializer.save(version=policy.version + 1)


class AvailabilityRuleViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilityRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilityRule.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage availability for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        rule = self.get_object()
        if not can_manage_resource(self.request.user, rule.resource):
            raise PermissionDenied("You do not have permission to update this rule.")
        serializer.save(version=rule.version + 1)


class AvailabilityExceptionViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilityExceptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilityException.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to manage exceptions for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        exception = self.get_object()
        if not can_manage_resource(self.request.user, exception.resource):
            raise PermissionDenied("You do not have permission to update this exception.")
        serializer.save()


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AvailabilitySlot.objects.all().select_related("resource", "resource__owner")

    def get_queryset(self):
        qs = self.queryset
        if is_admin(self.request.user):
            return qs
        return qs.filter(resource__owner=self.request.user)

    def perform_create(self, serializer):
        resource = serializer.validated_data["resource"]
        if not can_manage_resource(self.request.user, resource):
            raise PermissionDenied("You do not have permission to create slots for this resource.")
        serializer.save()

    def perform_update(self, serializer):
        slot = self.get_object()
        if not can_manage_resource(self.request.user, slot.resource):
            raise PermissionDenied("You do not have permission to update this slot.")
        serializer.save(version=slot.version + 1)


class BookingRequestViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = BookingRequest.objects.all().select_related("resource", "event", "organizer")

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            qs = self.queryset
        else:
            qs = self.queryset.filter(
                models.Q(organizer=user) | models.Q(resource__owner=user)
            )

        status_filter = self.request.query_params.get("status")
        event_id = self.request.query_params.get("event")
        resource_id = self.request.query_params.get("resource")
        role = self.request.query_params.get("role")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_id:
            qs = qs.filter(event_id=event_id)
        if resource_id:
            qs = qs.filter(resource_id=resource_id)
        if role == "organizer":
            qs = qs.filter(organizer=user)
        elif role == "provider":
            qs = qs.filter(resource__owner=user)
        return qs.order_by("-created_at")


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all().select_related("resource", "event", "organizer")

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            qs = self.queryset
        else:
            qs = self.queryset.filter(
                models.Q(organizer=user) | models.Q(resource__owner=user)
            )

        status_filter = self.request.query_params.get("status")
        event_id = self.request.query_params.get("event")
        resource_id = self.request.query_params.get("resource")
        role = self.request.query_params.get("role")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_id:
            qs = qs.filter(event_id=event_id)
        if resource_id:
            qs = qs.filter(resource_id=resource_id)
        if role == "organizer":
            qs = qs.filter(organizer=user)
        elif role == "provider":
            qs = qs.filter(resource__owner=user)
        return qs.order_by("-created_at")


class WebhookTargetViewSet(viewsets.ModelViewSet):
    serializer_class = WebhookTargetSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = WebhookTarget.objects.all().select_related("created_by", "updated_by")

    def get_queryset(self):
        qs = self.queryset.order_by("id")
        active = self.request.query_params.get("active")
        if active in {"1", "true"}:
            qs = qs.filter(is_active=True)
        if active in {"0", "false"}:
            qs = qs.filter(is_active=False)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class OutboxEventOpsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OutboxEventSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = OutboxEvent.objects.all().order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        status_filter = self.request.query_params.get("status")
        event_type = self.request.query_params.get("event_type")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs


class OutboxDeadLetterViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OutboxDeadLetterSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = OutboxDeadLetter.objects.all().select_related("outbox_event").order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        event_type = self.request.query_params.get("event_type")
        aggregate_type = self.request.query_params.get("aggregate_type")
        if event_type:
            qs = qs.filter(event_type=event_type)
        if aggregate_type:
            qs = qs.filter(aggregate_type=aggregate_type)
        return qs

    @action(detail=True, methods=["post"], url_path="replay")
    def replay(self, request, pk=None):
        dead_letter = self.get_object()
        replayed_event = replay_dead_letter(dead_letter=dead_letter, actor=request.user)
        return Response(
            {
                "dead_letter_id": dead_letter.id,
                "replayed_outbox_event_id": replayed_event.id,
            },
            status=status.HTTP_201_CREATED,
        )


class BookingConflictIncidentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookingConflictIncidentSerializer
    permission_classes = [IsSchedulingAdmin]
    queryset = BookingConflictIncident.objects.all().order_by("-created_at")

    def get_queryset(self):
        qs = self.queryset
        operation = self.request.query_params.get("operation")
        conflict_source = self.request.query_params.get("conflict_source")
        if operation:
            qs = qs.filter(operation=operation)
        if conflict_source:
            qs = qs.filter(conflict_source=conflict_source)
        return qs


class SchedulingOpsSummaryAPIView(BaseSchedulingAPIView):
    permission_classes = [IsSchedulingAdmin]

    def get(self, request):
        return Response(get_scheduling_ops_summary())


class AvailabilitySearchAPIView(BaseSchedulingAPIView):
    def get(self, request):
        serializer = AvailabilitySearchQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        data = search_availability(
            start_at=payload["start_at"],
            end_at=payload["end_at"],
            resource_type=payload.get("resource_type"),
            city=payload.get("city"),
            attendee_count=payload.get("attendee_count", 1),
            limit=payload.get("limit", 25),
            offset=payload.get("offset", 0),
        )
        return Response({"results": data})


class CreateBookingAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        event = get_object_or_404(Event, id=payload["event_id"])
        if not can_manage_event(request.user, event):
            raise PermissionDenied("You do not have permission to book against this event.")

        resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"], is_active=True)
        policy, _ = ResourcePolicy.objects.get_or_create(resource=resource)

        if policy.booking_mode == ResourcePolicy.BookingMode.APPROVAL_REQUIRED:
            return Response(
                {"detail": "This resource requires request approval. Use /requests instead."},
                status=status.HTTP_409_CONFLICT,
            )

        idempotency_key = request.headers.get("Idempotency-Key")
        try:
            booking, created = create_booking(
                organizer=request.user,
                event=event,
                resource=resource,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                attendee_count=payload["attendee_count"],
                source=Booking.Source.INSTANT,
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = BookingSerializer(booking).data
        return Response(output, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CreateRequestAPIView(BaseSchedulingAPIView):
    def post(self, request):
        serializer = CreateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        event = get_object_or_404(Event, id=payload["event_id"])
        if not can_manage_event(request.user, event):
            raise PermissionDenied("You do not have permission to create a request for this event.")

        resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"], is_active=True)
        idempotency_key = request.headers.get("Idempotency-Key")

        try:
            booking_request, created = create_request(
                organizer=request.user,
                event=event,
                resource=resource,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                attendee_count=payload["attendee_count"],
                message=payload.get("message", ""),
                idempotency_key=idempotency_key,
            )
        except Exception as exc:
            return self._error_response(exc)

        output = BookingRequestSerializer(booking_request).data
        return Response(output, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ApproveRequestAPIView(BaseSchedulingAPIView):
    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest.objects.select_related("resource"), id=request_id)
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("You do not have permission to approve this request.")

        serializer = RequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_request, booking = approve_request(
                reviewer=request.user,
                booking_request=booking_request,
                provider_message=serializer.validated_data["provider_message"],
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(
            {
                "request": BookingRequestSerializer(updated_request).data,
                "booking": BookingSerializer(booking).data,
            }
        )


class DeclineRequestAPIView(BaseSchedulingAPIView):
    def post(self, request, request_id: int):
        booking_request = get_object_or_404(BookingRequest.objects.select_related("resource"), id=request_id)
        if not can_manage_resource(request.user, booking_request.resource):
            raise PermissionDenied("You do not have permission to decline this request.")

        serializer = RequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_request = decline_request(
                reviewer=request.user,
                booking_request=booking_request,
                provider_message=serializer.validated_data["provider_message"],
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingRequestSerializer(updated_request).data)


class CancelBookingAPIView(BaseSchedulingAPIView):
    def post(self, request, booking_id: int):
        booking = get_object_or_404(Booking.objects.select_related("resource", "organizer"), id=booking_id)

        can_cancel = (
            booking.organizer_id == request.user.id
            or can_manage_resource(request.user, booking.resource)
            or is_admin(request.user)
        )
        if not can_cancel:
            raise PermissionDenied("You do not have permission to cancel this booking.")

        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not is_admin(request.user):
            policy, _ = ResourcePolicy.objects.get_or_create(resource=booking.resource)
            if booking.start_at - timezone.now() < timedelta(hours=policy.cancellation_window_hours):
                return Response(
                    {"detail": "Cancellation window has passed for this booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            updated_booking = cancel_booking(
                actor=request.user,
                booking=booking,
                reason=serializer.validated_data["reason"],
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingSerializer(updated_booking).data)


class RescheduleBookingAPIView(BaseSchedulingAPIView):
    def post(self, request, booking_id: int):
        booking = get_object_or_404(Booking.objects.select_related("resource", "organizer"), id=booking_id)

        can_reschedule = (
            booking.organizer_id == request.user.id
            or can_manage_resource(request.user, booking.resource)
            or is_admin(request.user)
        )
        if not can_reschedule:
            raise PermissionDenied("You do not have permission to reschedule this booking.")

        policy, _ = ResourcePolicy.objects.get_or_create(resource=booking.resource)
        if not policy.allow_reschedule and not is_admin(request.user):
            return Response({"detail": "Provider policy does not allow reschedule."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RescheduleBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated_booking = reschedule_booking(
                actor=request.user,
                booking=booking,
                new_start_at=serializer.validated_data["new_start_at"],
                new_end_at=serializer.validated_data["new_end_at"],
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response(BookingSerializer(updated_booking).data)


class CalendarViewAPIView(BaseSchedulingAPIView):
    def get(self, request):
        serializer = CalendarQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        scope = payload["scope"]
        if scope == "admin" and not is_admin(request.user):
            raise PermissionDenied("Only admins can use admin scope.")

        if scope == "resource" and payload.get("resource_id"):
            resource = get_object_or_404(MarketplaceResource, id=payload["resource_id"])
            if not can_manage_resource(request.user, resource) and not is_admin(request.user):
                raise PermissionDenied("You do not have permission to read this resource calendar.")

        try:
            events = build_calendar_view(
                user=request.user,
                scope=scope,
                start_at=payload["start_at"],
                end_at=payload["end_at"],
                event_id=payload.get("event_id"),
                resource_id=payload.get("resource_id"),
            )
        except Exception as exc:
            return self._error_response(exc)

        return Response({"results": events})
