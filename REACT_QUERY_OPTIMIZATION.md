# React Query Optimization Guide - RED-RED

## 🎯 Configuración Global

```javascript
// frontend/src/App.js
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configurado para 5 minutos antes de considerar stale
      staleTime: 5 * 60 * 1000,

      // Mantener data en cache por 10 minutos
      cacheTime: 10 * 60 * 1000,

      // No refetch al hacer focus en ventana (evita reloads innecesarios en chat)
      refetchOnWindowFocus: false,

      // Reintentar queries fallidas 2 veces
      retry: 2,

      // Delay entre reintentos: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // No reintentar mutations por defecto (evita duplicados)
      retry: 0,
    },
  },
});
```

## 📊 Estrategias por Tipo de Dato

### 1. Feed de Publicaciones (Home)

**Características:**

- Cambia frecuentemente
- Crítico para UX
- Puede tener muchos datos

**Configuración:**

```javascript
const { data: posts, isLoading } = useQuery(
  ["posts"],
  async () => {
    const response = await api.get("/posts/");
    return response.data;
  },
  {
    staleTime: 3 * 60 * 1000, // 3 minutos (feed dinámico)
    refetchOnMount: false, // No refetch si hay cache válido
  }
);
```

### 2. Lista de Conversaciones (Chat)

**Características:**

- Actualización frecuente
- Indicadores de no leídos importantes
- Polling periódico útil

**Configuración:**

```javascript
const { data: conversations = [] } = useQuery(
  ["conversations"],
  async () => {
    const response = await api.get("/chat/chats/");
    return response.data;
  },
  {
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30000, // Refetch cada 30 segundos
  }
);
```

### 3. Mensajes de Chat

**Características:**

- Actualización en tiempo real vía WebSocket
- No necesita polling
- Cache importante para scroll

**Estrategia:** NO usar React Query, manejar con estado local + WebSocket

```javascript
// ❌ NO hacer esto
const { data: messages } = useQuery(["messages", chatId], ...);

// ✅ Hacer esto
const [messages, setMessages] = useState([]);

useEffect(() => {
  const handleNewMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  socketService.on("chat_message", handleNewMessage);
  return () => socketService.off("chat_message", handleNewMessage);
}, []);
```

### 4. Perfil de Usuario

**Características:**

- Cambia raramente
- Importante cachear
- Múltiples componentes pueden necesitarlo

**Configuración:**

```javascript
const { data: profile } = useQuery(
  ["profile", userId],
  async () => {
    const response = await api.get(`/api/users/${userId}/`);
    return response.data;
  },
  {
    staleTime: 10 * 60 * 1000, // 10 minutos (cambia poco)
    cacheTime: 30 * 60 * 1000, // 30 minutos en memoria
  }
);
```

### 5. Historias (Stories)

**Características:**

- Temporal (24h)
- Actualización frecuente
- Cache corto

**Configuración:**

```javascript
const { data: stories } = useQuery(
  ["stories"],
  async () => {
    const response = await api.get("/api/stories/");
    return response.data;
  },
  {
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnMount: true, // Siempre refetch al montar
  }
);
```

## 🔄 Invalidación de Cache

### Cuando Invalidar

```javascript
const queryClient = useQueryClient();

// Después de crear un post
const createPostMutation = useMutation(
  async (postData) => {
    const response = await api.post("/posts/", postData);
    return response.data;
  },
  {
    onSuccess: () => {
      // Invalidar lista de posts para refetch
      queryClient.invalidateQueries(["posts"]);
    },
  }
);

// Después de dar like
const likeMutation = useMutation(
  async (postId) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },
  {
    onSuccess: () => {
      // Invalidar posts para actualizar contador
      queryClient.invalidateQueries(["posts"]);
    },
  }
);

// Después de crear chat
const createChatMutation = useMutation(
  async (username) => {
    const response = await api.post(`/chat/chat/create/${username}/`);
    return response.data;
  },
  {
    onSuccess: () => {
      // Invalidar conversaciones
      queryClient.invalidateQueries(["conversations"]);
    },
  }
);
```

## ⚡ Optimistic Updates

### Para Likes (UX Instantánea)

```javascript
const likeMutation = useMutation(
  async (postId) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },
  {
    // Antes de la mutación
    onMutate: async (postId) => {
      // Cancelar refetch en progreso
      await queryClient.cancelQueries(["posts"]);

      // Snapshot del estado anterior
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Actualizar optimísticamente
      queryClient.setQueryData(["posts"], (old) => {
        return {
          ...old,
          results: old.results.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: !post.is_liked,
                  likes_count: post.is_liked
                    ? post.likes_count - 1
                    : post.likes_count + 1,
                }
              : post
          ),
        };
      });

      // Retornar context con snapshot
      return { previousPosts };
    },

    // Si falla, revertir
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
      toast.error("Error al dar like");
    },

    // Siempre refetch después para confirmar
    onSettled: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  }
);
```

## 🎛️ Query Keys Best Practices

### Estructura de Keys

```javascript
// ✅ Buenas prácticas
["posts"][("posts", postId)][("posts", { filter: "hot" })][ // Lista de posts // Post específico // Posts filtrados
  ("messages", chatId)
][("profile", userId)][ // Mensajes de un chat // Perfil de usuario
  // ❌ Evitar
  "data"
]["messages"][chatId]; // Muy genérico // Sin contexto (¿de qué chat?) // Sin prefijo descriptivo
```

### Invalidación Granular

```javascript
// Invalidar todos los posts
queryClient.invalidateQueries(["posts"]);

// Invalidar solo un post específico
queryClient.invalidateQueries(["posts", postId]);

// Invalidar usando prefijo (todos los mensajes)
queryClient.invalidateQueries(["messages"]);
```

## 🚀 Prefetching

### Para Navegación Predecible

```javascript
// En lista de conversaciones, prefetch mensajes al hover
const prefetchMessages = (chatId) => {
  queryClient.prefetchQuery(
    ["messages", chatId],
    async () => {
      const response = await api.get(`/chat/chats/${chatId}/messages/`);
      return response.data;
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minuto
    }
  );
};

// En el componente
<button
  onMouseEnter={() => prefetchMessages(chat.id)}
  onClick={() => selectChat(chat)}
>
  {chat.name}
</button>;
```

## 📦 Cache Persistence (Opcional)

### Para Offline-First Experience

```javascript
import { QueryClient } from "react-query";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { createWebStoragePersistor } from "react-query/createWebStoragePersistor-experimental";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 horas
    },
  },
});

const localStoragePersistor = createWebStoragePersistor({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persistor: localStoragePersistor,
});
```

## 🐛 Debugging

### React Query Devtools

```javascript
import { ReactQueryDevtools } from "react-query/devtools";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {/* Solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### Logging

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        console.error("Query error:", error);
        // Enviar a servicio de logging (Sentry, etc)
      },
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});
```

## 📊 Métricas de Performance

### Monitorear Cache Hits

```javascript
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      console.log(`✅ Query success: ${query.queryKey}`);
    },
    onError: (error, query) => {
      console.log(`❌ Query error: ${query.queryKey}`, error);
    },
  }),
});
```

## 🎯 Resumen de Configuraciones por Caso de Uso

| Caso de Uso    | staleTime | cacheTime | refetchInterval | refetchOnMount |
| -------------- | --------- | --------- | --------------- | -------------- |
| Feed Posts     | 3 min     | 10 min    | -               | false          |
| Conversaciones | 2 min     | 10 min    | 30s             | false          |
| Perfil Usuario | 10 min    | 30 min    | -               | false          |
| Historias      | 1 min     | 5 min     | -               | true           |
| Búsqueda       | 5 min     | 10 min    | -               | false          |

## 💡 Tips Finales

1. **No usar React Query para datos en tiempo real (WebSocket)** - Manejar con estado local
2. **Invalidar después de mutations** - Mantener UI sincronizada
3. **Configurar staleTime apropiado** - Balance entre freshness y requests
4. **Usar keys descriptivos** - Facilita invalidación y debugging
5. **Implementar error boundaries** - Manejar errores de queries globalmente
6. **Considerar optimistic updates** - Solo para operaciones rápidas y reversibles
7. **Monitorear cache hits** - Optimizar configuraciones basándose en métricas
8. **No sobre-optimizar** - Comenzar simple, optimizar según necesidades reales
