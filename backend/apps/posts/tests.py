from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import Post

User = get_user_model()


class PostGIFSupportTests(TestCase):
    """Tests para verificar el soporte de GIFs en posts"""

    def setUp(self):
        """Configuración inicial para los tests"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_post_with_gif(self):
        """Test: Crear un post con un archivo GIF"""
        # Crear un archivo GIF simulado
        gif_content = (
            b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00'
            b'\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,'
            b'\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        )
        gif_file = SimpleUploadedFile(
            "test.gif",
            gif_content,
            content_type="image/gif"
        )

        data = {
            'content': 'Post de prueba con GIF',
            'image': gif_file
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Post.objects.filter(author=self.user).exists())
        
        post = Post.objects.get(author=self.user)
        self.assertEqual(post.content, 'Post de prueba con GIF')
        self.assertTrue(post.image)
        self.assertTrue(post.image.name.endswith('.gif'))

    def test_create_post_with_jpeg(self):
        """Test: Crear un post con JPEG (compatibilidad hacia atrás)"""
        jpeg_content = b'\xff\xd8\xff\xe0\x00\x10JFIF'
        jpeg_file = SimpleUploadedFile(
            "test.jpg",
            jpeg_content,
            content_type="image/jpeg"
        )

        data = {
            'content': 'Post de prueba con JPEG',
            'image': jpeg_file
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_post_with_png(self):
        """Test: Crear un post con PNG (compatibilidad hacia atrás)"""
        png_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR'
        png_file = SimpleUploadedFile(
            "test.png",
            png_content,
            content_type="image/png"
        )

        data = {
            'content': 'Post de prueba con PNG',
            'image': png_file
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_reject_invalid_file_type(self):
        """Test: Rechazar tipos de archivo no permitidos"""
        # Intentar subir un archivo PDF
        pdf_content = b'%PDF-1.4'
        pdf_file = SimpleUploadedFile(
            "test.pdf",
            pdf_content,
            content_type="application/pdf"
        )

        data = {
            'content': 'Post de prueba con PDF',
            'image': pdf_file
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('image', response.data)

    def test_reject_file_too_large(self):
        """Test: Rechazar archivos que excedan el límite de tamaño"""
        # Crear un archivo de más de 10MB (simulado)
        large_content = b'x' * (11 * 1024 * 1024)  # 11MB
        large_file = SimpleUploadedFile(
            "large.gif",
            large_content,
            content_type="image/gif"
        )

        data = {
            'content': 'Post con archivo muy grande',
            'image': large_file
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_post_without_image(self):
        """Test: Crear un post solo con texto (sin imagen)"""
        data = {
            'content': 'Post solo con texto'
        }

        response = self.client.post('/api/posts/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        post = Post.objects.get(author=self.user)
        self.assertEqual(post.content, 'Post solo con texto')
        self.assertFalse(post.image)

    def test_post_serializer_includes_image_url(self):
        """Test: El serializador incluye la URL de la imagen/GIF"""
        gif_content = (
            b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00'
            b'\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,'
            b'\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        )
        gif_file = SimpleUploadedFile(
            "test.gif",
            gif_content,
            content_type="image/gif"
        )

        post = Post.objects.create(
            author=self.user,
            content='Post con GIF',
            image=gif_file
        )

        response = self.client.get(f'/api/posts/{post.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('image', response.data)
        self.assertTrue(response.data['image'])


# Comando para ejecutar los tests:
# python manage.py test apps.posts.tests.PostGIFSupportTests
