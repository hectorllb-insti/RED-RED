# 🤖 Guía Rápida del Code Review Agent

Este documento proporciona una guía rápida para usar el Code Review Agent de RED-RED.

## 🚀 Inicio Rápido

### En Pull Requests (Recomendado)

Simplemente comenta en tu PR:

```
@copilot /review usando code-review-agent
```

### En VS Code con GitHub Copilot

1. Abre el Chat de Copilot (Ctrl+Shift+I / Cmd+Shift+I)
2. Escribe:
```
@workspace /agent code-review-agent revisa este código
```

## 📋 Casos de Uso Comunes

### 1. Revisión General de Pull Request

**Cuándo**: Antes de solicitar revisión humana

**Comando**:
```
@copilot /review usando code-review-agent

Revisa todos los cambios en esta PR, enfocándote en:
- Seguridad
- Calidad del código
- Posibles bugs
```

### 2. Revisión de Seguridad

**Cuándo**: Cambios en autenticación, autorización, o manejo de datos sensibles

**Comando**:
```
@workspace /agent code-review-agent

Revisa la seguridad de backend/apps/authentication/views.py:
- Vulnerabilidades de autenticación
- Manejo seguro de tokens JWT
- Validación de inputs
```

### 3. Revisión de Rendimiento

**Cuándo**: Optimizando queries o componentes React

**Comando**:
```
@workspace /agent code-review-agent

Analiza el rendimiento de:
- backend/apps/posts/views.py (queries de base de datos)
- frontend/src/components/Feed.tsx (re-renders de React)
```

### 4. Revisión de Refactorización

**Cuándo**: Mejorando código legacy o complejo

**Comando**:
```
@workspace /agent code-review-agent

Sugiere refactorizaciones para:
- Reducir complejidad
- Mejorar legibilidad
- Eliminar código duplicado

Archivo: backend/apps/posts/serializers.py
```

### 5. Revisión de Tests

**Cuándo**: Añadiendo o mejorando tests

**Comando**:
```
@workspace /agent code-review-agent

Revisa los tests y verifica:
- Cobertura de casos límite
- Calidad de assertions
- Claridad de los tests

Archivos: backend/apps/posts/tests/
```

## 🎯 Áreas Específicas de Revisión

### Backend (Django)

```
@workspace /agent code-review-agent

Revisa estos aspectos de Django en [archivo]:
- Optimización de queries (N+1, select_related, prefetch_related)
- Validación en serializers
- Permisos y autenticación
- Manejo de transacciones
- Seguridad (SQL injection, CSRF)
```

### Frontend (React/TypeScript)

```
@workspace /agent code-review-agent

Revisa estos aspectos de React en [archivo]:
- Uso correcto de hooks
- Prevención de re-renders innecesarios
- TypeScript (evitar 'any', tipos correctos)
- Manejo de errores y loading states
- Accesibilidad (ARIA, keyboard navigation)
```

### API Endpoints

```
@workspace /agent code-review-agent

Revisa el endpoint [archivo] y verifica:
- Rate limiting
- Validación de inputs
- Manejo de errores
- Respuestas HTTP correctas
- Documentación de API
```

### WebSockets

```
@workspace /agent code-review-agent

Revisa la implementación de WebSocket en [archivo]:
- Autenticación de conexiones
- Manejo de desconexiones
- Validación de mensajes
- Rate limiting
- Manejo de errores
```

## 📊 Interpretando el Feedback

El agente estructura su feedback en categorías:

### ✅ Fortalezas
Lo que está bien hecho. ¡Celebra estos logros!

### 🔴 Problemas Críticos
**Acción requerida**: Corregir antes de merge
- Vulnerabilidades de seguridad
- Bugs que rompen funcionalidad
- Riesgos de pérdida de datos

### 🟡 Problemas Importantes
**Recomendado corregir**: Mejora significativa
- Errores lógicos menores
- Falta de validación
- Manejo inadecuado de errores

### 🔵 Sugerencias
**Considera implementar**: Mejoras opcionales
- Refactorizaciones
- Optimizaciones de rendimiento
- Mejoras de legibilidad

### 📚 Oportunidades de Aprendizaje
Recursos y mejores prácticas para el futuro

## 💡 Mejores Prácticas

### ✅ DO - Hacer

- **Usa el agente regularmente** en cada PR
- **Sé específico** en tus preguntas
- **Proporciona contexto** sobre tus cambios
- **Lee todo el feedback** antes de actuar
- **Aprende de las sugerencias** para mejorar
- **Combina con revisión humana**

### ❌ DON'T - No Hacer

- **No ignores problemas críticos** marcados en rojo
- **No uses el agente como único revisor** para cambios importantes
- **No hagas cambios sin entender** el razonamiento
- **No esperes que sea perfecto** - usa tu juicio
- **No olvides actualizar tests** tras cambios sugeridos

## 🔧 Comandos Rápidos

### Revisión Completa de PR
```bash
@copilot /review usando code-review-agent
```

### Revisión de Archivo Específico
```bash
@workspace /agent code-review-agent revisa backend/apps/users/views.py
```

### Revisión de Seguridad
```bash
@workspace /agent code-review-agent haz una auditoría de seguridad de los cambios
```

### Revisión de Performance
```bash
@workspace /agent code-review-agent identifica problemas de rendimiento
```

### Sugerencias de Refactoring
```bash
@workspace /agent code-review-agent sugiere refactorizaciones para mejorar el código
```

## 📚 Recursos Adicionales

- [Documentación Completa del Agente](.github/agents/README.md)
- [Code Review Agent - Configuración](.github/agents/code-review-agent.md)
- [Reporte de Seguridad del Proyecto](SECURITY_REPORT.md)
- [Guía de Testing de la Aplicación](APP_TESTING_GUIDE.md)

## ⚡ Tips Avanzados

### 1. Revisión Multi-archivo
```
@workspace /agent code-review-agent

Revisa la consistencia entre:
- backend/apps/posts/models.py
- backend/apps/posts/serializers.py
- backend/apps/posts/views.py

Verifica que la lógica esté bien distribuida.
```

### 2. Revisión de Arquitectura
```
@workspace /agent code-review-agent

Analiza la arquitectura de la feature de [nombre]:
- ¿Sigue los patrones del proyecto?
- ¿Hay mejor forma de estructurarlo?
- ¿Viola algún principio SOLID?
```

### 3. Revisión Pre-Deploy
```
@workspace /agent code-review-agent

Revisión final antes de deploy a producción:
- Verifica seguridad crítica
- Revisa configuración de producción
- Valida manejo de errores
- Confirma logging adecuado
```

## 🆘 Troubleshooting

### El agente no responde
- Verifica que estás usando la sintaxis correcta
- Asegúrate de estar en un repositorio con el agente configurado
- Intenta con `@workspace` en lugar de `@copilot`

### Feedback demasiado genérico
- Sé más específico en tu pregunta
- Menciona el archivo exacto que quieres revisar
- Proporciona contexto sobre qué buscar

### No entiendo una sugerencia
- Pide al agente que explique con más detalle
- Busca documentación sobre el tema
- Consulta con tu equipo

---

**¿Preguntas?** Abre un issue en el repositorio o consulta la [documentación completa](.github/agents/README.md).

**Última actualización**: Noviembre 2024
