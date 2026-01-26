# Guía de Pruebas - Sistema de Optimización de Imágenes

## ✅ Qué se ha implementado:

### 1. **Sistema de nombres únicos**

- Cada imagen subida recibe un nombre único: `YYYYMMDD_HHMMSS_<8-char-uuid>.<ext>`
- Ejemplo: `20251104_143025_a7b3c9f2.jpg`
- **Resultado**: Nunca se sobrescribirán archivos, aunque tengan el mismo nombre original

### 2. **Optimización automática**

Las imágenes se optimizan automáticamente al subirlas:

| Tipo            | Dimensiones máximas | Calidad | Notas                      |
| --------------- | ------------------- | ------- | -------------------------- |
| Foto de perfil  | 500x500px           | 90%     | Mantiene aspecto ratio     |
| Foto de portada | 1920x600px          | 85%     | Para banners anchos        |
| Imagen de post  | 1920x1920px         | 85%     | Posts cuadrados/verticales |

### 3. **Formatos soportados**

- ✅ JPEG (optimizado)
- ✅ PNG (optimizado)
- ✅ WebP (optimizado)
- ✅ GIF (NO optimizado para preservar animación)

### 4. **Conversión automática**

- Las imágenes PNG con transparencia se convierten a JPEG con fondo blanco
- Las imágenes grandes se redimensionan manteniendo el aspecto ratio

## 🧪 Cómo probar:

### Prueba 1: Nombres únicos

1. Sube una imagen a tu perfil (ejemplo: `foto.jpg`)
2. Vuelve a subir la misma imagen
3. Verifica en la carpeta `media/profile_pics/` que hay dos archivos con nombres diferentes

### Prueba 2: Optimización

1. Sube una imagen muy grande (por ejemplo, 4000x3000px)
2. Verifica que se ha redimensionado automáticamente
3. Comprueba que el tamaño del archivo es menor

### Prueba 3: GIFs animados

1. Sube un GIF animado en un post
2. Verifica que mantiene su animación
3. Comprueba que NO se ha convertido a imagen estática

## 📁 Archivos creados/modificados:

```
backend/
├── apps/
│   ├── users/
│   │   ├── utils.py (NUEVO) ← Funciones de optimización
│   │   ├── models.py (MODIFICADO) ← Paths dinámicos
│   │   ├── serializers.py (MODIFICADO) ← Validación + optimización
│   │   └── migrations/
│   │       └── 0003_alter_user_cover_picture_alter_user_profile_picture.py
│   └── posts/
│       ├── models.py (MODIFICADO) ← Path dinámico
│       ├── serializers.py (MODIFICADO) ← Optimización de posts
│       └── migrations/
│           └── 0005_alter_post_image.py
```

## 🔒 Seguridad del Login - Análisis:

### ✅ CORRECTO - No hay problema de seguridad

El flujo actual es:

1. Usuario ingresa email y contraseña en el frontend
2. Se envía POST a `/auth/login/` con `{ email, password }`
3. Backend valida credenciales y genera JWT
4. Frontend recibe y guarda SOLO el token JWT
5. La contraseña NUNCA se guarda

### Mejoras recomendadas para producción:

- ✅ Usar HTTPS en producción (obligatorio)
- ✅ Implementar rate limiting en login (evitar fuerza bruta)
- ✅ Agregar CAPTCHA después de X intentos fallidos
- ✅ Logs de intentos de login fallidos
- 🔄 Considerar agregar 2FA (autenticación de dos factores)

## 📊 Beneficios de la optimización:

### Antes:

```
foto_original.jpg: 4000x3000px, 2.5MB
foto_original.jpg: 4000x3000px, 2.5MB (SOBRESCRITA!)
```

### Después:

```
20251104_143025_a7b3c9f2.jpg: 500x375px, 85KB ✅
20251104_143127_b8c4d0e3.jpg: 500x375px, 85KB ✅
```

**Ahorro**: ~97% de espacio, carga 30x más rápida

## 🚀 Próximos pasos recomendados:

1. **Lazy loading de imágenes**: Cargar imágenes bajo demanda
2. **CDN**: Servir imágenes desde un CDN para mayor velocidad
3. **Thumbnails**: Generar miniaturas para listas/galerías
4. **WebP moderno**: Usar WebP como formato principal (mejor compresión)
5. **Progressive JPEG**: Para mejor experiencia de carga
6. **Limpiar archivos huérfanos**: Script para eliminar imágenes no usadas

## ❓ FAQ:

**P: ¿Las imágenes antiguas se optimizarán?**
R: No, solo las nuevas. Para optimizar las antiguas necesitas un script de migración.

**P: ¿Puedo cambiar la calidad de compresión?**
R: Sí, edita los parámetros en `backend/apps/users/utils.py`:

```python
optimize_profile_picture(image, max_width=500, quality=90)
```

**P: ¿Los GIFs ocupan mucho espacio?**
R: Sí, por eso se mantienen sin optimizar. Considera limitar el tamaño máximo (actualmente 10MB).

**P: ¿Funciona con todos los navegadores?**
R: Sí, los formatos JPEG/PNG/GIF son universales.

## 🎉 ¡Listo para probar!

Reinicia el servidor backend y prueba subiendo imágenes.

```bash
python manage.py runserver
```
