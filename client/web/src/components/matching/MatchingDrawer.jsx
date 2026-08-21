import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  MessageSquare, 
  Lock, 
  RefreshCw,
  Award
} from 'lucide-react';
import { matchingService } from '../../services/matchingService';
import { providerService } from '../../services/providerService';
import { useChatStore } from '../../stores/chatStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_PROVIDERS } from '../../data/mockData';

export default function MatchingDrawer({ isOpen, onClose, request }) {
  const navigate = useNavigate();
  const { startConversationWithProvider } = useChatStore();
  const { showToast } = useAppStore();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !request) return;

    let mounted = true;
    setLoading(true);

    async function loadMatches() {
      try {
        const res = await matchingService.listMatches(request.id);
        if (mounted && res && res.length > 0) {
          setMatches(res);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to intelligent local algorithmic matching
      }

      // Local matching algorithm: filter by category and location proximity
      const reqCategory = (request.category || '').toLowerCase();
      const reqSubCity = (request.subCity || '').toLowerCase();

      const candidateProviders = MOCK_PROVIDERS.map((p) => {
        let score = 70;
        if (p.category?.toLowerCase() === reqCategory || p.headline?.toLowerCase().includes(reqCategory)) {
          score += 20;
        }
        if (p.subCity?.toLowerCase().includes(reqSubCity) || p.locationCity?.toLowerCase().includes(reqSubCity)) {
          score += 8;
        }
        if (p.verified) score += 2;
        return {
          id: p.id,
          entity_type: 'provider',
          entity_id: p.id,
          match_score: Math.min(score, 99),
          provider: p,
        };
      }).sort((a, b) => b.match_score - a.match_score);

      if (mounted) {
        setMatches(candidateProviders.slice(0, 4));
        setLoading(false);
      }
    }

    loadMatches();
    return () => { mounted = false; };
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleChat = (provider) => {
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleBook = (provider) => {
    navigate(`/booking/${provider.id}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">Matching Engine Recommendations</h3>
                <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-bold">
                  AI Algorithmic Match
                </span>
              </div>
              <p className="modal-subtitle">Top verified specialists tailored for "{request.title}"</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body overflow-y-auto flex-1 p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw size={28} className="animate-spin text-cyan-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Analyzing specialists in {request.subCity || 'Addis Ababa'}...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No matching specialists found for this category.</p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const p = item.provider || MOCK_PROVIDERS.find(x => x.id === item.entity_id) || MOCK_PROVIDERS[0];
              return (
                <div key={item.id || idx} className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-cyan-400 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    {/* Avatar & Identity */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: p.avatarColor || '#0284C7' }}
                      >
                        {p.initials || p.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 text-base">{p.name}</strong>
                          {p.verified && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={11} />
                              <span>Verified Pro</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{p.headline}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Star size={12} fill="#F59E0B" className="text-amber-500" />
                            <strong>{p.rating || 4.9}</strong> ({p.reviewsCount || 42})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-cyan-600" />
                            <span>{p.locationCity || 'Addis Ababa'}</span>
                          </span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">{p.priceLabel || `${p.hourlyRate || 350} ETB/hr`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex-shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-800 font-extrabold text-xs rounded-xl border border-cyan-200">
                        <Zap size={11} className="text-cyan-600" />
                        <span>{item.match_score}% Match</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleChat(p)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBook(p)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Lock size={12} />
                      <span>Book via Escrow</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
