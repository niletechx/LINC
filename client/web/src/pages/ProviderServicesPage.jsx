import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  PlusCircle, 
  MapPin, 
  Clock, 
  DollarSign, 
  Zap, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Eye, 
  Sliders,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useProviderStore } from '../stores/providerStore';
import { useAppStore } from '../stores/appStore';
import { serviceCatalogService } from '../services/serviceCatalogService';
import { providerService } from '../services/providerService';

const ALL_ADDIS_SUBCITIES = [
  'Bole',
  'Kazanchis',
  'Sarbet',
  'CMC / Ayat',
  'Megenagna',
  'Gerji',
  'Piassa / Arada',
  'Kirkos',
  'Lideta',
  'Kolfe Keranio',
  'Nifas Silk',
  'Akaki Kality',
];

export default function ProviderServicesPage() {
  const navigate = useNavigate();
  const { 
    profile, 
    services, 
    toggleAvailability, 
    updateProfile, 
    toggleCoverageSubCity, 
    addService, 
    updateService, 
    deleteService, 
    toggleServiceActive 
  } = useProviderStore();

  const { showToast } = useAppStore();

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDuration, setFormDuration] = useState('1–2 hours');
  const [formFixed, setFormFixed] = useState(false);
  const [formAmount, setFormAmount] = useState('350');
  const [formEmergency, setFormEmergency] = useState(true);
  const [formTags, setFormTags] = useState('Emergency, Repair');

  // Rates & Profile form states
  const [hourlyRate, setHourlyRate] = useState(String(profile.hourlyRate || 350));
  const [emergencySurcharge, setEmergencySurcharge] = useState(String(profile.emergencySurcharge || 250));
  const [headline, setHeadline] = useState(profile.headline || '');
  const [bio, setBio] = useState(profile.bio || '');

  // Keep local form in sync when profile changes
  useEffect(() => {
    setHourlyRate(String(profile.hourlyRate || 350));
    setEmergencySurcharge(String(profile.emergencySurcharge || 250));
    setHeadline(profile.headline || '');
    setBio(profile.bio || '');
  }, [profile]);

  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setFormName('');
    setFormDesc('');
    setFormDuration('1–2 hours');
    setFormFixed(false);
    setFormAmount('350');
    setFormEmergency(true);
    setFormTags('Emergency, Plumbing, Same-day');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingServiceId(service.id);
    setFormName(service.name);
    setFormDesc(service.description);
    setFormDuration(service.duration);
    setFormFixed(service.fixed);
    setFormAmount(String(service.amount));
    setFormEmergency(!!service.emergencyAvailable);
    setFormTags(service.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formAmount) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingServiceId) {
        if (!editingServiceId.startsWith('svc-')) {
          await serviceCatalogService.updateService(editingServiceId, {
            title: formName,
            description: formDesc,
            price_amount: Number(formAmount),
            price_type: formFixed ? 'fixed' : 'hourly',
            tags: tagsArray,
          });
        }
        updateService(editingServiceId, {
          name: formName,
          description: formDesc,
          duration: formDuration,
          fixed: formFixed,
          amount: Number(formAmount),
          price: formFixed ? `${formAmount} ETB` : `${formAmount} ETB/hr`,
          emergencyAvailable: formEmergency,
          tags: tagsArray,
        });
        showToast('Service package updated successfully! 🛠️', 'success');
      } else {
        try {
          await serviceCatalogService.createService({
            title: formName,
            description: formDesc,
            price_amount: Number(formAmount),
            price_type: formFixed ? 'fixed' : 'hourly',
            category_id: profile.tradeCategory || 'plumbing',
            tags: tagsArray,
          });
        } catch (_) {}
        addService({
          name: formName,
          description: formDesc,
          duration: formDuration,
          fixed: formFixed,
          amount: Number(formAmount),
          emergencyAvailable: formEmergency,
          tags: tagsArray,
        });
        showToast('New service package added to your public catalog! 🎉', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Updated catalog locally', 'info');
    }

    setIsModalOpen(false);
  };

  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    const updates = {
      hourlyRate: Number(hourlyRate) || 350,
      emergencySurcharge: Number(emergencySurcharge) || 250,
      headline,
      bio,
    };
    updateProfile(updates);

    try {
      await providerService.updateMyProfile({
        headline,
        bio,
        hourly_rate: Number(hourlyRate) || 350,
        emergency_surcharge: Number(emergencySurcharge) || 250,
      });
    } catch (_) {}

    showToast('Rates, headline, and profile settings saved! 💾', 'success');
  };

  return (
    <div className="provider-services-page-wrapper">
      {/* ── 1. Page Header ── */}
      <header className="provider-page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="provider-page-title">Services Catalog, Pricing & Availability</h1>
            <span className="escrow-vault-chip">
              <Sparkles size={12} className="text-cyan-600" />
              <span>Live on Addis Marketplace</span>
            </span>
          </div>
          <p className="provider-page-sub">
            Configure your custom trade offerings, baseline hourly ETB rates, emergency surcharges, and Addis Ababa operating sub-cities.
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

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn btn-primary"
          >
            <PlusCircle size={15} />
            <span>Add Service Package</span>
          </button>
        </div>
      </header>

      {/* ── 2. Live Availability & Baseline Rates Banner ── */}
      <section className="provider-services-banner-card">
        <div className="availability-status-control">
          <div>
            <span className="control-sub">MARKETPLACE STATUS</span>
            <h3 className="control-title">
              {profile.isAvailable ? '🟢 Online & Accepting Bookings' : '🟡 Busy / Advance Bookings Only'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleAvailability();
              showToast(
                profile.isAvailable ? 'Status set to Busy' : 'Status set to Available! 🟢',
                'info'
              );
            }}
            className={`avail-switch-pill ${profile.isAvailable ? 'available' : 'busy'}`}
          >
            <span className="status-dot" />
            <span>{profile.isAvailable ? 'Online' : 'Busy'}</span>
          </button>
        </div>

        <div className="rates-quick-pills-row">
          <div className="rate-chip">
            <span className="rate-label">Baseline Rate:</span>
            <strong className="rate-val">{profile.hourlyRate} ETB / hr</strong>
          </div>
          <div className="rate-chip">
            <span className="rate-label">Emergency Surcharge:</span>
            <strong className="rate-val text-amber-600">+{profile.emergencySurcharge} ETB</strong>
          </div>
          <div className="rate-chip">
            <span className="rate-label">Active Coverage:</span>
            <strong className="rate-val text-cyan-700">{profile.coverageSubCities?.length || 6} Sub-Cities</strong>
          </div>
        </div>
      </section>

      {/* ── 3. Services Packages Catalog ── */}
      <section className="services-catalog-section">
        <div className="section-title-row">
          <div>
            <h2 className="section-heading">Service Packages ({services.length})</h2>
            <p className="text-slate-500 text-xs">These packages appear with direct instant escrow booking buttons on your profile.</p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn btn-outline btn-sm"
          >
            <PlusCircle size={14} />
            <span>Add New</span>
          </button>
        </div>

        <div className="services-packages-grid">
          {services.map((svc) => (
            <div key={svc.id} className={`service-package-card ${!svc.active ? 'inactive' : ''}`}>
              <div className="svc-card-header">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="svc-title">{svc.name}</h3>
                    {svc.fixed ? (
                      <span className="fixed-pill">Fixed Price</span>
                    ) : (
                      <span className="hourly-pill">Hourly Rate</span>
                    )}
                    {svc.emergencyAvailable && (
                      <span className="emergency-pill">⚡ Emergency 24/7</span>
                    )}
                  </div>
                  <span className="svc-duration">⏱️ Estimated duration: {svc.duration}</span>
                </div>

                <div className="svc-price-box">
                  <strong className="svc-price-amount">{svc.price}</strong>
                </div>
              </div>

              <p className="svc-desc">{svc.description}</p>

              <div className="svc-tags-row">
                {svc.tags?.map((t, idx) => (
                  <span key={idx} className="svc-tag-chip">{t}</span>
                ))}
              </div>

              <div className="svc-card-actions">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleServiceActive(svc.id)}
                    className={`toggle-active-btn ${svc.active ? 'active' : 'inactive'}`}
                  >
                    <span>{svc.active ? 'Active on Profile ✓' : 'Hidden / Paused'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(svc)}
                    className="icon-action-btn"
                    title="Edit Service"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteService(svc.id);
                      showToast('Service package removed', 'info');
                    }}
                    className="icon-action-btn delete"
                    title="Delete Service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Coverage Sub-Cities in Addis Ababa ── */}
      <section className="coverage-subcities-section">
        <div className="section-title-row">
          <div>
            <h2 className="section-heading">Operating Sub-Cities & Coverage Radius</h2>
            <p className="text-slate-500 text-xs">Toggle the Addis Ababa zones where you accept on-site appointments and emergency callouts.</p>
          </div>
          <span className="badge-emerald-text">
            {profile.coverageSubCities?.length} of {ALL_ADDIS_SUBCITIES.length} Selected
          </span>
        </div>

        <div className="subcities-multi-select-grid">
          {ALL_ADDIS_SUBCITIES.map((sub) => {
            const isSelected = profile.coverageSubCities?.includes(sub);
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  toggleCoverageSubCity(sub);
                  showToast(`${sub} coverage ${isSelected ? 'removed' : 'added'}`, 'info');
                }}
                className={`subcity-select-chip ${isSelected ? 'selected' : ''}`}
              >
                <MapPin size={13} className={isSelected ? 'text-cyan-600' : 'text-slate-400'} />
                <span>{sub}</span>
                {isSelected && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 5. Baseline Rates & Bio Settings ── */}
      <section className="rates-bio-editor-section">
        <h2 className="section-heading mb-2">Hourly Rates, Emergency Surcharge & Bio</h2>
        <form onSubmit={handleSaveProfileSettings} className="rates-bio-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Baseline Hourly Labor Rate (ETB / hr)</label>
              <div className="rate-input-wrap">
                <span className="rate-prefix">ETB</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="rate-field"
                  required
                />
                <span className="rate-suffix">/hr</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Callout Surcharge (ETB)</label>
              <div className="rate-input-wrap">
                <span className="rate-prefix">+ETB</span>
                <input
                  type="number"
                  value={emergencySurcharge}
                  onChange={(e) => setEmergencySurcharge(e.target.value)}
                  className="rate-field"
                  required
                />
                <span className="rate-suffix">flat fee</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Master Plumber & Pipe Specialist • Bole & Kazanchis"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">About / Bio & Certifications</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your experience, tools, certifications, and response time..."
              rows={3}
              className="form-input form-textarea"
              required
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Save Rates & Profile Info</span>
            </button>
          </div>
        </form>
      </section>

      {/* ── MODAL: ADD / EDIT SERVICE PACKAGE ── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="modal-title">
                    {editingServiceId ? 'Edit Service Package' : 'Create New Service Package'}
                  </h3>
                  <p className="modal-subtitle">Visible on your public LINC profile</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="modal-body">
              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Emergency Pipe Burst Repair"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description of Service</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="What is included, tools used, inspection guarantee..."
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              {/* Pricing Type & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Pricing Type</label>
                  <select
                    value={formFixed ? 'fixed' : 'hourly'}
                    onChange={(e) => setFormFixed(e.target.value === 'fixed')}
                    className="form-input"
                  >
                    <option value="hourly">Hourly Rate (ETB / hr)</option>
                    <option value="fixed">Fixed Package Price (ETB)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{formFixed ? 'Fixed Price (ETB)' : 'Hourly Rate (ETB)'}</label>
                  <div className="rate-input-wrap">
                    <span className="rate-prefix">ETB</span>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="rate-field"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 1–2 hours, Half day"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. Emergency, PPR, Leak"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEmergency}
                    onChange={(e) => setFormEmergency(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Available for 24/7 Urgent & Emergency Callouts 🚨
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>{editingServiceId ? 'Save Changes' : 'Publish Service Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
