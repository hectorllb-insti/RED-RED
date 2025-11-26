from django.db import models
from django.conf import settings
from django.utils import timezone


class LiveStream(models.Model):
    """Modelo para gestionar transmisiones en vivo"""
    
    STATUS_CHOICES = [
        ('waiting', 'Esperando'),
        ('live', 'En vivo'),
        ('ended', 'Finalizado'),
    ]
    
    streamer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='live_streams'
    )
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    
    # Timestamps
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Estadísticas
    viewers_count = models.IntegerField(default=0)
    peak_viewers = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['streamer', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.streamer.username} - {self.status} - {self.created_at}"
    
    def start_stream(self):
        """Iniciar la transmisión"""
        self.status = 'live'
        self.started_at = timezone.now()
        self.save()
    
    def end_stream(self):
        """Finalizar la transmisión"""
        self.status = 'ended'
        self.ended_at = timezone.now()
        self.save()
    
    def update_viewers(self, count):
        """Actualizar el conteo de espectadores"""
        self.viewers_count = count
        if count > self.peak_viewers:
            self.peak_viewers = count
        self.save()


class LiveStreamComment(models.Model):
    """Comentarios en tiempo real durante el directo"""
    
    live_stream = models.ForeignKey(
        LiveStream,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='live_comments'
    )
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['live_stream', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"


class StreamModerator(models.Model):
    """Moderadores de un stream"""
    live_stream = models.ForeignKey(
        LiveStream,
        on_delete=models.CASCADE,
        related_name='moderators'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='moderated_streams'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['live_stream', 'user']
    
    def __str__(self):
        return f"{self.user.username} - Mod de {self.live_stream.streamer.username}"


class StreamVIP(models.Model):
    """VIPs de un stream"""
    live_stream = models.ForeignKey(
        LiveStream,
        on_delete=models.CASCADE,
        related_name='vips'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vip_streams'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['live_stream', 'user']
    
    def __str__(self):
        return f"{self.user.username} - VIP de {self.live_stream.streamer.username}"

