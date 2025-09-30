# 🌐 RED-RED Social Network

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Una aplicación de red social moderna y completa desarrollada con Django (backend), React (frontend) y MongoDB (base de datos). Incluye funcionalidades en tiempo real mediante WebSockets para una experiencia de usuario fluida y contemporánea.

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🔧 Configuración del Entorno de Desarrollo](#-configuración-del-entorno-de-desarrollo)
- [📦 Instalación](#-instalación)
- [🏃‍♂️ Ejecución](#️-ejecución)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [👥 Contribución](#-contribución)

## 🚀 Características

### 👤 Gestión de Usuarios

- ✅ Registro y autenticación con JWT
- ✅ Perfiles personalizables con foto y portada
- ✅ Sistema de seguimiento entre usuarios
- ✅ Configuración de privacidad

### 📝 Publicaciones

- ✅ Crear, editar y eliminar publicaciones
- ✅ Sistema de likes y comentarios
- ✅ Subida de imágenes
- ✅ Feed personalizado basado en seguimientos

### 📖 Historias

- ✅ Contenido temporal (24 horas)
- ✅ Visualización en formato carrusel
- ✅ Eliminación automática por TTL

### 💬 Mensajería

- ✅ Chat en tiempo real con WebSockets
- ✅ Conversaciones privadas 1:1
- ✅ Historial de mensajes persistente
- ✅ Estado de conexión en tiempo real

## 🏗️ Arquitectura

### Stack Tecnológico

#### Backend

- **Framework**: Django 5.0.1 + Django REST Framework 3.14.0
- **Autenticación**: JWT (djangorestframework-simplejwt 5.3.0)
- **WebSockets**: Django Channels 4.0.0 + Redis 5.0.1
- **Base de Datos**: MongoDB 7.0+ con djongo 1.3.6
- **CORS**: django-cors-headers 4.3.1

#### Frontend

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.8.1
- **Estado**: Context API + React Query 3.39.3
- **UI**: Tailwind CSS 3.2.7 + Lucide React (iconos)
- **HTTP Client**: Axios 1.3.4
- **WebSockets**: Socket.io-client 4.6.1
- **Formularios**: React Hook Form 7.43.5

#### Base de Datos

- **Principal**: MongoDB 7.0+ (Documentos NoSQL)
- **Cache/Sessions**: Redis 7.0+ (Para WebSockets y cache)

## 🔧 Configuración del Entorno de Desarrollo

### 📋 Requisitos Previos

#### Software Requerido

| Herramienta | Versión Mínima | Versión Recomendada | Descarga                                                      |
| ----------- | -------------- | ------------------- | ------------------------------------------------------------- |
| **Python**  | 3.11.0         | 3.11.6+             | [python.org](https://www.python.org/downloads/)               |
| **Node.js** | 18.0.0         | 20.9.0+ LTS         | [nodejs.org](https://nodejs.org/)                             |
| **MongoDB** | 6.0            | 7.0.2+              | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **Redis**   | 6.0            | 7.2.0+              | [redis.io](https://redis.io/download)                         |
| **Git**     | 2.30           | 2.42.0+             | [git-scm.com](https://git-scm.com/)                           |

#### IDEs y Editores Recomendados

##### Visual Studio Code (Recomendado)

- **Versión**: 1.83.0+
- **Extensiones Esenciales**:
  ```
  - Python (ms-python.python)
  - Django (batisteo.vscode-django)
  - ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
  - Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
  - MongoDB for VS Code (mongodb.mongodb-vscode)
  - Thunder Client (rangav.vscode-thunder-client) - Para testing API
  - GitLens (eamodio.gitlens)
  - Error Lens (usernamehw.errorlens)
  - Prettier (esbenp.prettier-vscode)
  - ESLint (dbaeumer.vscode-eslint)
  ```

##### PyCharm Professional (Alternativa)

- **Versión**: 2023.2+
- **Plugins**: Django, JavaScript, React, MongoDB Plugin

#### Herramientas de Desarrollo

##### Testing de APIs

- **Postman** (Recomendado): [getpostman.com](https://www.postman.com/)
- **Insomnia** (Alternativa): [insomnia.rest](https://insomnia.rest/)
- **Thunder Client** (VS Code): Extensión integrada

##### Gestión de Base de Datos

- **MongoDB Compass** (GUI): [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- **Studio 3T** (Profesional): [studio3t.com](https://studio3t.com/)

##### Gestión de Redis

- **Redis Desktop Manager**: [redisdesktop.com](https://redisdesktop.com/)
- **Redis CLI**: Incluido con Redis

### 🛠️ Configuración del IDE (Visual Studio Code)

#### 1. Configuración del Workspace

Crear `.vscode/settings.json` en la raíz del proyecto:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/Scripts/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["./backend/tests"],
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.html": "html"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  }
}
```

#### 2. Configuración de Debugging

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Django Backend",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/manage.py",
      "args": ["runserver"],
      "django": true,
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/backend"
    },
    {
      "name": "React Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/react-scripts",
      "args": ["start"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    }
  ]
}
```

### 🐍 Configuración Python/Django

#### 1. Entorno Virtual

```bash
# Crear entorno virtual
cd backend
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (macOS/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### 2. Variables de Entorno

Crear `backend/.env`:

```env
# Django
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-aqui
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Base de datos
DB_NAME=red_red_db
DB_HOST=mongodb://localhost:27017

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### ⚛️ Configuración React/Node.js

#### 1. Gestión de Paquetes

- **npm** (incluido con Node.js)
- **Yarn** (Opcional): `npm install -g yarn`

#### 2. Variables de Entorno Frontend

Crear `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
GENERATE_SOURCEMAP=false
```

### 🗄️ Configuración de Base de Datos

#### MongoDB

1. **Instalar MongoDB Community Server**
2. **Configurar como servicio** (recomendado)
3. **Crear directorio de datos**: `C:\data\db` (Windows) o `/data/db` (macOS/Linux)
4. **Iniciar servicio**:

   ```bash
   # Windows (como administrador)
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod
   ```

#### Redis

1. **Windows**: Descargar desde [GitHub Releases](https://github.com/microsoftarchive/redis/releases)
2. **macOS**: `brew install redis`
3. **Linux**: `sudo apt-get install redis-server`

### 🔄 Workflow de Desarrollo

#### Git Hooks Recomendados

Crear `.githooks/pre-commit`:

```bash
#!/bin/sh
# Ejecutar tests antes del commit
cd backend && python manage.py test --no-input
cd ../frontend && npm test -- --coverage --no-watch
```

#### Scripts de Desarrollo

Crear `package.json` en la raíz:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && python manage.py runserver",
    "dev:frontend": "cd frontend && npm start",
    "test": "concurrently \"npm run test:backend\" \"npm run test:frontend\"",
    "test:backend": "cd backend && python manage.py test",
    "test:frontend": "cd frontend && npm test",
    "lint": "concurrently \"npm run lint:backend\" \"npm run lint:frontend\"",
    "lint:backend": "cd backend && flake8",
    "lint:frontend": "cd frontend && npm run lint"
  }
}
```

## 📦 Instalación

### 🚀 Instalación Rápida (Automatizada)

#### Windows

```bash
# Ejecutar script de instalación
install.bat

# Iniciar aplicación
start.bat
```

#### macOS/Linux

```bash
# Dar permisos de ejecución
chmod +x install.sh

# Ejecutar script de instalación
./install.sh

# Iniciar aplicación
./start.sh
```

### 🔧 Instalación Manual

#### 1. Clonar Repositorio

```bash
git clone https://github.com/hectorllb-insti/RED-RED.git
cd RED-RED
```

#### 2. Configurar Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser
```

#### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux
```

#### 4. Configurar Base de Datos

```bash
# Iniciar MongoDB
net start MongoDB  # Windows
# brew services start mongodb-community  # macOS
# sudo systemctl start mongod  # Linux

# Iniciar Redis
redis-server  # Todas las plataformas
```

## 🏃‍♂️ Ejecución

### Desarrollo Local

#### Opción 1: Scripts Automatizados

```bash
# Windows
start.bat

# macOS/Linux
./start.sh
```

#### Opción 2: Manual (Terminales Separadas)

```bash
# Terminal 1 - Backend Django
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python manage.py runserver

# Terminal 2 - Frontend React
cd frontend
npm start

# Terminal 3 - WebSocket Server (Opcional)
cd backend
python manage.py runserver --settings=config.settings_websocket
```

### URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs

## 📚 API Documentation

### Autenticación

| Método | Endpoint              | Descripción         | Auth |
| ------ | --------------------- | ------------------- | ---- |
| `POST` | `/api/auth/register/` | Registro de usuario | ❌   |
| `POST` | `/api/auth/login/`    | Login de usuario    | ❌   |
| `POST` | `/api/auth/refresh/`  | Renovar token       | ❌   |
| `POST` | `/api/auth/logout/`   | Cerrar sesión       | ✅   |

### Usuarios

| Método | Endpoint                  | Descripción            | Auth |
| ------ | ------------------------- | ---------------------- | ---- |
| `GET`  | `/api/users/profile/`     | Perfil actual          | ✅   |
| `PUT`  | `/api/users/profile/`     | Actualizar perfil      | ✅   |
| `GET`  | `/api/users/{id}/`        | Ver perfil público     | ✅   |
| `POST` | `/api/users/{id}/follow/` | Seguir/Dejar de seguir | ✅   |

### Publicaciones

| Método   | Endpoint                | Descripción                 | Auth |
| -------- | ----------------------- | --------------------------- | ---- |
| `GET`    | `/api/posts/`           | Listar publicaciones (feed) | ✅   |
| `POST`   | `/api/posts/`           | Crear publicación           | ✅   |
| `GET`    | `/api/posts/{id}/`      | Ver publicación             | ✅   |
| `PUT`    | `/api/posts/{id}/`      | Editar publicación          | ✅   |
| `DELETE` | `/api/posts/{id}/`      | Eliminar publicación        | ✅   |
| `POST`   | `/api/posts/{id}/like/` | Like/Unlike                 | ✅   |

### Historias

| Método   | Endpoint             | Descripción           | Auth |
| -------- | -------------------- | --------------------- | ---- |
| `GET`    | `/api/stories/`      | Ver historias activas | ✅   |
| `POST`   | `/api/stories/`      | Crear historia        | ✅   |
| `DELETE` | `/api/stories/{id}/` | Eliminar historia     | ✅   |

### Mensajes

| Método | Endpoint                                     | Descripción              | Auth |
| ------ | -------------------------------------------- | ------------------------ | ---- |
| `GET`  | `/api/messages/conversations/`               | Listar conversaciones    | ✅   |
| `POST` | `/api/messages/conversations/`               | Crear conversación       | ✅   |
| `GET`  | `/api/messages/conversations/{id}/messages/` | Mensajes de conversación | ✅   |

### WebSockets

| Evento            | Descripción           |
| ----------------- | --------------------- |
| `join_room`       | Unirse a sala de chat |
| `send_message`    | Enviar mensaje        |
| `receive_message` | Recibir mensaje       |
| `user_online`     | Usuario conectado     |
| `user_offline`    | Usuario desconectado  |

## 🧪 Testing

### Backend (Django)

```bash
cd backend

# Ejecutar todos los tests
python manage.py test

# Tests con cobertura
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Genera reporte HTML

# Tests específicos
python manage.py test apps.users.tests
python manage.py test apps.posts.tests.test_models
```

### Frontend (React)

```bash
cd frontend

# Ejecutar todos los tests
npm test

# Tests con cobertura
npm test -- --coverage --no-watch

# Tests específicos
npm test -- --testNamePattern="Login"

# Tests de integración
npm run test:integration
```

### Testing de APIs

Importar colección de Postman desde `docs/RED-RED.postman_collection.json`

## 🚀 Despliegue

### Desarrollo (Docker)

```bash
# Construir y ejecutar
docker-compose up --build

# En modo background
docker-compose up -d
```

### Producción

#### Variables de Entorno Producción

```env
DEBUG=False
SECRET_KEY=tu-clave-super-secreta-de-produccion
ALLOWED_HOSTS=tudominio.com,www.tudominio.com
DB_HOST=mongodb://usuario:password@host:27017/red_red_db
REDIS_URL=redis://redis-host:6379
```

#### Despliegue Backend

- **Heroku**: Usar `Procfile` incluido
- **DigitalOcean**: App Platform compatible
- **AWS**: EC2 + RDS/DocumentDB + ElastiCache

#### Despliegue Frontend

- **Netlify**: Build automático desde Git
- **Vercel**: Optimizado para React
- **AWS S3**: Hosting estático

## 👥 Contribución

### Estándares de Código

#### Python/Django

- **Estilo**: PEP 8 + Black formatter
- **Docstrings**: Google style
- **Type hints**: Obligatorio para funciones públicas

#### JavaScript/React

- **Estilo**: ESLint + Prettier
- **Componentes**: Functional components + Hooks
- **PropTypes**: Obligatorio

### Flujo de Trabajo Git

1. **Fork** el repositorio
2. **Clone** tu fork: `git clone https://github.com/tu-usuario/RED-RED.git`
3. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
4. **Commit**: `git commit -m "feat: agregar nueva funcionalidad"`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **Pull Request** al repositorio principal

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, sin cambios de código
refactor: refactoring de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Estructura de Branches

- `main`: Código de producción
- `develop`: Desarrollo activo
- `feature/*`: Nuevas funcionalidades
- `bugfix/*`: Corrección de bugs
- `hotfix/*`: Correcciones urgentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Documentación**: [Wiki del proyecto](https://github.com/hectorllb-insti/RED-RED/wiki)
- **Issues**: [GitHub Issues](https://github.com/hectorllb-insti/RED-RED/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/hectorllb-insti/RED-RED/discussions)

## 🙏 Agradecimientos

- [Django](https://djangoproject.com/) por el framework backend
- [React](https://reactjs.org/) por la biblioteca frontend
- [MongoDB](https://www.mongodb.com/) por la base de datos
- [Tailwind CSS](https://tailwindcss.com/) por el framework CSS
- Comunidad open source por las increíbles herramientas

---

**RED-RED Social Network** - Desarrollado con ❤️ por el equipo de DAM2 Frameworks
