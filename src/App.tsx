// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useEffect } from 'react'
import { Login } from './pages/Login'
import { Call } from './pages/Call'
import { Management } from './pages/Management'
import { Earnings } from './pages/Earnings'
import { Rating } from './pages/Rating'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Apply theme on mount
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/management" replace />} />
        <Route
          path="/call"
          element={
            <ProtectedRoute>
              <Call />
            </ProtectedRoute>
          }
        />
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <Management />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <Earnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rating"
          element={
            <ProtectedRoute>
              <Rating />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/management" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

