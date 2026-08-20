import { useState } from 'react';
import { Server, Check, X, RefreshCw } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';
import { getApiBaseUrl } from '../../services/api';

export default function ServerConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(APP_CONFIG.storageKeys.apiUrl, cleanUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    localStorage.removeItem(APP_CONFIG.storageKeys.apiUrl);
    setUrl(APP_CONFIG.defaultApiUrl);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Server size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Server Connection</h3>
              <p className="modal-subtitle">Configure backend API address for local or remote testing</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="form-group">
            <label className="form-label">Backend API URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:5000/api or http://192.168.1.5:5000/api"
              className="form-input"
              required
            />
            <span className="form-hint">
              Default is <code>{APP_CONFIG.defaultApiUrl}</code>
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              title="Reset to default"
            >
              <RefreshCw size={14} />
              Reset Default
            </button>
            <div className="modal-action-right">
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved!' : 'Save & Reload'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
