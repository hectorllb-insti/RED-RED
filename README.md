<div align="center">

# 🔴 RED-RED Social Network 🔴

### *La Red Social de Nueva Generación*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redis](https://img.shields.io/badge/Redis-5.0-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Channels-green?logo=socketdotio)](https://channels.readthedocs.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

![GitHub Stars](https://img.shields.io/github/stars/hectorllb-insti/RED-RED?style=social)
![GitHub Forks](https://img.shields.io/github/forks/hectorllb-insti/RED-RED?style=social)
![GitHub Issues](https://img.shields.io/github/issues/hectorllb-insti/RED-RED)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/hectorllb-insti/RED-RED)
![GitHub Last Commit](https://img.shields.io/github/last-commit/hectorllb-insti/RED-RED)

[✨ Características](#-características-principales) •
[🚀 Instalación](#-instalación-rápida) •
[🏗️ Arquitectura](#️-arquitectura-del-proyecto) •
[🔄 Flujo](#-flujo-de-datos) •
[📁 Estructura](#-estructura-del-proyecto) •
[🤝 Contribuir](#-cómo-contribuir) •
[📚 Glosario](#-glosario-técnico)

---

</div>

## 📖 Sobre el Proyecto

**RED-RED** es una plataforma de red social moderna y completa, construida con las últimas tecnologías web. Ofrece una experiencia de usuario fluida y en tiempo real, con características similares a las principales redes sociales actuales.

### ✨ Características Principales

#### 🎯 Core Features
- ✅ **Autenticación JWT** - Sistema seguro
- 👤 **Perfiles Personalizados** - Avatar & Bio
- 📝 **Publicaciones Completas** - Texto e imágenes
- ❤️ **Sistema de Likes** - Interacciones sociales
- 💬 **Comentarios** - Conversaciones anidadas
- 🔄 **Sistema de Seguimiento** - Follow/Unfollow

#### 🚀 Advanced Features
- 📸 **Stories de 24h** - Contenido temporal
- 💬 **Chat en Tiempo Real** - WebSockets
- 🔔 **Notificaciones Push** - Instantáneas
- 🔍 **Búsqueda de Usuarios** - Exploración
- 🎨 **Interfaz Moderna** - UI/UX Premium
- 📱 **Responsive Design** - Mobile First

---

## 🛠️ Stack Tecnológico

<div align="center">

### Backend
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-ff1709?style=for-the-badge&logo=django&logoColor=white)
![Channels](https://img.shields.io/badge/Channels-4.0-green?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Herramientas & DevOps
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Pip](https://img.shields.io/badge/Pip-3776AB?style=for-the-badge&logo=pypi&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

</div>

---

## 🖥️ Interfaz Gráfica

<div align="center">

### Vista Previa de la Aplicación

<!-- Aquí puedes agregar capturas de pantalla de tu proyecto -->
![RED-RED Preview](./main-screenshot.png)

</div>

---

## 🚀 Instalación Rápida

### 📋 Prerrequisitos

```bash
- Python 3.11+
- Node.js 18.0+
- npm 9.0+
- Redis Server
```

### 🔧 Instalación Automática

#### Windows
```bash
# Ejecutar el script de instalación
.\install.bat
```

#### Linux/MacOS
```bash
# Dar permisos y ejecutar
chmod +x install.sh
./install.sh
```

### ⚙️ Instalación Manual

<details>
<summary><b>📦 Backend Setup</b></summary>

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows
venv\Scripts\activate
# Linux/MacOS
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Realizar migraciones
python manage.py makemigrations
python manage.py migrate

# 6. Crear superusuario (opcional)
python manage.py createsuperuser

# 7. Iniciar servidor
python manage.py runserver
```

</details>

<details>
<summary><b>🎨 Frontend Setup</b></summary>

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm start
```

</details>

### 🚀 Iniciar Aplicación

```bash
# Opción 1: Desde la raíz (ambos servidores)
npm run dev

# Opción 2: Scripts individuales
start.bat  # Windows
```

**Acceder a:**
- 🌐 Frontend: `http://localhost:3000`
- ⚙️ Backend API: `http://localhost:8000`
- 🔧 Admin Panel: `http://localhost:8000/admin`

---

## 🏗️ Arquitectura del Proyecto

<div align="center">

```mermaid
graph TB
    subgraph "🎨 Frontend - React"
        A[React App] --> B[React Router]
        B --> C[Pages]
        C --> D[Components]
        D --> E[UI Components]
        A --> F[Context API]
        F --> G[Auth Context]
    end
    
    subgraph "⚙️ Backend - Django"
        H[Django Server] --> I[REST Framework]
        I --> J[JWT Auth]
        H --> K[Channels/WebSocket]
        K --> L[Redis]
    end
    
    subgraph "🗄️ Base de Datos"
        M[(SQLite/PostgreSQL)]
        N[(Redis Cache)]
    end
    
    A -->|HTTP/REST| I
    A -->|WebSocket| K
    I --> M
    K --> N
    
    style A fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    style H fill:#092E20,stroke:#333,stroke-width:2px,color:#fff
    style M fill:#003B57,stroke:#333,stroke-width:2px,color:#fff
    style N fill:#DC382D,stroke:#333,stroke-width:2px,color:#fff
```

</div>

---

## 🔄 Flujo de Datos

### 📡 Flujo HTTP (REST API)

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant F as 🎨 Frontend
    participant B as ⚙️ Backend
    participant DB as 🗄️ Database
    
    U->>F: 1️⃣ Acción (Ej: Crear Post)
    F->>F: 2️⃣ Validación Local
    F->>B: 3️⃣ HTTP Request + JWT Token
    B->>B: 4️⃣ Verificar Token
    B->>B: 5️⃣ Procesar Lógica
    B->>DB: 6️⃣ Guardar Datos
    DB-->>B: 7️⃣ Confirmación
    B-->>F: 8️⃣ JSON Response
    F->>F: 9️⃣ Actualizar Estado
    F-->>U: 🔟 Mostrar Resultado
```

### ⚡ Flujo WebSocket (Tiempo Real)

```mermaid
sequenceDiagram
    participant U1 as 👤 Usuario 1
    participant F1 as 🎨 Frontend 1
    participant WS as 🔌 WebSocket Server
    participant R as 🔴 Redis
    participant F2 as 🎨 Frontend 2
    participant U2 as 👤 Usuario 2
    
    U1->>F1: 1️⃣ Enviar Mensaje
    F1->>WS: 2️⃣ WS: Send Message
    WS->>R: 3️⃣ Publicar en Canal
    R->>WS: 4️⃣ Distribuir a Suscriptores
    WS->>F2: 5️⃣ WS: Receive Message
    F2-->>U2: 6️⃣ Notificación Instantánea
```

### 🔐 Flujo de Autenticación

```mermaid
graph LR
    A[📝 Login Form] --> B{Validar}
    B -->|✅ Válido| C[POST /api/auth/login/]
    C --> D[Backend Verifica]
    D -->|✅ OK| E[Generar JWT Tokens]
    E --> F[Access Token + Refresh Token]
    F --> G[Guardar en LocalStorage]
    G --> H[Redirect a Dashboard]
    D -->|❌ Error| I[Mostrar Error]
    B -->|❌ Inválido| I
```

---

## 📁 Estructura del Proyecto

```
RED-RED/
│
├── 🐍 backend/                      # Django Backend
│   ├── apps/                        # Aplicaciones Django
│   │   ├── authentication/          # 🔐 Sistema de autenticación JWT
│   │   ├── users/                   # 👤 Gestión de perfiles y seguidores
│   │   ├── posts/                   # 📝 Publicaciones, likes y comentarios
│   │   ├── stories/                 # 📸 Historias temporales (24h)
│   │   └── chat/                    # 💬 Mensajería en tiempo real
│   │
│   ├── config/                      # ⚙️ Configuración Django
│   │   ├── settings.py              # Configuración principal
│   │   ├── urls.py                  # Rutas globales
│   │   ├── asgi.py                  # Servidor WebSocket
│   │   └── wsgi.py                  # Servidor HTTP
│   │
│   ├── notifications/               # 🔔 Sistema de notificaciones
│   ├── media/                       # 📁 Archivos subidos (imágenes)
│   ├── db.sqlite3                   # 🗄️ Base de datos
│   └── manage.py                    # 🎯 CLI Django
│
├── ⚛️ frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/              # 🧩 Componentes reutilizables
│   │   │   ├── Layout.js            # Estructura principal
│   │   │   ├── PostCard.js          # Tarjeta de publicación
│   │   │   ├── Avatar.js            # Componente de avatar
│   │   │   └── ui/                  # Componentes UI base
│   │   │
│   │   ├── pages/                   # 📄 Páginas con rutas
│   │   │   ├── Home.js              # Feed principal
│   │   │   ├── Profile.js           # Perfil de usuario
│   │   │   ├── Messages.js          # Chat
│   │   │   ├── Login.js             # Autenticación
│   │   │   └── Settings.js          # Configuración
│   │   │
│   │   ├── services/                # 🌍 Servicios HTTP
│   │   │   ├── api.js               # Cliente Axios
│   │   │   └── tokenManager.js      # Gestión JWT
│   │   │
│   │   ├── context/                 # 🔄 Estado global
│   │   │   └── AuthContext.js       # Contexto de autenticación
│   │   │
│   │   ├── hooks/                   # 🪝 Custom Hooks
│   │   ├── utils/                   # 🛠️ Utilidades
│   │   └── styles/                  # 🎨 Estilos globales
│   │
│   └── public/                      # 📦 Recursos estáticos
│
├── 🗂️ database/                     # Base de Datos
│   └── README.md                    # Documentación de BD
│
├── �📚 Documentación
│   ├── API_DOCUMENTATION.md         # Documentación API REST
│   ├── STRUCTURE.md                 # Estructura detallada
│   ├── MODULE_STRUCTURE.md          # Estructura de módulos
│   ├── SECURITY_REPORT.md           # Reporte de seguridad
│   └── SETUP.md                     # Guía de instalación
│
└── 🔧 Configuración
    ├── package.json                 # Dependencias Node.js
    ├── requirements.txt             # Dependencias Python
    ├── install.bat / .sh            # Scripts de instalación
    └── start.bat                    # Script de inicio
```

---

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas y apreciadas! 🎉

### 📝 Proceso de Contribución

1. **Fork el proyecto** 🍴
   ```bash
   # Hacer fork desde GitHub
   ```

2. **Clonar tu fork** 📥
   ```bash
   git clone https://github.com/tu-usuario/RED-RED.git
   cd RED-RED
   ```

3. **Crear una rama** 🌿
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Hacer cambios y commit** 💾
   ```bash
   git add .
   git commit -m "Add: Amazing Feature"
   ```

5. **Push a tu fork** 🚀
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Abrir Pull Request** 🔃
   - Ir a GitHub y crear un Pull Request
   - Describir los cambios realizados
   - Esperar revisión

### 💡 Guías de Contribución

- 📖 Seguir el estilo de código existente
- ✅ Añadir tests para nuevas funcionalidades
- 📝 Actualizar documentación si es necesario
- 🔍 Asegurar que todos los tests pasen
- 🎨 Mantener UI/UX consistente

---

## 📚 Glosario Técnico

### 🔐 JWT (JSON Web Token)
Sistema de autenticación basado en tokens que permite mantener sesiones seguras sin necesidad de cookies. El token contiene información encriptada del usuario.

### ⚡ WebSocket
Protocolo de comunicación bidireccional en tiempo real entre cliente y servidor. Permite chat y notificaciones instantáneas sin necesidad de refrescar la página.

### 🔄 REST API
Arquitectura de servicios web que utiliza HTTP para realizar operaciones CRUD (Create, Read, Update, Delete) sobre recursos mediante endpoints.

### 🎨 React Context
Sistema de gestión de estado global en React que permite compartir datos entre componentes sin necesidad de pasar props manualmente en cada nivel.

### 🔴 Redis
Base de datos en memoria ultra-rápida utilizada para caché y como broker de mensajes para WebSockets. Almacena datos temporales y sesiones.

### 📦 Serializer
Componente de Django REST Framework que convierte modelos de Python a JSON y viceversa, validando y transformando datos para la API.

### 🛡️ CORS (Cross-Origin Resource Sharing)
Mecanismo de seguridad que permite o restringe peticiones HTTP entre diferentes dominios. Necesario para que Frontend y Backend se comuniquen.

---

<div align="center">

## 💝 Creado con Amor

Este proyecto ha sido desarrollado con **dedicación** y **pasión** por:

### 👨‍💻 Grupo de 2º DAM - Frameworks
**Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma**

---

### 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Copyright (c) 2025 RED-RED Team
```

---

### 🌟 Agradecimientos

Gracias a todos los que han contribuido a hacer de **RED-RED** una realidad.

Si te gusta el proyecto, ¡dale una ⭐ en GitHub!

---

**[⬆️ Volver arriba](#red-red-social-network)**

---

<sub>Última actualización: Noviembre 2025 | Made with ❤️ by DAM2 Frameworks Team</sub>

</div>
