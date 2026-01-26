import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

// 🎨 EmptyState moderno y atractivo

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Ícono con animación */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{
            scale: { delay: 0.2, type: "spring", stiffness: 200 },
            rotate: { delay: 0.4, duration: 0.5 },
          }}
          className="relative mb-6"
        >
          {/* Círculo de fondo con gradiente */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${
              isDark
                ? "bg-gradient-to-br from-red-900/40 to-rose-900/40"
                : "bg-gradient-to-br from-red-100 to-rose-100"
            }`}
          />

          {/* Ícono */}
          <div
            className={`relative p-6 rounded-3xl ${
              isDark
                ? "bg-gradient-to-br from-red-900/30 to-rose-900/30"
                : "bg-gradient-to-br from-red-50 to-rose-50"
            }`}
          >
            <Icon
              className={`w-16 h-16 ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
              strokeWidth={1.5}
            />
          </div>
        </motion.div>
      )}

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-2xl font-bold mb-2 ${
          isDark ? "text-slate-100" : "text-gray-900"
        }`}
      >
        {title}
      </motion.h3>

      {/* Descripción */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-base mb-8 max-w-md ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {description}
        </motion.p>
      )}

      {/* Botón de acción */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
