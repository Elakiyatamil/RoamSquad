import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VibeSelector from './VibeSelector';
import './WhoAreYou.css';

const WhoAreYou = () => {
  const navigate = useNavigate();
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (vibeId) => {
    setSelectedVibe(vibeId);
    setTimeout(() => navigate('/planner', { state: { selectedVibe: vibeId } }), 450);
  };

  return (
    <section className="way-section" ref={sectionRef}>
      <div className="way-container">
        {/* Heading */}
        <h2 className={`way-title ${inView ? 'way-title--visible' : ''}`}>
          Have your own{' '}
          <span className="way-title-accent">
            travel
            <svg className="way-underline" viewBox="0 0 120 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M0,6 Q15,0 30,6 Q45,12 60,6 Q75,0 90,6 Q105,12 120,6" fill="none" stroke="#8B2040" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>{' '}
          plan
        </h2>

        {/* Vibe Selector */}
        {inView && (
          <VibeSelector 
            value={selectedVibe} 
            onSelect={handleSelect} 
            navigateOnSelect={true} 
          />
        )}

        <p className="way-swipe-hint">Swipe to explore →</p>
      </div>
    </section>
  );
};

export default WhoAreYou;
