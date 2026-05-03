import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronDown, 
  ArrowRight, 
  User, 
  Heart, 
  Sparkles,
  Plus,
  Minus,
  Users
} from 'lucide-react';
import axios from 'axios';
import './Planner3Step.css';
import ItineraryBuilder from '../../components/TravelMachine/ItineraryBuilder';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const TRIP_TYPES = [
  { id: 'solo', label: 'Solo', icon: <User size={14} />, color: '#FF4D4D' },
  { id: 'couple', label: 'Couple', icon: <Heart size={14} />, color: '#FF79C6' },
  { id: 'family', label: 'Family', icon: <Users size={14} />, color: '#50FA7B' },
  { id: 'friends', label: 'Friends', icon: <Users size={14} />, color: '#8BE9FD' },
  { id: 'strangers', label: 'Strangers', icon: <Sparkles size={14} />, color: '#BD93F9' }
];

// Mock histogram data for the budget slider
const HISTOGRAM_BARS = [12, 18, 35, 42, 28, 45, 60, 52, 38, 25, 15, 10];

const PlannerPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // TRANSFORMS FOR STACKED ANIMATION
  // Total scroll: 0-1.0. 
  // Hero Section movement (Parallax away)
  const heroY = useTransform(scrollYProgress, [0, 0.33], ["0%", "-50%"]);
  
  // timelineY: Slides up very early
  const timelineY = useTransform(scrollYProgress, [0.05, 0.4], ["100%", "5%"]);
  
  // vibeY: Slides up after timeline
  const vibeY = useTransform(scrollYProgress, [0.4, 0.75], ["100%", "0%"]);
  
  // Header effects
  const headerScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.7]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const carouselOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // STATE
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // USER CHOICES
  const [duration, setDuration] = useState(3);
  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetRange, setBudgetRange] = useState(25000);
  const [tripType, setTripType] = useState('couple');

  // HOLD LOGIC
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef(null);
  const CIRCLE_RADIUS = 35; // Smaller radius for step 3 design
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // FETCH DATA
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/destinations`);
        if (response.data.success) {
          const mapped = response.data.data.map(d => ({
            ...d,
            displayImage: d.coverImage || d.images?.[0] || `https://loremflickr.com/800/1200/travel,${d.name.replace(/\s+/g, '')}`
          }));
          setDestinations(mapped);
          if (mapped.length > 0) setSelectedDestination(mapped[0]);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  // HANDLERS
  const handleHoldStart = () => {
    holdTimer.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimer.current);
          setShowResults(true);
          return 100;
        }
        return prev + 1.35;
      });
    }, 20);
  };

  const handleHoldEnd = () => {
    clearInterval(holdTimer.current);
    setHoldProgress(0);
  };

  if (showResults) {
    return (
      <ItineraryBuilder 
        destination={selectedDestination} 
        duration={duration} 
        startDate={startDate}
        tripConfig={{ adults, children, budgetRange, tripType }}
      />
    );
  }

  return (
    <div className="planner-3step-layout allow-scroll">
      {/* 1. BACKGROUND VIDEO */}
      <div className="planner-bg-video-wrap">
        <video autoPlay muted loop playsInline className="planner-bg-video">
          <source src="/droneshot.mp4" type="video/mp4" />
        </video>
        <div className="planner-bg-overlay" />
      </div>

      {/* 2. PERSISTENT HEADER (CANVA LOOK) */}
      <div className="persistent-header-fixed">
        <h1 className="text-white text-sm uppercase tracking-[0.4em] font-bold">where to next?</h1>
      </div>

      <div className="planner-main-scrollable no-scrollbar" ref={containerRef}>
        
        {/* SECTION 1: HERO & CAROUSEL */}
        <motion.section className="planner-section sticky-stack" style={{ y: heroY }}>
          <motion.div 
            className="section-header-text hero-only"
            style={{ scale: headerScale, opacity: headerOpacity }}
          >
             <h1 className="glitch-text">Where to next?</h1>
          </motion.div>

          <motion.div 
            className="destination-carousel no-scrollbar"
            style={{ opacity: carouselOpacity }}
          >
            {loading ? (
              <div className="text-white/20 text-center w-full italic">Summoning destinations...</div>
            ) : destinations.map((dest, idx) => {
              const isSelected = selectedDestination?.id === dest.id;
              return (
                <motion.div
                  key={dest.id}
                  className={`destination-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedDestination(dest)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <img src={dest.displayImage} alt={dest.name} loading="lazy" />
                  <div className="destination-card-overlay">
                    <p>{dest.location || 'Boutique Experience'}</p>
                    <h3 className="text-xl font-bold">{dest.name}</h3>
                  </div>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 bg-[#00D084] rounded-full p-2 shadow-lg z-30"
                    >
                      <ArrowRight size={16} className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
          
          <AnimatePresence>
            {selectedDestination && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest">select and scroll down</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <section className="planner-section sticky-stack">
          {selectedDestination && (
            <img src={selectedDestination.displayImage} className="timeline-card-bg" alt="" />
          )}
          <motion.div 
            className="sequence-card"
            style={{ y: timelineY }}
          >
             {/* Sub-header for card */}
            <div className="card-sub-header">Timeline</div>
            
            <div className="flex flex-col gap-12 max-w-md mx-auto w-full mt-4">
              <div className="input-group">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-black/30 mb-2 block">Duration</label>
                <div className="horizontal-stepper flex items-center justify-center gap-10">
                  <button onClick={() => setDuration(d => d + 1)} className="stepper-btn">+</button>
                  <motion.span 
                    key={duration}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="days-display"
                  >
                    {duration}
                  </motion.span>
                  <button onClick={() => setDuration(d => Math.max(1, d - 1))} className="stepper-btn">-</button>
                </div>
                <div className="text-black/40 font-bold text-xs uppercase tracking-widest mt-2">Nights</div>
              </div>

              <div className="input-group mt-6">
                <div className="minimal-input-wrap flex flex-col items-center gap-4">
                   <label className="text-[10px] uppercase tracking-[0.2em] font-black text-black/30">Starting date</label>
                   <input 
                    type="date" 
                    className="minimal-date-input-hidden"
                    value={startDate} 
                    id="startDateInput"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <label htmlFor="startDateInput" className="cursor-pointer underline font-black text-xl text-black">
                    {startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'SELECT DATE'}
                  </label>
                </div>
              </div>
            </div>

            <motion.div 
              className="mt-auto mb-10 opacity-30 flex flex-col items-center gap-2"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown size={24} className="text-black" />
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 3: LAST STEP */}
        <section className="planner-section sticky-stack">
          <motion.div 
            className="sequence-card"
            style={{ y: vibeY }}
          >
            <div className="card-sub-header">last step</div>
            
            <div className="flex flex-col gap-8 text-left max-w-xl mx-auto w-full mt-6">
              
              <div className="input-group">
                <label className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-2 block">Price Range</label>
                <div className="histogram-slider-container">
                  <div className="histogram-bars">
                    {HISTOGRAM_BARS.map((h, i) => {
                      const isActive = (budgetRange / 100000) * HISTOGRAM_BARS.length > i;
                      return (
                        <div 
                          key={i} 
                          className={`h-bar ${isActive ? 'active' : ''}`} 
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>
                  <input 
                    type="range" 
                    min="5000" max="100000" step="5000"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(parseInt(e.target.value))}
                    className="w-full histogram-range"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-black/40 mt-1">
                    <span>₹500</span>
                    <span>₹3000</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                  <div className="guest-row-premium">
                    <div className="flex items-center gap-3">
                       <div className="bg-blue-50 p-2 rounded-lg"><Users size={16} className="text-blue-500" /></div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-black">Adults</span>
                          <span className="text-[9px] text-black/40 uppercase">Age 25+</span>
                       </div>
                    </div>
                    <div className="controls-flex">
                       <button onClick={() => setAdults(a => Math.max(1, a - 1))}>-</button>
                       <span className="font-bold w-6 text-center">{adults}</span>
                       <button onClick={() => setAdults(a => a + 1)} className="bg-blue-500 text-white">+</button>
                    </div>
                  </div>
                  
                  <div className="guest-row-premium">
                    <div className="flex items-center gap-3">
                       <div className="bg-pink-50 p-2 rounded-lg"><User size={16} className="text-pink-400" /></div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-black">Kids</span>
                          <span className="text-[9px] text-black/40 uppercase">Age 0-17</span>
                       </div>
                    </div>
                    <div className="controls-flex">
                       <button onClick={() => setChildren(c => Math.max(0, c - 1))}>-</button>
                       <span className="font-bold w-6 text-center">{children}</span>
                       <button onClick={() => setChildren(c => c + 1)} className="bg-pink-400 text-white">+</button>
                    </div>
                  </div>
              </div>

              <div className="input-group overflow-hidden">
                <div className="pill-scroll-row no-scrollbar">
                  {TRIP_TYPES.map(type => (
                    <button 
                      key={type.id}
                      className={`pill-btn-outline ${tripType === type.id ? 'active' : ''}`}
                      style={{ '--pill-color': type.color }}
                      onClick={() => setTripType(type.id)}
                    >
                      <span>{type.label.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CIRCULAR HOLD PROGRESS */}
            <div className="hold-to-go-wrap">
              <div 
                className="hold-button-container"
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
              >
                <svg width="120" height="120" className="hold-svg-circle">
                  <circle cx="60" cy="60" r="54" className="hold-circle-bg" />
                  <circle 
                    cx="60" cy="60" r="54" 
                    className="hold-circle-progress"
                    strokeDasharray={340}
                    strokeDashoffset={340 - (holdProgress / 100) * 340}
                  />
                </svg>
                <div className="hold-inner-btn-white">
                   <ArrowRight size={32} />
                </div>
              </div>
              <span className="hold-label-white">press and hold</span>
            </div>
          </motion.div>
        </section>
        
        {/* BUFFER SPACE */}
        <div style={{ height: '100vh' }} />

      </div>
    </div>
  );
};

export default PlannerPage;
