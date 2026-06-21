import { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-linear-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-5">
      <div className="grid grid-cols-2 gap-12 max-w-4xl w-full items-center">
        {/* Left: Branding & Benefits */}
        <div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                Z
              </div>
              <span className="text-2xl font-bold text-gray-900">Zappoll</span>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">Join 1000+ Educators</p>
            <p className="text-base text-gray-600">Start creating amazing quizzes today</p>
          </div>

          <div className="mt-12 space-y-6">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Create with AI</h3>
                <p className="text-gray-600 text-xs">Upload PDFs and let AI generate questions</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Host Live</h3>
                <p className="text-gray-600 text-xs">Engage students with real-time quizzes</p>
              </div>
            </div>

            {/* Benefit 3 */}
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
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-800">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 text-xs text-gray-600 mt-3 cursor-pointer">
              <input type="checkbox" required className="mt-1 cursor-pointer" />
              <span>
                I agree to the <span className="text-blue-600 hover:underline">Terms of Service</span> and{' '}
                <span className="text-blue-600 hover:underline">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold mt-6 hover:shadow-lg transition disabled:opacity-50 transform hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Button */}
          <button className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition cursor-pointer text-sm">
            🔷 Sign up with Google
          </button>

          {/* Login Link */}
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