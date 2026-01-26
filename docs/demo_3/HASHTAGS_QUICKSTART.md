# 🔥 Sistema de Hashtags - Guía Rápida

## 🎯 ¿Qué es?

Sistema completo que permite usar hashtags (#) en publicaciones para organizar y descubrir contenido.

## ⚡ Inicio Rápido

### 1. Usar Hashtags en Posts

```javascript
// Simplemente escribe hashtags en tus posts
"¡Aprendiendo #JavaScript y #React! #webdev";
```

Los hashtags se detectan automáticamente y se vuelven clickeables.

### 2. Ver Tendencias

Visita `/trending` para ver:

- 🔥 Hashtags más populares
- 📊 Estadísticas de uso
- 🔍 Buscar hashtags

### 3. Explorar por Hashtag

Click en cualquier hashtag → Ver todos los posts con ese tema

## 🛠️ Para Desarrolladores

### Agregar Hashtags Clickeables a tu Componente

```jsx
import { TextWithHashtags } from "../components/HashtagLink";

function MyPost({ post }) {
  return (
    <div>
      <TextWithHashtags text={post.content} />
    </div>
  );
}
```

### Mostrar Widget de Tendencias

```jsx
import TrendingHashtags from "../components/TrendingHashtags";

function Sidebar() {
  return (
    <aside>
      <TrendingHashtags limit={10} showTitle={true} />
    </aside>
  );
}
```

### Usar el Servicio de Hashtags

```javascript
import hashtagService from "../services/hashtagService";

// Obtener tendencias
const trending = await hashtagService.getTrendingHashtags();

// Buscar hashtags
const results = await hashtagService.getHashtags("javascript");

// Posts de un hashtag
const posts = await hashtagService.getHashtagPosts("react");

// Extraer hashtags de texto
const tags = hashtagService.extractHashtags("I love #coding");
```

## 🎨 Personalización

### Cambiar Estilos de Hashtags

Edita `frontend/src/components/HashtagLink.css`:

```css
.hashtag-link {
  color: #your-color;
  font-weight: 600;
  /* tus estilos */
}
```

### Tema Oscuro

Los estilos incluyen soporte para dark mode automáticamente.

## 📱 Rutas

| Ruta              | Descripción                           |
| ----------------- | ------------------------------------- |
| `/trending`       | Explorar tendencias y buscar hashtags |
| `/hashtags/:slug` | Ver posts de un hashtag específico    |

## 🔌 API Endpoints

| Endpoint                            | Método | Descripción        |
| ----------------------------------- | ------ | ------------------ |
| `/api/posts/hashtags/`              | GET    | Listar hashtags    |
| `/api/posts/hashtags/trending/`     | GET    | Top trending (24h) |
| `/api/posts/hashtags/{slug}/`       | GET    | Detalle de hashtag |
| `/api/posts/hashtags/{slug}/posts/` | GET    | Posts del hashtag  |

## 💡 Tips

1. **Formato de Hashtags**: `#palabra` (sin espacios)
2. **Case Insensitive**: #React = #react
3. **Caracteres**: Letras, números, guiones bajos
4. **Auto-detección**: No necesitas hacer nada especial

## 🐛 Solución de Problemas

### Los hashtags no aparecen

```bash
# Verificar migraciones
python manage.py migrate

# Verificar que el procesamiento está activo
# Los hashtags se procesan automáticamente al crear/editar posts
```

### Los contadores están mal

```python
# En Django shell
from apps.posts.models import Hashtag, PostHashtag

# Recalcular contadores
for hashtag in Hashtag.objects.all():
    count = PostHashtag.objects.filter(hashtag=hashtag).count()
    hashtag.usage_count = count
    hashtag.save()
```

### Los hashtags no son clickeables

Asegúrate de usar el componente `TextWithHashtags`:

```jsx
// ❌ Incorrecto
<p>{post.content}</p>

// ✅ Correcto
<TextWithHashtags text={post.content} />
```

## 📚 Más Información

- Documentación completa: `HASHTAGS_SYSTEM.md`
- Estado de implementación: `HASHTAGS_IMPLEMENTATION_COMPLETE.md`

## 🎉 ¡Listo!

El sistema está completamente funcional. Solo empieza a usar hashtags en tus posts! 🚀

---

**Ejemplos de Hashtags**:

- `#JavaScript` - Lenguaje de programación
- `#webdev` - Desarrollo web
- `#React` - Framework frontend
- `#Django` - Framework backend
- `#fullstack` - Desarrollo full stack
