import { MapPin, Check, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const ADDIS_LOCATIONS = [
  { name: 'Bole', sub: 'Airport, Medhanialem, Atlas, Edna Mall' },
  { name: 'Kazanchis', sub: 'ECA, Intercontinental, Guinea Conakry' },
  { name: 'Sarbet', sub: 'Vatican, Old Airport, Karl Square' },
  { name: 'CMC / Summit', sub: 'Sunshine, Tsehay Real Estate, Safari' },
  { name: 'Megenagna', sub: 'Lem Hotel, Zefmesh, Shola Market' },
  { name: 'Piassa / Arada', sub: 'Churchill Ave, Taitu, Commercial Bank' },
  { name: 'Bisrate Gabriel', sub: 'Laphto, Old Airport, Vatican' },
  { name: 'Gerji / Imperial', sub: 'Jackros, Unity University, Roba' },
  { name: 'Lebu / Jemo', sub: 'Varnero, Glass Factory, Jemo 1-3' },
  { name: 'Mexico / Stadium', sub: 'KKare, Sengatera, Sante' },
];

export default function LocationPickerModal() {
  const { isLocationPickerOpen, setLocationPickerOpen, currentLocation, setCurrentLocation } = useAppStore();

  if (!isLocationPickerOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setLocationPickerOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <MapPin size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Select Location</h3>
              <p className="modal-subtitle">Filter service providers in Addis Ababa</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setLocationPickerOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body max-h-96 overflow-y-auto">
          <div className="locations-list">
            {ADDIS_LOCATIONS.map((loc, idx) => {
              const fullLoc = `${loc.name}, Addis Ababa`;
              const isSelected = currentLocation.startsWith(loc.name);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentLocation(fullLoc);
                    setLocationPickerOpen(false);
                  }}
                  className={`location-item-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div className="location-item-left">
                    <span className="location-name">{loc.name}</span>
                    <span className="location-sub">{loc.sub}</span>
                  </div>
                  {isSelected && <Check size={18} className="text-cyan" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
