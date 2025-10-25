from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import ChatRoom, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(
        source='sender.username',
        read_only=True
    )
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id',
            'sender',
            'sender_id',
            'sender_username',
            'content',
            'image',
            'is_read',
            'timestamp',
            'created_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = serializers.StringRelatedField(many=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'participants',
            'last_message',
            'unread_count',
            'other_user',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(
                read_by__user=request.user
            ).count()
        return 0
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Para chats privados (2 participantes), obtener el otro usuario
            participants = obj.participants.all()
            if participants.count() == 2:
                other_user = participants.exclude(id=request.user.id).first()
                if other_user:
                    full_name = (
                        f"{other_user.first_name} {other_user.last_name}"
                    )
                    profile_pic = (
                        other_user.profile_picture.url
                        if other_user.profile_picture
                        else None
                    )
                    return {
                        'id': other_user.id,
                        'username': other_user.username,
                        'first_name': other_user.first_name,
                        'last_name': other_user.last_name,
                        'full_name': full_name,
                        'profile_picture': profile_pic
                    }
        return None


class CreateChatRoomSerializer(serializers.Serializer):
    participants = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        max_length=10
    )

    def validate_participants(self, value):
        # Verificar que todos los usernames existen
        users = User.objects.filter(username__in=value)
        if users.count() != len(value):
            raise serializers.ValidationError("Uno o más usuarios no existen.")
        return value

    def create(self, validated_data):
        request = self.context['request']
        participant_usernames = validated_data['participants']
        
        # Agregar el usuario actual a los participantes
        if request.user.username not in participant_usernames:
            participant_usernames.append(request.user.username)
        
        # Para chat privado (2 personas), verificar si ya existe
        if len(participant_usernames) == 2:
            users = User.objects.filter(username__in=participant_usernames)
            existing_room = ChatRoom.objects.filter(
                participants__in=users
            ).annotate(
                participant_count=models.Count('participants')
            ).filter(participant_count=2).first()
            
            if existing_room:
                return existing_room
        
        # Crear nuevo chat room
        users = User.objects.filter(username__in=participant_usernames)
        chat_room = ChatRoom.objects.create()
        chat_room.participants.set(users)
        
        return chat_room
