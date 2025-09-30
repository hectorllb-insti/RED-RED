# RED-RED Social Network

Una aplicación de red social completa con Django backend, React frontend y MongoDB como base de datos.

## Características

- **Usuarios y Perfiles**: Registro, login, perfiles personalizables
- **Publicaciones**: Crear, ver, compartir y reaccionar a publicaciones
- **Historias**: Contenido temporal que desaparece después de 24 horas
- **Mensajes**: Chat en tiempo real usando WebSockets
- **Seguimiento**: Seguir/dejar de seguir usuarios
- **Feed personalizado**: Ver publicaciones de usuarios seguidos

## Tecnologías

### Backend

- Django 5.0
- Django REST Framework
- Django Channels (WebSockets)
- JWT Authentication
- MongoDB (con djongo)

### Frontend

- React 18
- React Router
- Axios
- Socket.io-client
- Tailwind CSS

### Base de Datos

- MongoDB

## Instalación

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Base de Datos

1. Instalar MongoDB
2. Iniciar servicio MongoDB
3. La aplicación se conectará automáticamente

## Estructura del Proyecto

```
RED-RED/
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── authentication/
│   │   ├── posts/
│   │   ├── stories/
│   │   ├── messages/
│   │   └── users/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── database/
    └── init_scripts/
```

## API Endpoints

### Autenticación

- `POST /api/auth/register/` - Registro
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token

### Usuarios

- `GET /api/users/profile/` - Perfil actual
- `PUT /api/users/profile/` - Actualizar perfil
- `POST /api/users/follow/{user_id}/` - Seguir usuario

### Publicaciones

- `GET /api/posts/` - Listar publicaciones
- `POST /api/posts/` - Crear publicación
- `POST /api/posts/{id}/like/` - Like/Unlike

### Historias

- `GET /api/stories/` - Ver historias
- `POST /api/stories/` - Crear historia

### Mensajes (WebSocket)

- `/ws/chat/{room_name}/` - Chat en tiempo real

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
