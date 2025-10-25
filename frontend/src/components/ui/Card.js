import { motion } from "framer-motion";

// 🎨 Card moderno con efectos visuales

const Card = ({
  children,
  hover = true,
  padding = "md",
  className = "",
  onClick,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = `
    bg-white rounded-2xl border border-gray-200 shadow-sm
    transition-all duration-200
    ${paddingClasses[padding]}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  const motionProps = hover
    ? {
        whileHover: {
          y: -2,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={baseClasses}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default Card;
