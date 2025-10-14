from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read',
            'created_at', 'updated_at', 'sender_username', 'sender_avatar',
            'time_ago', 'related_post_id', 'related_comment_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_sender_avatar(self, obj):
        if obj.sender and hasattr(obj.sender, 'profile') and obj.sender.profile.avatar:
            return obj.sender.profile.avatar.url
        return None
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days}d"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m"
        else:
            return "now"