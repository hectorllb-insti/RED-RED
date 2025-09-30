# Configuración del Entorno de Desarrollo para RED-RED Social Network

## 📋 Lista de Verificación Pre-instalación

Antes de comenzar, asegúrate de tener instalado:

- [ ] **Python 3.11+** - [Descargar](https://www.python.org/downloads/)
- [ ] **Node.js 18.0+** (LTS recomendado) - [Descargar](https://nodejs.org/)
- [ ] **MongoDB 6.0+** - [Descargar](https://www.mongodb.com/try/download/community)
- [ ] **Redis 6.0+** - [Descargar](https://redis.io/download)
- [ ] **Git** - [Descargar](https://git-scm.com/)
- [ ] **Visual Studio Code** (recomendado) - [Descargar](https://code.visualstudio.com/)

## 🔧 Configuración Paso a Paso

### 1. Configurar Python y Backend

```bash
# 1. Verificar Python
python --version  # Debe ser 3.11+

# 2. Crear y activar entorno virtual
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Actualizar pip
python -m pip install --upgrade pip

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar variables de entorno
copy .env.example .env  # Editar .env con tus configuraciones
```

### 2. Configurar Node.js y Frontend

```bash
# 1. Verificar Node.js
node --version  # Debe ser 18.0+
npm --version

# 2. Instalar dependencias
cd ../frontend
npm install

# 3. Configurar variables de entorno
copy .env.example .env  # Editar .env si es necesario
```

### 3. Configurar MongoDB

```bash
# Windows - Iniciar como servicio
net start MongoDB

# Verificar conexión
mongo --eval "db.version()"

# Crear base de datos (opcional)
mongo
> use red_red_db
> db.createCollection("test")
> exit
```

### 4. Configurar Redis

```bash
# Iniciar Redis server
redis-server

# En otra terminal, verificar
redis-cli ping
# Debe responder: PONG
```

### 5. Configurar VS Code

1. **Instalar extensiones recomendadas**:

   - Abrir VS Code en la carpeta del proyecto
   - Presionar `Ctrl+Shift+X`
   - Instalar las extensiones sugeridas automáticamente

2. **Verificar configuración**:
   - Abrir `Command Palette` (`Ctrl+Shift+P`)
   - Ejecutar "Python: Select Interpreter"
   - Seleccionar el intérprete del venv: `./backend/venv/Scripts/python.exe`

## 🚀 Primera Ejecución

### 1. Configurar Base de Datos Django

```bash
cd backend

# Activar entorno virtual si no está activo
venv\Scripts\activate

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser
```

### 2. Ejecutar la Aplicación

#### Opción A: Scripts Automatizados

```bash
# En la raíz del proyecto
start.bat  # Windows
# ./start.sh  # macOS/Linux
```

#### Opción B: Manual (3 terminales)

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Verificar servicios
redis-cli ping
mongo --eval "db.version()"
```

### 3. Verificar Funcionamiento

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## 🐛 Solución de Problemas Comunes

### Error: "Python not found"

```bash
# Verificar instalación
python --version
# Si no funciona, agregar Python al PATH del sistema
```

### Error: "Module not found"

```bash
# Activar entorno virtual
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Error: "npm command not found"

```bash
# Verificar instalación de Node.js
node --version
npm --version
# Reinstalar Node.js si es necesario
```

### Error: "Connection to MongoDB failed"

```bash
# Verificar que MongoDB esté ejecutándose
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux

# Verificar puerto
netstat -an | findstr 27017
```

### Error: "Redis connection failed"

```bash
# Iniciar Redis
redis-server

# Verificar conexión
redis-cli ping
```

### Error: "Port 3000 is already in use"

```bash
# Cambiar puerto de React
echo PORT=3001 >> frontend/.env
```

### Error: "Port 8000 is already in use"

```bash
# Usar puerto diferente para Django
python manage.py runserver 8001
```

## 🔄 Comandos Útiles de Desarrollo

### Backend (Django)

```bash
# Crear nueva app
python manage.py startapp nombre_app

# Shell interactivo
python manage.py shell

# Ejecutar tests
python manage.py test

# Colectar archivos estáticos
python manage.py collectstatic

# Crear migraciones específicas
python manage.py makemigrations nombre_app

# Ver SQL de migraciones
python manage.py sqlmigrate nombre_app 0001
```

### Frontend (React)

```bash
# Instalar nueva dependencia
npm install paquete-nuevo

# Actualizar dependencias
npm update

# Ejecutar tests
npm test

# Build para producción
npm run build

# Analizar bundle
npm run build && npx serve -s build
```

### Base de Datos (MongoDB)

```bash
# Conectar a MongoDB
mongo

# Mostrar bases de datos
show dbs

# Usar base de datos específica
use red_red_db

# Mostrar colecciones
show collections

# Consultar documentos
db.users_user.find().pretty()

# Backup
mongodump --db red_red_db --out backup/

# Restore
mongorestore --db red_red_db backup/red_red_db/
```

## 📊 Herramientas de Monitoreo

### Logs de Desarrollo

```bash
# Logs de Django (en settings.py configurar LOGGING)
tail -f backend/logs/django.log

# Logs de React (automático en consola)
# Ver Network tab en DevTools para requests
```

### Performance Monitoring

```bash
# Django Debug Toolbar (incluido en dev dependencies)
# Acceder a cualquier página con ?debug=1

# React Developer Tools
# Instalar extensión de navegador
```

## 🎯 Siguientes Pasos

Una vez que tengas todo funcionando:

1. **Explorar la aplicación**: Registrar usuario, crear publicaciones
2. **Revisar código**: Entender la estructura de Django y React
3. **Ejecutar tests**: Asegurar que todo funciona correctamente
4. **Desarrollar features**: Crear nuevas funcionalidades
5. **Optimizar**: Mejorar performance y UX

## 📚 Recursos Adicionales

### Documentación

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

### Tutoriales

- [Django REST Framework Tutorial](https://www.django-rest-framework.org/tutorial/quickstart/)
- [React Hooks Tutorial](https://reactjs.org/docs/hooks-intro.html)
- [MongoDB University](https://university.mongodb.com/)

### Comunidad

- [Stack Overflow](https://stackoverflow.com/)
- [Reddit - r/django](https://reddit.com/r/django)
- [Reddit - r/reactjs](https://reddit.com/r/reactjs)
- [MongoDB Community Forums](https://community.mongodb.com/)

---

¡Tu entorno de desarrollo está listo! 🚀
