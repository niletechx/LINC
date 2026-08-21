import React, { useState } from 'react';
import { User, X, CheckCircle2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { ADDIS_SUB_CITIES } from '../../config/constants';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, setUser } = useAuthStore();
  const { showToast } = useAppStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [locationCity, setLocationCity] = useState(user?.location_city || 'Addis Ababa');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await userService.updateMe({
        full_name: fullName.trim(),
        phone: phone.trim(),
        location_city: locationCity,
        headline: headline.trim(),
        bio: bio.trim(),
      });
      setUser({ ...user, ...updated });
      showToast('Profile updated successfully! ✨', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <User size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Edit Account Profile</h3>
              <p className="modal-subtitle">Update your personal contact & location information</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="form-group">
              <label className="form-label">Phone Number (Telebirr/CBE)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sub-City / Area</label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="form-input"
              >
                {ADDIS_SUB_CITIES.map((sc, i) => (
                  <option key={i} value={sc.split(',')[0]}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Headline / Title</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Homeowner in Bole Rwanda or Master Plumber"
              className="form-input"
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">About / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short introduction about yourself..."
              rows={3}
              className="form-input form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
