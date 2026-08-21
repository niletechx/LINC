import { Star, ShieldCheck, MapPin, Clock, Briefcase, MessageSquare, Calendar, X, CheckCircle2, Award } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function ProviderDetailsModal() {
  const { selectedProviderForDetails, setSelectedProviderForDetails, openAuthModal } = useAppStore();
  const { openCreateBooking } = useBookingStore();
  const { startConversationWithProvider } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!selectedProviderForDetails) return null;
  const p = selectedProviderForDetails;

  const handleBookService = (service) => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to book ${p.name} with Chapa Escrow.`);
      return;
    }
    const providerCopy = p;
    setSelectedProviderForDetails(null);
    if (openCreateBooking) {
      openCreateBooking(providerCopy, service);
    } else {
      navigate(`/booking/${providerCopy.id}`);
    }
  };

  const handleDirectChat = () => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to start a conversation with ${p.name}.`);
      return;
    }
    const providerCopy = p;
    setSelectedProviderForDetails(null);
    startConversationWithProvider(providerCopy);
    navigate(`/dm/${providerCopy.id}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedProviderForDetails(null)}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div className="p-6 bg-slate-50 border-b border-slate-200/80 relative">
          <button
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            onClick={() => setSelectedProviderForDetails(null)}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-sm shrink-0"
              style={{ backgroundColor: p.avatarColor || '#0F172A' }}
            >
              {p.initials || p.name?.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{p.name}</h2>
                {p.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/70">
                    <CheckCircle2 size={12} fill="#2563EB" className="text-white" />
                    <span>Verified Pro</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600">{p.headline}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1"><MapPin size={13} className="text-teal-600" /> {p.locationCity || 'Addis Ababa'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star size={13} fill="#F59E0B" className="text-amber-500" /> {(p.rating || 4.9).toFixed(1)} ({p.reviewsCount || 42} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1"><Briefcase size={13} className="text-slate-400" /> {p.completedJobs || 85}+ jobs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* About Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Specialist</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {p.about ||
                `${p.name} is a verified, background-checked professional with years of active experience delivering high-quality work across Addis Ababa.`}
            </p>
          </div>

          {/* Credentials / Verification */}
          {p.credentials && p.credentials.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Credentials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.credentials.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2">
                    <Award size={16} className="text-teal-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 leading-tight">{c.title}</span>
                      <span className="text-[10px] text-slate-500">{c.issuer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Offered */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services & Rates</h4>
            <div className="space-y-2.5">
              {(p.services || []).map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{srv.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1"><Clock size={11} /> {srv.duration}</span>
                      {(srv.tags || []).map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{srv.price}</span>
                    <button
                      type="button"
                      onClick={() => handleBookService(srv)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Reviews */}
          {p.reviews && p.reviews.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Client Reviews</h4>
              <div className="space-y-2">
                {p.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="font-bold text-slate-900">{rev.author}</strong>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={11} fill="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDirectChat}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            <span>Chat Directly</span>
          </button>

          <button
            type="button"
            onClick={() => handleBookService(p.services ? p.services[0] : null)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            <span>Book with Chapa Escrow</span>
          </button>
        </div>

      </div>
    </div>
  );
}
