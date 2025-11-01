import { MessageSquare, Plus, Search, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import EmptyState from "../components/EmptyState";
import ChatAvatar from "../components/ui/ChatAvatar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import socketService from "../services/socket";
import { getImageUrl, clearUserImageCache } from "../utils/imageUtils";

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
        const response = await api.get("/chat/chats/");
        
        if (!response.data) return [];
        
        // Extraer las conversaciones del objeto paginado
        let conversationsArray;
        if (Array.isArray(response.data)) {
          conversationsArray = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          conversationsArray = response.data.results;
        } else {
          return [];
        }
        
        // Eliminar duplicados
        const uniqueConversations = conversationsArray.filter((conv, index, self) => 
          index === self.findIndex(c => c.id === conv.id)
        );
        
        // Ordenar por fecha de actualización (más recientes primero)
        return uniqueConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      } catch (error) {
        throw error;
      }
    },
    {
      enabled: !!user,
      staleTime: 15 * 1000,
      refetchInterval: 5000,
      retry: 3,
      onError: (error) => {
        if (error.response?.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          toast.error("Error al cargar conversaciones");
        }
      },
      onSuccess: (data) => {
        // Sincronizar el selectedChat cuando se actualicen las conversaciones
        setSelectedChat(prevChat => {
          if (prevChat && data) {
            const updatedConversation = data.find(conv => conv.id === prevChat.id);
            if (updatedConversation && updatedConversation.other_user) {
              if (prevChat.other_user?.profile_picture !== updatedConversation.other_user?.profile_picture) {
                return {
                  ...prevChat,
                  other_user: {
                    ...updatedConversation.other_user,
                    _profileUpdated: Date.now()
                  }
                };
              }
            }
          }
          return prevChat;
        });
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

  // Marcar mensajes como leídos
  const markAsRead = useCallback(
    async (chatId) => {
      try {
        // Actualización optimista
        queryClient.setQueryData("conversations", (oldConversations) => {
          if (!oldConversations) return oldConversations;
          
          return oldConversations.map(conversation => {
            if (conversation.id === chatId) {
              return { ...conversation, unread_count: 0 };
            }
            return conversation;
          });
        });
        
        // Llamada al servidor
        await api.post(`/chat/chats/${chatId}/read/`);
      } catch (error) {
        // Error silencioso, no afecta la UX
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

  // Manejar indicadores de escritura
  const handleTypingStart = () => {
    if (selectedChat && !isTyping) {
      setIsTyping(true);
      socketService.send({
        type: "typing_start",
        room: selectedChat.id,
        user: user.id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
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
    if (user && !socketService.isConnected()) {
      const token = localStorage.getItem("access_token");
      if (token) {
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

    // Escuchar actualizaciones de conversaciones (nuevos mensajes)
    socketService.on("conversation_update", (data) => {
      if (data.action === "new_message") {
        // Actualizar contador de mensajes no leídos
        queryClient.setQueryData("conversations", (oldConversations) => {
          if (!oldConversations) return oldConversations;
          
          return oldConversations.map(conversation => {
            if (conversation.id === data.chat_room_id) {
              const isMyMessage = data.sender_id === user?.id;
              
              // Si no es mi mensaje, incrementar el contador
              // Solo NO incrementar si es mi mensaje o si estoy activamente en ese chat
              let newUnreadCount = conversation.unread_count || 0;
              if (!isMyMessage) {
                // Si selectedChat es null (fuera de la página o sin chat abierto) 
                // o si no es el chat activo, incrementar
                const isCurrentlyInThisChat = selectedChat && selectedChat.id === data.chat_room_id;
                if (!isCurrentlyInThisChat) {
                  newUnreadCount = newUnreadCount + 1;
                }
              }
              
              return {
                ...conversation,
                unread_count: newUnreadCount,
                updated_at: new Date().toISOString()
              };
            }
            return conversation;
          }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
        
        // Luego invalidar para obtener datos frescos del servidor
        queryClient.invalidateQueries("conversations");
      }
    });

    // Escuchar actualizaciones de perfil de usuarios
    socketService.onProfileUpdate((data) => {
      const { user_id, user_data } = data;
      const updateTimestamp = Date.now();
      
      clearUserImageCache(user_id);
      queryClient.invalidateQueries("conversations");
      
      queryClient.setQueryData("conversations", (oldConversations) => {
        if (!oldConversations) return oldConversations;
        
        return oldConversations.map(conversation => {
          if (conversation.other_user?.id === user_id) {
            return {
              ...conversation,
              other_user: {
                ...conversation.other_user,
                ...user_data,
                _profileUpdated: updateTimestamp
              }
            };
          }
          return conversation;
        });
      });

      setSelectedChat(prevChat => {
        if (prevChat && prevChat.other_user?.id === user_id) {
          return {
            ...prevChat,
            other_user: {
              ...prevChat.other_user,
              ...user_data,
              _profileUpdated: updateTimestamp
            }
          };
        }
        return prevChat;
      });
    });

    return () => {
      socketService.listeners.delete("reconnecting");
      socketService.listeners.delete("connect");
      socketService.listeners.delete("disconnect");
      socketService.offProfileUpdate();
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
        const newMessage = data.message || data;
        
        if (data.room === selectedChat.id) {
          setMessages((prev) => {
            const messageExists = prev.some(msg => {
              const existingMsg = msg.message || msg;
              return existingMsg.id === newMessage.id || 
                     (existingMsg.content === newMessage.content && 
                      existingMsg.sender_id === newMessage.sender_id &&
                      Math.abs(new Date(existingMsg.timestamp) - new Date(newMessage.timestamp)) < 1000);
            });
            
            if (messageExists) return prev;
            
            return [...prev, newMessage];
          });
          
          if (newMessage.sender_id !== user.id && newMessage.sender !== user.id) {
            markAsRead(selectedChat.id);
          }
        }
        
        // Actualizar lista de conversaciones
        queryClient.setQueryData("conversations", (oldConversations) => {
          if (!oldConversations) return oldConversations;
          
          return oldConversations.map(conversation => {
            if (conversation.id === data.room) {
              const isActiveChat = selectedChat.id === data.room;
              const isMyMessage = newMessage.sender_id === user.id || newMessage.sender === user.id;
              
              let newUnreadCount = conversation.unread_count || 0;
              if (!isMyMessage) {
                newUnreadCount = isActiveChat ? 0 : newUnreadCount + 1;
              }
              
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
          }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        });
      });

      // Escuchar indicadores de escritura
      socketService.on("typing_start", (data) => {
        if (data.room === selectedChat.id && data.user !== user.id) {
          setTypingUsers((prev) => {
            if (prev.includes(data.user)) return prev;
            return [...prev, data.user];
          });
        }
      });

      socketService.on("typing_stop", (data) => {
        if (data.room === selectedChat.id) {
          setTypingUsers((prev) => prev.filter((u) => u !== data.user));
        }
      });

      const markReadTimer = setTimeout(() => markAsRead(selectedChat.id), 50);

      return () => clearTimeout(markReadTimer);
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
      
      // Detener el indicador de typing inmediatamente al enviar
      handleTypingStop();
      
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex mt-10">
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

            const convList = Array.isArray(conversations) ? conversations : [];

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

            if (filteredConvs.length === 0 && !showCreateChat) {
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

            return filteredConvs.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedChat(conversation);
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
                    <ChatAvatar
                      src={conversation.other_user?.profile_picture}
                      alt={conversation.other_user?.full_name || "Usuario"}
                      size="sm"
                      updateKey={conversation.other_user?._profileUpdated}
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
            <div className="p-4 border-b border-gray-200 bg-white z-10 shadow-sm">
              <div className="flex items-center space-x-3">
                <ChatAvatar
                  src={selectedChat.other_user?.profile_picture}
                  alt={selectedChat.other_user?.full_name || "Usuario"}
                  size="sm"
                  updateKey={selectedChat.other_user?._profileUpdated}
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
              className="flex-1 overflow-y-auto px-4 pt-8 pb-16 space-y-4"
            >
              {isLoadingMore && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              )}
              {messages.map((msg, index) => {
                const messageObj = msg.message || msg;

                // Extraer contenido del mensaje
                let messageContent;
                if (typeof messageObj.content === "string") {
                  try {
                    if (messageObj.content.startsWith('{') || messageObj.content.startsWith('[')) {
                      const parsed = JSON.parse(messageObj.content);
                      messageContent = parsed.content || parsed.message || parsed.text || messageObj.content;
                    } else {
                      messageContent = messageObj.content;
                    }
                  } catch (e) {
                    messageContent = messageObj.content;
                  }
                } else if (typeof messageObj.content === "object" && messageObj.content?.content) {
                  messageContent = messageObj.content.content;
                } else {
                  messageContent = messageObj.text || messageObj.body || messageObj.message || "Sin contenido";
                }

                const isOwnMessage = messageObj.sender_id === user.id || messageObj.sender === user.id;
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

              {/* Typing indicator - Indicador de escritura en tiempo real */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start mb-4 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    {/* Avatar del usuario que está escribiendo */}
                    <ChatAvatar
                      src={selectedChat.other_user?.profile_picture}
                      alt={selectedChat.other_user?.full_name || "Usuario"}
                      size="xs"
                      updateKey={selectedChat.other_user?._profileUpdated}
                    />
                    
                    {/* Burbuja del indicador */}
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-5 py-3 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">
                          {typingUsers.length === 1
                            ? `${selectedChat.other_user?.full_name || "Usuario"} está escribiendo`
                            : "Varios usuarios están escribiendo"}
                        </span>
                        
                        {/* Animación de puntos */}
                        <div className="flex space-x-1.5">
                          <div 
                            className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"
                            style={{ animationDuration: "1s" }}
                          ></div>
                          <div 
                            className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"
                            style={{ animationDuration: "1s", animationDelay: "0.15s" }}
                          ></div>
                          <div 
                            className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"
                            style={{ animationDuration: "1s", animationDelay: "0.3s" }}
                          ></div>
                        </div>
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
