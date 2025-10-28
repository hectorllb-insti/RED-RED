from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Like, Comment, SharedPost

User = get_user_model()


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_id', 'author_username', 'author_profile_picture', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_profile_picture(self, obj):
        if obj.author.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile_picture.url)
            return obj.author.profile_picture.url
        return None


class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_first_name = serializers.CharField(source='author.first_name', read_only=True)
    author_last_name = serializers.CharField(source='author.last_name', read_only=True)
    author_profile_picture = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_id', 'author_username', 'author_first_name', 
            'author_last_name', 'author_profile_picture', 'content', 'image', 
            'created_at', 'updated_at', 'likes_count', 'comments_count', 
            'is_liked', 'comments'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_profile_picture(self, obj):
        if obj.author.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile_picture.url)
            return obj.author.profile_picture.url
        return None

    def get_likes_count(self, obj):
        return obj.get_likes_count()

    def get_comments_count(self, obj):
        return obj.get_comments_count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image']

    def validate_image(self, value):
        if value:
            # Validar tamaño de archivo (máximo 10MB)
            max_size = 10 * 1024 * 1024  # 10MB en bytes
            if value.size > max_size:
                raise serializers.ValidationError(
                    'El archivo es demasiado grande. Tamaño máximo: 10MB'
                )
            
            # Validar tipo de archivo
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Tipo de archivo no permitido. Solo JPEG, PNG y WebP'
                )
        
        return value

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class SharedPostSerializer(serializers.ModelSerializer):
    shared_by_username = serializers.CharField(source='shared_by.username', read_only=True)
    shared_with_username = serializers.CharField(source='shared_with.username', read_only=True, allow_null=True)
    original_post = PostSerializer(read_only=True)
    
    class Meta:
        model = SharedPost
        fields = [
            'id', 'shared_by', 'shared_by_username', 'shared_with', 
            'shared_with_username', 'original_post', 'message', 'created_at'
        ]
        read_only_fields = ['id', 'shared_by', 'created_at']


class SharePostSerializer(serializers.Serializer):
    """Serializer para compartir una publicación"""
    shared_with_username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_shared_with_username(self, value):
        if value:
            try:
                User.objects.get(username=value)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"El usuario '{value}' no existe")
        return value