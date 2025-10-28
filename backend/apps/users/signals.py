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
    if not created:  # Solo para actualizaciones, no para creación
        print(f"🔔 Signal activado: Usuario {instance.username} (ID: {instance.id}) actualizado")
        
        # Obtener el channel layer
        channel_layer = get_channel_layer()
        
        if channel_layer:
            # Obtener datos del usuario para enviar
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
            
            print(f"📸 Datos del usuario para WebSocket: {user_data}")
            
            # Obtener todas las salas donde participa el usuario
            user_rooms = ChatRoom.objects.filter(
                participants=instance
            ).values_list('id', flat=True)
            
            print(f"🏠 Salas del usuario: {list(user_rooms)}")
            
            # Enviar la actualización a todas las salas
            for room_id in user_rooms:
                print(f"📡 Enviando actualización a sala {room_id}")
                async_to_sync(channel_layer.group_send)(
                    f'chat_{room_id}',
                    {
                        'type': 'profile_update',
                        'user_id': instance.id,
                        'user_data': user_data
                    }
                )
                print(f"✅ Actualización enviada a sala {room_id}")
        else:
            print("❌ Channel layer no disponible")