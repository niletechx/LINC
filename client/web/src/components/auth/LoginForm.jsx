import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import DemoAccounts from './DemoAccounts';

export default function LoginForm({ onSwitchToSignup, onOpenForgotPassword, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const { login, loginAsDemo, isLoading, error: storeError, clearError } = useAuthStore();

  const handleAutofill = (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setLocalError('');
    clearError();
  };

  const handleDirectDemo = (roleOrId) => {
    loginAsDemo(roleOrId);
    if (onSuccess) onSuccess();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      await login({ email: trimmedEmail, password });
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
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-subtitle">
          Sign in to access your LINC service dashboard and chats
        </p>
      </div>

      {/* Demo Accounts Quick Autofill & Login */}
      <DemoAccounts
        onSelectAccount={handleAutofill}
        onDirectLogin={handleDirectDemo}
      />

      {/* Error Alert with Offline / Demo Mode Fallback */}
      {displayError && (
        <div className="auth-error-banner animate-fade-in">
          <div className="auth-error-top">
            <AlertCircle size={16} className="text-red flex-shrink-0" />
            <span className="auth-error-msg">{displayError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleDirectDemo('client')}
            className="auth-error-demo-btn"
          >
            <Sparkles size={13} />
            Continue in Offline Demo Mode 👉
          </button>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Email Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Email Address
          </label>
          <div className="input-with-icon">
            <Mail size={17} className="input-icon" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input has-left-icon"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={onOpenForgotPassword}
              className="form-link-text"
            >
              Forgot password?
            </button>
          </div>
          <div className="input-with-icon">
            <Lock size={17} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input has-left-icon has-right-icon"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="input-eye-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="form-checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox-input"
            />
            <span className="checkbox-text">Keep me signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full submit-btn"
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <span>Sign In to LINC</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span className="divider-line" />
        <span className="divider-label">or continue with</span>
        <span className="divider-line" />
      </div>

      {/* Social Buttons */}
      <div className="social-auth-grid">
        <button
          type="button"
          onClick={() => handleDirectDemo('client')}
          className="social-btn google-btn"
        >
          <span className="social-g-icon">G</span>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleDirectDemo('provider')}
          className="social-btn apple-btn"
        >
          <span className="social-apple-icon"></span>
          <span>Apple</span>
        </button>
      </div>

      {/* Toggle to Signup */}
      <div className="auth-switch-footer">
        <span className="switch-text">Don't have an account?</span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="switch-action-btn"
        >
          Create an Account
        </button>
      </div>
    </div>
  );
}
