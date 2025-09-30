from django.urls import path
from . import views

urlpatterns = [
    path('chats/', views.ChatRoomListCreateView.as_view(), name='chat-list-create'),
    path('chats/<int:pk>/', views.ChatRoomDetailView.as_view(), name='chat-detail'),
    path('chats/<int:chat_room_id>/messages/', views.MessageListView.as_view(), name='chat-messages'),
    path('chats/<int:chat_room_id>/read/', views.mark_messages_read, name='mark-messages-read'),
    path('chat/create/<str:username>/', views.create_private_chat, name='create-private-chat'),
]