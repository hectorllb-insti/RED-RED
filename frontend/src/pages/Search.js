import { Search as SearchIcon, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const Search = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery(
    ["users", debouncedSearchTerm],
    async () => {
      if (debouncedSearchTerm.trim()) {
        return await api.get(
          `/users/?search=${encodeURIComponent(debouncedSearchTerm)}`
        );
      }
      return await api.get("/users/");
    },
    {
      enabled: true,
    }
  );

  const users = usersResponse?.data?.results || [];

  // Mutation para seguir usuario
  const followMutation = useMutation(
    async (username) => {
      await api.post(`/users/follow/${username}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users", debouncedSearchTerm]);
        queryClient.invalidateQueries(["posts"]); // Recargar feed de posts
        toast.success("Usuario seguido exitosamente");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al seguir usuario");
      },
    }
  );

  // Mutation para dejar de seguir usuario
  const unfollowMutation = useMutation(
    async (username) => {
      await api.delete(`/users/unfollow/${username}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users", debouncedSearchTerm]);
        queryClient.invalidateQueries(["posts"]); // Recargar feed de posts
        toast.success("Has dejado de seguir al usuario");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al dejar de seguir");
      },
    }
  );

  const handleFollow = (username) => {
    followMutation.mutate(username);
  };

  const handleUnfollow = (username) => {
    unfollowMutation.mutate(username);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div
        className={`rounded-xl shadow-md border p-5 ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <h1
          className={`text-xl font-bold mb-4 flex items-center gap-2 ${
            isDark ? "text-slate-100" : "text-gray-900"
          }`}
        >
          <SearchIcon
            className={`h-5 w-5 ${
              isDark ? "text-primary-400" : "text-primary-600"
            }`}
          />
          Buscar Usuarios
        </h1>

        {/* Barra de búsqueda */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon
              className={`h-4 w-4 ${
                isDark ? "text-slate-500" : "text-gray-400"
              }`}
            />
          </div>
          <input
            type="text"
            className={`block w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all ${
              isDark
                ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
            }`}
            placeholder="Buscar usuarios por nombre o username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Resultados */}
        {isLoading && (
          <LoadingSpinner variant="dots" text="Buscando usuarios..." />
        )}

        {error && (
          <div className="text-center py-8">
            <p className={isDark ? "text-red-400" : "text-red-500"}>
              Error al cargar usuarios
            </p>
          </div>
        )}

        {users && (
          <div className="space-y-4">
            {/* Manejar diferentes estructuras de respuesta */}
            {(() => {
              const userList = Array.isArray(users.data)
                ? users.data
                : Array.isArray(users)
                ? users
                : [];

              if (userList.length === 0) {
                return (
                  <div className="text-center py-8">
                    <User
                      className={`h-16 w-16 mx-auto mb-4 ${
                        isDark ? "text-slate-600" : "text-gray-400"
                      }`}
                    />
                    <p className={isDark ? "text-slate-400" : "text-gray-500"}>
                      {debouncedSearchTerm
                        ? "No se encontraron usuarios"
                        : "No hay usuarios disponibles"}
                    </p>
                  </div>
                );
              }

              return userList.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-700/50 hover:border-primary-700"
                      : "border-gray-200 hover:bg-gray-50 hover:border-primary-200"
                  }`}
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="flex-shrink-0">
                      {user.profile_picture ? (
                        <img
                          className={`h-10 w-10 rounded-full object-cover ring-2 ${
                            isDark ? "ring-slate-700" : "ring-gray-100"
                          }`}
                          src={user.profile_picture}
                          alt={user.username}
                        />
                      ) : (
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isDark ? "bg-slate-700" : "bg-gray-100"
                          }`}
                        >
                          <User
                            className={`h-5 w-5 ${
                              isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          isDark ? "text-slate-100" : "text-gray-900"
                        }`}
                      >
                        {user.first_name} {user.last_name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            isDark ? "text-slate-500" : "text-gray-400"
                          }`}
                        >
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {user.is_following ? (
                    <button
                      onClick={() => handleUnfollow(user.username)}
                      disabled={unfollowMutation.isLoading}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all disabled:opacity-50 border border-gray-200"
                    >
                      Siguiendo
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(user.username)}
                      disabled={followMutation.isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 font-semibold transition-all disabled:opacity-50 shadow-md"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Seguir
                    </button>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
