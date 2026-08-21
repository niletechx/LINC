import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAppStore } from '../../stores/appStore';

export default function ReportModal({ isOpen, onClose, entityType = 'provider', entityId, entityName }) {
  const { showToast } = useAppStore();
  const [reason, setReason] = useState('scam_fraud');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const REASONS = [
    { id: 'scam_fraud', label: 'Scam / Fraud / Off-platform Payment Request' },
    { id: 'no_show', label: 'Specialist Did Not Show Up' },
    { id: 'poor_quality', label: 'Severe Quality or Safety Violation' },
    { id: 'harassment', label: 'Inappropriate or Unprofessional Behavior' },
    { id: 'fake_profile', label: 'Impersonation or False Information' },
    { id: 'other', label: 'Other Issue / Terms Violation' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide details explaining the issue', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        entity_type: entityType,
        entity_id: entityId,
        reason,
        description: description.trim(),
      });
      showToast('🛡️ Report submitted to LINC Trust & Safety team for immediate review.', 'success');
      setDescription('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="modal-title">Report Suspicious Activity or Issue</h3>
              <p className="modal-subtitle">Protecting the Addis Ababa community with 24/7 moderation</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {entityName && (
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl mb-3">
              <span className="text-xs text-rose-700 font-semibold block">Reporting Target:</span>
              <strong className="text-sm text-slate-800">{entityName}</strong>
            </div>
          )}

          <div className="form-group mb-3">
            <label className="form-label">Primary Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input"
            >
              {REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Explain what happened in detail</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident, dates, messages, or monetary details..."
              rows={4}
              className="form-input form-textarea"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: '#DC2626' }}>
              <AlertTriangle size={15} />
              <span>{isSubmitting ? 'Submitting Report...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
