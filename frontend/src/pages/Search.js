import { Search as SearchIcon, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import api from "../services/api";

const Search = () => {
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
        toast.success("Usuario seguido exitosamente");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al seguir usuario");
      },
    }
  );

  const handleFollow = (username) => {
    followMutation.mutate(username);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Buscar Usuarios
        </h1>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar usuarios por nombre o username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Resultados */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Error al cargar usuarios</p>
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
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
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
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 flex-1"
                  >
                    <div className="flex-shrink-0">
                      {user.profile_picture ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profile_picture}
                          alt={user.username}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollow(user.username)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Seguir
                  </button>
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
