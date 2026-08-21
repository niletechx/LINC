import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  PlusCircle, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  X,
  Briefcase,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { organizationService } from '../services/organizationService';
import { userService } from '../services/userService';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { ADDIS_SUB_CITIES } from '../config/constants';

export default function BusinessManagementPage({ isOrg = false }) {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const { user } = useAuthStore();

  const [entityType, setEntityType] = useState(isOrg ? 'organization' : 'business'); // 'business' | 'organization'
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for business profile
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [locationCity, setLocationCity] = useState('Bole');
  const [locationAddress, setLocationAddress] = useState('');
  const [businessType, setBusinessType] = useState('Contractor PLC');

  // Add member modal states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberUsername, setMemberUsername] = useState('');
  const [memberRole, setMemberRole] = useState('staff'); // 'manager' | 'staff'
  const [isSearchingMember, setIsSearchingMember] = useState(false);

  const activeService = entityType === 'organization' ? organizationService : businessService;

  const loadEntityData = async () => {
    setLoading(true);
    try {
      let entityData = null;
      if (entityType === 'organization') {
        entityData = await organizationService.getMyOrganization();
      } else {
        entityData = await businessService.getMyBusiness();
      }

      if (entityData) {
        setProfile(entityData);
        setName(entityData.name || '');
        setDescription(entityData.description || '');
        setPhone(entityData.phone || '');
        setEmail(entityData.email || '');
        setWebsite(entityData.website || '');
        setLocationCity(entityData.location_city || 'Bole');
        setLocationAddress(entityData.location_address || '');
        setBusinessType(entityData.business_type || 'Contractor PLC');

        // Load members
        const memberList = await activeService.listMembers(entityData.id);
        setMembers(memberList || []);
      }
    } catch {
      // Fallback mock profile
      const mock = {
        id: 'b-ent-1',
        name: 'Addis Master Contractors PLC',
        description: 'Commercial and residential certified plumbing, electrical, and facility maintenance company in Addis Ababa.',
        phone: '+251 11 661 2345',
        email: 'info@addismaster.et',
        website: 'https://addismaster.et',
        location_city: 'Bole',
        location_address: 'Bole Rwanda, Behind Edna Mall, Building 4A',
        business_type: 'PLC (Private Limited Company)',
      };
      setProfile(mock);
      setName(mock.name);
      setDescription(mock.description);
      setPhone(mock.phone);
      setEmail(mock.email);
      setWebsite(mock.website);
      setLocationCity(mock.location_city);
      setLocationAddress(mock.location_address);
      setBusinessType(mock.business_type);

      setMembers([
        { id: 'm-1', user_id: 'u-1', role: 'owner', users: { full_name: user?.full_name || 'Yonas Molla', username: user?.username || 'yonas_m' } },
        { id: 'm-2', user_id: 'u-2', role: 'manager', users: { full_name: 'Abebe Girma', username: 'abebe_plumb' } },
        { id: 'm-3', user_id: 'u-3', role: 'staff', users: { full_name: 'Dawit Mengistu', username: 'dawit_tech' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntityData();
  }, [entityType]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        location_city: locationCity,
        location_address: locationAddress.trim(),
        business_type: businessType,
      };

      if (profile && profile.id && !profile.id.startsWith('b-ent')) {
        await activeService.updateBusiness(payload);
      } else {
        await activeService.createBusiness(payload);
      }

      setProfile(prev => ({ ...prev, ...payload }));
      setIsEditing(false);
      showToast(`${entityType === 'organization' ? 'Organization' : 'Business'} profile saved! 🎉`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save entity profile', 'error');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUsername.trim()) return;

    setIsSearchingMember(true);
    try {
      // Look up user ID from search
      const users = await userService.searchUsers(memberUsername.trim());
      const targetUser = users.find(u => u.username?.toLowerCase() === memberUsername.trim().toLowerCase() || u.email?.toLowerCase() === memberUsername.trim().toLowerCase()) || users[0];

      if (!targetUser) {
        showToast(`User "${memberUsername}" not found. Please check username.`, 'error');
        setIsSearchingMember(false);
        return;
      }

      if (profile?.id && !profile.id.startsWith('b-ent')) {
        await activeService.addMember(profile.id, {
          userId: targetUser.id,
          role: memberRole,
        });
      }

      setMembers(prev => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          user_id: targetUser.id,
          role: memberRole,
          users: { full_name: targetUser.full_name || memberUsername, username: targetUser.username || memberUsername },
        }
      ]);

      showToast(`Added ${targetUser.full_name || memberUsername} as ${memberRole.toUpperCase()}! ✓`, 'success');
      setIsAddMemberOpen(false);
      setMemberUsername('');
    } catch (err) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setIsSearchingMember(false);
    }
  };

  const handleRemoveMember = async (memberId, memberUserId) => {
    try {
      if (profile?.id && !profile.id.startsWith('b-ent')) {
        await activeService.removeMember(profile.id, memberUserId);
      }
      setMembers(prev => prev.filter(m => m.id !== memberId));
      showToast('Team member removed', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft size={16} />
          <span>Back to Profile</span>
        </button>

        {/* Entity Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setEntityType('business')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              entityType === 'business' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏢 Business / PLC
          </button>
          <button
            type="button"
            onClick={() => setEntityType('organization')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              entityType === 'organization' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏛️ Organization / NGO
          </button>
        </div>
      </div>

      {/* ── Hero Banner Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
            {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'CO'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{profile?.name || 'Company Profile'}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-cyan-50 text-cyan-800 rounded-full border border-cyan-200">
                {businessType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-2">
              {profile?.description || 'No description provided yet.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Company Info'}
          </button>
        </div>
      </div>

      {/* ── Main Edit Form (when isEditing) ── */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Edit Company Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Legal Name / Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Structure / Type</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. PLC, Share Company, NGO, Cooperative"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Scope of Services</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-input form-textarea"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 11 661 2345"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.et"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sub-City</label>
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

          <div className="form-group">
            <label className="form-label">Full Street Address / Landmark</label>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g. Bole Rwanda, Behind Edna Mall, 3rd Floor"
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Team Members Management Section ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Staff & Team Members ({members.length})</h3>
            <p className="text-xs text-slate-500">Authorized specialists who execute service bookings under this entity</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddMemberOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus size={14} />
            <span>Add Team Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => (
            <div key={member.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                  {member.users?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div>
                  <strong className="text-sm text-slate-900 block">{member.users?.full_name || 'Member'}</strong>
                  <span className="text-xs text-slate-500">@{member.users?.username || 'user'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  member.role === 'manager' ? 'bg-cyan-100 text-cyan-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {member.role}
                </span>

                {member.role !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ADD MEMBER MODAL ── */}
      {isAddMemberOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMemberOpen(false)}>
          <div className="modal-card modal-card-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <UserPlus size={20} className="text-cyan" />
                </div>
                <div>
                  <h3 className="modal-title">Add Staff Member</h3>
                  <p className="modal-subtitle">Assign a specialist to your organization</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAddMemberOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="modal-body space-y-3">
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  type="text"
                  value={memberUsername}
                  onChange={(e) => setMemberUsername(e.target.value)}
                  placeholder="e.g. abebe_girma or abebe@example.et"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Assignment</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="form-input"
                >
                  <option value="staff">Staff / Specialist (Executes Jobs)</option>
                  <option value="manager">Manager (Dispatches & Quotes)</option>
                </select>
              </div>

              <div className="modal-actions pt-2">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSearchingMember} className="btn btn-primary">
                  {isSearchingMember ? 'Verifying...' : 'Add to Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
