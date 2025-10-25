import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirm: data.confirmPassword,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    if (result.success) {
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión");
      navigate("/login");
    } else {
      // Mostrar errores específicos del backend
      if (result.error && typeof result.error === "object") {
        // Si hay errores de campo específicos
        Object.keys(result.error).forEach((key) => {
          const messages = Array.isArray(result.error[key])
            ? result.error[key]
            : [result.error[key]];
          messages.forEach((msg) => {
            toast.error(`${key}: ${msg}`);
          });
        });
      } else {
        // Error general
        toast.error(result.error || "Error al registrarse");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              RED-RED
            </h2>
            <p className="mt-3 text-sm text-gray-600 font-medium">
              Crea tu cuenta
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    {...register("first_name", {
                      required: "El nombre es requerido",
                    })}
                    type="text"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                    placeholder="Juan"
                  />
                  {errors.first_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    {...register("last_name", {
                      required: "El apellido es requerido",
                    })}
                    type="text"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                    placeholder="Pérez"
                  />
                  {errors.last_name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de usuario
                </label>
                <input
                  {...register("username", {
                    required: "El nombre de usuario es requerido",
                    minLength: {
                      value: 3,
                      message: "Mínimo 3 caracteres",
                    },
                    maxLength: {
                      value: 30,
                      message: "Máximo 30 caracteres",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Solo letras, números y guión bajo",
                    },
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                  placeholder="juanperez"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.username.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Solo letras, números y guión bajo. Sin espacios.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  {...register("email", {
                    required: "El correo es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Correo inválido",
                    },
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                  placeholder="juan@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "Mínimo 8 caracteres",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Debe contener mayúsculas, minúsculas y números",
                    },
                  })}
                  type="password"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.password.message}
                  </p>
                )}
                {password && password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-1 flex-1 rounded ${
                          password.length >= 8 &&
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                            ? "bg-green-500"
                            : password.length >= 6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          password.length >= 8 &&
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                            ? "bg-green-500"
                            : password.length >= 6
                            ? "bg-yellow-500"
                            : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          password.length >= 8 &&
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {password.length >= 8 &&
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
                        ? "Contraseña fuerte ✓"
                        : password.length >= 6
                        ? "Contraseña media"
                        : "Contraseña débil"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                  type="password"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-gray-50 hover:bg-white"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
