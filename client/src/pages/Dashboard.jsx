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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            Z
          </div>
          <span className="text-2xl font-bold text-blue-600">Zappoll</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-gray-900 font-semibold text-sm">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer transition transform hover:-translate-y-0.5"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Quizzes</h1>
          <p className="text-gray-600 text-lg">
            You have created{' '}
            <span className="font-semibold text-blue-600">{rooms.length}</span> quiz(zes).{' '}
            <span className="font-semibold text-green-600">{quizLimit?.quizzesRemaining}</span> free
            remaining.
          </p>
        </div>

        {/* Stats Cards */}
        {quizLimit && (
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Total Quizzes</p>
                  <p className="text-4xl font-bold text-blue-600">{rooms.length}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Free Remaining</p>
                  <p className="text-4xl font-bold text-green-600">
                    {quizLimit.quizzesRemaining}
                  </p>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Paid Quizzes</p>
                  <p className="text-4xl font-bold text-purple-600">{quizLimit.quizzesPaid}</p>
                </div>
                <div className="text-4xl">💎</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Button & Upgrade */}
        <div className="mb-10 flex gap-4">
          {quizLimit?.canCreate ? (
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer text-lg"
            >
              + Create New Quiz
            </button>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-yellow-900 font-bold text-lg mb-1">⚠️ Quiz Limit Reached</p>
                  <p className="text-yellow-800">
                    You've used all your free quizzes. Upgrade your plan to create more.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/upgrade')}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 cursor-pointer whitespace-nowrap ml-4 transition"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Cards Grid */}
        {rooms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-900 text-2xl font-bold mb-2">No quizzes yet</p>
            <p className="text-gray-600 text-lg mb-8">
              Create your first quiz to get started and engage your students!
            </p>
            <button
              onClick={() => navigate('/create-quiz')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer text-lg transition"
            >
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
              >
                {/* Card Header - Gradient */}
                <div className="h-28 bg-linear-to-br from-blue-500 via-blue-600 to-blue-700 p-5 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{room.title}</h3>
                    {room.description && (
                      <p className="text-xs text-blue-100 mt-1 line-clamp-1">{room.description}</p>
                    )}
                  </div>
                  <div className="text-xs bg-white/20 backdrop-blur px-3 py-1.5 rounded-full w-fit font-mono font-semibold">
                    📌 {room.code}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Stats Row */}
                  <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{room.questions?.length || 0}</p>
                        <p className="text-xs text-gray-500">Questions</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200"></div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{room.participants?.length || 0}</p>
                        <p className="text-xs text-gray-500">Participants</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          room.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : room.status === 'ended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {room.status === 'active' ? '🟢 Active' : room.status === 'ended' ? '🔴 Ended' : '⚪ Draft'}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => navigate(`/room/${room._id}/host`)}
                    className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-md transition transform hover:-translate-y-0.5 cursor-pointer mb-3 text-center"
                  >
                    ▶ Host Quiz
                  </button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopyCode(room.code)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition text-center"
                      title="Copy quiz code"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={() => navigate(`/room/${room._id}/edit`)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer transition text-center"
                      title="Edit quiz"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteQuiz(room._id)}
                    className="w-full mt-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 cursor-pointer transition"
                    title="Delete quiz"
                  >
                    🗑️ Delete Quiz
                  </button>

                  {/* Access Type Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Access Type</p>
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        room.accessType === 'public'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {room.accessType === 'public' ? '🌐 Public' : '🔒 Whitelist'}
                    </div>
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