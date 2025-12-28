from django.urls import path

from .views import (
    ChatAttachmentUploadView,
    ChatBidView,
    ChatMessageListCreateView,
    ChatRoomCreateView,
    ChatRoomListView,
)

urlpatterns = [
    path('rooms/', ChatRoomCreateView.as_view(), name='chatroom_create'),
    path('rooms/list/', ChatRoomListView.as_view(), name='chatroom_list'),
    path('rooms/<int:room_id>/messages/', ChatMessageListCreateView.as_view(), name='chatroom_messages'),
    path('rooms/<int:room_id>/attachments/', ChatAttachmentUploadView.as_view(), name='chatroom_attachment'),
    path('rooms/<int:room_id>/bids/', ChatBidView.as_view(), name='chatroom_bid'),
    path('rooms/<int:room_id>/bids/<int:bid_id>/', ChatBidView.as_view(), name='chatroom_bid_update'),
]