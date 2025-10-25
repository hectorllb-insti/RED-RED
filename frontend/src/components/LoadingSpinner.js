import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  variant = "spinner",
  size = "md",
  text = "",
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen bg-gray-50"
    : `flex flex-col items-center justify-center gap-3 ${className}`;

  if (variant === "spinner") {
    return (
      <div className={containerClass}>
        <Loader2
          className={`${sizeClasses[size]} text-primary-600 animate-spin`}
        />
        {text && (
          <p className={`${textSizes[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClass}>
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-primary-600 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {text && (
          <p className={`${textSizes[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={containerClass}>
        <motion.div
          className={`${sizeClasses[size]} bg-primary-600 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {text && (
          <p className={`${textSizes[size]} text-gray-600 font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="h-20 bg-gray-200 rounded-xl"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Default circular spinner (backward compatible)
  return (
    <div className={containerClass}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
