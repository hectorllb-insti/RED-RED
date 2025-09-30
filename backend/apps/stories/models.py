from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Story(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    content = models.TextField(max_length=500, blank=True)
    image = models.ImageField(upload_to='stories/', blank=True, null=True)
    video = models.FileField(upload_to='stories/videos/', blank=True, null=True)
    background_color = models.CharField(max_length=7, default='#000000')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.author.username}'s story - {self.created_at}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def get_views_count(self):
        return self.views.count()


class StoryView(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='story_views')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'story')

    def __str__(self):
        return f"{self.user.username} viewed {self.story.author.username}'s story"