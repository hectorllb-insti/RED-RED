import { motion } from "framer-motion";
import { forwardRef } from "react";

// 🎨 Input moderno con estados visuales

const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = "left",
      helper,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                className={`h-5 w-5 ${
                  hasError ? "text-red-400" : "text-gray-400"
                }`}
              />
            </div>
          )}

          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`
            block w-full rounded-xl transition-all duration-200
            ${Icon && iconPosition === "left" ? "pl-10" : "pl-4"}
            ${Icon && iconPosition === "right" ? "pr-10" : "pr-4"}
            py-3
            ${
              hasError
                ? "border-2 border-red-300 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                : "border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            }
            bg-white
            focus:outline-none
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
            {...props}
          />

          {Icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon
                className={`h-5 w-5 ${
                  hasError ? "text-red-400" : "text-gray-400"
                }`}
              />
            </div>
          )}
        </div>

        {(error || helper) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 text-sm ${
              hasError ? "text-red-600" : "text-gray-500"
            }`}
          >
            {error || helper}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
