import React from 'react';
import { MapPin } from 'lucide-react';
import { SUB_CITIES } from '../../data/mockData';

export default function SubCitySelector({ selectedSubCity, onSelectSubCity, providerCounts = {} }) {
  return (
    <div className="subcity-selector-wrap">
      <div className="subcity-header-row">
        <span className="subcity-label">
          <MapPin size={13} />
          <span>Addis Ababa Sub-Cities</span>
        </span>
      </div>

      <div className="subcity-pill-scroll">
        {SUB_CITIES.map((sc) => {
          const isSelected = selectedSubCity === sc.id;
          const count = providerCounts[sc.id] ?? (sc.id === 'all' ? Object.values(providerCounts).reduce((a, b) => a + b, 0) : 0);

          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectSubCity(sc.id)}
              className={`subcity-pill-btn ${isSelected ? 'active' : ''}`}
            >
              <span className="subcity-name-en">{sc.name}</span>
              <span className="subcity-name-am">{sc.amharic}</span>
              {count > 0 && <span className="subcity-count-badge">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
