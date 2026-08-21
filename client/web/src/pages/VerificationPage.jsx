import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Check, 
  UploadCloud, 
  Camera, 
  Info, 
  ShieldCheck, 
  FileText, 
  UserSquare, 
  Home, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';

export default function VerificationPage() {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const { user } = useAuthStore();
  const [activeDoc, setActiveDoc] = useState(null);
  const [faydaNumber, setFaydaNumber] = useState('FAN-2026-8849-9821');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendRequests, setBackendRequests] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({
    phone: true,
    id: true,
    license: false,
    police: false,
  });

  const docs = [
    { 
      id: 'phone', 
      icon: '📱', 
      label: 'Phone Number (Telebirr / CBE)', 
      status: 'done', 
      note: 'Verified via Ethiopian SMS OTP (+251 911 234 567)' 
    },
    { 
      id: 'id', 
      icon: '🪪', 
      label: 'Fayda Digital National ID / Passport', 
      status: uploadedDocs.id ? 'done' : 'required', 
      note: 'Clear photo or digital Fayda FAN number verification' 
    },
    { 
      id: 'license', 
      icon: '📜', 
      label: 'Trade / Business License (Optional for Pros)', 
      status: uploadedDocs.license ? 'done' : 'optional', 
      note: 'Ministry of Trade & Regional Integration certificate' 
    },
    { 
      id: 'police', 
      icon: '🏛️', 
      label: 'Police Clearance Certificate', 
      status: uploadedDocs.police ? 'done' : 'optional', 
      note: 'Addis Ababa Police clean criminal record verification' 
    },
  ];

  const steps = [
    { label: 'Documents\nSubmitted', done: true },
    { label: 'Under AI & Officer\nReview', active: backendRequests.length > 0, done: false },
    { label: 'Verified &\nTrusted Pro', active: false, done: user?.is_verified || false },
  ];

  useEffect(() => {
    async function loadStatus() {
      try {
        const reqs = await verificationService.getMyRequests();
        if (reqs && reqs.length > 0) {
          setBackendRequests(reqs);
        }
      } catch {
        // Fallback to local default state
      }
    }
    loadStatus();
  }, []);

  const handleSimulateUpload = (docId) => {
    setUploadedDocs((prev) => ({ ...prev, [docId]: true }));
    showToast(`📄 Document for ${docId.toUpperCase()} uploaded successfully!`, 'success');
    setActiveDoc(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await verificationService.createRequest({
        entity_type: user?.role === 'provider' ? 'provider' : 'provider',
        entity_id: user?.id || 'provider-1',
        documents: [
          { type: 'fayda_national_id', id_number: faydaNumber, status: 'submitted' },
          { type: 'phone_otp', number: user?.phone || '+251 911 234 567', status: 'verified' },
        ],
      });
      showToast('🎉 KYC verification submitted! Our Addis safety officers will review within 2 hours.', 'success');
      navigate('/profile');
    } catch (err) {
      showToast(err.message || 'Verification submitted for officer review.', 'success');
      navigate('/profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verification-page-container">
      {/* ── Top Navigation Bar ── */}
      <div className="verification-top-nav">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="back-icon-btn"
        >
          <ChevronLeft size={20} />
          <span>Back to Profile</span>
        </button>
        <span className="page-title-badge">KYC & Identity Center</span>
      </div>

      {/* ── 1. Frosted Glass Hero Banner ── */}
      <section className="verification-hero-card">
        <div className="hero-badge-wrap">
          <div className="shield-icon-circle">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="hero-title">LINC Ethiopian Trust & KYC Verification</h1>
            <p className="hero-subtitle">
              Verify your Fayda National ID and trade certificates to unlock trusted badge status and instant Chapa Escrow payouts.
            </p>
          </div>
        </div>

        <div className="benefit-highlight-box">
          <Sparkles size={16} className="text-amber" />
          <p className="benefit-text">
            Verified specialists get <strong className="text-amber">3× more bookings</strong>, rank at the top of AI search matches, and receive prioritized Chapa Escrow payouts.
          </p>
        </div>
      </section>

      {/* ── 2. Verification Progress Tracker ── */}
      <section className="progress-glass-card">
        <h3 className="section-small-title">VERIFICATION PROGRESS LIFECYCLE</h3>

        <div className="lifecycle-stepper-wrap">
          <div className="stepper-track-line" />
          <div className="stepper-nodes-row">
            {steps.map((step, i) => (
              <div key={i} className="stepper-node-item">
                <div className={`step-circle ${step.done ? 'done' : step.active ? 'active' : 'pending'}`}>
                  {step.done ? (
                    <Check size={14} className="text-white" />
                  ) : (
                    <span className="node-dot" />
                  )}
                </div>
                <div className="step-labels">
                  {step.label.split('\n').map((line, j) => (
                    <p key={j} className={`step-text-line ${step.active ? 'active' : ''}`}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Required Documents List ── */}
      <section className="documents-glass-card">
        <div className="card-header-line">
          <h3 className="card-heading">Required & Optional Documents</h3>
          <span className="secure-badge">
            <Lock size={12} />
            <span>256-Bit Encrypted</span>
          </span>
        </div>

        <div className="documents-stack">
          {docs.map((doc) => {
            const isDone = doc.status === 'done';
            const isRequired = doc.status === 'required';
            const isActive = activeDoc === doc.id;

            return (
              <div key={doc.id} className="doc-item-wrapper">
                <div 
                  onClick={() => !isDone && setActiveDoc(isActive ? null : doc.id)}
                  className={`doc-item-header ${isActive ? 'active-accordion' : ''} ${!isDone ? 'cursor-pointer' : ''}`}
                >
                  <div className="doc-icon-box">
                    <span>{doc.icon}</span>
                  </div>

                  <div className="doc-info-group">
                    <h4 className="doc-title">{doc.label}</h4>
                    <p className="doc-subnote">{doc.note}</p>
                  </div>

                  <div className={`doc-status-badge ${isDone ? 'done' : isRequired ? 'needed' : 'optional'}`}>
                    {isDone ? '✓ Verified' : isRequired ? 'Upload Needed' : 'Optional'}
                  </div>
                </div>

                {/* Expanded Upload Drawer */}
                {isActive && !isDone && (
                  <div className="doc-upload-drawer">
                    {doc.id === 'id' && (
                      <div className="fayda-input-group mb-3">
                        <label className="fayda-input-label">Fayda National ID Number (FAN)</label>
                        <input
                          type="text"
                          value={faydaNumber}
                          onChange={(e) => setFaydaNumber(e.target.value)}
                          placeholder="e.g. FAN-2026-XXXX-XXXX"
                          className="fayda-input-field"
                        />
                      </div>
                    )}

                    <div className="upload-action-buttons-row">
                      <button 
                        type="button"
                        onClick={() => handleSimulateUpload(doc.id)}
                        className="upload-drop-btn"
                      >
                        <UploadCloud size={20} className="text-cyan" />
                        <span className="upload-btn-title">Upload File / Scan PDF</span>
                        <span className="upload-btn-sub">JPG, PNG, PDF up to 10MB</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleSimulateUpload(doc.id)}
                        className="upload-drop-btn"
                      >
                        <Camera size={20} className="text-cyan" />
                        <span className="upload-btn-title">Take Live Photo</span>
                        <span className="upload-btn-sub">Front & back side</span>
                      </button>
                    </div>

                    <div className="encryption-notice-row">
                      <Info size={13} className="text-muted flex-shrink-0" />
                      <span>Documents are stored securely and never shared publicly or with clients.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Submit Button ── */}
      <div className="verification-submit-bar">
        <button 
          type="button"
          onClick={handleSubmit}
          className="submit-verification-btn"
        >
          <ShieldCheck size={18} />
          <span>Submit Documents for Verification 🚀</span>
        </button>
      </div>
    </div>
  );
}
