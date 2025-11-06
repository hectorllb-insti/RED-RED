from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Post, Like, Comment, CommentLike, SharedPost, Hashtag, PostHashtag
from .serializers import (
    PostSerializer, PostCreateSerializer, CommentSerializer,
    SharePostSerializer, SharedPostSerializer
)
from apps.users.models import Follow

User = get_user_model()


class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer
    
    def get_queryset(self):
        # Verificar si se solicita posts de un autor específico
        author_id = self.request.query_params.get('author', None)
        if author_id:
            try:
                author_id = int(author_id)
                return Post.objects.filter(author_id=author_id).order_by('-created_at')
            except (ValueError, TypeError):
                return Post.objects.none()
        
        # Obtener usuarios que sigue el usuario actual
        following_ids = Follow.objects.filter(
            follower=self.request.user
        ).values_list('following_id', flat=True)
        
        # Mostrar solo posts de usuarios que sigue (SIN incluir sus propias publicaciones)
        return Post.objects.filter(
            author_id__in=following_ids
        ).select_related('author').order_by('-created_at')


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostCreateSerializer
        return PostSerializer
    
    def perform_update(self, serializer):
        """Actualizar post y reprocesar hashtags"""
        from .hashtags import process_hashtags_for_post
        
        post = serializer.save()
        # Reprocesar hashtags cuando se actualiza el contenido
        process_hashtags_for_post(post)
        return post
    
    def perform_destroy(self, instance):
        """Eliminar post y decrementar contadores de hashtags"""
        from .hashtags import remove_hashtags_from_post
        
        # Eliminar hashtags asociados
        remove_hashtags_from_post(instance)
        instance.delete()


class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return Post.objects.filter(author=user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    like, created = Like.objects.get_or_create(user=request.user, post=post)
    
    if created:
        return Response(
            {'message': 'Post liked', 'liked': True}, 
            status=status.HTTP_201_CREATED
        )
    else:
        like.delete()
        return Response(
            {'message': 'Comment unliked', 'liked': False}, 
            status=status.HTTP_200_OK
        )


class HashtagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar y buscar hashtags
    - list: Lista todos los hashtags ordenados por uso
    - retrieve: Detalle de un hashtag por slug
    - trending: Top hashtags de las últimas 24 horas
    - posts: Posts asociados a un hashtag
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Hashtag.objects.all()
        
        # Filtro por búsqueda
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('-usage_count', '-updated_at')
    
    def list(self, request, *args, **kwargs):
        """Lista de hashtags con paginación"""
        queryset = self.get_queryset()[:50]  # Limitar a top 50
        
        data = [
            {
                'id': hashtag.id,
                'name': hashtag.name,
                'slug': hashtag.slug,
                'usage_count': hashtag.usage_count,
                'created_at': hashtag.created_at,
                'updated_at': hashtag.updated_at
            }
            for hashtag in queryset
        ]
        
        return Response(data)
    
    def retrieve(self, request, slug=None, *args, **kwargs):
        """Detalle de un hashtag específico"""
        hashtag = get_object_or_404(Hashtag, slug=slug)
        
        return Response({
            'id': hashtag.id,
            'name': hashtag.name,
            'slug': hashtag.slug,
            'usage_count': hashtag.usage_count,
            'created_at': hashtag.created_at,
            'updated_at': hashtag.updated_at
        })
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Top hashtags de las últimas 24 horas"""
        yesterday = timezone.now() - timedelta(days=1)
        
        # Hashtags usados en las últimas 24 horas
        trending_hashtags = Hashtag.objects.filter(
            posts__created_at__gte=yesterday
        ).annotate(
            recent_count=Count('posts', filter=Q(posts__created_at__gte=yesterday))
        ).order_by('-recent_count', '-usage_count')[:10]
        
        data = [
            {
                'id': hashtag.id,
                'name': hashtag.name,
                'slug': hashtag.slug,
                'usage_count': hashtag.usage_count,
                'recent_count': hashtag.recent_count,
                'created_at': hashtag.created_at
            }
            for hashtag in trending_hashtags
        ]
        
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        """Posts asociados a un hashtag"""
        hashtag = get_object_or_404(Hashtag, slug=slug)
        
        # Obtener posts asociados al hashtag
        post_ids = PostHashtag.objects.filter(
            hashtag=hashtag
        ).values_list('post_id', flat=True)
        
        posts = Post.objects.filter(
            id__in=post_ids
        ).select_related('author').order_by('-created_at')
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    serializer = CommentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(author=request.user, post=post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = Comment.objects.filter(post=post)
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_post(request, post_id):
    """Compartir una publicación con un usuario específico o públicamente"""
    post = get_object_or_404(Post, id=post_id)
    
    serializer = SharePostSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    shared_with_username = serializer.validated_data.get('shared_with_username')
    message = serializer.validated_data.get('message', '')
    
    shared_with = None
    if shared_with_username:
        shared_with = User.objects.get(username=shared_with_username)
        
        # Verificar que no intente compartir consigo mismo
        if shared_with == request.user:
            return Response(
                {'error': 'No puedes compartir una publicación contigo mismo'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Crear el registro de compartición
    shared_post = SharedPost.objects.create(
        shared_by=request.user,
        original_post=post,
        shared_with=shared_with,
        message=message
    )
    
    response_serializer = SharedPostSerializer(shared_post)
    
    target = f" con {shared_with.username}" if shared_with else " públicamente"
    return Response({
        'message': f'Publicación compartida{target}',
        'shared_post': response_serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shared_posts_list(request):
    """Listar publicaciones compartidas con el usuario actual"""
    shared_posts = SharedPost.objects.filter(shared_with=request.user)
    serializer = SharedPostSerializer(shared_posts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_comment(request, comment_id):
    """Dar o quitar like a un comentario"""
    from notifications.models import Notification
    
    comment = get_object_or_404(Comment, id=comment_id)
    like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
    
    if created:
        # Crear notificación solo si el like es de otro usuario
        if comment.author != request.user:
            Notification.objects.create(
                recipient=comment.author,
                sender=request.user,
                notification_type='like',
                title=f'{request.user.get_full_name()} le dio me gusta a tu comentario',
                message=f'En la publicación: "{comment.post.content[:50]}..."',
                related_comment_id=comment.id,
                related_post_id=comment.post.id
            )
        
        return Response(
            {'message': 'Comment liked', 'liked': True}, 
            status=status.HTTP_201_CREATED
        )
    else:
        like.delete()
        
        # Eliminar la notificación si existe
        if comment.author != request.user:
            Notification.objects.filter(
                recipient=comment.author,
                sender=request.user,
                notification_type='like',
                related_comment_id=comment.id
            ).delete()
        
        return Response(
            {'message': 'Comment unliked', 'liked': False}, 
            status=status.HTTP_200_OK
        )