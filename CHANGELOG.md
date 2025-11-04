# Changelog - Red Social Improvements

## 📅 Fecha: 1 de Noviembre de 2025

### 🎨 Nuevas Funcionalidades

#### ✅ Mejora de Comentarios con Likes y Diseño Renovado

- **Likes en comentarios**: Los usuarios pueden dar like a comentarios individuales
- **Notificaciones**: Sistema de notificaciones en tiempo real para likes en comentarios
- **Diseño mejorado**: 
  - Burbujas de comentarios con gradientes y sombras suaves
  - Avatares con rings coloridos
  - Scroll personalizado para muchos comentarios
  - Animaciones suaves en hover
  - Estado vacío con iconos descriptivos
- **Modelo CommentLike**: Nueva tabla para gestionar likes en comentarios
- **API actualizada**: Nuevos campos `likes_count` e `is_liked` en comentarios
- **Endpoint nuevo**: `POST /api/posts/comments/<comment_id>/like/`
- **Migración**: `0004_commentlike.py` aplicada exitosamente

#### ✅ Soporte para GIFs en Posts

- **Modelo Post**: Campo `image` actualizado de `ImageField` a `FileField` para soportar GIFs animados
- **Validación**: Se añadió `image/gif` a los tipos de archivo permitidos
- **Formatos soportados**: JPEG, PNG, WebP y **GIF** (nuevo)
- **Límite de tamaño**: 10 MB por archivo
- **Frontend**: Compatible automáticamente con la etiqueta `<img>` estándar
- **Migración**: `0003_alter_post_image.py` aplicada exitosamente

---

## 📅 Fecha: Octubre 2025

### 🎯 Resumen

Mejoras completas de frontend y backend para la red social, incluyendo notificaciones en tiempo real, sistema de compartir posts, edición de perfil avanzada y mejoras UX generales.

---

## 🔧 Backend Improvements

### ✅ Serializadores Mejorados

- **PostSerializer, CommentSerializer, StorySerializer**: Ahora incluyen información completa del autor
  - `author_id`
  - `author_username`
  - `author_first_name`
  - `author_last_name`
  - `author_profile_picture`

### ✅ Sistema de Compartir Posts

- **Modelo**: `SharedPost` con campos:
  - `shared_by` (ForeignKey User)
  - `original_post` (ForeignKey Post)
  - `shared_with` (ForeignKey User, nullable)
  - `message` (TextField, 500 chars)
- **Endpoints**:
  - `POST /api/posts/<id>/share/` - Compartir post con usuario específico
  - `GET /api/posts/shared/` - Ver posts compartidos contigo

### ✅ Búsqueda Mejorada

- `UserListView.get_queryset()` ahora excluye al usuario actual de los resultados
- Campo `is_following` en respuesta para indicar estado de seguimiento

### ✅ Notificaciones en Tiempo Real (WebSocket)

- **NotificationConsumer**: Consumer WebSocket asíncrono
  - `ws://localhost:8000/ws/notifications/?token=<JWT>`
  - Eventos: `connection_established`, `new_notification`, `unread_count`
  - Acciones: `mark_read`, `mark_all_read`, `get_notifications`
- **Signals**: Notificaciones automáticas para:
  - Likes en posts
  - Comentarios
  - Nuevos seguidores
  - Posts compartidos
- **Routing**: Integrado en `asgi.py` con `JwtAuthMiddlewareStack`

### ✅ Validación de Imágenes de Perfil

- **UserProfileSerializer**: Validaciones implementadas
  - Profile picture: máx 5MB, tipos permitidos: jpg, jpeg, png, gif
  - Cover picture: máx 10MB, tipos permitidos: jpg, jpeg, png, gif
  - Email: validación de formato

### ✅ Endpoint de Cambio de Contraseña

- `POST /api/users/change-password/`
  - Requiere: `current_password`, `new_password`
  - Validación de contraseña actual
  - Mínimo 8 caracteres para nueva contraseña

---

## 🎨 Frontend Improvements

### ✅ LoadingSpinner Component

**Ubicación**: `frontend/src/components/LoadingSpinner.js`

Componente reutilizable con 4 variantes:

- **spinner**: Icono Loader2 rotando (por defecto)
- **dots**: 3 puntos animados con motion
- **pulse**: Círculo pulsante
- **skeleton**: 3 barras con efecto shimmer

**Props**:

```jsx
<LoadingSpinner
  variant="spinner|dots|pulse|skeleton"
  size="sm|md|lg|xl"
  text="Texto opcional"
  fullScreen={true | false}
  className="clases adicionales"
/>
```

**Implementado en**:

- `Home.js` - skeleton para posts iniciales, dots para lista, pulse para comentarios
- `Profile.js` - spinner con fullScreen
- `Search.js` - dots para búsqueda
- `Stories.js` - pulse con fullScreen

### ✅ Home.js - Feed de Publicaciones

**Mejoras**:

- ✅ Muestra `author_username`, nombre completo y foto de perfil en posts
- ✅ Botón "Compartir" funcional con prompt para mensaje
- ✅ Comentarios muestran autor con username y foto
- ✅ LoadingSpinner en lugar de spinners inline
- ✅ Mutaciones con feedback toast

### ✅ NotificationCenter - Notificaciones en Tiempo Real

**Ubicación**: `frontend/src/components/NotificationCenter.js`

**Características**:

- ✅ Conexión WebSocket automática con token JWT
- ✅ Indicador visual de conexión (punto verde pulsante)
- ✅ Bell icon cambia color según estado (conectado/desconectado)
- ✅ Badge animado con contador de no leídas
- ✅ Sonido de notificación (`notification.mp3`, volumen 0.3)
- ✅ Toast notifications con iconos personalizados
- ✅ Reconexión automática (máx 5 intentos, 3s delay)
- ✅ Listeners para eventos: `connected`, `disconnected`, `new_notification`, `unread_count`
- ✅ Botón "Marcar todas como leídas" funcional

### ✅ ProfileEdit Component

**Ubicación**: `frontend/src/components/ProfileEdit.js`

**Características**:

- ✅ Modal centrado con overlay
- ✅ Cover image upload (10MB max)
  - Preview instantáneo con FileReader
  - Icono de cámara en hover
  - Validación de tamaño y tipo
- ✅ Profile picture upload (5MB max)
  - Preview circular
  - Ring border blanco
  - Validación de tamaño y tipo
- ✅ Campos editables:
  - `first_name`, `last_name`
  - `bio` (200 caracteres max con contador)
  - `location`, `website`, `date_of_birth`
- ✅ FormData para multipart upload
- ✅ Toast feedback para errores y éxito
- ✅ Botón "Guardar" con loader animation (Loader2)

**Integración**:

- Botón "Editar perfil" en `Profile.js` (solo visible en propio perfil)
- State: `showEditProfile` controla visibilidad del modal
- Click en Settings icon abre el modal

### ✅ Settings Page - Configuración Completa

**Ubicación**: `frontend/src/pages/Settings.js`

**4 Tabs Implementadas**:

1. **Perfil** (Profile)

   - Edición inline de nombre, apellido, bio, ubicación, website
   - Botón "Guardar" con feedback

2. **Privacidad** (Privacy)

   - Visibilidad del perfil (público/amigos/privado)
   - Toggle switches para:
     - Permitir solicitudes de amistad
     - Mostrar email
     - Mensajes de desconocidos
     - Estado en línea

3. **Notificaciones** (Notifications)

   - Toggle para notificaciones email y push
   - Configuración granular:
     - Likes en posts
     - Comentarios
     - Nuevos seguidores
     - Mensajes privados

4. **Seguridad** (Security)
   - ✅ **Cambio de contraseña funcional**:
     - Campo `current_password` (requerido)
     - Campo `new_password` (min 8 caracteres)
     - Campo `confirm_password` (debe coincidir)
     - Validaciones frontend con mensajes de error
     - Toast de éxito/error
     - Reset de formulario al éxito
   - 🔜 Autenticación 2FA (próximamente)
   - 🔜 Sesiones activas (próximamente)

### ✅ Search.js - Búsqueda de Usuarios

**Mejoras**:

- ✅ Usuario actual excluido de resultados
- ✅ Botón dinámico según `is_following`:
  - "Siguiendo" (gris) si ya sigue
  - "Seguir" (azul) si no sigue
- ✅ Mutation `unfollowMutation` para dejar de seguir
- ✅ LoadingSpinner dots durante búsqueda

### ✅ Stories.js - Historias

**Mejoras**:

- ✅ Muestra `author_username`, nombre completo y foto en cada historia
- ✅ Grid responsive de historias
- ✅ Modal viewer mejorado
- ✅ LoadingSpinner pulse en carga

### ✅ Messages.js - Chat

**Verificado**:

- ✅ Formato JSON correcto con extracción de `messageObj`
- ✅ Display de `content`, `sender_username`, `timestamp`
- ✅ No se muestran JSON literales en UI

---

## 🔌 WebSocket Infrastructure

### notificationService.js

**Ubicación**: `frontend/src/services/notificationService.js`

**Patrón**: Singleton con gestión de conexión

**Métodos**:

- `connect(token)` - Establece conexión WebSocket con JWT
- `disconnect()` - Cierra conexión
- `send(data)` - Envía mensaje al servidor
- `markAsRead(notificationId)` - Marca notificación como leída
- `markAllAsRead()` - Marca todas como leídas
- `addListener(callback)` - Registra listener para mensajes
- `removeListener(callback)` - Remueve listener

**Reconexión**:

- Automática al cerrar conexión
- Máximo 5 intentos
- Delay de 3 segundos entre intentos
- Exponential backoff opcional

---

## 📊 Estado del Proyecto

### ✅ Completado (15/16 tareas)

1. ✅ Backend: Serializadores con username
2. ✅ Backend: Endpoint compartir posts
3. ✅ Backend: Filtrar usuario actual en búsqueda
4. ✅ Backend: Sistema notificaciones WebSocket
5. ✅ Backend: Formato mensajes chat
6. ✅ Backend: Endpoints edición perfil
7. ✅ Frontend: Componente Post actualizado
8. ✅ Frontend: Sistema notificaciones UI
9. ✅ Frontend: Visualización mensajes
10. ✅ Frontend: Username en Stories
11. ✅ Frontend: Formulario edición perfil
12. ✅ Frontend: Estado seguimiento en búsqueda
13. ✅ Frontend: LoadingSpinner component
14. ✅ Frontend: Página configuración
15. ✅ UI/UX: Loaders implementados

### 🔄 Pendiente (1/16 tareas)

16. ⏳ Testing: Validación end-to-end completa

---

## 🚀 Próximos Pasos

### Testing Requerido

1. **Posts & Interacciones**

   - Crear post con/sin imagen
   - Editar post propio
   - Eliminar post propio
   - Like/Unlike posts
   - Comentar en posts
   - Compartir post con usuario específico

2. **Notificaciones en Tiempo Real**

   - Verificar notificación instantánea al recibir like
   - Verificar notificación al recibir comentario
   - Verificar notificación al recibir nuevo seguidor
   - Verificar notificación al compartir post
   - Probar sonido de notificación
   - Verificar badge de contador
   - Probar marcar como leída (individual)
   - Probar marcar todas como leídas

3. **Búsqueda & Seguimiento**

   - Buscar usuarios por username
   - Verificar que no aparece usuario actual
   - Seguir usuario
   - Verificar cambio a "Siguiendo"
   - Dejar de seguir
   - Verificar cambio a "Seguir"

4. **Perfil & Edición**

   - Visitar perfil propio
   - Click en "Editar perfil"
   - Subir cover picture (validar 10MB max)
   - Subir profile picture (validar 5MB max)
   - Editar bio (verificar contador 200 chars)
   - Guardar cambios
   - Verificar persistencia de cambios

5. **Historias**

   - Crear historia con/sin imagen
   - Ver historia propia
   - Ver historias de otros usuarios
   - Verificar username del autor

6. **Mensajes**

   - Enviar mensaje a usuario
   - Verificar formato correcto (no JSON literal)
   - Verificar timestamp
   - Verificar sender username

7. **Configuración**

   - Cambiar contraseña:
     - Probar validación "contraseña actual requerida"
     - Probar validación "mínimo 8 caracteres"
     - Probar validación "contraseñas no coinciden"
     - Cambiar contraseña exitosamente
     - Verificar logout y login con nueva contraseña
   - Cambiar configuración de privacidad
   - Cambiar configuración de notificaciones

8. **Responsive & UX**
   - Probar en viewport móvil (375px)
   - Probar en tablet (768px)
   - Probar en desktop (1920px)
   - Verificar animaciones con Framer Motion
   - Verificar feedback visual (toasts, loaders)
   - Verificar transiciones suaves

---

## 🛠️ Tecnologías Utilizadas

### Backend

- Django REST Framework
- Django Channels (WebSocket)
- JWT Authentication
- PostgreSQL / SQLite
- Redis (Channels Layer)

### Frontend

- React 18
- React Query (data fetching & caching)
- React Router (navigation)
- TailwindCSS (styling)
- Framer Motion (animations)
- Lucide React (icons)
- React Hot Toast (notifications)
- WebSocket API (real-time)

---

## 📝 Notas Importantes

### Configuración Requerida

1. **Backend**:

   ```python
   # settings.py
   INSTALLED_APPS += ['channels', 'notifications']
   ASGI_APPLICATION = 'config.asgi.application'
   CHANNEL_LAYERS = {
       'default': {
           'BACKEND': 'channels.layers.InMemoryChannelLayer'
       }
   }
   ```

2. **Frontend**:

   ```bash
   npm install framer-motion --legacy-peer-deps
   ```

3. **Migraciones**:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Signals** (notifications/apps.py):
   ```python
   def ready(self):
       import notifications.signals
   ```

### Archivos de Audio

- Asegurar que existe `frontend/public/notification.mp3` para sonido de notificaciones

### WebSocket URL

- Desarrollo: `ws://localhost:8000/ws/notifications/`
- Producción: Actualizar a `wss://` con dominio real

---

## 🎉 Resultado Final

Red social completamente funcional con:

- ✅ Feed de posts con autor visible
- ✅ Sistema de likes y comentarios
- ✅ Compartir posts entre usuarios
- ✅ Notificaciones en tiempo real con WebSocket
- ✅ Búsqueda inteligente de usuarios
- ✅ Edición completa de perfil con imágenes
- ✅ Historias con información de autor
- ✅ Chat con formato correcto
- ✅ Configuración completa con cambio de contraseña
- ✅ LoadingSpinners elegantes en toda la app
- ✅ Diseño moderno y responsive
- ✅ Feedback visual con toasts y animaciones

---

**Desarrollado con ❤️ para DAM2 Framework Project**
