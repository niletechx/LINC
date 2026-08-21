import React from 'react';
import { Star, ShieldCheck, MapPin, Clock, Briefcase, MessageSquare, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';

export default function ProviderCard({ provider }) {
  const { startConversationWithProvider } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAppStore();
  const navigate = useNavigate();

  const handleChat = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to start a direct chat with ${provider.name}.`);
      return;
    }
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal(`Create an account to book ${provider.name} with Chapa Escrow protection.`);
      return;
    }
    navigate(`/booking/${provider.id}`);
  };

  const handleCardClick = () => {
    navigate(`/provider/${provider.id}`);
  };

  // Collect skills / service tags
  const tags = provider.services?.flatMap((s) => s.tags || []).slice(0, 3) || [];
  const isOnline = provider.availabilityStatus === 'available';

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Avatar + Status + Match Score */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                style={{ backgroundColor: provider.avatarColor || '#0284C7' }}
              >
                {provider.initials || provider.name?.slice(0, 2).toUpperCase()}
              </div>
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`} 
                title={isOnline ? 'Available Now' : 'Offline'}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-base">
                  {provider.name}
                </h4>
                {provider.verified && (
                  <span className="inline-flex items-center text-teal-600" title="Verified Specialist">
                    <CheckCircle2 size={15} fill="#0D9488" className="text-white" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 font-medium mt-0.5">
                {provider.headline || 'Verified Local Specialist'}
              </p>
            </div>
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-bold text-amber-800 shrink-0">
            <Star size={12} fill="#F59E0B" className="text-amber-500" />
            <span>{(provider.rating || 4.9).toFixed(1)}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Location & Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <MapPin size={13} className="text-slate-400" />
            <span>{provider.locationCity?.split(',')[0] || 'Addis Ababa'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Briefcase size={13} className="text-slate-400" />
            <span>{provider.completedJobs || 50}+ jobs</span>
          </div>
        </div>
      </div>

      {/* Footer: Price & Actions */}
      <div className="pt-3.5 flex items-center justify-between gap-2 mt-auto">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate</span>
          <span className="text-sm font-extrabold text-slate-900">
            {provider.priceLabel || `${provider.hourlyRate || 300} ETB/hr`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleChat}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
            title="Chat directly with specialist"
          >
            <MessageSquare size={14} />
          </button>
          <button
            type="button"
            onClick={handleBook}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1"
            title="Book with Chapa Escrow"
          >
            <Calendar size={13} />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}
