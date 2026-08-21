import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Navigation, ShieldCheck, Star } from 'lucide-react';
import { SUB_CITIES } from '../../data/mockData';

// Fix default marker icon issues in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ADDIS_CENTER = [9.0192, 38.7525];

export default function InteractiveMapView({
  providers = [],
  selectedProviderId = null,
  hoveredProviderId = null,
  onSelectProvider = () => {},
  selectedSubCity = 'all'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet map with CartoDB Positron tiles (light clean theme)
    const map = L.map(mapContainerRef.current, {
      center: ADDIS_CENTER,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Add custom zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when providers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    providers.forEach((p) => {
      if (!p.lat || !p.lng) return;

      const isSelected = p.id === selectedProviderId;
      const isHovered = p.id === hoveredProviderId;

      // Custom HTML Pin element
      const pinHtml = `
        <div class="custom-map-pin ${isSelected ? 'active-pin' : ''} ${isHovered ? 'hovered-pin' : ''}" data-provider-id="${p.id}">
          <div class="pin-avatar" style="background-color: ${p.avatarColor || '#0284C7'};">
            ${p.initials || 'L'}
          </div>
          <div class="pin-price-pill">
            <span class="pin-price-val">${p.priceLabel || `${p.hourlyRate} ETB/hr`}</span>
            ${p.verified ? '<span class="pin-verified-dot">✓</span>' : ''}
          </div>
          <div class="pin-pointer-triangle"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'linc-leaflet-div-icon',
        html: pinHtml,
        iconSize: [110, 42],
        iconAnchor: [55, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(map);

      // Popup Content Card
      const popupHtml = `
        <div class="map-popup-card">
          <div class="popup-header-row">
            <div class="popup-avatar" style="background: ${p.avatarColor || '#0284C7'};">
              ${p.initials || 'L'}
            </div>
            <div>
              <h4 class="popup-name">${p.name}</h4>
              <p class="popup-headline">${p.headline}</p>
            </div>
          </div>
          <div class="popup-meta-row">
            <span class="popup-rating">★ ${p.rating} (${p.reviewsCount})</span>
            <span class="popup-location">📍 ${p.locationCity}</span>
          </div>
          <div class="popup-footer-row">
            <span class="popup-price">${p.priceLabel}</span>
            <a href="/provider/${p.id}" class="popup-view-btn">View Profile →</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'linc-glass-popup',
        maxWidth: 280,
      });

      marker.on('click', () => {
        onSelectProvider(p.id);
      });

      markersRef.current[p.id] = marker;
    });
  }, [providers, selectedProviderId, hoveredProviderId, onSelectProvider]);

  // Handle Hover effect dynamically on existing markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hoveredProviderId && markersRef.current[hoveredProviderId]) {
      const marker = markersRef.current[hoveredProviderId];
      const el = marker.getElement();
      if (el) {
        const pin = el.querySelector('.custom-map-pin');
        if (pin) pin.classList.add('hovered-pin');
      }
      marker.openPopup();
    } else {
      // Remove hover from all
      Object.values(markersRef.current).forEach((marker) => {
        const el = marker.getElement();
        if (el) {
          const pin = el.querySelector('.custom-map-pin');
          if (pin && !pin.classList.contains('active-pin')) {
            pin.classList.remove('hovered-pin');
          }
        }
      });
    }
  }, [hoveredProviderId]);

  // Pan to selected sub-city or selected provider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedProviderId && markersRef.current[selectedProviderId]) {
      const marker = markersRef.current[selectedProviderId];
      map.flyTo(marker.getLatLng(), 14, { duration: 0.8 });
      marker.openPopup();
    } else if (selectedSubCity && selectedSubCity !== 'all') {
      const subCityObj = SUB_CITIES.find((sc) => sc.id === selectedSubCity);
      if (subCityObj) {
        map.flyTo([subCityObj.lat, subCityObj.lng], subCityObj.zoom || 14, { duration: 0.8 });
      }
    }
  }, [selectedProviderId, selectedSubCity]);

  const handleRecenterAddis = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(ADDIS_CENTER, 12, { duration: 0.8 });
    }
  };

  return (
    <div className="interactive-map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-canvas" />

      {/* Floating Map Controls & Overlays */}
      <div className="map-floating-bar">
        <button
          type="button"
          onClick={handleRecenterAddis}
          className="map-recenter-btn"
          title="Recenter Map on Addis Ababa"
        >
          <Compass size={15} />
          <span>Addis Ababa</span>
        </button>

        <div className="map-live-badge">
          <span className="live-pulse-dot" />
          <span>{providers.length} Specialists on Map</span>
        </div>
      </div>
    </div>
  );
}
