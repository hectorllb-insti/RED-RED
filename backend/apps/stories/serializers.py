from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Story, StoryView

User = get_user_model()


class StorySerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    views_count = serializers.SerializerMethodField()
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id', 'author', 'content', 'image', 'video', 'background_color',
            'created_at', 'expires_at', 'views_count', 'is_viewed'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'expires_at']

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

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class StoryViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryView
        fields = ['id', 'user', 'story', 'viewed_at']
        read_only_fields = ['id', 'user', 'viewed_at']