from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Message
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

channel_layer = get_channel_layer()


def send_notification_to_websocket(notification):
    """Enviar notificación por WebSocket en tiempo real"""
    if channel_layer:
        serializer = NotificationSerializer(notification)
        group_name = f'notifications_{notification.recipient.id}'
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'new_notification',
                'notification': serializer.data
            }
        )


@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """Crear notificación cuando alguien te envía un mensaje"""
    if created:
        # Obtener el destinatario (el otro participante del chat)
        chat_participants = instance.chat_room.participants.exclude(id=instance.sender.id)
        
        # Notificar a cada destinatario del mensaje
        for recipient in chat_participants:
            # Truncar el mensaje si es muy largo
            message_preview = instance.content[:50]
            if len(instance.content) > 50:
                message_preview += "..."
            
            notification = Notification.objects.create(
                recipient=recipient,
                sender=instance.sender,
                notification_type='message',
                title='Nuevo mensaje',
                message=f'{instance.sender.username}: {message_preview}'
            )
            
            # Enviar notificación por WebSocket
            send_notification_to_websocket(notification)
            
            # Enviar señal al WebSocket de chat para actualizar conversaciones
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_updates_{recipient.id}',
                    {
                        'type': 'conversation_update',
                        'action': 'new_message',
                        'chat_room_id': instance.chat_room.id,
                        'sender_id': instance.sender.id,
                        'sender_username': instance.sender.username
                    }
                )
