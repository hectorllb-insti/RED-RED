"use client"

import { motion } from "framer-motion"
import { Heart, Lock, Mail, MessageCircle, Sparkles, Users } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const result = await login(data.email, data.password)

      if (result.success) {
        toast.success("¡Bienvenido de vuelta!")
      } else {
        toast.error(result.error || "Error al iniciar sesión. Verifica tus credenciales.")
      }
    } catch (error) {
      console.error("Error en login:", error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  // Animaciones de partículas flotantes
  const floatingIcons = [
    { Icon: Heart, delay: 0, duration: 3, left: 10, top: 20 },
    { Icon: Users, delay: 0.5, duration: 4, left: 70, top: 15 },
    { Icon: MessageCircle, delay: 1, duration: 3.5, left: 85, top: 60 },
    { Icon: Sparkles, delay: 1.5, duration: 3, left: 15, top: 70 },
    { Icon: Heart, delay: 0.8, duration: 3.2, left: 5, top: 50 },
    { Icon: Users, delay: 1.2, duration: 3.8, left: 90, top: 30 },
    { Icon: MessageCircle, delay: 0.3, duration: 4.2, left: 25, top: 10 },
    { Icon: Sparkles, delay: 1.8, duration: 3.3, left: 80, top: 80 },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, delay, duration, left, top }, index) => (
          <motion.div
            key={index}
            className="absolute text-red-400/40"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              x: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
              y: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={48} strokeWidth={1.5} />
          </motion.div>
        ))}
        
        {/* Círculos decorativos */}
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 bg-red-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Tarjeta principal con animación de entrada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden"
          style={{
            boxShadow: '0 -10px 40px -10px rgba(239, 68, 68, 0.3), 0 20px 40px -10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Efecto de brillo en el borde */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
              zIndex: 0,
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Logo y título */}
          <motion.div
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src="/logo.png"
                alt="RED-RED Logo"
                className="h-20 w-20 object-contain drop-shadow-lg"
                animate={{
                  filter: [
                    "drop-shadow(0 0 10px rgba(239, 68, 68, 0.3))",
                    "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))",
                    "drop-shadow(0 0 10px rgba(239, 68, 68, 0.3))",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-rose-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Bienvenido a RED-RED
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-sm text-gray-600 font-medium"
            >
              Conecta con el mundo
            </motion.p>
          </motion.div>

          {/* Formulario */}
          <form className="space-y-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-red-400 group-focus-within:text-red-500 transition-all duration-300 pointer-events-none z-10"
                  size={20}
                />
                <motion.input
                  {...register("email", {
                    required: "El correo es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Correo inválido",
                    },
                  })}
                  type="email"
                  className="appearance-none relative block w-full pl-11 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50/50 hover:bg-white hover:border-red-200 focus:bg-white hover:shadow-lg hover:shadow-red-500/10"
                  placeholder="tu@ejemplo.com"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Campo Contraseña */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-red-400 group-focus-within:text-red-500 transition-all duration-300 pointer-events-none z-10"
                  size={20}
                />
                <motion.input
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                  type="password"
                  className="appearance-none relative block w-full pl-11 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50/50 hover:bg-white hover:border-red-200 focus:bg-white hover:shadow-lg hover:shadow-red-500/10"
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Botón Submit */}
            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 transition-all overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.4), 0 10px 10px -5px rgba(239, 68, 68, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Partículas flotantes */}
                <motion.div
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ left: "20%", bottom: 0, pointerEvents: "none" }}
                  animate={{
                    y: [-20, -60],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ left: "50%", bottom: 0, pointerEvents: "none" }}
                  animate={{
                    y: [-20, -60],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.6,
                  }}
                />
                <motion.div
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ left: "80%", bottom: 0, pointerEvents: "none" }}
                  animate={{
                    y: [-20, -60],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 1.2,
                  }}
                />
                
                {/* Efecto de brillo en el botón */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ pointerEvents: "none" }}
                  animate={{
                    x: loading ? ["-100%", "100%"] : "-100%",
                  }}
                  transition={{
                    duration: 1,
                    repeat: loading ? Infinity : 0,
                    ease: "linear",
                  }}
                />
                
                <span className="relative flex items-center gap-2">
                  {loading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  )}
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </span>
              </motion.button>
            </motion.div>

            {/* Link de registro */}
            <div className="text-center pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </form>
        </motion.div>

        {/* Texto inferior */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          La red social donde tus conexiones importan ❤️
        </motion.p>
      </div>
    </div>
  )
}

export default Login
