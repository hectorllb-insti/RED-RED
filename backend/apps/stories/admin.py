from django.contrib import admin
from .models import Story, StoryView


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'created_at', 'expires_at', 'is_expired', 'views_count')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('author__username', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'expires_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content if obj.content else '(No content)'
    content_preview.short_description = 'Content'
    
    def views_count(self, obj):
        return obj.get_views_count()
    views_count.short_description = 'Views'


@admin.register(StoryView)
class StoryViewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'story', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__username', 'story__author__username')
    ordering = ('-viewed_at',)
