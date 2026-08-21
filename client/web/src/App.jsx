import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import AIPage from './pages/AIPage';
import BookingsPage from './pages/BookingsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import BookingFlowPage from './pages/BookingFlowPage';
import VerificationPage from './pages/VerificationPage';
import ProviderSetupPage from './pages/ProviderSetupPage';
import ProviderJobsPage from './pages/ProviderJobsPage';
import ProviderWalletPage from './pages/ProviderWalletPage';
import ProviderServicesPage from './pages/ProviderServicesPage';
import ProviderShowcasePage from './pages/ProviderShowcasePage';
import RequestsPage from './pages/RequestsPage';
import DmPage from './pages/DmPage';
import AdminPage from './pages/AdminPage';
import BusinessManagementPage from './pages/BusinessManagementPage';
import PaymentResultPage from './pages/PaymentResultPage';
import Navbar from './components/layout/Navbar';
import AuthPromptModal from './components/auth/AuthPromptModal';
import { useAuthStore } from './stores/authStore';
import { useAppStore } from './stores/appStore';
import './App.css';

// Toast Banner Component
function GlobalToast() {
  const { toast, hideToast } = useAppStore();
  if (!toast) return null;

  return (
    <div className={`global-toast-banner toast-${toast.type} animate-fade-in`}>
      <span>{toast.message}</span>
      <button type="button" onClick={hideToast} className="toast-close-btn">
        ×
      </button>
    </div>
  );
}

// Unified Layout Shell: Navbar on top + Floating Content Card
function AppLayout() {
  return (
    <div className="app-main-layout">
      <Navbar />

      <main className="app-content-card">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      {/* Light Sky Cyan Ambient Wallpaper Layer */}
      <div className="fixed-background-wallpaper" aria-hidden="true">
        <div className="global-sky-glow global-glow-top-right" />
        <div className="global-sky-glow global-glow-bottom-left" />
        <div className="global-sky-mesh" />
      </div>

      <GlobalToast />
      <AuthPromptModal />
      <Routes>
        {/* Fullscreen Dedicated Auth Pages (Matches Exact User Prototype) */}
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/signup" element={<AuthPage initialMode="signup" />} />

        {/* Regular Layout Routes with Navbar + Content Card */}
        <Route element={<AppLayout />}>
          {/* Public Routes: Search & View Specialists Only */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/provider/:id" element={<ProviderProfilePage />} />

          {/* Authenticated-Only Routes */}
          <Route path="/ai" element={isAuthenticated ? <AIPage /> : <Navigate to="/login" replace />} />
          <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/bookings" element={isAuthenticated ? <BookingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/booking" element={isAuthenticated ? <Navigate to="/bookings" replace /> : <Navigate to="/login" replace />} />
          <Route path="/requests" element={isAuthenticated ? <RequestsPage /> : <Navigate to="/login" replace />} />
          <Route path="/messages" element={isAuthenticated ? <MessagesPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/booking/:id" element={isAuthenticated ? <BookingFlowPage /> : <Navigate to="/login" replace />} />
          <Route path="/bookings/:id/payment-result" element={isAuthenticated ? <PaymentResultPage /> : <Navigate to="/login" replace />} />
          <Route path="/dm/:id" element={isAuthenticated ? <DmPage /> : <Navigate to="/login" replace />} />
          <Route path="/verification" element={isAuthenticated ? <VerificationPage /> : <Navigate to="/login" replace />} />
          <Route path="/provider-setup" element={isAuthenticated ? <ProviderSetupPage /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path="/business/manage" element={isAuthenticated ? <BusinessManagementPage /> : <Navigate to="/login" replace />} />
          <Route path="/organization/manage" element={isAuthenticated ? <BusinessManagementPage isOrg={true} /> : <Navigate to="/login" replace />} />

          {/* Dedicated Provider Workspace Routes */}
          <Route path="/provider/jobs" element={isAuthenticated ? <ProviderJobsPage /> : <Navigate to="/login" replace />} />
          <Route path="/provider/wallet" element={isAuthenticated ? <ProviderWalletPage /> : <Navigate to="/login" replace />} />
          <Route path="/provider/services" element={isAuthenticated ? <ProviderServicesPage /> : <Navigate to="/login" replace />} />
          <Route path="/provider/showcase" element={isAuthenticated ? <ProviderShowcasePage /> : <Navigate to="/login" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
