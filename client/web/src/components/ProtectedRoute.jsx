import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LoadingScreen } from './ui/Feedback'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized) return <LoadingScreen />
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && !user?.is_admin) return <Navigate to="/dashboard" replace />

  return children
}
