import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ChevronDown, 
  SlidersHorizontal,
  ShieldCheck, 
  Lock, 
  Star, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Wrench,
  Globe,
  Briefcase
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { MOCK_PROVIDERS, MOCK_OPEN_REQUESTS, CATEGORIES } from '../data/mockData';
import ProviderCard from '../components/provider/ProviderCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentLocation, setLocationPickerOpen, openAuthModal, setSelectedCategory, setSelectedProviderForDetails } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCat] = useState('all');

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

  const handleAiTrigger = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in or create an account to get instant personalized AI provider matches.');
    } else {
      navigate('/ai');
    }
  };

  const handlePostRequest = () => {
    if (!isAuthenticated) {
      navigate('/signup?intent=post-job');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* ── 1. EXACT MOCKUP HERO SECTION ── */}
      <section className="relative pt-12 pb-24 lg:pt-16 lg:pb-28 overflow-hidden linc-grid-bg">
        
        {/* Ambient Top-Right Aurora Mesh Glow */}
        <div className="linc-hero-aurora" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Centered Headline & Subtitle */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Find & Book Verified Specialists Across Addis Ababa
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              Access Ethiopia's only verified marketplace for reliable home & business services. Verified professionals, secure payments, peace of mind.
            </p>
          </div>

          {/* Centered Omni-Search Bar (Exact Mockup Match) */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form 
              onSubmit={handleSearchSubmit} 
              className="bg-white rounded-full p-2 pl-4 border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-all hover:border-slate-300"
            >
              <div className="flex items-center gap-3 flex-1 w-full">
                <SlidersHorizontal size={18} className="text-slate-400 shrink-0" />
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plumbers, electricians, cleaners..."
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-1.5"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                {/* AI Badge */}
                <button
                  type="button"
                  onClick={handleAiTrigger}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors shrink-0"
                  title="Ask LINC AI Matchmaker"
                >
                  <Globe size={13} className="text-blue-600" />
                  <span>Powered by AI</span>
                </button>

                {/* Location Dropdown */}
                <button
                  type="button"
                  onClick={() => setLocationPickerOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded-lg transition-colors shrink-0"
                  title="Change Location"
                >
                  <MapPin size={14} className="text-slate-500" />
                  <span className="max-w-[90px] truncate">{currentLocation ? currentLocation.split(',')[0] : 'Addis Ababa'}</span>
                </button>

                {/* Search Action Pill */}
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-sm transition-all hover:scale-[1.02]"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* ── 3 FLOATING SHOWCASE CARDS (Exact Mockup Row) ── */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
            
            {/* Card 1: Abel Tesfaye */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-stripe-card hover:shadow-stripe-hover transition-all space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      AT
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Wrench size={10} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">Abel Tesfaye</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                      <CheckCircle2 size={12} fill="#2563EB" className="text-white" />
                      <span>Verified Badge</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star size={13} fill="#F59E0B" className="text-amber-500" />
                  <span>4.8</span>
                  <span className="text-[10px] text-slate-400 font-medium">(210)</span>
                </div>
              </div>

              <div>
                <strong className="block text-xs font-bold text-slate-900">Expert Plumber | Bole</strong>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  Profile info access, verified marketplace for reliable home & business services.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Price: ETB 1,800/hour</span>
                <button
                  type="button"
                  onClick={() => setSelectedProviderForDetails(MOCK_PROVIDERS.find(p => p.name === 'Abel Tesfaye') || MOCK_PROVIDERS[0])}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            </div>

            {/* Card 2: Martha Kassa */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-stripe-card hover:shadow-stripe-hover transition-all space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      MK
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Wrench size={10} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">Martha Kassa</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                      <CheckCircle2 size={12} fill="#2563EB" className="text-white" />
                      <span>Verified Badge</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star size={13} fill="#F59E0B" className="text-amber-500" />
                  <span>4.9</span>
                  <span className="text-[10px] text-slate-400 font-medium">(155)</span>
                </div>
              </div>

              <div>
                <strong className="block text-xs font-bold text-slate-900">Certified Electrician | Yeka</strong>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  Profile info access, verified marketplace for reliable home & business services.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Price: ETB 2,200/fix</span>
                <button
                  type="button"
                  onClick={() => setSelectedProviderForDetails(MOCK_PROVIDERS.find(p => p.name === 'Martha Kassa') || MOCK_PROVIDERS[4])}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            </div>

            {/* Card 3: Secure Escrow Payments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-stripe-card hover:shadow-stripe-hover transition-all space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                  🔒
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Secure Escrow Payments</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Payment protected until job completion. Your satisfaction guaranteed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 2. POPULAR SERVICE CATEGORIES ── */}
      <section className="py-8 bg-slate-50/70 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            
            <button
              type="button"
              onClick={() => handleCategoryClick('urgent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                activeCategory === 'urgent'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
              }`}
            >
              <Zap size={13} className="text-red-500 fill-red-500" />
              <span>🚨 Urgent Tasks (15m response)</span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW LINC PROTECTS YOU ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">
              Guaranteed Trust & Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How LINC protects your household & wallet
            </h2>
            <p className="text-base text-slate-600">
              Never worry about poor craftsmanship or unverified contractors. LINC combines verified biometric Fayda ID with Chapa automated escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Find or AI Match Specialists
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search verified profiles with transparent reviews, or describe your problem in English/Amharic to let our AI match verified experts within 2km.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Lock Funds in Chapa Escrow
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pay safely via Telebirr, CBE Birr, or debit cards. Your payment is held securely in the LINC Escrow Vault until the task is completed to your standard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Approve & Release Payment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once the job is completed and inspected, approve milestone release with one click. Providers are paid instantly and you leave a verified review.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handlePostRequest}
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-6 py-3 rounded-full shadow-sm hover:shadow transition-all"
            >
              <PlusCircle size={16} />
              <span>Post a Service Request Free</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── 4. VERIFIED SPECIALISTS NEARBY IN ADDIS ── */}
      <section className="py-20 bg-slate-50/60 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verified Nearby in Addis
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  <MapPin size={11} />
                  <span>{currentLocation ? currentLocation.split(',')[0] : 'Bole'} • 2km</span>
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Top-rated professionals ready for immediate dispatch across Addis Ababa.
              </p>
            </div>

            <Link 
              to="/search" 
              className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 group"
            >
              <span>View all 500+ specialists</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROVIDERS.slice(0, 6).map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. LIVE MARKET REQUESTS & AI SPOTLIGHT ── */}
      <section className="py-20 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: AI Matchmaker Spotlight */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-sm">
                <Sparkles size={13} />
                <span>POWERED BY LINC AI</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Need the right specialist matched in seconds?
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Describe your project or emergency in plain English or Amharic. Our AI matches your urgency, location, and budget with vetted local specialists in real time.
              </p>

              <button
                type="button"
                onClick={handleAiTrigger}
                className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Launch AI Matchmaker</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: Live Requests Feed */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Customer Requests</h3>
                  <span className="text-xs text-slate-500">Live requests posted across Addis Ababa</span>
                </div>
                <button
                  type="button"
                  onClick={handlePostRequest}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  + Post Request
                </button>
              </div>

              <div className="space-y-3">
                {MOCK_OPEN_REQUESTS.slice(0, 3).map((req, idx) => {
                  const isUrgent = req.urgency === 'urgent' || req.urgency === 'high';
                  return (
                    <div 
                      key={idx}
                      className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {req.category}
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                              <Zap size={10} />
                              <span>URGENT</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <span className="text-sm font-extrabold text-slate-900">{req.budget}</span>
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
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. STRIPE-STYLE FOOTER ── */}
      <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 font-black flex items-center justify-center text-base">
                  L
                </div>
                <span className="font-extrabold text-xl tracking-tight">LINC</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">ኢትዮጵያ</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Ethiopia's leading verified specialist marketplace. Background-checked professionals, AI matching, and guaranteed Chapa escrow payments.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Specialists</span>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/search" className="hover:text-white transition-colors">Plumbers & Pipefitters</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Master Electricians</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Tutors & Teachers</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Appliance Mechanics</Link></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Platform</span>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/ai" className="hover:text-white transition-colors">AI Matchmaker</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-white transition-colors">Chapa Escrow Vault</Link></li>
                <li><Link to="/requests" className="hover:text-white transition-colors">Post a Request</Link></li>
                <li><Link to="/provider-setup" className="hover:text-white transition-colors">Join as a Specialist</Link></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider">Coverage</span>
              <ul className="space-y-2 text-slate-400">
                <li>Bole & Atlas</li>
                <li>Yeka & Kazanchis</li>
                <li>Kirkos & Meskel Sq</li>
                <li>Arada & Piassa</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© 2026 LINC Ethiopia Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer">Escrow Agreement</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
