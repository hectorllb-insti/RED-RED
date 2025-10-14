/**
 * Componente optimizado para carga de imágenes
 */

import React, { useCallback, useState } from "react";

const OptimizedImage = React.memo(
  ({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.jpg",
    loading = "lazy",
    width,
    height,
    onLoad,
    onError,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleLoad = useCallback(
      (event) => {
        setImageLoaded(true);
        onLoad?.(event);
      },
      [onLoad]
    );

    const handleError = useCallback(
      (event) => {
        setImageError(true);
        onError?.(event);
      },
      [onError]
    );

    if (imageError) {
      return (
        <div
          className={`bg-gray-200 flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <span className="text-gray-400 text-sm">Error cargando imagen</span>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        {/* Placeholder mientras carga */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Imagen principal */}
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={{ width, height }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
