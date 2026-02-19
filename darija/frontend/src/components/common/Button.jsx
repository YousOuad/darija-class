import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-300 shadow-md hover:shadow-lg',
  secondary: 'bg-terracotta-500 text-white hover:bg-terracotta-600 focus:ring-terracotta-300 shadow-md hover:shadow-lg',
  outline: 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 focus:ring-teal-300',
  ghost: 'text-teal-600 hover:bg-teal-50 focus:ring-teal-300',
  gold: 'bg-gold-300 text-dark hover:bg-gold-400 focus:ring-gold-200 shadow-md hover:shadow-lg',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300 shadow-md hover:shadow-lg',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
