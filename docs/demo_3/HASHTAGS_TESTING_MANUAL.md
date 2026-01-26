# Manual de Testing - Sistema de Hashtags

## ✅ Checklist de Pruebas

### Backend

#### 1. Extracción de Hashtags

```python
# En Django shell
from apps.posts.hashtags import extract_hashtags

# Test 1: Hashtags simples
text = "I love #Python and #Django"
result = extract_hashtags(text)
# Esperado: ['python', 'django']

# Test 2: Múltiples hashtags
text = "#React #Vue #Angular #JavaScript"
result = extract_hashtags(text)
# Esperado: ['react', 'vue', 'angular', 'javascript']

# Test 3: Hashtags duplicados
text = "#Python is great! #Python rocks!"
result = extract_hashtags(text)
# Esperado: ['python'] (sin duplicados)

# Test 4: Sin hashtags
text = "No hashtags here"
result = extract_hashtags(text)
# Esperado: []
```

#### 2. Creación de Posts con Hashtags

```bash
# Crear post via API
curl -X POST http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Testing #API with #hashtags"}'

# Verificar que se crearon los hashtags
# En Django shell:
from apps.posts.models import Hashtag
Hashtag.objects.all()
```

#### 3. Endpoints de API

**Listar hashtags:**

```bash
curl http://localhost:8000/api/posts/hashtags/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Trending hashtags:**

```bash
curl http://localhost:8000/api/posts/hashtags/trending/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Detalle de hashtag:**

```bash
curl http://localhost:8000/api/posts/hashtags/python/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Posts de hashtag:**

```bash
curl http://localhost:8000/api/posts/hashtags/python/posts/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend

#### 1. Componente TextWithHashtags

- [ ] Los hashtags aparecen en color azul
- [ ] Los hashtags son clickeables
- [ ] Click en hashtag navega a `/hashtags/:slug`
- [ ] Hover muestra efecto visual
- [ ] El texto normal se mantiene igual

#### 2. Widget TrendingHashtags

- [ ] Muestra top hashtags
- [ ] Muestra contadores correctos
- [ ] Click en hashtag funciona
- [ ] Se actualiza automáticamente
- [ ] Loading state funciona
- [ ] Error state funciona

#### 3. Página de Trending (/trending)

- [ ] Muestra lista de hashtags
- [ ] Búsqueda funciona
- [ ] Tabs funcionan (Trending/Todos)
- [ ] Grid es responsivo
- [ ] Click en hashtag navega correctamente

#### 4. Página de Hashtag (/hashtags/:slug)

- [ ] Muestra información del hashtag
- [ ] Lista posts correctamente
- [ ] Click en post funciona
- [ ] Click en usuario funciona
- [ ] Botón volver funciona
- [ ] Error handling funciona

#### 5. Integración en Home

- [ ] Posts muestran hashtags clickeables
- [ ] Comentarios muestran hashtags clickeables
- [ ] Crear post con hashtags funciona
- [ ] Editar post actualiza hashtags
- [ ] Eliminar post limpia hashtags

## 🧪 Casos de Prueba Específicos

### Caso 1: Crear Post con Hashtags

1. Ir a Home (`/`)
2. Click en crear post
3. Escribir: "Probando #React #JavaScript #webdev"
4. Publicar
5. **Verificar**: Hashtags son azules y clickeables
6. Click en #React
7. **Verificar**: Navega a `/hashtags/react`
8. **Verificar**: El post aparece en la lista

### Caso 2: Ver Tendencias

1. Ir a `/trending`
2. **Verificar**: Muestra lista de hashtags
3. **Verificar**: Muestra contadores
4. Click en un hashtag
5. **Verificar**: Navega correctamente
6. **Verificar**: Muestra posts relacionados

### Caso 3: Buscar Hashtags

1. Ir a `/trending`
2. Escribir "java" en búsqueda
3. **Verificar**: Filtra hashtags que contienen "java"
4. Limpiar búsqueda
5. **Verificar**: Vuelve a mostrar todos

### Caso 4: Editar Post con Hashtags

1. Crear post: "Original #Python"
2. Editar post a: "Editado #JavaScript #React"
3. Guardar
4. **Verificar**: Hashtags se actualizaron
5. **Verificar**: Contador de #Python decrementó
6. **Verificar**: Contadores de #JavaScript y #React incrementaron

### Caso 5: Eliminar Post con Hashtags

1. Crear post: "Test #DeleteMe"
2. Verificar contador de #DeleteMe
3. Eliminar post
4. **Verificar**: Contador de #DeleteMe decrementó
5. Si era el único post, el hashtag puede desaparecer o quedar en 0

### Caso 6: Hashtags en Comentarios

1. Crear post cualquiera
2. Comentar: "Me gusta! #awesome"
3. **Verificar**: #awesome es clickeable en el comentario
4. Click en #awesome
5. **Verificar**: Navega correctamente

## 🎨 Testing de UI/UX

### Responsive Design

- [ ] Desktop (>1024px): Funcionan todos los layouts
- [ ] Tablet (768px-1024px): Grid se ajusta
- [ ] Mobile (<768px): Cards en columna única

### Tema Oscuro

- [ ] Cambiar a dark mode
- [ ] Verificar colores de hashtags
- [ ] Verificar contraste en cards
- [ ] Verificar hover effects

### Animaciones

- [ ] Hover en hashtags suave
- [ ] Transiciones de página suaves
- [ ] Loading spinners funcionan
- [ ] Animaciones no causan lag

### Accesibilidad

- [ ] Tab navigation funciona
- [ ] Screen readers detectan enlaces
- [ ] Contraste de colores adecuado
- [ ] Focus states visibles

## 🐛 Testing de Edge Cases

### Hashtags Especiales

```javascript
// Test con números
"Test #123test"; // ✅ Debe funcionar

// Test con guiones
"Test #test_case"; // ✅ Debe funcionar

// Test con espacios (no debe funcionar)
"Test #test case"; // Solo debe detectar #test

// Test con símbolos
"Test #test!"; // Solo debe detectar #test

// Test al inicio
"#Starting with hashtag"; // ✅ Debe funcionar

// Test al final
"Ending with hashtag #end"; // ✅ Debe funcionar

// Test múltiples consecutivos
"#One#Two#Three"; // ✅ Debe detectar los 3
```

### Contadores

1. Crear 5 posts con #Test
2. Verificar contador = 5
3. Editar 1 post, quitar #Test
4. Verificar contador = 4
5. Eliminar 2 posts con #Test
6. Verificar contador = 2

### Performance

1. Crear 100+ hashtags diferentes
2. Verificar que la lista carga rápido
3. Verificar que búsqueda es instantánea
4. Verificar que no hay memory leaks

## 📊 Métricas de Éxito

- [ ] Tiempo de carga de trending < 1s
- [ ] Búsqueda responde en < 200ms
- [ ] Navegación entre páginas < 500ms
- [ ] No hay errores en consola
- [ ] No hay warnings de React
- [ ] Contadores siempre precisos

## ✅ Checklist Final

Antes de considerar completado:

### Backend

- [ ] Todos los endpoints funcionan
- [ ] Contadores son precisos
- [ ] No hay errores en logs
- [ ] Migraciones aplicadas correctamente

### Frontend

- [ ] Todos los componentes renderizan
- [ ] Navegación funciona
- [ ] No hay errores de consola
- [ ] Estilos correctos en todos los temas

### Integración

- [ ] Posts muestran hashtags clickeables
- [ ] Trending se actualiza
- [ ] Búsqueda funciona
- [ ] Links de navegación correctos

### UX

- [ ] Loading states apropiados
- [ ] Error handling claro
- [ ] Empty states informativos
- [ ] Animaciones suaves

## 🎉 Resultado Esperado

Después de todas las pruebas, el usuario debería poder:

1. ✅ Crear posts con hashtags naturalmente
2. ✅ Ver hashtags como enlaces azules
3. ✅ Click en hashtag → ver posts relacionados
4. ✅ Explorar trending hashtags
5. ✅ Buscar hashtags específicos
6. ✅ Todo funciona sin errores

---

**Nota**: Si alguna prueba falla, revisar:

1. Console logs (Frontend)
2. Django logs (Backend)
3. Network tab (Requests API)
4. React DevTools (Component state)
