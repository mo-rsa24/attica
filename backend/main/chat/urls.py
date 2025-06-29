from django.urls import path
from .views import ChatRoomView

urlpatterns = [
    path('chatrooms/<int:room_id>/', ChatRoomView.as_view(), name='chatroom_detail'),
    path('messages/', ChatRoomView.as_view(), name='message_create'),
]
