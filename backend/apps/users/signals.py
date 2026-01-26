from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.chat.models import ChatRoom

User = get_user_model()


@receiver(post_save, sender=User)
def user_profile_updated(sender, instance, created, **kwargs):
    """
    Señal que se ejecuta cuando se actualiza un usuario.
    Envía una notificación via WebSocket a todos los chats donde participa.
    """
    if not created:
        channel_layer = get_channel_layer()
        
        if channel_layer:
            profile_pic_url = None
            if instance.profile_picture:
                profile_pic_url = instance.profile_picture.url
            
            user_data = {
                'id': instance.id,
                'username': instance.username,
                'first_name': instance.first_name,
                'last_name': instance.last_name,
                'full_name': f"{instance.first_name} {instance.last_name}",
                'profile_picture': profile_pic_url
            }
            
            user_rooms = ChatRoom.objects.filter(
                participants=instance
            ).values_list('id', flat=True)
            
            for room_id in user_rooms:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{room_id}',
                    {
                        'type': 'profile_update',
                        'user_id': instance.id,
                        'user_data': user_data
                    }
                )