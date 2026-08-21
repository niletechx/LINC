import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  PlusCircle, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Eye, 
  Pin, 
  Camera, 
  Award, 
  X, 
  Reply, 
  ChevronRight, 
  FileText, 
  Check, 
  Send
} from 'lucide-react';
import { useProviderStore } from '../stores/providerStore';
import { useAppStore } from '../stores/appStore';
import { SUB_CITIES } from '../data/mockData';

export default function ProviderShowcasePage() {
  const navigate = useNavigate();
  const { 
    profile, 
    portfolio, 
    reviews, 
    credentials, 
    addPortfolioProject, 
    updatePortfolioProject, 
    deletePortfolioProject, 
    togglePinProject, 
    replyToReview, 
    togglePinReview,
    addCredential,
    removeCredential
  } = useProviderStore();

  const { showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'reviews' | 'credentials'

  // Portfolio modal form state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSubCity, setProjectSubCity] = useState('Bole Medhanealem');
  const [projectDuration, setProjectDuration] = useState('2 hours');
  const [projectCost, setProjectCost] = useState('850');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectFeedback, setProjectFeedback] = useState('');
  const [projectTags, setProjectTags] = useState('Plumbing, Repair, Leak');

  // Review reply inline form state
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Credential modal form state
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [credTitle, setCredTitle] = useState('');
  const [credIssuer, setCredIssuer] = useState('');
  const [credDate, setCredDate] = useState('2025–2028');

  // ── Open Add Project Modal ──
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectSubCity('Bole Medhanealem');
    setProjectDuration('2 hours');
    setProjectCost('850');
    setProjectDesc('');
    setProjectFeedback('');
    setProjectTags('Plumbing, PPR Pipe, Emergency');
    setIsProjectModalOpen(true);
  };

  // ── Open Edit Project Modal ──
  const handleOpenEditProject = (proj) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectSubCity(proj.subCity);
    setProjectDuration(proj.duration);
    setProjectCost(proj.cost.replace(/[^0-9]/g, '') || '600');
    setProjectDesc(proj.description);
    setProjectFeedback(proj.clientFeedback?.replace(/[“”]/g, '') || '');
    setProjectTags(proj.tags?.join(', ') || '');
    setIsProjectModalOpen(true);
  };

  // ── Save Portfolio Project ──
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectCost) return;

    const tagsArray = projectTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProjectId) {
      updatePortfolioProject(editingProjectId, {
        title: projectTitle,
        subCity: projectSubCity,
        duration: projectDuration,
        cost: `${projectCost} ETB`,
        description: projectDesc,
        clientFeedback: projectFeedback ? `“${projectFeedback}”` : '',
        tags: tagsArray,
      });
      showToast('Portfolio case study updated! 📸', 'success');
    } else {
      addPortfolioProject({
        title: projectTitle,
        subCity: projectSubCity,
        duration: projectDuration,
        cost: projectCost,
        description: projectDesc,
        clientFeedback: projectFeedback,
        tags: tagsArray,
        beforeAfterPhotos: { before: '/assets/bg-city.jpg', after: '/assets/hero.png' },
      });
      showToast('New project case study published to your profile! 🎉', 'success');
    }

    setIsProjectModalOpen(false);
  };

  // ── Submit Reply to Client Review ──
  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText);
    showToast('Official specialist response published! 💬', 'success');
    setReplyingReviewId(null);
    setReplyText('');
  };

  // ── Save Credential ──
  const handleSaveCredential = (e) => {
    e.preventDefault();
    if (!credTitle.trim() || !credIssuer.trim()) return;

    addCredential({
      title: credTitle,
      issuer: credIssuer,
      date: credDate,
      status: 'Verified',
    });
    showToast('New credential badge added to your profile! 🛡️', 'success');
    setIsCredModalOpen(false);
  };

  return (
    <div className="provider-showcase-page-wrapper">
      {/* ── 1. Page Header ── */}
      <header className="provider-page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="provider-page-title">Specialist Showcase, Portfolio & Review Studio</h1>
            <span className="escrow-vault-chip">
              <Sparkles size={12} className="text-cyan-600" />
              <span>Public Profile Manager</span>
            </span>
          </div>
          <p className="provider-page-sub">
            Showcase verified Addis Ababa project case studies, manage customer reviews with official specialist replies, and build trust with Fayda ID badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/provider/${profile.id || '1'}`)}
            className="btn btn-outline"
          >
            <Eye size={15} />
            <span>Preview Public Profile</span>
          </button>

          {activeTab === 'portfolio' && (
            <button
              type="button"
              onClick={handleOpenAddProject}
              className="btn btn-primary"
            >
              <PlusCircle size={15} />
              <span>Add Case Study</span>
            </button>
          )}

          {activeTab === 'credentials' && (
            <button
              type="button"
              onClick={() => {
                setCredTitle('');
                setCredIssuer('');
                setIsCredModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <PlusCircle size={15} />
              <span>Add Credential</span>
            </button>
          )}
        </div>
      </header>

      {/* ── 2. Studio Tabs Strip ── */}
      <div className="provider-filter-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`p-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
        >
          <span>📸 Portfolio Case Studies ({portfolio.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`p-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
        >
          <span>⭐ Customer Reviews & Replies ({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`p-tab-btn ${activeTab === 'credentials' ? 'active' : ''}`}
        >
          <span>🛡️ Verified Credentials & Fayda ID ({credentials.length})</span>
        </button>
      </div>

      {/* ── TAB 1: PORTFOLIO CASE STUDIES ── */}
      {activeTab === 'portfolio' && (
        <section className="portfolio-studio-section">
          <div className="section-title-row">
            <div>
              <h2 className="section-heading">Published Case Studies ({portfolio.length})</h2>
              <p className="text-slate-500 text-xs">These projects appear on your profile to demonstrate proof of craftsmanship to potential clients.</p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddProject}
              className="btn btn-outline btn-sm"
            >
              <PlusCircle size={14} />
              <span>Add New</span>
            </button>
          </div>

          <div className="portfolio-projects-grid">
            {portfolio.map((proj) => (
              <div key={proj.id} className={`portfolio-project-card ${proj.pinned ? 'pinned-card' : ''}`}>
                <div className="proj-card-header">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="proj-title">{proj.title}</h3>
                        {proj.pinned && (
                          <span className="pinned-badge">
                            <Pin size={10} />
                            <span>Pinned to Top</span>
                          </span>
                        )}
                      </div>
                      <div className="proj-meta-line">
                        <MapPin size={12} className="text-cyan-600" />
                        <span>{proj.subCity}</span>
                        <span>•</span>
                        <Clock size={12} className="text-slate-400" />
                        <span>{proj.duration}</span>
                      </div>
                    </div>

                    <span className="proj-cost-pill">{proj.cost}</span>
                  </div>
                </div>

                <p className="proj-desc-text">{proj.description}</p>

                {/* Before / After Photo Comparison Cards */}
                <div className="before-after-strip">
                  <div className="photo-preview-chip">
                    <span className="photo-label">Before (Issue)</span>
                  </div>
                  <div className="photo-preview-chip success">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>After (Repaired & Sealed)</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="proj-tags-row">
                  {proj.tags?.map((t, idx) => (
                    <span key={idx} className="svc-tag-chip">{t}</span>
                  ))}
                </div>

                {/* Client Feedback Quote */}
                {proj.clientFeedback && (
                  <div className="proj-testimonial-box">
                    <p className="testimonial-text">{proj.clientFeedback}</p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="proj-card-actions-bar">
                  <button
                    type="button"
                    onClick={() => {
                      togglePinProject(proj.id);
                      showToast(proj.pinned ? 'Unpinned project' : 'Pinned project to top of profile! 📌', 'info');
                    }}
                    className={`pin-toggle-btn ${proj.pinned ? 'pinned' : ''}`}
                    title={proj.pinned ? 'Unpin from Top' : 'Pin to Top'}
                  >
                    <Pin size={13} />
                    <span>{proj.pinned ? 'Pinned' : 'Pin to Top'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProject(proj)}
                      className="icon-action-btn"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePortfolioProject(proj.id);
                        showToast('Project removed from portfolio', 'info');
                      }}
                      className="icon-action-btn delete"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB 2: CUSTOMER REVIEWS & REPLIES ── */}
      {activeTab === 'reviews' && (
        <section className="reviews-studio-section">
          {/* Top Rating Summary Banner */}
          <div className="reviews-summary-glass-banner">
            <div className="rating-score-overview">
              <div className="flex items-center gap-2">
                <Star size={28} fill="#F59E0B" className="text-amber-500" />
                <span className="big-rating-num">{profile.rating || 4.9}</span>
                <span className="rating-out-of">/ 5.0</span>
              </div>
              <p className="rating-desc-text">Based on {reviews.length} verified completed escrow jobs in Addis Ababa</p>
            </div>

            <div className="rating-bars-stack">
              <div className="rating-bar-row">
                <span className="star-level">5 Star</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '92%' }} /></div>
                <span className="bar-pct">92%</span>
              </div>
              <div className="rating-bar-row">
                <span className="star-level">4 Star</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '8%' }} /></div>
                <span className="bar-pct">8%</span>
              </div>
              <div className="rating-bar-row">
                <span className="star-level">3 Star</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '0%' }} /></div>
                <span className="bar-pct">0%</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-feed-stack mt-4">
            {reviews.map((rev) => (
              <div key={rev.id} className={`review-studio-card ${rev.pinned ? 'pinned-review' : ''}`}>
                <div className="review-header-row">
                  <div className="reviewer-info-block">
                    <div className="reviewer-avatar">
                      {rev.author?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="reviewer-name">{rev.author}</strong>
                        {rev.pinned && (
                          <span className="pinned-badge">
                            <Pin size={10} />
                            <span>Featured Testimonial</span>
                          </span>
                        )}
                      </div>
                      <span className="reviewer-meta">{rev.subCity || 'Bole, Addis Ababa'} • {rev.serviceName || 'Specialist Service'} • {rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="stars-row flex gap-0.5">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        togglePinReview(rev.id);
                        showToast(rev.pinned ? 'Unpinned review' : 'Pinned review to top! 📌', 'info');
                      }}
                      className="icon-action-btn"
                      title={rev.pinned ? 'Unpin review' : 'Pin to Top of Profile'}
                    >
                      <Pin size={13} className={rev.pinned ? 'text-amber-600' : ''} />
                    </button>
                  </div>
                </div>

                <p className="review-comment-text">"{rev.comment}"</p>

                {/* ── Official Specialist Reply Block ── */}
                {rev.providerReply ? (
                  <div className="provider-official-reply-box">
                    <div className="reply-header">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-cyan-600" />
                        <strong className="text-slate-900 text-xs">Response from {profile.name} (Specialist)</strong>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.providerReply.repliedAt}</span>
                    </div>
                    <p className="reply-body-text">{rev.providerReply.text}</p>
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div className="reply-input-box">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Write a polite response to ${rev.author}...`}
                          rows={2}
                          className="form-input form-textarea text-xs"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(rev.id)}
                            className="btn btn-primary btn-sm text-xs"
                          >
                            <Send size={12} />
                            <span>Publish Response</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="write-reply-btn"
                      >
                        <Reply size={13} />
                        <span>Write Official Reply to {rev.author}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB 3: CREDENTIALS & TRUST BADGES ── */}
      {activeTab === 'credentials' && (
        <section className="credentials-studio-section">
          <div className="section-title-row">
            <div>
              <h2 className="section-heading">Verified Ethiopian Credentials & Licenses ({credentials.length})</h2>
              <p className="text-slate-500 text-xs">These verified badges show on your profile and boost your AI match recommendation ranking.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCredTitle('');
                setCredIssuer('');
                setIsCredModalOpen(true);
              }}
              className="btn btn-outline btn-sm"
            >
              <PlusCircle size={14} />
              <span>Add Certificate</span>
            </button>
          </div>

          <div className="credentials-cards-grid">
            {credentials.map((cred) => (
              <div key={cred.id} className="credential-studio-card">
                <div className="cred-icon-wrap">
                  <ShieldCheck size={22} className="text-emerald-600" />
                </div>

                <div className="cred-main-info">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="cred-title-text">{cred.title}</strong>
                    <span className="cred-status-pill">{cred.status}</span>
                  </div>

                  <span className="cred-issuer-text">{cred.issuer} • {cred.date}</span>
                  <span className="cred-ref-code">Ref: {cred.docRef}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeCredential(cred.id);
                    showToast('Credential removed', 'info');
                  }}
                  className="icon-action-btn delete"
                  title="Remove credential"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MODAL 1: ADD / EDIT PORTFOLIO PROJECT ── */}
      {isProjectModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-card modal-card-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="modal-title">
                    {editingProjectId ? 'Edit Project Case Study' : 'Publish Project Case Study'}
                  </h3>
                  <p className="modal-subtitle">Visible on your public LINC portfolio</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsProjectModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Emergency PPR Mainline Valve Replacement"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Addis Ababa Sub-City / Area</label>
                  <select
                    value={projectSubCity}
                    onChange={(e) => setProjectSubCity(e.target.value)}
                    className="form-input"
                  >
                    {SUB_CITIES.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Cost (ETB)</label>
                  <div className="rate-input-wrap">
                    <span className="rate-prefix">ETB</span>
                    <input
                      type="number"
                      value={projectCost}
                      onChange={(e) => setProjectCost(e.target.value)}
                      className="rate-field"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    value={projectDuration}
                    onChange={(e) => setProjectDuration(e.target.value)}
                    placeholder="e.g. 1.5 hours, 2 days"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={projectTags}
                    onChange={(e) => setProjectTags(e.target.value)}
                    placeholder="e.g. Plumbing, Emergency, PPR"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technical Description & Problem/Solution</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Explain the initial diagnosis, tools used, and how the repair was permanently resolved..."
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Feedback Quote (Optional)</label>
                <input
                  type="text"
                  value={projectFeedback}
                  onChange={(e) => setProjectFeedback(e.target.value)}
                  placeholder="e.g. Arrived in 20 minutes and stopped our apartment from flooding!"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{editingProjectId ? 'Save Changes' : 'Publish Case Study'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD CREDENTIAL ── */}
      {isCredModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCredModalOpen(false)}>
          <div className="modal-card modal-card-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Add Verified Credential / License</h3>
                  <p className="modal-subtitle">Linked to your Ethiopian Specialist Profile</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCredModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCredential} className="modal-body">
              <div className="form-group">
                <label className="form-label">Credential / License Title</label>
                <input
                  type="text"
                  value={credTitle}
                  onChange={(e) => setCredTitle(e.target.value)}
                  placeholder="e.g. Entoto TVET Certified Electrician"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Authority / Institution</label>
                <input
                  type="text"
                  value={credIssuer}
                  onChange={(e) => setCredIssuer(e.target.value)}
                  placeholder="e.g. FDRE Ministry of Labor and Skills"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Validity / Issue Date</label>
                <input
                  type="text"
                  value={credDate}
                  onChange={(e) => setCredDate(e.target.value)}
                  placeholder="e.g. 2025–2028"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsCredModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Verify & Add Badge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
