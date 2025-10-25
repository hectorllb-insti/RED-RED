from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Follow
from .serializers import UserSerializer, UserProfileSerializer, FollowSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class UserDetailByIdView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'pk'


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        # Excluir el usuario actual de los resultados
        queryset = User.objects.exclude(id=self.request.user.id)
        
        search = self.request.query_params.get('search', None)
        if search is not None and search.strip():
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return queryset


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    
    if user_to_follow == request.user:
        return Response(
            {'error': 'No puedes seguirte a ti mismo'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )
    
    if created:
        return Response(
            {'message': f'Ahora sigues a {user_to_follow.username}'}, 
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(
            {'message': f'Ya sigues a {user_to_follow.username}'}, 
            status=status.HTTP_200_OK
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    
    try:
        follow = Follow.objects.get(
            follower=request.user,
            following=user_to_unfollow
        )
        follow.delete()
        return Response(
            {'message': f'Has dejado de seguir a {user_to_unfollow.username}'}, 
            status=status.HTTP_200_OK
        )
    except Follow.DoesNotExist:
        return Response(
            {'error': f'No sigues a {user_to_unfollow.username}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_followers(request, username):
    user = get_object_or_404(User, username=username)
    followers = Follow.objects.filter(following=user)
    serializer = FollowSerializer(followers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_following(request, username):
    user = get_object_or_404(User, username=username)
    following = Follow.objects.filter(follower=user)
    serializer = FollowSerializer(following, many=True)
    return Response(serializer.data)