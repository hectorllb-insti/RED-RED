from django.contrib import admin
from .models import Post, Like, Comment, CommentLike, SharedPost


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'created_at', 'likes_count', 'comments_count')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('author__username', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def likes_count(self, obj):
        return obj.get_likes_count()
    likes_count.short_description = 'Likes'
    
    def comments_count(self, obj):
        return obj.get_comments_count()
    comments_count.short_description = 'Comments'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    ordering = ('-created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'content_preview', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('author__username', 'content', 'post__content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'comment__content')
    ordering = ('-created_at',)


@admin.register(SharedPost)
class SharedPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'shared_by', 'original_post', 'shared_with', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('shared_by__username', 'shared_with__username', 'original_post__content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
