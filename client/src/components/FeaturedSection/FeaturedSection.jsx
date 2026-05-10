import React from 'react';
import PackagesSlider from './PackagesSlider';
import EventsSlider from './EventsSlider';
import './FeaturedSection.css';

const FeaturedSection = () => {
  return (
    <section className="fs-wrapper">
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
