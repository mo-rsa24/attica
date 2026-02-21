from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    BookingViewSet,
    ChatAttachmentUploadView,
    ChatBidView,
    ChatMessageListCreateView,
    ChatRoomCreateView,
    ChatRoomDetailView,
    ChatRoomListView,
    ChatRoomWithUserView,
    ProviderAvailabilityView,
)

# Create router for booking viewset
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    # Chat room endpoints
    path('rooms/', ChatRoomCreateView.as_view(), name='chatroom_create'),
    path('rooms/with/<str:username>/', ChatRoomWithUserView.as_view(), name='chatroom_with_user'),
    path('rooms/list/', ChatRoomListView.as_view(), name='chatroom_list'),
    path('rooms/<int:room_id>/', ChatRoomDetailView.as_view(), name='chatroom_detail'),
    path('rooms/<int:room_id>/messages/', ChatMessageListCreateView.as_view(), name='chatroom_messages'),
    path('rooms/<int:room_id>/attachments/', ChatAttachmentUploadView.as_view(), name='chatroom_attachment'),
    path('rooms/<int:room_id>/bids/', ChatBidView.as_view(), name='chatroom_bid'),
    path('rooms/<int:room_id>/bids/<int:bid_id>/', ChatBidView.as_view(), name='chatroom_bid_update'),

    # Provider availability endpoints
    path('providers/<int:user_id>/availability/', ProviderAvailabilityView.as_view(), name='provider_availability'),

    # Include booking router
    path('', include(router.urls)),
]