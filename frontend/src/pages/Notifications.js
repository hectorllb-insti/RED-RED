import {
  Bell,
  Camera,
  CheckCircle,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const Notifications = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Query para obtener todas las notificaciones
  const { data: notifications = [], isLoading } = useQuery(
    ["notifications", filter],
    async () => {
      const params = filter !== "all" ? `?filter=${filter}` : "";
      const response = await api.get(`/notifications/${params}`);
      // Asegurar que devolvemos un array
      return Array.isArray(response.data) ? response.data : [];
    }
  );

  // Mutation para marcar como leída/no leída
  const toggleReadMutation = useMutation(
    async ({ notificationId, isRead }) => {
      const endpoint = isRead ? "unread" : "read";
      await api.post(`/notifications/${notificationId}/${endpoint}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        toast.success("Estado actualizado");
      },
    }
  );

  // Mutation para marcar múltiples como leídas
  const bulkMarkReadMutation = useMutation(
    async (notificationIds) => {
      await api.post("/notifications/bulk-mark-read/", {
        notification_ids: notificationIds,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        setSelectedNotifications([]);
        toast.success("Notificaciones marcadas como leídas");
      },
    }
  );

  // Mutation para eliminar notificaciones
  const bulkDeleteMutation = useMutation(
    async (notificationIds) => {
      await api.post("/notifications/bulk-delete/", {
        notification_ids: notificationIds,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        setSelectedNotifications([]);
        toast.success("Notificaciones eliminadas");
      },
    }
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "story":
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(notifications.map((n) => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(
        selectedNotifications.filter((id) => id !== notificationId)
      );
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDark ? "border-primary-400" : "border-primary-500"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div
        className={`rounded-xl shadow-md border ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b ${
            isDark
              ? "border-slate-700 bg-gradient-to-r from-primary-900/20 to-purple-900/20"
              : "border-gray-200 bg-gradient-to-r from-primary-50/30 to-purple-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-xl font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-gray-900"
                }`}
              >
                <Bell
                  className={`h-5 w-5 ${
                    isDark ? "text-primary-400" : "text-primary-600"
                  }`}
                />
                Notificaciones
              </h1>
              <p
                className={`text-sm mt-0.5 ${
                  isDark ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Administra todas tus notificaciones
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-primary-600 text-white shadow-md"
                    : isDark
                    ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700 border border-slate-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "unread"
                    ? "bg-primary-600 text-white shadow-md"
                    : isDark
                    ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700 border border-slate-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                No leídas
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "read"
                    ? "bg-primary-600 text-white shadow-md"
                    : isDark
                    ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700 border border-slate-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Leídas
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedNotifications.length > 0 && (
            <div
              className={`mt-3 p-3 border rounded-lg flex items-center justify-between ${
                isDark
                  ? "bg-primary-900/20 border-primary-800"
                  : "bg-primary-50 border-primary-200"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                {selectedNotifications.length} notificación(es) seleccionada(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    bulkMarkReadMutation.mutate(selectedNotifications)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg text-xs font-semibold hover:from-primary-700 hover:to-primary-600 shadow-md transition-all"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Marcar como leídas</span>
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Estás seguro de eliminar estas notificaciones?"
                      )
                    ) {
                      bulkDeleteMutation.mutate(selectedNotifications);
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div>
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell
                className={`h-16 w-16 mx-auto mb-4 ${
                  isDark ? "text-slate-600" : "text-gray-300"
                }`}
              />
              <h3
                className={`text-lg font-medium mb-2 ${
                  isDark ? "text-slate-200" : "text-gray-900"
                }`}
              >
                No hay notificaciones
              </h3>
              <p className={isDark ? "text-slate-400" : "text-gray-500"}>
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : filter === "read"
                  ? "No tienes notificaciones leídas"
                  : "Aún no has recibido ninguna notificación"}
              </p>
            </div>
          ) : (
            <div>
              {/* Select all header */}
              <div
                className={`p-4 border-b flex items-center space-x-3 ${
                  isDark ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                    filteredNotifications.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  className={`text-sm font-medium ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Seleccionar todas
                </label>
              </div>

              {/* Notifications */}
              <div
                className={`divide-y ${
                  isDark ? "divide-slate-700" : "divide-gray-100"
                }`}
              >
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 transition-all ${
                      !notification.is_read
                        ? isDark
                          ? "bg-primary-900/20 border-l-4 border-l-primary-500"
                          : "bg-primary-50/50 border-l-4 border-l-primary-500"
                        : isDark
                        ? "border-l-4 border-l-transparent hover:bg-slate-700/30"
                        : "border-l-4 border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={(e) =>
                          handleSelectNotification(
                            notification.id,
                            e.target.checked
                          )
                        }
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />

                      <div className="flex-shrink-0">
                        {notification.actor?.profile_picture ? (
                          <img
                            className={`h-10 w-10 rounded-full ring-2 ${
                              isDark ? "ring-slate-700" : "ring-gray-100"
                            }`}
                            src={notification.actor.profile_picture}
                            alt={notification.actor.full_name}
                          />
                        ) : (
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isDark ? "bg-slate-700" : "bg-gray-100"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isDark ? "text-slate-100" : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${
                                isDark ? "text-slate-400" : "text-gray-600"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={`text-xs mt-1.5 font-medium ${
                                isDark ? "text-slate-500" : "text-gray-400"
                              }`}
                            >
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.is_read && (
                              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            )}

                            <button
                              onClick={() =>
                                toggleReadMutation.mutate({
                                  notificationId: notification.id,
                                  isRead: notification.is_read,
                                })
                              }
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              {notification.is_read
                                ? "Marcar como no leída"
                                : "Marcar como leída"}
                            </button>
                          </div>
                        </div>

                        {/* Action link */}
                        {notification.action_url && (
                          <div className="mt-3">
                            <Link
                              to={notification.action_url}
                              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              Ver detalles →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
