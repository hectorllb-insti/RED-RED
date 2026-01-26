"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Dices,
  Hash,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShoppingBag,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./ui/Avatar";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = actualTheme === "dark";

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Buscar", href: "/search", icon: Search },
    { name: "Tendencias", href: "/trending", icon: Hash },
    { name: "Mensajes", href: "/messages", icon: MessageCircle },
    { name: "Historias", href: "/stories", icon: Camera },
    { name: "Ruleta", href: "/roulette", icon: Dices },
    { name: "Perfil", href: `/profile/${user?.username}`, icon: User },
  ];

  // Agregar opción de Admin para admins y moderadores
  const adminNavigation =
    user?.role === "admin" || user?.role === "moderator"
      ? [{ name: "Admin", href: "/admin", icon: Shield }]
      : [];

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path.includes("/profile") && location.pathname.includes("/profile"))
    );
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${isDark
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-rose-50 via-white to-red-50"
        }`}
    >
      {/* 🌟 Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${isDark
            ? "bg-gradient-to-br from-red-900/20 to-rose-800/20"
            : "bg-gradient-to-br from-red-200/30 to-rose-300/30"
            }`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl ${isDark
            ? "bg-gradient-to-br from-rose-900/20 to-red-800/20"
            : "bg-gradient-to-br from-rose-200/30 to-red-300/30"
            }`}
        />
      </div>

      {/* 🎨 Header moderno con glassmorphism */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-2xl border-b-2 shadow-sm ${isDark
          ? "bg-slate-900/70 border-slate-700/60"
          : "bg-white/70 border-gray-300/60"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="flex justify-between items-center h-12 lg:h-14">
            {/* Logo con efecto */}
            <Link to="/" className="flex items-center">
              <motion.img
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                src="/logo.png"
                alt="RED-RED Logo"
                className="h-12 lg:h-14 w-auto cursor-pointer drop-shadow-2xl"
                style={{
                  imageRendering: "-webkit-optimize-contrast",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                  willChange: "transform",
                }}
              />
            </Link>

            {/* Barra de búsqueda mejorada - Escritorio */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <Link to="/search" className="w-full">
                <motion.div
                  whileHover={{ scale: 1.01, y: -1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                      className={`h-5 w-5 transition-colors duration-300 ${isDark
                        ? "text-slate-400 group-hover:text-red-400"
                        : "text-gray-600 group-hover:text-red-500"
                        }`}
                    />
                  </div>
                  <div
                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-2xl leading-5 backdrop-blur-sm cursor-pointer transition-all duration-300 text-sm font-medium ${isDark
                      ? "border-slate-700 group-hover:border-red-500 bg-slate-800/60 text-slate-300"
                      : "border-gray-200 group-hover:border-red-500 bg-white/60 text-gray-500"
                      }`}
                  >
                    Buscar usuarios, publicaciones...
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* NotificationCenter único - visible en escritorio y móvil */}
            <div className="flex items-center">
              <NotificationCenter />
            </div>

            {/* Acciones mejoradas - Escritorio */}
            <div className="hidden lg:flex items-center gap-3">
              {/* NotificationCenter movido fuera para evitar duplicación */}

              {/* Points Display - Clickable */}
              <Link to="/roulette">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-colors ${isDark
                    ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700"
                    : "bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100"
                    } font-bold text-sm`}>
                  <Trophy className="w-4 h-4" />
                  {user?.points || 0}
                </motion.div>
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle variant="compact" />

              <Link to="/settings">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-3 rounded-xl transition-all duration-300 ${isDark
                    ? "text-slate-400 hover:text-red-400"
                    : "text-gray-600 hover:text-red-600"
                    }`}
                  title="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
              </Link>

              <Link to={`/profile/${user?.username}`}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300"
                >
                  <Avatar
                    src={user?.profile_picture}
                    alt={user?.full_name}
                    size="sm"
                    online
                  />
                  <span
                    className={`text-sm font-semibold ${isDark
                      ? "bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"
                      }`}
                  >
                    {user?.full_name}
                  </span>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
                onClick={logout}
                className={`p-3 rounded-xl transition-all duration-300 ml-1 ${isDark
                  ? "text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-red-600 hover:to-rose-700"
                  : "text-gray-600 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600"
                  }`}
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Menú móvil toggle */}
            <div className="lg:hidden flex items-center gap-2">
              {/* NotificationCenter movido fuera para evitar duplicación */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl transition-colors ${isDark
                  ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t backdrop-blur-xl overflow-hidden ${isDark
                ? "border-slate-700 bg-slate-900/95"
                : "border-gray-200 bg-white/95"
                }`}
            >
              <div className="px-4 py-4 space-y-2">
                {/* Points Display Mobile */}
                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border mb-4 ${isDark
                  ? "bg-slate-800 border-slate-700 text-yellow-400"
                  : "bg-yellow-50 border-yellow-200 text-yellow-600"
                  } font-bold`}>
                  <Trophy className="w-5 h-5" />
                  {user?.points || 0} Puntos Disponibles
                </div>

                {/* Búsqueda móvil */}
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className={`block w-full pl-12 pr-4 py-3 border-2 rounded-2xl text-sm font-medium ${isDark
                      ? "border-slate-600 bg-slate-800 text-slate-400"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}>
                      Buscar...
                    </div>
                  </div>
                </Link>

                {/* Navegación móvil */}
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                        ? isDark
                          ? "bg-red-900/30 text-red-400"
                          : "bg-red-50 text-red-700"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-red-600" : ""}`}
                      />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Admin Navigation - Mobile */}
                {adminNavigation.length > 0 && (
                  <>
                    {adminNavigation.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                            ? isDark
                              ? "bg-indigo-900/30 text-indigo-400"
                              : "bg-indigo-50 text-indigo-700"
                            : isDark
                              ? "text-slate-300 hover:bg-slate-800"
                              : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${active ? "text-indigo-600" : ""
                              }`}
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </>
                )}

                <hr className={`my-2 ${isDark ? "border-slate-700" : "border-gray-200"}`} />

                {/* Perfil y configuración móvil */}
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Settings className="h-5 w-5" />
                  Configuración
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isDark
                    ? "text-red-400 hover:bg-red-900/30"
                    : "text-red-600 hover:bg-red-50"
                    }`}
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header >

      <div className="flex relative z-10">
        {/* 🎨 Sidebar mejorado - Solo escritorio */}
        <motion.nav
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className={`hidden lg:block fixed left-0 top-[4.25rem] h-[calc(100vh-4.25rem)] w-64 xl:w-72 backdrop-blur-2xl border-r-2 shadow-sm ${isDark
            ? "bg-gradient-to-b from-slate-900/90 to-slate-900/70 border-slate-700/60"
            : "bg-gradient-to-b from-white/90 to-white/70 border-gray-300/60"
            }`}
        >
          <div className="p-4 pt-8 space-y-3 overflow-y-auto h-full scrollbar-hide">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.08 + 0.3,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ x: 8 }}
                  className="relative"
                >
                  <Link
                    to={item.href}
                    className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden ${active
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                      : isDark
                        ? "text-slate-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:text-red-400"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600"
                      }`}
                  >
                    {/* Brillo en hover/active */}
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                    <motion.div
                      animate={
                        active
                          ? {
                            scale: [1, 1.08, 1],
                          }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative z-10"
                    >
                      <Icon
                        className={`h-5 w-5 transition-all duration-300 ${active
                          ? "text-white"
                          : "group-hover:scale-110 group-hover:text-red-600"
                          }`}
                      />
                    </motion.div>
                    <span
                      className={`relative z-10 ${active ? "text-white" : ""}`}
                    >
                      {item.name}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {/* Admin Navigation */}
            {adminNavigation.length > 0 && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                {adminNavigation.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: (navigation.length + index) * 0.08 + 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      whileHover={{ x: 8 }}
                      className="relative"
                    >
                      <Link
                        to={item.href}
                        className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden ${active
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600"
                          }`}
                      >
                        {active && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        )}

                        <motion.div
                          animate={
                            active
                              ? {
                                scale: [1, 1.08, 1],
                              }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative z-10"
                        >
                          <Icon
                            className={`h-5 w-5 transition-all duration-300 ${active
                              ? "text-white"
                              : "group-hover:scale-110 group-hover:text-indigo-600"
                              }`}
                          />
                        </motion.div>
                        <span
                          className={`relative z-10 ${active ? "text-white" : ""
                            }`}
                        >
                          {item.name}
                        </span>
                        {active && (
                          <motion.div
                            layoutId="adminActiveIndicator"
                            className="ml-auto w-2 h-2 bg-white rounded-full relative z-10"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>
        </motion.nav>

        {/* 🎨 Main Content con padding responsivo y espacio para header sticky */}
        <main className="flex-1 lg:ml-64 xl:ml-72 pt-[3.75rem]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div >
  );
};

export default Layout;
