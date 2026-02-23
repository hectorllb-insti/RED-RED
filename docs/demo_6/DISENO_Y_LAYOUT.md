# 📐 Diseño, Layout y Responsividad - RED-RED

> **Análisis de la estructura espacial y adaptabilidad (Criterios C y E)**

## 📋 Arquitectura de Disposición

La interfaz de RED-RED se basa en un sistema de rejilla dinámica y un layout principal definido en `frontend/src/components/Layout.js`.

```mermaid
layout BT
    subgraph "Estructura de Pantalla"
        Header[Header sticky / glassmorphism]
        Sidebar[Sidebar Navigation]
        Main[Main Content / Feed]
        Modals[Overlays / Modals]
    end
```

---

## 📱 Diseño Responsivo (Mobile-First)

Hemos implementado una estrategia **Mobile-First** utilizando los breakpoints de TailwindCSS.

### Adaptación por Dispositivo:

| Dispositivo | Tamaño | Comportamiento |
|---|---|---|
| **Móvil** | `< 768px` | Navegación vertical oculta en menú hamburguesa. El feed ocupa el 100% de la pantalla. |
| **Tablet** | `768px - 1024px` | Aparecen elementos adicionales como la barra de búsqueda y acciones rápidas. |
| **Escritorio** | `> 1024px` | Se despliega el Sidebar lateral fijo (`w-64`) y el layout se divide en áreas claras. |

---

## 📐 Modificación de la Interfaz

Se ha modificado la disposición estándar para crear una experiencia de "App nativa":

1.  **Header Glassmorphism**: Utiliza `backdrop-blur-2xl` para dar profundidad.
2.  **Sidebar Ergonómico**: Situado a la izquierda para acceso rápido a secciones principales.
3.  **Contenido Max-Widht**: El feed está limitado a `max-w-3xl` para mejorar la legibilidad y evitar líneas demasiado largas en monitores ultra-panorámicos.

---

## ✅ Evidencia de Cumplimiento

Se cumplen los **Criterios C y E** mediante:
*   El uso extensivo de las clases `sm:`, `md:`, `lg:` y `xl:` de Tailwind.
*   Una estructura de Layout propia que no depende de plantillas prefabricadas.
*   Una gestión dinámica de la visibilidad de componentes según el tamaño de pantalla.
