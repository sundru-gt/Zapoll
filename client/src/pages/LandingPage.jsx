import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  if (user) {
    navigate('/dashboard')
  }

  return (
    <div className="bg-linear-to-b from-blue-50 to-white min-h-screen">
      {/* Premium Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              Z
            </div>
            <span className="text-2xl font-bold text-gray-900">Zappoll</span>
          </div>

          {/* Nav Links */}
          <div className="flex gap-8 items-center">
            <a href="#" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition">
              Features
            </a>
            <a href="#" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition">
              Pricing
            </a>
            <a href="#" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition">
              About
            </a>
          </div>

          {/* Right Side Buttons */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/join')}
              className="px-5 py-2 text-blue-600 text-sm font-semibold hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              Join Room
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-gray-700 text-sm font-semibold hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              ✨ AI-Powered Quizzes
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ask Anything.<br />Answer Live.
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Create engaging quizzes in seconds with AI. Host live interactive sessions. Watch students compete in
              real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>🚀</span>
                Get Started Free
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition cursor-pointer">
                <span>▶️</span>
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-8 mt-12 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span>Trusted by 1000+ educators</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-200 to-blue-100 rounded-3xl blur-3xl opacity-50"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8">
              <div className="space-y-6">
                {/* Feature Card 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📄
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">Upload PDF</h3>
                    <p className="text-gray-600 text-sm">AI generates questions instantly</p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">Live Quizzes</h3>
                    <p className="text-gray-600 text-sm">Real-time engagement with students</p>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📊
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">Instant Insights</h3>
                    <p className="text-gray-600 text-sm">See answer distribution live</p>
                  </div>
                </div>

                {/* Feature Card 4 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">Live Leaderboard</h3>
                    <p className="text-gray-600 text-sm">Real-time rankings & scores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-linear-to-r from-blue-100 to-blue-50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-700">1000+</div>
            <p className="text-gray-700 text-sm mt-2">Educators Using</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-700">50K+</div>
            <p className="text-gray-700 text-sm mt-2">Quizzes Created</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-700">500K+</div>
            <p className="text-gray-700 text-sm mt-2">Students Engaged</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-700">98%</div>
            <p className="text-gray-700 text-sm mt-2">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}