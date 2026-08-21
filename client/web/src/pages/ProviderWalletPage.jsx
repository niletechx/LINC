import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Lock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Sparkles, 
  X, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Search
} from 'lucide-react';
import { useProviderStore } from '../stores/providerStore';
import { useAppStore } from '../stores/appStore';

export default function ProviderWalletPage() {
  const navigate = useNavigate();
  const { 
    wallet, 
    withdrawEarnings, 
    isWithdrawalModalOpen, 
    openWithdrawalModal, 
    closeWithdrawalModal,
    isReceiptModalOpen,
    activeReceiptTx,
    openReceiptModal,
    closeReceiptModal
  } = useProviderStore();

  const { showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'payouts' | 'withdrawals'
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [selectedChannel, setSelectedChannel] = useState('telebirr');
  const [targetAccount, setTargetAccount] = useState('+251 911 234 567');
  const [isProcessing, setIsProcessing] = useState(false);

  const channels = [
    { id: 'telebirr', name: 'Telebirr Wallet', icon: '📱', color: '#0072BC', account: '+251 911 234 567' },
    { id: 'cbe', name: 'Commercial Bank of Ethiopia (CBE)', icon: '🏦', color: '#781145', account: '1000 2938 4719' },
    { id: 'awash', name: 'Awash Birr Wallet', icon: '🟡', color: '#FFB81C', account: '+251 911 234 567' },
    { id: 'dashen', name: 'Dashen Amole', icon: '🔵', color: '#00529B', account: '+251 911 234 567' },
  ];

  const handleChannelSelect = (chan) => {
    setSelectedChannel(chan.id);
    setTargetAccount(chan.account);
  };

  const handleExecuteWithdrawal = (e) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    if (!num || num <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }
    if (num > wallet.availableBalance) {
      showToast(`Cannot withdraw more than your available balance (${wallet.availableBalance} ETB).`, 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const tx = withdrawEarnings({
          amount: num,
          channelId: selectedChannel,
          destinationAccount: targetAccount,
        });
        setIsProcessing(false);
        showToast(`🎉 Withdrew ${num} ETB to ${selectedChannel.toUpperCase()} successfully!`, 'success');
      } catch (err) {
        setIsProcessing(false);
        showToast(err.message, 'error');
      }
    }, 900);
  };

  // Filter transactions
  const filteredTransactions = wallet.transactions.filter((tx) => {
    if (activeTab === 'payouts' && tx.type !== 'escrow_payout') return false;
    if (activeTab === 'withdrawals' && tx.type !== 'withdrawal') return false;
    return true;
  });

  return (
    <div className="provider-wallet-page-wrapper">
      {/* ── 1. Header ── */}
      <header className="provider-page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="provider-page-title">Ethiopian Escrow Wallet & Payouts</h1>
            <span className="escrow-vault-chip">
              <ShieldCheck size={12} className="text-emerald" />
              <span>EthSwitch & Chapa Integrated</span>
            </span>
          </div>
          <p className="provider-page-sub">
            Real-time balance, verified Chapa escrow releases, and instant withdrawals directly to Telebirr, CBE Birr, or Awash.
          </p>
        </div>

        <button
          type="button"
          onClick={openWithdrawalModal}
          className="btn btn-primary"
        >
          <ArrowUpRight size={16} />
          <span>Instant Withdrawal</span>
        </button>
      </header>

      {/* ── 2. Metric Balances 3-Column Grid ── */}
      <section className="wallet-balances-grid">
        {/* Card 1: Available Balance */}
        <div className="wallet-balance-card main-balance">
          <div className="card-top-info">
            <div className="icon-pill-wallet">
              <Wallet size={22} className="text-white" />
            </div>
            <span className="balance-status-tag">Ready for Payout</span>
          </div>
          <div className="balance-value-block">
            <span className="currency-prefix">ETB</span>
            <strong className="balance-amount">{wallet.availableBalance.toLocaleString()}</strong>
          </div>
          <p className="balance-caption">Withdrawable to your Telebirr or CBE Bank account instantly.</p>
          <button
            type="button"
            onClick={openWithdrawalModal}
            className="card-withdraw-btn"
          >
            <span>Transfer to Mobile Wallet →</span>
          </button>
        </div>

        {/* Card 2: Escrow Locked Balance */}
        <div className="wallet-balance-card pending-balance">
          <div className="card-top-info">
            <div className="icon-pill-lock">
              <Lock size={22} className="text-amber-500" />
            </div>
            <span className="balance-status-tag pending">Secured in Escrow</span>
          </div>
          <div className="balance-value-block">
            <span className="currency-prefix">ETB</span>
            <strong className="balance-amount text-amber-600">{wallet.escrowPendingBalance.toLocaleString()}</strong>
          </div>
          <p className="balance-caption">Funds held in Chapa Vault across 2 ongoing active jobs.</p>
          <button
            type="button"
            onClick={() => navigate('/provider/jobs')}
            className="card-link-btn"
          >
            <span>View Active Jobs Timeline →</span>
          </button>
        </div>

        {/* Card 3: Lifetime Revenue */}
        <div className="wallet-balance-card total-balance">
          <div className="card-top-info">
            <div className="icon-pill-chart">
              <TrendingUp size={22} className="text-cyan" />
            </div>
            <span className="balance-status-tag">All-Time Revenue</span>
          </div>
          <div className="balance-value-block">
            <span className="currency-prefix">ETB</span>
            <strong className="balance-amount text-slate-800">{wallet.totalLifetimeEarnings.toLocaleString()}</strong>
          </div>
          <p className="balance-caption">89 completed jobs across Addis Ababa with 0% platform fee.</p>
          <div className="fayda-guarantee-note">
            <ShieldCheck size={13} className="text-emerald" />
            <span>Fayda ID Verified Merchant</span>
          </div>
        </div>
      </section>

      {/* ── 3. Linked Ethiopian Accounts Strip ── */}
      <section className="linked-channels-card">
        <div className="channels-header-row">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-cyan" />
            <h3 className="channels-title">Your Connected Ethiopian Payout Channels</h3>
          </div>
          <span className="channels-badge">Instant EthSwitch Settlement</span>
        </div>

        <div className="channels-chips-grid">
          {channels.map((chan) => (
            <div key={chan.id} className="channel-account-chip">
              <span className="chan-icon">{chan.icon}</span>
              <div className="chan-info">
                <strong className="chan-name">{chan.name}</strong>
                <span className="chan-acc">{chan.account}</span>
              </div>
              <span className="chan-active-dot" title="Active & Ready" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Transaction History Ledger ── */}
      <section className="transactions-ledger-card">
        <div className="ledger-header-row">
          <div>
            <h3 className="ledger-title">Transaction & Escrow Milestone Ledger</h3>
            <p className="ledger-sub">Detailed audit trail of all earnings, escrow releases, and mobile payouts.</p>
          </div>

          <div className="ledger-filter-pills">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`ledger-pill ${activeTab === 'all' ? 'active' : ''}`}
            >
              All ({wallet.transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payouts')}
              className={`ledger-pill ${activeTab === 'payouts' ? 'active' : ''}`}
            >
              🛡️ Escrow Releases
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('withdrawals')}
              className={`ledger-pill ${activeTab === 'withdrawals' ? 'active' : ''}`}
            >
              📱 Withdrawals
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="transactions-list-stack">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'escrow_payout';

              return (
                <div key={tx.id} className="transaction-row-item">
                  <div className="tx-left-group">
                    <div className={`tx-icon-box ${isCredit ? 'credit' : 'debit'}`}>
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div className="tx-title-block">
                      <div className="flex items-center gap-2">
                        <strong className="tx-title">{tx.title}</strong>
                        <span className="tx-ref-tag">{tx.ref}</span>
                      </div>
                      <div className="tx-meta-line">
                        <span>{tx.date} • {tx.time}</span>
                        <span>•</span>
                        <span>{tx.destination || `From Client: ${tx.clientName}`}</span>
                        <span>•</span>
                        <span className="text-slate-400">{tx.gateway}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tx-right-group">
                    <div className="tx-amount-block">
                      <strong className={`tx-amount ${isCredit ? 'text-emerald' : 'text-slate-800'}`}>
                        {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency || 'ETB'}
                      </strong>
                      <span className="tx-status-badge">
                        <CheckCircle2 size={11} />
                        <span>Completed</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openReceiptModal(tx)}
                      className="tx-voucher-btn"
                      title="View Official Voucher"
                    >
                      <FileText size={14} />
                      <span>Voucher</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p>No transactions found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL 1: INSTANT WITHDRAWAL ── */}
      {isWithdrawalModalOpen && (
        <div className="modal-backdrop" onClick={closeWithdrawalModal}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Withdraw Funds to Ethiopian Account</h3>
                  <p className="modal-subtitle">Instant settlement via EthSwitch</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeWithdrawalModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteWithdrawal} className="modal-body">
              {/* Available Balance Preview */}
              <div className="release-amount-banner">
                <span>Available for Withdrawal:</span>
                <strong className="release-amount-val text-cyan">{wallet.availableBalance.toLocaleString()} ETB</strong>
              </div>

              {/* Amount Input */}
              <div className="form-group">
                <label className="form-label">Withdrawal Amount (ETB)</label>
                <div className="rate-input-wrap">
                  <span className="rate-prefix">ETB</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={wallet.availableBalance}
                    min={100}
                    className="rate-field"
                    required
                  />
                </div>

                {/* Quick Amount Pills */}
                <div className="flex gap-2 mt-2">
                  {[1000, 2500, 5000, wallet.availableBalance].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWithdrawAmount(String(val))}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                      {val === wallet.availableBalance ? 'Max (All)' : `${val.toLocaleString()} ETB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Payout Gateway */}
              <div className="form-group">
                <label className="form-label">Destination Payout Channel</label>
                <div className="payment-gateways-grid">
                  {channels.map((chan) => {
                    const isSelected = selectedChannel === chan.id;
                    return (
                      <div
                        key={chan.id}
                        onClick={() => handleChannelSelect(chan)}
                        className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="payment-icon">{chan.icon}</span>
                        <span className="payment-name">{chan.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination Account / Phone */}
              <div className="form-group">
                <label className="form-label">Account / Phone Number</label>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="escrow-guarantee-note">
                <ShieldCheck size={16} className="text-emerald flex-shrink-0" />
                <p className="guarantee-text">
                  Transfer fee is <strong>0 ETB (Free)</strong>. Funds will reflect in your mobile wallet in under 60 seconds.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeWithdrawalModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="btn btn-primary">
                  {isProcessing ? (
                    'Processing Payout...'
                  ) : (
                    <>
                      <ArrowUpRight size={16} />
                      <span>Withdraw {Number(withdrawAmount || 0).toLocaleString()} ETB Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DIGITAL ETHIOPIAN TRANSACTION VOUCHER ── */}
      {isReceiptModalOpen && activeReceiptTx && (
        <div className="modal-backdrop" onClick={closeReceiptModal}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Official Transaction Voucher</h3>
                  <p className="modal-subtitle">Verified Electronic Settlement</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeReceiptModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="receipt-paper-card">
                <div className="receipt-paper-header">
                  <div className="linc-logo-text">LINC SPECIALIST PAYOUT 🇪🇹</div>
                  <span className="paper-ref font-mono">{activeReceiptTx.ref}</span>
                </div>

                <div className="paper-rows-list">
                  <div className="paper-row">
                    <span className="paper-label">Transaction Type:</span>
                    <span className="paper-val">{activeReceiptTx.title}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Channel / Gateway:</span>
                    <span className="paper-val">{activeReceiptTx.gateway || 'EthSwitch'}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Destination / Origin:</span>
                    <span className="paper-val">{activeReceiptTx.destination || activeReceiptTx.clientName}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Date & Time:</span>
                    <span className="paper-val">{activeReceiptTx.date} {activeReceiptTx.time}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Settlement Status:</span>
                    <span className="paper-val font-bold text-emerald">Instant Settlement Completed ✓</span>
                  </div>
                  <div className="paper-divider" />
                  <div className="paper-row total">
                    <span className="paper-label">Net Amount:</span>
                    <span className="paper-val total-price">{activeReceiptTx.amount.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="paper-footer">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>National Bank of Ethiopia & Chapa Escrow Compliance Verified</span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Voucher downloaded to device! 📄', 'success');
                    closeReceiptModal();
                  }}
                  className="btn-download-receipt"
                >
                  <Download size={15} />
                  <span>Download Voucher PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
