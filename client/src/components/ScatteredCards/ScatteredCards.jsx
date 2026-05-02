import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScatteredCards.css';

// Each card has a fixed position + rotation — scattered in corners like the Dragonfly inspo
const CARDS = [
  {
    id: 1, name: 'Bali', country: 'Indonesia', tag: 'Island Dreams',
    image: '/assets/destinations/bali.png',
    pos: { top: '8%',    left: '4%'  },
    rotate: -9,
  },
  {
    id: 2, name: 'Iceland', country: 'Iceland', tag: 'Wild North',
    image: '/assets/destinations/iceland.png',
    pos: { top: '6%',    right: '5%' },
    rotate: 8,
  },
  {
    id: 3, name: 'Santorini', country: 'Greece', tag: 'Azure Escape',
    image: '/assets/destinations/santorini.png',
    pos: { bottom: '10%', left: '5%' },
    rotate: 7,
  },
  {
    id: 4, name: 'Tokyo', country: 'Japan', tag: 'Neon & Tradition',
    image: '/assets/destinations/tokyo.png',
    pos: { bottom: '8%',  right: '4%' },
    rotate: -8,
  },
];

const ScatteredCards = () => {
  const [hovered,    setHovered]   = useState(null);
  const [isHolding,  setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const navigate  = useNavigate();

  const startHold = (e) => {
    e.preventDefault();
    setIsHolding(true);
    holdTimer.current = setTimeout(() => navigate('/planner'), 1200);
  };
  const stopHold = () => {
    setIsHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  return (
    <section className="sc2-section">
      {/* ── Scattered destination cards in the 4 corners ── */}
      {CARDS.map((card) => {
        const isHov = hovered === card.id;
        const cardStyle = {
          ...card.pos,
          transform: isHov
            ? 'rotate(0deg) scale(1.06) translateY(-10px)'
            : `rotate(${card.rotate}deg)`,
          zIndex: isHov ? 20 : 5,
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), z-index 0s',
        };

        return (
          <div
            key={card.id}
            className="sc2-card"
            style={cardStyle}
            onMouseEnter={() => setHovered(card.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <img src={card.image} alt={card.name} className="sc2-card-img" loading="lazy" />
            <div className="sc2-card-overlay" />
            <div className="sc2-card-info">
              <span className="sc2-card-tag">{card.tag}</span>
              <h3 className="sc2-card-name">{card.name}</h3>
              <p className="sc2-card-country">{card.country}</p>
            </div>
          </div>
        );
      })}

      {/* ── Centre: ONLY the hold button ── */}
      <div className="sc2-center">
        <div
          className={`sc2-hold ${isHolding ? 'holding' : ''}`}
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
        >
          <svg className="sc2-ring" viewBox="0 0 140 140">
            <circle className="sc2-ring-track" cx="70" cy="70" r="62" />
            <circle className="sc2-ring-fill"  cx="70" cy="70" r="62" />
          </svg>
          <div className="sc2-hold-inner">
            <span className="sc2-arrow">↗</span>
            <span className="sc2-label">HOLD TO CREATE<br />YOUR ITINERARY</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScatteredCards;
