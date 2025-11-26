from django.contrib import admin
from .models import LiveStream, LiveStreamComment, StreamModerator, StreamVIP


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ['id', 'streamer', 'title', 'status', 'viewers_count', 'peak_viewers', 'started_at', 'ended_at']
    list_filter = ['status', 'created_at', 'started_at']
    search_fields = ['streamer__username', 'title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'started_at', 'ended_at', 'peak_viewers']
    ordering = ['-created_at']


@admin.register(LiveStreamComment)
class LiveStreamCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'live_stream', 'user', 'content', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'content']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(StreamModerator)
class StreamModeratorAdmin(admin.ModelAdmin):
    list_display = ['id', 'live_stream', 'user', 'assigned_at']
    list_filter = ['assigned_at']
    search_fields = ['user__username', 'live_stream__title']
    readonly_fields = ['assigned_at']


@admin.register(StreamVIP)
class StreamVIPAdmin(admin.ModelAdmin):
    list_display = ['id', 'live_stream', 'user', 'assigned_at']
    list_filter = ['assigned_at']
    search_fields = ['user__username', 'live_stream__title']
    readonly_fields = ['assigned_at']

