# RED-RED API Documentation

## 🔐 Autenticación

### Registro de Usuario

```http
POST /api/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

**Validaciones:**

- Username: alfanumérico + guiones bajos, único
- Email: formato válido, único
- Password: mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
- Full_name: requerido

**Response 201:**

```json
{
  "id": 1,
  "username": "usuario123",
  "email": "usuario@example.com",
  "full_name": "Usuario Ejemplo",
  "profile_picture": null,
  "bio": "",
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

### Login

```http
POST /api/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response 200:**

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@example.com",
    "full_name": "Usuario Ejemplo",
    "profile_picture": "url",
    "bio": "Mi biografía"
  }
}
```

### Refresh Token

```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}
```

**Response 200:**

```json
{
  "access": "new_jwt_access_token"
}
```

## 👤 Perfil de Usuario

### Obtener Perfil Actual

```http
GET /api/profile/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "id": 1,
  "username": "usuario123",
  "email": "usuario@example.com",
  "full_name": "Usuario Ejemplo",
  "profile_picture": "url",
  "bio": "Mi biografía",
  "followers_count": 42,
  "following_count": 15,
  "posts_count": 23
}
```

### Actualizar Perfil

```http
PATCH /api/profile/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "full_name": "string",
  "bio": "string",
  "profile_picture": File
}
```

**Validaciones imagen:**

- MIME types: image/jpeg, image/png, image/gif, image/webp
- Tamaño máximo: 5MB

### Buscar Usuarios

```http
GET /api/users/search/?q={query}
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "results": [
    {
      "id": 2,
      "username": "otro_usuario",
      "full_name": "Otro Usuario",
      "profile_picture": "url",
      "is_following": false
    }
  ]
}
```

## 📝 Publicaciones

### Listar Feed de Publicaciones

```http
GET /api/posts/?page={page}
Authorization: Bearer {access_token}
```

**Query params:**

- page: número de página (default: 1)
- page_size: elementos por página (default: 20, max: 100)

**Response 200:**

```json
{
  "count": 100,
  "next": "url_next_page",
  "previous": "url_prev_page",
  "results": [
    {
      "id": 1,
      "author": {
        "id": 2,
        "username": "usuario123",
        "full_name": "Usuario Ejemplo",
        "profile_picture": "url"
      },
      "content": "Contenido de la publicación",
      "image": "url_imagen",
      "likes_count": 42,
      "comments_count": 15,
      "is_liked": true,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Crear Publicación

```http
POST /api/posts/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "content": "string",
  "image": File
}
```

**Validaciones:**

- Content o image debe estar presente (no ambos vacíos)
- Content máximo: 500 caracteres
- Image validaciones: MIME type y tamaño (5MB)

**Response 201:**

```json
{
  "id": 1,
  "content": "Mi nueva publicación",
  "image": "url",
  "likes_count": 0,
  "comments_count": 0,
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Actualizar Publicación

```http
PUT /api/posts/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "string"
}
```

**Permisos:** Solo el autor puede editar

### Eliminar Publicación

```http
DELETE /api/posts/{id}/
Authorization: Bearer {access_token}
```

**Permisos:** Solo el autor puede eliminar

**Response 204:** No content

### Like/Unlike Publicación

```http
POST /api/posts/{id}/like/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "liked": true,
  "likes_count": 43
}
```

### Listar Comentarios

```http
GET /api/posts/{post_id}/comments/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "results": [
    {
      "id": 1,
      "author": {
        "id": 3,
        "username": "usuario456",
        "full_name": "Usuario 456",
        "profile_picture": "url"
      },
      "content": "Gran publicación!",
      "created_at": "2024-01-01T12:05:00Z"
    }
  ]
}
```

### Crear Comentario

```http
POST /api/posts/{post_id}/comments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "string"
}
```

**Validaciones:**

- Content: requerido, máximo 200 caracteres

## 💬 Chat (Mensajería)

### Listar Conversaciones

```http
GET /api/chat/chats/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "results": [
    {
      "id": 1,
      "other_user": {
        "id": 2,
        "username": "usuario123",
        "full_name": "Usuario Ejemplo",
        "profile_picture": "url"
      },
      "last_message": {
        "content": "Hola!",
        "timestamp": "2024-01-01T12:00:00Z"
      },
      "unread_count": 3,
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Crear Chat Privado

```http
POST /api/chat/chat/create/{username}/
Authorization: Bearer {access_token}
```

**Response 201:** (si es nuevo)

```json
{
  "id": 1,
  "other_user": {
    "id": 2,
    "username": "usuario123",
    "full_name": "Usuario Ejemplo",
    "profile_picture": "url"
  },
  "unread_count": 0
}
```

**Response 200:** (si ya existe)

```json
{
  "id": 1,
  "message": "Chat already exists"
}
```

### Listar Mensajes de Chat

```http
GET /api/chat/chats/{chat_id}/messages/?page={page}
Authorization: Bearer {access_token}
```

**Query params:**

- page: número de página (default: 1)
- page_size: mensajes por página (default: 20, max: 100)

**Response 200:**

```json
{
  "count": 50,
  "next": "url_next_page",
  "previous": "url_prev_page",
  "results": [
    {
      "id": 1,
      "sender_id": 1,
      "sender_username": "yo",
      "content": "Hola, ¿cómo estás?",
      "timestamp": "2024-01-01T12:00:00Z",
      "is_read": true
    }
  ]
}
```

**Nota:** Los mensajes se ordenan de más reciente a más antiguo (usar `reverse()` en frontend)

### Marcar Mensajes como Leídos

```http
POST /api/chat/chats/{chat_id}/read/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "status": "messages marked as read"
}
```

## 🔌 WebSocket (Chat en Tiempo Real)

### Conexión

```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${access_token}`);
```

### Formato de Mensajes

#### Enviar Mensaje

```json
{
  "type": "chat_message",
  "message": {
    "content": "Hola!",
    "sender": 1,
    "room": 1
  }
}
```

#### Recibir Mensaje

```json
{
  "type": "chat_message",
  "message": {
    "id": 123,
    "content": "Hola!",
    "sender": 2,
    "sender_id": 2,
    "sender_username": "usuario123",
    "room": 1,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### Typing Indicator - Iniciar

```json
{
  "type": "typing_start",
  "room": 1,
  "user": 1
}
```

#### Typing Indicator - Detener

```json
{
  "type": "typing_stop",
  "room": 1,
  "user": 1
}
```

#### Recibir Typing

```json
{
  "type": "typing",
  "user_id": 2,
  "username": "usuario123",
  "is_typing": true
}
```

### Manejo de Errores WebSocket

**Error de Autenticación:**

```json
{
  "type": "error",
  "message": "Invalid token"
}
```

**Reconexión:**

- Implementar backoff exponencial: 1s, 2s, 4s, 8s, 16s, 30s (max)
- Máximo 5 intentos de reconexión
- Mostrar toast/notificación al usuario

## 📖 Historias

### Listar Historias Activas

```http
GET /api/stories/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "usuario123",
        "full_name": "Usuario Ejemplo",
        "profile_picture": "url"
      },
      "image": "url",
      "content": "¡Mira esto!",
      "views_count": 42,
      "created_at": "2024-01-01T12:00:00Z",
      "expires_at": "2024-01-02T12:00:00Z",
      "is_viewed": false
    }
  ]
}
```

**Nota:** Solo se muestran historias de las últimas 24 horas

### Crear Historia

```http
POST /api/stories/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "image": File,
  "content": "string"
}
```

**Validaciones:**

- Image: requerido
- Content: opcional, máximo 200 caracteres

### Ver Historia (Incrementar Contador)

```http
POST /api/stories/{id}/view/
Authorization: Bearer {access_token}
```

## 🔗 Seguir/Dejar de Seguir

### Seguir Usuario

```http
POST /api/users/{username}/follow/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "status": "now following",
  "is_following": true
}
```

### Dejar de Seguir

```http
DELETE /api/users/{username}/follow/
Authorization: Bearer {access_token}
```

**Response 200:**

```json
{
  "status": "unfollowed",
  "is_following": false
}
```

### Listar Seguidores

```http
GET /api/users/{username}/followers/
Authorization: Bearer {access_token}
```

### Listar Siguiendo

```http
GET /api/users/{username}/following/
Authorization: Bearer {access_token}
```

## 🚨 Códigos de Error Comunes

| Código | Significado                                     |
| ------ | ----------------------------------------------- |
| 400    | Bad Request - Datos inválidos                   |
| 401    | Unauthorized - Token inválido o expirado        |
| 403    | Forbidden - Sin permisos                        |
| 404    | Not Found - Recurso no encontrado               |
| 413    | Payload Too Large - Archivo muy grande          |
| 415    | Unsupported Media Type - MIME type no soportado |
| 429    | Too Many Requests - Rate limit excedido         |
| 500    | Internal Server Error - Error del servidor      |

## 📊 Rate Limiting

- **Autenticación:** 5 intentos/min
- **API General:** 100 requests/min por usuario
- **WebSocket:** Reconexión con backoff exponencial

## 🔒 Seguridad

### Headers Requeridos

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### CORS

Dominios permitidos configurados en backend

### Validación de Uploads

- MIME type whitelist
- Tamaño máximo: 5MB
- Sanitización de nombres de archivo

### Tokens JWT

- Access token: 60 minutos
- Refresh token: 24 horas
- Renovación automática con interceptor

## 📚 Mejores Prácticas

1. **Paginación:** Siempre usar parámetros de página para listas grandes
2. **Caching:** Configurar staleTime y cacheTime en React Query
3. **WebSocket:** Implementar reconexión automática con backoff
4. **Optimistic Updates:** Actualizar UI antes de confirmar con servidor
5. **Error Handling:** Mostrar mensajes claros al usuario
6. **Loading States:** Indicar carga en todas las operaciones
7. **Validation:** Validar en frontend antes de enviar al backend
