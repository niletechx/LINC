import React, { useState } from 'react';
import { Star, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useAppStore } from '../../stores/appStore';

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { showToast } = useAppStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please provide a short review comment', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        booking_id: booking.id,
        entity_type: booking.entity_type || 'provider',
        entity_id: booking.providerId || booking.entity_id,
        rating,
        comment: comment.trim(),
      });
      showToast('🎉 Review submitted successfully! Thank you for rating.', 'success');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Star size={20} fill="#D97706" />
            </div>
            <div>
              <h3 className="modal-title">Rate & Review Specialist</h3>
              <p className="modal-subtitle">Share your verified experience with the community</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Specialist Summary Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex items-center justify-between">
            <div>
              <strong className="text-sm text-slate-800 font-bold block">{booking.providerName}</strong>
              <span className="text-xs text-slate-500">{booking.serviceTitle}</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Verified Service</span>
            </span>
          </div>

          {/* 5-Star Interactive Rating */}
          <div className="text-center py-3 bg-amber-50/50 rounded-xl border border-amber-100 mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
              Overall Rating
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      fill={isFilled ? '#F59E0B' : 'none'}
                      color={isFilled ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-sm font-bold text-amber-700 mt-1 block">
              {rating === 5 && '🌟 Excellent / ፍጹም'}
              {rating === 4 && '👍 Very Good / በጣም ጥሩ'}
              {rating === 3 && '👌 Good / ጥሩ'}
              {rating === 2 && '👎 Fair / መካከለኛ'}
              {rating === 1 && '⚠️ Poor / ደካማ'}
            </span>
          </div>

          {/* Feedback Textarea */}
          <div className="form-group mb-4">
            <label className="form-label">Your Review & Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the quality of work? Were they punctual, professional, and courteous?"
              rows={4}
              className="form-input form-textarea"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
