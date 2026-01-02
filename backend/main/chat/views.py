from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatAttachment, ChatBid, ChatRoom, Message
from .serializers import ChatAttachmentSerializer, ChatBidSerializer, ChatRoomSerializer, MessageSerializer
from .utils import broadcast_room_event


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
        if not organizer_id or not vendor_id:
            return Response({"detail": "Organizer and vendor are required."}, status=status.HTTP_400_BAD_REQUEST)

        if str(request.user.id) not in {str(organizer_id), str(vendor_id)}:
            return Response({"detail": "You must be a participant to create a room."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.user_type == 'organizer' and str(request.user.id) != str(organizer_id):
            return Response({"detail": "Organizers may only initiate their own rooms."}, status=status.HTTP_403_FORBIDDEN)

        room, _ = ChatRoom.objects.get_or_create(organizer_id=organizer_id, vendor_id=vendor_id)
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