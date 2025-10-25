import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

// 🎨 Alert moderno con animaciones suaves

const Alert = ({ type = "info", title, message, onClose }) => {
  const styles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      icon: Info,
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-500/10",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      shadowColor: "shadow-emerald-500/10",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      shadowColor: "shadow-amber-500/10",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: XCircle,
      iconColor: "text-red-600",
      shadowColor: "shadow-red-500/10",
    },
  };

  const { container, icon: Icon, iconColor, shadowColor } = styles[type];

  return (
    <AnimatePresence>
      {(title || message) && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`rounded-2xl border-2 p-4 shadow-sm ${container} ${shadowColor}`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              {title && <h3 className="text-sm font-bold mb-1">{title}</h3>}
              {message && <p className="text-sm font-medium">{message}</p>}
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity`}
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
