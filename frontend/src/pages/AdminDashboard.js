import {
  FileText,
  MessageSquare,
  Shield,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const navigate = useNavigate();

  // Verificar si el usuario es admin o moderador
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      toast.error("No tienes permisos para acceder a esta página");
      navigate("/");
    }
  }, [user, navigate]);

  // Obtener estadísticas
  const { data: stats, isLoading } = useQuery(
    "admin-stats",
    async () => {
      const response = await api.get("/administration/dashboard/stats/");
      return response.data;
    },
    {
      enabled: user && (user.role === "admin" || user.role === "moderator"),
    }
  );

  if (isLoading) {
    return <LoadingSpinner text="Cargando estadísticas..." />;
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.total_users,
      icon: Users,
      color: "bg-blue-500",
      change: `+${stats.new_users_today} hoy`,
    },
    {
      title: "Total Posts",
      value: stats.total_posts,
      icon: FileText,
      color: "bg-green-500",
      change: `+${stats.new_posts_today} hoy`,
    },
    {
      title: "Total Comentarios",
      value: stats.total_comments,
      icon: MessageSquare,
      color: "bg-purple-500",
      change: `+${stats.new_comments_today} hoy`,
    },
    {
      title: "Total Likes",
      value: stats.total_likes,
      icon: ThumbsUp,
      color: "bg-pink-500",
      change: `+${stats.new_likes_today} hoy`,
    },
    {
      title: "Usuarios Activos",
      value: stats.active_users,
      icon: TrendingUp,
      color: "bg-indigo-500",
      change: "Últimos 30 días",
    },
    {
      title: "Usuarios Baneados",
      value: stats.banned_users,
      icon: Shield,
      color: "bg-red-500",
      change: "Total baneados",
    },
  ];

  return (
    <div
      className={`min-h-screen py-8  rounded-2xl px-4 sm:px-6 lg:px-8 ${isDark ? "bg-slate-900" : "bg-gray-50"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
              }`}
          >
            Panel de Administración
          </h1>
          <p
            className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-gray-600"
              }`}
          >
            Bienvenido, {user?.first_name}. Aquí puedes gestionar la plataforma.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-gray-600"
                      }`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
                      }`}
                  >
                    {stat.value.toLocaleString()}
                  </p>
                  <p
                    className={`mt-2 text-xs ${isDark ? "text-slate-500" : "text-gray-500"
                      }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nuevos Usuarios */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                }`}
            >
              Nuevos Usuarios
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Hoy
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_users_today}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Esta semana
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_users_week}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Este mes
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_users_month}
                </span>
              </div>
            </div>
          </div>

          {/* Nuevos Posts */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                }`}
            >
              Nuevos Posts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Hoy
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_posts_today}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Esta semana
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_posts_week}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Este mes
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.new_posts_month}
                </span>
              </div>
            </div>
          </div>

          {/* Roles */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                }`}
            >
              Distribución de Roles
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Administradores
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.admin_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Moderadores
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.moderator_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"
                    }`}
                >
                  Usuarios
                </span>
                <span
                  className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-gray-900"
                    }`}
                >
                  {stats.user_count}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
              }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                }`}
            >
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Gestionar Usuarios
              </button>
              <button
                onClick={() => navigate("/admin/logs")}
                className={`w-full px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${isDark
                    ? "bg-slate-600 hover:bg-slate-500"
                    : "bg-gray-600 hover:bg-gray-700"
                  }`}
              >
                Ver Logs de Actividad
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => navigate("/admin/config")}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Configuración del Sitio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
