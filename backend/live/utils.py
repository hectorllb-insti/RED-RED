from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from notifications.models import Notification
from notifications.serializers import NotificationSerializer


def notify_followers_live_stream(live_stream):
    """
    Notificar a los seguidores cuando un usuario inicia un directo
    """
    from apps.users.models import Follow
    
    # Obtener todos los seguidores del streamer
    followers = Follow.objects.filter(
        following=live_stream.streamer
    ).select_related('follower')
    
    channel_layer = get_channel_layer()
    
    for follow in followers:
        # Crear notificación en la base de datos
        notification = Notification.objects.create(
            recipient=follow.follower,
            sender=live_stream.streamer,
            notification_type='live_stream',
            title='¡Nuevo directo!',
            message=f'{live_stream.streamer.first_name} ha iniciado una transmisión en vivo',
            related_live_stream_id=live_stream.id
        )
        
        # Enviar notificación en tiempo real vía WebSocket
        serializer = NotificationSerializer(notification)
        async_to_sync(channel_layer.group_send)(
            f'notifications_{follow.follower.id}',
            {
                'type': 'new_notification',
                'notification': serializer.data
            }
        )


def broadcast_stream_update(stream_id, update_type, data=None):
    """
    Transmitir actualizaciones del stream a todos los conectados
    """
    channel_layer = get_channel_layer()
    
    message = {
        'type': update_type,
    }
    
    if data:
        message.update(data)
    
    async_to_sync(channel_layer.group_send)(
        f'live_stream_{stream_id}',
        message
    )
