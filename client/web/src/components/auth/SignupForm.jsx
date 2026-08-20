import { useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, AlertCircle, Briefcase, Sparkles, MapPin, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { SERVICE_CATEGORIES, ADDIS_SUB_CITIES } from '../../config/constants';

export default function SignupForm({ onSwitchToLogin, onSuccess }) {
  const [role, setRole] = useState('client'); // 'client' | 'provider'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Provider Specific
  const [selectedCategory, setSelectedCategory] = useState(SERVICE_CATEGORIES[0].slug);
  const [headline, setHeadline] = useState(SERVICE_CATEGORIES[0].suggestedHeadline);
  const [hourlyRate, setHourlyRate] = useState('350');
  const [locationCity, setLocationCity] = useState(ADDIS_SUB_CITIES[0]);

  const [localError, setLocalError] = useState('');

  const { register, loginAsDemo, isLoading, error: storeError, clearError } = useAuthStore();

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.slug);
    if (!headline || SERVICE_CATEGORIES.some((c) => c.suggestedHeadline === headline)) {
      setHeadline(cat.suggestedHeadline);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength();
  const strengthLabels = ['Too weak', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (trimmedName.length < 2) {
      setLocalError('Full name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    let cleanUsername = trimmedName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      cleanUsername = `${cleanUsername}_${Date.now().toString().slice(-4)}`;
    }

    try {
      await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        username: cleanUsername,
        phone: trimmedPhone ? `+251${trimmedPhone.replace(/^\+?251|^0/, '')}` : undefined,
        role,
        locationCity,
        headline: role === 'provider' ? headline : undefined,
      });

      if (onSuccess) onSuccess();
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || storeError;

  return (
    <div className="auth-form-wrapper">
      {/* Form Header */}
      <div className="auth-form-header">
        <h2 className="auth-form-title">Create an Account</h2>
        <p className="auth-form-subtitle">
          Join LINC to discover and offer trusted services in Ethiopia
        </p>
      </div>

      {/* Role Selection Toggle */}
      <div className="role-switcher-container">
        <button
          type="button"
          onClick={() => setRole('client')}
          className={`role-switcher-btn ${role === 'client' ? 'active' : ''}`}
        >
          <div className="role-btn-icon">
            <User size={16} />
          </div>
          <div className="role-btn-text">
            <span className="role-btn-title">Client</span>
            <span className="role-btn-desc">I want to hire & book</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('provider')}
          className={`role-switcher-btn ${role === 'provider' ? 'active' : ''}`}
        >
          <div className="role-btn-icon">
            <Briefcase size={16} />
          </div>
          <div className="role-btn-text">
            <span className="role-btn-title">Service Provider</span>
            <span className="role-btn-desc">I want to offer services</span>
          </div>
        </button>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="auth-error-banner animate-fade-in">
          <div className="auth-error-top">
            <AlertCircle size={16} className="text-red flex-shrink-0" />
            <span className="auth-error-msg">{displayError}</span>
          </div>
          <button
            type="button"
            onClick={() => loginAsDemo(role)}
            className="auth-error-demo-btn"
          >
            <Sparkles size={13} />
            Explore in Offline Demo Mode 👉
          </button>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">
            Full Name
          </label>
          <div className="input-with-icon">
            <User size={17} className="input-icon" />
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="form-input has-left-icon"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">
            Email Address
          </label>
          <div className="input-with-icon">
            <Mail size={17} className="input-icon" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abebe@example.com"
              className="form-input has-left-icon"
              required
            />
          </div>
        </div>

        {/* Phone with +251 Country Code */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-phone">
            Phone Number (Optional)
          </label>
          <div className="input-phone-group">
            <div className="phone-prefix-badge">
              <span>🇪🇹 +251</span>
            </div>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="911 234 567"
              className="form-input phone-input"
            />
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="form-row-two">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="form-input has-left-icon has-right-icon"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="form-input has-left-icon"
                required
              />
            </div>
          </div>
        </div>

        {/* Password Strength Meter */}
        {password && (
          <div className="password-strength-container">
            <div className="strength-bars">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="strength-bar"
                  style={{
                    backgroundColor:
                      idx < strengthScore
                        ? strengthColors[strengthScore - 1]
                        : '#E2E8F0',
                  }}
                />
              ))}
            </div>
            <div className="strength-label" style={{ color: strengthColors[strengthScore - 1] || '#94A3B8' }}>
              {strengthLabels[strengthScore - 1] || 'Enter password'}
            </div>
          </div>
        )}

        {/* ── Provider Specific Onboarding Section ── */}
        {role === 'provider' && (
          <div className="provider-onboarding-box animate-fade-in">
            <div className="provider-box-header">
              <Briefcase size={16} className="text-cyan" />
              <h4 className="provider-box-title">Provider Service Details</h4>
            </div>

            {/* Specialty Selection */}
            <div className="form-group">
              <label className="form-label">Primary Trade / Specialty</label>
              <div className="category-chips-wrap">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`cat-chip ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="cat-chip-emoji">{cat.emoji}</span>
                      <span className="cat-chip-name">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Headline */}
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Master Plumber & Pipe Specialist"
                className="form-input"
                required={role === 'provider'}
              />
            </div>

            {/* Hourly Rate & Sub-city */}
            <div className="form-row-two">
              <div className="form-group">
                <label className="form-label">Hourly Rate (ETB)</label>
                <div className="input-with-icon">
                  <DollarSign size={16} className="input-icon" />
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="350"
                    className="form-input has-left-icon"
                    min="50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Sub-city</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <select
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="form-input form-select has-left-icon"
                  >
                    {ADDIS_SUB_CITIES.map((city, idx) => (
                      <option key={idx} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full submit-btn mt-2"
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <span>
                {role === 'provider'
                  ? 'Create Provider Account 🚀'
                  : 'Create Client Account'}
              </span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="auth-switch-footer">
        <span className="switch-text">Already have an account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="switch-action-btn"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
