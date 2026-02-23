# Análisis de Criterios de Framework — Proyecto RED-RED

> **Stack principal:** React 18 · TailwindCSS 3 · Framer Motion · Headless UI · react-hook-form · react-hot-toast · Lucide React

---

## a) Se han reconocido las diferentes utilidades y clases que proporciona el framework ✅

**Se cumple completamente.**

El proyecto utiliza activamente las utilidades de TailwindCSS (clases de layout, color, tipografía, espaciado, z-index, responsive) además de librerías del ecosistema React.

| Utilidad / Clase | Dónde se usa |
|---|---|
| Clases de layout Tailwind (`flex`, `grid`, `min-h-screen`, `max-w-7xl`) | [Layout.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js) — toda la estructura |
| Utilidades de color custom (`primary-*`, `secondary-*`) | [tailwind.config.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/tailwind.config.js) — colores extendidos |
| `backdrop-blur`, `shadow-*`, `rounded-*` | [Layout.js#L105-L108](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L105-L108) — header glassmorphism |
| `class-variance-authority` + `clsx` + `tailwind-merge` | `package.json` — gestión de clases condicionadas |
| `@headlessui/react` | `package.json` + modales del proyecto |
| `lucide-react` (iconografía) | [Layout.js#L4-L19](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L4-L19) — todos los iconos de navegación |
| `react-hot-toast` (notificaciones) | `package.json` — toasts del sistema |
| `react-query` (caché de datos) | `package.json` — gestión de estado servidor |

---

## b) Se han utilizado y personalizado los componentes predefinidos ✅

**Se cumple completamente.**

Existe una biblioteca de componentes UI propia en `frontend/src/components/ui/` que envuelve y personaliza primitivas de React y Framer Motion:

| Componente | Archivo | Personalización |
|---|---|---|
| `Button` | [Button.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Button.js) | 6 variantes (`primary`, `secondary`, `outline`, `ghost`, `danger`, `success`), 4 tamaños, estado `loading`, icono posicionable |
| `Modal` | [Modal.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Modal.js) | Componente reutilizable con backdrop y animación |
| `Input` | [Input.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Input.js) | Input con icono, variantes y estilos dark/light |
| `Avatar` / `ChatAvatar` | [Avatar.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Avatar.js) | Tamaños, indicador online, marco cosmético |
| `Card` | [Card.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Card.js) | Tarjeta base reutilizable |
| `LoadingSpinner` | [LoadingSpinner.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/LoadingSpinner.js) | 4 variantes: `spinner`, `dots`, `pulse`, `skeleton` |
| `ThemeToggle` | [ThemeToggle.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ThemeToggle.js) | 3 variantes: `button`, `compact`, `segmented` |

**Ejemplo clave — `Button.js`:** usa `motion.button` de Framer Motion con `whileHover` y `whileTap`, combinando variantes de TailwindCSS generadas dinámicamente:

```js
// Button.js
<motion.button
  whileHover={{ scale: disabled ? 1 : 1.02 }}
  whileTap={{ scale: disabled ? 1 : 0.98 }}
  className={`${baseClasses} ${variantClasses} ${sizeClasses} ...`}
>
```

---

## c) Se ha modificado la disposición de los elementos de la interfaz ✅

**Se cumple completamente.**

El layout de la aplicación es completamente personalizado: header fijo con glassmorphism, sidebar lateral en escritorio y menú hamburguesa en móvil, contenido central con `max-w-3xl`.

| Elemento | Archivo | Descripción |
|---|---|---|
| Header sticky glassmorphism | [Layout.js#L101-L108](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L101-L108) | `fixed top-0`, `backdrop-blur-2xl`, `z-40` |
| Sidebar lateral (desktop) | [Layout.js#L427-L599](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L427-L435) | `hidden lg:block fixed left-0 w-64 xl:w-72` |
| Menú hamburgesa (móvil) | [Layout.js#L275-L422](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L296-L422) | `lg:hidden`, desplegable con `AnimatePresence` |
| Contenido principal | [Layout.js#L602-L611](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L602-L611) | `lg:ml-64 xl:ml-72`, `max-w-3xl mx-auto` |
| Elementos decorativos de fondo | [Layout.js#L67-L98](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L67-L98) | Blobs animados con `blur-3xl`, `fixed inset-0` |

---

## d) Se han personalizado estilos y temas predefinidos ✅

**Se cumple completamente.**

Hay un sistema de diseño propio con tema claro/oscuro dinámico y paleta de colores personalizada en dos niveles:

### 1. TailwindCSS extendido

[tailwind.config.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/tailwind.config.js) añade:
- Paleta `primary` (tonos rojos `#fef2f2` → `#7f1d1d`)
- Paleta `secondary` (tonos slate)
- `darkMode: "class"` para modo oscuro por clase CSS
- Animaciones personalizadas: `fade-in`, `slide-up`, `slide-down` con sus `@keyframes`

### 2. Sistema de tema en JS

[theme.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/styles/theme.js) exporta un objeto `theme` con:
- Colores `primary`, `secondary`, `neutral`, estados (`success`, `warning`, `error`, `info`)
- Sombras en 7 niveles (`xs` → `2xl`)
- Border-radius, transiciones, espaciado, tipografía, z-index jerárquico
- Variantes de animación Framer Motion exportadas (`fadeIn`, `slideUp`, `scaleIn`, …)

### 3. ThemeContext (dark/light/auto)

`ThemeContext.js` controla el tema a nivel de aplicación aplicando/removiendo la clase `dark` en el `<html>`, respetando también `prefers-color-scheme`.

```js
// tailwind.config.js
darkMode: "class",
theme: {
  extend: {
    colors: {
      primary: { 500: "#ef4444", 600: "#dc2626", ... }
    }
  }
}
```

---

## e) Se ha creado un diseño responsivo y adaptativo ✅

**Se cumple completamente.**

Se usan breakpoints de TailwindCSS (`sm:`, `md:`, `lg:`, `xl:`) en toda la interfaz para adaptar el layout:

| Breakpoint | Comportamiento |
|---|---|
| `< lg` (móvil/tablet) | Header con botón hamburguesa, sin sidebar, menú desplegable vertical |
| `>= lg` (escritorio) | Sidebar fijo lateral `w-64`, header con navegación completa |
| `>= xl` | Sidebar se amplía a `w-72` |
| `hidden md:flex` | Barra de búsqueda oculta en móvil, visible en tablet+ |
| `max-w-3xl mx-auto` | Contenido centrado y limitado en pantallas grandes |
| `sm:px-6 lg:px-8` | Padding progresivo según tamaño de pantalla |

**Ejemplo en Layout.js:**
```jsx
{/* Búsqueda: solo visible en md+ */}
<div className="hidden md:flex flex-1 max-w-lg mx-8">

{/* Sidebar: solo en escritorio */}
<nav className="hidden lg:block fixed left-0 w-64 xl:w-72 ...">

{/* Menú móvil */}
<div className="lg:hidden flex items-center gap-2">
```

---

## f) Se han creado animaciones y transiciones ✅

**Se cumple completamente.**

Las animaciones se implementan en **tres capas** complementarias:

### 1. CSS puro — `animations.css` (585 líneas)

[animations.css](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/styles/animations.css) define:

| Grupo | Ejemplos |
|---|---|
| Keyframes base | `fadeIn`, `slideDown`, `slideUp`, `slideInLeft`, `slideInRight`, `scaleIn`, `pulse`, `bounce`, `heartBeat`, `shake`, `rotate`, `shimmer`, `ripple` |
| Clases reutilizables | `.animate-fadeIn`, `.animate-heartBeat`, `.animate-shimmer`, `.stagger-item` (delays para listas) |
| Transiciones | `.transition-smooth`, `.transition-fast`, `.transition-slow` |
| Efectos hover | `.hover-lift`, `.hover-scale`, `.hover-glow` |
| Efectos de botón | `.btn-ripple`, `.btn-gradient-animated`, `.btn-shine` |
| Efectos especiales | `.glass-effect`, `.neon-glow`, `.text-gradient-animated`, `.loading-skeleton` |
| Cosméticos | `cosmetic-frame-neon/gold/fire/diamond/rainbow`, `cosmetic-badge-pulse` |
| Accesibilidad | `@media (prefers-reduced-motion: reduce)` — desactiva animaciones si el usuario lo prefiere |

### 2. TailwindCSS — `tailwind.config.js`

Animaciones registradas como utilidades Tailwind:
```js
animation: {
  "fade-in":   "fadeIn 0.3s ease-in",
  "slide-up":  "slideUp 0.3s ease-out",
  "slide-down":"slideDown 0.3s ease-out",
}
```
Usadas directamente como clases: `animate-slide-down` en [ThemeToggle.js#L54](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ThemeToggle.js#L54).

### 3. Framer Motion — animaciones declarativas en componentes

| Componente | Animación |
|---|---|
| [Layout.js — Header](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L101-L104) | `initial={{ y: -100 }} animate={{ y: 0 }}` (spring) |
| [Layout.js — Sidebar](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L427-L430) | `initial={{ x: -100, opacity: 0 }}` (spring, delay 0.2s) |
| [Layout.js — Nav items](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L441-L450) | Stagger (`delay: index * 0.08`), `whileHover={{ x: 8 }}` |
| [Layout.js — Menú móvil](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L299-L303) | `AnimatePresence` + `height: 0 → auto` |
| [Layout.js — Blobs fondo](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L68-L97) | `scale + rotate` infinito (20-25s) |
| [Layout.js — Logo](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/Layout.js#L114-L134) | `whileHover: { scale: 1.1, rotate: 5 }` (spring) |
| [Button.js](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/ui/Button.js#L51-L52) | `whileHover: scale(1.02)`, `whileTap: scale(0.98)` |
| [LoadingSpinner — dots](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/LoadingSpinner.js#L60-L75) | `y: [0,-10,0]`, stagger entre puntos |
| [LoadingSpinner — skeleton](file:///c:/Users/alvar/OneDrive/Documentos/2ºDAM/PDAUF/RED-RED/frontend/src/components/LoadingSpinner.js#L124-L139) | `opacity: [0.5, 0.8, 0.5]` infinito |

---

## Resumen

| Criterio | Estado | Evidencia principal |
|---|---|---|
| a) Utilidades y clases del framework | ✅ Cumple | TailwindCSS + Headless UI + Lucide + react-query |
| b) Componentes predefinidos y personalizados | ✅ Cumple | `components/ui/` — Button, Modal, Input, Avatar, Card, Spinner |
| c) Modificación de disposición de interfaz | ✅ Cumple | Layout con header+sidebar+main, menú hamburguesa |
| d) Estilos y temas personalizados | ✅ Cumple | `tailwind.config.js` + `theme.js` + `ThemeContext` |
| e) Diseño responsivo y adaptativo | ✅ Cumple | Breakpoints `sm/md/lg/xl` en todo el layout |
| f) Animaciones y transiciones | ✅ Cumple | `animations.css` (585 líneas) + Tailwind + Framer Motion |
