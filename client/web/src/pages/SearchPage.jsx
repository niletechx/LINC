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
    <div className="search-page-wrapper">
      {/* ── 1. Top Search & Compact Filter Toolbar ── */}
      <section className="search-top-banner">
        <div className="search-title-row">
          <div>
            <h1 className="search-page-title">Find Verified Specialists in Addis</h1>
            <p className="search-page-subtitle">
              Explore trusted, background-checked professionals across Addis Ababa sub-cities.
            </p>
          </div>

          {/* Mobile View Mode Switcher */}
          <div className="mobile-view-toggle-btns md:hidden">
            <button
              type="button"
              onClick={() => setMobileViewMode('list')}
              className={`view-mode-pill ${mobileViewMode === 'list' ? 'active' : ''}`}
            >
              <ListIcon size={14} />
              <span>List ({filteredProviders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('map')}
              className={`view-mode-pill ${mobileViewMode === 'map' ? 'active' : ''}`}
            >
              <MapIcon size={14} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Big Search Input Bar */}
        <div className="search-input-box">
          <Search size={19} className="search-box-icon text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by specialist name, skill, or service (e.g., Pipe Repair, Math Tutor, Car Mechanic)..."
            className="search-main-input"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="search-clear-btn">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Compact Glass Filter Toolbar (Location + Category Dropdowns & Controls) */}
        <div className="search-compact-toolbar">
          {/* 1. Sub-City Dropdown */}
          <div className="toolbar-dropdown-pill">
            <MapPin size={15} className="toolbar-icon-cyan" />
            <select
              value={selectedSubCity}
              onChange={(e) => handleSubCitySelect(e.target.value)}
              className="toolbar-select"
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
          <div className="toolbar-dropdown-pill">
            <Layers size={15} className="toolbar-icon-cyan" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="toolbar-select"
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
          <div className="toolbar-dropdown-pill">
            <Star size={14} className="star-icon-amber" />
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="toolbar-select"
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5+ ★ (Top Rated)</option>
              <option value={4.8}>4.8+ ★ (Elite)</option>
            </select>
          </div>

          {/* 4. Verified Escrow Toggle */}
          <label className={`filter-chip-toggle ${onlyVerified ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="hidden"
            />
            <ShieldCheck size={14} className="text-emerald" />
            <span>Verified</span>
          </label>

          {/* 5. Available Now Toggle */}
          <label className={`filter-chip-toggle ${onlyAvailable ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="hidden"
            />
            <span className="available-status-dot" />
            <span>Available</span>
          </label>

          {/* 6. Price Slider */}
          <div className="price-slider-group">
            <span className="price-slider-label">Max: <strong>{maxPrice} ETB/hr</strong></span>
            <input
              type="range"
              min={200}
              max={1000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="price-range-slider"
            />
          </div>

          {/* 7. Sort Dropdown */}
          <div className="sort-box">
            <ArrowUpDown size={13} className="text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="match">Best Match</option>
              <option value="rating">Top Rated (★)</option>
              <option value="jobs">Most Jobs</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags Bar (Shows only when filters are active) */}
        {hasActiveFilters && (
          <div className="search-active-tags-bar">
            <span className="active-tags-label">Active:</span>

            {selectedSubCity !== 'all' && (
              <span className="active-filter-tag">
                <span>📍 {SUB_CITIES.find(s => s.id === selectedSubCity)?.name}</span>
                <button type="button" onClick={() => handleSubCitySelect('all')}>×</button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="active-filter-tag">
                <span>{CATEGORIES.find(c => c.id === selectedCategory)?.icon} {CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
                <button type="button" onClick={() => handleCategorySelect('all')}>×</button>
              </span>
            )}

            {onlyVerified && (
              <span className="active-filter-tag">
                <span>🛡️ Verified Only</span>
                <button type="button" onClick={() => setOnlyVerified(false)}>×</button>
              </span>
            )}

            {onlyAvailable && (
              <span className="active-filter-tag">
                <span>🟢 Available Now</span>
                <button type="button" onClick={() => setOnlyAvailable(false)}>×</button>
              </span>
            )}

            {minRating > 0 && (
              <span className="active-filter-tag">
                <span>★ {minRating}+</span>
                <button type="button" onClick={() => setMinRating(0)}>×</button>
              </span>
            )}

            {maxPrice < 1000 && (
              <span className="active-filter-tag">
                <span>≤ {maxPrice} ETB/hr</span>
                <button type="button" onClick={() => setMaxPrice(1000)}>×</button>
              </span>
            )}

            <button type="button" onClick={handleClearFilters} className="clear-all-tags-btn">
              Clear All
            </button>
          </div>
        )}
      </section>

      {/* ── 2. Split Screen: Left Provider Cards + Right Sticky Map ── */}
      <div className="search-split-layout">
        {/* Left Column: Filtered Specialists List */}
        <div className={`search-list-pane ${mobileViewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="search-results-summary-row">
            <span className="results-count-text">
              Showing <strong>{filteredProviders.length}</strong> specialists in{' '}
              <strong>{SUB_CITIES.find(s => s.id === selectedSubCity)?.name || 'Addis Ababa'}</strong>
            </span>
            {(searchTerm || selectedCategory !== 'all' || selectedSubCity !== 'all' || onlyVerified || onlyAvailable || minRating > 0 || maxPrice < 1000) && (
              <button type="button" onClick={handleClearFilters} className="clear-filters-btn">
                Reset All Filters
              </button>
            )}
          </div>

          {filteredProviders.length > 0 ? (
            <div className="search-providers-grid">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  ref={(el) => (cardRefs.current[provider.id] = el)}
                  onClick={() => handleCardClick(provider.id)}
                  onMouseEnter={() => setHoveredProviderId(provider.id)}
                  onMouseLeave={() => setHoveredProviderId(null)}
                  className={`search-card-wrapper ${selectedProviderId === provider.id ? 'highlighted-card' : ''} ${hoveredProviderId === provider.id ? 'hovered-card' : ''}`}
                >
                  <ProviderCard provider={provider} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-search-results">
              <div className="empty-icon-wrap">
                <Search size={36} />
              </div>
              <h3 className="empty-title">No specialists found in this area</h3>
              <p className="empty-desc">
                Try selecting "All Addis Ababa", removing price/rating restrictions, or searching for another category.
              </p>
              <button type="button" onClick={handleClearFilters} className="btn btn-primary btn-sm">
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Interactive Map */}
        <div className={`search-map-pane ${mobileViewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <InteractiveMapView
            providers={filteredProviders}
            selectedProviderId={selectedProviderId}
            hoveredProviderId={hoveredProviderId}
            onSelectProvider={handleProviderSelectFromMap}
            selectedSubCity={selectedSubCity}
          />
        </div>
      </div>

      {/* ── 3. Floating Mobile Switcher Pill ── */}
      <div className="floating-mobile-view-pill md:hidden">
        <button
          type="button"
          onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')}
          className="mobile-switch-action-btn"
        >
          {mobileViewMode === 'list' ? (
            <>
              <MapIcon size={16} />
              <span>Show Map View ({filteredProviders.length})</span>
            </>
          ) : (
            <>
              <ListIcon size={16} />
              <span>Show List View ({filteredProviders.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
