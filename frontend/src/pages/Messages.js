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
  const { data: conversations = [] } = useQuery(
    ["conversations"],
    async () => {
      const response = await api.get("/chat/chats/");
      return response.data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutos para conversaciones
      refetchInterval: 30000, // Refetch cada 30 segundos
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

  // Función estable para marcar mensajes como leídos
  const markAsRead = useCallback(
    async (chatId) => {
      try {
        await api.post(`/chat/chats/${chatId}/read/`);
        // Invalidar solo las conversaciones sin refetch automático
        queryClient.setQueryData("conversations", (oldData) => oldData);
      } catch (error) {
        console.error("Error marking messages as read:", error);
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

    return () => {
      socketService.listeners.delete("reconnecting");
      socketService.listeners.delete("connect");
      socketService.listeners.delete("disconnect");
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Cargar mensajes del chat seleccionado
      loadMessages(selectedChat.id);

      // Unirse a la sala del chat
      socketService.joinRoom(selectedChat.id);

      // Escuchar nuevos mensajes
      socketService.onMessage((data) => {
        console.log("Mensaje recibido por WebSocket:", data);
        // Asegurar que el mensaje tenga la estructura correcta
        const newMessage = data.message || data;
        console.log("Mensaje procesado:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        // Marcar mensajes como leídos cuando se reciben
        if (newMessage.sender_id !== user.id && newMessage.sender !== user.id) {
          markAsRead(selectedChat.id);
        }
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

      // Marcar mensajes como leídos al abrir el chat (con delay para evitar bucles)
      const markReadTimer = setTimeout(() => {
        markAsRead(selectedChat.id);
      }, 100);

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
      const messageData = {
        content: message,
        sender: user.id,
        timestamp: new Date().toISOString(),
      };

      socketService.sendMessage(selectedChat.id, messageData);
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
            const convList = Array.isArray(conversations?.results)
              ? conversations.results
              : Array.isArray(conversations)
              ? conversations
              : [];

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
                  <EmptyState
                    Icon={MessageSquare}
                    title={
                      searchConversation
                        ? "No se encontraron conversaciones"
                        : "No tienes conversaciones"
                    }
                    description={
                      searchConversation
                        ? "Intenta con otro término de búsqueda"
                        : "Inicia una nueva conversación haciendo clic en el botón +"
                    }
                    actionLabel={
                      !searchConversation ? "Nueva conversación" : undefined
                    }
                    onAction={
                      !searchConversation
                        ? () => setShowCreateChat(true)
                        : undefined
                    }
                  />
                </div>
              );
            }

            return filteredConvs.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation)}
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
                    {conversation.unread_count > 0 && (
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
                // Si content es string, usarlo directamente
                // Si content es objeto con propiedad content, usar esa
                // Si no, intentar buscar en el mensaje completo
                let messageContent;
                if (typeof messageObj.content === "string") {
                  messageContent = messageObj.content;
                } else if (
                  typeof messageObj.content === "object" &&
                  messageObj.content?.content
                ) {
                  messageContent = messageObj.content.content;
                } else if (messageObj.text) {
                  messageContent = messageObj.text;
                } else {
                  // Último recurso: buscar cualquier campo que parezca contenido
                  messageContent =
                    messageObj.body || messageObj.message || "Sin contenido";
                }

                const isOwnMessage =
                  messageObj.sender_id === user.id ||
                  messageObj.sender === user.id;
                return (
                  <div
                    key={messageObj.id || index}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? "bg-primary-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{messageContent}</p>
                      <div
                        className={`flex items-center justify-between mt-1 ${
                          isOwnMessage ? "text-primary-100" : "text-gray-500"
                        }`}
                      >
                        <p className="text-xs">
                          {new Date(
                            messageObj.timestamp || messageObj.created_at
                          ).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {msg.is_read ? (
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
