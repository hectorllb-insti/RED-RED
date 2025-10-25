from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Story, StoryView

User = get_user_model()


class StorySerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_first_name = serializers.CharField(source='author.first_name', read_only=True)
    author_last_name = serializers.CharField(source='author.last_name', read_only=True)
    author_profile_picture = serializers.SerializerMethodField()
    views_count = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id', 'author', 'author_id', 'author_username', 'author_first_name',
            'author_last_name', 'author_profile_picture', 'content', 'image', 
            'video', 'background_color', 'created_at', 'expires_at', 
            'views_count', 'is_viewed'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'expires_at']

    def get_author_profile_picture(self, obj):
        if obj.author.profile_picture:
            return obj.author.profile_picture.url
        return None

    def get_views_count(self, obj):
        return obj.get_views_count()

    def get_is_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StoryView.objects.filter(user=request.user, story=obj).exists()
        return False


class StoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ['content', 'image', 'video', 'background_color']

    def validate_image(self, value):
        if value:
            # Validar tamaño (máximo 10MB)
            max_size = 10 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(
                    'El archivo es demasiado grande. Tamaño máximo: 10MB'
                )
            
            # Validar tipo
            allowed_types = [
                'image/jpeg',
                'image/png',
                'image/jpg',
                'image/webp'
            ]
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Tipo de archivo no permitido. Solo JPEG, PNG y WebP'
                )
        
        return value

    def validate_video(self, value):
        if value:
            # Validar tamaño (máximo 50MB para videos)
            max_size = 50 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError(
                    'El video es demasiado grande. Tamaño máximo: 50MB'
                )
            
            # Validar tipo
            allowed_types = [
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo'
            ]
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Tipo de video no permitido. Solo MP4, MOV y AVI'
                )
        
        return value

    def validate(self, data):
        # Al menos uno de: content, image o video debe estar presente
        if not data.get('content') and not data.get('image') and not data.get('video'):
            raise serializers.ValidationError(
                'Debes proporcionar contenido, imagen o video'
            )
        return data

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class StoryViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryView
        fields = ['id', 'user', 'story', 'viewed_at']
        read_only_fields = ['id', 'user', 'viewed_at']