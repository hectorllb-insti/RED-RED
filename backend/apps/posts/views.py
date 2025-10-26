from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Post, Like, Comment, SharedPost
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
            {'message': 'Post unliked', 'liked': False}, 
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user, post=post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = Comment.objects.filter(post=post)
    serializer = CommentSerializer(comments, many=True)
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