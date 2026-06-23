import { motion } from 'framer-motion'

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}