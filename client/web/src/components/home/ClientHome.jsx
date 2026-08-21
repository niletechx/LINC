import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  PlusCircle, 
  Clock, 
  Star, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Lock,
  Calendar,
  Layers,
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { MOCK_PROVIDERS, MOCK_OPEN_REQUESTS, CATEGORIES } from '../../data/mockData';
import ProviderCard from '../provider/ProviderCard';

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentLocation, 
    setLocationPickerOpen, 
    setNotificationsOpen, 
    unreadNotificationsCount, 
    setAppMode,
    setPostRequestOpen,
    setSelectedCategory,
    setSelectedProviderForDetails,
    showToast
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCat] = useState('all');

  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Yonas';

  const handleCategoryClick = (catId) => {
    setActiveCat(catId);
    setSelectedCategory(catId);
    navigate(`/search?category=${catId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleSwitchMode = () => {
    setAppMode('provider');
    showToast('Switched to Specialist / Provider Workspace 💼', 'info');
  };

  const smartPromptTemplates = [
    { label: '💧 Emergency pipe burst in Bole', query: 'Plumbing pipe repair Bole' },
    { label: '⚡ Generator & solar inverter in Yeka', query: 'Electrician solar inverter Yeka' },
    { label: '🧹 Move-in deep clean in Kazanchis', query: 'Deep cleaning Kazanchis' },
    { label: '📐 Grade 12 Math & Physics tutor', query: 'Math tutor entrance exam' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900">
      
      {/* ── 1. Hero Header Banner ── */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Location Badge */}
            <button 
              type="button" 
              onClick={() => setLocationPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
              title="Change Location"
            >
              <MapPin size={13} className="text-teal-600" />
              <span>{currentLocation || 'Bole, Addis Ababa'}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={handleSwitchMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition-colors cursor-pointer"
                title="Switch to Provider Dashboard"
              >
                <Briefcase size={13} className="text-amber-600" />
                <span>Switch to Provider Mode</span>
              </button>

              <button 
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600" />
                )}
              </button>
            </div>
          </div>

          {/* Greeting & Headline */}
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {firstName} 👋
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find verified Ethiopian professionals for plumbing, electrical, tutoring, cleaning, and technical repairs with secure Chapa escrow protection.
            </p>
          </div>

          {/* Omni-Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="bg-white rounded-2xl p-2 pl-4 border border-slate-200 shadow-sm max-w-3xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 flex-1 w-full">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plumbers, electricians, tutors, cleaners..."
                className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-1.5"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
              <button 
                type="button"
                onClick={() => navigate('/ai')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                title="Open AI Matchmaker"
              >
                <Sparkles size={13} className="text-blue-600" />
                <span>Ask LINC AI</span>
              </button>

              <button 
                type="submit" 
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-5 py-2 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Smart Prompt Suggestions (Cofounder / Natural Language Inspiration) */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-slate-400">Suggestions:</span>
            {smartPromptTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(tpl.query);
                  navigate(`/search?q=${encodeURIComponent(tpl.query)}`);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {tpl.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 2. Ramp-Inspired Metrics Overview Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Escrow Vault */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Chapa Escrow Vault</span>
              <Lock size={14} className="text-teal-600" />
            </div>
            <div className="text-xl font-black text-slate-900">ETB 4,200</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={12} />
              <span>Protected until job done</span>
            </div>
          </div>

          {/* Metric 2: Active Tasks */}
          <div 
            onClick={() => navigate('/bookings')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Active Tasks</span>
              <Briefcase size={14} className="text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">1 In Progress</div>
            <div className="text-[11px] text-slate-500 truncate">
              Abebe G. • Pipe Repair
            </div>
          </div>

          {/* Metric 3: Completed Jobs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Lifetime Tasks</span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">14 Verified</div>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
              <Star size={11} fill="#F59E0B" />
              <span>5.0 avg client rating</span>
            </div>
          </div>

          {/* Metric 4: AI Match Status */}
          <div 
            onClick={() => navigate('/ai')}
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-xs space-y-1 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
              <span>AI Matchmaker</span>
              <Sparkles size={14} />
            </div>
            <div className="text-base font-black">Find in 30 Secs</div>
            <div className="text-[11px] text-slate-300">
              Matched within 2km in Addis
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. ClickUp / Linear-Inspired Active Booking Milestone Tracker ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-stripe-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Active Job</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold">
                Chapa Escrow Locked • ETB 1,800
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button 
                type="button" 
                onClick={() => navigate('/dm/1')} 
                className="font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                Chat with Specialist
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/bookings')} 
                className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                View Job Sheet →
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Emergency Pipe Burst & Pressure Sealant Replacement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specialist: <strong>Abebe Girma</strong> (Verified Master Plumber • Fayda ID #2025-081) • Bole Medhanealem
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Work In Progress (85%)
              </span>
            </div>
          </div>

          {/* 4-Step Milestone Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-teal-600" />
              <span className="text-[11px] font-bold text-slate-800 block">1. Escrow Funded</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-teal-600" />
              <span className="text-[11px] font-bold text-slate-800 block">2. Arrived On-Site</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800 block">3. In-Progress</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400 block">4. Inspect & Release</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Quick Category Pills ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryClick('urgent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer ${
              activeCategory === 'urgent'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            <span>🚨 Urgent Tasks</span>
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 5. Main Two-Column Dashboard Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Verified Nearby Providers (7 columns) */}
          <section className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">Verified Nearby in Addis</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
                  <MapPin size={10} />
                  <span>{currentLocation.split(',')[0]} • 2 km</span>
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                <span>See all specialists</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_PROVIDERS.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>

          {/* Right Column: Open Local Requests (5 columns) */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900">Open Job Requests</h2>
              <button 
                type="button" 
                onClick={() => setPostRequestOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
              >
                <PlusCircle size={13} />
                <span>Post Request</span>
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_OPEN_REQUESTS.map((req, idx) => {
                const isUrgent = req.urgency === 'urgent' || req.urgency === 'high';
                return (
                  <div 
                    key={idx} 
                    className="bg-white hover:bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {req.category}
                      </span>
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-700">
                          <Zap size={10} />
                          <span>URGENT</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{req.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Budget</span>
                        <strong className="text-xs font-extrabold text-slate-900">{req.budget}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {req.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {req.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
