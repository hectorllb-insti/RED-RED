# Estructura de Módulos del Backend

## Descripción General

Este documento proporciona una descripción completa de la estructura de módulos del backend, importaciones y dependencias para la aplicación de red social RED-RED.

## Estructura de Directorios

```
backend/
├── apps/                           # Aplicaciones Django
│   ├── __init__.py
│   ├── authentication/             # Autenticación de usuarios
│   │   ├── __init__.py
│   │   ├── apps.py                # Configuración de la app
│   │   ├── serializers.py         # Serializadores JWT y registro
│   │   ├── urls.py                # Endpoints de autenticación
│   │   └── views.py               # Vistas de registro y tokens
│   │
│   ├── users/                      # Perfiles de usuario y relaciones
│   │   ├── __init__.py
│   │   ├── admin.py               # Interfaz admin para User y Follow
│   │   ├── apps.py                # Configuración de la app
│   │   ├── models.py              # Modelos User y Follow
│   │   ├── serializers.py         # Serializadores de usuario
│   │   ├── urls.py                # Endpoints de usuario
│   │   └── views.py               # Operaciones CRUD y seguimiento
│   │
│   ├── posts/                      # Funcionalidad de publicaciones sociales
│   │   ├── __init__.py
│   │   ├── admin.py               # Interfaz admin para Post, Like, Comment
│   │   ├── apps.py                # Configuración de la app
│   │   ├── models.py              # Modelos Post, Like y Comment
│   │   ├── serializers.py         # Serializadores de publicaciones
│   │   ├── urls.py                # Endpoints de publicaciones
│   │   └── views.py               # Operaciones CRUD, likes y comentarios
│   │
│   ├── stories/                    # Función de historias de 24 horas
│   │   ├── __init__.py
│   │   ├── admin.py               # Interfaz admin para Story y StoryView
│   │   ├── apps.py                # Configuración de la app
│   │   ├── models.py              # Modelos Story y StoryView
│   │   ├── serializers.py         # Serializadores de historias
│   │   ├── urls.py                # Endpoints de historias
│   │   └── views.py               # CRUD de historias y seguimiento de vistas
│   │
│   └── messages/                   # Mensajería en tiempo real
│       ├── __init__.py
│       ├── admin.py               # Interfaz admin para ChatRoom, Message, MessageRead
│       ├── apps.py                # Configuración de la app
│       ├── consumers.py           # Consumidores WebSocket para chat en tiempo real
│       ├── models.py              # Modelos ChatRoom, Message y MessageRead
│       ├── routing.py             # Enrutamiento de URLs WebSocket
│       ├── serializers.py         # Serializadores de mensajes
│       ├── urls.py                # Endpoints HTTP de mensajes
│       └── views.py               # Operaciones de salas de chat y mensajes
│
├── config/                         # Configuración del proyecto Django
│   ├── __init__.py
│   ├── asgi.py                    # Configuración ASGI para WebSockets
│   ├── settings.py                # Configuración del proyecto
│   ├── urls.py                    # Configuración principal de URLs
│   └── wsgi.py                    # Configuración WSGI para HTTP
│
├── .env.example                    # Plantilla de variables de entorno
└── manage.py                       # Script de gestión de Django
```

## Dependencias de Módulos

### App de Autenticación

**Dependencias:**
- `rest_framework` - Para vistas API y serializadores
- `rest_framework_simplejwt` - Para generación de tokens JWT
- `django.contrib.auth` - Para modelo de usuario y validación de contraseñas

**Propósito:** Gestiona el registro de usuarios y la autenticación usando tokens JWT.

**Componentes Clave:**
- `RegisterSerializer` - Valida y crea nuevas cuentas de usuario
- `CustomTokenObtainPairSerializer` - Personaliza el payload del token JWT
- `RegisterView` - Crea nuevas cuentas de usuario
- `CustomTokenObtainPairView` - Genera tokens JWT para el inicio de sesión

### App de Usuarios

**Dependencias:**
- `django.contrib.auth.models.AbstractUser` - Modelo base de usuario
- `rest_framework` - Para vistas API y serializadores

**Propósito:** Gestiona perfiles de usuario, relaciones y conexiones sociales.

**Modelos:**
- `User` (extiende AbstractUser) - Perfil de usuario con características sociales
  - Campos: email, bio, profile_picture, cover_picture, location, website, is_private
  - Métodos: get_followers_count(), get_following_count()
- `Follow` - Relaciones de seguidor/seguido
  - Campos: follower, following, created_at
  - Restricción única: (follower, following)

**Características Clave:**
- Gestión de perfiles de usuario
- Funcionalidad de seguir/dejar de seguir
- Listas de seguidores y seguidos
- Configuración de privacidad del perfil

### App de Publicaciones

**Dependencias:**
- `django.contrib.auth.get_user_model()` - Para referencias de usuario
- `apps.users.models.Follow` - Para filtrar publicaciones de usuarios seguidos

**Propósito:** Gestiona publicaciones de redes sociales con likes y comentarios.

**Modelos:**
- `Post` - Publicaciones de usuario
  - Campos: author, content, image, created_at, updated_at
  - Métodos: get_likes_count(), get_comments_count()
- `Like` - Likes de publicaciones
  - Campos: user, post, created_at
  - Restricción única: (user, post)
- `Comment` - Comentarios de publicaciones
  - Campos: author, post, content, created_at, updated_at

**Características Clave:**
- Crear, leer, actualizar, eliminar publicaciones
- Dar/quitar like a publicaciones
- Comentar publicaciones
- Feed muestra publicaciones de usuarios seguidos

### App de Historias

**Dependencias:**
- `django.contrib.auth.get_user_model()` - Para referencias de usuario
- `django.utils.timezone` - Para gestión de expiración
- `apps.users.models.Follow` - Para filtrar historias de usuarios seguidos

**Propósito:** Implementa historias de 24 horas estilo Instagram.

**Modelos:**
- `Story` - Historias de usuario
  - Campos: author, content, image, video, background_color, created_at, expires_at
  - Propiedades: is_expired
  - Métodos: get_views_count()
  - Auto-expiración: 24 horas desde la creación
- `StoryView` - Seguimiento de vistas de historias
  - Campos: user, story, viewed_at
  - Restricción única: (user, story)

**Características Clave:**
- Crear historias con texto, imágenes o videos
- Las historias expiran automáticamente después de 24 horas
- Seguimiento de vistas (quién vio cada historia)
- Feed muestra historias de usuarios seguidos

### App de Mensajes

**Dependencias:**
- `channels` - Para soporte WebSocket
- `channels_redis` - Para backend de capa de canales
- `django.contrib.auth.get_user_model()` - Para referencias de usuario

**Propósito:** Funcionalidad de chat en tiempo real con mensajería privada y grupal.

**Modelos:**
- `ChatRoom` - Contenedor de sala de chat
  - Campos: participants (ManyToMany), created_at, updated_at
  - Propiedad: room_name
- `Message` - Mensajes individuales
  - Campos: chat_room, sender, content, image, is_read, created_at, updated_at
- `MessageRead` - Confirmaciones de lectura
  - Campos: message, user, read_at
  - Restricción única: (message, user)

**Características Clave:**
- Chats privados uno a uno
- Soporte de mensajería grupal
- Entrega de mensajes en tiempo real vía WebSockets
- Confirmaciones de lectura
- Indicadores de escritura
- Historial de mensajes

**Consumidor WebSocket:**
- `ChatConsumer` - Gestiona conexiones WebSocket
  - Métodos: connect(), disconnect(), receive()
  - Tipos de mensaje: message, typing
  - Difusión de mensajes en tiempo real

## Dependencias de Importación

### Importaciones Entre Apps

Las siguientes importaciones entre apps existen y están correctamente estructuradas:

1. **posts → users**
   ```python
   from apps.users.models import Follow
   ```
   Usado para filtrar publicaciones de usuarios seguidos.

2. **stories → users**
   ```python
   from apps.users.models import Follow
   ```
   Usado para filtrar historias de usuarios seguidos.

Estas importaciones son seguras y no crean dependencias circulares.

### Dependencias Externas

Todas las apps dependen de:
- `django` - Framework Django principal (4.2.11 LTS)
- `rest_framework` - Django REST Framework (3.14.0)
- `rest_framework_simplejwt` - Autenticación JWT (5.3.0)

Dependencias adicionales:
- `channels` - Soporte WebSocket (4.0.0)
- `channels-redis` - Capa de canales Redis (4.2.0)
- `redis` - Cliente Redis (5.0.1)
- `corsheaders` - Cabeceras CORS (4.3.1)
- `djongo` - Backend MongoDB (1.3.6)
- `pymongo` - Driver MongoDB (3.12.3)
- `Pillow` - Procesamiento de imágenes (10.2.0)
- `python-decouple` - Variables de entorno (3.8)
- `daphne` - Servidor ASGI (4.0.0)

## Configuración

### Módulos de Configuración

**INSTALLED_APPS:**
```python
DJANGO_APPS = [
    'daphne',                          # Servidor ASGI (debe ser primero)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',                  # Framework REST API
    'rest_framework_simplejwt',        # Autenticación JWT
    'corsheaders',                     # Cabeceras CORS
    'channels',                        # Soporte WebSocket
]

LOCAL_APPS = [
    'apps.authentication',             # Autenticación de usuarios
    'apps.users',                      # Perfiles de usuario
    'apps.posts',                      # Publicaciones sociales
    'apps.stories',                    # Historias de 24 horas
    'apps.messages',                   # Mensajería en tiempo real
]
```

**MIDDLEWARE:**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS (debe ser primero)
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### Configuración de URLs

**URLs Principales (config/urls.py):**
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/stories/', include('apps.stories.urls')),
    path('api/messages/', include('apps.messages.urls')),
]
```

### Configuración ASGI

**Enrutamiento WebSocket (config/asgi.py):**
```python
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.messages.routing.websocket_urlpatterns
        )
    ),
})
```

## Esquema de Base de Datos

### Modelo de Usuario (Personalizado)
- Extiende `AbstractUser`
- Campos personalizados para características sociales
- Fotos de perfil y portada
- Configuración de privacidad

### Relaciones
- User ←→ Follow (seguidor/seguido)
- User → Post (autor)
- User → Like (likes de usuario)
- User → Comment (autor)
- User → Story (autor)
- User → StoryView (espectador)
- User → ChatRoom (participantes, muchos a muchos)
- User → Message (remitente)
- User → MessageRead (lector)

## Endpoints de la API

### Autenticación
- `POST /api/auth/register/` - Registrar nuevo usuario
- `POST /api/auth/login/` - Iniciar sesión y obtener tokens JWT
- `POST /api/auth/token/refresh/` - Refrescar token de acceso

### Usuarios
- `GET /api/users/profile/` - Obtener perfil del usuario actual
- `PUT /api/users/profile/` - Actualizar perfil del usuario actual
- `GET /api/users/users/` - Listar todos los usuarios
- `GET /api/users/users/<username>/` - Obtener usuario específico
- `POST /api/users/follow/<username>/` - Seguir usuario
- `DELETE /api/users/unfollow/<username>/` - Dejar de seguir usuario
- `GET /api/users/<username>/followers/` - Obtener seguidores del usuario
- `GET /api/users/<username>/following/` - Obtener seguidos del usuario

### Publicaciones
- `GET /api/posts/` - Listar publicaciones (feed)
- `POST /api/posts/` - Crear nueva publicación
- `GET /api/posts/<id>/` - Obtener publicación específica
- `PUT /api/posts/<id>/` - Actualizar publicación
- `DELETE /api/posts/<id>/` - Eliminar publicación
- `GET /api/posts/user/<username>/` - Obtener publicaciones del usuario
- `POST /api/posts/<id>/like/` - Dar/quitar like a publicación
- `POST /api/posts/<id>/comment/` - Comentar publicación
- `GET /api/posts/<id>/comments/` - Obtener comentarios de publicación

### Historias
- `GET /api/stories/` - Listar historias activas (feed)
- `POST /api/stories/` - Crear nueva historia
- `GET /api/stories/user/<username>/` - Obtener historias del usuario
- `POST /api/stories/<id>/view/` - Marcar historia como vista
- `GET /api/stories/<id>/viewers/` - Obtener espectadores de historia (solo autor)

### Mensajes
- `GET /api/messages/chats/` - Listar salas de chat
- `POST /api/messages/chats/` - Crear sala de chat
- `GET /api/messages/chats/<id>/` - Obtener detalles de sala de chat
- `GET /api/messages/chats/<id>/messages/` - Obtener mensajes del chat
- `POST /api/messages/chats/<id>/read/` - Marcar mensajes como leídos
- `POST /api/messages/chat/create/<username>/` - Crear chat privado

### WebSockets
- `ws://host/ws/chat/<room_name>/` - Conectar a sala de chat

## Pruebas de Módulos

Cada módulo puede ser probado independientemente:

1. **Pruebas Unitarias**: Probar modelos, serializadores y vistas
2. **Pruebas de Integración**: Probar endpoints de la API
3. **Pruebas WebSocket**: Probar mensajería en tiempo real

Ver `TESTING_GUIDE.md` para instrucciones detalladas de pruebas.

## Mantenimiento de Módulos

### Añadir Nuevas Apps

1. Crear estructura de la app:
   ```bash
   cd backend/apps
   python ../manage.py startapp newapp
   ```

2. Añadir a `INSTALLED_APPS` en settings.py
3. Crear modelos, vistas, serializadores, urls
4. Crear admin.py para registro de modelos
5. Incluir URLs en config/urls.py principal

### Modificar Apps Existentes

1. Actualizar modelos (crear migraciones)
2. Actualizar serializadores
3. Actualizar vistas
4. Actualizar interfaz de administración
5. Actualizar pruebas
6. Documentar cambios

## Consideraciones de Seguridad

- Tokens JWT para autenticación
- Protección CSRF habilitada
- CORS configurado para el frontend
- Configuración de privacidad de usuario
- Confirmaciones de lectura para mensajes
- Controles de visibilidad de perfil

## Consideraciones de Rendimiento

- Índices de base de datos en claves foráneas
- Paginación en endpoints de lista (20 elementos por página)
- Auto-expiración de historias vía base de datos
- Redis para capa de canales (rendimiento WebSocket)
- Optimización de imágenes con Pillow

## Mejoras Futuras

Mejoras potenciales:
1. Migrar a PostgreSQL para mejor soporte del ORM de Django
2. Añadir búsqueda de texto completo para publicaciones y usuarios
3. Implementar caché con Redis
4. Añadir notificaciones push
5. Implementar compresión de medios
6. Añadir moderación de contenido
7. Implementar limitación de tasa
8. Añadir registro de actividad
9. Implementar análisis de datos
10. Añadir notificaciones por correo electrónico

---

Para más información, ver:
- `BACKEND_FIXES.md` - Detalles sobre correcciones aplicadas
- `TESTING_GUIDE.md` - Procedimientos de pruebas
- `README.md` - Información general del proyecto
