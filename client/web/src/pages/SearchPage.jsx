import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  Star, 
  ArrowUpDown, 
  X, 
  Filter, 
  Layers,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  DollarSign,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { MOCK_PROVIDERS, CATEGORIES, SUB_CITIES } from '../data/mockData';
import ProviderCard from '../components/provider/ProviderCard';
import InteractiveMapView from '../components/search/InteractiveMapView';
import { useAppStore } from '../stores/appStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLocation } = useAppStore();

  const queryParam = searchParams.get('q') || searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const subCityParam = searchParams.get('subcity') || 'all';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSubCity, setSelectedSubCity] = useState(subCityParam);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('match');
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [hoveredProviderId, setHoveredProviderId] = useState(null);
  const [mobileViewMode, setMobileViewMode] = useState('list'); // 'list' | 'map'

  const cardRefs = useRef({});

  // Calculate provider counts per sub-city
  const providerCounts = useMemo(() => {
    const counts = {};
    MOCK_PROVIDERS.forEach((p) => {
      if (p.subCity) {
        counts[p.subCity] = (counts[p.subCity] || 0) + 1;
      }
    });
    return counts;
  }, []);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((provider) => {
      // 1. Sub-city filter
      if (selectedSubCity !== 'all' && provider.subCity !== selectedSubCity) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        const catMatch = provider.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          provider.headline?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          provider.skills?.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      // 3. Verified filter
      if (onlyVerified && !provider.verified) return false;

      // 4. Availability filter
      if (onlyAvailable && provider.availabilityStatus !== 'available') return false;

      // 5. Rating filter
      if (minRating > 0 && (provider.rating || 0) < minRating) return false;

      // 6. Price filter
      if (provider.hourlyRate && provider.hourlyRate > maxPrice) return false;

      // 7. Text search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = provider.name?.toLowerCase().includes(q);
        const matchesHeadline = provider.headline?.toLowerCase().includes(q);
        const matchesBio = provider.about?.toLowerCase().includes(q);
        const matchesSkills = provider.skills?.some(s => s.toLowerCase().includes(q));
        const matchesLocation = provider.locationCity?.toLowerCase().includes(q);
        if (!matchesName && !matchesHeadline && !matchesBio && !matchesSkills && !matchesLocation) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'jobs') return (b.completedJobs || 0) - (a.completedJobs || 0);
      if (sortBy === 'price_asc') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      if (sortBy === 'price_desc') return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [searchTerm, selectedCategory, selectedSubCity, onlyVerified, onlyAvailable, minRating, maxPrice, sortBy]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId, subcity: selectedSubCity, q: searchTerm });
  };

  const handleSubCitySelect = (scId) => {
    setSelectedSubCity(scId);
    setSearchParams({ category: selectedCategory, subcity: scId, q: searchTerm });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubCity('all');
    setOnlyVerified(false);
    setOnlyAvailable(false);
    setMinRating(0);
    setMaxPrice(1000);
    setSortBy('match');
    setSelectedProviderId(null);
    setSearchParams({});
  };

  const handleCardClick = (providerId) => {
    setSelectedProviderId(providerId);
  };

  const handleProviderSelectFromMap = (providerId) => {
    setSelectedProviderId(providerId);
    const cardEl = cardRefs.current[providerId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedSubCity !== 'all' || onlyVerified || onlyAvailable || minRating > 0 || maxPrice < 1000;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* ── 1. Top Search & Compact Filter Toolbar ── */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find Verified Specialists in Addis</h1>
              <p className="text-sm text-slate-500 mt-1">
                Explore trusted, background-checked professionals across Addis Ababa sub-cities.
              </p>
            </div>

            {/* Mobile View Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 self-start sm:self-auto md:hidden">
              <button
                type="button"
                onClick={() => setMobileViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  mobileViewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListIcon size={13} />
                <span>List ({filteredProviders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  mobileViewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon size={13} />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xs focus-within:border-teal-600 focus-within:bg-white transition-all">
              <SlidersHorizontal size={18} className="text-slate-400 shrink-0" />
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by specialist name, skill, or service (e.g. Pipe Repair, Math Tutor, Electrician)..."
                className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => setSearchTerm('')} 
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Compact Glass Filter Toolbar (Location + Category Dropdowns & Controls) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* 1. Sub-City Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
              <MapPin size={13} className="text-teal-600" />
              <select
                value={selectedSubCity}
                onChange={(e) => handleSubCitySelect(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">📍 All Addis Ababa</option>
                {SUB_CITIES.filter(s => s.id !== 'all').map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.amharic})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
              <Layers size={13} className="text-teal-600" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">🌟 All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Rating Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
              <Star size={13} fill="#F59E0B" className="text-amber-500" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5+ ★ (Top Rated)</option>
                <option value={4.8}>4.8+ ★ (Elite)</option>
              </select>
            </div>

            {/* 4. Verified Escrow Toggle */}
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
              onlyVerified ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="hidden"
              />
              <ShieldCheck size={13} className={onlyVerified ? 'text-teal-600' : 'text-slate-400'} />
              <span>Verified Only</span>
            </label>

            {/* 5. Available Now Toggle */}
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
              onlyAvailable ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="hidden"
              />
              <span className={`w-1.5 h-1.5 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>Available Now</span>
            </label>

            {/* 6. Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 ml-auto">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="match">Best Match</option>
                <option value="rating">Top Rated (★)</option>
                <option value="jobs">Most Jobs</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400">Active:</span>

              {selectedSubCity !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  <span>📍 {SUB_CITIES.find(s => s.id === selectedSubCity)?.name}</span>
                  <button type="button" onClick={() => handleSubCitySelect('all')} className="hover:text-slate-950 font-bold">×</button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  <span>{CATEGORIES.find(c => c.id === selectedCategory)?.icon} {CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
                  <button type="button" onClick={() => handleCategorySelect('all')} className="hover:text-slate-950 font-bold">×</button>
                </span>
              )}

              {onlyVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800">
                  <span>🛡️ Verified</span>
                  <button type="button" onClick={() => setOnlyVerified(false)} className="hover:text-teal-950 font-bold">×</button>
                </span>
              )}

              {onlyAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  <span>🟢 Available</span>
                  <button type="button" onClick={() => setOnlyAvailable(false)} className="hover:text-emerald-950 font-bold">×</button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                  <span>★ {minRating}+</span>
                  <button type="button" onClick={() => setMinRating(0)} className="hover:text-amber-950 font-bold">×</button>
                </span>
              )}

              <button 
                type="button" 
                onClick={handleClearFilters} 
                className="text-xs font-bold text-teal-700 hover:text-teal-800 ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Split Screen: Left Provider Cards + Right Sticky Map ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Filtered Specialists List (7 columns) */}
          <div className={`lg:col-span-7 space-y-6 ${mobileViewMode === 'map' ? 'hidden md:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-700">
                Showing <strong className="text-slate-950 font-extrabold">{filteredProviders.length}</strong> specialists in{' '}
                <strong className="text-teal-800 font-extrabold">{SUB_CITIES.find(s => s.id === selectedSubCity)?.name || 'Addis Ababa'}</strong>
              </span>
              {(searchTerm || selectedCategory !== 'all' || selectedSubCity !== 'all' || onlyVerified || onlyAvailable || minRating > 0) && (
                <button 
                  type="button" 
                  onClick={handleClearFilters} 
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    ref={(el) => (cardRefs.current[provider.id] = el)}
                    onClick={() => handleCardClick(provider.id)}
                    onMouseEnter={() => setHoveredProviderId(provider.id)}
                    onMouseLeave={() => setHoveredProviderId(null)}
                    className={`transition-all duration-200 ${
                      selectedProviderId === provider.id ? 'ring-2 ring-teal-500 rounded-3xl scale-[1.01]' : ''
                    }`}
                  >
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900">No specialists found in this area</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try selecting "All Addis Ababa", removing price/rating restrictions, or searching for another service.
                </p>
                <button 
                  type="button" 
                  onClick={handleClearFilters} 
                  className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Map (5 columns) */}
          <div className={`lg:col-span-5 sticky top-24 ${mobileViewMode === 'list' ? 'hidden md:block' : 'block'}`}>
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden h-[600px] flex flex-col">
              <InteractiveMapView
                providers={filteredProviders}
                selectedProviderId={selectedProviderId}
                hoveredProviderId={hoveredProviderId}
                onSelectProvider={handleProviderSelectFromMap}
                selectedSubCity={selectedSubCity}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. Floating Mobile Switcher Pill ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xl"
        >
          {mobileViewMode === 'list' ? (
            <>
              <MapIcon size={14} />
              <span>Show Map ({filteredProviders.length})</span>
            </>
          ) : (
            <>
              <ListIcon size={14} />
              <span>Show List ({filteredProviders.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
