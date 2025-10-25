import { motion } from "framer-motion";

// 🎨 Loading Spinner moderno con variantes

const LoadingSpinner = ({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Spinner con gradiente
  const SpinnerVariant = () => (
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
        style={{
          borderTopColor: "#ef4444",
          borderRightColor: "#f87171",
        }}
      />
    </div>
  );

  // Dots animados
  const DotsVariant = () => (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className="w-3 h-3 bg-red-600 rounded-full"
        />
      ))}
    </div>
  );

  // Pulse
  const PulseVariant = () => (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
      className={`${sizeClasses[size]} bg-gradient-to-br from-red-600 to-rose-600 rounded-full`}
    />
  );

  const variants = {
    spinner: <SpinnerVariant />,
    dots: <DotsVariant />,
    pulse: <PulseVariant />,
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      {variants[variant]}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
