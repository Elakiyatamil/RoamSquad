import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const LOCATIONS = [
  { id: 'ubud', name: 'Ubud', x: '45%', y: '40%', video: 'https://v1.peaceful-travel.com/bali_ubud.mp4' },
  { id: 'uluwatu', name: 'Uluwatu', x: '40%', y: '85%', video: 'https://v1.peaceful-travel.com/bali_uluwatu.mp4' },
  { id: 'seminyak', name: 'Seminyak', x: '35%', y: '70%', video: 'https://v1.peaceful-travel.com/bali_seminyak.mp4' },
  { id: 'nusa-penida', name: 'Nusa Penida', x: '80%', y: '75%', video: 'https://v1.peaceful-travel.com/bali_nusa.mp4' }
];

const MapHUD = ({ onLocationSelect, activeLocationId }) => {
  return (
    <div className="map-hud-container">
      <div className="map-wrapper">
        {/* Minimalist Bali SVG Outline (Simplified) */}
        <svg viewBox="0 0 200 150" className="bali-outline">
          <path 
            d="M50,40 C60,20 100,10 140,30 C160,40 180,70 170,100 C160,120 120,140 80,130 C50,120 30,80 50,40 Z" 
            fill="rgba(255,255,255,0.1)" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1"
          />
        </svg>

        {LOCATIONS.map((loc) => (
          <motion.div
            key={loc.id}
            className={`map-pin-wrap ${activeLocationId === loc.id ? 'active' : ''}`}
            style={{ left: loc.x, top: loc.y }}
            whileHover={{ scale: 1.2 }}
            onClick={() => onLocationSelect(loc)}
          >
            <div className="pulse-ring" />
            <MapPin size={16} className="pin-icon" />
            <span className="pin-label">{loc.name}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="active-location-indicator">
        <span className="location-name">
          {LOCATIONS.find(l => l.id === activeLocationId)?.name || 'Bali'}
        </span>
      </div>
    </div>
  );
};

export default MapHUD;
