import { Clock, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminLogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Verificar permisos
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      toast.error("No tienes permisos para acceder a esta página");
      navigate("/");
    }
  }, [user, navigate]);

  // Obtener logs
  const { data: logsData, isLoading } = useQuery(
    ["admin-logs", searchTerm, actionFilter],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (actionFilter) params.append("action", actionFilter);

      const response = await api.get(`/administration/logs/?${params}`);
      return response.data;
    },
    {
      enabled: user && (user.role === "admin" || user.role === "moderator"),
      keepPreviousData: true,
    }
  );

  // Extraer el array de logs de la respuesta paginada
  const logs = Array.isArray(logsData) ? logsData : logsData?.results || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action) => {
    const badges = {
      user_ban: { color: "bg-red-100 text-red-800", label: "Ban de Usuario" },
      user_unban: {
        color: "bg-green-100 text-green-800",
        label: "Unban de Usuario",
      },
      user_role_change: {
        color: "bg-blue-100 text-blue-800",
        label: "Cambio de Rol",
      },
      post_delete: {
        color: "bg-orange-100 text-orange-800",
        label: "Eliminar Post",
      },
      comment_delete: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Eliminar Comentario",
      },
      user_delete: {
        color: "bg-red-100 text-red-800",
        label: "Eliminar Usuario",
      },
      config_change: {
        color: "bg-purple-100 text-purple-800",
        label: "Cambio de Configuración",
      },
    };

    const badge = badges[action] || {
      color: "bg-gray-100 text-gray-800",
      label: action,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Cargando logs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Logs de Actividad
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registro de todas las acciones administrativas realizadas
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por admin o usuario objetivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Todas las acciones</option>
                <option value="user_ban">Ban de Usuario</option>
                <option value="user_unban">Unban de Usuario</option>
                <option value="user_role_change">Cambio de Rol</option>
                <option value="post_delete">Eliminar Post</option>
                <option value="comment_delete">Eliminar Comentario</option>
                <option value="user_delete">Eliminar Usuario</option>
                <option value="config_change">Cambio de Configuración</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionBadge(log.action)}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Admin:
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            log.admin_details.profile_picture ||
                            `https://ui-avatars.com/api/?name=${log.admin_details.username}`
                          }
                          alt=""
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-gray-900">
                          {log.admin_details.username}
                        </span>
                      </div>
                    </div>

                    {log.target_user_details && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Usuario:
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              log.target_user_details.profile_picture ||
                              `https://ui-avatars.com/api/?name=${log.target_user_details.username}`
                            }
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-sm text-gray-900">
                            {log.target_user_details.username}
                          </span>
                        </div>
                      </div>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs font-medium text-gray-700 block mb-2">
                          Detalles:
                        </span>
                        <div className="space-y-1">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs text-gray-600">
                              <span className="font-medium">{key}:</span>{" "}
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logs?.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No se encontraron logs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
