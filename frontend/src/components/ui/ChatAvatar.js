import React, { useMemo } from "react";
import useAvatarImage from "../../hooks/useAvatarImage";

const ChatAvatar = ({ 
  src, 
  alt = "Usuario", 
  size = "sm",
  className = "",
  showFallback = true,
  // Prop adicional para forzar actualización
  updateKey
}) => {
  // Crear una clave única que incluya la URL y el updateKey para forzar actualizaciones
  const avatarKey = useMemo(() => {
    return `${src}-${updateKey || Date.now()}`;
  }, [src, updateKey]);

  const {
    imageUrl,
    isLoading,
    imageError,
    handleImageLoad,
    handleImageError,
    fallbackInitial
  } = useAvatarImage(src, alt);

  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-10 h-10", 
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} key={avatarKey}>
      {/* Skeleton loader - solo mostrar si está cargando y no hay imagen previa */}
      {isLoading && (
        <div className={`
          ${sizeClasses[size]} 
          rounded-full bg-gray-200 animate-pulse
          absolute inset-0
        `} />
      )}
      
      {/* Imagen principal */}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`
          ${sizeClasses[size]}
          rounded-full object-cover
          transition-opacity duration-200
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
      />
      
      {/* Fallback con iniciales si la imagen falla y no hay default */}
      {imageError && !showFallback && (
        <div className={`
          ${sizeClasses[size]}
          rounded-full bg-gray-400 
          flex items-center justify-center
          text-white font-medium text-sm
          absolute inset-0
        `}>
          {fallbackInitial}
        </div>
      )}
    </div>
  );
};

export default ChatAvatar;