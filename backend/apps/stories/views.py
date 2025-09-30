from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Story, StoryView
from .serializers import StorySerializer, StoryCreateSerializer
from apps.users.models import Follow

User = get_user_model()


class StoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StoryCreateSerializer
        return StorySerializer
    
    def get_queryset(self):
        # Mostrar historias activas del usuario y de usuarios que sigue
        following_users = Follow.objects.filter(follower=self.request.user).values_list('following', flat=True)
        return Story.objects.filter(
            author__in=list(following_users) + [self.request.user.id],
            expires_at__gt=timezone.now()
        )


class UserStoriesView(generics.ListAPIView):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return Story.objects.filter(
            author=user,
            expires_at__gt=timezone.now()
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def view_story(request, story_id):
    story = get_object_or_404(Story, id=story_id)
    
    # Verificar que la historia no haya expirado
    if story.is_expired:
        return Response(
            {'error': 'Esta historia ha expirado'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # No permitir que el autor vea su propia historia (no cuenta como view)
    if story.author == request.user:
        return Response(
            {'message': 'No puedes ver tu propia historia'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    story_view, created = StoryView.objects.get_or_create(
        user=request.user, 
        story=story
    )
    
    if created:
        return Response(
            {'message': 'Historia vista'}, 
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(
            {'message': 'Ya has visto esta historia'}, 
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def story_viewers(request, story_id):
    story = get_object_or_404(Story, id=story_id)
    
    # Solo el autor puede ver quién vio su historia
    if story.author != request.user:
        return Response(
            {'error': 'No tienes permiso para ver esta información'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    viewers = StoryView.objects.filter(story=story).select_related('user')
    data = [
        {
            'user': viewer.user.username,
            'viewed_at': viewer.viewed_at
        }
        for viewer in viewers
    ]
    
    return Response(data)