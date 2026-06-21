import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function CreateQuizPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('manual') // manual, pdf
  const [loading, setLoading] = useState(false)

  // Manual Quiz State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [accessType, setAccessType] = useState('public')
  const [allowedEmails, setAllowedEmails] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Manual Quiz Handlers
  const handleAddQuestion = () => {
    if (!currentQuestion.trim()) {
      toast.error('Please enter a question')
      return
    }

    if (options.some((opt) => !opt.trim())) {
      toast.error('Please fill all options')
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
    toast.success('Question added!')
  }

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
    toast.success('Question removed')
  }

  const handleCreateQuiz = async () => {
    if (!title.trim()) {
      toast.error('Please enter quiz title')
      return
    }

    setLoading(true)

    try {
      const payload = {
        title,
        description,
        accessType,
        allowedEmails: accessType === 'whitelist' ? allowedEmails.split(',').map((e) => e.trim()) : [],
        questions,
      }

      const response = await axiosInstance.post('/rooms', payload)
      toast.success('Quiz created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  // PDF Upload Handler
  const handlePdfUpload = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file')
      return
    }

    if (!title.trim()) {
      toast.error('Please enter quiz title')
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

      toast.success('Quiz created from PDF!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz from PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
          >
            ←
          </button>
          <span className="text-2xl font-bold text-blue-600">Create Quiz</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-10">
        {/* Quiz Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Details</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Quiz Title *</label>
              <input
                type="text"
                placeholder="e.g., Biology 101"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Access Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="public"
                    checked={accessType === 'public'}
                    onChange={(e) => setAccessType(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span className="text-gray-700">Public (Anyone with code)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="access"
                    value="whitelist"
                    checked={accessType === 'whitelist'}
                    onChange={(e) => setAccessType(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span className="text-gray-700">Whitelist (Specific emails)</span>
                </label>
              </div>
            </div>

            {accessType === 'whitelist' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Allowed Emails (comma-separated)
                </label>
                <textarea
                  placeholder="user1@example.com, user2@example.com"
                  value={allowedEmails}
                  onChange={(e) => setAllowedEmails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✍️ Manual Questions
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white'
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
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Question</label>
                  <input
                    type="text"
                    placeholder="Enter question"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Option {index + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options]
                          newOptions[index] = e.target.value
                          setOptions(newOptions)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="correct"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">Correct</span>
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddQuestion}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 cursor-pointer"
                >
                  + Add Question
                </button>
              </div>

              {/* Questions List */}
              {questions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Added Questions ({questions.length})
                  </h4>
                  <div className="space-y-2">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{index + 1}. {q.text}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Options: {q.options.map((o) => o.text).join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Remove
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
              disabled={loading || !title.trim() || questions.length === 0}
              className="w-full px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
          </div>
        )}

        {/* PDF Tab */}
        {activeTab === 'pdf' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upload PDF</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">PDF File *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                onClick={handlePdfUpload}
                disabled={pdfLoading || !pdfFile || !title.trim()}
                className="w-full px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {pdfLoading ? 'Processing PDF...' : 'Create Quiz from PDF'}
              </button>
            </div>

            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
              💡 AI will automatically generate {questionCount} multiple-choice questions from your PDF
              content.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}