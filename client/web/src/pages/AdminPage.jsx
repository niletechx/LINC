import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Building2, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Lock, 
  Search, 
  RefreshCw, 
  Layers, 
  Database,
  ArrowRight,
  ChevronRight,
  Eye,
  Check,
  X
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';

export default function AdminPage() {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'disputes' | 'verifications' | 'reports' | 'users' | 'categories'
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState({
    users: 142,
    providers: 48,
    businesses: 12,
    organizations: 6,
    requests: 89,
    reports: 3,
    verificationRequests: 5,
  });

  const [disputes, setDisputes] = useState([
    {
      id: 'disp-1',
      escrow_id: 'esc-9812',
      raised_by: 'u-101',
      client_name: 'Yonas Molla',
      provider_name: 'Abebe Girma',
      service_title: 'Emergency Pipe Leak & Fitting Replacement',
      amount: 650,
      currency: 'ETB',
      reason: 'Specialist left without repairing the main valve clamp',
      evidence_urls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'],
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'disp-2',
      escrow_id: 'esc-9844',
      raised_by: 'u-102',
      client_name: 'Sara Tesfaye',
      provider_name: 'Dawit Mengistu',
      service_title: 'SSD Replacement and Data Recovery',
      amount: 850,
      currency: 'ETB',
      reason: 'Laptop battery not charging after reassembly',
      evidence_urls: [],
      status: 'open',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    }
  ]);

  const [verifications, setVerifications] = useState([
    {
      id: 'ver-1',
      entity_type: 'provider',
      entity_name: 'Marta Kebede',
      document_type: 'Fayda National ID',
      id_number: 'FAN-2026-9921-3312',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'ver-2',
      entity_type: 'business',
      entity_name: 'Addis Smart Electricians PLC',
      document_type: 'Trade License (MOTRI)',
      id_number: 'TR-ADDIS-88392-2026',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);

  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      reporter_name: 'Helen Bekele',
      entity_type: 'provider',
      entity_name: 'Tamrat Worku',
      reason: 'scam_fraud',
      description: 'Demanded 500 ETB direct cash deposit outside of Chapa Escrow before arriving.',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ]);

  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [disputeModalTarget, setDisputeModalTarget] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('refund');
  const [adminNote, setAdminNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ovData, dispData, verData, repData, uData] = await Promise.allSettled([
        adminService.getOverview(),
        adminService.listDisputes(),
        adminService.listVerificationRequests(),
        adminService.listReports(),
        adminService.listUsers(),
      ]);

      if (ovData.status === 'fulfilled' && ovData.value) setOverview(ovData.value);
      if (dispData.status === 'fulfilled' && dispData.value?.length > 0) setDisputes(dispData.value);
      if (verData.status === 'fulfilled' && verData.value?.length > 0) setVerifications(verData.value);
      if (repData.status === 'fulfilled' && repData.value?.length > 0) setReports(repData.value);
      if (uData.status === 'fulfilled' && uData.value?.length > 0) setUsersList(uData.value);
    } catch {
      // Retain fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!disputeModalTarget) return;

    setIsResolving(true);
    try {
      await adminService.resolveDispute(disputeModalTarget.id, {
        resolution: resolutionAction,
        adminNote: adminNote || `Admin resolved dispute via ${resolutionAction}`,
      });
      showToast(`Dispute successfully resolved with: ${resolutionAction.toUpperCase()}!`, 'success');
      setDisputes(prev => prev.filter(d => d.id !== disputeModalTarget.id));
      setDisputeModalTarget(null);
      setAdminNote('');
    } catch (err) {
      showToast(err.message || 'Failed to resolve dispute', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  const handleReviewVerification = async (reqId, status) => {
    try {
      await adminService.reviewVerification(reqId, {
        status,
        review_notes: `Processed by Admin on ${new Date().toLocaleDateString()}`,
      });
      showToast(`Verification request marked as ${status.toUpperCase()}!`, 'success');
      setVerifications(prev => prev.filter(v => v.id !== reqId));
    } catch (err) {
      showToast(err.message || 'Failed to update verification', 'error');
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      await adminService.reviewReport(reportId, status);
      showToast(`Report marked as ${status.toUpperCase()}!`, 'success');
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      showToast(err.message || 'Failed to update report', 'error');
    }
  };

  const handleSeedCategories = async () => {
    try {
      await adminService.seedCategories();
      showToast('🎉 Default Ethiopian service categories seeded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to seed categories', 'error');
    }
  };

  return (
    <div className="admin-portal-wrapper p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">LINC Master Administration Suite</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-full">
                Superuser Console
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Ethiopian market governance, escrow mediation, KYC verification & trust moderation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2 transition-all border border-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview Analytics', icon: <Layers size={16} /> },
          { id: 'disputes', label: `Escrow Disputes (${disputes.length})`, icon: <Lock size={16} />, badge: disputes.length },
          { id: 'verifications', label: `KYC Approvals (${verifications.length})`, icon: <ShieldCheck size={16} />, badge: verifications.length },
          { id: 'reports', label: `Safety Reports (${reports.length})`, icon: <AlertTriangle size={16} />, badge: reports.length },
          { id: 'users', label: 'User Directory', icon: <Users size={16} /> },
          { id: 'categories', label: 'Categories Seeder', icon: <Database size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ANALYTICS ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                <Users size={18} className="text-cyan-600" />
              </div>
              <strong className="text-3xl font-black text-slate-900">{overview.users}</strong>
              <span className="text-xs text-slate-500 block mt-1">Across Addis Ababa</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Specialists</span>
                <Briefcase size={18} className="text-emerald-600" />
              </div>
              <strong className="text-3xl font-black text-emerald-600">{overview.providers}</strong>
              <span className="text-xs text-slate-500 block mt-1">Verified Pros</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Businesses & Orgs</span>
                <Building2 size={18} className="text-amber-600" />
              </div>
              <strong className="text-3xl font-black text-slate-900">{(overview.businesses || 0) + (overview.organizations || 0)}</strong>
              <span className="text-xs text-slate-500 block mt-1">{overview.businesses} Businesses • {overview.organizations} Orgs</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Open Disputes</span>
                <Lock size={18} className="text-rose-600" />
              </div>
              <strong className="text-3xl font-black text-rose-600">{disputes.length}</strong>
              <span className="text-xs text-rose-500 font-semibold block mt-1">Requires admin action</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ESCROW DISPUTE RESOLUTION ── */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Lock size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Chapa Escrow Mediation Center</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Review disputed transactions. Resolving as <strong>Refund</strong> returns 100% of the funds to the client. Resolving as <strong>Release</strong> disburses payment to the service specialist minus the 3% platform fee.
              </p>
            </div>
          </div>

          {disputes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">All Escrow Disputes Resolved</h3>
              <p className="text-xs text-slate-500">No active disputes requiring mediation at this moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map(disp => (
                <div key={disp.id} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base text-slate-900">{disp.service_title}</strong>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded-md">
                          DISPUTED
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Escrow Ref: {disp.escrow_id}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Disputed Amount</span>
                      <strong className="text-xl font-black text-rose-600">{disp.amount} {disp.currency || 'ETB'}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div><strong>👤 Client:</strong> {disp.client_name || 'Client User'} ({disp.raised_by})</div>
                    <div><strong>💼 Specialist:</strong> {disp.provider_name || 'Service Specialist'}</div>
                    <div><strong>⚠️ Stated Reason:</strong> <span className="text-rose-700 font-medium">"{disp.reason}"</span></div>
                  </div>

                  {disp.evidence_urls?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">Evidence:</span>
                      {disp.evidence_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:underline flex items-center gap-1">
                          <Eye size={12} />
                          <span>Photo #{i + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDisputeModalTarget(disp);
                        setResolutionAction('refund');
                      }}
                      className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                    >
                      Resolve & Refund Client
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDisputeModalTarget(disp);
                        setResolutionAction('release');
                      }}
                      className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
                    >
                      Resolve & Release to Specialist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: KYC APPROVALS ── */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Pending KYC Verifications</h3>
              <p className="text-xs text-slate-500">All submitted documents have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map(ver => (
                <div key={ver.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-base text-slate-900">{ver.entity_name}</strong>
                      <span className="px-2 py-0.5 text-xs font-bold bg-cyan-50 text-cyan-800 rounded-full capitalize">
                        {ver.entity_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>Document Type:</strong> {ver.document_type} • <strong>ID/FAN:</strong> <code className="text-slate-800 font-bold">{ver.id_number}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewVerification(ver.id, 'rejected')}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewVerification(ver.id, 'approved')}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SAFETY REPORTS ── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Clean Safety Queue</h3>
              <p className="text-xs text-slate-500">No open user violation reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm text-slate-900">Flagged: {rep.entity_name}</strong>
                      <span className="text-xs text-slate-500 ml-2">by {rep.reporter_name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 rounded-md uppercase">
                      {rep.reason}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{rep.description}"
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleReviewReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Dismiss Report
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: USER DIRECTORY ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search user by name, email, or username..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role / Admin</th>
                  <th className="p-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(usersList.length > 0 ? usersList : [
                  { id: '1', full_name: 'Super Admin', email: 'admin@linc.et', is_admin: true, created_at: '2026-01-01' },
                  { id: '2', full_name: 'Yonas Molla', email: 'yonas.molla@example.et', is_admin: false, created_at: '2026-02-15' },
                  { id: '3', full_name: 'Abebe Girma', email: 'abebe.girma@example.et', is_admin: false, created_at: '2026-02-10' },
                ]).filter(u => {
                  if (!userSearchQuery.trim()) return true;
                  const q = userSearchQuery.toLowerCase();
                  return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                }).map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{u.full_name || 'User'}</td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.is_admin ? '👑 Super Admin' : 'Standard User'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: CATEGORIES SEEDER ── */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-cyan-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ethiopian Service Categories Catalog</h3>
              <p className="text-xs text-slate-500">Initialize and refresh the primary trade taxonomy in the database</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Clicking the button below will seed standard Addis Ababa trade categories (Plumbing, Electrical, Cleaning, Appliance Repair, Tutoring, Carpentry, Automotive) into Supabase PostgreSQL.
          </p>

          <button
            type="button"
            onClick={handleSeedCategories}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <Database size={15} />
            <span>Seed Standard Categories Database</span>
          </button>
        </div>
      )}

      {/* ── DISPUTE RESOLUTION MODAL ── */}
      {disputeModalTarget && (
        <div className="modal-backdrop" onClick={() => setDisputeModalTarget(null)}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Resolve Escrow Dispute</h3>
                  <p className="modal-subtitle">Official mediation resolution for {disputeModalTarget.amount} ETB</p>
                </div>
              </div>
              <button type="button" onClick={() => setDisputeModalTarget(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveDispute} className="modal-body space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div><strong>Service:</strong> {disputeModalTarget.service_title}</div>
                <div><strong>Stated Issue:</strong> {disputeModalTarget.reason}</div>
                <div><strong>Hold Amount:</strong> <span className="font-bold text-rose-600">{disputeModalTarget.amount} ETB</span></div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Select Resolution Action</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('refund')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      resolutionAction === 'refund'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ↩️ 100% Refund to Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionAction('release')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      resolutionAction === 'release'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Release to Specialist
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Review Notes (Audit Trail)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Explain the mediation rationale (e.g. 'Both parties agreed on partial fix; refund issued' or 'Work verified complete')..."
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setDisputeModalTarget(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isResolving} className="btn btn-primary">
                  {isResolving ? 'Executing...' : `Confirm & Execute ${resolutionAction.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
