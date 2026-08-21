import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Info, 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useProviderStore } from '../stores/providerStore';
import { providerService } from '../services/providerService';

export default function ProviderSetupPage() {
  const navigate = useNavigate();
  const { setAppMode, showToast } = useAppStore();
  const { updateProfile } = useProviderStore();

  const [selectedCategory, setSelectedCategory] = useState('plumbing');
  const [headline, setHeadline] = useState('Master Plumber & Pipe Specialist');
  const [rate, setRate] = useState('350');
  const [city, setCity] = useState('Bole, Addis Ababa');
  const [bio, setBio] = useState('Certified technician with 6+ years experience in Addis Ababa. I carry modern diagnostic tools, offer quick same-day emergency repairs, and guarantee all my work with escrow safety.');
  const [availability, setAvailability] = useState('available');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { id: '1', slug: 'plumbing', name: 'Plumbing & Water', emoji: '🔧', headline: 'Master Plumber & Pipe Specialist' },
    { id: '3', slug: 'electric', name: 'Electrical Work', emoji: '⚡', headline: 'Certified Electrician & Wiring Pro' },
    { id: '2', slug: 'cleaning', name: 'Cleaning & Maid', emoji: '🧹', headline: 'Professional Deep Cleaning Specialist' },
    { id: '4', slug: 'it-tech', name: 'IT & Computer', emoji: '💻', headline: 'Computer Repair & IT Technician' },
    { id: '5', slug: 'tutoring', name: 'Tutoring & Skills', emoji: '📚', headline: 'Experienced Academic & Language Tutor' },
    { id: '6', slug: 'transport', name: 'Transport & Cargo', emoji: '🚗', headline: 'Safe Driver & Moving Logistics Pro' },
    { id: '7', slug: 'wellness', name: 'Health & Wellness', emoji: '💆', headline: 'Certified Personal Trainer & Wellness Pro' },
    { id: '8', slug: 'creative', name: 'Painting & Design', emoji: '🎨', headline: 'Interior Painter & Decorating Specialist' },
  ];

  const locationSuggestions = [
    'Bole, Addis Ababa',
    'Kazanchis, Addis Ababa',
    'Sarbet, Addis Ababa',
    'CMC / Ayat, Addis Ababa',
    'Piassa / Arada, Addis Ababa',
    'Megenagna, Addis Ababa',
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.slug);
    if (!headline || categories.some(c => c.headline === headline)) {
      setHeadline(cat.headline);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const profilePayload = {
      tradeCategory: selectedCategory,
      headline,
      hourlyRate: Number(rate) || 350,
      location: city,
      bio,
      isAvailable: availability === 'available',
    };

    updateProfile(profilePayload);

    try {
      await providerService.updateMyProfile({
        headline,
        bio,
        hourly_rate: Number(rate) || 350,
        is_available: availability === 'available',
      });
    } catch (_) {
      // Local state is already updated
    } finally {
      setIsSaving(false);
      setAppMode('provider');
      showToast('🎉 Provider profile launched! You are now live on the LINC marketplace.', 'success');
      navigate('/home');
    }
  };

  return (
    <div className="provider-setup-container">
      {/* ── Top Navigation Bar ── */}
      <div className="setup-top-nav">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="back-icon-btn"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/home')} 
          className="skip-btn"
        >
          Skip for now
        </button>
      </div>

      {/* ── 1. Frosted Glass Hero Banner ── */}
      <section className="setup-hero-card">
        <div className="setup-hero-identity">
          <div className="setup-icon-box">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="setup-title">Become a Verified Specialist 💼</h1>
            <p className="setup-subtitle">
              Set up your public profile, rates, and coverage area to start receiving client bookings in Addis Ababa.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Step Cards Stack ── */}
      <div className="setup-form-stack">
        {/* Step 1: Specialty */}
        <div className="setup-step-glass-card">
          <div className="step-card-header">
            <h3 className="step-title">1. Primary Trade / Specialty</h3>
            <p className="step-sub">Select the main category of services you provide</p>
          </div>

          <div className="category-chips-grid">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`trade-category-chip ${isSelected ? 'selected' : ''}`}
                >
                  <span className="trade-emoji">{cat.emoji}</span>
                  <span className="trade-name">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Headline */}
        <div className="setup-step-glass-card">
          <div className="step-card-header">
            <h3 className="step-title">2. Professional Headline</h3>
            <p className="step-sub">This appears prominently on your search card and profile</p>
          </div>

          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Certified Electrician & Home Wiring Pro"
            className="setup-text-input"
          />
        </div>

        {/* Step 3: Hourly Rate & Location */}
        <div className="setup-step-glass-card">
          <div className="step-card-header">
            <h3 className="step-title">3. Rates & Operating Location</h3>
            <p className="step-sub">Set your baseline hourly rate in ETB and your Addis sub-city base</p>
          </div>

          <div className="rate-location-grid">
            <div className="input-group">
              <label className="input-label">Hourly Rate (ETB / hr)</label>
              <div className="rate-input-wrap">
                <span className="rate-prefix">ETB</span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="rate-field"
                />
                <span className="rate-suffix">/hr</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">City / Sub-City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="setup-text-input"
              />
            </div>
          </div>

          <div className="location-chips-row">
            {locationSuggestions.map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCity(loc)}
                className="location-suggest-chip"
              >
                <MapPin size={11} />
                <span>{loc.split(',')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Bio & Experience */}
        <div className="setup-step-glass-card">
          <div className="step-card-header">
            <h3 className="step-title">4. About Your Services & Experience</h3>
            <p className="step-sub">Highlight your experience, tools, certifications, and response time</p>
          </div>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your services..."
            rows={4}
            className="setup-textarea"
          />
        </div>

        {/* Step 5: Availability */}
        <div className="setup-step-glass-card">
          <div className="step-card-header">
            <h3 className="step-title">5. Initial Availability Status</h3>
            <p className="step-sub">Clients can see your live status across the marketplace</p>
          </div>

          <div className="availability-options-row">
            <div
              onClick={() => setAvailability('available')}
              className={`availability-card ${availability === 'available' ? 'selected' : ''}`}
            >
              <strong className="avail-title text-emerald-700">🟢 Available Now</strong>
              <span className="avail-sub">Accepting urgent & scheduled tasks</span>
            </div>

            <div
              onClick={() => setAvailability('busy')}
              className={`availability-card ${availability === 'busy' ? 'selected' : ''}`}
            >
              <strong className="avail-title text-amber-700">🟡 Scheduled / Busy</strong>
              <span className="avail-sub">Accepting advance bookings only</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="setup-save-btn"
        >
          <Sparkles size={18} />
          <span>{isSaving ? 'Launching Profile...' : 'Save & Launch Provider Profile 🚀'}</span>
        </button>
      </div>
    </div>
  );
}
