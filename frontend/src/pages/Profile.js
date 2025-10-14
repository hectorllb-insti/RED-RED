import { Camera, Settings, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");

  // Si no hay userId, mostrar perfil del usuario actual
  const isOwnProfile =
    !userId ||
    userId === currentUser?.id?.toString() ||
    userId === currentUser?.username;
  const profileIdentifier = userId || currentUser?.id;

  // Obtener datos del perfil
  const { data: profileUser, isLoading } = useQuery(
    ["profile", profileIdentifier],
    async () => {
      if (isOwnProfile) {
        const response = await api.get("/users/profile/");
        return response.data;
      } else {
        // Intentar por ID primero, si falla por username
        try {
          const response = await api.get(`/users/${profileIdentifier}/`);
          return response.data;
        } catch (error) {
          if (error.response?.status === 404 && isNaN(profileIdentifier)) {
            // Si el identificador no es numérico, podría ser un username
            const response = await api.get(`/users/${profileIdentifier}/`);
            return response.data;
          }
          throw error;
        }
      }
    }
  );

  // Obtener publicaciones del usuario
  const { data: userPosts } = useQuery(
    ["userPosts", profileUser?.username],
    async () => {
      if (profileUser?.username) {
        const response = await api.get(`/posts/user/${profileUser.username}/`);
        return response.data;
      }
      return [];
    },
    {
      enabled: !!profileUser?.username,
    }
  );

  // Mutation para seguir/dejar de seguir
  const followMutation = useMutation(
    async () => {
      if (profileUser.is_following) {
        const response = await api.post(
          `/users/unfollow/${profileUser.username}/`
        );
        return response.data;
      } else {
        const response = await api.post(
          `/users/follow/${profileUser.username}/`
        );
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile", profileIdentifier]);
        toast.success(
          profileUser?.is_following
            ? "Dejaste de seguir a este usuario"
            : "Ahora sigues a este usuario"
        );
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error || "Error al actualizar el seguimiento"
        );
      },
    }
  );

  const handleFollow = () => {
    followMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
          {profileUser.cover_picture && (
            <img
              src={profileUser.cover_picture}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70">
              <Camera className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between -mt-16">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <img
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                  src={profileUser.profile_picture || "/default-avatar.png"}
                  alt={profileUser.full_name}
                />
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-2 bg-primary-500 rounded-full text-white shadow-lg hover:bg-primary-600">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.full_name}
                </h1>
                <p className="text-gray-600">@{profileUser.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-16">
              {isOwnProfile ? (
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Settings className="h-4 w-4" />
                  <span>Editar perfil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                    profileUser.is_following
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  } disabled:opacity-50`}
                >
                  {profileUser.is_following ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span>Dejar de seguir</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p className="mt-4 text-gray-700">{profileUser.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {userPosts?.count || 0}
              </p>
              <p className="text-sm text-gray-600">Publicaciones</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {profileUser.followers_count || 0}
              </p>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {profileUser.following_count || 0}
              </p>
              <p className="text-sm text-gray-600">Siguiendo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {["posts", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "posts" ? "Publicaciones" : "Acerca de"}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {userPosts?.results?.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="mt-2 rounded-lg max-w-full h-auto"
                    />
                  )}
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{post.likes_count} likes</span>
                      <span>{post.comments_count} comentarios</span>
                    </div>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!userPosts?.results || userPosts.results.length === 0) && (
                <p className="text-gray-500 text-center py-8">
                  {isOwnProfile
                    ? "Aún no has publicado nada"
                    : "Este usuario no ha publicado nada"}
                </p>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Información</h3>
                <div className="space-y-2 text-sm">
                  {profileUser.location && (
                    <p>
                      <span className="font-medium">Ubicación:</span>{" "}
                      {profileUser.location}
                    </p>
                  )}
                  {profileUser.website && (
                    <p>
                      <span className="font-medium">Sitio web:</span>
                      <a
                        href={profileUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline ml-1"
                      >
                        {profileUser.website}
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Se unió:</span>
                    {new Date(profileUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
