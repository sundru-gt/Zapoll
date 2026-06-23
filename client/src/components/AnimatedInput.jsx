import { motion } from 'framer-motion'

export default function AnimatedInput({ error, label, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="block mb-2 font-semibold text-sm text-gray-800">
          {label}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
          error
            ? 'border-red-500 focus:ring-red-600'
            : 'border-gray-300 focus:ring-blue-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs mt-1"
        >
          ⚠️ {error}
        </motion.p>
      )}
    </div>
  )
}