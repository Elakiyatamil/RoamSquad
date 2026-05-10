import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './WhoAreYou.css';

const VIBES = [
  { id: 'solo',      label: 'Solo',      img: '/solo.png',      bg: '#EEF3FF', delay: '0.1s' },
  { id: 'couple',    label: 'Couple',    img: '/couple.png',    bg: '#FFF0F3', delay: '0.2s' },
  { id: 'family',    label: 'Family',    img: '/family.png',    bg: '#FFF8EE', delay: '0.3s' },
  { id: 'friends',   label: 'Friends',   img: '/friends.png',   bg: '#F0FAF0', delay: '0.4s' },
  { id: 'strangers', label: 'Strangers', img: '/strangers.png', bg: '#F5F0FF', delay: '0.5s' },
];

const VibeSelector = ({ value, onSelect, navigateOnSelect = true }) => {
  const [animating, setAnimating] = useState(null);

  const handleVibeClick = (vibeId) => {
    setAnimating(vibeId);
    setTimeout(() => {
      setAnimating(null);
      if (onSelect) onSelect(vibeId);
    }, 400);
  };

  return (
    <div className="vibe-row" style={{ paddingBottom: '20px' }}>
      {VIBES.map((v) => {
        const isSelected  = value === v.id;
        const isAnimating = animating === v.id;

        return (
          <div
            key={v.id}
            className="vibe-item"
            style={{ '--delay': v.delay }}
          >
            <button
              className={`vibe-card vibe-card--in ${isSelected ? 'vibe-card--selected' : ''} ${isAnimating ? 'vibe-card--bounce' : ''}`}
              style={{ background: v.bg }}
              data-vibe={v.id.toUpperCase()}
              onClick={() => handleVibeClick(v.id)}
              aria-label={`Select ${v.label} vibe`}
            >
              <img src={v.img} alt={v.label} />
            </button>

            <p className={`vibe-label ${isSelected ? 'vibe-label--active' : ''}`}>
              {v.label}
            </p>
          </div>
        )
      })}
    </div>
  );
};

export default VibeSelector;
