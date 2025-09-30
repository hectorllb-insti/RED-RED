from django.contrib import admin
from .models import ChatRoom, Message, MessageRead


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'participant_list', 'created_at', 'updated_at', 'message_count')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('participants__username',)
    ordering = ('-updated_at',)
    filter_horizontal = ('participants',)
    
    def participant_list(self, obj):
        return ', '.join([p.username for p in obj.participants.all()[:5]])
    participant_list.short_description = 'Participants'
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'chat_room', 'content_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at', 'updated_at')
    search_fields = ('sender__username', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message', 'read_at')
    list_filter = ('read_at',)
    search_fields = ('user__username', 'message__content')
    ordering = ('-read_at',)
