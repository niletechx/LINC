import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, MapPin, Star, ArrowUpDown, X, Filter } from 'lucide-react';
import { MOCK_PROVIDERS, CATEGORIES } from '../data/mockData';
import ProviderCard from '../components/provider/ProviderCard';
import { useAppStore } from '../stores/appStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLocation } = useAppStore();

  const queryParam = searchParams.get('q') || searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState('match');

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((provider) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catMatch = provider.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          provider.headline?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          provider.skills?.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      // Verified filter
      if (onlyVerified && !provider.verified) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = provider.name?.toLowerCase().includes(q);
        const matchesHeadline = provider.headline?.toLowerCase().includes(q);
        const matchesBio = provider.about?.toLowerCase().includes(q);
        const matchesSkills = provider.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesHeadline && !matchesBio && !matchesSkills) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'jobs') return (b.completedJobs || 0) - (a.completedJobs || 0);
      if (sortBy === 'price_asc') {
        const pA = parseInt((a.priceLabel || '0').replace(/\D/g, '')) || 0;
        const pB = parseInt((b.priceLabel || '0').replace(/\D/g, '')) || 0;
        return pA - pB;
      }
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [searchTerm, selectedCategory, onlyVerified, sortBy]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId, q: searchTerm });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setOnlyVerified(false);
    setSearchParams({});
  };

  return (
    <div className="search-container">
      {/* Search Header Banner */}
      <section className="search-header-banner">
        <div className="search-title-block">
          <h1 className="search-page-title">Find Verified Specialists</h1>
          <p className="search-page-subtitle">
            Search verified plumbers, electricians, tutors, and cleaners in {currentLocation || 'Addis Ababa'}.
          </p>
        </div>

        {/* Big Search Input */}
        <div className="search-input-box">
          <Search size={20} className="search-box-icon text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, skill, or service (e.g., Pipe leakage, Math Tutor, Deep Cleaning)..."
            className="search-main-input"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="search-clear-btn">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="search-filter-bar">
          {/* Category Pills */}
          <div className="search-categories-chips">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={`search-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              <span>🌟 All Services</span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`search-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.icon} {cat.name}</span>
              </button>
            ))}
          </div>

          {/* Sort & Toggle Controls */}
          <div className="search-sort-controls">
            <label className="verified-filter-toggle">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
              />
              <ShieldCheck size={16} className="text-emerald" />
              <span className="toggle-label">Verified only</span>
            </label>

            <div className="sort-box">
              <ArrowUpDown size={14} className="text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="match">Best Match</option>
                <option value="rating">Top Rated (★)</option>
                <option value="jobs">Most Completed Jobs</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Summary */}
      <div className="search-results-header">
        <span>Showing <strong>{filteredProviders.length}</strong> available professionals</span>
        {(searchTerm || selectedCategory !== 'all' || onlyVerified) && (
          <button type="button" onClick={handleClear} className="clear-filters-btn">
            Clear all filters
          </button>
        )}
      </div>

      {/* Providers Grid */}
      {filteredProviders.length > 0 ? (
        <div className="providers-grid">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="empty-results-box">
          <div className="empty-icon-wrap">
            <Search size={32} />
          </div>
          <h3>No providers found matching your criteria</h3>
          <p>Try searching for a different skill, expanding your location, or clearing active filters.</p>
          <button type="button" onClick={handleClear} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
