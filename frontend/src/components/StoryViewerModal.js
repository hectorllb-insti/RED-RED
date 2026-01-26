import { X } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";
import { getImageUrl } from "../utils/imageUtils";

const StoryViewerModal = ({ story, onClose }) => {
  if (!story) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-lg h-[80vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl">


            {/* Story Content */}
            <div className="h-full w-full flex items-center justify-center bg-neutral-900">
              {story.image ? (
                <img
                  src={story.image}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center p-8">
                  <p className="text-white text-center text-2xl font-bold leading-relaxed">
                    {story.content}
                  </p>
                </div>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

            {/* Header Info */}
            <div className="absolute top-4 left-4 right-12 flex items-center gap-3 z-10">
              <img
                className="h-10 w-10 rounded-full border-2 border-white/20 object-cover"
                src={getImageUrl(story.author_profile_picture) || "/default-avatar.png"}
                alt={`${story.author_first_name} ${story.author_last_name}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {story.author_first_name} {story.author_last_name}
                </p>
                <p className="text-white/60 text-xs">
                  {formatDateTime(story.created_at)}
                </p>
              </div>
            </div>

            {/* Footer Content (Caption) */}
            {story.content && story.image && (
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <p className="text-white text-sm leading-relaxed drop-shadow-md">
                  {story.content}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryViewerModal;
