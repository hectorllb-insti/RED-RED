import { useState, useEffect, useRef } from "react";
import { getImageUrl, refreshImageUrl } from "../utils/imageUtils";

/**
 * Hook personalizado para manejar imágenes de avatar con cache inteligente
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {boolean} watchUpdates - Si debe escuchar actualizaciones via WebSocket
 * @returns {object} Estado y funciones para manejar la imagen
 */
export const useAvatarImage = (src, alt = "Usuario", watchUpdates = true) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const previousSrcRef = useRef(null);
  const imageRef = useRef(null);

  // Generar URL optimizada
  const getOptimizedUrl = (imageSrc) => {
    if (imageError || !imageSrc) {
      return "/default-avatar.png";
    }
    
    // Solo aplicar cache busting cuando cambia la imagen base
    if (imageSrc !== previousSrcRef.current) {
      const newUrl = getImageUrl(imageSrc, true);
      previousSrcRef.current = imageSrc;
      return newUrl;
    }
    
    return currentImageUrl || getImageUrl(imageSrc, false);
  };

  // Precargar imagen para evitar parpadeo
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
  };

  // Manejar cambios en la imagen fuente
  useEffect(() => {
    if (!src) {
      setCurrentImageUrl("/default-avatar.png");
      setIsLoading(false);
      setImageError(false);
      return;
    }

    // Detectar cambios en la URL base (sin parámetros de cache)
    const cleanSrc = src.split('?')[0]; // Remover parámetros de query
    const previousCleanSrc = previousSrcRef.current?.split('?')[0];

    // Si la imagen base cambió o es una URL completamente nueva
    if (cleanSrc !== previousCleanSrc || !currentImageUrl) {
      console.log('🖼️ Detectado cambio en imagen:', { from: previousCleanSrc, to: cleanSrc });
      
      const newUrl = getOptimizedUrl(src);
      
      // Precargar nueva imagen
      preloadImage(newUrl)
        .then(() => {
          console.log('✅ Nueva imagen precargada:', newUrl);
          setCurrentImageUrl(newUrl);
          setImageError(false);
          setIsLoading(false);
        })
        .catch(() => {
          console.log('❌ Error cargando nueva imagen:', newUrl);
          setImageError(true);
          setIsLoading(false);
          setCurrentImageUrl("/default-avatar.png");
        });

      // Solo mostrar loading si no hay imagen previa
      if (!currentImageUrl || currentImageUrl === "/default-avatar.png") {
        setIsLoading(true);
      }
    }
  }, [src, currentImageUrl]);

  // Función para refrescar imagen (útil para actualizaciones via WebSocket)
  const refreshImage = () => {
    if (src) {
      const newUrl = refreshImageUrl(src);
      preloadImage(newUrl)
        .then(() => {
          setCurrentImageUrl(newUrl);
          setImageError(false);
        })
        .catch(() => {
          setImageError(true);
          setCurrentImageUrl("/default-avatar.png");
        });
    }
  };

  // Handlers para los eventos de imagen
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    setCurrentImageUrl("/default-avatar.png");
  };

  return {
    imageUrl: currentImageUrl || getOptimizedUrl(src),
    isLoading: isLoading && !currentImageUrl,
    imageError,
    refreshImage,
    handleImageLoad,
    handleImageError,
    fallbackInitial: alt ? alt.charAt(0).toUpperCase() : "U"
  };
};

export default useAvatarImage;