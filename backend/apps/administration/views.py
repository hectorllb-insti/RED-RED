from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import AdminLog, SiteConfiguration
from .serializers import (
    AdminLogSerializer,
    SiteConfigurationSerializer,
    UserAdminSerializer,
    DashboardStatsSerializer
)
from apps.users.permissions import IsAdmin, IsModerator
from apps.posts.models import Post, Comment, Like
from apps.stories.models import Story

User = get_user_model()


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet para estadísticas del dashboard de administración
    """
    permission_classes = [IsAuthenticated, IsModerator]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtiene estadísticas generales del dashboard"""
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        # Contar totales
        total_users = User.objects.count()
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        total_likes = Like.objects.count()
        total_stories = Story.objects.count()
        
        # Usuarios activos (que han hecho login o han creado contenido en los últimos 30 días)
        # Contar usuarios que han iniciado sesión recientemente
        active_by_login = User.objects.filter(
            last_login__gte=month_start
        ).values_list('id', flat=True)
        
        # Contar usuarios que han creado posts recientemente
        active_by_posts = Post.objects.filter(
            created_at__gte=month_start
        ).values_list('author_id', flat=True).distinct()
        
        # Contar usuarios que han comentado recientemente
        active_by_comments = Comment.objects.filter(
            created_at__gte=month_start
        ).values_list('author_id', flat=True).distinct()
        
        # Combinar todos los IDs únicos
        active_user_ids = set(active_by_login) | set(active_by_posts) | set(active_by_comments)
        active_users = len(active_user_ids)
        
        # Nuevos usuarios
        new_users_today = User.objects.filter(
            created_at__gte=today_start
        ).count()
        new_users_week = User.objects.filter(
            created_at__gte=week_start
        ).count()
        new_users_month = User.objects.filter(
            created_at__gte=month_start
        ).count()
        
        # Usuarios baneados
        banned_users = User.objects.filter(is_banned=True).count()
        
        # Nuevos posts
        new_posts_today = Post.objects.filter(
            created_at__gte=today_start
        ).count()
        new_posts_week = Post.objects.filter(
            created_at__gte=week_start
        ).count()
        new_posts_month = Post.objects.filter(
            created_at__gte=month_start
        ).count()
        
        # Actividad del día
        new_comments_today = Comment.objects.filter(
            created_at__gte=today_start
        ).count()
        new_likes_today = Like.objects.filter(
            created_at__gte=today_start
        ).count()
        
        # Roles
        admin_count = User.objects.filter(role='admin').count()
        moderator_count = User.objects.filter(role='moderator').count()
        user_count = User.objects.filter(role='user').count()
        
        stats_data = {
            'total_users': total_users,
            'total_posts': total_posts,
            'total_comments': total_comments,
            'total_likes': total_likes,
            'total_stories': total_stories,
            'active_users': active_users,
            'new_users_today': new_users_today,
            'new_users_week': new_users_week,
            'new_users_month': new_users_month,
            'banned_users': banned_users,
            'new_posts_today': new_posts_today,
            'new_posts_week': new_posts_week,
            'new_posts_month': new_posts_month,
            'new_comments_today': new_comments_today,
            'new_likes_today': new_likes_today,
            'admin_count': admin_count,
            'moderator_count': moderator_count,
            'user_count': user_count,
        }
        
        serializer = DashboardStatsSerializer(stats_data)
        return Response(serializer.data)


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión administrativa de usuarios
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsModerator]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        role = self.request.query_params.get('role', None)
        is_banned = self.request.query_params.get('is_banned', None)
        search = self.request.query_params.get('search', None)
        
        if role:
            queryset = queryset.filter(role=role)
        if is_banned is not None:
            queryset = queryset.filter(is_banned=is_banned.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsModerator])
    def ban(self, request, pk=None):
        """Banear a un usuario"""
        user = self.get_object()
        reason = request.data.get('reason', 'No reason provided')
        
        # Verificar que el usuario no intente banearse a sí mismo
        if user.id == request.user.id:
            return Response(
                {'error': 'No puedes banearte a ti mismo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que no se pueda banear a un admin (solo otro admin puede)
        if user.is_admin() and not request.user.is_admin():
            return Response(
                {'error': 'No tienes permisos para banear a un administrador'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_banned = True
        user.ban_reason = reason
        user.banned_at = timezone.now()
        user.save()
        
        # Registrar en log
        AdminLog.objects.create(
            admin=request.user,
            action='user_ban',
            target_user=user,
            description=f'Usuario baneado. Razón: {reason}'
        )
        
        return Response({'message': 'Usuario baneado exitosamente'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsModerator])
    def unban(self, request, pk=None):
        """Desbanear a un usuario"""
        user = self.get_object()
        
        user.is_banned = False
        user.ban_reason = ''
        user.banned_at = None
        user.save()
        
        # Registrar en log
        AdminLog.objects.create(
            admin=request.user,
            action='user_unban',
            target_user=user,
            description='Usuario desbaneado'
        )
        
        return Response({'message': 'Usuario desbaneado exitosamente'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def change_role(self, request, pk=None):
        """Cambiar el rol de un usuario"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in ['user', 'moderator', 'admin']:
            return Response(
                {'error': 'Rol inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_role = user.role
        user.role = new_role
        user.save()
        
        # Registrar en log
        AdminLog.objects.create(
            admin=request.user,
            action='user_role_change',
            target_user=user,
            description=f'Rol cambiado de {old_role} a {new_role}',
            metadata={'old_role': old_role, 'new_role': new_role}
        )
        
        return Response({'message': f'Rol cambiado a {new_role} exitosamente'})


class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver logs administrativos (solo lectura)
    """
    queryset = AdminLog.objects.all().select_related('admin', 'target_user')
    serializer_class = AdminLogSerializer
    permission_classes = [IsAuthenticated, IsModerator]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        action = self.request.query_params.get('action', None)
        admin_id = self.request.query_params.get('admin_id', None)
        
        if action:
            queryset = queryset.filter(action=action)
        if admin_id:
            queryset = queryset.filter(admin_id=admin_id)
        
        return queryset


class SiteConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para configuración del sitio
    """
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def list(self, request, *args, **kwargs):
        """Asegurar que siempre hay una configuración"""
        # Si no existe configuración, crearla
        if not SiteConfiguration.objects.exists():
            config = SiteConfiguration.objects.create(
                site_name="Red Social",
                updated_by=request.user
            )
            AdminLog.objects.create(
                admin=request.user,
                action='config_change',
                description='Configuración del sitio creada automáticamente',
                metadata={}
            )
        
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        # Verificar si ya existe una configuración
        if SiteConfiguration.objects.exists():
            return Response(
                {'error': 'Ya existe una configuración. Use PUT para actualizar.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Establecer updated_by antes de crear
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Guardar con el usuario que actualiza
        instance = serializer.save(updated_by=request.user)
        
        # Registrar cambio en log
        AdminLog.objects.create(
            admin=request.user,
            action='config_change',
            description='Configuración del sitio creada',
            metadata=request.data
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Guardar con el usuario que actualiza
        serializer.save(updated_by=request.user)
        
        # Registrar cambio en log
        AdminLog.objects.create(
            admin=request.user,
            action='config_change',
            description='Configuración del sitio actualizada',
            metadata=request.data
        )
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtiene la configuración actual del sitio"""
        config = SiteConfiguration.get_config()
        serializer = self.get_serializer(config)
        return Response(serializer.data)
