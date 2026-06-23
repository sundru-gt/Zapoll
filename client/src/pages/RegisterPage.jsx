import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { handleApiError, validateEmail, validatePassword } from '../api/errorHandler'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors above')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)
      toast.success('Registration successful! Welcome to Zappoll 🎉')
      navigate('/dashboard')
    } catch (error) {
      if (error.includes('already exists')) {
        setErrors({ email: 'This email is already registered' })
        toast.error('Email already registered. Try logging in instead.')
      } else {
        handleApiError(error, 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-5">
      <div className="grid grid-cols-2 gap-12 max-w-4xl w-full items-center">
        {/* Left: Branding & Benefits */}
        <div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                Z
              </div>
              <span className="text-2xl font-bold text-gray-900">Zappoll</span>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">Join 1000+ Educators</p>
            <p className="text-base text-gray-600">Start creating amazing quizzes today</p>
          </div>

          <div className="mt-12 space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Create with AI</h3>
                <p className="text-gray-600 text-xs">Upload PDFs and let AI generate questions</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Host Live</h3>
                <p className="text-gray-600 text-xs">Engage students with real-time quizzes</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                📊
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Get Insights</h3>
                <p className="text-gray-600 text-xs">View live analytics and student performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">3 free quizzes, then upgrade when ready</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.name ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">⚠️ {errors.name}</p>}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.email ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">⚠️ {errors.email}</p>}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.password ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">⚠️ {errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                }}
                className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">⚠️ {errors.confirmPassword}</p>
              )}
            </div>

            <label
              className={`flex items-start gap-2 text-xs mt-4 pt-2 pb-2 cursor-pointer ${
                errors.terms ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  if (errors.terms) setErrors({ ...errors, terms: '' })
                }}
                className="mt-1 cursor-pointer"
              />
              <span>
                I agree to the <span className="text-blue-600 hover:underline">Terms of Service</span> and{' '}
                <span className="text-blue-600 hover:underline">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-red-600 text-xs">⚠️ {errors.terms}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold mt-6 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => toast('Google Sign-Up coming soon!', { icon: '🔜' })}
            disabled
            className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-500 rounded-lg font-semibold hover:bg-gray-100 cursor-not-allowed text-sm opacity-60"
            title="Coming in Day 30"
          >
            🔷 Sign up with Google (Coming Soon)
          </button>

          <div className="text-center mt-6 pt-6 border-t border-gray-200 text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}