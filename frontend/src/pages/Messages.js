import { MessageSquare, Plus, Search, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import socketService from "../services/socket";

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchConversation, setSearchConversation] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Obtener lista de conversaciones
  const { data: conversations = [], isLoading: isLoadingConversations, error: conversationsError, refetch: refetchConversations } = useQuery(
    ["conversations"],
    async () => {
      try {
        console.log("🔍 Iniciando query de conversaciones...");
        console.log("👤 Usuario actual:", user);
        console.log("🔐 Autenticado:", !!user);
        
        console.log("📡 Realizando petición a /chat/chats/");
        const response = await api.get("/chat/chats/");
        
        console.log("📋 Respuesta completa de conversaciones:", response);
        console.log("📋 response.data:", response.data);
        console.log("📋 Tipo de response.data:", typeof response.data);
        console.log("📋 Es array response.data:", Array.isArray(response.data));
        
        if (!response.data) {
          console.warn("⚠️ response.data es null o undefined");
          return [];
        }
        
        // Extraer las conversaciones del objeto paginado
        let conversationsArray;
        if (Array.isArray(response.data)) {
          // Si es un array directo (sin paginación)
          conversationsArray = response.data;
          console.log("📦 Respuesta directa como array");
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Si es un objeto paginado con results
          conversationsArray = response.data.results;
          console.log("📦 Respuesta paginada, extrayendo results");
          console.log("📊 Total de conversaciones:", response.data.count);
        } else {
          console.warn("⚠️ Estructura de respuesta no reconocida:", response.data);
          return [];
        }
        
        console.log(`✅ Conversaciones recibidas: ${conversationsArray.length} elementos`);
        
        // Verificar duplicados por ID
        const ids = conversationsArray.map(conv => conv.id);
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
          console.warn("⚠️ Detectados duplicados por ID:", {
            total: ids.length,
            unicos: uniqueIds.length,
            duplicados: ids.filter((id, index) => ids.indexOf(id) !== index)
          });
        }
        
        // Verificar duplicados por other_user
        const otherUserIds = conversationsArray
          .map(conv => conv.other_user?.id)
          .filter(id => id !== undefined);
        const uniqueOtherUserIds = [...new Set(otherUserIds)];
        if (otherUserIds.length !== uniqueOtherUserIds.length) {
          console.warn("⚠️ Detectados duplicados por other_user:", {
            total: otherUserIds.length,
            unicos: uniqueOtherUserIds.length,
            duplicados: otherUserIds.filter((id, index) => otherUserIds.indexOf(id) !== index)
          });
        }
        
        conversationsArray.forEach((conv, index) => {
          console.log(`  📝 Conversación ${index + 1}:`, {
            id: conv.id,
            name: conv.name || 'Sin nombre',
            other_user: conv.other_user,
            participants: conv.participants,
            last_message: conv.last_message,
            updated_at: conv.updated_at,
            raw: conv
          });
        });
        
        // Eliminar duplicados en el frontend como medida de seguridad
        const uniqueConversations = conversationsArray.filter((conv, index, self) => 
          index === self.findIndex(c => c.id === conv.id)
        );
        
        if (uniqueConversations.length !== conversationsArray.length) {
          console.warn(`⚠️ Eliminados ${conversationsArray.length - uniqueConversations.length} duplicados en el frontend`);
        }
        
        // Ordenar conversaciones por updated_at descendente (más recientes primero)
        const sortedConversations = uniqueConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        console.log("🔄 Conversaciones ordenadas:", sortedConversations);
        console.log(`✅ Retornando ${sortedConversations.length} conversaciones únicas`);
        return sortedConversations;
      } catch (error) {
        console.error("❌ Error detallado obteniendo conversaciones:", error);
        console.error("❌ Error response:", error.response);
        console.error("❌ Error status:", error.response?.status);
        console.error("❌ Error data:", error.response?.data);
        throw error;
      }
    },
    {
      enabled: !!user, // Solo ejecutar si hay usuario autenticado
      staleTime: 15 * 1000, // Reducido de 30s a 15s - datos frescos más rápido
      refetchInterval: 5000, // Reducido de 10s a 5s - actualizaciones más frecuentes
      retry: 3,
      onError: (error) => {
        console.error("❌ Error en query de conversaciones:", error);
        if (error.response?.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          toast.error("Error al cargar conversaciones");
        }
      },
      onSuccess: (data) => {
        console.log("✅ Query de conversaciones exitosa. Datos finales:", data);
        console.log("✅ Cantidad de conversaciones para mostrar:", data?.length || 0);
      }
    }
  );

  // Mutation para crear chat privado
  const createChatMutation = useMutation(
    async (username) => {
      const response = await api.post(`/chat/chat/create/${username}/`);
      return response.data;
    },
    {
      onSuccess: (newChat) => {
        queryClient.invalidateQueries("conversations");
        setSelectedChat(newChat);
        setShowCreateChat(false);
        setSearchUsername("");
        toast.success("Chat creado exitosamente");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al crear el chat");
      },
    }
  );

  // Función estable para marcar mensajes como leídos (optimizada para velocidad)
  const markAsRead = useCallback(
    async (chatId) => {
      try {
        console.log(`📖 Marcando mensajes como leídos para chat ${chatId}`);
        
        // ⚡ ACTUALIZACIÓN OPTIMISTA: Actualizar el estado local INMEDIATAMENTE
        queryClient.setQueryData("conversations", (oldConversations) => {
          if (!oldConversations) return oldConversations;
          
          return oldConversations.map(conversation => {
            if (conversation.id === chatId) {
              console.log(`🔄 Actualizando unread_count para chat ${chatId}: ${conversation.unread_count} -> 0 (optimista)`);
              return {
                ...conversation,
                unread_count: 0
              };
            }
            return conversation;
          });
        });
        
        // Luego hacer la llamada al servidor (sin bloquear la UI)
        api.post(`/chat/chats/${chatId}/read/`).then(() => {
          console.log(`✅ Mensajes marcados como leídos en servidor para chat ${chatId}`);
        }).catch((error) => {
          console.error("❌ Error en servidor, revirtiendo estado:", error);
          // En caso de error, podríamos revertir el estado optimista aquí
        });
        
      } catch (error) {
        console.error("❌ Error marking messages as read:", error);
      }
    },
    [queryClient]
  );

  const handleCreateChat = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      createChatMutation.mutate(searchUsername.trim());
    }
  };

  // Función para manejar typing indicators
  const handleTypingStart = () => {
    if (selectedChat && !isTyping) {
      setIsTyping(true);
      socketService.send({
        type: "typing_start",
        room: selectedChat.id,
        user: user.id,
      });
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Establecer nuevo timeout para parar typing después de 2 segundos
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000);
  };

  const handleTypingStop = () => {
    if (selectedChat && isTyping) {
      setIsTyping(false);
      socketService.send({
        type: "typing_stop",
        room: selectedChat.id,
        user: user.id,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Asegurar que el WebSocket esté conectado al cargar la página de mensajes
    if (user && !socketService.isConnected()) {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.log("Reconectando WebSocket para mensajes...");
        socketService.connect(token);
      }
    }

    socketService.on("reconnecting", (data) => {
      setIsReconnecting(true);
      toast.loading(`Reconectando... (${data.attempt}/${data.maxAttempts})`, {
        id: "reconnecting",
      });
    });

    socketService.on("connect", () => {
      setIsReconnecting(false);
      toast.dismiss("reconnecting");
      toast.success("Conectado al chat", { duration: 2000 });
    });

    socketService.on("disconnect", () => {
      toast.error("Desconectado del chat", { duration: 3000 });
    });

    // NO usar listener global aquí - ya se maneja en el useEffect del chat específico
    // Solo manejar eventos de conexión/desconexión

    return () => {
      socketService.listeners.delete("reconnecting");
      socketService.listeners.delete("connect");
      socketService.listeners.delete("disconnect");
    };
  }, [user, selectedChat, queryClient]);

  useEffect(() => {
    if (selectedChat) {
      // Cargar mensajes del chat seleccionado
      loadMessages(selectedChat.id);

      // Unirse a la sala del chat
      socketService.joinRoom(selectedChat.id);

      // Limpiar listeners previos para evitar duplicación
      socketService.offMessage();

      // Escuchar nuevos mensajes
      socketService.onMessage((data) => {
        console.log("Mensaje recibido por WebSocket:", data);
        // Asegurar que el mensaje tenga la estructura correcta
        const newMessage = data.message || data;
        console.log("Mensaje procesado:", newMessage);
        
        // Si el mensaje es para el chat activo, agregarlo a la lista
        if (data.room === selectedChat.id) {
          console.log("Mensaje para chat activo - agregando a la lista");
          
          // Evitar duplicados comprobando si el mensaje ya existe
          setMessages((prev) => {
            const messageExists = prev.some(msg => {
              const existingMsg = msg.message || msg;
              return existingMsg.id === newMessage.id || 
                     (existingMsg.content === newMessage.content && 
                      existingMsg.sender_id === newMessage.sender_id &&
                      Math.abs(new Date(existingMsg.timestamp) - new Date(newMessage.timestamp)) < 1000);
            });
            
            if (messageExists) {
              console.log("Mensaje duplicado detectado, no agregando");
              return prev; // No agregar si ya existe
            }
            
            console.log("Agregando nuevo mensaje al chat activo");
            return [...prev, newMessage];
          });
          
          // Marcar mensajes como leídos inmediatamente cuando se reciben en chat activo
          if (newMessage.sender_id !== user.id && newMessage.sender !== user.id) {
            // Marcado inmediato sin delay
            markAsRead(selectedChat.id);
          }
        }
        
        // Siempre actualizar la lista de conversaciones con el último mensaje
        // (tanto para chat activo como inactivo)
        queryClient.setQueryData("conversations", (oldConversations) => {
          if (!oldConversations) return oldConversations;
          
          return oldConversations.map(conversation => {
            if (conversation.id === data.room) {
              // Si es el chat activo y el mensaje no es del usuario actual, mantener unread_count en 0
              // Si es un chat inactivo y el mensaje no es del usuario actual, incrementar unread_count
              const isActiveChat = selectedChat.id === data.room;
              const isMyMessage = newMessage.sender_id === user.id || newMessage.sender === user.id;
              
              let newUnreadCount = conversation.unread_count || 0;
              if (!isMyMessage) {
                if (isActiveChat) {
                  // Chat activo: marcar como leído automáticamente
                  newUnreadCount = 0;
                } else {
                  // Chat inactivo: incrementar contador
                  newUnreadCount = newUnreadCount + 1;
                }
              }
              
              console.log(`📊 Actualizando unread_count para chat ${data.room}: ${conversation.unread_count} -> ${newUnreadCount} (activo: ${isActiveChat}, mi mensaje: ${isMyMessage})`);
              
              return {
                ...conversation,
                last_message: {
                  content: newMessage.content,
                  created_at: newMessage.timestamp || newMessage.created_at,
                  sender_id: newMessage.sender_id || newMessage.sender
                },
                updated_at: newMessage.timestamp || newMessage.created_at || new Date().toISOString(),
                unread_count: newUnreadCount
              };
            }
            return conversation;
          }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Ordenar por más reciente
        });
      });

      // Escuchar typing indicators
      socketService.on("typing_start", (data) => {
        if (data.room === selectedChat.id && data.user !== user.id) {
          setTypingUsers((prev) => [
            ...prev.filter((u) => u !== data.user),
            data.user,
          ]);
        }
      });

      socketService.on("typing_stop", (data) => {
        if (data.room === selectedChat.id) {
          setTypingUsers((prev) => prev.filter((u) => u !== data.user));
        }
      });

      // Marcar mensajes como leídos al abrir el chat (delay mínimo para evitar bucles)
      const markReadTimer = setTimeout(() => {
        markAsRead(selectedChat.id);
      }, 50); // Reducido de 100ms a 50ms

      return () => {
        clearTimeout(markReadTimer);
      };
    }

    return () => {
      socketService.offMessage();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedChat, user.id, markAsRead]);

  const loadMessages = async (chatId, page = 1) => {
    try {
      if (page === 1) {
        setMessages([]);
        setCurrentPage(1);
        setHasMoreMessages(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await api.get(
        `/chat/chats/${chatId}/messages/?page=${page}`
      );
      const messagesList = response.data.results || response.data || [];

      // Si es la primera página, reemplazar. Si no, agregar al principio
      if (page === 1) {
        setMessages(messagesList.reverse());
      } else {
        setMessages((prev) => [...messagesList.reverse(), ...prev]);
      }

      // Verificar si hay más mensajes
      setHasMoreMessages(!!response.data.next);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Error al cargar mensajes");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Manejar scroll para cargar mensajes antiguos
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMoreMessages) return;

    // Si el usuario scrollea hasta arriba (con un margen de 50px)
    if (container.scrollTop < 50) {
      const prevScrollHeight = container.scrollHeight;
      loadMessages(selectedChat.id, currentPage + 1).then(() => {
        // Mantener la posición del scroll después de cargar mensajes antiguos
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        });
      });
    }
  }, [selectedChat, currentPage, isLoadingMore, hasMoreMessages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      const messageText = message.trim();
      const timestamp = new Date().toISOString();
      
      // Actualizar inmediatamente la lista de conversaciones
      queryClient.setQueryData("conversations", (oldConversations) => {
        if (!oldConversations) return oldConversations;
        
        return oldConversations.map(conversation => {
          if (conversation.id === selectedChat.id) {
            return {
              ...conversation,
              last_message: {
                content: messageText,
                created_at: timestamp,
                sender_id: user.id
              },
              updated_at: timestamp
            };
          }
          return conversation;
        }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Ordenar por más reciente
      });
      
      // Enviar solo el texto del mensaje, no un objeto
      socketService.sendMessage(selectedChat.id, messageText);
      setMessage("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
            <button
              onClick={() => setShowCreateChat(!showCreateChat)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              {showCreateChat ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>

          {showCreateChat ? (
            <form onSubmit={handleCreateChat} className="mt-3">
              <input
                type="text"
                placeholder="Nombre de usuario..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={
                  !searchUsername.trim() || createChatMutation.isLoading
                }
                className="mt-2 w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {createChatMutation.isLoading ? "Creando..." : "Crear Chat"}
              </button>
            </form>
          ) : (
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchConversation}
                onChange={(e) => setSearchConversation(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-full">
          {(() => {
            // Mostrar estado de carga
            if (isLoadingConversations) {
              return (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-gray-600">Cargando conversaciones...</p>
                  </div>
                </div>
              );
            }

            // Mostrar error si ocurre
            if (conversationsError) {
              return (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <p className="text-red-600">Error al cargar conversaciones</p>
                    <button 
                      onClick={() => queryClient.invalidateQueries("conversations")}
                      className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              );
            }

            // Asegurar que conversations es un array válido
            const convList = Array.isArray(conversations) ? conversations : [];
            console.log("🗂️ Lista de conversaciones para renderizar:", convList);
            console.log("🗂️ Cantidad de conversaciones:", convList.length);
            console.log("🗂️ Tipo de conversations:", typeof conversations);
            console.log("🗂️ Es array conversations:", Array.isArray(conversations));

            // Filtrar conversaciones por búsqueda
            const filteredConvs = searchConversation.trim()
              ? convList.filter((conv) => {
                  const searchLower = searchConversation.toLowerCase();
                  const fullName =
                    conv.other_user?.full_name?.toLowerCase() || "";
                  const username =
                    conv.other_user?.username?.toLowerCase() || "";
                  const lastMessage =
                    conv.last_message?.content?.toLowerCase() || "";
                  return (
                    fullName.includes(searchLower) ||
                    username.includes(searchLower) ||
                    lastMessage.includes(searchLower)
                  );
                })
              : convList;

            console.log("🔍 Conversaciones filtradas:", filteredConvs);
            console.log("🔍 Cantidad de conversaciones filtradas:", filteredConvs.length);
            console.log("🔍 Término de búsqueda:", searchConversation);
            console.log("🔍 Mostrar crear chat:", showCreateChat);

            if (filteredConvs.length === 0 && !showCreateChat) {
              console.log("⚠️ Mostrando mensaje de 'No tienes conversaciones'");
              return (
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchConversation
                        ? "No se encontraron conversaciones"
                        : "No tienes conversaciones"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchConversation
                        ? "Intenta con otro término de búsqueda"
                        : "Inicia una nueva conversación haciendo clic en el botón +"}
                    </p>
                    {!searchConversation && (
                      <button
                        onClick={() => setShowCreateChat(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                      >
                        Nueva conversación
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            console.log("✅ Renderizando conversaciones:", filteredConvs.length);
            return filteredConvs.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedChat(conversation);
                  // Marcar mensajes como leídos inmediatamente al seleccionar el chat
                  if (conversation.unread_count > 0) {
                    markAsRead(conversation.id);
                  }
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedChat?.id === conversation.id ? "bg-primary-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={
                        conversation.other_user?.profile_picture ||
                        "/default-avatar.png"
                      }
                      alt={conversation.other_user?.full_name || "Usuario"}
                    />
                    {conversation.unread_count > 0 && selectedChat?.id !== conversation.id && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conversation.other_user?.full_name ||
                        "Usuario desconocido"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message?.content || "Sin mensajes"}
                    </p>
                  </div>
                </div>
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full"
                  src={
                    selectedChat.other_user?.profile_picture ||
                    "/default-avatar.png"
                  }
                  alt={selectedChat.other_user?.full_name || "Usuario"}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedChat.other_user?.full_name ||
                      "Usuario desconocido"}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{selectedChat.other_user?.username || "usuario"}
                    {isReconnecting && (
                      <span className="ml-2 text-xs text-amber-600">
                        • Reconectando...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {isLoadingMore && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              )}
              {messages.map((msg, index) => {
                // Asegurar que msg tenga la estructura correcta
                const messageObj = msg.message || msg;

                // Extraer el contenido del mensaje de forma segura
                let messageContent;
                
                // Si el contenido es un string que parece JSON, parsearlo
                if (typeof messageObj.content === "string") {
                  try {
                    // Intentar parsear si parece ser JSON
                    if (messageObj.content.startsWith('{') || messageObj.content.startsWith('[')) {
                      const parsed = JSON.parse(messageObj.content);
                      messageContent = parsed.content || parsed.message || parsed.text || messageObj.content;
                    } else {
                      messageContent = messageObj.content;
                    }
                  } catch (e) {
                    // Si no es JSON válido, usar como string
                    messageContent = messageObj.content;
                  }
                } else if (typeof messageObj.content === "object" && messageObj.content?.content) {
                  messageContent = messageObj.content.content;
                } else if (messageObj.text) {
                  messageContent = messageObj.text;
                } else {
                  // Último recurso: buscar cualquier campo que parezca contenido
                  messageContent = messageObj.body || messageObj.message || "Sin contenido";
                }

                const isOwnMessage =
                  messageObj.sender_id === user.id ||
                  messageObj.sender === user.id;
                return (
                  <div
                    key={messageObj.id || index}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        isOwnMessage ? "text-right" : "text-left"
                      }`}
                    >
                      {/* Nombre del usuario (solo para mensajes de otros) */}
                      {!isOwnMessage && (
                        <p className="text-xs text-gray-600 mb-1 px-2">
                          {messageObj.sender_username || selectedChat.other_user?.username || "Usuario"}
                        </p>
                      )}
                      
                      {/* Burbuja del mensaje */}
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{messageContent}</p>
                        
                        {/* Timestamp */}
                        <div className={`flex items-center justify-end mt-1 ${
                          isOwnMessage ? "text-primary-100" : "text-gray-500"
                        }`}>
                          <p className="text-xs">
                            {new Date(
                              messageObj.timestamp || messageObj.created_at
                            ).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          
                          {/* Indicador de leído para mensajes propios */}
                          {isOwnMessage && (
                            <div className="ml-2 flex items-center">
                              {messageObj.is_read ? (
                                <div className="flex">
                                  <div className="w-3 h-3 rounded-full bg-white opacity-70"></div>
                                  <div className="w-3 h-3 rounded-full bg-white opacity-90 -ml-1"></div>
                                </div>
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">
                        {typingUsers.length === 1
                          ? "Escribiendo"
                          : "Varios usuarios escribiendo"}
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTypingStart();
                  }}
                  onBlur={handleTypingStop}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                Selecciona una conversación
              </p>
              <p className="text-gray-400">para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
