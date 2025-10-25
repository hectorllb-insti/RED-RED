# RED-RED - Guía de Testing Manual

## 🧪 Checklist de Testing Pre-Producción

### 1. Autenticación y Registro ✅

#### Registro de Usuario

- [ ] Abrir `http://localhost:3000/register`
- [ ] Intentar registrar con username inválido (con espacios o caracteres especiales)
  - ✅ Debe mostrar error de validación
- [ ] Intentar registrar con password débil (< 8 chars, sin mayúsculas/números)
  - ✅ Debe mostrar indicador rojo y no permitir envío
- [ ] Registrar con datos válidos:
  - Username: `testuser123`
  - Email: `test@example.com`
  - Password: `Test1234!`
  - Full Name: `Test User`
  - ✅ Debe crear usuario y redireccionar al feed

#### Login

- [ ] Logout del usuario actual
- [ ] Intentar login con credenciales incorrectas
  - ✅ Debe mostrar error
- [ ] Login con credenciales correctas
  - ✅ Debe redireccionar al feed y mostrar perfil

#### JWT Refresh

- [ ] Después de 1 hora con sesión activa
  - ✅ El token debe refrescarse automáticamente sin interrupciones

### 2. Sistema de Chat 💬

#### **CORRECCIÓN APLICADA**: Mensajes ya NO muestran JSON literal ✅

**Problema anterior**: Los mensajes se mostraban como:

```
{'content': 'hola', 'sender': 1, 'timestamp': '2025-10-25T15:30:02.723Z'}
```

**Corrección**: Actualizado `Messages.js` para extraer correctamente el `content` del mensaje sin usar `JSON.stringify()`.

#### Crear Conversación

- [ ] Click en botón "+" en la sección Mensajes
- [ ] Buscar usuario existente por username
- [ ] Crear chat
  - ✅ Debe crear conversación y abrir chat

#### Enviar Mensajes

- [ ] Escribir mensaje y enviar
  - ✅ Mensaje debe aparecer instantáneamente
  - ✅ Debe mostrarse con alineación a la derecha
  - ✅ Color primario de fondo

#### Recibir Mensajes (requiere 2 usuarios)

- [ ] Usuario 2 envía mensaje a Usuario 1
  - ✅ Usuario 1 debe recibir mensaje en tiempo real
  - ✅ Contador de no leídos debe incrementar
  - ✅ Conversación debe moverse al top de la lista

#### Marcar como Leído

- [ ] Seleccionar conversación con mensajes no leídos
  - ✅ Contador debe desaparecer
  - ✅ Badge rojo debe ocultarse

#### Infinite Scroll

- [ ] En chat con > 20 mensajes
- [ ] Scroll hasta arriba del contenedor
  - ✅ Debe cargar automáticamente página anterior
  - ✅ Mostrar spinner de carga arriba
  - ✅ Mantener posición de scroll
  - ✅ Continuar cargando hasta que no haya más mensajes

#### Búsqueda de Conversaciones

- [ ] Escribir en campo de búsqueda
- [ ] Buscar por:
  - Nombre del usuario
  - Username
  - Contenido del último mensaje
  - ✅ Debe filtrar en tiempo real
  - ✅ Mostrar EmptyState si no hay resultados

#### Indicadores de Typing

- [ ] Usuario 1 empieza a escribir
  - ✅ Usuario 2 debe ver "escribiendo..." después de 500ms
- [ ] Usuario 1 para de escribir por 2 segundos
  - ✅ Indicador debe desaparecer

#### Reconexión WebSocket

- [ ] Detener servidor backend mientras hay chat abierto
  - ✅ Debe mostrar toast "Reconectando..."
  - ✅ Indicador visual en header del chat
- [ ] Reiniciar servidor
  - ✅ Debe reconectar automáticamente
  - ✅ Mostrar toast "Conectado"
  - ✅ Mensajes deben seguir funcionando

### 3. Publicaciones 📝

#### **CORRECCIONES APLICADAS** ✅

1. **Compartir publicaciones**: Ahora solicita username del destinatario correctamente
2. **Actualización de imagen de perfil**: Las imágenes se actualizan en posts/historias después de cambiarlas

#### Crear Post

- [ ] Click en "¿Qué estás pensando?"
- [ ] Escribir texto de prueba
- [ ] Enviar sin imagen
  - ✅ Debe aparecer en feed inmediatamente
- [ ] Crear post solo con imagen
  - ✅ Preview debe mostrarse antes de publicar
- [ ] Intentar subir archivo > 5MB
  - ✅ Debe rechazarse con error
- [ ] Intentar subir archivo no-imagen (.txt, .pdf)
  - ✅ Debe rechazarse con error de MIME type

#### Like/Unlike

- [ ] Dar like a un post
  - ✅ Contador debe incrementar
  - ✅ Icono debe cambiar a filled
  - ✅ Actualización debe ser instantánea
- [ ] Unlike
  - ✅ Contador debe decrementar
  - ✅ Icono debe cambiar a outline

#### Comentarios

- [ ] Abrir sección de comentarios
- [ ] Escribir y enviar comentario
  - ✅ Debe aparecer en la lista
  - ✅ Contador de comentarios debe incrementar

#### **Compartir Publicación** 🔄 (NUEVA FUNCIONALIDAD)

- [ ] Click en botón "Compartir" (Share2 icon)
- [ ] Prompt 1: Ingresar username del destinatario (o dejar vacío para compartir públicamente)
- [ ] Prompt 2: Agregar mensaje opcional
- [ ] Confirmar
  - ✅ Debe mostrar toast "Publicación compartida con @username" o "Publicación compartida públicamente"
  - ✅ El destinatario debe ver la publicación compartida
  - ✅ Si cancelas en cualquier prompt, no debe compartirse

**Errores a verificar**:

- [ ] Intentar compartir con tu propio username
  - ✅ Debe mostrar error "No puedes compartir una publicación contigo mismo"
- [ ] Intentar compartir con username inexistente
  - ✅ Debe mostrar error apropiado

#### Editar/Eliminar Post

- [ ] En post propio, click botón editar
- [ ] Modificar texto y guardar
  - ✅ Debe actualizarse en feed
- [ ] Click eliminar
  - ✅ Debe pedir confirmación
  - ✅ Post debe desaparecer del feed

#### EmptyState en Feed

- [ ] Con usuario nuevo sin seguir a nadie y sin posts
  - ✅ Debe mostrar EmptyState con mensaje y botón "Crear publicación"

### 4. Historias 📖

#### Crear Historia

- [ ] Subir imagen para historia
- [ ] Agregar texto opcional
- [ ] Publicar
  - ✅ Debe aparecer en barra de historias

#### Ver Historias

- [ ] Click en historia
  - ✅ Debe abrir en modal/full screen
  - ✅ Contador de vistas debe incrementar

#### Expiración

- [ ] Después de 24 horas
  - ✅ Historia debe desaparecer automáticamente

### 5. Perfil de Usuario 👤

#### Ver Perfil

- [ ] Click en nombre de usuario
- [ ] Verificar información mostrada:
  - Foto de perfil
  - Cover photo
  - Bio
  - Contadores (seguidores, siguiendo, posts)
  - ✅ Todo debe cargarse correctamente

#### **Editar Perfil** (MEJORADO) ✅

- [ ] En perfil propio, click botón "Editar perfil" (Settings icon)
- [ ] Modal debe abrirse con formulario completo
- [ ] **Cambiar Cover Picture**:
  - [ ] Click en icono de cámara sobre el cover
  - [ ] Seleccionar imagen (máx 10MB)
  - [ ] Verificar preview instantáneo
  - ✅ Debe mostrar la imagen seleccionada
- [ ] **Cambiar Profile Picture**:
  - [ ] Click en icono de cámara sobre la foto de perfil
  - [ ] Seleccionar imagen (máx 5MB)
  - [ ] Verificar preview circular
  - ✅ Debe mostrar la imagen seleccionada con border blanco
- [ ] **Editar campos**:
  - [ ] First Name / Last Name
  - [ ] Bio (máx 200 caracteres - verificar contador)
  - [ ] Location
  - [ ] Website (debe validar URL)
  - [ ] Date of Birth
- [ ] **Validaciones**:
  - [ ] Intentar subir imagen > 10MB para cover
    - ✅ Debe rechazarse con toast error
  - [ ] Intentar subir imagen > 5MB para profile
    - ✅ Debe rechazarse con toast error
  - [ ] Intentar subir archivo no-imagen
    - ✅ Debe rechazarse
  - [ ] Escribir más de 200 chars en bio
    - ✅ Contador debe mostrar en rojo cuando se pase
- [ ] Click "Guardar Cambios"
  - ✅ Debe mostrar loader en botón
  - ✅ Toast "Perfil actualizado exitosamente"
  - ✅ Modal debe cerrarse
  - ✅ **IMPORTANTE**: Verificar que la nueva imagen se muestra en:
    - Navbar (avatar en esquina)
    - Perfil propio
    - Posts publicados
    - Comentarios
    - Historias
    - Lista de chats
  - ✅ Si las imágenes no se actualizan, hacer refresh manual (F5) y deben aparecer

**Nota técnica**: Se invalidaron automáticamente las queries de `posts`, `stories`, `comments`, `chats` para refrescar imágenes.

#### Seguir/Dejar de Seguir

- [ ] En perfil de otro usuario, click "Seguir"
  - ✅ Botón debe cambiar a "Siguiendo"
  - ✅ Contador debe incrementar
- [ ] Click "Siguiendo" → "Dejar de seguir"
  - ✅ Botón debe volver a "Seguir"
  - ✅ Contador debe decrementar

### 6. Búsqueda de Usuarios 🔍

#### Buscar

- [ ] Escribir en barra de búsqueda
- [ ] Buscar por:
  - Username
  - Nombre completo
  - ✅ Resultados deben aparecer en tiempo real
- [ ] Click en resultado
  - ✅ Debe navegar al perfil del usuario

### 7. Performance y UX ⚡

#### Carga Inicial

- [ ] Abrir app con cache vacío
  - ✅ Debe cargar en < 3 segundos

#### Navegación

- [ ] Cambiar entre páginas (Home, Messages, Profile)
  - ✅ Transiciones deben ser fluidas
  - ✅ Cache debe evitar recargas innecesarias

#### Toasts/Notificaciones

- [ ] Verificar notificaciones para todas las acciones:
  - Post creado
  - Like dado
  - Chat creado
  - Error en upload
  - Reconexión WebSocket
  - ✅ Deben ser visibles pero no intrusivas
  - ✅ Deben desaparecer automáticamente

#### Loading States

- [ ] Verificar loaders en:
  - Botones durante operaciones
  - Lista de posts
  - Mensajes cargando
  - ✅ Siempre debe haber feedback visual

### 8. Responsive Design 📱

#### Desktop (> 1024px)

- [ ] Todas las funcionalidades operativas
- [ ] Layout completo visible

#### Tablet (768px - 1024px)

- [ ] Layout ajustado correctamente
- [ ] Sidebar colapsable si es necesario

#### Mobile (< 768px)

- [ ] Navegación hamburger si aplica
- [ ] Chat full-screen
- [ ] Botones accesibles

### 9. Manejo de Errores 🚨

#### Errores de Red

- [ ] Desconectar internet
- [ ] Intentar cualquier operación
  - ✅ Debe mostrar error claro
  - ✅ No debe quebrar la app

#### Errores de Validación

- [ ] Intentar acciones inválidas:
  - Registrar usuario duplicado
  - Seguir a sí mismo
  - Subir archivo muy grande
  - ✅ Errores deben ser descriptivos
  - ✅ UI debe guiar al usuario

#### 404 Not Found

- [ ] Navegar a ruta inexistente
  - ✅ Debe mostrar página 404 amigable

### 10. Seguridad 🔒

#### Autenticación

- [ ] Intentar acceder a ruta protegida sin login
  - ✅ Debe redireccionar a login

#### Autorización

- [ ] Intentar editar post de otro usuario
  - ✅ Debe ser rechazado

#### Upload Security

- [ ] Intentar subir archivo malicioso (.exe, .sh)
  - ✅ Debe ser rechazado por MIME type

#### XSS Prevention

- [ ] Crear post con script tags `<script>alert('xss')</script>`
  - ✅ Debe renderizarse como texto, no ejecutarse

## 📊 Métricas Objetivo

| Métrica                 | Objetivo | Actual |
| ----------------------- | -------- | ------ |
| Tiempo de carga inicial | < 3s     | ⏱️     |
| Tiempo respuesta API    | < 500ms  | ⏱️     |
| WebSocket latencia      | < 100ms  | ⏱️     |
| Tasa de error           | < 1%     | 📊     |
| Uptime                  | > 99%    | 📊     |

## 🐛 Reporte de Bugs

Si encuentras bugs durante el testing, documentar:

1. **Descripción:** Qué sucedió
2. **Pasos para reproducir:** Cómo llegaste al bug
3. **Comportamiento esperado:** Qué debería pasar
4. **Comportamiento actual:** Qué pasó realmente
5. **Screenshots:** Si aplica
6. **Console logs:** Errores en consola del browser
7. **Entorno:** Browser, OS, versión

## ✅ Checklist Final Pre-Deploy

- [ ] Todos los tests manuales pasados
- [ ] No hay errores en consola del browser
- [ ] No hay warnings de React en consola
- [ ] Backend sin errores 500
- [ ] Variables de entorno configuradas
- [ ] DEBUG=False en producción
- [ ] SECRET_KEY único y seguro
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS configurado correctamente
- [ ] Archivos estáticos recolectados
- [ ] Base de datos migrada
- [ ] Redis corriendo
- [ ] Gunicorn configurado
- [ ] Nginx configurado
- [ ] SSL/HTTPS configurado
- [ ] Backup de base de datos configurado
- [ ] Monitoring configurado (opcional)

## 🚀 Ready for Production!

Una vez completados todos los tests y el checklist final, la aplicación está lista para desplegarse en producción.
