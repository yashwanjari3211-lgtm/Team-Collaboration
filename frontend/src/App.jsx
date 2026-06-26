import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage from './components/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BillingPage from './pages/BillingPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import GoogleCallback from './pages/GoogleCallback'
import AcceptInvitePage from './pages/AcceptInvitePage'
import LandingPage from './pages/LandingPage'

import OnboardingPage from './pages/OnboardingPage'

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector(state => state.auth)
  return token ? children : <Navigate to="/login" />
}

function App() {
  const { token } = useSelector(state => state.auth)
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
