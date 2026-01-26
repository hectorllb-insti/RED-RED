import { Camera, ImageIcon, Plus, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import CreateStoryModal from "../components/CreateStoryModal";
import StoryViewerModal from "../components/StoryViewerModal";

import { formatDateShort, formatDateTime } from "../utils/dateUtils";

const Stories = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
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
    <div className="space-y-5 mt-10">
      {/* Stories Header */}
      <div
        className={`flex items-center justify-between rounded-xl shadow-md border p-4 ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <h1
          className={`text-xl font-bold flex items-center gap-2 ${
            isDark ? "text-slate-100" : "text-gray-900"
          }`}
        >
          <Camera
            className={`h-5 w-5 ${
              isDark ? "text-primary-400" : "text-primary-600"
            }`}
          />
          Historias
        </h1>
        <button
          onClick={() => setShowCreateStory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-md transition-all text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Historia</span>
        </button>
      </div>

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal onClose={() => setShowCreateStory(false)} />
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
                    src={getImageUrl(story.author_profile_picture) || "/default-avatar.png"}
                    alt={`${story.author_first_name} ${story.author_last_name}`}
                  />
                  <span className="text-white text-sm font-medium">
                    {story.author_first_name} {story.author_last_name}
                  </span>
                </div>

                {/* Time */}
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xs">
                    {formatDateShort(story.created_at)}
                  </span>
                </div>
              </button>
            </div>
          ));
        })()}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewerModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
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
