from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import AdminLog, SiteConfiguration
from apps.posts.models import Post, Comment, Like
from apps.stories.models import Story

User = get_user_model()


class AdminLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    target_username = serializers.CharField(source='target_user.username', read_only=True, allow_null=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    admin_details = serializers.SerializerMethodField()
    target_user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'admin', 'admin_username', 'admin_details', 'action', 
            'action_display', 'target_user', 'target_username', 
            'target_user_details', 'description', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_admin_details(self, obj):
        if obj.admin:
            return {
                'id': obj.admin.id,
                'username': obj.admin.username,
                'profile_picture': obj.admin.profile_picture.url if obj.admin.profile_picture else None,
            }
        return None
    
    def get_target_user_details(self, obj):
        if obj.target_user:
            return {
                'id': obj.target_user.id,
                'username': obj.target_user.username,
                'profile_picture': obj.target_user.profile_picture.url if obj.target_user.profile_picture else None,
            }
        return None


class SiteConfigurationSerializer(serializers.ModelSerializer):
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = SiteConfiguration
        fields = '__all__'
        read_only_fields = ['id', 'updated_at', 'updated_by']


class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer completo de usuario para administración"""
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'cover_picture', 'date_of_birth', 'location',
            'website', 'is_private', 'role', 'is_banned', 'ban_reason',
            'banned_at', 'is_active', 'created_at', 'updated_at', 'last_login',
            'followers_count', 'following_count', 'posts_count', 
            'comments_count', 'likes_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']
    
    def get_followers_count(self, obj):
        return obj.get_followers_count()
    
    def get_following_count(self, obj):
        return obj.get_following_count()
    
    def get_posts_count(self, obj):
        return Post.objects.filter(author=obj).count()
    
    def get_comments_count(self, obj):
        return Comment.objects.filter(author=obj).count()
    
    def get_likes_count(self, obj):
        return Like.objects.filter(user=obj).count()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del dashboard"""
    # Estadísticas generales
    total_users = serializers.IntegerField()
    total_posts = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    total_stories = serializers.IntegerField()
    
    # Usuarios
    active_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    new_users_week = serializers.IntegerField()
    new_users_month = serializers.IntegerField()
    banned_users = serializers.IntegerField()
    
    # Posts
    new_posts_today = serializers.IntegerField()
    new_posts_week = serializers.IntegerField()
    new_posts_month = serializers.IntegerField()
    
    # Actividad
    new_comments_today = serializers.IntegerField()
    new_likes_today = serializers.IntegerField()
    
    # Roles
    admin_count = serializers.IntegerField()
    moderator_count = serializers.IntegerField()
    user_count = serializers.IntegerField()


class UserStatsSerializer(serializers.Serializer):
    """Estadísticas de usuarios"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    inactive_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    banned_users = serializers.IntegerField()
    users_by_role = serializers.DictField()
    new_users_trend = serializers.ListField()


class ContentStatsSerializer(serializers.Serializer):
    """Estadísticas de contenido"""
    total_posts = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    total_stories = serializers.IntegerField()
    posts_per_day = serializers.ListField()
    top_posts = serializers.ListField()
    top_users = serializers.ListField()
