from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import ChatRoom, Message, MessageRead
from .serializers import (
    ChatRoomSerializer,
    MessageSerializer,
    CreateChatRoomSerializer
)

User = get_user_model()


class MessagePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChatRoomListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateChatRoomSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).order_by('-updated_at')


class ChatRoomDetailView(generics.RetrieveAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        chat_room_id = self.kwargs['chat_room_id']
        chat_room = get_object_or_404(
            ChatRoom, 
            id=chat_room_id, 
            participants=self.request.user
        )
        # Ordenar mensajes del más reciente al más antiguo
        return Message.objects.filter(
            chat_room=chat_room
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, chat_room_id):
    chat_room = get_object_or_404(
        ChatRoom, 
        id=chat_room_id, 
        participants=request.user
    )
    
    # Marcar todos los mensajes no leídos como leídos
    unread_messages = Message.objects.filter(
        chat_room=chat_room
    ).exclude(
        read_by__user=request.user
    )
    
    for message in unread_messages:
        MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
    
    return Response({
        'message': f'{unread_messages.count()} mensajes marcados como leídos'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_private_chat(request, username):
    other_user = get_object_or_404(User, username=username)
    
    if other_user == request.user:
        return Response(
            {'error': 'No puedes crear un chat contigo mismo'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Buscar chat existente entre estos dos usuarios
    existing_chat = ChatRoom.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).annotate(
        participant_count=Count('participants')
    ).filter(
        participant_count=2
    ).first()
    
    if existing_chat:
        serializer = ChatRoomSerializer(
            existing_chat,
            context={'request': request}
        )
        return Response(serializer.data)
    
    # Crear nuevo chat
    chat_room = ChatRoom.objects.create()
    chat_room.participants.set([request.user, other_user])
    
    serializer = ChatRoomSerializer(chat_room, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)
