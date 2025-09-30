import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import api from "../services/api";
import socketService from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { Send, Search } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Obtener lista de conversaciones
  const { data: conversations } = useQuery("conversations", async () => {
    const response = await api.get("/messages/conversations/");
    return response.data;
  });

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
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => {
      socketService.offMessage();
    };
  }, [selectedChat]);

  const loadMessages = async (chatId) => {
    try {
      const response = await api.get(
        `/messages/conversations/${chatId}/messages/`
      );
      setMessages(response.data.results || []);
    } catch (error) {
      console.error("Error loading messages:", error);
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
          <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
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
        </div>

        <div className="overflow-y-auto h-full">
          {conversations?.results?.map((conversation) => (
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
                    conversation.other_user.profile_picture ||
                    "/default-avatar.png"
                  }
                  alt={conversation.other_user.full_name}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {conversation.other_user.full_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message?.content || "Sin mensajes"}
                  </p>
                </div>
              </div>
            </button>
          ))}
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
                    selectedChat.other_user.profile_picture ||
                    "/default-avatar.png"
                  }
                  alt={selectedChat.other_user.full_name}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedChat.other_user.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{selectedChat.other_user.username}
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
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-primary-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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
                  onChange={(e) => setMessage(e.target.value)}
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
