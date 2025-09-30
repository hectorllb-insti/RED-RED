import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../services/api";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const queryClient = useQueryClient();

  // Obtener publicaciones del feed
  const { data: posts, isLoading } = useQuery("posts", async () => {
    const response = await api.get("/posts/");
    return response.data;
  });

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

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      createPostMutation.mutate({
        content: newPost,
        image: null, // Por ahora solo texto
      });
    }
  };

  const handleLike = (postId) => {
    likeMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full"
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.full_name}
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ¿Qué estás pensando, {user?.first_name}?
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newPost.trim() || createPostMutation.isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPostMutation.isLoading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts?.results?.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full"
                  src={post.author.profile_picture || "/default-avatar.png"}
                  alt={post.author.full_name}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {post.author.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{post.author.username}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {post.content}
              </p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Post image"
                  className="mt-3 rounded-lg max-w-full h-auto"
                />
              )}
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 ${
                    post.is_liked
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">{post.likes_count}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comments_count}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">Compartir</span>
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(!posts?.results || posts.results.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay publicaciones aún</p>
          <p className="text-gray-400">¡Sé el primero en publicar algo!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
