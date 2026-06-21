import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-2xl font-bold text-blue-600">Zappoll</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">{user?.name}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Quizzes</h1>
        <p className="text-gray-600 mb-8">You have created 0 quizzes. 3 free remaining.</p>

        {/* Coming Soon */}
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Dashboard</p>
        </div>
      </div>
    </div>
  )
}