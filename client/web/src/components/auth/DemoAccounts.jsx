import { Zap, User, Wrench } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../../config/constants';

export default function DemoAccounts({ onSelectAccount, onDirectLogin }) {
  return (
    <div className="demo-accounts-container">
      <div className="demo-accounts-header">
        <Zap size={14} className="text-cyan animate-pulse" />
        <span className="demo-header-title">Quick Demo Logins (Instant 1-Click)</span>
      </div>

      <div className="demo-accounts-grid">
        {DEMO_ACCOUNTS.map((acc) => {
          const isProvider = acc.role === 'provider';
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => {
                if (onSelectAccount) {
                  onSelectAccount(acc);
                } else if (onDirectLogin) {
                  onDirectLogin(acc.id);
                }
              }}
              className={`demo-card-btn ${isProvider ? 'demo-provider' : 'demo-client'}`}
            >
              <div className="demo-card-top">
                <span className="demo-avatar-icon">
                  {isProvider ? <Wrench size={15} /> : <User size={15} />}
                </span>
                <span className="demo-role-pill">{acc.roleLabel}</span>
              </div>
              <div className="demo-card-name">{acc.name}</div>
              <div className="demo-card-sub">{acc.headline}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
