from django.db import models, transaction, IntegrityError
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .models import Booking, ChatAttachment, ChatBid, ChatRoom, Message, ProviderAvailability
from .serializers import (
    BookingSerializer,
    ChatAttachmentSerializer,
    ChatBidSerializer,
    ChatRoomSerializer,
    MessageSerializer,
    ProviderAvailabilitySerializer,
)
from .utils import broadcast_room_event
from notifications.utils import notify_new_message, notify_new_bid, notify_bid_response


User = get_user_model()


class IsAuthenticatedUser(permissions.IsAuthenticated):
    """
    Explicit authentication requirement to ensure JWT/Session compatibility.
    """


class ChatRoomCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        organizer_id = request.data.get('organizer')
        vendor_id = request.data.get('vendor')
        event_id = request.data.get('event')  # Optional event context

        if not organizer_id or not vendor_id:
            return Response({"detail": "Organizer and vendor are required."}, status=status.HTTP_400_BAD_REQUEST)

        if str(request.user.id) not in {str(organizer_id), str(vendor_id)}:
            return Response({"detail": "You must be a participant to create a room."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.user_type == 'organizer' and str(request.user.id) != str(organizer_id):
            return Response({"detail": "Organizers may only initiate their own rooms."}, status=status.HTTP_403_FORBIDDEN)

        # Validate event ownership if event_id provided
        if event_id:
            from events.models import Event
            try:
                event = Event.objects.get(id=event_id)
                if event.organizer_id != int(organizer_id) and event.user_id != int(organizer_id):
                    return Response(
                        {"detail": "Event does not belong to the organizer."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Event.DoesNotExist:
                return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        room, _ = ChatRoom.objects.get_or_create(
            organizer_id=organizer_id,
            vendor_id=vendor_id,
            event_id=event_id
        )
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ChatRoomWithUserView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request, username: str):
        target = get_object_or_404(User, username=username)
        if target.id == request.user.id:
            return Response({"detail": "Cannot create a room with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        organizer_id, vendor_id = self._resolve_participants(request.user, target)
        room, _ = ChatRoom.objects.get_or_create(organizer_id=organizer_id, vendor_id=vendor_id)
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def _resolve_participants(request_user: User, target: User):
        """Return an (organizer_id, vendor_id) tuple for the room."""
        if request_user.user_type == 'vendor' and target.user_type != 'vendor':
            return target.id, request_user.id
        if target.user_type == 'vendor' and request_user.user_type != 'vendor':
            return request_user.id, target.id
        # fallback: use the requesting user as organizer for deterministic pairing
        return request_user.id, target.id


class ChatRoomListView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request):
        qs = ChatRoom.objects.filter(models.Q(organizer=request.user) | models.Q(vendor=request.user)).order_by('-updated_at')
        serializer = ChatRoomSerializer(qs, many=True)
        return Response(serializer.data)

class ChatRoomDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)


class ChatMessageListCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        messages = room.messages.select_related('sender').prefetch_related('attachments').order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        payload = request.data.copy()
        payload['room'] = room.id
        payload['sender'] = request.user.id
        serializer = MessageSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        Message.objects.filter(id=message.id).update(delivered_at=timezone.now())
        message.refresh_from_db()
        ChatRoom.objects.filter(id=room.id).update(updated_at=message.created_at)
        serialized = MessageSerializer(message).data
        broadcast_room_event(room.id, {"type": "message", "message": serialized})
        # Send notification to the other participant
        notify_new_message(room, request.user, message.text or '')
        return Response(serialized, status=status.HTTP_201_CREATED)


class ChatAttachmentUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticatedUser]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"detail": "File required."}, status=status.HTTP_400_BAD_REQUEST)
        attachment = ChatAttachment.objects.create(
            file=uploaded_file,
            uploaded_by=request.user,
            room=room,
            original_name=uploaded_file.name,
            size=uploaded_file.size,
        )
        return Response(ChatAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)


class ChatBidView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user != room.organizer:
            return Response({"detail": "Only organizers can initiate bids."}, status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        data.update({
            "room": room.id,
            "organizer": room.organizer_id,
            "vendor": room.vendor_id,
        })
        existing = ChatBid.objects.filter(
            organizer=room.organizer,
            vendor=room.vendor,
            idempotency_key=data.get('idempotency_key')
        ).first()
        if existing:
            return Response(ChatBidSerializer(existing).data, status=status.HTTP_200_OK)
        serializer = ChatBidSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        bid = serializer.save()
        self._record_bid_message(room, request.user, bid)
        # Notify vendor of new bid
        notify_new_bid(room, bid)
        return Response(ChatBidSerializer(bid).data, status=status.HTTP_201_CREATED)

    def patch(self, request, room_id, bid_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        bid = get_object_or_404(ChatBid, id=bid_id, room=room)
        acting_user = request.user
        updates = {}

        with transaction.atomic():
            if 'accept' in request.data and acting_user == room.vendor:
                bid.status = ChatBid.Status.ACCEPTED
            elif 'decline' in request.data and acting_user == room.vendor:
                bid.status = ChatBid.Status.DECLINED
            elif 'counter_amount' in request.data and acting_user == room.vendor:
                bid.status = ChatBid.Status.COUNTERED
                bid.counter_amount = request.data.get('counter_amount')
            else:
                return Response({"detail": "Invalid action or permissions."}, status=status.HTTP_400_BAD_REQUEST)
            bid.save()
            updates = ChatBidSerializer(bid).data
            self._record_bid_message(room, acting_user, bid, action=request.data)
            # Notify organizer of bid response
            notify_bid_response(room, bid, bid.status)
        return Response(updates, status=status.HTTP_200_OK)

    @staticmethod
    def _record_bid_message(room, sender, bid, action=None):
        message_text = f"Bid {bid.status}"
        if action and 'counter_amount' in action:
            message_text = f"Bid countered to {action.get('counter_amount')}"
        message = Message.objects.create(
            room=room,
            sender=sender,
            text=message_text,
            message_type=Message.MessageType.BID,
            bid=bid,
        )
        broadcast_room_event(room.id, {"type": "bid", "message": MessageSerializer(message).data,
                                       "bid": ChatBidSerializer(bid).data})


class BookingViewSet(ModelViewSet):
    """
    ViewSet for managing bookings between event organizers and providers.

    Handles the full booking lifecycle:
    - Organizer creates booking (DRAFT)
    - Organizer sends bid -> booking becomes PENDING
    - Provider accepts/rejects -> booking becomes SUCCESSFUL/REJECTED
    """
    permission_classes = [IsAuthenticatedUser]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.filter(
            models.Q(organizer=user) | models.Q(provider=user)
        ).select_related('event', 'organizer', 'provider', 'chatroom')

        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by event if provided
        event_id = self.request.query_params.get('event')
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        # Filter by provider_type if provided
        provider_type = self.request.query_params.get('provider_type')
        if provider_type:
            queryset = queryset.filter(provider_type=provider_type)

        # Filter by role (as_organizer or as_provider)
        role = self.request.query_params.get('role')
        if role == 'organizer':
            queryset = queryset.filter(organizer=user)
        elif role == 'provider':
            queryset = queryset.filter(provider=user)

        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """
        Create a new booking.

        If bid_amount is provided, the booking is created in PENDING status.
        Otherwise, it's created in DRAFT status.
        """
        data = request.data.copy()
        data['organizer'] = request.user.id

        # Validate that user owns the event
        event_id = data.get('event')
        if event_id:
            from events.models import Event
            event = get_object_or_404(Event, id=event_id)
            if event.organizer != request.user and event.user != request.user:
                return Response(
                    {"detail": "You don't have permission to create bookings for this event."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Check provider availability if proposed_date is provided
        provider_id = data.get('provider')
        proposed_date = data.get('proposed_date')
        if provider_id and proposed_date:
            conflict = ProviderAvailability.objects.filter(
                provider_id=provider_id,
                date=proposed_date
            ).exists()
            if conflict:
                # Include warning but still allow draft creation
                data['_availability_warning'] = True

        # Determine initial status
        if data.get('bid_amount'):
            data['status'] = Booking.Status.PENDING
        else:
            data['status'] = Booking.Status.DRAFT

        # Get or create chatroom if not provided
        chatroom_id = data.get('chatroom')
        if not chatroom_id and provider_id and event_id:
            room, _ = ChatRoom.objects.get_or_create(
                organizer=request.user,
                vendor_id=provider_id,
                event_id=event_id
            )
            data['chatroom'] = room.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        try:
            booking = serializer.save(organizer=request.user)
        except IntegrityError:
            return Response(
                {"detail": "A booking already exists for this event and provider."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If status is PENDING, create a system message and notify provider
        if booking.status == Booking.Status.PENDING and booking.chatroom:
            self._record_booking_message(
                booking.chatroom,
                request.user,
                booking,
                f"Booking request sent: {booking.currency} {booking.bid_amount}"
            )
            # Import here to avoid circular imports
            from notifications.utils import notify_booking_request
            try:
                notify_booking_request(booking)
            except Exception:
                pass  # Don't fail if notification fails

        response_data = BookingSerializer(booking).data
        if data.get('_availability_warning'):
            response_data['availability_warning'] = "Provider may not be available on this date."

        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update booking details. Only organizer can update."""
        booking = self.get_object()
        if request.user != booking.organizer:
            return Response(
                {"detail": "Only the organizer can update booking details."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent updating accepted/rejected bookings
        if booking.status in [Booking.Status.SUCCESSFUL, Booking.Status.REJECTED]:
            return Response(
                {"detail": "Cannot update a finalized booking."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def send_bid(self, request, pk=None):
        """
        Send a bid for a draft booking, transitioning it to PENDING status.
        """
        booking = self.get_object()

        if request.user != booking.organizer:
            return Response(
                {"detail": "Only the organizer can send a bid."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status != Booking.Status.DRAFT:
            return Response(
                {"detail": "Can only send bid for draft bookings."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bid_amount = request.data.get('bid_amount')
        if not bid_amount:
            return Response(
                {"detail": "bid_amount is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            booking.bid_amount = bid_amount
            booking.notes = request.data.get('notes', booking.notes)
            booking.proposed_date = request.data.get('proposed_date', booking.proposed_date)
            booking.status = Booking.Status.PENDING
            booking.save()

            if booking.chatroom:
                self._record_booking_message(
                    booking.chatroom,
                    request.user,
                    booking,
                    f"Booking request sent: {booking.currency} {booking.bid_amount}"
                )

            # Notify provider
            from notifications.utils import notify_booking_request
            try:
                notify_booking_request(booking)
            except Exception:
                pass

        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Provider accepts the booking, transitioning it to SUCCESSFUL status.
        Also blocks the provider's calendar for the booking date.
        """
        booking = self.get_object()

        if request.user != booking.provider:
            return Response(
                {"detail": "Only the provider can accept a booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Can only accept pending bookings."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for date conflicts
        if booking.proposed_date:
            conflict = ProviderAvailability.objects.filter(
                provider=booking.provider,
                date=booking.proposed_date
            ).exclude(booking=booking).exists()

            if conflict:
                return Response(
                    {"detail": "You already have a booking on this date."},
                    status=status.HTTP_409_CONFLICT
                )

        with transaction.atomic():
            booking.status = Booking.Status.SUCCESSFUL
            booking.final_amount = booking.bid_amount
            booking.save()

            # Block the date in provider's availability
            if booking.proposed_date:
                ProviderAvailability.objects.get_or_create(
                    provider=booking.provider,
                    date=booking.proposed_date,
                    defaults={'booking': booking}
                )

            if booking.chatroom:
                self._record_booking_message(
                    booking.chatroom,
                    request.user,
                    booking,
                    f"Booking accepted! Final amount: {booking.currency} {booking.final_amount}"
                )

            # Notify organizer
            from notifications.utils import notify_booking_accepted
            try:
                notify_booking_accepted(booking)
            except Exception:
                pass

        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Provider rejects the booking, transitioning it to REJECTED status.
        """
        booking = self.get_object()

        if request.user != booking.provider:
            return Response(
                {"detail": "Only the provider can reject a booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Can only reject pending bookings."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            booking.status = Booking.Status.REJECTED
            booking.save()

            reason = request.data.get('reason', 'No reason provided')
            if booking.chatroom:
                self._record_booking_message(
                    booking.chatroom,
                    request.user,
                    booking,
                    f"Booking declined. Reason: {reason}"
                )

            # Notify organizer
            from notifications.utils import notify_booking_rejected
            try:
                notify_booking_rejected(booking)
            except Exception:
                pass

        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Organizer cancels the booking, transitioning it to CANCELLED status.
        """
        booking = self.get_object()

        if request.user != booking.organizer:
            return Response(
                {"detail": "Only the organizer can cancel a booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.status == Booking.Status.SUCCESSFUL:
            # Remove availability block if cancelling a successful booking
            ProviderAvailability.objects.filter(booking=booking).delete()

        booking.status = Booking.Status.CANCELLED
        booking.save()

        if booking.chatroom:
            self._record_booking_message(
                booking.chatroom,
                request.user,
                booking,
                "Booking cancelled by organizer."
            )

        return Response(BookingSerializer(booking).data)

    @staticmethod
    def _record_booking_message(room, sender, booking, text):
        """Create a system message for booking status changes."""
        message = Message.objects.create(
            room=room,
            sender=sender,
            text=text,
            message_type=Message.MessageType.SYSTEM,
        )
        broadcast_room_event(room.id, {
            "type": "booking",
            "message": MessageSerializer(message).data,
            "booking": BookingSerializer(booking).data
        })


class ProviderAvailabilityView(APIView):
    """
    View for checking and listing provider availability.
    """
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, user_id):
        """Get blocked dates for a provider."""
        blocked = ProviderAvailability.objects.filter(
            provider_id=user_id
        ).select_related('booking__event').order_by('date')

        serializer = ProviderAvailabilitySerializer(blocked, many=True)
        return Response(serializer.data)

    def post(self, request, user_id):
        """Check if a specific date is available for a provider."""
        date = request.data.get('date')
        if not date:
            return Response(
                {"detail": "date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_blocked = ProviderAvailability.objects.filter(
            provider_id=user_id,
            date=date
        ).exists()

        return Response({
            "date": date,
            "available": not is_blocked,
            "provider_id": user_id
        })