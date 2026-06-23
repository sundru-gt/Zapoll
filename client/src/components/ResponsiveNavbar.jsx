import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function ResponsiveNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 px-6 py-4 justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-2xl font-bold text-blue-600">Zappoll</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-900 font-semibold text-sm">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            Z
          </div>
          <span className="text-xl font-bold text-blue-600">Zappoll</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 text-2xl cursor-pointer"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              navigate('/dashboard')
              setMobileMenuOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => {
              navigate('/create-quiz')
              setMobileMenuOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition"
          >
            + Create Quiz
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer transition"
          >
            Logout
          </button>
        </div>
      )}
    </>
  )
}