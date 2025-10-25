from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Follow

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'cover_picture', 'date_of_birth', 'location',
            'website', 'is_private', 'followers_count', 'following_count',
            'is_following', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'followers_count', 'following_count', 'is_following']

    def get_followers_count(self, obj):
        return obj.get_followers_count()

    def get_following_count(self, obj):
        return obj.get_following_count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False


class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'cover_picture', 'date_of_birth', 'location',
            'website', 'is_private', 'followers_count', 'following_count'
        ]
        read_only_fields = ['id', 'username', 'followers_count', 'following_count']
    
    def get_followers_count(self, obj):
        return obj.get_followers_count()

    def get_following_count(self, obj):
        return obj.get_following_count()
    
    def validate_profile_picture(self, value):
        if value:
            # Validar tamaño (máximo 5MB)
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(
                    'La imagen es demasiado grande. Tamaño máximo: 5MB'
                )
            
            # Validar tipo
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Tipo de archivo no permitido. Solo JPEG, PNG y WebP'
                )
        return value
    
    def validate_cover_picture(self, value):
        if value:
            # Validar tamaño (máximo 10MB)
            max_size = 10 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(
                    'La imagen es demasiado grande. Tamaño máximo: 10MB'
                )
            
            # Validar tipo
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Tipo de archivo no permitido. Solo JPEG, PNG y WebP'
                )
        return value
    
    def validate_email(self, value):
        # Verificar que el email no esté en uso por otro usuario
        user = self.instance
        if user and User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError('Este email ya está en uso')
        return value


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']