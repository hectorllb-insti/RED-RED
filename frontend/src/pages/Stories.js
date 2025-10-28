import { Camera, ImageIcon, Plus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Stories = () => {
  const { user } = useAuth();
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();

  // Obtener historias
  const { data: stories, isLoading } = useQuery("stories", async () => {
    const response = await api.get("/stories/");
    return response.data;
  });

  // Mutation para crear historia
  const createStoryMutation = useMutation(
    async (storyData) => {
      const response = await api.post("/stories/", storyData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("stories");
        setStoryContent("");
        setShowCreateStory(false);
        toast.success("¡Historia creada!");
      },
      onError: () => {
        toast.error("Error al crear la historia");
      },
    }
  );

  const handleCreateStory = (e) => {
    e.preventDefault();
    if (storyContent.trim() || selectedImage) {
      // Crear FormData si hay imagen
      let storyData;
      if (selectedImage) {
        storyData = new FormData();
        storyData.append("content", storyContent);
        storyData.append("image", selectedImage);
      } else {
        storyData = { content: storyContent };
      }

      createStoryMutation.mutate(storyData, {
        onSuccess: () => {
          setStoryContent("");
          setSelectedImage(null);
          setImagePreview(null);
          setShowCreateStory(false);
        },
      });
    }
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

  if (isLoading) {
    return (
      <LoadingSpinner variant="pulse" text="Cargando historias..." fullScreen />
    );
  }

  return (
    <div className="space-y-6 mt-10">
      {/* Stories Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historias</h1>
        <button
          onClick={() => setShowCreateStory(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          <span>Crear Historia</span>
        </button>
      </div>

      {/* Create Story Modal */}
      {showCreateStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Crear Historia</h2>
              <button
                onClick={() => setShowCreateStory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  className="h-10 w-10 rounded-full"
                  src={user?.profile_picture || "/default-avatar.png"}
                  alt={user?.full_name}
                />
                <div>
                  <p className="font-medium">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">Tu historia</p>
                </div>
              </div>

              <textarea
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="¿Qué quieres compartir en tu historia?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="4"
                maxLength="500"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {storyContent.length}/500
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="story-image-upload"
                  />
                  <label
                    htmlFor="story-image-upload"
                    className="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-primary-600"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-sm">Imagen</span>
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateStory(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      (!storyContent.trim() && !selectedImage) ||
                      createStoryMutation.isLoading
                    }
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createStoryMutation.isLoading ? "Creando..." : "Publicar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* My Story */}
        <div className="relative">
          <button
            onClick={() => setShowCreateStory(true)}
            className="w-full h-64 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-600 hover:from-gray-300 hover:to-gray-400 transition-colors"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Tu Historia</span>
          </button>
        </div>

        {/* Stories from others */}
        {(() => {
          const storyList = Array.isArray(stories?.results)
            ? stories.results
            : Array.isArray(stories)
            ? stories
            : [];
          return storyList.map((story) => (
            <div key={story.id} className="relative">
              <button
                onClick={() => setSelectedStory(story)}
                className="w-full h-64 rounded-lg overflow-hidden relative group"
              >
                {story.image ? (
                  <img
                    src={story.image}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-4">
                    <p className="text-white text-center text-sm font-medium">
                      {story.content}
                    </p>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity" />

                {/* Author info */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full border-2 border-white"
                    src={story.author_profile_picture || "/default-avatar.png"}
                    alt={`${story.author_first_name} ${story.author_last_name}`}
                  />
                  <span className="text-white text-sm font-medium">
                    {story.author_first_name} {story.author_last_name}
                  </span>
                </div>

                {/* Time */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xs">
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            </div>
          ));
        })()}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="bg-black rounded-lg overflow-hidden">
              {selectedStory.image ? (
                <img
                  src={selectedStory.image}
                  alt="Story"
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-6">
                  <p className="text-white text-center text-lg">
                    {selectedStory.content}
                  </p>
                </div>
              )}

              {/* Story info */}
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={
                      selectedStory.author_profile_picture ||
                      "/default-avatar.png"
                    }
                    alt={`${selectedStory.author_first_name} ${selectedStory.author_last_name}`}
                  />
                  <div>
                    <p className="text-white font-medium">
                      {selectedStory.author_first_name}{" "}
                      {selectedStory.author_last_name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {new Date(selectedStory.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedStory.content && selectedStory.image && (
                  <p className="text-white mt-3">{selectedStory.content}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(!stories?.results || stories.results.length === 0) && (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay historias disponibles</p>
          <p className="text-gray-400">
            ¡Sé el primero en compartir una historia!
          </p>
        </div>
      )}
    </div>
  );
};

export default Stories;
