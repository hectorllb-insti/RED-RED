"use client";

import { Camera, Settings, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileEdit from "../components/ProfileEdit";
import { useAuth } from "../context/AuthContext";
import { tokenManager } from "../services/tokenManager";

const API_BASE_URL = "http://localhost:8000/api";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditProfile, setShowEditProfile] = useState(false);

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
      const token = tokenManager.getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (isOwnProfile) {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers,
        });
        if (!response.ok) {
          throw new Error("Error al obtener el perfil");
        }
        return await response.json();
      } else {
        // Intentar por ID primero, si falla por username
        try {
          const response = await fetch(
            `${API_BASE_URL}/users/${profileIdentifier}/`,
            { headers }
          );
          if (!response.ok) {
            throw new Error("Error al obtener el perfil");
          }
          return await response.json();
        } catch (error) {
          if (error.response?.status === 404 && isNaN(profileIdentifier)) {
            // Si el identificador no es numérico, podría ser un username
            const response = await fetch(
              `${API_BASE_URL}/users/${profileIdentifier}/`,
              { headers }
            );
            if (!response.ok) {
              throw new Error("Error al obtener el perfil");
            }
            return await response.json();
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
        const token = tokenManager.getToken();
        const response = await fetch(
          `${API_BASE_URL}/posts/user/${profileUser.username}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener las publicaciones");
        }
        return await response.json();
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
      const token = tokenManager.getToken();
      const endpoint = profileUser.is_following
        ? `${API_BASE_URL}/users/unfollow/${profileUser.username}/`
        : `${API_BASE_URL}/users/follow/${profileUser.username}/`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el seguimiento");
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile", profileIdentifier]);
        queryClient.invalidateQueries(["posts"]); // Recargar feed de posts
        toast.success(
          profileUser?.is_following
            ? "Dejaste de seguir a este usuario"
            : "Ahora sigues a este usuario"
        );
      },
      onError: (error) => {
        toast.error(error.message || "Error al actualizar el seguimiento");
      },
    }
  );

  const handleFollow = () => {
    followMutation.mutate();
  };

  if (isLoading) {
    return (
      <LoadingSpinner variant="spinner" text="Cargando perfil..." fullScreen />
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover Photo */}
        <div className="h-52 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 relative">
          {profileUser.cover_picture && (
            <img
              src={profileUser.cover_picture || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2.5 bg-gray-900/60 backdrop-blur-sm rounded-xl text-white hover:bg-gray-900/80 transition-all">
              <Camera className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between -mt-20">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  className="h-36 w-36 rounded-2xl border-4 border-white shadow-xl ring-2 ring-gray-100"
                  src={profileUser.profile_picture || "/default-avatar.png"}
                  alt={profileUser.full_name}
                />
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-2 bg-primary-600 rounded-xl text-white shadow-lg hover:bg-primary-700 transition-all">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.full_name}
                </h1>
                <p className="text-gray-600 font-medium">
                  @{profileUser.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-20">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  <Settings className="h-4 w-4" />
                  <span>Editar perfil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    profileUser.is_following
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30"
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
            <p className="mt-5 text-gray-700 leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {userPosts?.count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Publicaciones
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {profileUser.followers_count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Seguidores
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {profileUser.following_count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Siguiendo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {["posts", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-primary-600 text-primary-600"
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
            <div className="space-y-5">
              {userPosts?.results?.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-100 pb-5 last:border-b-0"
                >
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                  {post.image && (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      className="mt-3 rounded-xl max-w-full h-auto"
                    />
                  )}
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-4 font-medium">
                      <span>{post.likes_count} likes</span>
                      <span>{post.comments_count} comentarios</span>
                    </div>
                    <span className="font-medium">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!userPosts?.results || userPosts.results.length === 0) && (
                <p className="text-gray-500 text-center py-12 font-medium">
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

      {/* Profile Edit Modal */}
      {showEditProfile && (
        <ProfileEdit onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

export default Profile;
