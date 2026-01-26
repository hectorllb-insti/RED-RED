# Sistema de Hashtags y Tendencias 🔥

## Descripción General

Sistema completo de hashtags implementado en RED-RED que permite a los usuarios:

- Usar hashtags en sus publicaciones (#hashtag)
- Ver tendencias en tiempo real
- Explorar posts por hashtag
- Descubrir contenido relacionado

## 🎯 Características Implementadas

### 1. Detección Automática de Hashtags

- Los hashtags se detectan automáticamente al crear o editar posts
- Formato: `#palabra` (sin espacios, letras/números/guiones bajos)
- Se procesan en tiempo real al guardar la publicación

### 2. Almacenamiento y Contadores

- **Modelo Hashtag**: Almacena hashtags únicos con:

  - `name`: Nombre del hashtag (sin #)
  - `slug`: Versión normalizada para URLs
  - `usage_count`: Contador total de usos
  - `created_at`, `updated_at`: Timestamps

- **Modelo PostHashtag**: Relación muchos-a-muchos entre posts y hashtags
  - Índices optimizados para búsquedas rápidas
  - Constraints de unicidad

### 3. Hashtags Clickeables

- Los hashtags en posts y comentarios son enlaces interactivos
- Navegación directa a la página del hashtag
- Diseño visual distintivo (color azul, hover effects)

### 4. Página de Tendencias

- Top hashtags de las últimas 24 horas
- Lista completa de todos los hashtags
- Búsqueda de hashtags
- Estadísticas: posts recientes y totales

### 5. Página de Hashtag Individual

- Posts que contienen el hashtag
- Información del hashtag (uso, estadísticas)
- Navegación fácil entre posts relacionados

### 6. Widget de Tendencias

- Componente `TrendingHashtags` reutilizable
- Auto-actualización cada 5 minutos
- Top 10 hashtags trending
- Puede integrarse en cualquier página

## 📁 Estructura de Archivos

### Backend

```
backend/apps/posts/
├── models.py              # Modelos Hashtag y PostHashtag
├── hashtags.py            # Utilidades para procesar hashtags
├── serializers.py         # Serializers con soporte de hashtags
├── views.py               # HashtagViewSet y endpoints
└── urls.py                # Rutas de API
```

### Frontend

```
frontend/src/
├── services/
│   └── hashtagService.js       # Servicio API de hashtags
├── components/
│   ├── HashtagLink.js          # Componente de hashtag clickeable
│   ├── HashtagLink.css         # Estilos para hashtags
│   ├── TrendingHashtags.js     # Widget de tendencias
│   └── TrendingHashtags.css    # Estilos del widget
└── pages/
    ├── HashtagPage.js          # Página de hashtag individual
    ├── HashtagPage.css         # Estilos de la página
    ├── TrendingPage.js         # Página de exploración
    └── TrendingPage.css        # Estilos de exploración
```

## 🔌 Endpoints API

### Listar Hashtags

```
GET /api/posts/hashtags/
Query params:
  - search: string (opcional, búsqueda por nombre)

Response: Array de hashtags ordenados por uso
```

### Hashtags en Tendencia

```
GET /api/posts/hashtags/trending/

Response: Top 10 hashtags de las últimas 24 horas
```

### Detalle de Hashtag

```
GET /api/posts/hashtags/{slug}/

Response: Detalle del hashtag con estadísticas
```

### Posts de un Hashtag

```
GET /api/posts/hashtags/{slug}/posts/

Response: Array de posts que contienen el hashtag
```

## 💻 Uso en el Código

### Crear Post con Hashtags (Automático)

```javascript
// El procesamiento es automático, solo escribir el post
const post = {
  content: "¡Me encanta #JavaScript y #React! #webdev",
};

// Los hashtags se extraen y procesan automáticamente
await api.post("/posts/", post);
```

### Renderizar Texto con Hashtags

```javascript
import { TextWithHashtags } from "../components/HashtagLink";

// En tu componente
<TextWithHashtags text={post.content} />;
```

### Mostrar Widget de Tendencias

```javascript
import TrendingHashtags from "../components/TrendingHashtags";

// En cualquier parte de tu UI
<TrendingHashtags limit={10} showTitle={true} />;
```

### Buscar Hashtags

```javascript
import hashtagService from "../services/hashtagService";

// Buscar hashtags
const results = await hashtagService.getHashtags("javascript");

// Obtener tendencias
const trending = await hashtagService.getTrendingHashtags();

// Posts de un hashtag
const posts = await hashtagService.getHashtagPosts("javascript");
```

## 🎨 Customización de Estilos

Los hashtags usan la clase CSS `.hashtag-link`:

```css
.hashtag-link {
  color: #1da1f2;
  font-weight: 500;
  cursor: pointer;
  /* ... más estilos */
}
```

Para cambiar el color o estilo, edita `HashtagLink.css`.

## 🔧 Funciones Utilitarias Backend

### `extract_hashtags(text)`

Extrae hashtags de un texto

```python
from apps.posts.hashtags import extract_hashtags

hashtags = extract_hashtags("Hello #world #python")
# ['world', 'python']
```

### `process_hashtags_for_post(post)`

Procesa hashtags de un post (crear, actualizar contadores)

```python
from apps.posts.hashtags import process_hashtags_for_post

process_hashtags_for_post(post_instance)
```

### `linkify_hashtags(text)`

Convierte hashtags en HTML con enlaces

```python
from apps.posts.hashtags import linkify_hashtags

html = linkify_hashtags("I love #coding")
# 'I love <a href="/hashtags/coding" ...>#coding</a>'
```

## ⚡ Optimizaciones

1. **Índices de Base de Datos**

   - Índice en `usage_count` para ordenamiento rápido
   - Índice en `slug` para búsquedas por URL
   - Índice compuesto en PostHashtag para relaciones

2. **Caché Frontend**

   - React Query con staleTime de 5 minutos
   - Auto-revalidación al cambiar de página

3. **Contadores Eficientes**
   - Métodos `increment_usage()` y `decrement_usage()`
   - Updates atómicos en BD

## 🚀 Rutas Frontend

```javascript
// Página de tendencias
/trending

// Página de hashtag específico
/hashtags/{slug}
```

## 📊 Ejemplo de Flujo Completo

1. **Usuario crea post**: "¡Nuevo proyecto con #React y #Django! #webdev"

2. **Backend procesa**:

   - Extrae hashtags: ['react', 'django', 'webdev']
   - Crea hashtags si no existen
   - Crea relaciones PostHashtag
   - Incrementa contadores

3. **Frontend muestra**:

   - Post con hashtags clickeables
   - Hashtags aparecen en trending
   - Click en hashtag → página con posts relacionados

4. **Usuario explora**:
   - Ve todos los posts con #React
   - Descubre contenido relacionado
   - Interactúa con otros posts

## 🔐 Seguridad

- Sanitización de input en hashtags
- Validación de formato (solo alfanuméricos y guiones)
- Rate limiting en endpoints de API
- Autenticación requerida para ver tendencias

## 📝 Notas Importantes

1. Los hashtags NO distinguen mayúsculas/minúsculas (#React = #react)
2. Los espacios terminan el hashtag (#web dev = solo #web)
3. Los contadores se actualizan en tiempo real
4. Las tendencias se calculan sobre las últimas 24 horas
5. Al eliminar un post, los contadores se decrementan automáticamente

## 🐛 Debugging

### Ver hashtags de un post

```python
post = Post.objects.get(id=1)
hashtags = post.post_hashtags.all()
for ph in hashtags:
    print(ph.hashtag.name, ph.hashtag.usage_count)
```

### Recalcular contadores

```python
from apps.posts.models import Hashtag, PostHashtag

for hashtag in Hashtag.objects.all():
    count = PostHashtag.objects.filter(hashtag=hashtag).count()
    hashtag.usage_count = count
    hashtag.save()
```

## 📈 Futuras Mejoras (Opcionales)

- [ ] Sugerencias de hashtags al escribir
- [ ] Hashtags relacionados/similares
- [ ] Estadísticas históricas de hashtags
- [ ] Hashtags populares por categoría
- [ ] Notificaciones de trending hashtags
- [ ] Seguir hashtags específicos
- [ ] Hashtags en stories y comentarios

## ✅ Testing

Para probar el sistema:

1. Crear posts con hashtags
2. Verificar que aparecen en trending
3. Click en hashtag → ver posts relacionados
4. Buscar hashtags en /trending
5. Editar post → hashtags se actualizan
6. Eliminar post → contadores decrementan

## 🎉 Conclusión

El sistema de hashtags está completamente funcional e integrado en la aplicación. Los usuarios pueden:

- ✅ Usar hashtags en posts naturalmente
- ✅ Ver qué está trending
- ✅ Explorar contenido por temas
- ✅ Descubrir posts relacionados
- ✅ Navegar fácilmente entre hashtags

Todo funciona de manera automática y eficiente! 🚀
