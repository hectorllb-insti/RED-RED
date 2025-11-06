from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminLog(models.Model):
    """
    Modelo para registrar todas las acciones administrativas
    """
    ACTION_CHOICES = [
        ('user_ban', 'Ban de Usuario'),
        ('user_unban', 'Unban de Usuario'),
        ('user_role_change', 'Cambio de Rol de Usuario'),
        ('post_delete', 'Eliminación de Post'),
        ('comment_delete', 'Eliminación de Comentario'),
        ('user_delete', 'Eliminación de Usuario'),
        ('config_change', 'Cambio de Configuración'),
    ]
    
    admin = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='admin_actions'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='received_admin_actions'
    )
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Admin Log'
        verbose_name_plural = 'Admin Logs'
    
    def __str__(self):
        admin_name = self.admin.username if self.admin else 'Sistema'
        return f"{admin_name} - {self.get_action_display()} - {self.created_at}"


class SiteConfiguration(models.Model):
    """
    Modelo para configuración global del sitio
    """
    # Configuración general
    site_name = models.CharField(max_length=100, default='RED-RED')
    site_description = models.TextField(blank=True)
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)
    
    # Límites y restricciones
    max_post_length = models.IntegerField(default=5000)
    max_comment_length = models.IntegerField(default=1000)
    max_bio_length = models.IntegerField(default=500)
    max_file_size_mb = models.IntegerField(default=10)
    
    # Permisos generales
    allow_registration = models.BooleanField(default=True)
    allow_post_creation = models.BooleanField(default=True)
    allow_comments = models.BooleanField(default=True)
    allow_likes = models.BooleanField(default=True)
    allow_follows = models.BooleanField(default=True)
    
    # Características habilitadas
    enable_stories = models.BooleanField(default=True)
    enable_chat = models.BooleanField(default=True)
    enable_notifications = models.BooleanField(default=True)
    
    # Moderación
    auto_moderate = models.BooleanField(default=False)
    require_email_verification = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='config_updates'
    )
    
    class Meta:
        verbose_name = 'Site Configuration'
        verbose_name_plural = 'Site Configuration'
    
    def __str__(self):
        return f"Site Configuration - Updated: {self.updated_at}"
    
    @classmethod
    def get_config(cls):
        """Obtiene o crea la configuración del sitio"""
        config, created = cls.objects.get_or_create(pk=1)
        return config
