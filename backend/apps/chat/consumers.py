import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Count
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
                    # Asegurar que message_content sea siempre una string y no un objeto
                    if isinstance(message_content, dict):
                        message_content = message_content.get('content', str(message_content))
                    elif not isinstance(message_content, str):
                        message_content = str(message_content)
                    
                    # Save message to database
                    message = await self.save_message(message_content, room_id)
                    
                    if message:
                        # Send message to room group only
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
            
            elif message_type == 'typing_start':
                room_id = text_data_json.get('room', self.current_room)
                if room_id:
                    await self.channel_layer.group_send(
                        f'chat_{room_id}',
                        {
                            'type': 'typing_start_handler',
                            'user': self.user.id,
                            'username': self.user.username,
                            'room': room_id
                        }
                    )
            
            elif message_type == 'typing_stop':
                room_id = text_data_json.get('room', self.current_room)
                if room_id:
                    await self.channel_layer.group_send(
                        f'chat_{room_id}',
                        {
                            'type': 'typing_stop_handler',
                            'user': self.user.id,
                            'username': self.user.username,
                            'room': room_id
                        }
                    )
            
            elif message_type == 'profile_updated':
                # Manejar actualización de perfil del usuario
                await self.broadcast_profile_update()
                    
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
    
    async def typing_start_handler(self, event):
        # No enviar el indicador al usuario que está escribiendo
        if event['user'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_start',
                'user': event['user'],
                'username': event['username'],
                'room': event['room']
            }))
    
    async def typing_stop_handler(self, event):
        # No enviar el indicador al usuario que dejó de escribir
        if event['user'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_stop',
                'user': event['user'],
                'username': event['username'],
                'room': event['room']
            }))

    async def profile_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'profile_updated',
            'user_id': event['user_id'],
            'user_data': event['user_data']
        }))

    async def broadcast_profile_update(self):
        # Obtener datos actualizados del usuario
        user_data = await self.get_user_data()
        
        # Obtener todas las salas donde participa el usuario
        user_rooms = await self.get_user_chat_rooms()
        
        # Enviar la actualización a todas las salas donde participa
        for room_id in user_rooms:
            await self.channel_layer.group_send(
                f'chat_{room_id}',
                {
                    'type': 'profile_update',
                    'user_id': self.user.id,
                    'user_data': user_data
                }
            )

    @database_sync_to_async
    def get_user_data(self):
        """Obtener datos actualizados del usuario para enviar via WebSocket"""
        try:
            user = User.objects.get(id=self.user.id)
            profile_pic_url = None
            if user.profile_picture:
                # Construir URL absoluta para la imagen de perfil
                profile_pic_url = user.profile_picture.url
            
            return {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}",
                'profile_picture': profile_pic_url
            }
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_user_chat_rooms(self):
        """Obtener IDs de todas las salas donde participa el usuario"""
        return list(
            ChatRoom.objects.filter(
                participants=self.user
            ).values_list('id', flat=True)
        )

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
                # Si el identificador es una cadena, puede ser un username
                # Intentamos reutilizar un chat privado entre ambos usuarios
                room_str = str(room_identifier)
                try:
                    other_user = User.objects.get(username=room_str)
                except User.DoesNotExist:
                    other_user = None

                if other_user:
                    # Buscar chat privado existente entre los dos usuarios
                    existing_chat = ChatRoom.objects.filter(
                        participants=self.user
                    ).filter(
                        participants=other_user
                    ).annotate(
                        participant_count=Count('participants')
                    ).filter(participant_count=2).first()

                    if existing_chat:
                        chat_room = existing_chat
                    else:
                        # Crear nuevo chat privado y asignar participantes
                        chat_room = ChatRoom.objects.create()
                        chat_room.participants.set([self.user, other_user])
                else:
                    # Si no es un username válido, crear una sala genérica
                    chat_room = ChatRoom.objects.create()
        except ChatRoom.DoesNotExist:
            # Crear nueva sala genérica si no se encontró por ID
            chat_room = ChatRoom.objects.create()
        
        if chat_room:
            message = Message.objects.create(
                chat_room=chat_room,
                sender=self.user,
                content=message_content
            )
            # Actualizar el timestamp del chat room para que aparezca como reciente
            chat_room.updated_at = message.created_at
            chat_room.save(update_fields=['updated_at'])
            return message
        return None