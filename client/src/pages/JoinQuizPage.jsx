import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { handleApiError, validateQuizCode } from '../api/errorHandler'
import toast from 'react-hot-toast'

export default function JoinQuizPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!code.trim()) {
      newErrors.code = 'Please enter a quiz code'
    } else if (!validateQuizCode(code)) {
      newErrors.code = 'Code must be 6 alphanumeric characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleJoinQuiz = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.get(`/rooms/code/${code}`)
      const room = response.data.room

      if (!room) {
        toast.error('Quiz not found')
        return
      }

      sessionStorage.setItem('currentQuizRoom', JSON.stringify(room))

      toast.success('Quiz found! Ready to join? 🎯')
      navigate(`/room/${room._id}/quiz`, {
        state: { roomCode: code, roomId: room._id },
      })
    } catch (error) {
      handleApiError(error, 'Failed to find quiz.')
      setErrors({ code: 'Quiz code not found' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-4 md:p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-2xl mx-auto mb-4">
              Z
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Join Quiz</h1>
            <p className="text-gray-600 text-sm md:text-base">Enter the code to join a live quiz</p>
          </div>

          <form onSubmit={handleJoinQuiz} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Quiz Code</label>
              <input
                type="text"
                placeholder="ABC123"
                value={code.toUpperCase()}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  if (errors.code) setErrors({ code: '' })
                }}
                maxLength="6"
                className={`w-full px-4 py-3 md:py-4 border-2 rounded-lg text-center text-xl md:text-2xl font-bold tracking-widest bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition uppercase ${
                  errors.code ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.code && <p className="text-red-600 text-xs mt-2">⚠️ {errors.code}</p>}
              {!errors.code && (
                <p className="text-xs text-gray-500 mt-2">Enter the 6-character code from your instructor</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition transform hover:-translate-y-0.5 text-base md:text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Joining...
                </span>
              ) : (
                'Join Quiz'
              )}
            </button>
          </form>

          <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-semibold mb-4 uppercase">Why Join Zappoll</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Real-Time</p>
                  <p className="text-xs text-gray-600">Instant feedback and live results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">🏆</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Competitive</p>
                  <p className="text-xs text-gray-600">Live leaderboard and rankings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">📱</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Simple</p>
                  <p className="text-xs text-gray-600">Just enter a code and start</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}