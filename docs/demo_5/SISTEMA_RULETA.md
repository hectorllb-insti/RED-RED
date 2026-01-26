# 🎰 Sistema de Ruleta y Recompensas - RED-RED

> **Sistema de gamificación con ruleta diaria, tienda y personalización**

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Sistema de Puntos](#sistema-de-puntos)
- [Ruleta Diaria](#ruleta-diaria)
- [Tienda de Items](#tienda-de-items)
- [Sistema de Inventario](#sistema-de-inventario)
- [Personalización de Perfil](#personalización-de-perfil)

---

## 🎯 Visión General

El sistema de recompensas permite a los usuarios ganar puntos diariamente mediante una ruleta, comprar items cosméticos en la tienda y personalizar sus perfiles.

```mermaid
graph TB
    A[👤 Usuario] --> B[🎰 Ruleta Diaria]
    B --> C[🪙 Ganar Puntos]
    C --> D[🛒 Comprar Items]
    D --> E[🎒 Inventario]
    E --> F[✨ Equipar Items]
    F --> G[🌟 Perfil Personalizado]
    
    style A fill:#3498db
    style B fill:#e74c3c
    style C fill:#f39c12
    style D fill:#9b59b6
    style E fill:#1abc9c
    style F fill:#e67e22
    style G fill:#2ecc71
```

### Características Principales:

- 🎲 **Ruleta Diaria**: 3 tiradas gratis al día
- 💰 **Sistema de Puntos**: Acumulables y gastables
- 🛍️ **Tienda**: Marcos, efectos y insignias
- 🎒 **Inventario**: Gestión de items comprados
- ✨ **Personalización**: Equipar y mostrar items

---

## 💰 Sistema de Puntos

### Economía del Juego:

```mermaid
graph LR
    subgraph Ganar Puntos
        A[🎰 Ruleta<br/>10-1000]
        B[📝 Crear Post<br/>+5]
        C[❤️ Recibir Like<br/>+1]
        D[💬 Comentario<br/>+2]
    end
    
    subgraph Gastar Puntos
        E[🛒 Tienda<br/>300-2500]
        F[🔄 Restaurar<br/>-100]
    end
    
    A --> G[💰 Balance]
    B --> G
    C --> G
    D --> G
    G --> E
    G --> F
```

### Métodos para Ganar Puntos:

| Acción | Puntos | Frecuencia |
|--------|--------|------------|
| Ruleta (10-1000) | Variable | 3 veces/día |
| Crear post | +5 | Ilimitado |
| Recibir like | +1 | Por like |
| Recibir comentario | +2 | Por comentario |
| Nuevo seguidor | +3 | Por seguidor |

### Gestión de Balance:

El sistema gestiona automáticamente el balance de puntos:

- **Suma automática**: Al ganar premios o completar acciones
- **Resta automática**: Al comprar items o servicios
- **Validación**: No permite gastos si el balance es insuficiente
- **Persistencia**: Se guarda en localStorage y base de datos

---

## 🎰 Ruleta Diaria

### Mecánica de Juego:

```mermaid
stateDiagram-v2
    [*] --> CheckDate: Usuario abre ruleta
    CheckDate --> NewDay: Es un día nuevo
    CheckDate --> SameDay: Mismo día
    
    NewDay --> ResetSpins: Spins = 0
    SameDay --> CheckSpins: Verificar spins
    
    ResetSpins --> HasSpins
    CheckSpins --> HasSpins: Spins < 3
    CheckSpins --> NoSpins: Spins >= 3
    
    HasSpins --> Spin: Usuario gira
    Spin --> WinPrize: Ganar premio
    WinPrize --> IncrementSpins: Spins++
    IncrementSpins --> CheckSpins
    
    NoSpins --> OfferRestore: 100 puntos por tirada
    OfferRestore --> PayRestore: Usuario paga
    PayRestore --> HasSpins
```

### Premios y Probabilidades:

```mermaid
pie title Probabilidades de Premios
    "10 Puntos (40%)" : 40
    "50 Puntos (30%)" : 30
    "100 Puntos (15%)" : 15
    "200 Puntos (10%)" : 10
    "500 Puntos (4%)" : 4
    "1000 Puntos (1%)" : 1
```

### Tabla de Premios:

| Premio | Valor | Tipo | Probabilidad | Color |
|--------|-------|------|--------------|-------|
| 10 Puntos | 10 | Común | 40% | Gris |
| 50 Puntos | 50 | Común | 30% | Gris oscuro |
| 100 Puntos | 100 | Raro | 15% | Azul |
| 200 Puntos | 200 | Raro | 10% | Azul oscuro |
| 500 Puntos | 500 | Épico | 4% | Morado |
| 1000 Puntos | 1000 | Legendario | 1% | Dorado |

### Sistema de Tiradas:

**Tiradas Gratis:**
- **3 tiradas diarias**: Se resetean a medianoche
- **Acumulación**: Las tiradas NO se acumulan entre días
- **Tracking**: Se guarda en localStorage por usuario

**Restaurar Tiradas:**
- **Costo**: 100 puntos por tirada
- **Límite**: Sin límite si tienes puntos
- **Uso**: Solo si ya usaste las 3 tiradas gratis

### Persistencia de Datos:

```mermaid
graph TD
    A[Datos Ruleta] --> B[localStorage]
    B --> C[user_id]
    B --> D[date]
    B --> E[spins_used]
    
    F[Verificación] --> G{Fecha actual?}
    G -->|Nueva| H[Reset a 0 spins]
    G -->|Misma| I[Cargar spins usados]
```

---

## 🛒 Tienda de Items

### Categorías de Items:

```mermaid
graph TD
    A[🛍️ Tienda] --> B[🖼️ Marcos]
    A --> C[✨ Efectos]
    A --> D[🏆 Insignias]
    
    B --> B1[Marco Neón<br/>500 pts]
    B --> B2[Marco Dorado<br/>1000 pts]
    B --> B3[Marco Diamante<br/>1500 pts]
    
    C --> C1[Efecto Rojo<br/>300 pts]
    C --> C2[Efecto Gradiente<br/>400 pts]
    C --> C3[Efecto Neón<br/>600 pts]
    
    D --> D1[Insignia Supporter<br/>2000 pts]
    D --> D2[Insignia Gamer<br/>1500 pts]
    D --> D3[Insignia Corona<br/>2500 pts]
```

### Items Disponibles:

#### **Marcos de Perfil (5 items)**

| Nombre | Precio | Descripción |
|--------|--------|-------------|
| Marco Neón | 500 | Borde brillante neón |
| Marco Dorado | 1000 | Lujo VIP dorado |
| Marco de Fuego | 750 | Efecto de llamas |
| Marco Diamante | 1500 | Elegancia suprema |
| Marco Arcoíris | 800 | Colores vibrantes |

#### **Efectos de Chat (4 items)**

| Nombre | Precio | Descripción |
|--------|--------|-------------|
| Efecto Rojo | 300 | Estilo RedRed |
| Efecto Gradiente | 400 | Degradado único |
| Efecto Brillo | 500 | Mensajes brillan |
| Efecto Neón | 600 | Estilo cyberpunk |

#### **Insignias (5 items)**

| Nombre | Precio | Descripción |
|--------|--------|-------------|
| Insignia Supporter | 2000 | Apoyo a comunidad |
| Insignia Gamer | 1500 | Para jugadores |
| Insignia Estrella | 1800 | Destacar entre todos |
| Insignia Corona | 2500 | Realeza en RED-RED |
| Insignia Fuego | 1600 | Usuario en llamas |

### Proceso de Compra:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz
    participant Sys as Sistema
    
    U->>UI: Click "Comprar"
    UI->>Sys: Verificar item duplicado
    
    alt Item ya comprado
        Sys-->>UI: "Ya tienes este item"
    else Item nuevo
        Sys->>Sys: Verificar puntos
        alt Puntos suficientes
            Sys->>Sys: Restar puntos
            Sys->>Sys: Añadir a inventario
            Sys-->>UI: "¡Compra exitosa!"
        else Puntos insuficientes
            Sys-->>UI: "Puntos insuficientes"
        end
    end
```

### Filtrado en Tienda:

```mermaid
graph LR
    A[Filtro Tienda] --> B[Todo]
    A --> C[Marcos]
    A --> D[Efectos]
    A --> E[Insignias]
    
    B --> F[13 items]
    C --> G[5 items]
    D --> H[4 items]
    E --> I[4 items]
```

---

## 🎒 Sistema de Inventario

### Estructura del Inventario:

```mermaid
graph TD
    A[Inventario Usuario] --> B[Items Comprados]
    B --> C[Marcos]
    B --> D[Efectos]
    B --> E[Insignias]
    
    C --> F[Marco 1]
    C --> G[Marco 2]
    D --> H[Efecto 1]
    E --> I[Insignia 1]
    
    F --> J[✓ Equipado]
    G --> K[No equipado]
```

### Gestión de Items:

**Añadir al Inventario:**
- Se añade automáticamente al comprar
- No duplicados permitidos
- Organizado por categorías

**Ver Inventario:**
- Lista todos los items comprados
- Separa por tipo (marcos, efectos, insignias)
- Muestra cuáles están equipados

**Eliminar Items:**
- No implementado (compra permanente)
- Posibilidad de vender en futuro

---

## ✨ Personalización de Perfil

### Equipar Items:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant INV as Inventario
    participant SYS as Sistema
    participant UI as UI Perfil
    
    U->>INV: Click "Equipar"
    INV->>SYS: equipItem(item)
    
    alt Marco
        SYS->>SYS: user.equippedFrame = item
    else Efecto
        SYS->>SYS: user.equippedEffect = item
    else Insignia
        SYS->>SYS: user.equippedBadge = item
    end
    
    SYS->>UI: Actualizar vista
    UI-->>U: Item visible en perfil
```

### Items Equipados:

Cada usuario puede tener equipado simultáneamente:

- **1 Marco**: Borde del avatar
- **1 Efecto**: Estilo de mensajes en chat
- **1 Insignia**: Badge visible en perfil

```mermaid
graph LR
    A[Usuario] --> B[Marco Dorado]
    A --> C[Efecto Neón]
    A --> D[Insignia Gamer]
    
    B --> E[Visible en avatar]
    C --> F[Visible en mensajes]
    D --> G[Visible en perfil]
```

### Aplicación Visual:

#### 1. **Marcos en Avatar**

El marco equipado se aplica como borde del avatar del usuario:
- Border color según el marco
- Border width aumentado
- Animaciones opcionales

#### 2. **Efectos en Chat**

El efecto equipado cambia el estilo de los mensajes:
- Color de texto
- Sombras (text-shadow)
- Gradientes
- Animaciones de texto

#### 3. **Insignias en Perfil**

La insignia se muestra como badge:
- Junto al nombre de usuario
- En la tarjeta de perfil
- En lista de comentarios

---

## 📊 Estadísticas de Usuario

### Dashboard Personal:

```mermaid
graph TD
    A[Stats Usuario] --> B[Puntos Ganados Total]
    A --> C[Puntos Gastados]
    A --> D[Balance Actual]
    A --> E[Items en Inventario]
    A --> F[Items Equipados]
    
    B --> B1[1,245 pts]
    C --> C1[850 pts]
    D --> D1[395 pts]
    E --> E1[7 items]
    F --> F1[3 items]
```

### Distribución de Puntos:

```mermaid
pie title Fuente de Puntos Ganados
    "Ruleta" : 65
    "Posts" : 20
    "Likes" : 10
    "Comentarios" : 5
```

---

## 🎮 Interfaz de Usuario

### Tabs del Centro de Recompensas:

```mermaid
graph TB
    A[Centro de Recompensas] --> B[🎰 Jugar]
    A --> C[🛒 Tienda]
    A --> D[🎒 Inventario]
    
    B --> B1[Ruleta Visual]
    B --> B2[Contador Spins]
    B --> B3[Botón Restaurar]
    B --> B4[Último Premio]
    
    C --> C1[Filtros Categoría]
    C --> C2[Grid de Items]
    C --> C3[Botones Comprar]
    C --> C4[Balance Visible]
    
    D --> D1[Items por Tipo]
    D --> D2[Botones Equipar]
    D --> D3[Indicador Equipado]
    D --> D4[Info del Item]
```

### Elementos Visuales:

#### **Ruleta:**
- Círculo dividido en 6 segmentos
- Colores según rareza del premio
- Animación de rotación (5 segundos)
- Indicador del premio ganado

#### **Tienda:**
- Grid responsive de items
- Cards con imagen, nombre y precio
- Botón de compra (deshabilitado si no hay puntos)
- Indicador de "Ya comprado"

#### **Inventario:**
- Organizado por pestañas (Marcos, Efectos, Insignias)
- Muestra todos los items comprados
- Botón "Equipar" o checkmark "✓ Equipado"
- Previsualización del item

---

## 🎯 Estrategias de Juego

### Maximizar Puntos:

```mermaid
graph TD
    A[Estrategia] --> B[Usar tiradas diarias]
    A --> C[Crear contenido]
    A --> D[Interactuar con comunidad]
    
    B --> E[180-3000 pts/día]
    C --> F[+5 pts/post]
    D --> G[+1-3 pts/interacción]
```

### Priorizar Compras:

1. **Económico**: Empezar con efectos (300-600 pts)
2. **Visual**: Marcos para destacar (500-1500 pts)
3. **Elite**: Insignias de prestigio (1500-2500 pts)

---

## 🔄 Roadmap Futuro

```mermaid
timeline
    title Futuras Características
    Actual : Ruleta diaria
         : Tienda básica
         : Inventario
    Fase 2 : Eventos especiales
          : Ruleta premium
          : Intercambio entre usuarios
    Fase 3 : Sistema de logros
          : Seasons y Battle Pass
          : Items exclusivos temporales
```

---

## ✅ Checklist de Funcionalidades

- [x] ✅ Ruleta con 6 premios diferentes
- [x] ✅ Sistema de probabilidades balanceado
- [x] ✅ 3 tiradas gratis diarias
- [x] ✅ Restaurar tiradas con puntos
- [x] ✅ Reset diario automático
- [x] ✅ Tienda con 13+ items
- [x] ✅ Filtrado por categoría
- [x] ✅ Sistema de compra validado
- [x] ✅ Inventario organizado
- [x] ✅ Equipar/desequipar items
- [x] ✅ Visualización en perfil
- [x] ✅ Efectos aplicados en chat
- [x] ✅ Persistencia en localStorage
- [x] ✅ Animaciones fluidas
- [x] ✅ Diseño responsive

---

## 🎉 Resultado Final

Un sistema completo de gamificación con:
- 🎰 **Ruleta diaria** con probabilidades balanceadas
- 💰 **Economía virtual** funcional
- 🛍️ **Tienda** con items cosméticos variados
- 🎒 **Inventario** bien organizado
- ✨ **Personalización** completa de perfil y chat
- 📊 **Estadísticas** de usuario detalladas

**¡Diversión y personalización garantizadas!** 🎮

---