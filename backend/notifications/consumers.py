import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer para notificaciones en tiempo real.
    Cada usuario tiene su propio grupo de notificaciones.
    """
    
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Grupo único para cada usuario
        self.notification_group_name = f'notifications_{self.user.id}'
        
        # Unirse al grupo de notificaciones
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Enviar mensaje de conexión establecida
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado al sistema de notificaciones',
            'user_id': self.user.id
        }))
        
        # Enviar notificaciones no leídas al conectarse
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))
    
    async def disconnect(self, close_code):
        # Salir del grupo solo si fue conectado exitosamente
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Manejar mensajes del cliente"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    success = await self.mark_notification_read(notification_id)
                    await self.send(text_data=json.dumps({
                        'type': 'notification_marked_read',
                        'notification_id': notification_id,
                        'success': success
                    }))
            
            elif message_type == 'mark_all_read':
                count = await self.mark_all_notifications_read()
                await self.send(text_data=json.dumps({
                    'type': 'all_notifications_marked_read',
                    'count': count
                }))
            
            elif message_type == 'get_notifications':
                notifications = await self.get_recent_notifications()
                await self.send(text_data=json.dumps({
                    'type': 'notifications_list',
                    'notifications': notifications
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Formato JSON inválido'
            }))
    
    async def new_notification(self, event):
        """Enviar nueva notificación al cliente"""
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))
    
    @database_sync_to_async
    def get_unread_count(self):
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_read(self):
        count = Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).update(is_read=True)
        return count
    
    @database_sync_to_async
    def get_recent_notifications(self):
        notifications = Notification.objects.filter(
            recipient=self.user
        ).order_by('-created_at')[:20]
        
        serializer = NotificationSerializer(notifications, many=True)
        return serializer.data
