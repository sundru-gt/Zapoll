import { createContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('accessToken'))

  useEffect(() => {
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      })
      const { accessToken, refreshToken, user } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setToken(accessToken)
      setUser(user)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      })
      const { accessToken, refreshToken, user } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setToken(accessToken)
      setUser(user)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}