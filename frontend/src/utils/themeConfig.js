/**
 * Configuración de temas para RED-RED
 * Define los colores y estilos para modo claro y oscuro
 */

export const themeConfig = {
  light: {
    name: "Claro",
    icon: "☀️",
    colors: {
      primary: "#DC2626", // red-600
      primaryHover: "#B91C1C", // red-700
      secondary: "#9333EA", // purple-600
      background: "#FFFFFF",
      surface: "#F9FAFB", // gray-50
      text: "#111827", // gray-900
      textSecondary: "#6B7280", // gray-500
      border: "#E5E7EB", // gray-200
      success: "#10B981", // green-500
      warning: "#F59E0B", // amber-500
      error: "#EF4444", // red-500
    },
  },
  dark: {
    name: "Oscuro",
    icon: "🌙",
    colors: {
      primary: "#EF4444", // red-500
      primaryHover: "#DC2626", // red-600
      secondary: "#A855F7", // purple-500
      background: "#0F172A", // slate-900
      surface: "#1E293B", // slate-800
      text: "#F1F5F9", // slate-100
      textSecondary: "#94A3B8", // slate-400
      border: "#334155", // slate-700
      success: "#22C55E", // green-500
      warning: "#FBB D24", // yellow-400
      error: "#F87171", // red-400
    },
  },
  auto: {
    name: "Automático",
    icon: "🔄",
    description: "Se adapta a la configuración de tu sistema",
  },
};

/**
 * Obtiene las clases de Tailwind según el tema actual
 */
export const getThemeClasses = (isDark) => ({
  // Backgrounds
  bgPrimary: isDark ? "bg-slate-900" : "bg-white",
  bgSecondary: isDark ? "bg-slate-800" : "bg-gray-50",
  bgTertiary: isDark ? "bg-slate-700" : "bg-white",
  bgHover: isDark ? "hover:bg-slate-700" : "hover:bg-gray-100",

  // Text
  textPrimary: isDark ? "text-slate-100" : "text-gray-900",
  textSecondary: isDark ? "text-slate-400" : "text-gray-600",
  textMuted: isDark ? "text-slate-500" : "text-gray-400",

  // Borders
  border: isDark ? "border-slate-700" : "border-gray-200",
  borderHover: isDark ? "hover:border-slate-600" : "hover:border-gray-300",

  // Inputs
  input: isDark
    ? "bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
  inputFocus: isDark
    ? "focus:border-red-500 focus:ring-red-500/20"
    : "focus:border-primary-500 focus:ring-primary-500/20",

  // Cards
  card: isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200",
  cardHover: isDark
    ? "hover:bg-slate-700 hover:border-slate-600"
    : "hover:bg-gray-50 hover:border-gray-300",

  // Buttons
  buttonPrimary: isDark
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white",
  buttonSecondary: isDark
    ? "bg-slate-700 hover:bg-slate-600 text-slate-100"
    : "bg-gray-100 hover:bg-gray-200 text-gray-900",
  buttonOutline: isDark
    ? "border-slate-600 text-slate-300 hover:bg-slate-800"
    : "border-gray-300 text-gray-700 hover:bg-gray-50",
});

/**
 * Hook personalizado para obtener clases de tema
 */
export const useThemeClasses = (isDark) => {
  return getThemeClasses(isDark);
};
