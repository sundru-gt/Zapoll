import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function HostQuizPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responseStats, setResponseStats] = useState({})
  const [participants, setParticipants] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [timer, setTimer] = useState(30)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    fetchRoom()
  }, [roomId])

  useEffect(() => {
    if (!timerActive || timer === 0) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timer])

  const fetchRoom = async () => {
    try {
      const response = await axiosInstance.get(`/rooms/${roomId}`)
      setRoom(response.data.room)
      setLoading(false)
      initializeResponseStats(response.data.room)
    } catch (error) {
      toast.error('Failed to load quiz')
      setLoading(false)
    }
  }

  const initializeResponseStats = (roomData) => {
    if (roomData.questions?.length > 0) {
      const firstQuestion = roomData.questions[0]
      const stats = {}
      firstQuestion.options?.forEach((opt) => {
        stats[opt.text] = 0
      })
      setResponseStats(stats)
    }
  }

  const handleStartQuiz = () => {
    if (!room?.questions?.length) {
      toast.error('Add questions to start quiz')
      return
    }
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setTimer(30)
    setTimerActive(true)
    toast.success('Quiz started! 🎯')
  }

  const handleDisplayQuestion = () => {
    if (currentQuestionIndex < room.questions.length) {
      const question = room.questions[currentQuestionIndex]
      initializeResponseStats(room)
      setShowResults(false)
      setTimer(30)
      setTimerActive(true)
      toast.success(`Question ${currentQuestionIndex + 1} displayed`)
    }
  }

  const handleShowResults = () => {
    setShowResults(true)
    setTimerActive(false)
    toast.success('Results shown to all participants')
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < room.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowResults(false)
      setTimer(30)
      setTimerActive(true)
      toast.success('Next question loaded')
    } else {
      toast.error('This is the last question')
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowResults(false)
      setTimer(30)
      setTimerActive(true)
      toast.success('Previous question loaded')
    }
  }

  const handleEndQuiz = () => {
    if (window.confirm('End quiz and show final results?')) {
      setQuizStarted(false)
      setShowResults(true)
      setTimerActive(false)
      toast.success('Quiz ended!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    )
  }

  const currentQuestion = room.questions?.[currentQuestionIndex]

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <p className="text-sm text-gray-400">{room.title}</p>
          {quizStarted && (
            <p className="text-lg font-bold">
              Question {currentQuestionIndex + 1} of {room.questions?.length || 0}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Participants Online</p>
          <p className="text-3xl font-bold text-green-400">24</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6 p-8 h-[calc(100vh-100px)]">
        {/* Left: Question & Chart (2 columns) */}
        <div className="col-span-2 flex flex-col gap-6">
          {!quizStarted ? (
            // Start Screen
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 flex flex-col items-center justify-center flex-1">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-2">Ready to Start?</h2>
              <p className="text-gray-400 mb-8">
                {room.questions?.length || 0} questions waiting
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-linear-to-r from-green-600 to-green-700 rounded-lg font-bold hover:shadow-lg cursor-pointer text-lg"
              >
                ▶ Start Quiz
              </button>
            </div>
          ) : (
            <>
              {/* Question Box */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
                <h2 className="text-2xl font-bold mb-8">{currentQuestion?.text}</h2>

                {/* Options with Live Chart */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {currentQuestion?.options?.map((option, index) => {
                    const responseCount = responseStats[option.text] || 0
                    const totalResponses = Object.values(responseStats).reduce(
                      (a, b) => a + b,
                      0
                    )
                    const percentage =
                      totalResponses > 0 ? ((responseCount / totalResponses) * 100).toFixed(0) : 0

                    const isCorrect = option.isCorrect

                    return (
                      <div
                        key={index}
                        className={`bg-gray-700 p-4 rounded-lg border-2 ${
                          isCorrect && showResults
                            ? 'border-green-500'
                            : showResults
                              ? 'border-red-500'
                              : 'border-gray-600'
                        }`}
                      >
                        <p className="font-semibold mb-3">
                          {String.fromCharCode(65 + index)}. {option.text}
                        </p>
                        <div className="w-full bg-gray-600 rounded-full h-6 overflow-hidden mb-2">
                          <div
                            style={{
                              width: `${percentage}%`,
                            }}
                            className="h-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2"
                          >
                            {percentage > 10 && (
                              <span className="text-xs font-bold text-white">{percentage}%</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{responseCount} responses</span>
                          {isCorrect && showResults && (
                            <span className="text-green-400 font-bold">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {showResults && currentQuestion?.explanation && (
                  <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">💡 Explanation:</span> {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold cursor-pointer transition"
                >
                  ← Previous
                </button>

                {!showResults ? (
                  <button
                    onClick={handleShowResults}
                    className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-green-700 hover:shadow-lg rounded-lg font-semibold cursor-pointer"
                  >
                    ✓ Show Results
                  </button>
                ) : (
                  <button
                    onClick={() => setShowResults(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold cursor-pointer"
                  >
                    Hide Results
                  </button>
                )}

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === (room.questions?.length || 1) - 1}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold cursor-pointer transition"
                >
                  Next →
                </button>

                <button
                  onClick={handleEndQuiz}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold cursor-pointer"
                >
                  End Quiz
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Leaderboard & Timer */}
        <div className="flex flex-col gap-6">
          {/* Timer */}
          {quizStarted && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
              <p className="text-sm text-gray-400 mb-2">Time Remaining</p>
              <div
                className={`text-5xl font-bold mb-2 ${
                  timer <= 10 ? 'text-red-500' : 'text-yellow-400'
                }`}
              >
                {timer}
              </div>
              <p className="text-xs text-gray-400">seconds</p>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex-1 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Live Leaderboard</h3>

            <div className="space-y-2">
              {/* Rank 1 */}
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border-l-4 border-yellow-400">
                <div className="text-2xl font-bold text-yellow-400">1</div>
                <div className="flex-1">
                  <p className="font-semibold">Alice</p>
                  <p className="text-xs text-gray-400">3/3 correct</p>
                </div>
                <p className="font-bold text-lg">310</p>
              </div>

              {/* Rank 2 */}
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border-l-4 border-gray-300">
                <div className="text-2xl font-bold text-gray-300">2</div>
                <div className="flex-1">
                  <p className="font-semibold">Bob</p>
                  <p className="text-xs text-gray-400">2/3 correct</p>
                </div>
                <p className="font-bold text-lg">207</p>
              </div>

              {/* Rank 3 */}
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border-l-4 border-orange-600">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="flex-1">
                  <p className="font-semibold">Charlie</p>
                  <p className="text-xs text-gray-400">2/3 correct</p>
                </div>
                <p className="font-bold text-lg">195</p>
              </div>

              {/* More Ranks */}
              {[4, 5].map((rank) => (
                <div key={rank} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <div className="text-xl font-bold text-gray-500">{rank}</div>
                  <div className="flex-1">
                    <p className="font-semibold">Participant {rank}</p>
                    <p className="text-xs text-gray-400">1/3 correct</p>
                  </div>
                  <p className="font-bold">{150 - rank * 10}</p>
                </div>
              ))}

              <div className="text-center py-4 border-t border-gray-600 text-gray-400 text-sm">
                + 19 more participants
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}