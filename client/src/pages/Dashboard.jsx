import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizLimit, setQuizLimit] = useState(null)

  useEffect(() => {
    fetchRooms()
    fetchQuizLimit()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get('/rooms')
      setRooms(response.data.rooms)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch quizzes')
      setLoading(false)
    }
  }

  const fetchQuizLimit = async () => {
    try {
      const response = await axiosInstance.get('/payments/can-create-quiz')
      setQuizLimit(response.data)
    } catch (error) {
      console.error('Failed to fetch quiz limit')
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return

    try {
      await axiosInstance.delete(`/rooms/${quizId}`)
      toast.success('Quiz deleted successfully')
      fetchRooms()
    } catch (error) {
      toast.error('Failed to delete quiz')
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Code ${code} copied to clipboard!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="text-2xl font-bold text-blue-600">Zappoll</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Quizzes</h1>
          <p className="text-gray-600">
            You have created {rooms.length} quiz(zes). {quizLimit?.quizzesRemaining} free remaining.
          </p>
        </div>

        {/* Stats */}
        {quizLimit && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Total Quizzes</div>
              <div className="text-3xl font-bold text-blue-600">{rooms.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Free Remaining</div>
              <div className="text-3xl font-bold text-green-600">{quizLimit.quizzesRemaining}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Paid Quizzes</div>
              <div className="text-3xl font-bold text-purple-600">{quizLimit.quizzesPaid}</div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="mb-8">
          {quizLimit?.canCreate ? (
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              + Create New Quiz
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">Quiz limit reached!</p>
              <p className="text-yellow-700 text-sm">
                Upgrade your plan to create more quizzes.
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>

        {/* Quiz Cards */}
        {rooms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-600 text-lg mb-4">No quizzes yet</p>
            <p className="text-gray-500 text-sm mb-6">Create your first quiz to get started!</p>
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {/* Card Header */}
                <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{room.title}</h3>
                    <p className="text-xs text-blue-100">{room.questions?.length || 0} questions</p>
                  </div>
                  <div className="text-xs bg-white/20 px-2 py-1 rounded w-fit font-mono">
                    Code: {room.code}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{room.participants?.length || 0} participants</span>
                      <span
                        className={`font-semibold ${
                          room.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}
                      >
                        {room.status === 'active' ? '🟢 Active' : '⚪ Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(room.code)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={() => navigate(`/room/${room._id}/host`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition"
                    >
                      ▶ Start
                    </button>
                  </div>

                  {/* More Actions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/room/${room._id}/edit`)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(room._id)}
                      className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 cursor-pointer transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}