import { useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock, X, Shield, ArrowRight } from 'lucide-react';
import { useBookingStore } from '../../stores/bookingStore';
import { useAppStore } from '../../stores/appStore';

export default function BookingFlowModal() {
  const {
    isCreateBookingModalOpen,
    closeCreateBooking,
    targetProviderForBooking,
    targetServiceForBooking,
    createBooking,
  } = useBookingStore();

  const { currentLocation } = useAppStore();

  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('10:00 AM');
  const [address, setAddress] = useState(currentLocation);
  const [price, setPrice] = useState(
    targetServiceForBooking?.amount ? String(targetServiceForBooking.amount) : '600'
  );
  const [notes, setNotes] = useState('');

  if (!isCreateBookingModalOpen || !targetProviderForBooking) return null;
  const p = targetProviderForBooking;
  const srv = targetServiceForBooking;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBooking({
      provider: p,
      service: srv,
      scheduledDate: `${date}, ${time}`,
      address: address.trim(),
      agreedPrice: Number(price) || 600,
    });
  };

  return (
    <div className="modal-backdrop" onClick={closeCreateBooking}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Calendar size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Book Service with {p.name}</h3>
              <p className="modal-subtitle">
                {srv?.name ? srv.name : p.headline}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closeCreateBooking} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Escrow Guarantee Highlight */}
          <div className="escrow-notice-pill">
            <Shield size={16} className="text-cyan" />
            <span>
              <strong>100% Escrow Protected:</strong> Your money is held in Chapa Escrow until you confirm work completion.
            </span>
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input form-select"
              >
                <option value="Today">⚡ Today (Urgent)</option>
                <option value="Tomorrow">📅 Tomorrow</option>
                <option value="In 2 Days">📅 In 2 Days</option>
                <option value="This Weekend">🌴 This Weekend</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input form-select"
              >
                <option value="09:00 AM">09:00 AM (Morning)</option>
                <option value="11:00 AM">11:00 AM (Late Morning)</option>
                <option value="02:00 PM">02:00 PM (Afternoon)</option>
                <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Location / Address</label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bole, near Medhanialem Church, House 412"
                className="form-input has-left-icon"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Agreed Escrow Amount (ETB)</label>
            <div className="input-with-icon">
              <DollarSign size={16} className="input-icon" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="600"
                className="form-input has-left-icon"
                min="100"
                required
              />
            </div>
            <span className="form-hint">
              {srv?.price ? `Standard rate: ${srv.price}` : `Provider rate: ${p.hourlyRate} ETB/hr`}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Special Instructions / Job Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring extra 1/2 inch PVC pipe connectors and seal tape..."
              rows={2}
              className="form-input form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeCreateBooking} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <span>Proceed to Chapa Escrow Payment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
