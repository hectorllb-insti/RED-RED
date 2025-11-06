import {
  Ban,
  Check,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [newRole, setNewRole] = useState("");

  // Verificar permisos
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      toast.error("No tienes permisos para acceder a esta página");
      navigate("/");
    }
  }, [user, navigate]);

  // Obtener usuarios
  const { data: usersData, isLoading } = useQuery(
    ["admin-users", searchTerm, roleFilter, statusFilter],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("is_banned", statusFilter);

      const response = await api.get(`/administration/users/?${params}`);
      return response.data;
    },
    {
      enabled: user && (user.role === "admin" || user.role === "moderator"),
      keepPreviousData: true,
    }
  );

  // Extraer el array de usuarios de la respuesta paginada
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];

  // Mutación para banear usuario
  const banUserMutation = useMutation(
    async ({ userId, reason }) => {
      await api.post(`/administration/users/${userId}/ban/`, {
        reason: reason,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-users");
        toast.success("Usuario baneado exitosamente");
        setShowBanModal(false);
        setBanReason("");
        setSelectedUser(null);
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al banear usuario";
        toast.error(errorMessage);
      },
    }
  );

  // Mutación para desbanear usuario
  const unbanUserMutation = useMutation(
    async (userId) => {
      await api.post(`/administration/users/${userId}/unban/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-users");
        toast.success("Usuario desbaneado exitosamente");
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al desbanear usuario";
        toast.error(errorMessage);
      },
    }
  );

  // Mutación para cambiar rol
  const changeRoleMutation = useMutation(
    async ({ userId, role }) => {
      await api.post(`/administration/users/${userId}/change_role/`, {
        role: role,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-users");
        toast.success("Rol actualizado exitosamente");
        setShowRoleModal(false);
        setNewRole("");
        setSelectedUser(null);
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al cambiar rol";
        toast.error(errorMessage);
      },
    }
  );

  const handleBanUser = () => {
    if (!banReason.trim()) {
      toast.error("Debes proporcionar una razón para el baneo");
      return;
    }
    banUserMutation.mutate({ userId: selectedUser.id, reason: banReason });
  };

  const handleUnbanUser = (userId) => {
    if (
      window.confirm("¿Estás seguro de que quieres desbanear a este usuario?")
    ) {
      unbanUserMutation.mutate(userId);
    }
  };

  const handleChangeRole = () => {
    if (!newRole) {
      toast.error("Debes seleccionar un rol");
      return;
    }
    changeRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: (
        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <ShieldAlert className="h-3 w-3" />
          Admin
        </span>
      ),
      moderator: (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          <ShieldCheck className="h-3 w-3" />
          Moderador
        </span>
      ),
      user: (
        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          <Shield className="h-3 w-3" />
          Usuario
        </span>
      ),
    };
    return badges[role] || badges.user;
  };

  if (isLoading) {
    return <LoadingSpinner text="Cargando usuarios..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra usuarios, roles y permisos
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="moderator">Moderadores</option>
              <option value="user">Usuarios</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="false">Activos</option>
              <option value="true">Baneados</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              userData.profile_picture ||
                              `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}`
                            }
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.first_name} {userData.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{userData.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userData.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(userData.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.is_banned ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium w-fit">
                          <UserX className="h-3 w-3" />
                          Baneado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium w-fit">
                          <UserCheck className="h-3 w-3" />
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        <div>Posts: {userData.posts_count}</div>
                        <div>Seguidores: {userData.followers_count}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Cambiar Rol (solo admin) */}
                        {user?.role === "admin" && (
                          <button
                            onClick={() => {
                              setSelectedUser(userData);
                              setNewRole(userData.role);
                              setShowRoleModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Cambiar rol"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}

                        {/* Banear/Desbanear */}
                        {userData.is_banned ? (
                          <button
                            onClick={() => handleUnbanUser(userData.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Desbanear usuario"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(userData);
                              setShowBanModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Banear usuario"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Cambiar Rol */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cambiar Rol
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Usuario:{" "}
                  <span className="font-medium">{selectedUser?.username}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Rol actual:{" "}
                  <span className="font-medium">{selectedUser?.role}</span>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo rol
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="user">Usuario</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeRole}
                  disabled={changeRoleMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {changeRoleMutation.isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Banear Usuario */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Banear Usuario
              </h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                  setBanReason("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Estás seguro de que quieres banear a{" "}
                  <span className="font-medium">{selectedUser?.username}</span>?
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del baneo *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Describe la razón del baneo..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                    setBanReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={banUserMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {banUserMutation.isLoading ? "Baneando..." : "Banear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
