import React from 'react';
import PackagesSlider from './PackagesSlider';
import EventsSlider from './EventsSlider';
import { useGashapon } from '../../context/GashaponContext.jsx';
import './FeaturedSection.css';

const FeaturedSection = () => {
  const { openGashapon } = useGashapon();

  return (
    <section className="fs-wrapper" id="featured-packages">
      {/* Surprise Me CTA — Directly before Featured Packages */}
      <div className="fs-surprise-trigger-wrapper">
        <button
          onClick={openGashapon}
          className="fs-surprise-trigger-btn"
          aria-label="Surprise Me — Spin for a Destination!"
        >
          <span className="fs-surprise-dice">🎲</span>
          <span className="fs-surprise-label">Feeling Adventurous? Try "Surprise Me"!</span>
        </button>
      </div>

      <div className="fs-packages-section">
        <PackagesSlider />
      </div>
      
      <div className="fs-events-section">

        <EventsSlider />
      </div>
    </section>
  );
};

export default FeaturedSection;
