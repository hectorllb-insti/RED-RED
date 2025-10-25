from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from apps.posts.models import Like, Comment, SharedPost
from apps.users.models import Follow
from notifications.models import Notification
from notifications.serializers import NotificationSerializer

User = get_user_model()
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


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    """Crear notificación cuando alguien da like a un post"""
    if created:
        # No notificar si el usuario le da like a su propio post
        if instance.post.author != instance.user:
            notification = Notification.objects.create(
                recipient=instance.post.author,
                sender=instance.user,
                notification_type='like',
                title='Nuevo like',
                message=f'{instance.user.username} le gustó tu publicación',
                related_post_id=instance.post.id
            )
            # Enviar por WebSocket
            send_notification_to_websocket(notification)


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """Crear notificación cuando alguien comenta un post"""
    if created:
        # No notificar si el usuario comenta su propio post
        if instance.post.author != instance.author:
            notification = Notification.objects.create(
                recipient=instance.post.author,
                sender=instance.author,
                notification_type='comment',
                title='Nuevo comentario',
                message=f'{instance.author.username} comentó tu publicación: "{instance.content[:50]}"',
                related_post_id=instance.post.id,
                related_comment_id=instance.id
            )
            # Enviar por WebSocket
            send_notification_to_websocket(notification)


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    """Crear notificación cuando alguien te sigue"""
    if created:
        notification = Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            title='Nuevo seguidor',
            message=f'{instance.follower.username} comenzó a seguirte'
        )
        # Enviar por WebSocket
        send_notification_to_websocket(notification)


@receiver(post_save, sender=SharedPost)
def create_share_notification(sender, instance, created, **kwargs):
    """Crear notificación cuando alguien comparte un post"""
    if created:
        # Notificar al autor original del post
        if instance.original_post.author != instance.shared_by:
            notification = Notification.objects.create(
                recipient=instance.original_post.author,
                sender=instance.shared_by,
                notification_type='post',
                title='Compartieron tu publicación',
                message=f'{instance.shared_by.username} compartió tu publicación',
                related_post_id=instance.original_post.id
            )
            # Enviar por WebSocket
            send_notification_to_websocket(notification)
        
        # Si se compartió con un usuario específico, notificarle también
        if instance.shared_with and instance.shared_with != instance.shared_by:
            message_text = instance.message or 'una publicación'
            notification = Notification.objects.create(
                recipient=instance.shared_with,
                sender=instance.shared_by,
                notification_type='post',
                title='Te compartieron una publicación',
                message=f'{instance.shared_by.username} compartió contigo: "{message_text[:50]}"',
                related_post_id=instance.original_post.id
            )
            # Enviar por WebSocket
            send_notification_to_websocket(notification)
