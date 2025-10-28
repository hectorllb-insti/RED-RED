import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { getImageUrl } from "../../utils/imageUtils";

// 🎨 Avatar moderno con estados

const Avatar = ({
  src,
  alt = "User",
  size = "md",
  online = false,
  className = "",
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(null);
  const previousSrcRef = useRef(null);

  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  const onlineSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
    "2xl": "w-6 h-6",
  };

  // Decidir qué imagen mostrar
  let imageUrl;
  if (imageError || !src) {
    imageUrl = "/default-avatar.png";
  } else {
    // Solo aplicar cache busting cuando la imagen base cambia
    if (src !== previousSrcRef.current) {
      imageUrl = getImageUrl(src, true);
      previousSrcRef.current = src;
    } else {
      imageUrl = currentSrc || getImageUrl(src, true);
    }
  }

  useEffect(() => {
    // Solo actualizar si realmente cambió la imagen base
    if (src && src !== previousSrcRef.current) {
      setCurrentSrc(imageUrl);
      setImageError(false);
      // No resetear isLoading si ya hay una imagen cargada
      if (!currentSrc) {
        setIsLoading(true);
      }
    }
  }, [src, imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : {}}
      className={`relative inline-block ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Skeleton loader - solo mostrar si no hay imagen previa */}
      {isLoading && !currentSrc && (
        <div className={`
          ${sizeClasses[size]} 
          rounded-full bg-gray-200 animate-pulse
          absolute inset-0
        `} />
      )}
      
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`
          ${sizeClasses[size]}
          rounded-full object-cover
          ring-2 ring-white shadow-md
          transition-all duration-200
          ${isLoading && !currentSrc ? 'opacity-0' : 'opacity-100'}
          ${className}
        `}
      />
      {online && (
        <span
          className={`
          absolute bottom-0 right-0
          ${onlineSizes[size]}
          bg-emerald-500 rounded-full
          ring-2 ring-white
        `}
        />
      )}
    </motion.div>
  );
};

export default Avatar;
