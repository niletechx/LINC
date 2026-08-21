import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import ProvidersPage from './pages/ProvidersPage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import RequestNewPage from './pages/RequestNewPage'
import RequestDetailPage from './pages/RequestDetailPage'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import MessagesPage from './pages/MessagesPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import ProviderSetupPage from './pages/ProviderSetupPage'
import BusinessSetupPage from './pages/BusinessSetupPage'
import VerificationPage from './pages/VerificationPage'
import AdminPage from './pages/AdminPage'
import { LoadingScreen } from './components/ui/Feedback'

function AppBootstrap({ children }) {
  const { init, initialized } = useAuthStore()
  useEffect(() => { init() }, [init])
  if (!initialized) return <LoadingScreen message="Starting LINC..." />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBootstrap>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="providers/:id" element={<ProviderDetailPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="requests/new" element={<RequestNewPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/new" element={<BookingDetailPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:id" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="provider/setup" element={<ProviderSetupPage />} />
            <Route path="business/setup" element={<BusinessSetupPage />} />
            <Route path="verification" element={<VerificationPage />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppBootstrap>
    </BrowserRouter>
  )
}
