import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Theme puede ser: 'light', 'dark', 'auto'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const [actualTheme, setActualTheme] = useState("light");

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      if (theme === "auto") {
        const newTheme = e.matches ? "dark" : "light";
        setActualTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Aplicar tema al cargar y cuando cambie
  useEffect(() => {
    let themeToApply = theme;

    if (theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      themeToApply = prefersDark ? "dark" : "light";
    }

    setActualTheme(themeToApply);
    applyTheme(themeToApply);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const applyTheme = (themeToApply) => {
    const root = window.document.documentElement;

    if (themeToApply === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const changeTheme = (newTheme) => {
    if (["light", "dark", "auto"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    const themeOrder = ["light", "dark", "auto"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    changeTheme(themeOrder[nextIndex]);
  };

  const value = {
    theme, // Tema configurado por el usuario: 'light', 'dark', 'auto'
    actualTheme, // Tema real aplicado: 'light' o 'dark'
    changeTheme,
    toggleTheme,
    isDark: actualTheme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
