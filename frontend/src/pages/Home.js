"use client";

import {
  Edit2,
  Heart,
  ImageIcon,
  MessageCircle,
  Plus,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import CreateStoryModal from "../components/CreateStoryModal";
import StoryViewerModal from "../components/StoryViewerModal";
import EmptyState from "../components/EmptyState";
import { TextWithHashtags } from "../components/HashtagLink";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { formatDateShort, formatTime } from "../utils/dateUtils";
import { getImageUrl } from "../utils/imageUtils";
import { securityUtils } from "../utils/security";

const Home = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [viewedStories, setViewedStories] = useState(() => {
    const saved = localStorage.getItem("viewedStories");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();
  const isDark = actualTheme === "dark";

  // Obtener historias
  const { data: stories } = useQuery("stories", async () => {
    const response = await api.get("/stories/");
    return response.data;
  });

  // Obtener publicaciones del feed
  const { data: posts, isLoading } = useQuery(
    ["posts"],
    async () => {
      const response = await api.get("/posts/");
      return response.data;
    },
    {
      staleTime: 0, // Datos siempre considerados obsoletos para permitir recarga
      refetchOnMount: "always", // Recargar siempre al montar el componente
      refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    }
  );

  // Mutation para crear nueva publicación
  const createPostMutation = useMutation(
    async (postData) => {
      const response = await api.post("/posts/", postData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        setNewPost("");
        setShowCreatePost(false);
        toast.success("¡Publicación creada!");
      },
      onError: () => {
        toast.error("Error al crear la publicación");
      },
    }
  );

  // Mutation para dar like/unlike
  const likeMutation = useMutation(
    async (postId) => {
      const response = await api.post(`/posts/${postId}/like/`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
      },
    }
  );

  // Mutation para eliminar post
  const deletePostMutation = useMutation(
    async (postId) => {
      await api.delete(`/posts/${postId}/`);
      return postId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Publicación eliminada");
      },
      onError: () => {
        toast.error("Error al eliminar la publicación");
      },
    }
  );

  // Mutation para editar post
  const editPostMutation = useMutation(
    async ({ postId, content }) => {
      const response = await api.put(`/posts/${postId}/`, { content });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Publicación editada");
      },
      onError: () => {
        toast.error("Error al editar la publicación");
      },
    }
  );

  // Mutation para comentar post
  const commentMutation = useMutation(
    async ({ postId, content }) => {
      const response = await api.post(`/posts/${postId}/comment/`, { content });
      return response.data;
    },
    {
      onSuccess: (_, { postId }) => {
        queryClient.invalidateQueries(["comments", postId]);
        queryClient.invalidateQueries("posts");
        setNewComment({ ...newComment, [postId]: "" });
        toast.success("Comentario agregado");
      },
      onError: () => {
        toast.error("Error al agregar comentario");
      },
    }
  );

  // Mutation para compartir post
  const shareMutation = useMutation(
    async ({ postId, shared_with_username, message }) => {
      const data = { message };
      if (shared_with_username) {
        data.shared_with_username = shared_with_username;
      }
      const response = await api.post(`/posts/${postId}/share/`, data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "¡Publicación compartida!");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al compartir");
      },
    }
  );

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPost.trim() || selectedImage) {
      try {
        // Validar y sanitizar contenido
        const sanitizedContent = securityUtils.sanitizePost(newPost);

        // Crear FormData si hay imagen
        let postData;
        if (selectedImage) {
          postData = new FormData();
          postData.append("content", sanitizedContent);
          postData.append("image", selectedImage);
        } else {
          postData = { content: sanitizedContent };
        }

        createPostMutation.mutate(postData, {
          onSuccess: () => {
            setNewPost("");
            setSelectedImage(null);
            setImagePreview(null);
            setShowCreatePost(false);
          },
        });
      } catch (error) {
        toast.error("Error: " + error.message);
        return;
      }
    }
  };

  const handleLike = (postId) => {
    likeMutation.mutate(postId);
  };

  const handleDeletePost = (postId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleStartEdit = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      try {
        const sanitizedContent = securityUtils.sanitizePost(editContent);
        editPostMutation.mutate(
          { postId: editingPost, content: sanitizedContent },
          {
            onSuccess: () => {
              setEditingPost(null);
              setEditContent("");
            },
          }
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    });
  };

  const handleCommentSubmit = (postId) => {
    const content = newComment[postId];
    if (content && content.trim()) {
      try {
        const sanitizedContent = securityUtils.sanitizePost(content);
        commentMutation.mutate({ postId, content: sanitizedContent });
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComment({
      ...newComment,
      [postId]: value,
    });
  };

  const handleSharePost = (postId) => {
    const username = prompt(
      "Ingresa el nombre de usuario con quien compartir (o deja vacío para compartir públicamente):"
    );

    // Si el usuario cancela, username será null
    if (username === null) return;

    const message = prompt(
      "¿Quieres agregar un mensaje al compartir? (opcional)"
    );

    // Si el usuario cancela el mensaje también, no compartir
    if (message === null) return;

    const shareData = {
      message: message || "",
    };

    // Solo agregar shared_with_username si se proporcionó
    if (username && username.trim()) {
      shareData.shared_with_username = username.trim();
    }

    shareMutation.mutate({ postId, ...shareData });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setViewedStories((prev) => {
      const newSet = new Set(prev);
      newSet.add(story.id);
      localStorage.setItem("viewedStories", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Auto-refresh cada 45 segundos para obtener nuevas publicaciones
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      queryClient.invalidateQueries("posts");
      queryClient.invalidateQueries("stories");
    }, 45000);

    return () => clearInterval(autoRefreshInterval);
  }, [queryClient]);

  if (isLoading) {
    return (
      <LoadingSpinner variant="skeleton" text="Cargando publicaciones..." />
    );
  }

  return (
    <div className="space-y-6 mt-10">
      {/* Stories Bar */}
      <div
        className={`rounded-2xl shadow-sm border p-4 overflow-x-auto no-scrollbar ${
          isDark
            ? "bg-slate-800/50 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4 min-w-max">
          {/* Create Story Button */}
          <button
            onClick={() => setShowCreateStory(true)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-gray-300 group-hover:border-primary-500 transition-colors">
                <img
                  src={user?.profile_picture || "/default-avatar.png"}
                  alt="Tu historia"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-800">
                <Plus className="h-3 w-3" />
              </div>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center text-gray-900 dark:text-white">
              Tu historia
            </span>
          </button>

          {/* Stories List */}
          {stories?.results?.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  viewedStories.has(story.id)
                    ? "bg-gray-300 dark:bg-slate-600"
                    : "bg-gradient-to-tr from-yellow-400 to-fuchsia-600"
                } group-hover:scale-105 transition-transform`}
              >
                <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                  <img
                    src={
                      getImageUrl(story.author_profile_picture) ||
                      "/default-avatar.png"
                    }
                    alt={story.author_first_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs font-medium truncate w-16 text-center text-gray-900 dark:text-white">
                {story.author_first_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal onClose={() => setShowCreateStory(false)} />
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewerModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {/* Tarjeta de crear publicación */}
      <div
        className={`rounded-xl shadow-md border p-4 hover:shadow-lg transition-all duration-300 group ${
          isDark
            ? "bg-gradient-to-r from-slate-800 via-slate-800/50 to-slate-800 border-slate-700 hover:border-slate-600"
            : "bg-gradient-to-r from-white via-primary-50/20 to-white border-gray-200 hover:border-primary-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              className="h-11 w-11 rounded-full ring-2 ring-primary-100 object-cover group-hover:ring-primary-300 transition-all"
              src={user?.profile_picture || "/default-avatar.png"}
              alt={user?.full_name}
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className={`flex-1 text-left px-5 py-3 rounded-full text-sm font-medium group-hover:shadow-inner transition-all ${
              isDark
                ? "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-300 hover:from-slate-600 hover:to-slate-500 hover:text-slate-100"
                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 hover:from-primary-50 hover:to-purple-50 hover:text-primary-700"
            }`}
          >
            💭 ¿Qué estás pensando, {user?.first_name}?
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className={`w-full p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
              rows="4"
              autoFocus
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-gray-900/80 text-white rounded-full p-2 hover:bg-gray-900 transition-all backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div
              className={`flex justify-between items-center pt-3 border-t ${
                isDark ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDark
                      ? "text-slate-300 hover:text-primary-400 hover:bg-slate-700"
                      : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Foto</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    isDark
                      ? "text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Cancelar
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  (!newPost.trim() && !selectedImage) ||
                  createPostMutation.isLoading
                }
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-lg shadow-primary-500/30 transition-all hover-lift active:scale-95"
              >
                {createPostMutation.isLoading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {(() => {
          const postList = Array.isArray(posts?.results)
            ? posts.results
            : Array.isArray(posts)
            ? posts
            : [];

          if (isLoading) {
            return <LoadingSpinner variant="dots" text="Cargando posts..." />;
          }

          if (postList.length === 0) {
            return (
              <EmptyState
                Icon={MessageCircle}
                title="No hay publicaciones"
                description="Sé el primero en compartir algo con la comunidad"
                actionLabel="Crear publicación"
                onAction={() => setShowCreatePost(true)}
              />
            );
          }

          return postList.map((post, index) => (
            <div
              key={post.id}
              className={`rounded-2xl shadow-md border hover:shadow-lg transition-all duration-300 stagger-item overflow-hidden ${
                isDark
                  ? "bg-gradient-to-br from-slate-800 via-slate-800/50 to-slate-800 border-slate-700 hover:border-slate-600"
                  : "bg-gradient-to-br from-white via-gray-50/50 to-white border-gray-200 hover:border-primary-200"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Post Header con gradiente sutil */}
              <div
                className={`p-4 flex items-center justify-between ${
                  isDark
                    ? "bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
                    : "bg-gradient-to-r from-transparent via-primary-50/20 to-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-primary-100 object-cover"
                    src={
                      getImageUrl(post.author_profile_picture) ||
                      "/default-avatar.png"
                    }
                    alt={`${post.author_first_name} ${post.author_last_name}`}
                  />
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        isDark ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {post.author_first_name} {post.author_last_name}
                    </p>
                    <p className="text-xs text-primary-600 font-medium">
                      @{post.author_username}
                    </p>
                  </div>
                </div>
                {post.author_id === user?.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "text-slate-400 hover:text-primary-400 hover:bg-slate-700"
                          : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                      }`}
                      title="Editar publicación"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? "text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                          : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title="Eliminar publicación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                {editingPost === post.id ? (
                  <div
                    className={`space-y-3 p-3 rounded-xl border ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          : "border-gray-300 bg-white text-gray-800 placeholder-gray-400"
                      }`}
                      rows="3"
                      placeholder="¿Qué estás pensando?"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium ${
                          isDark
                            ? "text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={
                          !editContent.trim() || editPostMutation.isLoading
                        }
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md transition-all"
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {editPostMutation.isLoading
                            ? "Guardando..."
                            : "Guardar"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`whitespace-pre-wrap leading-relaxed text-sm ${
                        isDark ? "text-slate-200" : "text-gray-800"
                      }`}
                    >
                      <TextWithHashtags text={post.content} />
                    </div>
                    {post.image && (
                      <div
                        className={`mt-3 rounded-xl overflow-hidden border ${
                          isDark ? "border-slate-700" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Contenido del post"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sección de interacciones */}
              <div
                className={`px-4 py-3 border-t flex items-center justify-between ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`like-button flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-14 ${
                      post.is_liked
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md liked"
                        : isDark
                        ? "bg-slate-700 text-slate-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/50 border border-slate-600"
                        : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-300 border border-gray-200"
                    }`}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart
                        className={`transition-colors ${
                          post.is_liked ? "fill-current" : ""
                        }`}
                        strokeWidth={post.is_liked ? 0 : 2}
                        style={{
                          width: "18px",
                          height: "18px",
                        }}
                      />
                    </div>
                    <span className="font-medium">{post.likes_count}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-14 ${
                      showComments[post.id]
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : isDark
                        ? "bg-slate-700 text-slate-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-500/50 border border-slate-600"
                        : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-gray-200"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{post.comments_count}</span>
                  </button>
                  <button
                    onClick={() => handleSharePost(post.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-14 ${
                      isDark
                        ? "bg-slate-700 text-slate-300 hover:bg-green-900/30 hover:text-green-400 hover:border-green-500/50 border border-slate-600"
                        : "bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-300 border border-gray-200"
                    }`}
                    title="Compartir publicación"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
                    isDark
                      ? "bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                  } border`}
                >
                  <svg
                    className={`h-3.5 w-3.5 ${
                      isDark ? "text-slate-400" : "text-gray-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={`text-xs font-medium ${
                      isDark ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    {formatDateShort(post.created_at)} •{" "}
                    {formatTime(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <CommentsSection
                  postId={post.id}
                  newComment={newComment[post.id] || ""}
                  onCommentChange={handleCommentChange}
                  onCommentSubmit={handleCommentSubmit}
                  isSubmitting={commentMutation.isLoading}
                />
              )}
            </div>
          ));
        })()}
      </div>

      {(() => {
        const postList = Array.isArray(posts?.results)
          ? posts.results
          : Array.isArray(posts)
          ? posts
          : [];
        return (
          postList.length === 0 && (
            <div className="text-center py-12">
              <p
                className={`text-lg ${
                  isDark ? "text-slate-400" : "text-gray-500"
                }`}
              >
                No hay publicaciones aún
              </p>
              <p className={isDark ? "text-slate-500" : "text-gray-400"}>
                ¡Sé el primero en publicar algo!
              </p>
            </div>
          )
        );
      })()}
    </div>
  );
};

// Componente para la sección de comentarios
const CommentsSection = ({
  postId,
  newComment,
  onCommentChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const queryClient = useQueryClient();
  const isDark = actualTheme === "dark";

  // Query para obtener comentarios del post
  const { data: comments, isLoading } = useQuery(
    ["comments", postId],
    async () => {
      const response = await api.get(`/posts/${postId}/comments/`);
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    }
  );

  // Mutation para dar like/unlike a comentarios con actualización optimista
  const likeCommentMutation = useMutation(
    async (commentId) => {
      const response = await api.post(`/posts/comments/${commentId}/like/`);
      return { commentId, liked: response.data.liked };
    },
    {
      onMutate: async (commentId) => {
        // Cancelar queries en curso
        await queryClient.cancelQueries(["comments", postId]);

        // Snapshot del estado anterior
        const previousComments = queryClient.getQueryData(["comments", postId]);

        // Actualización optimista
        if (previousComments) {
          queryClient.setQueryData(["comments", postId], (old) => {
            return old.map((comment) => {
              if (comment.id === commentId) {
                const newIsLiked = !comment.is_liked;
                const newLikesCount = newIsLiked
                  ? (comment.likes_count || 0) + 1
                  : Math.max(0, (comment.likes_count || 0) - 1);

                return {
                  ...comment,
                  is_liked: newIsLiked,
                  likes_count: newLikesCount,
                };
              }
              return comment;
            });
          });
        }

        return { previousComments };
      },
      onError: (err, newTodo, context) => {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const handleLikeComment = (commentId) => {
    likeCommentMutation.mutate(commentId);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner variant="dots" text="Cargando comentarios..." />
      </div>
    );
  }

  return (
    <div
      className={`border-t ${
        isDark ? "border-slate-700 bg-slate-800/30" : "border-gray-100 bg-gray-50/30"
      }`}
    >
      <div className="p-4 space-y-4">
        {/* Lista de comentarios */}
        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {comments?.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <img
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
                  src={
                    getImageUrl(comment.author_profile_picture) ||
                    "/default-avatar.png"
                  }
                  alt={comment.author_username}
                />
                <div className="flex-1">
                  {/* Nombre y fecha en la misma línea, encima del contenedor */}
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span
                      className={`font-bold text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {comment.author_first_name && comment.author_last_name
                        ? `${comment.author_first_name} ${comment.author_last_name}`
                        : `@${comment.author_username || "usuario"}`}
                    </span>
                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      {formatDateShort(comment.created_at)}
                    </span>
                  </div>
                  
                  {/* Contenedor del comentario solo con el texto */}
                  <div
                    className={`rounded-2xl px-3 py-2 ${
                      isDark ? "bg-slate-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        isDark ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      <TextWithHashtags text={comment.content} />
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                        comment.is_liked
                          ? "text-red-500"
                          : isDark
                          ? "text-slate-400 hover:text-red-400"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          comment.is_liked ? "fill-current" : ""
                        }`}
                      />
                      {comment.likes_count > 0 && (
                        <span>{comment.likes_count}</span>
                      )}
                      <span>Me gusta</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm py-2">
              No hay comentarios aún. ¡Sé el primero!
            </p>
          )}
        </div>

        {/* Input nuevo comentario */}
        <div className="flex items-center gap-2 pt-2">
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.full_name}
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => onCommentChange(postId, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onCommentSubmit(postId);
                }
              }}
              placeholder="Escribe un comentario..."
              className={`w-full pl-4 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 border"
              }`}
            />
            <button
              onClick={() => onCommentSubmit(postId)}
              disabled={!newComment || !newComment.trim() || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <svg
                className="h-4 w-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
