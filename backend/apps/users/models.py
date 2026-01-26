from django.contrib.auth.models import AbstractUser
from django.db import models
from .utils import generate_unique_filename


def user_profile_picture_path(instance, filename):
    """Genera path único para foto de perfil"""
    unique_filename = generate_unique_filename(filename)
    return f'profile_pics/{unique_filename}'


def user_cover_picture_path(instance, filename):
    """Genera path único para foto de portada"""
    unique_filename = generate_unique_filename(filename)
    return f'cover_pics/{unique_filename}'


class User(AbstractUser):
    # Roles
    ROLE_CHOICES = [
        ('user', 'User'),
        ('moderator', 'Moderator'),
        ('admin', 'Administrator'),
    ]
    
    # Theme preferences
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to=user_profile_picture_path, blank=True, null=True)
    cover_picture = models.ImageField(upload_to=user_cover_picture_path, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    is_private = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_banned = models.BooleanField(default=False)
    ban_reason = models.TextField(blank=True)
    banned_at = models.DateTimeField(null=True, blank=True)
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} (@{self.username})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_followers_count(self):
        return self.followers.count()

    def get_following_count(self):
        return self.following.count()
    
    def is_admin(self):
        """Verifica si el usuario es administrador"""
        return self.role == 'admin'
    
    def is_moderator(self):
        """Verifica si el usuario es moderador"""
        return self.role == 'moderator'
    
    def is_staff_member(self):
        """Verifica si el usuario es staff (admin o moderador)"""
        return self.role in ['admin', 'moderator']


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class SystemSetting(models.Model):
    """Configuraciones globales del sistema"""
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return f"{self.key}: {self.value}"