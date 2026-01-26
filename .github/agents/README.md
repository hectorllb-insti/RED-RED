# GitHub Copilot Agents for RED-RED

Este directorio contiene agentes personalizados de GitHub Copilot para el proyecto RED-RED.

## 🤖 Agentes Disponibles

### Backend Agent (`backend-agent.md`)

Agente experto en Django, REST APIs, bases de datos y seguridad backend.

**Especialidades:**
- Django & Django REST Framework
- API development y JWT authentication
- Optimización de base de datos y queries
- Django Channels y WebSockets
- Testing con pytest

**Uso:**
```
@workspace /agent backend-agent implementa endpoint POST /api/posts/ con validación
```

### Frontend Agent (`frontend-agent.md`)

Agente experto en React, TypeScript, UI/UX y performance frontend.

**Especialidades:**
- React 18+ con TypeScript
- TailwindCSS y componentes accesibles
- Integración con APIs y WebSockets
- Performance y optimización
- Testing con Jest y React Testing Library

**Uso:**
```
@workspace /agent frontend-agent crea componente PostCard con TypeScript
```

### Code Review Agent (`code-review-agent.md`)

Agente especializado en revisión de código, seguridad, refactorización y calidad del código.

**Uso:**
```
@copilot /review usando code-review-agent
```

## 🚀 Cómo Usar los Agentes

### Para Issues Nuevas

**Backend:**
```
@workspace /agent backend-agent implementa POST /api/posts/ con JWT auth
```

**Frontend:**
```
@workspace /agent frontend-agent crea componente PostCard con tipos TypeScript
```

**Full-stack (ambos agentes se coordinan):**
```
@workspace /agent backend-agent implementa API de notificaciones
@workspace /agent frontend-agent integra notificaciones en tiempo real
```

### Para Pull Requests

```
@copilot /review usando code-review-agent
```

## 🔄 Coordinación entre Agentes

Los agentes se comunican mediante tags:

**Backend necesita Frontend:**
```
@frontend-agent Implementé POST /api/posts/
Detalles del endpoint: [...]
```

**Frontend necesita Backend:**
```
@backend-agent Necesito endpoint GET /api/notifications/
Con filtrado por usuario y paginación
```

**Ambos trabajan en una feature:**
1. Backend-agent implementa API
2. Backend-agent documenta endpoint y taguea @frontend-agent
3. Frontend-agent implementa UI usando el API
4. Code-review-agent revisa la PR completa

## 🛠️ Stack Tecnológico

**Backend**: Django 4.2+, DRF, Django Channels, PostgreSQL, Redis, JWT
**Frontend**: React 18+, TypeScript 5+, TailwindCSS, Axios, React Router
**Testing**: pytest, Jest, React Testing Library
**Linting**: flake8, black, ESLint

## 📝 Mejores Prácticas

1. Usa los agentes especializados (backend-agent, frontend-agent) para implementar features
2. Usa code-review-agent para revisar PRs antes de merge
3. Los agentes se coordinan mediante tags (@backend-agent, @frontend-agent)
4. Proporciona contexto claro en cada solicitud
5. Todos los cambios pasan por code-review-agent antes del merge

## 📚 Recursos

- [Documentación de API](/API_DOCUMENTATION.md)
- [Estructura del Proyecto](/MODULE_STRUCTURE.md)
- [Guía de Seguridad](/SECURITY_REPORT.md)

---

**Última actualización**: Noviembre 2024
