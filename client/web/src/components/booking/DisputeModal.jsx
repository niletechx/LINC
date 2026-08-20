import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useBookingStore } from '../../stores/bookingStore';
import { useAppStore } from '../../stores/appStore';

export default function DisputeModal() {
  const { isDisputeModalOpen, closeDisputeModal, disputeBookingTarget, raiseDispute } = useBookingStore();
  const { showToast } = useAppStore();
  const [reason, setReason] = useState('');

  if (!isDisputeModalOpen || !disputeBookingTarget) return null;
  const b = disputeBookingTarget;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    raiseDispute(b.id, reason.trim());
    showToast('Dispute opened. LINC Trust & Safety team will review within 24 hours.', 'error');
  };

  return (
    <div className="modal-backdrop" onClick={closeDisputeModal}>
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge bg-red-50 text-red">
              <AlertTriangle size={20} className="text-red" />
            </div>
            <div>
              <h3 className="modal-title">Raise Escrow Dispute</h3>
              <p className="modal-subtitle">Booking #{b.id} • {b.serviceTitle}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closeDisputeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Reason for Dispute</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what went wrong (e.g. provider did not show up, work was incomplete or defective, unauthorized extra charges)..."
              rows={4}
              className="form-input form-textarea"
              required
            />
          </div>

          <p className="form-hint text-red">
            Escrow release is frozen immediately. An admin mediator will review messages and evidence.
          </p>

          <div className="modal-actions">
            <button type="button" onClick={closeDisputeModal} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary bg-red-600 hover:bg-red-700">
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
