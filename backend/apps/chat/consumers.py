import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Obtener room_name de la URL, si no existe usar 'general'
        self.room_name = self.scope['url_route']['kwargs'].get('room_name', 'general')
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']
        self.current_room = None

        if not self.user.is_authenticated:
            await self.close()
            return

        await self.accept()
        
        # Enviar mensaje de bienvenida
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado al servidor de chat',
            'user': self.user.username
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')
            
            if message_type == 'join_room':
                # Manejar unión a sala
                room_id = text_data_json.get('room')
                if room_id:
                    # Salir de la sala actual si existe
                    if self.current_room:
                        await self.channel_layer.group_discard(
                            f'chat_{self.current_room}',
                            self.channel_name
                        )
                    
                    # Unirse a la nueva sala
                    self.current_room = room_id
                    await self.channel_layer.group_add(
                        f'chat_{room_id}',
                        self.channel_name
                    )
                    
                    await self.send(text_data=json.dumps({
                        'type': 'room_joined',
                        'room': room_id,
                        'message': f'Te has unido a la sala {room_id}'
                    }))
            
            elif message_type == 'send_message':
                message_content = text_data_json.get('message', '')
                room_id = text_data_json.get('room', self.current_room)
                
                if message_content and room_id:
                    # Save message to database
                    message = await self.save_message(message_content, room_id)
                    
                    # Send message to room group
                    await self.channel_layer.group_send(
                        f'chat_{room_id}',
                        {
                            'type': 'chat_message',
                            'message': {
                                'id': message.id,
                                'content': message_content,
                                'sender': self.user.id,
                                'sender_id': self.user.id,
                                'sender_username': self.user.username,
                                'timestamp': message.created_at.isoformat(),
                                'is_read': False,
                            },
                            'room': room_id
                        }
                    )
            
            elif message_type == 'typing':
                room_id = text_data_json.get('room', self.current_room)
                if room_id:
                    await self.channel_layer.group_send(
                        f'chat_{room_id}',
                        {
                            'type': 'typing_indicator',
                            'user': self.user.username,
                            'is_typing': text_data_json.get('is_typing', False),
                            'room': room_id
                        }
                    )
                    
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Formato de mensaje inválido'
            }))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'room': event.get('room', self.current_room)
        }))

    async def typing_indicator(self, event):
        # Don't send typing indicator to the sender
        if event['user'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user': event['user'],
                'is_typing': event['is_typing'],
            }))

    @database_sync_to_async
    def save_message(self, message_content, room_id=None):
        # Get or create chat room
        room_identifier = room_id or self.room_name
        try:
            # Intentar obtener por ID numérico
            if isinstance(room_identifier, int):
                chat_room = ChatRoom.objects.get(id=room_identifier)
            elif (isinstance(room_identifier, str) and
                  room_identifier.isdigit()):
                chat_room = ChatRoom.objects.get(id=int(room_identifier))
            else:
                # Crear una sala general si no es ID numérico
                chat_room, created = ChatRoom.objects.get_or_create(
                    name=str(room_identifier),
                    defaults={
                        'name': str(room_identifier),
                        'room_type': 'public'
                    }
                )
        except ChatRoom.DoesNotExist:
            # Crear nueva sala
            chat_room = ChatRoom.objects.create(
                name=room_identifier,
                room_type='public'
            )
        
        if chat_room:
            message = Message.objects.create(
                chat_room=chat_room,
                sender=self.user,
                content=message_content
            )
            return message
        return None