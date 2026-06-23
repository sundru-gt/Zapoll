import toast from 'react-hot-toast'

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  // Network error
  if (!error.response) {
    console.error('Network error:', error.message)
    toast.error('Network error. Check your connection.')
    return
  }

  // Server error with custom message
  const message = error.response?.data?.message || defaultMessage

  const statusCode = error.response?.status

  // Handle specific status codes
  switch (statusCode) {
    case 400:
      toast.error(message || 'Invalid request. Please check your input.')
      break
    case 401:
      toast.error('Session expired. Please login again.')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      break
    case 403:
      toast.error('You do not have permission to perform this action.')
      break
    case 404:
      toast.error(message || 'Resource not found.')
      break
    case 409:
      toast.error(message || 'This resource already exists.')
      break
    case 422:
      toast.error(message || 'Validation error. Please check your input.')
      break
    case 500:
      toast.error('Server error. Please try again later.')
      break
    default:
      toast.error(message)
  }

  return message
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateQuizCode = (code) => {
  return code.length === 6 && /^[A-Z0-9]+$/.test(code)
}