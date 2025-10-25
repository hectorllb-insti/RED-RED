import { Plus, Search, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
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
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Obtener lista de conversaciones
  const { data: conversations = [] } = useQuery("conversations", async () => {
    const response = await api.get("/chat/chats/");
    return response.data;
  });

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
    if (selectedChat) {
      // Cargar mensajes del chat seleccionado
      loadMessages(selectedChat.id);

      // Unirse a la sala del chat
      socketService.joinRoom(selectedChat.id);

      // Escuchar nuevos mensajes
      socketService.onMessage((data) => {
        setMessages((prev) => [...prev, data.message]);
        // Marcar mensajes como leídos cuando se reciben
        if (data.message.sender !== user.id) {
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

  const loadMessages = async (chatId) => {
    try {
      const response = await api.get(`/chat/chats/${chatId}/messages/`);
      setMessages(response.data.results || []);
    } catch (error) {
      // Error loading messages handled
    }
  };

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
            return convList.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedChat?.id === conversation.id ? "bg-primary-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={
                      conversation.other_user?.profile_picture ||
                      "/default-avatar.png"
                    }
                    alt={conversation.other_user?.full_name || "Usuario"}
                  />
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
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.sender === user.id;
                return (
                  <div
                    key={index}
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
                      <p className="text-sm">{msg.content}</p>
                      <div
                        className={`flex items-center justify-between mt-1 ${
                          isOwnMessage ? "text-primary-100" : "text-gray-500"
                        }`}
                      >
                        <p className="text-xs">
                          {new Date(msg.timestamp).toLocaleTimeString()}
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
