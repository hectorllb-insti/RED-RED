from django.db import models
from django.contrib.auth import get_user_model
import re

User = get_user_model()


def post_image_path(instance, filename):
    """Genera path único para imágenes de posts"""
    from apps.users.utils import generate_unique_filename
    unique_filename = generate_unique_filename(filename)
    return f'posts/{unique_filename}'


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=2000)
    image = models.FileField(upload_to=post_image_path, blank=True, null=True)  # Cambiado a FileField para soportar GIFs
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}..."

    def get_likes_count(self):
        return self.likes.count()

    def get_comments_count(self):
        return self.comments.count()


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} likes {self.post.id}"


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.username}: {self.content[:30]}..."

    def get_likes_count(self):
        return self.comment_likes.count()


class CommentLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='comment_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')

    def __str__(self):
        return f"{self.user.username} likes comment {self.comment.id}"


class SharedPost(models.Model):
    """Modelo para compartir publicaciones"""
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_posts')
    original_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shares', null=True, blank=True)
    message = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = f" with {self.shared_with.username}" if self.shared_with else " publicly"
        return f"{self.shared_by.username} shared post {self.original_post.id}{target}"

class Hashtag(models.Model):
    """Modelo para almacenar hashtags"""
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    usage_count = models.IntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-usage_count', '-updated_at']
        indexes = [
            models.Index(fields=['-usage_count', '-updated_at']),
        ]
    
    def __str__(self):
        return f"#{self.name}"
    
    def increment_usage(self):
        """Incrementa el contador de uso"""
        self.usage_count += 1
        self.save(update_fields=['usage_count', 'updated_at'])
    
    def decrement_usage(self):
        """Decrementa el contador de uso"""
        if self.usage_count > 0:
            self.usage_count -= 1
            self.save(update_fields=['usage_count', 'updated_at'])


class PostHashtag(models.Model):
    """Relaci�n entre posts y hashtags"""
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_hashtags'
    )
    hashtag = models.ForeignKey(
        Hashtag,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'hashtag')
        indexes = [
            models.Index(fields=['post', 'hashtag']),
            models.Index(fields=['hashtag', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.post.id} - #{self.hashtag.name}"

