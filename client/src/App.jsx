import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CreateQuizPage from './pages/CreateQuizPage'
import HostQuizPage from './pages/HostQuizPage'
import JoinQuizPage from './pages/JoinQuizPage'
import ParticipantQuizPage from './pages/ParticipantQuizPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-quiz"
              element={
                <ProtectedRoute>
                  <CreateQuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId/host"
              element={
                <ProtectedRoute>
                  <HostQuizPage />
                </ProtectedRoute>
              }
            />
            <Route path="/join" element={<JoinQuizPage />} />
            <Route
              path="/room/:roomId/quiz"
              element={
                <ProtectedRoute>
                  <ParticipantQuizPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  )
}