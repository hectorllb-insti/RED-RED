from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Follow

User = get_user_model()


class FollowTestCase(APITestCase):
    """Tests para verificar la funcionalidad de seguir/dejar de seguir usuarios"""
    
    def setUp(self):
        """Configurar usuarios de prueba y cliente autenticado"""
        self.client = APIClient()
        
        # Crear usuarios de prueba
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123',
            first_name='Usuario',
            last_name='Uno'
        )
        
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123',
            first_name='Usuario',
            last_name='Dos'
        )
        
        self.user3 = User.objects.create_user(
            username='user3',
            email='user3@test.com',
            password='testpass123',
            first_name='Usuario',
            last_name='Tres'
        )
        
        # Autenticar como user1
        self.client.force_authenticate(user=self.user1)
    
    def test_user_list_excludes_authenticated_user(self):
        """Verificar que la lista de usuarios no incluye al usuario autenticado"""
        response = self.client.get('/api/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Manejar respuesta paginada o lista simple
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        usernames = [user['username'] for user in results]
        
        # El usuario autenticado (user1) NO debe aparecer en la lista
        self.assertNotIn('user1', usernames)
        # Pero user2 y user3 sí deben aparecer
        self.assertIn('user2', usernames)
        self.assertIn('user3', usernames)
    
    def test_follow_user_success(self):
        """Verificar que se puede seguir a otro usuario exitosamente"""
        response = self.client.post(f'/api/users/follow/user2/')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        
        # Verificar que se creó la relación Follow
        follow_exists = Follow.objects.filter(
            follower=self.user1,
            following=self.user2
        ).exists()
        self.assertTrue(follow_exists)
    
    def test_follow_user_twice_idempotent(self):
        """Verificar que seguir dos veces al mismo usuario es idempotente"""
        # Primera vez
        response1 = self.client.post(f'/api/users/follow/user2/')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Segunda vez
        response2 = self.client.post(f'/api/users/follow/user2/')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Solo debe existir una relación Follow
        follow_count = Follow.objects.filter(
            follower=self.user1,
            following=self.user2
        ).count()
        self.assertEqual(follow_count, 1)
    
    def test_cannot_follow_self(self):
        """Verificar que un usuario no puede seguirse a sí mismo"""
        response = self.client.post(f'/api/users/follow/user1/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_unfollow_user_success(self):
        """Verificar que se puede dejar de seguir a un usuario"""
        # Primero seguir
        Follow.objects.create(follower=self.user1, following=self.user2)
        
        # Luego dejar de seguir
        response = self.client.delete(f'/api/users/unfollow/user2/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se eliminó la relación
        follow_exists = Follow.objects.filter(
            follower=self.user1,
            following=self.user2
        ).exists()
        self.assertFalse(follow_exists)
    
    def test_suggested_users_excludes_following(self):
        """Verificar que usuarios sugeridos no incluye a quienes ya sigues"""
        # user1 sigue a user2
        Follow.objects.create(follower=self.user1, following=self.user2)
        
        response = self.client.get('/api/users/suggested/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Manejar respuesta paginada o lista simple
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        usernames = [user['username'] for user in results]
        
        # user2 no debe aparecer (ya lo sigue)
        self.assertNotIn('user2', usernames)
        # user1 no debe aparecer (es el usuario autenticado)
        self.assertNotIn('user1', usernames)
        # user3 sí debe aparecer (no lo sigue)
        self.assertIn('user3', usernames)
    
    def test_user_search_excludes_authenticated_user(self):
        """Verificar que la búsqueda de usuarios excluye al usuario autenticado"""
        response = self.client.get('/api/users/?search=user')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Manejar respuesta paginada o lista simple
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        usernames = [user['username'] for user in results]
        
        # El usuario autenticado NO debe aparecer
        self.assertNotIn('user1', usernames)
        # Los demás usuarios sí deben aparecer
        self.assertIn('user2', usernames)
        self.assertIn('user3', usernames)
    
    def test_get_followers_list(self):
        """Verificar que se pueden obtener los seguidores de un usuario"""
        # user2 y user3 siguen a user1
        Follow.objects.create(follower=self.user2, following=self.user1)
        Follow.objects.create(follower=self.user3, following=self.user1)
        
        response = self.client.get(f'/api/users/user1/followers/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_following_list(self):
        """Verificar que se pueden obtener los usuarios que sigue un usuario"""
        # user1 sigue a user2 y user3
        Follow.objects.create(follower=self.user1, following=self.user2)
        Follow.objects.create(follower=self.user1, following=self.user3)
        
        response = self.client.get(f'/api/users/user1/following/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_delete_account_success(self):
        """Verificar que un usuario puede eliminar su propia cuenta"""
        # Crear algunos datos relacionados
        Follow.objects.create(follower=self.user1, following=self.user2)
        
        # Intentar eliminar cuenta con contraseña correcta
        response = self.client.delete(
            '/api/users/profile/delete/',
            {'password': 'testpass123'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('deleted', response.data)
        self.assertTrue(response.data['deleted'])
        
        # Verificar que el usuario fue eliminado
        user_exists = User.objects.filter(username='user1').exists()
        self.assertFalse(user_exists)
        
        # Verificar que las relaciones Follow también fueron eliminadas
        follow_exists = Follow.objects.filter(follower=self.user1).exists()
        self.assertFalse(follow_exists)
    
    def test_delete_account_wrong_password(self):
        """Verificar que no se puede eliminar cuenta con contraseña incorrecta"""
        response = self.client.delete(
            '/api/users/profile/delete/',
            {'password': 'wrong_password'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        
        # Verificar que el usuario NO fue eliminado
        user_exists = User.objects.filter(username='user1').exists()
        self.assertTrue(user_exists)
    
    def test_delete_account_no_password(self):
        """Verificar que se requiere contraseña para eliminar cuenta"""
        response = self.client.delete('/api/users/profile/delete/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        # Verificar que el usuario NO fue eliminado
        user_exists = User.objects.filter(username='user1').exists()
        self.assertTrue(user_exists)


class UserModelTestCase(TestCase):
    """Tests para el modelo User"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_str_representation(self):
        """Verificar la representación en string del usuario"""
        expected = "Test User (@testuser)"
        self.assertEqual(str(self.user), expected)
    
    def test_user_full_name_property(self):
        """Verificar la propiedad full_name"""
        self.assertEqual(self.user.full_name, "Test User")
    
    def test_get_followers_count(self):
        """Verificar el conteo de seguidores"""
        user2 = User.objects.create_user(
            username='follower',
            email='follower@test.com',
            password='testpass123',
            first_name='Follower',
            last_name='User'
        )
        
        Follow.objects.create(follower=user2, following=self.user)
        
        self.assertEqual(self.user.get_followers_count(), 1)
    
    def test_get_following_count(self):
        """Verificar el conteo de usuarios seguidos"""
        user2 = User.objects.create_user(
            username='following',
            email='following@test.com',
            password='testpass123',
            first_name='Following',
            last_name='User'
        )
        
        Follow.objects.create(follower=self.user, following=user2)
        
        self.assertEqual(self.user.get_following_count(), 1)


class FollowModelTestCase(TestCase):
    """Tests para el modelo Follow"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@test.com',
            password='testpass123',
            first_name='User',
            last_name='One'
        )
        
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@test.com',
            password='testpass123',
            first_name='User',
            last_name='Two'
        )
    
    def test_follow_str_representation(self):
        """Verificar la representación en string de Follow"""
        follow = Follow.objects.create(
            follower=self.user1,
            following=self.user2
        )
        
        expected = "user1 follows user2"
        self.assertEqual(str(follow), expected)
    
    def test_follow_unique_together_constraint(self):
        """Verificar que no se pueden crear relaciones Follow duplicadas"""
        Follow.objects.create(follower=self.user1, following=self.user2)
        
        # Intentar crear la misma relación debe fallar
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Follow.objects.create(follower=self.user1, following=self.user2)
