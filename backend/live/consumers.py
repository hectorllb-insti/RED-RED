import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import LiveStream, LiveStreamComment, StreamModerator, StreamVIP
from .serializers import LiveStreamCommentSerializer

User = get_user_model()


class LiveStreamConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer para transmisiones en vivo.
    Maneja la señalización WebRTC y los comentarios en tiempo real.
    """
    
    # Diccionario para trackear viewers conectados por stream
    connected_viewers = {}
    
    async def connect(self):
        self.user = self.scope['user']
        self.stream_id = self.scope['url_route']['kwargs']['stream_id']
        self.room_group_name = f'live_stream_{self.stream_id}'
        
        # Aceptar la conexión primero para poder enviar mensajes de error si es necesario
        await self.accept()
        
        if not self.user.is_authenticated:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Autenticación requerida'
            }))
            await self.close()
            return
        
        # Verificar que el stream existe
        stream_exists = await self.check_stream_exists()
        if not stream_exists:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'La transmisión no existe'
            }))
            await self.close()
            return
        
        # Unirse al grupo del stream
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Incrementar contador de espectadores
        is_streamer = await self.is_user_streamer()
        if not is_streamer:
            await self.increment_viewers()
            # Añadir viewer a la lista de conectados
            if self.stream_id not in self.connected_viewers:
                self.connected_viewers[self.stream_id] = set()
            self.connected_viewers[self.stream_id].add(self.user.username)
        
        # Notificar a todos sobre el nuevo espectador
        viewers_count = await self.get_viewers_count()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'viewers_update',
                'count': viewers_count
            }
        )
        
        # Enviar lista de viewers al streamer
        if is_streamer and self.stream_id in self.connected_viewers:
            await self.send(text_data=json.dumps({
                'type': 'viewers_list',
                'viewers': list(self.connected_viewers[self.stream_id])
            }))
 
        # Notificar que un usuario se unió (para WebRTC)
        if not is_streamer:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            )
            # Broadcast actualización de lista de viewers
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'viewers_list_update',
                    'viewers': list(self.connected_viewers[self.stream_id])
                }
            )
        
        # Enviar mensaje de bienvenida
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado al stream',
            'stream_id': self.stream_id,
            'is_streamer': is_streamer,
            'user_id': self.user.id
        }))
    
    async def disconnect(self, close_code):
        # Decrementar contador de espectadores
        is_streamer = await self.is_user_streamer()
        if not is_streamer:
            await self.decrement_viewers()
            # Remover viewer de la lista
            if self.stream_id in self.connected_viewers:
                self.connected_viewers[self.stream_id].discard(self.user.username)
                # Broadcast actualización de lista
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'viewers_list_update',
                        'viewers': list(self.connected_viewers[self.stream_id])
                    }
                )
        
        # Notificar sobre la actualización de espectadores
        viewers_count = await self.get_viewers_count()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'viewers_update',
                'count': viewers_count
            }
        )

        # Notificar que un usuario salió
        if not is_streamer:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id
                }
            )
        
        # Salir del grupo
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Manejar mensajes del cliente"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'comment':
                # Guardar y transmitir comentario
                content = data.get('content', '').strip()
                if content:
                    # Verificar si es un comando
                    if content.startswith('/'):
                        await self.handle_command(content)
                    else:
                        # Comentario normal
                        comment_data = await self.save_comment(content)
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'new_comment',
                                'comment': comment_data
                            }
                        )
            
            elif message_type == 'request_offer':
                # Un espectador solicita una oferta al streamer
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'request_offer',
                        'from_user': self.user.id
                    }
                )

            elif message_type == 'webrtc_offer':
                # Transmitir oferta WebRTC
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'webrtc_offer',
                        'offer': data.get('offer'),
                        'from_user': self.user.id,
                        'target_user': data.get('target_user')
                    }
                )
            
            elif message_type == 'webrtc_answer':
                # Transmitir respuesta WebRTC
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'webrtc_answer',
                        'answer': data.get('answer'),
                        'from_user': self.user.id,
                        'target_user': data.get('target_user')
                    }
                )
            
            elif message_type == 'webrtc_ice_candidate':
                # Transmitir candidato ICE
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'webrtc_ice_candidate',
                        'candidate': data.get('candidate'),
                        'from_user': self.user.id,
                        'target_user': data.get('target_user')
                    }
                )
            
            elif message_type == 'stream_ended':
                # El streamer finalizó la transmisión
                is_streamer = await self.is_user_streamer()
                if is_streamer:
                    await self.end_stream()
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'stream_ended',
                            'message': 'La transmisión ha finalizado'
                        }
                    )
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Formato JSON inválido'
            }))
    
    # Handlers para mensajes del grupo
    async def new_comment(self, event):
        """Enviar nuevo comentario a todos los clientes"""
        await self.send(text_data=json.dumps({
            'type': 'new_comment',
            'comment': event['comment']
        }))
    
    async def viewers_update(self, event):
        """Enviar actualización de espectadores"""
        await self.send(text_data=json.dumps({
            'type': 'viewers_update',
            'count': event['count']
        }))

    async def user_joined(self, event):
        """Notificar que un usuario se unió"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def user_left(self, event):
        """Notificar que un usuario salió"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id']
        }))

    async def request_offer(self, event):
        """Notificar solicitud de oferta"""
        await self.send(text_data=json.dumps({
            'type': 'request_offer',
            'from_user': event['from_user']
        }))
    
    async def webrtc_offer(self, event):
        """Enviar oferta WebRTC"""
        await self.send(text_data=json.dumps({
            'type': 'webrtc_offer',
            'offer': event['offer'],
            'from_user': event['from_user'],
            'target_user': event.get('target_user')
        }))
    
    async def webrtc_answer(self, event):
        """Enviar respuesta WebRTC"""
        await self.send(text_data=json.dumps({
            'type': 'webrtc_answer',
            'answer': event['answer'],
            'from_user': event['from_user'],
            'target_user': event.get('target_user')
        }))
    
    async def webrtc_ice_candidate(self, event):
        """Enviar candidato ICE"""
        await self.send(text_data=json.dumps({
            'type': 'webrtc_ice_candidate',
            'candidate': event['candidate'],
            'from_user': event['from_user'],
            'target_user': event.get('target_user')
        }))
    
    async def stream_ended(self, event):
        """Notificar que el stream ha finalizado"""
        await self.send(text_data=json.dumps({
            'type': 'stream_ended',
            'message': event['message']
        }))

    async def stream_started(self, event):
        """Notificar que el stream ha iniciado"""
        await self.send(text_data=json.dumps({
            'type': 'stream_started',
            'message': 'La transmisión ha comenzado'
        }))
    
    async def viewers_list_update(self, event):
        """Enviar lista actualizada de viewers"""
        await self.send(text_data=json.dumps({
            'type': 'viewers_list',
            'viewers': event['viewers']
        }))
    
    async def user_kicked(self, event):
        """Notificar que un usuario fue expulsado"""
        if event['user_id'] == self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'kicked',
                'message': 'Has sido expulsado del stream'
            }))
            await self.close()
    
    # Manejo de comandos
    async def handle_command(self, content):
        """Procesar comandos de chat"""
        parts = content.split()
        command = parts[0].lower()
        
        is_streamer = await self.is_user_streamer()
        is_mod = await self.is_user_moderator()
        
        if len(parts) >= 2:
            target_username = parts[1].lstrip('@')
            
            # PROTECCIÓN SUPREMA AL STREAMER
            if await self.is_username_streamer(target_username):
                await self.send(text_data=json.dumps({
                    'type': 'system_message',
                    'message': '⛔ No puedes realizar acciones contra el Streamer.'
                }))
                return

            if command == '/mod' and is_streamer:
                success = await self.add_moderator(target_username)
                if success:
                    await self.send(text_data=json.dumps({
                        'type': 'system_message',
                        'message': f'🛡️ {target_username} ahora es moderador'
                    }))
            
            elif command == '/vip' and is_streamer:
                success = await self.add_vip(target_username)
                if success:
                    await self.send(text_data=json.dumps({
                        'type': 'system_message',
                        'message': f'💎 {target_username} ahora es VIP'
                    }))
            
            elif command == '/kick' and (is_streamer or is_mod):
                # Protección adicional: Mods no pueden kickear a otros Mods
                if await self.is_username_moderator(target_username) and not is_streamer:
                     await self.send(text_data=json.dumps({
                        'type': 'system_message',
                        'message': '⛔ No puedes expulsar a un moderador.'
                    }))
                     return

                user_id = await self.get_user_id_by_username(target_username)
                if user_id:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'user_kicked',
                            'user_id': user_id,
                            'username': target_username
                        }
                    )
                    # Mensaje público de kick
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'system_message',
                            'message': f'👢 {target_username} ha sido expulsado.'
                        }
                    )
    
    # Métodos de base de datos
    @database_sync_to_async
    def check_stream_exists(self):
        return LiveStream.objects.filter(id=self.stream_id).exists()
    
    @database_sync_to_async
    def is_user_streamer(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return stream.streamer.id == self.user.id
        except LiveStream.DoesNotExist:
            return False

    @database_sync_to_async
    def is_username_streamer(self, username):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return stream.streamer.username == username
        except LiveStream.DoesNotExist:
            return False
            
    @database_sync_to_async
    def is_username_moderator(self, username):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return StreamModerator.objects.filter(live_stream=stream, user__username=username).exists()
        except (LiveStream.DoesNotExist, User.DoesNotExist):
            return False
    
    @database_sync_to_async
    def increment_viewers(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            stream.update_viewers(stream.viewers_count + 1)
        except LiveStream.DoesNotExist:
            pass
    
    @database_sync_to_async
    def decrement_viewers(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            new_count = max(0, stream.viewers_count - 1)
            stream.update_viewers(new_count)
        except LiveStream.DoesNotExist:
            pass
    
    @database_sync_to_async
    def get_viewers_count(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return stream.viewers_count
        except LiveStream.DoesNotExist:
            return 0
    
    @database_sync_to_async
    def save_comment(self, content):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            comment = LiveStreamComment.objects.create(
                live_stream=stream,
                user=self.user,
                content=content
            )
            serializer = LiveStreamCommentSerializer(comment)
            return serializer.data
        except LiveStream.DoesNotExist:
            return None
    
    @database_sync_to_async
    def end_stream(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            stream.end_stream()
        except LiveStream.DoesNotExist:
            pass
    
    @database_sync_to_async
    def is_user_moderator(self):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            return StreamModerator.objects.filter(live_stream=stream, user=self.user).exists()
        except LiveStream.DoesNotExist:
            return False
    
    @database_sync_to_async
    def add_moderator(self, username):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            target_user = User.objects.get(username=username)
            StreamModerator.objects.get_or_create(live_stream=stream, user=target_user)
            return True
        except (LiveStream.DoesNotExist, User.DoesNotExist):
            return False
    
    @database_sync_to_async
    def add_vip(self, username):
        try:
            stream = LiveStream.objects.get(id=self.stream_id)
            target_user = User.objects.get(username=username)
            StreamVIP.objects.get_or_create(live_stream=stream, user=target_user)
            return True
        except (LiveStream.DoesNotExist, User.DoesNotExist):
            return False
    
    @database_sync_to_async
    def get_user_id_by_username(self, username):
        try:
            user = User.objects.get(username=username)
            return user.id
        except User.DoesNotExist:
            return None

