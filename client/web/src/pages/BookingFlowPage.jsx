import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Check, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { MOCK_PROVIDERS, SUB_CITIES } from '../data/mockData';
import { useBookingStore } from '../stores/bookingStore';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';

const PAYMENT_METHODS = [
  { id: 'telebirr', name: 'Telebirr', icon: '📱', color: '#0284C7', placeholder: '+251 91 234 5678' },
  { id: 'cbe_birr', name: 'CBE Birr', icon: '🏦', color: '#7C3AED', placeholder: '+251 92 345 6789' },
  { id: 'awash_birr', name: 'Awash Birr', icon: '🟡', color: '#D97706', placeholder: '+251 93 456 7890' },
  { id: 'dashen_amole', name: 'Dashen Amole', icon: '🔵', color: '#2563EB', placeholder: '+251 94 567 8901' },
  { id: 'bank_card', name: 'Card (Visa/MC)', icon: '💳', color: '#059669', placeholder: '4111 2222 3333 4444' },
];

export default function BookingFlowPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { createBookingFromCheckout } = useBookingStore();
  const { startConversationWithProvider } = useChatStore();
  const { showToast } = useAppStore();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form States
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedHours, setSelectedHours] = useState(2);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('2:30 PM');
  const [subCity, setSubCity] = useState('Bole');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const p = MOCK_PROVIDERS.find(p => p.id === id) || MOCK_PROVIDERS[0];
    setProvider(p);

    const initialServiceId = searchParams.get('service');
    const initialHours = searchParams.get('hours');

    if (initialServiceId && p.services?.some(s => s.id === initialServiceId)) {
      setSelectedServiceId(initialServiceId);
    } else if (p.services && p.services.length > 0) {
      setSelectedServiceId(p.services[0].id);
    }

    if (initialHours) {
      setSelectedHours(Number(initialHours) || 2);
    }

    setLoading(false);
  }, [id, searchParams]);

  // Generate next 7 days for date picker
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label: dayName, date: monthDay, full: `${dayName}, ${monthDay}` };
  });

  const timeSlots = [
    '8:30 AM', '10:00 AM', '11:30 AM', 
    '1:30 PM', '2:30 PM', '4:00 PM', '5:30 PM'
  ];

  if (loading || !provider) {
    return (
      <div className="profile-loading-state">
        <p>Loading booking checkout...</p>
      </div>
    );
  }

  const activeService = provider.services?.find(s => s.id === selectedServiceId) || provider.services?.[0];
  const calculatedPrice = activeService
    ? (activeService.fixed ? activeService.amount : (activeService.amount || provider.hourlyRate || 300) * selectedHours)
    : (provider.hourlyRate || 300) * selectedHours;

  const handleDepositToEscrow = (e) => {
    e.preventDefault();
    if (!paymentPhone.trim()) {
      showToast('Please provide your phone number or account details for Chapa Escrow.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newBooking = createBookingFromCheckout({
        provider,
        service: activeService,
        scheduledDate: upcomingDays[selectedDayIdx].full,
        scheduledTime: selectedTimeSlot,
        subCity,
        address,
        notes,
        paymentMethod,
        paymentPhone,
        agreedPrice: calculatedPrice,
        hours: selectedHours,
      });

      setIsProcessing(false);
      setConfirmedBooking(newBooking);
      showToast('🎉 Deposit locked in Chapa Escrow Vault successfully!', 'success');
    }, 1200);
  };

  const handleChatWithProvider = () => {
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  // ── Confirmation View ──
  if (confirmedBooking) {
    return (
      <div className="booking-confirmation-wrapper">
        <div className="confirmation-card">
          <div className="confirmation-icon-circle">
            <Check size={36} className="text-white" />
          </div>

          <span className="confirmation-tag">Chapa Escrow Vault Secured</span>
          <h2 className="confirmation-title">Booking & Escrow Deposit Confirmed!</h2>
          <p className="confirmation-sub">
            Your payment of <strong>{confirmedBooking.agreedPrice} ETB</strong> has been securely deposited into the Chapa Escrow Vault. Funds will only be released to <strong>{provider.name}</strong> after you inspect and approve the completed service.
          </p>

          <div className="confirmation-receipt-box">
            <div className="receipt-row">
              <span className="receipt-label">Escrow Vault Ref:</span>
              <span className="receipt-val font-mono text-cyan">{confirmedBooking.escrowRef}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Specialist:</span>
              <span className="receipt-val">{provider.name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Service:</span>
              <span className="receipt-val">{confirmedBooking.serviceTitle}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Scheduled Time:</span>
              <span className="receipt-val">{confirmedBooking.scheduledDate}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Location:</span>
              <span className="receipt-val">{confirmedBooking.address}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Method:</span>
              <span className="receipt-val">{confirmedBooking.paymentMethodLabel} ({confirmedBooking.paymentPhone})</span>
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row total">
              <span className="receipt-label">Escrow Deposit Held:</span>
              <span className="receipt-val text-emerald">{confirmedBooking.agreedPrice} ETB</span>
            </div>
          </div>

          <div className="confirmation-actions-row">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="confirm-btn-primary"
            >
              <span>Go to My Escrow Vault</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleChatWithProvider}
              className="confirm-btn-secondary"
            >
              <MessageSquare size={16} />
              <span>Message Specialist</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Checkout Form ──
  return (
    <div className="booking-checkout-wrapper">
      {/* Navigation Row */}
      <div className="checkout-nav-row">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="checkout-back-btn"
        >
          <ChevronLeft size={16} />
          <span>Back to Profile</span>
        </button>

        <div className="checkout-escrow-pill">
          <Lock size={13} className="text-emerald" />
          <span>Chapa Escrow Safe Pay</span>
        </div>
      </div>

      {/* Two-Column Split Layout */}
      <div className="checkout-split-layout">
        {/* Left Column: Form Setup */}
        <div className="checkout-left-pane">
          {/* STEP 1: SERVICE SELECTION */}
          <section className="checkout-section-card">
            <div className="section-step-header">
              <span className="step-num">1</span>
              <div>
                <h3 className="step-title">Select Service Package</h3>
                <p className="step-sub">Choose what you need assistance with</p>
              </div>
            </div>

            <div className="services-selection-grid">
              {provider.services?.map((svc) => {
                const isSelected = selectedServiceId === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`checkout-service-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="service-radio-circle">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>

                    <div className="service-content-data">
                      <div className="service-title-row">
                        <strong className="service-title-text">{svc.name}</strong>
                        <span className="service-cost-tag">{svc.price}</span>
                      </div>
                      <p className="service-sub-desc">{svc.description}</p>
                      <span className="service-time-tag">⏱️ {svc.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hours Adjuster for Hourly Services */}
            {activeService && !activeService.fixed && (
              <div className="hours-adjuster-box">
                <div className="hours-label-row">
                  <span className="hours-label">Estimated Service Hours:</span>
                  <span className="hours-val">{selectedHours} hours</span>
                </div>
                <div className="hours-pills-row">
                  {[1, 2, 3, 4, 6, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHours(h)}
                      className={`hours-pill-btn ${selectedHours === h ? 'active' : ''}`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* STEP 2: SCHEDULE DATE & TIME */}
          <section className="checkout-section-card">
            <div className="section-step-header">
              <span className="step-num">2</span>
              <div>
                <h3 className="step-title">Schedule Date & Time</h3>
                <p className="step-sub">When should {provider.name?.split(' ')[0]} arrive?</p>
              </div>
            </div>

            {/* Date Carousel */}
            <div className="days-picker-carousel">
              {upcomingDays.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`day-picker-card ${selectedDayIdx === idx ? 'selected' : ''}`}
                >
                  <span className="day-name">{day.label}</span>
                  <span className="day-date">{day.date}</span>
                </button>
              ))}
            </div>

            {/* Time Slot Grid */}
            <div className="time-slots-grid">
              {timeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`time-slot-btn ${selectedTimeSlot === slot ? 'selected' : ''}`}
                >
                  <Clock size={12} />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </section>

          {/* STEP 3: LOCATION & NOTES */}
          <section className="checkout-section-card">
            <div className="section-step-header">
              <span className="step-num">3</span>
              <div>
                <h3 className="step-title">Service Address & Details</h3>
                <p className="step-sub">Where in Addis Ababa should the job be performed?</p>
              </div>
            </div>

            <div className="location-inputs-grid">
              <div className="input-group">
                <label className="field-label">Sub-City in Addis Ababa</label>
                <select
                  value={subCity}
                  onChange={(e) => setSubCity(e.target.value)}
                  className="field-select"
                >
                  {SUB_CITIES.map((sc) => (
                    <option key={sc} value={sc}>
                      📍 {sc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="field-label">Specific Neighborhood / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="E.g. Near Edna Mall, Building #4, 2nd Floor"
                  className="field-input"
                />
              </div>
            </div>

            <div className="input-group mt-3">
              <label className="field-label">Job Notes & Special Instructions (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe specific symptoms, pipe size, replacement parts you have, or entry gate codes..."
                rows={3}
                className="field-textarea"
              />
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Escrow Box */}
        <aside className="checkout-right-pane">
          <div className="sticky-checkout-summary-card">
            {/* Specialist Mini Summary */}
            <div className="checkout-pro-card">
              <div 
                className="pro-avatar"
                style={{ backgroundColor: provider.avatarColor || '#0284C7' }}
              >
                <span>{provider.initials || provider.name?.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="pro-info">
                <div className="pro-name-row">
                  <strong className="pro-name">{provider.name}</strong>
                  {provider.verified && (
                    <ShieldCheck size={14} className="text-emerald" title="Verified Ethiopian Pro" />
                  )}
                </div>
                <p className="pro-headline">{provider.headline}</p>
                <div className="pro-meta">
                  <Star size={12} fill="#F59E0B" className="text-amber" />
                  <span>{(provider.rating || 4.9).toFixed(1)} ({provider.reviewsCount || 42} reviews)</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-method-section">
              <label className="summary-section-label">Ethiopian Payment Method</label>
              <div className="payment-gateways-grid">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`gateway-card-btn ${paymentMethod === pm.id ? 'active' : ''}`}
                  >
                    <span className="gateway-icon">{pm.icon}</span>
                    <span className="gateway-name">{pm.name}</span>
                  </button>
                ))}
              </div>

              {/* Account / Phone Input */}
              <div className="payment-phone-input-wrap">
                <label className="phone-label">
                  {paymentMethod === 'bank_card' ? 'Card Number' : `${PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name} Phone Number`}
                </label>
                <input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder={PAYMENT_METHODS.find(p => p.id === paymentMethod)?.placeholder}
                  className="payment-phone-field"
                  required
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="summary-cost-breakdown">
              <div className="cost-row">
                <span>{activeService?.name || 'Service Rate'}</span>
                <span>{calculatedPrice} ETB</span>
              </div>
              <div className="cost-row">
                <span>LINC Escrow Protection</span>
                <span className="text-emerald font-bold">0 ETB (Free)</span>
              </div>
              <div className="cost-divider" />
              <div className="cost-row total">
                <span>Total Escrow Deposit</span>
                <span className="total-val">{calculatedPrice} ETB</span>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="checkout-escrow-guarantee">
              <div className="guarantee-top">
                <Lock size={15} className="text-emerald" />
                <strong>100% Chapa Escrow Guarantee</strong>
              </div>
              <p className="guarantee-text">
                Your payment is held safely in escrow. Funds are released to {provider.name?.split(' ')[0]} only after you inspect and approve the completed job.
              </p>
            </div>

            {/* Deposit Action CTA */}
            <button
              type="button"
              onClick={handleDepositToEscrow}
              disabled={isProcessing}
              className="deposit-escrow-btn"
            >
              <Lock size={16} />
              <span>
                {isProcessing ? 'Securing Chapa Escrow...' : `Deposit ${calculatedPrice} ETB to Escrow`}
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
