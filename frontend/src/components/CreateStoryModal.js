import { ImageIcon, X, Camera } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const CreateStoryModal = ({ onClose }) => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const [storyContent, setStoryContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  // Mutation para crear historia
  const createStoryMutation = useMutation(
    async (storyData) => {
      const response = await api.post("/stories/", storyData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("stories");
        toast.success("¡Historia creada!");
        onClose();
      },
      onError: () => {
        toast.error("Error al crear la historia");
      },
    }
  );

  const handleCreateStory = (e) => {
    e.preventDefault();
    if (storyContent.trim() || selectedImage) {
      let storyData;
      if (selectedImage) {
        storyData = new FormData();
        storyData.append("content", storyContent);
        storyData.append("image", selectedImage);
      } else {
        storyData = { content: storyContent };
      }
      createStoryMutation.mutate(storyData);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
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

  const startCamera = async () => {
    try {
      setShowCamera(true);
      // Small delay to ensure DOM is updated
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error(err);
          toast.error("No se pudo acceder a la cámara");
          setShowCamera(false);
        }
      }, 100);
    } catch (err) {
      toast.error("Error al iniciar cámara");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-photo.jpg", {
          type: "image/jpeg",
        });
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, "image/jpeg");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 ${
          isDark
            ? "bg-slate-900 border border-slate-700"
            : "bg-white border border-gray-100"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark
              ? "border-slate-700 bg-slate-800/50"
              : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <h2
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Crear Historia
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleCreateStory} className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary-500/20"
                  src={user?.profile_picture || "/default-avatar.png"}
                  alt={user?.full_name}
                />
              </div>
              <div>
                <p
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user?.full_name}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Tu historia será visible por 24 horas
                </p>
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-4">
              {showCamera ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 flex gap-4 z-10">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg"
                    >
                      Capturar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="¿Qué quieres compartir hoy?"
                    className={`w-full p-4 rounded-xl resize-none text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${
                      isDark
                        ? "bg-slate-800 text-white placeholder-slate-500 border-slate-700"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200"
                    } border`}
                    rows="4"
                    maxLength="500"
                    autoFocus
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden group border border-gray-200 dark:border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition-colors transform hover:scale-105"
                        >
                          Eliminar imagen
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="story-image-upload"
                />
                <label
                  htmlFor="story-image-upload"
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isDark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-primary-400"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary-600"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="font-medium">Foto</span>
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isDark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-primary-400"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary-600"
                  }`}
                >
                  <Camera className="h-5 w-5" />
                  <span className="font-medium">Cámara</span>
                </button>
                <span
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {storyContent.length}/500
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    (!storyContent.trim() && !selectedImage) ||
                    createStoryMutation.isLoading
                  }
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40 transform active:scale-95"
                >
                  {createStoryMutation.isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publicando...
                    </span>
                  ) : (
                    "Compartir Historia"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
