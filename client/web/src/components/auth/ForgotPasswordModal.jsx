import { useState } from 'react';
import { KeyRound, Mail, Check, X, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.hasMatch ? !emailRegex.test(email) : false) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate password reset request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <KeyRound size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Reset Password</h3>
              <p className="modal-subtitle">We will send a reset link to your registered email</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body text-center">
            <div className="success-icon-wrap">
              <Check size={28} className="text-emerald" />
            </div>
            <h4 className="success-heading">Password Reset Link Sent</h4>
            <p className="success-text">
              We have dispatched instructions to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <div className="modal-actions justify-center">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  if (onBackToLogin) onBackToLogin();
                }}
                className="btn btn-primary w-full"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            {error && (
              <div className="auth-error-banner">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input has-left-icon"
                  required
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onBackToLogin) onBackToLogin();
                }}
                className="btn btn-outline btn-sm"
              >
                <ArrowLeft size={14} />
                Sign In
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
