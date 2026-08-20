import { useState } from 'react';
import { PlusCircle, X, Sparkles, Check } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { SERVICE_CATEGORIES, ADDIS_SUB_CITIES } from '../../config/constants';

export default function PostRequestModal() {
  const { isPostRequestOpen, setPostRequestOpen, showToast, currentLocation } = useAppStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0].name);
  const [location, setLocation] = useState(currentLocation);
  const [budget, setBudget] = useState('500–1000 ETB');
  const [urgency, setUrgency] = useState('Immediate (Today)');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPostRequestOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setPostRequestOpen(false);
      showToast('Work request posted successfully! Local pros will send quotes shortly.', 'success');
      setTitle('');
      setDescription('');
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={() => setPostRequestOpen(false)}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <PlusCircle size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Post a Work Request</h3>
              <p className="modal-subtitle">Describe your job and receive competitive quotes from verified pros</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setPostRequestOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need licensed plumber for kitchen pipe leak"
              className="form-input"
              required
            />
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input form-select"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Area</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input form-select"
              >
                {ADDIS_SUB_CITIES.map((loc, idx) => (
                  <option key={idx} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-two">
            <div className="form-group">
              <label className="form-label">Budget Range (ETB)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 500–1000 ETB"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="form-input form-select"
              >
                <option value="Immediate (Today)">⚡ Immediate (Today)</option>
                <option value="Within 2-3 Days">📅 Within 2-3 Days</option>
                <option value="This Weekend">🌴 This Weekend</option>
                <option value="Flexible">✨ Flexible</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue, required tools, parts needed, or specific timing requirements..."
              rows={3}
              className="form-input form-textarea"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setPostRequestOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? (
                'Posting...'
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publish Work Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
