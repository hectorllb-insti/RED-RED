# Configuración de MongoDB para RED-RED

## Instalación de MongoDB

### Windows

1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Ejecutar el instalador y seguir las instrucciones
3. Instalar MongoDB Compass (opcional, para interfaz gráfica)

### Iniciar MongoDB

```bash
# Iniciar el servicio de MongoDB
net start MongoDB

# O iniciar manualmente
mongod --dbpath C:\data\db
```

## Configuración de la Base de Datos

### Variables de Entorno

Crear un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
SECRET_KEY=tu-secret-key-muy-segura-aqui
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DB_NAME=red_red_db
DB_HOST=mongodb://localhost:27017
```

### Colecciones Principales

1. **users_user** - Usuarios del sistema
2. **posts_post** - Publicaciones
3. **stories_story** - Historias (24h)
4. **messages_conversation** - Conversaciones
5. **messages_message** - Mensajes
6. **users_follow** - Relaciones de seguimiento

### Índices Recomendados

```javascript
// Conectar a MongoDB
use red_red_db

// Índices para mejorar rendimiento
db.posts_post.createIndex({ "author": 1, "created_at": -1 })
db.posts_post.createIndex({ "created_at": -1 })
db.stories_story.createIndex({ "created_at": -1 })
db.stories_story.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
db.messages_message.createIndex({ "conversation": 1, "created_at": -1 })
db.users_follow.createIndex({ "follower": 1 })
db.users_follow.createIndex({ "following": 1 })
```

### Datos de Prueba (Opcional)

```javascript
// Crear algunos usuarios de prueba
db.users_user.insertMany([
  {
    username: "admin",
    email: "admin@redred.com",
    first_name: "Admin",
    last_name: "User",
    bio: "Administrador del sistema",
    is_active: true,
    date_joined: new Date(),
  },
  {
    username: "usuario1",
    email: "usuario1@redred.com",
    first_name: "Juan",
    last_name: "Pérez",
    bio: "Usuario de prueba",
    is_active: true,
    date_joined: new Date(),
  },
]);
```

## Conexión desde Django

Django se conectará automáticamente usando djongo con la configuración en `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'red_red_db',
        'CLIENT': {
            'host': 'mongodb://localhost:27017',
        }
    }
}
```

## Mantenimiento

### Limpieza de Historias Expiradas

Las historias se eliminan automáticamente después de 24 horas usando TTL de MongoDB.

### Backup

```bash
# Crear backup
mongodump --db red_red_db --out C:\backups\

# Restaurar backup
mongorestore --db red_red_db C:\backups\red_red_db\
```

## Troubleshooting

1. **Error de conexión**: Verificar que MongoDB esté ejecutándose
2. **Error de permisos**: Verificar que el usuario tenga permisos en la carpeta de datos
3. **Puerto ocupado**: El puerto 27017 debe estar disponible
