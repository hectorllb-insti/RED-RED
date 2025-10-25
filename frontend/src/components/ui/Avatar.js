import { motion } from "framer-motion";

// 🎨 Avatar moderno con estados

const Avatar = ({
  src,
  alt = "User",
  size = "md",
  online = false,
  className = "",
  onClick,
}) => {
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

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : {}}
      className={`relative inline-block ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <img
        src={src || "/default-avatar.png"}
        alt={alt}
        className={`
          ${sizeClasses[size]}
          rounded-full object-cover
          ring-2 ring-white shadow-md
          transition-all duration-200
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
