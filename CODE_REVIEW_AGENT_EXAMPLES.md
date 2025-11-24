# Ejemplo de Uso del Code Review Agent

Este documento muestra ejemplos reales de cómo usar el Code Review Agent en el proyecto RED-RED.

## Escenario 1: Revisión de Autenticación

### Contexto
Un desarrollador ha creado un nuevo endpoint de autenticación y quiere revisar la seguridad.

### Comando
```
@workspace /agent code-review-agent

Revisa el archivo backend/apps/authentication/views.py y verifica:
- Seguridad en el manejo de credenciales
- Implementación correcta de JWT
- Validación de inputs
- Manejo de errores
```

### Feedback Esperado del Agente

#### ✅ Fortalezas
- Uso correcto de Django REST Framework
- Implementación de JWT tokens
- Serializers con validación

#### 🔴 Problemas Críticos
- **Verificar rate limiting**: Los endpoints de login/registro deberían tener rate limiting para prevenir ataques de fuerza bruta
- **Validación de contraseñas**: Asegurar que se valide complejidad de contraseñas

#### 🟡 Problemas Importantes
- **Logging de intentos fallidos**: Considerar logging de intentos de login fallidos para auditoría
- **Mensajes de error**: No revelar si el usuario existe o no en mensajes de error

#### 🔵 Sugerencias
- Implementar logout en blacklist de tokens
- Considerar implementar 2FA para mayor seguridad

---

## Escenario 2: Revisión de Componente React

### Contexto
Se ha creado un nuevo componente de feed de publicaciones que parece tener problemas de rendimiento.

### Comando
```
@workspace /agent code-review-agent

Analiza frontend/src/pages/Home.js para problemas de rendimiento:
- Re-renders innecesarios
- Uso incorrecto de hooks
- Carga de datos ineficiente
```

### Feedback Esperado del Agente

#### ✅ Fortalezas
- Uso de React Hooks modernos
- Separación de componentes

#### 🔴 Problemas Críticos
- **Dependencias de useEffect**: useEffect sin array de dependencias causa re-renders infinitos

#### 🟡 Problemas Importantes
- **Falta memoización**: Los componentes hijos deberían usar React.memo
- **Fetch en cada render**: API calls deberían estar en useEffect

#### 🔵 Sugerencias
- Implementar virtualización para listas largas (react-window)
- Usar React Query o SWR para caché de datos
- Implementar lazy loading de imágenes

---

## Escenario 3: Revisión de Seguridad General

### Contexto
Antes de lanzar a producción, se quiere una auditoría de seguridad completa.

### Comando
```
@copilot /review usando code-review-agent

Auditoría de seguridad completa para preparación de producción:
- Vulnerabilidades de seguridad
- Exposición de datos sensibles
- Configuración de producción
- Dependencias vulnerables
```

### Feedback Esperado del Agente

#### 🔴 Problemas Críticos a Revisar
1. **CORS Configuration**: Verificar que CORS esté configurado correctamente para producción
2. **SECRET_KEY**: Asegurar que SECRET_KEY no esté hardcoded
3. **DEBUG Mode**: DEBUG debe estar en False en producción
4. **Database Backups**: Implementar estrategia de backups
5. **HTTPS**: Asegurar que HTTPS esté forzado en producción

#### 🟡 Problemas Importantes
1. **Input Sanitization**: Revisar sanitización en todas las entradas de usuario
2. **SQL Injection**: Verificar uso correcto del ORM en queries custom
3. **XSS Protection**: Verificar escape de HTML en frontend
4. **CSRF Tokens**: Asegurar que estén habilitados y funcionando
5. **Authentication**: Revisar expiración de tokens JWT

#### 🔵 Mejoras Sugeridas
1. **Rate Limiting**: Implementar en endpoints críticos
2. **Logging**: Mejorar logging para auditoría de seguridad
3. **Monitoring**: Implementar monitoring de seguridad (Sentry, etc.)
4. **Security Headers**: Agregar headers de seguridad (CSP, X-Frame-Options, etc.)

---

## Escenario 4: Revisión de Performance de Base de Datos

### Contexto
El feed de publicaciones es lento cuando hay muchos usuarios.

### Comando
```
@workspace /agent code-review-agent

Revisa backend/apps/posts/views.py para optimización de base de datos:
- N+1 queries
- Índices faltantes
- Queries ineficientes
- Uso de select_related/prefetch_related
```

### Feedback Esperado del Agente

#### 🔴 Problemas Críticos
- **N+1 Problem**: Cargar posts con usuario y likes genera N+1 queries
  ```python
  # Problema
  posts = Post.objects.all()
  for post in posts:
      print(post.user.username)  # Query por cada post!
  
  # Solución
  posts = Post.objects.select_related('user').all()
  ```

#### 🟡 Problemas Importantes
- **Prefetch para relacionesMany**: Usar prefetch_related para likes y comentarios
- **Paginación**: Implementar paginación para reducir carga

#### 🔵 Sugerencias
- **Caché**: Implementar Redis para cachear posts populares
- **Índices**: Agregar índices en campos frequently queried
- **Query Optimization**: Usar .only() o .defer() para campos no necesarios

---

## Escenario 5: Refactorización de Código Legacy

### Contexto
Hay un archivo con mucha lógica duplicada que necesita refactorización.

### Comando
```
@workspace /agent code-review-agent

Sugiere refactorización para backend/apps/posts/serializers.py:
- Eliminar código duplicado
- Mejorar estructura
- Aplicar principios SOLID
- Mejorar legibilidad
```

### Feedback Esperado del Agente

#### 🔵 Sugerencias de Refactorización

**1. Extraer validación común**
```python
# Antes
class PostSerializer(serializers.ModelSerializer):
    def validate_content(self, value):
        if len(value) < 1:
            raise ValidationError("Content too short")
        if len(value) > 500:
            raise ValidationError("Content too long")
        return value

class CommentSerializer(serializers.ModelSerializer):
    def validate_content(self, value):
        if len(value) < 1:
            raise ValidationError("Content too short")
        if len(value) > 500:
            raise ValidationError("Content too long")
        return value

# Después
class ContentValidatorMixin:
    def validate_content_length(self, value, min_len=1, max_len=500):
        if len(value) < min_len:
            raise ValidationError(f"Content too short (min {min_len})")
        if len(value) > max_len:
            raise ValidationError(f"Content too long (max {max_len})")
        return value

class PostSerializer(ContentValidatorMixin, serializers.ModelSerializer):
    def validate_content(self, value):
        return self.validate_content_length(value)
```

**2. Usar métodos de clase reutilizables**
**3. Separar lógica de negocio de serialización**
**4. Implementar validators personalizados**

---

## Escenario 6: Revisión de Tests

### Contexto
Se han agregado nuevos tests pero se quiere verificar su calidad.

### Comando
```
@workspace /agent code-review-agent

Revisa backend/apps/posts/tests.py y evalúa:
- Cobertura de casos límite
- Calidad de assertions
- Setup y teardown correctos
- Nomenclatura de tests
```

### Feedback Esperado del Agente

#### ✅ Fortalezas
- Buenos nombres descriptivos de tests
- Uso correcto de fixtures

#### 🟡 Problemas Importantes
- **Falta cobertura**: No hay tests para casos de error
- **Assertions débiles**: Usar assertions más específicas
  ```python
  # Débil
  self.assertTrue(len(posts) > 0)
  
  # Mejor
  self.assertEqual(len(posts), 3)
  ```

#### 🔵 Sugerencias
- Agregar tests para edge cases
- Implementar tests de integración
- Usar factories para datos de test (factory_boy)
- Agregar tests de performance

---

## Escenario 7: Revisión de Accesibilidad

### Contexto
Se quiere mejorar la accesibilidad del sitio web.

### Comando
```
@workspace /agent code-review-agent

Revisa frontend/src/components/ para accesibilidad:
- ARIA labels
- Keyboard navigation
- Screen reader support
- Contraste de colores
```

### Feedback Esperado del Agente

#### 🟡 Problemas Importantes
- **ARIA labels faltantes**: Botones sin aria-label descriptivo
- **Focus management**: Falta manejo de focus en modals
- **Keyboard navigation**: Algunos elementos no son accesibles por teclado

#### 🔵 Sugerencias
```jsx
// Antes
<button onClick={handleLike}>❤️</button>

// Después
<button 
  onClick={handleLike}
  aria-label={isLiked ? "Unlike post" : "Like post"}
  aria-pressed={isLiked}
>
  ❤️
</button>
```

**Mejoras adicionales:**
- Implementar focus trap en modals
- Agregar skip navigation links
- Usar semantic HTML
- Verificar contraste de colores (WCAG AA)

---

## Tips para Mejores Resultados

### 1. Sé Específico
❌ "Revisa este código"
✅ "Revisa la seguridad de la autenticación en backend/apps/authentication/views.py"

### 2. Proporciona Contexto
❌ "¿Está bien este componente?"
✅ "Este componente tiene problemas de performance con listas grandes. ¿Cómo puedo optimizarlo?"

### 3. Pregunta Por Categorías
✅ "Revisa solo aspectos de seguridad"
✅ "Sugiere solo refactorizaciones"
✅ "Analiza solo performance"

### 4. Incluye Archivos Relevantes
✅ "Revisa estos archivos relacionados: models.py, serializers.py, views.py"

---

## Workflow Recomendado

1. **Durante el desarrollo**: Pregunta al agente sobre decisiones de diseño
2. **Antes del commit**: Revisa los cambios para errores obvios
3. **En la PR**: Solicita revisión completa del agente
4. **Antes de merge**: Auditoría de seguridad final
5. **Post-merge**: Aprende de las sugerencias para próximos PRs

---

## Recursos

- [Documentación Completa](.github/agents/README.md)
- [Quick Start Guide](CODE_REVIEW_AGENT_QUICKSTART.md)
- [Configuración del Agente](.github/agents/code-review-agent.md)

---

**Última actualización**: Noviembre 2024  
**Mantenido por**: Equipo RED-RED
