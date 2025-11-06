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
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Filtrar campos no permitidos
        allowed_fields = ['first_name', 'last_name', 'bio', 'location', 'website', 
                         'date_of_birth', 'is_private', 'profile_picture', 'cover_picture', 'email']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(instance, data=filtered_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)


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
    permission_classes = [IsAuthenticated]
    
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


class SuggestedUsersView(generics.ListAPIView):
    """
    Muestra usuarios sugeridos para seguir.
    Excluye al usuario actual y a los usuarios que ya sigue.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Obtener IDs de usuarios que ya sigue el usuario actual
        following_ids = Follow.objects.filter(
            follower=self.request.user
        ).values_list('following_id', flat=True)
        
        # Excluir el usuario actual y los que ya sigue
        queryset = User.objects.exclude(
            id__in=list(following_ids) + [self.request.user.id]
        ).order_by('-created_at')[:20]  # Limitar a 20 sugerencias
        
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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Elimina la cuenta del usuario autenticado y todos sus datos relacionados.
    Esta acción es irreversible.
    """
    user = request.user
    
    # Confirmar que el usuario proporcionó su contraseña para mayor seguridad
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Debes proporcionar tu contraseña para confirmar la eliminación de la cuenta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que la contraseña sea correcta
    if not user.check_password(password):
        return Response(
            {'error': 'Contraseña incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Guardar el username para el mensaje de respuesta
    username = user.username
    
    # Eliminar el usuario (cascade eliminará todos los datos relacionados)
    user.delete()
    
    return Response(
        {
            'message': f'La cuenta de {username} ha sido eliminada exitosamente',
            'deleted': True
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Cambia la contraseña del usuario autenticado
    """
    user = request.user
    
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'error': 'Se requieren ambas contraseñas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que la contraseña actual sea correcta
    if not user.check_password(current_password):
        return Response(
            {'error': 'La contraseña actual es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Validar longitud de la nueva contraseña
    if len(new_password) < 8:
        return Response(
            {'error': 'La nueva contraseña debe tener al menos 8 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cambiar la contraseña
    user.set_password(new_password)
    user.save()
    
    return Response(
        {'message': 'Contraseña actualizada exitosamente'},
        status=status.HTTP_200_OK
    )