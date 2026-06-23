import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  if (user) {
    navigate('/dashboard')
  }

  const features = [
    {
      icon: '📄',
      title: 'Upload any PDF',
      desc: 'Drop in a document — AI generates quiz questions in seconds.',
    },
    {
      icon: '🎯',
      title: 'Host live sessions',
      desc: 'Share a room code. Students join instantly, no accounts needed.',
    },
    {
      icon: '📊',
      title: 'See it unfold live',
      desc: 'Watch answer distributions shift in real time as students respond.',
    },
    {
      icon: '🏆',
      title: 'Live leaderboard',
      desc: 'Scores update instantly. Speed and accuracy both count.',
    },
  ]

  const stats = [
    { value: '1,000+', label: 'Educators' },
    { value: '50K+', label: 'Quizzes created' },
    { value: '500K+', label: 'Students engaged' },
    { value: '98%', label: 'Satisfaction' },
  ]

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* ── Navbar ── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Zappoll</span>
          </div>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition">Features</a>
            <a href="#stats" className="text-sm text-gray-500 hover:text-gray-900 transition">Pricing</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition">About</a>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/join')}
              className="hidden sm:block px-4 py-1.5 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              Join Room
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block px-4 py-1.5 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
              ✨ AI-Powered Quizzes
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Ask anything.<br />
              <span className="text-blue-600">Answer live.</span>
            </h1>

            <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Turn any document into a live quiz. Share a code. Watch your class compete in real time — no setup, no friction.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-md hover:shadow-lg cursor-pointer"
              >
                🚀 Get Started Free
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 rounded-xl font-semibold text-sm transition cursor-pointer">
                ▶ Watch Demo
              </button>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <span>📚</span> Trusted by 1,000+ educators
              </span>
              <span className="flex items-center gap-1.5">
                <span>⭐</span> 4.9 / 5 rating
              </span>
            </div>
          </div>

          {/* Right — feature preview card */}
          <div className="relative">
            {/* Soft glow */}
            <div className="absolute -inset-4 bg-blue-100 rounded-3xl blur-2xl opacity-40 pointer-events-none" />

            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-xl p-6 md:p-8 space-y-5">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}

              {/* Live badge */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">3 live quizzes happening now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section id="stats" className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature detail section ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Everything you need to run great quizzes
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-3 max-w-xl mx-auto">
            Built for classrooms, training sessions, and team trivia — Zappoll keeps it fast and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition group"
            >
              <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4 transition">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-blue-600 py-14 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
            Ready to run your first quiz?
          </h2>
          <p className="text-blue-200 text-sm md:text-base mb-8">
            Free forever for individuals. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition cursor-pointer shadow"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/join')}
              className="w-full sm:w-auto px-8 py-3 border border-blue-400 text-white rounded-xl font-semibold text-sm hover:bg-blue-500 transition cursor-pointer"
            >
              Join a Room
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">Z</div>
            <span className="font-semibold text-gray-600">Zappoll</span>
          </div>
          <span>© {new Date().getFullYear()} Zappoll. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600 transition">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition">Terms</a>
            <a href="#" className="hover:text-gray-600 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}