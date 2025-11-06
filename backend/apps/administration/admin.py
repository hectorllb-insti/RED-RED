from django.contrib import admin
from .models import AdminLog, SiteConfiguration


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'admin', 'action', 'target_user', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['admin__username', 'target_user__username', 'description']
    readonly_fields = ['admin', 'action', 'target_user', 'description', 'metadata', 'created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'maintenance_mode', 'updated_at', 'updated_by']
    fieldsets = (
        ('General', {
            'fields': ('site_name', 'site_description', 'maintenance_mode', 'maintenance_message')
        }),
        ('Límites', {
            'fields': ('max_post_length', 'max_comment_length', 'max_bio_length', 'max_file_size_mb')
        }),
        ('Características', {
            'fields': ('enable_stories', 'enable_chat', 'enable_notifications', 
                      'enable_comments', 'enable_likes')
        }),
        ('Moderación', {
            'fields': ('auto_moderate', 'require_email_verification')
        }),
    )
    readonly_fields = ['updated_at', 'updated_by']
    
    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
