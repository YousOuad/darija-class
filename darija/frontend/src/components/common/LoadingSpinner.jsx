import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.div
        className={`${sizes[size]} rounded-full border-4 border-sand-200 border-t-teal-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-dark-300 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}
