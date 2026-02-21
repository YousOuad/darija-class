import { motion } from 'framer-motion';

const paddingVariants = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  animate = true,
}) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        ...(hover ? { whileHover: { y: -4, shadow: '0 20px 40px rgba(0,0,0,0.1)' } } : {}),
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md border border-sand-100
        transition-shadow duration-300
        ${hover ? 'cursor-pointer hover:shadow-xl' : ''}
        ${paddingVariants[padding]}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
