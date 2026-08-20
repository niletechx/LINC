import { useState } from 'react';
import { ShieldCheck, Check, X, CreditCard, Lock, ArrowRight, Zap } from 'lucide-react';
import { useBookingStore } from '../../stores/bookingStore';
import { useAppStore } from '../../stores/appStore';

export default function EscrowPaymentModal() {
  const { isPaymentModalOpen, closePaymentModal, paymentBookingTarget, completeEscrowPayment } = useBookingStore();
  const { showToast } = useAppStore();

  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPaymentModalOpen || !paymentBookingTarget) return null;
  const b = paymentBookingTarget;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      completeEscrowPayment(b.id);
      setIsProcessing(false);
      showToast(`Payment of ${b.agreedPrice} ETB held safely in LINC Escrow!`, 'success');
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={closePaymentModal}>
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Lock size={20} className="text-emerald" />
            </div>
            <div>
              <h3 className="modal-title">Secure Escrow Checkout</h3>
              <p className="modal-subtitle">Powered by Chapa Payment Gateway (Ethiopia)</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closePaymentModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Order Summary */}
          <div className="escrow-summary-box">
            <div className="summary-row">
              <span className="summary-label">Service</span>
              <span className="summary-val">{b.serviceTitle}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Provider</span>
              <span className="summary-val">{b.providerName}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Scheduled Time</span>
              <span className="summary-val">{b.scheduledDate}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span className="total-label">Total Escrow Deposit</span>
              <span className="total-amount">{b.agreedPrice} ETB</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="payment-methods-grid">
            <button
              type="button"
              onClick={() => setPaymentMethod('telebirr')}
              className={`payment-method-btn ${paymentMethod === 'telebirr' ? 'selected' : ''}`}
            >
              <span className="method-logo">📱</span>
              <span className="method-name">Telebirr</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cbe')}
              className={`payment-method-btn ${paymentMethod === 'cbe' ? 'selected' : ''}`}
            >
              <span className="method-logo">🏦</span>
              <span className="method-name">CBE Birr</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
            >
              <span className="method-logo">💳</span>
              <span className="method-name">Bank Card</span>
            </button>
          </div>

          {/* Escrow Terms */}
          <div className="escrow-guarantee-box">
            <ShieldCheck size={20} className="text-emerald flex-shrink-0" />
            <p className="escrow-guarantee-text">
              <strong>Your funds are protected:</strong> The provider will NOT receive payment until they complete the service and you confirm delivery.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closePaymentModal} className="btn btn-outline">
              Pay Later
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="btn btn-primary"
            >
              {isProcessing ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <Zap size={16} />
                  <span>Authorize {b.agreedPrice} ETB Escrow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
