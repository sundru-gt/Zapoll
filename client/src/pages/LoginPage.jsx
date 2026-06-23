import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import { handleApiError, validateEmail, validatePassword } from '../api/errorHandler'
import AnimatedButton from '../components/AnimatedButton'
import AnimatedInput from '../components/AnimatedInput'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email'
    if (!password.trim()) newErrors.password = 'Password is required'
    else if (!validatePassword(password)) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back! 🎉')
      navigate('/dashboard')
    } catch (error) {
      handleApiError(error, 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full items-center">
        {/* Left Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              >
                Z
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">Zappoll</span>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">Welcome Back</p>
            <p className="text-base text-gray-600">Continue creating amazing quizzes</p>
          </div>

          <div className="mt-12 space-y-6">
            {[
              { icon: '📄', title: 'Upload PDF', sub: 'AI generates questions instantly' },
              { icon: '🎯', title: 'Live Quizzes', sub: 'Real-time engagement with students' },
              { icon: '🏆', title: 'Instant Results', sub: 'See leaderboards and scores live' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">{item.title}</h3>
                  <p className="text-gray-600 text-xs">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600 text-sm">Access your Zappoll account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              error={errors.email}
            />

            <AnimatedInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
            />

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input type="checkbox" className="cursor-pointer" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <AnimatedButton
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </AnimatedButton>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <AnimatedButton
            type="button"
            onClick={() => toast('Google Sign-In coming soon!', { icon: '🔜' })}
            disabled
            className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed text-sm opacity-60"
          >
            🔷 Continue with Google (Coming Soon)
          </AnimatedButton>

          <div className="text-center mt-6 pt-6 border-t border-gray-200 text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}