# 🏗️ RED-RED - Estructura del Proyecto

---

# 🐍 BACKEND

```
backend/
│
├── 📂 apps/
│   │
│   ├── 🔐 authentication/
│   │   ├── views.py           → Login, registro, tokens  |  No necesita modelo (usa User de users/)
│   │   ├── serializers.py     → Validación credenciales  |  Valida datos de login, no del modelo
│   │   └── urls.py            → /api/auth/...  |  Solo endpoints de autenticación
│   │   ✓ Gestiona autenticación de usuarios
│   │
│   ├── 👤 users/
│   │   ├── models.py          → Datos usuario (bio, avatar)  |  Extiende User de Django
│   │   ├── views.py           → Perfil, seguir usuarios  |  Lógica de perfil y seguidores
│   │   ├── serializers.py     → JSON sin passwords  |  Oculta datos sensibles
│   │   └── urls.py            → /api/users/...  |  Endpoints de perfil y follow
│   │   ✓ Gestiona perfiles y relaciones entre usuarios
│   │
│   ├── 📝 posts/
│   │   ├── models.py          → Post, Like, Comment, SharedPost  |  Modelos de publicaciones
│   │   ├── views.py           → CRUD posts, like, comentar  |  Lógica de feed y acciones
│   │   ├── serializers.py     → JSON posts  |  Incluye datos del autor anidados
│   │   └── urls.py            → /api/posts/...  |  Endpoints de feed y acciones
│   │   ✓ Gestiona publicaciones y sus interacciones
│   │
│   ├── 📸 stories/
│   │   ├── models.py          → Story (duran 24h)  |  Modelo con expiración
│   │   ├── views.py           → Crear/ver historias  |  Filtra stories activas
│   │   └── urls.py            → /api/stories/...  |  Endpoints de stories
│   │   ✓ Historias temporales
│   │
│   └── 💬 chat/
│       ├── models.py          → ChatRoom, Message  |  Modelos de mensajería
│       ├── consumers.py       → WebSocket send/receive  |  Maneja conexiones en tiempo real
│       ├── routing.py         → Rutas WebSocket  |  Enruta conexiones WS
│       └── middleware.py      → Auth WebSocket  |  Valida JWT en WebSocket
│       ✓ Mensajería en tiempo real
│
├── ⚙️ config/
│   ├── settings.py            → BD, apps, CORS, JWT  |  Configuración central del proyecto
│   ├── urls.py                → Rutas principales  |  Importa URLs de todas las apps
│   ├── asgi.py                → WebSocket  |  Servidor asíncrono para WS
│   └── wsgi.py                → HTTP  |  Servidor síncrono para HTTP
│   ✓ Configuración global de Django
│
├── 🔔 notifications/
│   ├── models.py              → Notification  |  Modelo de notificaciones
│   ├── consumers.py           → WebSocket notis  |  Envía notis en tiempo real
│   ├── signals.py             → Crear notis automáticas  |  Se activan al hacer like, follow...
│   ├── views.py               → Ver/marcar leídas  |  Endpoints REST de notificaciones
│   └── urls.py                → /api/notifications/...  |  Rutas de notificaciones
│   ✓ Sistema de notificaciones en tiempo real
│
├── 📁 media/
│   ├── profile_pics/          → Fotos de perfil  |  Django guarda uploads aquí
│   └── cover_pics/            → Portadas  |  Separado para organizar por tipo
│   ✓ Archivos subidos por usuarios
│
├── 🗄️ db.sqlite3              → Base de datos  |  SQLite para desarrollo
└── 🎯 manage.py                → CLI Django  |  Comando principal (runserver, migrate...)
```

### 📋 Patrón Apps Django

| Archivo          | Función                 | ¿Por qué aquí?                                   |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `models.py`      | Define tablas BD        | Cada app tiene sus propios modelos/tablas        |
| `serializers.py` | Convierte Python ↔ JSON | Transforma datos del modelo a API REST           |
| `views.py`       | Lógica de cada endpoint | Separa la lógica de negocio por funcionalidad    |
| `urls.py`        | Rutas de la app         | Cada app registra sus propias URLs               |
| `migrations/`    | Historial cambios BD    | Django genera automáticamente cambios del modelo |

---

# ⚛️ FRONTEND

```
frontend/src/
│
├── 🧩 components/
│   ├── Layout.js              → Header + Sidebar  |  Envuelve todas las páginas
│   ├── Avatar.js              → Imagen perfil  |  Reutilizable en posts, perfil, chat...
│   ├── PostCard.js            → Tarjeta post  |  Se usa en feed, perfil, búsqueda...
│   ├── NotificationCenter.js  → Campana notificaciones  |  Se muestra en header
│   └── ui/                    → Botones, modales (Shadcn)  |  Componentes base de UI
│   ✓ Componentes reutilizables
│
├── 📄 pages/
│   ├── Home.js                → Feed  |  Página principal (ruta "/")
│   ├── Profile.js             → Perfil  |  Vista de usuario (ruta "/profile/:id")
│   ├── Login.js               → Login  |  Autenticación (ruta "/login")
│   ├── Search.js              → Buscar usuarios  |  Explorar (ruta "/search")
│   ├── Messages.js            → Chat  |  Mensajería (ruta "/messages")
│   └── Settings.js            → Configuración  |  Ajustes (ruta "/settings")
│   ✓ Páginas con rutas propias
│
├── 🌐 services/
│   ├── api.js                 → Cliente HTTP (Axios)  |  Centraliza peticiones al backend
│   └── tokenManager.js        → Manejo JWT  |  Guarda/recupera tokens del localStorage
│   ✓ Comunicación con backend
│
├── 🔄 context/
│   └── AuthContext.js         → Usuario actual, login, logout  |  Estado compartido en toda la app
│   ✓ Estado global
│
├── 🛠️ utils/
│   ├── security.js            → Prevenir XSS  |  Sanitiza inputs antes de mostrar
│   └── validation.js          → Validar formularios  |  Reglas de validación reutilizables
│   ✓ Funciones auxiliares
│
├── 🎨 styles/
│   └── globals.css            → Tailwind + custom  |  Estilos que afectan a todo
│   ✓ Estilos globales
│
├── 📱 App.js                   → Raíz + Router  |  Define todas las rutas de la app
└── 🚀 index.js                 → Entry point  |  Punto de entrada React (ReactDOM.render)
```

### 📋 Diferencias Frontend

| Carpeta       | Propósito              | ¿Por qué aquí?                                              |
| ------------- | ---------------------- | ----------------------------------------------------------- |
| `components/` | Reutilizables sin ruta | Se usan en múltiples páginas (Avatar, PostCard...)          |
| `pages/`      | Con ruta propia        | Cada archivo = una URL (Home → "/", Profile → "/profile")   |
| `services/`   | HTTP                   | Centraliza llamadas al backend, evita código repetido       |
| `context/`    | Estado compartido      | Datos globales (usuario logueado) accesibles en toda la app |
| `utils/`      | Funciones auxiliares   | Helpers genéricos usados en varios lugares                  |
| `styles/`     | Estilos globales       | CSS que afecta a toda la aplicación                         |

---

# 🗄️ BASE DE DATOS

```
👤 User
 │
 ├─── 📝 Post
 │     ├─── ❤️ Like          ✗ Borrar post → borra likes
 │     └─── 💬 Comment       ✗ Borrar post → borra comentarios
 │
 ├─── 👥 Follow              ↔ Relación muchos a muchos
 │
 ├─── 📸 Story
 │
 └─── 🔔 Notification
```

### 📋 Tipos de Relaciones

| Relación    | Descripción                             | ¿Por qué esta estructura?                        |
| ----------- | --------------------------------------- | ------------------------------------------------ |
| **1:N**     | User → Posts (un usuario, muchos posts) | Un usuario puede crear múltiples publicaciones   |
| **N:M**     | User ↔ User (Follow, muchos a muchos)   | Usuarios pueden seguir y ser seguidos por muchos |
| **Cascade** | Borrar Post elimina Like y Comment      | Si no existe el post, sus likes/comments tampoco |

---
