import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ showLabel = false, variant = "button" }) => {
  const { theme, changeTheme, actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: "light", icon: Sun, label: "Claro", color: "text-amber-500" },
    { value: "dark", icon: Moon, label: "Oscuro", color: "text-blue-500" },
    {
      value: "auto",
      icon: Monitor,
      label: "Automático",
      color: "text-purple-500",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  if (variant === "compact") {
    // Botón compacto para el header/navbar
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-2 rounded-lg transition-all duration-300
            ${
              actualTheme === "dark"
                ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }
          `}
          title={`Tema: ${currentTheme?.label}`}
        >
          <CurrentIcon className="h-5 w-5" />
        </button>

        {isOpen && (
          <>
            {/* Overlay para cerrar al hacer clic fuera */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menú desplegable */}
            <div
              className={`
              absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-20 overflow-hidden
              border animate-slide-down
              ${
                actualTheme === "dark"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }
            `}
            >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isSelected = theme === themeOption.value;

                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      changeTheme(themeOption.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 transition-all
                      ${
                        actualTheme === "dark"
                          ? "hover:bg-slate-700 text-slate-200"
                          : "hover:bg-gray-50 text-gray-700"
                      }
                      ${
                        isSelected
                          ? actualTheme === "dark"
                            ? "bg-slate-700/50"
                            : "bg-primary-50"
                          : ""
                      }
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected ? themeOption.color : ""
                      }`}
                    />
                    <span className="flex-1 text-left font-medium">
                      {themeOption.label}
                    </span>
                    {isSelected && <span className="text-primary-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === "segmented") {
    // Control segmentado para configuraciones
    return (
      <div
        className={`
        inline-flex rounded-lg p-1 gap-1
        ${
          actualTheme === "dark"
            ? "bg-slate-800 border border-slate-700"
            : "bg-gray-100 border border-gray-200"
        }
      `}
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;

          return (
            <button
              key={themeOption.value}
              onClick={() => changeTheme(themeOption.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm
                ${
                  isSelected
                    ? actualTheme === "dark"
                      ? "bg-slate-700 text-white shadow-md"
                      : "bg-white text-primary-600 shadow-md"
                    : actualTheme === "dark"
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
              title={themeOption.label}
            >
              <Icon className="h-4 w-4" />
              {showLabel && <span>{themeOption.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // Botón por defecto
  return (
    <button
      onClick={() => {
        const themeOrder = ["light", "dark", "auto"];
        const currentIndex = themeOrder.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        changeTheme(themeOrder[nextIndex]);
      }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
        ${
          actualTheme === "dark"
            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }
      `}
      title={`Cambiar tema (actual: ${currentTheme?.label})`}
    >
      <CurrentIcon className="h-5 w-5" />
      {showLabel && <span className="font-medium">{currentTheme?.label}</span>}
    </button>
  );
};

export default ThemeToggle;
