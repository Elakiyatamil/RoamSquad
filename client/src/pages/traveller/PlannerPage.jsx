import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, Calendar, Users, MapPin, Clock, Zap, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { globalSignals, useGlobalSignal } from '../../utils/signals';
import './Planner3Step.css';

// New Travel Machine Components
import MapHUD from '../../components/TravelMachine/MapHUD';
import ResultsGrid from '../../components/TravelMachine/ResultsGrid';
import TrustLayer from '../../components/TravelMachine/TrustLayer';
import NicheCustomization from '../../components/TravelMachine/NicheCustomization';
import ItineraryBuilder from '../../components/TravelMachine/ItineraryBuilder';
import PersonaSwitcher from '../../components/TravelMachine/PersonaSwitcher';
import FloatingTripBuilder from '../../components/TravelMachine/FloatingTripBuilder';

const DESTINATIONS = [
  { id: 'bali', name: 'Bali', country: 'Indonesia', video: '/droneshot.mp4', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'vietnam', name: 'Vietnam', country: 'Southeast Asia', video: '/waterfall.mp4', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80' },
  { id: 'thailand', name: 'Thailand', country: 'Southeast Asia', video: '/sea.mp4', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80' },
  { id: 'maldives', name: 'Maldives', country: 'Indian Ocean', video: '/fall.mp4', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' },
  { id: 'japan', name: 'Japan', country: 'East Asia', video: '/droneshot.mp4', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
];

const PlannerPage = () => {
  const navigate = useNavigate();
  const currentStep = useGlobalSignal(() => globalSignals.currentPlannerStep());
  const companionChoice = useGlobalSignal(() => globalSignals.getCompanionChoice());
  
  const [lifecycleStage, setLifecycleStage] = useState('PLANNING'); // PLANNING or RESULTS
  const [activePersona, setActivePersona] = useState('COUPLE');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [hoveredDestination, setHoveredDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [duration, setDuration] = useState(5);
  const [startDate, setStartDate] = useState('');
  
  const [activeLocation, setActiveLocation] = useState({ id: 'bali', name: 'Bali', video: 'https://v1.peaceful-travel.com/bali_drone.mp4' });
  const [nextVideo, setNextVideo] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const videoRef = useRef(null);
  const nextVideoRef = useRef(null);

  // Sync video with hover/selection in planning stage
  useEffect(() => {
    if (lifecycleStage === 'PLANNING' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [hoveredDestination, selectedDestination, lifecycleStage]);

  const handleLocationSelect = (loc) => {
    if (loc.id === activeLocation.id || isFading) return;
    
    setNextVideo(loc.video);
    setIsFading(true);
    
    setTimeout(() => {
      setActiveLocation(loc);
      setNextVideo(null);
      setIsFading(false);
    }, 1000); // Cross-fade duration
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (companionChoice) {
        globalSignals.setCurrentPlannerStep(3);
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

  const startTravelMachine = () => {
    setLifecycleStage('RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPlanningStep = () => {
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
                className="find-escape-btn"
                onClick={startTravelMachine}
              >
                Find My Escape <Zap size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (lifecycleStage === 'RESULTS') {
    return (
      <ItineraryBuilder 
        destination={selectedDestination} 
        duration={duration} 
        startDate={startDate} 
      />
    );
  }

  const activeVideo = hoveredDestination?.video || selectedDestination?.video || 'https://v1.peaceful-travel.com/bali_drone.mp4';

  return (
    <div className="planner-3step-layout">
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

      <div className="planner-progress-bar">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`progress-dot ${currentStep >= s ? 'active' : ''}`} />
        ))}
      </div>

      <div className="planner-header">
        {currentStep > 1 && (
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="step-indicator">Step {currentStep} of 3</div>
      </div>

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
            {renderPlanningStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlannerPage;
