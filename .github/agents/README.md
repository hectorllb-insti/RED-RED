# GitHub Copilot Agents for RED-RED

Este directorio contiene agentes personalizados de GitHub Copilot para el proyecto RED-RED.

## 🤖 Agentes Disponibles

### Code Review Agent (`code-review-agent.md`)

Agente especializado en revisión de código, seguridad, refactorización y calidad del código.

#### Capacidades

1. **📋 Revisión de Código**
   - Análisis exhaustivo de cambios de código
   - Identificación de errores lógicos y casos límite
   - Verificación de consistencia con patrones del proyecto
   - Revisión de manejo de errores y logging

2. **🔒 Detección de Vulnerabilidades de Seguridad**
   - Escaneo de vulnerabilidades comunes (SQL injection, XSS, CSRF)
   - Revisión de implementaciones de autenticación y autorización
   - Verificación de validación y sanitización de entradas
   - Detección de secretos expuestos
   - Revisión de configuraciones CORS y seguridad de endpoints

3. **♻️ Recomendaciones de Refactorización**
   - Identificación de code smells
   - Sugerencias de mejoras arquitectónicas
   - Recomendaciones de patrones de diseño
   - Optimizaciones de rendimiento

4. **✨ Evaluación de Calidad del Código**
   - Evaluación de legibilidad y convenciones
   - Revisión de cobertura de tests
   - Análisis de mantenibilidad
   - Verificación de accesibilidad
   - Revisión del uso de TypeScript

#### Cómo Usar el Agente

##### Opción 1: En Pull Requests (Recomendado)

1. **Crear una Pull Request** en GitHub
2. **Mencionar al agente** en un comentario:
   ```
   @copilot /review usando code-review-agent
   ```
3. **El agente analizará** todos los cambios y proporcionará feedback detallado

##### Opción 2: En el Chat de GitHub Copilot

1. **Abrir GitHub Copilot Chat** en VS Code o GitHub.com
2. **Invocar al agente**:
   ```
   @workspace /agent code-review-agent revisa este código
   ```

##### Opción 3: Para Revisión Específica de Archivos

```
@workspace /agent code-review-agent revisa el archivo backend/apps/posts/views.py
```

#### Ejemplos de Uso

##### Revisión General de PR
```
@copilot /review usando code-review-agent

Por favor, revisa todos los cambios en esta PR, enfocándote especialmente en:
- Seguridad de la autenticación JWT
- Validación de entradas de usuario
- Optimización de queries de base de datos
```

##### Revisión de Seguridad Específica
```
@workspace /agent code-review-agent

Revisa el archivo backend/apps/authentication/views.py y verifica:
- Que la implementación JWT sea segura
- Que no haya vulnerabilidades de autenticación
- Que los tokens se manejen correctamente
```

##### Revisión de Calidad de Código
```
@workspace /agent code-review-agent

Analiza frontend/src/components/PostCard.tsx y sugiere:
- Mejoras de rendimiento
- Refactorizaciones para mejor legibilidad
- Mejores prácticas de React y TypeScript
```

#### Resultados Esperados

El agente proporcionará feedback estructurado en las siguientes categorías:

- **✅ Fortalezas**: Aspectos bien implementados
- **🔴 Problemas Críticos**: Deben ser corregidos (seguridad, bugs)
- **🟡 Problemas Importantes**: Deberían ser corregidos (errores lógicos, validaciones)
- **🔵 Sugerencias**: Considerar para mejoras (refactorización, optimización)
- **📚 Oportunidades de Aprendizaje**: Mejores prácticas y recursos

## 🛠️ Stack Tecnológico Cubierto

### Backend
- Django 4.2+
- Django REST Framework
- Django Channels (WebSockets)
- PostgreSQL / SQLite
- Redis
- JWT Authentication

### Frontend
- React 18+
- TypeScript 5+
- TailwindCSS
- Axios
- React Router

### Herramientas
- Git
- pytest (Python testing)
- Jest + React Testing Library
- flake8 (Python linting)
- ESLint (JavaScript/TypeScript linting)

## 📝 Mejores Prácticas para Usar el Agente

1. **Usa el agente regularmente** en tus Pull Requests antes de solicitar revisión humana
2. **Proporciona contexto** sobre lo que cambiaste y por qué
3. **Sé específico** en tus preguntas para obtener mejor feedback
4. **Revisa el feedback completo** antes de hacer cambios
5. **Aprende de las sugerencias** para mejorar tu código futuro
6. **Combina con revisión humana** para mejores resultados

## 🔧 Configuración del Proyecto

El agente está configurado específicamente para el proyecto RED-RED y conoce:

- Estructura del proyecto (frontend/backend separados)
- Convenciones de código establecidas
- Patrones arquitectónicos utilizados
- Tecnologías y dependencias del proyecto
- Requisitos de seguridad específicos

## 📚 Recursos Adicionales

- [Documentación de GitHub Copilot](https://docs.github.com/en/copilot)
- [Guía de Seguridad del Proyecto](/SECURITY_REPORT.md)
- [Estructura del Proyecto](/MODULE_STRUCTURE.md)
- [Documentación de API](/API_DOCUMENTATION.md)

## 🤝 Contribuir

Si encuentras formas de mejorar el agente:

1. Abre un issue describiendo la mejora
2. Envía una PR con cambios al archivo `code-review-agent.md`
3. Documenta los cambios en este README

## 📄 Licencia

Este agente es parte del proyecto RED-RED y está bajo la misma licencia MIT del proyecto.

---

**Última actualización**: Noviembre 2024  
**Mantenido por**: Equipo RED-RED
