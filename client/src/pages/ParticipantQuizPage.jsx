import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function ParticipantQuizPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizEnded, setQuizEnded] = useState(false)
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
    } catch (error) {
      toast.error('Failed to load quiz')
      setLoading(false)
    }
  }

  const handleSelectAnswer = (answer) => {
    if (!submitted) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer')
      return
    }

    setSubmitted(true)
    setShowResult(true)
    setTimerActive(false)

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    if (isCorrect) {
      const timeBonus = Math.floor((timer / 30) * 50)
      const questionScore = 100 + timeBonus
      setScore(score + questionScore)
      toast.success(`Correct! +${questionScore} points`)
    } else {
      toast.error('Incorrect answer')
    }
  }

  const handleNextQuestion = () => {
    const questionIndex = room.questions.findIndex((q) => q._id === currentQuestion._id)

    if (questionIndex < room.questions.length - 1) {
      const nextQuestion = room.questions[questionIndex + 1]
      setCurrentQuestion(nextQuestion)
      setSelectedAnswer(null)
      setSubmitted(false)
      setShowResult(false)
      setTimer(30)
      setTimerActive(true)
    } else {
      setQuizEnded(true)
      setTimerActive(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Quiz not found</p>
      </div>
    )
  }

  if (!currentQuestion && !quizEnded) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md w-full mx-4">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{room.title}</h2>
          <p className="text-gray-600 mb-6">{room.questions?.length || 0} questions waiting</p>
          <button
            onClick={() => {
              setCurrentQuestion(room.questions[0])
              setTimer(30)
              setTimerActive(true)
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg cursor-pointer text-base md:text-lg transition"
          >
            ▶ Start Quiz
          </button>
        </div>
      </div>
    )
  }

  if (quizEnded) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md w-full mx-4">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-8">Your score will appear on the results page</p>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Your Score</p>
            <p className="text-4xl md:text-5xl font-bold text-blue-600">{score}</p>
            <p className="text-xs text-gray-500 mt-2">points</p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg cursor-pointer transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQuestionIndex = room.questions.findIndex((q) => q._id === currentQuestion._id)

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sticky top-0 z-40">
        <div className="w-full sm:w-auto">
          <p className="text-xs text-gray-600 truncate max-w-xs">{room.title}</p>
          <p className="text-base md:text-lg font-bold text-gray-900">
            Question {currentQuestionIndex + 1} of {room.questions.length}
          </p>
        </div>
        <div className="text-right self-end sm:self-auto">
          <p className="text-xs text-gray-600">Score</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{score}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-3 md:p-6">
        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-8 mb-4 md:mb-6">
          {/* Timer + Question */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3 sm:gap-4">
            <h2 className="text-base md:text-2xl font-bold text-gray-900 flex-1 leading-snug">
              {currentQuestion.text}
            </h2>
            <div
              className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-lg md:text-2xl border-4 flex-shrink-0 self-end sm:self-auto ${
                timer <= 10
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-blue-500 text-blue-600 bg-blue-50'
              }`}
            >
              {timer}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 md:mb-8">
            <div
              className="h-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${((30 - timer) / 30) * 100}%` }}
            ></div>
          </div>

          {/* Answer Options */}
          <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === option.text
              const isCorrect = option.text === currentQuestion.correctAnswer
              const isWrong = selectedAnswer === option.text && !isCorrect

              let bgColor = 'bg-white border-gray-300 hover:border-blue-400'
              let textColor = 'text-gray-900'

              if (showResult) {
                if (isCorrect) {
                  bgColor = 'bg-green-50 border-green-500'
                  textColor = 'text-green-900'
                } else if (isWrong) {
                  bgColor = 'bg-red-50 border-red-500'
                  textColor = 'text-red-900'
                } else {
                  bgColor = 'bg-gray-50 border-gray-300'
                  textColor = 'text-gray-600'
                }
              } else if (isSelected) {
                bgColor = 'bg-blue-50 border-blue-500'
                textColor = 'text-blue-900'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option.text)}
                  disabled={submitted}
                  className={`w-full p-3 md:p-4 rounded-lg border-2 text-left font-semibold transition cursor-pointer text-sm md:text-base ${bgColor} ${textColor} ${
                    submitted ? 'cursor-not-allowed opacity-75' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-current flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option.text}</span>
                    {showResult && isCorrect && <span className="ml-auto text-base md:text-lg">✓</span>}
                    {showResult && isWrong && <span className="ml-auto text-base md:text-lg">✗</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQuestion.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-blue-900">
                <span className="font-bold">💡 Explanation:</span> {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Button */}
          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm md:text-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            >
              ✓ Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold text-sm md:text-base hover:shadow-lg cursor-pointer transition"
            >
              {currentQuestionIndex < room.questions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}