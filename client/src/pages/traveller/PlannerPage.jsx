import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { globalSignals, useGlobalSignal } from '../../utils/signals';
import './Planner3Step.css';

const DESTINATIONS = [
  { id: 'bali', name: 'Bali', country: 'Indonesia', video: '/drone_shots.mp4', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'vietnam', name: 'Vietnam', country: 'Southeast Asia', video: '/drone_shots.mp4', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80' },
  { id: 'thailand', name: 'Thailand', country: 'Southeast Asia', video: '/drone_shots.mp4', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80' },
  { id: 'maldives', name: 'Maldives', country: 'Indian Ocean', video: '/drone_shots.mp4', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' },
  { id: 'japan', name: 'Japan', country: 'East Asia', video: '/drone_shots.mp4', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
];

const PlannerPage = () => {
  const navigate = useNavigate();
  const currentStep = useGlobalSignal(() => globalSignals.currentPlannerStep());
  const companionChoice = useGlobalSignal(() => globalSignals.getCompanionChoice());
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [hoveredDestination, setHoveredDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [duration, setDuration] = useState(7);
  const [startDate, setStartDate] = useState('');
  
  const videoRef = useRef(null);

  // Sync video with hover/selection
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [hoveredDestination, selectedDestination]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (companionChoice) {
        globalSignals.setCurrentPlannerStep(3); // Skip Step 2
      } else {
        globalSignals.setCurrentPlannerStep(2);
      }
    } else if (currentStep === 2) {
      globalSignals.setCurrentPlannerStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && companionChoice) {
      globalSignals.setCurrentPlannerStep(1);
    } else {
      globalSignals.setCurrentPlannerStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="planner-step-content">
            <div className="planner-search-wrap">
              <div className="planner-search-box">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Where do you want to go?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="destination-grid-wrap">
              <div className="destination-arched-grid">
                {DESTINATIONS.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((dest, idx) => (
                  <motion.div
                    key={dest.id}
                    className={`dest-card ${selectedDestination?.id === dest.id ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onHoverStart={() => setHoveredDestination(dest)}
                    onHoverEnd={() => setHoveredDestination(null)}
                    onClick={() => {
                      setSelectedDestination(dest);
                      globalSignals.setDestinationChoice(dest.name);
                      setTimeout(handleNext, 600);
                    }}
                  >
                    <div className="dest-image-wrap">
                      <img src={dest.image} alt={dest.name} />
                      <div className="dest-overlay" />
                      <div className="dest-info">
                        <h3>{dest.name}</h3>
                        <p>{dest.country}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="planner-step-content center-content">
            <h2 className="step-title">Who are you traveling with?</h2>
            {/* Simple fallback dial or grid */}
            <div className="companion-fallback-grid">
              {['Couple', 'Solo', 'Family', 'Friends', 'Strangers'].map((type) => (
                <button 
                  key={type}
                  className="companion-btn"
                  onClick={() => {
                    globalSignals.setCompanionChoice(type.toUpperCase());
                    handleNext();
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="planner-step-content center-content">
            <h2 className="step-title">When are you planning to go?</h2>
            <div className="duration-dates-wrap">
              <div className="input-group">
                <label><Clock size={18} /> How many nights?</label>
                <div className="number-picker">
                  <button onClick={() => setDuration(Math.max(1, duration - 1))}>-</button>
                  <span>{duration}</span>
                  <button onClick={() => setDuration(duration + 1)}>+</button>
                </div>
              </div>
              <div className="input-group">
                <label><Calendar size={18} /> Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <button 
                className="generate-btn"
                onClick={() => {
                  // Final Action: Lead to itinerary
                  navigate('/my-journeys');
                }}
              >
                Generate My Journey <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const activeVideo = hoveredDestination?.video || selectedDestination?.video || '/drone_shots.mp4';

  return (
    <div className="planner-3step-layout">
      {/* BACKGROUND VIDEO */}
      <div className="planner-bg-video-wrap">
        <video
          key={activeVideo}
          ref={videoRef}
          autoPlay muted loop playsInline
          className="planner-bg-video"
        >
          <source src={activeVideo} type="video/mp4" />
        </video>
        <div className="planner-bg-overlay" />
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="planner-progress-bar">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`progress-dot ${currentStep >= s ? 'active' : ''}`} />
        ))}
      </div>

      {/* HEADER CONTROLS */}
      <div className="planner-header">
        {currentStep > 1 && (
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="step-indicator">Step {currentStep} of 3</div>
      </div>

      {/* MAIN CONTENT WITH SLIDE TRANSITION */}
      <div className="planner-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="planner-step-container"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlannerPage;
