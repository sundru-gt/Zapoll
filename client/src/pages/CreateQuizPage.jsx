import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { handleApiError } from '../api/errorHandler'
import toast from 'react-hot-toast'

export default function CreateQuizPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('manual')

  // Quiz Info State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [accessType, setAccessType] = useState('public')
  const [allowedEmails, setAllowedEmails] = useState('')
  const [errors, setErrors] = useState({})

  // Manual Quiz State
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [loading, setLoading] = useState(false)

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Validation Functions
  const validateQuizInfo = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Quiz title is required'
    } else if (title.trim().length < 3) {
      newErrors.title = 'Quiz title must be at least 3 characters'
    }

    if (accessType === 'whitelist' && allowedEmails.trim() === '') {
      newErrors.allowedEmails = 'Please add at least one email for whitelist mode'
    }

    if (accessType === 'whitelist' && allowedEmails.trim() !== '') {
      const emails = allowedEmails.split(',').map((e) => e.trim())
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      for (let email of emails) {
        if (!emailRegex.test(email)) {
          newErrors.allowedEmails = `Invalid email: ${email}`
          break
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateQuestion = () => {
    const newErrors = {}

    if (!currentQuestion.trim()) {
      newErrors.question = 'Please enter a question'
    } else if (currentQuestion.trim().length < 5) {
      newErrors.question = 'Question must be at least 5 characters'
    }

    if (options.some((opt) => !opt.trim())) {
      newErrors.options = 'Please fill all answer options'
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  // Manual Quiz Handlers
  const handleAddQuestion = () => {
    const { isValid, errors: questionErrors } = validateQuestion()

    if (!isValid) {
      setErrors(questionErrors)
      Object.values(questionErrors).forEach((error) => {
        toast.error(`⚠️ ${error}`)
      })
      return
    }

    const newQuestion = {
      text: currentQuestion,
      options: options.map((opt) => ({ text: opt, isCorrect: false })),
      correctAnswer: options[correctAnswer],
      explanation: '',
    }

    newQuestion.options[correctAnswer].isCorrect = true

    setQuestions([...questions, newQuestion])
    setCurrentQuestion('')
    setOptions(['', '', '', ''])
    setCorrectAnswer(0)
    setErrors({})
    toast.success(`✅ Question added! (${questions.length + 1} total)`)
  }

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
    toast.success('Question removed')
  }

  const handleCreateQuiz = async () => {
    // Validate quiz info
    if (!validateQuizInfo()) {
      toast.error('Please fix the errors above')
      return
    }

    // Validate questions
    if (questions.length === 0) {
      toast.error('⚠️ Please add at least one question')
      return
    }

    setLoading(true)

    try {
      const payload = {
        title,
        description,
        accessType,
        allowedEmails:
          accessType === 'whitelist' ? allowedEmails.split(',').map((e) => e.trim()) : [],
        questions,
      }

      await axiosInstance.post('/rooms', payload)
      toast.success('🎉 Quiz created successfully!')
      navigate('/dashboard')
    } catch (error) {
      handleApiError(error, 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  // PDF Upload Handler
  const handlePdfUpload = async () => {
    // Validate quiz info
    if (!validateQuizInfo()) {
      toast.error('Please fix the errors above')
      return
    }

    if (!pdfFile) {
      toast.error('⚠️ Please select a PDF file')
      return
    }

    // Validate file type
    if (!pdfFile.type.includes('pdf')) {
      toast.error('⚠️ Please upload a valid PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (pdfFile.size > 5 * 1024 * 1024) {
      toast.error('⚠️ File size must be less than 5MB')
      return
    }

    if (questionCount < 1 || questionCount > 20) {
      toast.error('⚠️ Question count must be between 1 and 20')
      return
    }

    setPdfLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('accessType', accessType)
      formData.append('questionCount', questionCount)

      if (accessType === 'whitelist') {
        formData.append(
          'allowedEmails',
          allowedEmails
            .split(',')
            .map((e) => e.trim())
            .join(',')
        )
      }

      formData.append('pdf', pdfFile)

      const response = await axiosInstance.post('/rooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('🎉 Quiz created from PDF!')
      navigate('/dashboard')
    } catch (error) {
      handleApiError(error, 'Failed to create quiz from PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 text-2xl cursor-pointer transition"
            title="Back to dashboard"
          >
            ←
          </button>
          <span className="text-2xl font-bold text-blue-600">Create Quiz</span>
        </div>
        <p className="text-sm text-gray-600">
          {activeTab === 'manual' ? `${questions.length} questions added` : 'Upload PDF'}
        </p>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-10">
        {/* Quiz Info Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Details</h2>

          <div className="space-y-4 mb-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Quiz Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Biology 101, Physics Chapter 3"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.title ? 'border-red-500 focus:ring-red-600' : 'border-gray-300 focus:ring-blue-600'
                }`}
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">⚠️ {errors.title}</p>}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                placeholder="Optional description (e.g., Chapter topic, learning objectives)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - helps students understand the quiz topic</p>
            </div>

            {/* Access Type Radio */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Access Type</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="public"
                    checked={accessType === 'public'}
                    onChange={(e) => {
                      setAccessType(e.target.value)
                      if (errors.allowedEmails) setErrors({ ...errors, allowedEmails: '' })
                    }}
                    className="cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">
                    Public
                    <span className="text-xs text-gray-500 block">(Anyone with code can join)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="whitelist"
                    checked={accessType === 'whitelist'}
                    onChange={(e) => {
                      setAccessType(e.target.value)
                      if (errors.allowedEmails) setErrors({ ...errors, allowedEmails: '' })
                    }}
                    className="cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">
                    Whitelist
                    <span className="text-xs text-gray-500 block">(Only specific emails)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Whitelist Emails Input */}
            {accessType === 'whitelist' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Allowed Emails <span className="text-red-600">*</span>
                </label>
                <textarea
                  placeholder="user1@example.com, user2@example.com, user3@example.com"
                  value={allowedEmails}
                  onChange={(e) => {
                    setAllowedEmails(e.target.value)
                    if (errors.allowedEmails) setErrors({ ...errors, allowedEmails: '' })
                  }}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                    errors.allowedEmails
                      ? 'border-red-500 focus:ring-red-600'
                      : 'border-gray-300 focus:ring-blue-600'
                  }`}
                />
                {errors.allowedEmails && (
                  <p className="text-red-600 text-xs mt-1">⚠️ {errors.allowedEmails}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Enter emails separated by commas</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✍️ Manual Questions
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            📄 Upload PDF
          </button>
        </div>

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-8">
            {/* Question Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Add Questions</h3>

              <div className="space-y-4 mb-6">
                {/* Question Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Question</label>
                  <input
                    type="text"
                    placeholder="e.g., What is the capital of France?"
                    value={currentQuestion}
                    onChange={(e) => {
                      setCurrentQuestion(e.target.value)
                      if (errors.question) setErrors({ ...errors, question: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                      errors.question
                        ? 'border-red-500 focus:ring-red-600'
                        : 'border-gray-300 focus:ring-blue-600'
                    }`}
                  />
                  {errors.question && <p className="text-red-600 text-xs mt-1">⚠️ {errors.question}</p>}
                </div>

                {/* Options Input */}
                {options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Option {index + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Enter option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options]
                          newOptions[index] = e.target.value
                          setOptions(newOptions)
                          if (errors.options) setErrors({ ...errors, options: '' })
                        }}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.options
                            ? 'border-red-500 focus:ring-red-600'
                            : 'border-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 font-medium">Correct</span>
                      </label>
                    </div>
                  </div>
                ))}

                {errors.options && <p className="text-red-600 text-xs">⚠️ {errors.options}</p>}

                <button
                  onClick={handleAddQuestion}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 cursor-pointer transition"
                >
                  + Add Question
                </button>
              </div>

              {/* Questions List */}
              {questions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Added Questions <span className="text-blue-600">({questions.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:shadow-md transition">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {index + 1}. {q.text}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Options: {q.options.map((o) => o.text).join(', ')}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Correct: {q.correctAnswer}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-600 hover:text-red-700 font-semibold cursor-pointer ml-4 px-3 py-1 hover:bg-red-50 rounded transition"
                          title="Delete question"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateQuiz}
              disabled={loading || questions.length === 0}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Quiz...
                </span>
              ) : (
                `✓ Create Quiz (${questions.length} questions)`
              )}
            </button>
          </div>
        )}

        {/* PDF Tab */}
        {activeTab === 'pdf' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upload PDF</h3>

            <div className="space-y-4 mb-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  PDF File <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setPdfFile(e.target.files?.[0] || null)
                    setErrors({})
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Max 5MB • PDF format only</p>
              </div>

              {/* Question Count Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Between 1 and 20 questions</p>
              </div>

              <button
                onClick={handlePdfUpload}
                disabled={pdfLoading || !pdfFile}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition transform hover:-translate-y-0.5"
              >
                {pdfLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing PDF...
                  </span>
                ) : (
                  '📄 Create Quiz from PDF'
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 How it works:</span> AI will analyze your PDF and automatically generate {questionCount} multiple-choice questions with answers and explanations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}