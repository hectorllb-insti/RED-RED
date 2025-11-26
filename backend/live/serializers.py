from rest_framework import serializers
from django.utils import timezone
from .models import LiveStream, LiveStreamComment, StreamModerator, StreamVIP
from apps.users.serializers import UserSerializer


class LiveStreamCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)
    is_mod = serializers.SerializerMethodField()
    is_vip = serializers.SerializerMethodField()
    
    class Meta:
        model = LiveStreamComment
        fields = [
            'id', 'live_stream', 'user', 'user_username', 
            'user_first_name', 'user_profile_picture',
            'content', 'created_at', 'is_mod', 'is_vip'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'live_stream']
    
    def get_is_mod(self, obj):
        return StreamModerator.objects.filter(live_stream=obj.live_stream, user=obj.user).exists()
    
    def get_is_vip(self, obj):
        return StreamVIP.objects.filter(live_stream=obj.live_stream, user=obj.user).exists()



class LiveStreamSerializer(serializers.ModelSerializer):
    streamer_username = serializers.CharField(source='streamer.username', read_only=True)
    streamer_first_name = serializers.CharField(source='streamer.first_name', read_only=True)
    streamer_last_name = serializers.CharField(source='streamer.last_name', read_only=True)
    streamer_profile_picture = serializers.ImageField(source='streamer.profile_picture', read_only=True)
    is_streaming = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = LiveStream
        fields = [
            'id', 'streamer', 'streamer_username', 'streamer_first_name',
            'streamer_last_name', 'streamer_profile_picture',
            'title', 'description', 'status', 'started_at', 'ended_at',
            'created_at', 'updated_at', 'viewers_count', 'peak_viewers',
            'is_streaming', 'duration'
        ]
        read_only_fields = [
            'id', 'streamer', 'status', 'started_at', 'ended_at',
            'created_at', 'updated_at', 'viewers_count', 'peak_viewers'
        ]
    
    def get_is_streaming(self, obj):
        return obj.status == 'live'
    
    def get_duration(self, obj):
        """Calcular duración del stream en segundos"""
        if obj.started_at:
            end_time = obj.ended_at if obj.ended_at else timezone.now()
            duration = (end_time - obj.started_at).total_seconds()
            return int(duration)
        return 0


class LiveStreamListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar streams"""
    streamer_username = serializers.CharField(source='streamer.username', read_only=True)
    streamer_first_name = serializers.CharField(source='streamer.first_name', read_only=True)
    streamer_profile_picture = serializers.ImageField(source='streamer.profile_picture', read_only=True)
    
    class Meta:
        model = LiveStream
        fields = [
            'id', 'streamer', 'streamer_username', 'streamer_first_name',
            'streamer_profile_picture', 'title', 'status', 'viewers_count',
            'started_at', 'created_at'
        ]
