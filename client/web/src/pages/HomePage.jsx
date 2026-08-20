import Navbar from '../components/layout/Navbar';
import ClientHome from '../components/home/ClientHome';
import ProviderDashboard from '../components/home/ProviderDashboard';
import PostRequestModal from '../components/home/PostRequestModal';
import LocationPickerModal from '../components/home/LocationPickerModal';
import NotificationsModal from '../components/home/NotificationsModal';
import ProviderDetailsModal from '../components/provider/ProviderDetailsModal';
import BookingFlowModal from '../components/booking/BookingFlowModal';
import EscrowPaymentModal from '../components/booking/EscrowPaymentModal';
import DisputeModal from '../components/booking/DisputeModal';
import { useAppStore } from '../stores/appStore';

export default function HomePage() {
  const { appMode } = useAppStore();

  return (
    <div className="home-page-root">
      {appMode === 'provider' ? <ProviderDashboard /> : <ClientHome />}

      {/* Global Modals */}
      <PostRequestModal />
      <LocationPickerModal />
      <NotificationsModal />
      <ProviderDetailsModal />
      <BookingFlowModal />
      <EscrowPaymentModal />
      <DisputeModal />
    </div>
  );
}
