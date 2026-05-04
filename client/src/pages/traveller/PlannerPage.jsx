import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import FloatingNav from '../../components/FloatingNav/FloatingNav';
import OmniSearch, { EmptyState } from '../../components/OmniSearch/OmniSearch';
import useAuthStore from '../../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const TRIP_TYPES = [
  { id: 'solo',      label: 'Solo',      icon: <User size={14} />,     color: '#FF4D4D' },
  { id: 'couple',    label: 'Couple',    icon: <Heart size={14} />,    color: '#FF79C6' },
  { id: 'family',    label: 'Family',    icon: <Users size={14} />,    color: '#50FA7B' },
  { id: 'friends',   label: 'Friends',   icon: <Users size={14} />,    color: '#8BE9FD' },
  { id: 'strangers', label: 'Strangers', icon: <Sparkles size={14} />, color: '#BD93F9' }
];

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// Thread colors per card index (cycles)
const CARD_THREAD_COLORS = ['#8B1A2F','#E8A838','#0D5C63','#8B1A2F','#E8A838'];

// Blue/Green Horizon Images
const HORIZON_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Ocean blue
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', // Forest green
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', // Valley green
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', // Mountain blue
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', // Peak green
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80', // Coastal blue
];

// ── HorizonBelt — horizontal drifting image belt ──────────────────────
const HorizonBelt = ({ isHolding, holdProgress }) => {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const rafRef   = useRef(null);
  
  // Physics constants
  const DRIFT_SPD = 0.5;
  const WARP_SPD  = 12.0;
  
  useEffect(() => {
    const animate = () => {
      // Progressive momentum: increase speed as holdProgress grows
      const holdFactor = holdProgress / 100;
      const speed = DRIFT_SPD + (WARP_SPD - DRIFT_SPD) * Math.pow(holdFactor, 2.5);
      
      posRef.current += speed;
      if (posRef.current >= 4800) posRef.current = 0; // Loop based on 6 images * 800px
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
        // Apply directional blur based on speed
        const blur = Math.max(0, (speed - 2) * 0.8);
        trackRef.current.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [holdProgress]);

  return (
    <div className="horizon-belt-container">
      <div ref={trackRef} className="horizon-track">
        {[...HORIZON_IMAGES, ...HORIZON_IMAGES].map((src, i) => (
          <div key={i} className="horizon-img-wrap">
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── RoamgLoader ──────────────────────────────────────────────────────
const RoamgLoader = () => (
  <div className="roamg-loader-overlay">
    <motion.div 
      className="loader-logo"
      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: '24px', letterSpacing: '0.2em', color: '#800020' }}>
        ROAMG
      </span>
    </motion.div>
    <div className="loader-dots">
      {[0, 1, 2].map(i => (
        <motion.div 
          key={i}
          className="loader-dot"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
        />
      ))}
    </div>
  </div>
);

// ── VelvetCalendar ───────────────────────────────────────────────────
const BURG = '#800020';
const DAYS_HDR = ['SU','MO','TU','WE','TH','FR','SA'];

const VelvetCalendar = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const today = new Date(); today.setHours(0,0,0,0);

  // Default view to selected month or current month
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const selected = value ? new Date(value + 'T00:00:00') : null;

  // Build calendar grid
  const buildGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  };

  const handleSelect = (date) => {
    if (date < today) return; // no past dates
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    onChange(iso);
    setBounce(true);
    setTimeout(() => setBounce(false), 500);
    setTimeout(() => setOpen(false), 220);
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1));

  const displayLabel = selected
    ? selected.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Select your start date';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const grid = buildGrid();

  return (
    <div style={{ textAlign:'center', marginTop:'28px', position:'relative' }}>

      {/* ── Capsule trigger ── */}
      <motion.div
        onClick={() => setOpen(o => !o)}
        animate={bounce ? { scale:[1,1.05,0.97,1] } : { scale:1 }}
        transition={{ duration: 0.4, ease:'easeInOut' }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 28px',
          borderRadius: '100px',
          border: `1.5px solid ${open ? BURG : 'rgba(0,0,0,0.10)'}`,
          background: open ? `rgba(128,0,32,0.03)` : '#FFFFFF',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
          boxShadow: open ? `0 0 0 3px rgba(128,0,32,0.08)` : '0 1px 4px rgba(0,0,0,0.06)',
          userSelect: 'none',
          minWidth: '220px',
        }}
        onMouseEnter={e => !open && (e.currentTarget.style.borderColor = BURG)}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)')}
      >
        {/* Calendar icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selected ? BURG : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{
          fontFamily: selected ? '"DM Serif Display", serif' : 'Inter, sans-serif',
          fontSize: selected ? '16px' : '14px',
          color: selected ? '#1A1A1A' : '#9CA3AF',
          letterSpacing: selected ? '-0.01em' : '0.01em',
          fontWeight: selected ? 400 : 400,
        }}>
          {displayLabel}
        </span>
        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </motion.div>

      {/* ── Floating calendar popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:16, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:12, scale:0.96 }}
            transition={{ type:'spring', stiffness:340, damping:28 }}
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              ...(isMobile
                ? { bottom:0, left:0, right:0, borderRadius:'20px 20px 0 0', zIndex:1000 }
                : { top:'calc(100% + 12px)', left:'50%', transform:'translateX(-50%)', borderRadius:'20px', width:'320px', zIndex:200 }
              ),
              background: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
              padding: '20px',
            }}
          >
            {/* Mobile drag handle */}
            {isMobile && <div style={{width:40,height:4,borderRadius:2,background:'rgba(0,0,0,0.12)',margin:'0 auto 16px'}}/>}

            {/* Month navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <button onClick={prevMonth} style={navBtnStyle}>‹</button>
              <span style={{ fontFamily:'"DM Serif Display",serif', fontSize:'17px', color:'#1A1A1A' }}>
                {viewDate.toLocaleDateString('en-US',{month:'long', year:'numeric'})}
              </span>
              <button onClick={nextMonth} style={navBtnStyle}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'8px' }}>
              {DAYS_HDR.map((d,i) => (
                <div key={d} style={{
                  textAlign:'center',
                  fontFamily:'Inter,sans-serif',
                  fontSize:'10px',
                  fontWeight:600,
                  letterSpacing:'0.08em',
                  color: (i===0||i===6) ? '#D1A0A8' : '#9CA3AF',
                  paddingBottom:'4px',
                }}>{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
              {grid.map((date, i) => {
                if (!date) return <div key={`e-${i}`}/>;
                const isToday   = date.getTime() === today.getTime();
                const isSel     = selected && date.getTime() === selected.getTime();
                const isPast    = date < today;
                const isWeekend = date.getDay()===0 || date.getDay()===6;
                return (
                  <DateCell
                    key={i}
                    date={date}
                    isToday={isToday}
                    isSel={isSel}
                    isPast={isPast}
                    isWeekend={isWeekend}
                    onSelect={handleSelect}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:999 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Nav button style (extracted to avoid duplication)
const navBtnStyle = {
  width:'32px', height:'32px', borderRadius:'50%', border:'none',
  background:'rgba(0,0,0,0.04)', fontSize:'20px', lineHeight:'1',
  cursor:'pointer', color:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center',
};

// Individual date cell — separate component to isolate hover state
const DateCell = ({ date, isToday, isSel, isPast, isWeekend, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => !isPast && onSelect(date)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
        cursor: isPast ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: isSel ? 600 : 400,
        color: isSel ? '#FFFFFF'
          : isPast ? 'rgba(0,0,0,0.2)'
          : isWeekend ? '#C97C8A'
          : '#1A1A1A',
        background: isSel ? BURG
          : isToday ? 'transparent'
          : hovered && !isPast ? 'rgba(128,0,32,0.07)'
          : 'transparent',
        border: isToday && !isSel ? `1.5px solid ${BURG}` : '1.5px solid transparent',
        transition: 'background 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      {date.getDate()}
    </div>
  );
};

// ── BudgetSlider ─────────────────────────────────────────────────────
const BudgetSlider = ({ value, onChange }) => {
  const MIN = 500, MAX = 300000;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;
  return (
    <div className="budget-slider-wrap">
      <p className="budget-slider-label">BUDGET PER PERSON</p>
      <div className="budget-track-container">
        <div className="budget-track-filled" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={500}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="budget-range-input"
        />
      </div>
      <div className="budget-value-display">
        <span className="budget-amount">₹{value.toLocaleString('en-IN')}</span>
        <span className="budget-per">per person</span>
      </div>
      <div className="budget-minmax">
        <span>₹500</span>
        <span>₹3,00,000</span>
      </div>
    </div>
  );
};

// ── StepDots ─────────────────────────────────────────────────────────
const StepDots = ({ activeStep }) => (
  <div className="step-dots">
    {[1,2,3].map(s => (
      <div key={s} className={`step-dot ${activeStep === s ? 'active' : ''}`} />
    ))}
  </div>
);

// ── LivingDestinationCard ───────────────────────────────────────────
const LivingDestinationCard = ({ dest, isSelected, idx, onSelect }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = isHovered ? 1.0 : 0.5;
      
      if (isHovered) {
        videoRef.current.muted = false;
        videoRef.current.volume = 0;
        let vol = 0;
        const interval = setInterval(() => {
          vol = Math.min(vol + 0.1, 1);
          if (videoRef.current) videoRef.current.volume = vol;
          if (vol >= 1) clearInterval(interval);
        }, 20); // 200ms fade-in total
        return () => clearInterval(interval);
      } else {
        videoRef.current.muted = true;
      }
    }
  }, [isHovered]);

  return (
    <div className="living-dest-container">
      <motion.div
        className={`destination-card video-variant ${isSelected ? 'active' : ''}`}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ delay: idx * 0.05 }}
      >
        <video
          ref={videoRef}
          src={dest.videoUrl}
          poster={dest.displayImage}
          autoPlay
          muted
          loop
          playsInline
          className="dest-card-video"
        />
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="selected-indicator"
          >
            <ArrowRight size={14} color="white" />
          </motion.div>
        )}
      </motion.div>

      {/* Typography moved below the card */}
      <div className="living-dest-meta">
        <p className="dest-meta-location">{dest.location || 'EDINBURGH, UK'}</p>
        <h3 className="dest-meta-name">{dest.name}</h3>
      </div>
    </div>
  );
};

// ── Main PlannerPage ─────────────────────────────────────────────────
const PlannerPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const heroY        = useTransform(scrollYProgress, [0, 0.33],  ["0%", "-50%"]);
  const timelineY    = useTransform(scrollYProgress, [0.05, 0.4], ["100%", "5%"]);
  const vibeY        = useTransform(scrollYProgress, [0.4, 0.75], ["100%", "0%"]);
  const headerScale  = useTransform(scrollYProgress, [0, 0.15],   [1, 0.7]);
  const headerOpacity= useTransform(scrollYProgress, [0, 0.1],    [1, 0]);
  const carouselOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const { isAuthenticated, user } = useAuthStore();

  // STATE
  const [loading, setLoading]                   = useState(true);
  const [destinations, setDestinations]         = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showResults, setShowResults]           = useState(false);
  const [activeStep, setActiveStep]             = useState(1);

  // USER CHOICES
  const [duration,    setDuration]    = useState(3);
  const [startDate,   setStartDate]   = useState('');
  const [adults,      setAdults]      = useState(2);
  const [children,    setChildren]    = useState(0);
  const [budgetRange, setBudgetRange] = useState(25000);
  const [tripType,    setTripType]    = useState('couple');

  // HOLD LOGIC
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding,    setIsHolding]    = useState(false);
  const [showLoader,   setShowLoader]   = useState(false);
  const [portalHover,  setPortalHover]  = useState(false);
  const holdTimer = useRef(null);
  const vibTimer  = useRef(null);

  // DURATION GLOW (green flash on increment)
  const [durationGlow, setDurationGlow] = useState(false);
  const handleIncrement = () => {
    setDuration(d => d + 1);
    setDurationGlow(true);
    setTimeout(() => setDurationGlow(false), 500);
  };

  // SMART LOGO — scroll-to-top or navigate home
  const logoTapRef = useRef({ count: 0, timer: null });
  const handleLogoClick = () => {
    const tap = logoTapRef.current;
    tap.count += 1;
    clearTimeout(tap.timer);
    tap.timer = setTimeout(() => {
      if (tap.count >= 2) {
        window.location.href = '/';
      } else if (containerRef.current?.scrollTop > 50) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = '/';
      }
      tap.count = 0;
    }, 300);
  };

  const handleSearchSelect = (dest) => {
    setSelectedDestination(dest);
    // Smooth scroll to Step 2
    const step2El = document.querySelector('[data-step="2"]');
    if (step2El && containerRef.current) {
      containerRef.current.scrollTo({
        top: step2El.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Step 2 complete signal
  const step2Done = duration > 0 && !!startDate;

  // Intersection observer — section entrance + active step
  useEffect(() => {
    const sections = document.querySelectorAll('.planner-section');
    const visObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.15 }
    );
    sections.forEach(s => visObs.observe(s));

    const stepMap = [
      { el: document.querySelector('[data-step="1"]'), step: 1 },
      { el: document.querySelector('[data-step="2"]'), step: 2 },
      { el: document.querySelector('[data-step="3"]'), step: 3 },
    ];
    const stepObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const step = Number(e.target.dataset.step);
          if (step) setActiveStep(step);
        }
      }),
      { threshold: 0.5, root: containerRef.current }
    );
    stepMap.forEach(({ el }) => el && stepObs.observe(el));

    return () => { visObs.disconnect(); stepObs.disconnect(); };
  }, []);

  // FETCH DATA
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/destinations`);
        if (response.data.success) {
          const mapped = response.data.data.map(d => ({
            ...d,
            displayImage: d.coverImage || d.images?.[0] || `https://loremflickr.com/800/1200/travel,${d.name.replace(/\s+/g, '')}`,
            videoUrl: `/destinationvideo/${d.name.toLowerCase()}.mp4`
          }));
          setDestinations(mapped);
          setFilteredDestinations(mapped);
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
    setIsHolding(true);
    // Haptic vibration — escalating pattern on mobile
    if (navigator.vibrate) {
      let v = 0;
      vibTimer.current = setInterval(() => {
        v = Math.min(v + 10, 100);
        navigator.vibrate(v);
      }, 200);
    }
    holdTimer.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimer.current);
          clearInterval(vibTimer.current);
          if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
          setShowLoader(true);
          // Handoff data & transition
          setTimeout(() => setShowResults(true), 2000);
          return 100;
        }
        // Pressure-sensitive acceleration: speed up as we go
        const step = 0.8 + (prev / 100) * 1.5;
        return prev + step;
      });
    }, 20);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    clearInterval(holdTimer.current);
    clearInterval(vibTimer.current);
    if (navigator.vibrate) navigator.vibrate(0);
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

      {/* ── Animated thread background SVG ── */}
      <svg
        aria-hidden="true"
        style={{position:'fixed',inset:0,width:'100%',height:'100%',
                pointerEvents:'none',zIndex:0,overflow:'hidden'}}
      >
        <path d="M-200,200 Q200,100 600,200 T1400,200 T2200,200"
          fill="none" stroke="#8B1A2F" strokeWidth="1.5" opacity="0.35">
          <animateTransform attributeName="transform" type="translate"
            from="0,0" to="-800,0" dur="18s" repeatCount="indefinite"/>
        </path>
        <path d="M-200,400 Q300,300 700,420 T1500,380 T2300,400"
          fill="none" stroke="#E8A838" strokeWidth="1.2" opacity="0.28">
          <animateTransform attributeName="transform" type="translate"
            from="0,0" to="-800,0" dur="24s" repeatCount="indefinite"/>
        </path>
        <path d="M-200,600 Q250,500 650,620 T1450,580 T2250,600"
          fill="none" stroke="#0D5C63" strokeWidth="1.2" opacity="0.25">
          <animateTransform attributeName="transform" type="translate"
            from="0,0" to="-800,0" dur="30s" repeatCount="indefinite"/>
        </path>
        <path d="M-200,800 Q350,700 750,820 T1550,780 T2350,800"
          fill="none" stroke="#8B1A2F" strokeWidth="0.8" opacity="0.18">
          <animateTransform attributeName="transform" type="translate"
            from="0,0" to="-800,0" dur="22s" repeatCount="indefinite"/>
        </path>
      </svg>

      {/* ── Navbar ── */}
      <FloatingNav isAuthenticated={isAuthenticated} user={user} />


      {/* ── Scrollable container ── */}
      <div className="planner-main-scrollable no-scrollbar" ref={containerRef}>

        {/* ── STEP 1: Destination ── */}
        <motion.section
          className="planner-section sticky-stack"
          data-step="1"
          style={{ y: heroY }}
        >
          <motion.div
            className="section-header-text hero-only"
            style={{ scale: headerScale, opacity: headerOpacity }}
          >
            <h1 className="glitch-text">Where to next?</h1>
            <p className="scroll-hint-label" style={{marginTop:'16px'}}>
              Select a destination and scroll down
            </p>
          </motion.div>

          {/* Omni Search Bar */}
          <motion.div style={{ opacity: carouselOpacity }}>
            <OmniSearch 
              destinations={destinations} 
              onFilter={setFilteredDestinations}
              onSelect={handleSearchSelect}
            />
          </motion.div>

          <motion.div
            className="destination-carousel no-scrollbar"
            style={{ opacity: carouselOpacity }}
          >
            {loading ? (
              <div className="planner-loading-text">Summoning destinations…</div>
            ) : filteredDestinations.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredDestinations.map((dest, idx) => {
                  const isSelected = selectedDestination?.id === dest.id;
                  const threadColor = CARD_THREAD_COLORS[idx % CARD_THREAD_COLORS.length];
                  const driftDuration = 4 + (idx % 4);
                  return (
                    <motion.div 
                      key={dest.id} 
                      className="destination-card-wrapper"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      {/* Per-card accent thread */}
                      <svg
                        aria-hidden="true"
                        style={{
                          position:'absolute',
                          top:'-10%', left:'-10%',
                          width:'120%', height:'120%',
                          pointerEvents:'none', zIndex:-1,
                          animation:`threadDrift ${driftDuration}s ease-in-out infinite`
                        }}
                      >
                        <path
                          d={idx % 2 === 0
                            ? "M10,0 Q60,40 110,20 T200,60"
                            : "M200,100 Q150,60 100,80 T0,40"}
                          fill="none"
                          stroke={threadColor}
                          strokeWidth="1.5"
                          opacity="0.4"
                        />
                      </svg>

                      <LivingDestinationCard 
                        dest={dest} 
                        isSelected={isSelected} 
                        idx={idx}
                        onSelect={() => setSelectedDestination(dest)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <EmptyState />
            )}
          </motion.div>

          <AnimatePresence>
            {selectedDestination && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="scroll-down-hint"
              >
                <span className="scroll-hint-label">scroll down to continue</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronDown size={20} color="#9CA3AF" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── STEP 2: Timeline ── */}
        <section className="planner-section sticky-stack" data-step="2">
          <motion.div className="sequence-card" style={{ y: timelineY }}>
            <div className="card-sub-header">Timeline</div>

            <div className="step-content-block">
              {/* Duration stepper */}
              <div className="input-group">
                <label className="input-label">Duration</label>
                <div className="horizontal-stepper">
                  {/* MINUS on left */}
                  <button
                    onClick={() => setDuration(d => Math.max(1, d - 1))}
                    className="stepper-btn"
                    aria-label="Decrease days"
                  >−</button>

                  <div className="days-counter-wrap">
                    <motion.span
                      key={duration}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={durationGlow
                        ? { scale: 1, opacity: 1, textShadow: '0 0 24px rgba(34,197,94,0.7)', color: '#16a34a' }
                        : { scale: 1, opacity: 1, textShadow: 'none', color: '#1A1A1A' }
                      }
                      transition={{ duration: 0.4 }}
                      className="days-display"
                    >
                      {duration}
                    </motion.span>
                    <span className="days-label">Days</span>
                  </div>

                  {/* PLUS on right */}
                  <button
                    onClick={handleIncrement}
                    className="stepper-btn stepper-btn-plus"
                    aria-label="Increase days"
                  >+</button>
                </div>
              </div>

              {/* Premium Velvet Calendar */}
              <div className="input-group" style={{marginTop:'0'}}>
                <VelvetCalendar value={startDate} onChange={setStartDate} />
              </div>
            </div>

            {/* NEXT button — appears when step 2 is complete */}
            <AnimatePresence>
              {step2Done ? (
                <motion.button
                  className="next-step-btn"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  Continue
                  <ArrowRight size={16} style={{ marginLeft: 8 }} />
                </motion.button>
              ) : (
                <motion.div
                  className="scroll-chevron"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ChevronDown size={24} color="rgba(0,0,0,0.3)" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* ── STEP 3: Last Step ── */}
        <section className="planner-section sticky-stack" data-step="3">
          <motion.div className="sequence-card" style={{ y: vibeY }}>
            <div className="card-sub-header step-last">Last Step</div>

            <div className="step-content-block step3-block">

              {/* Traveller rows — number roll animation */}
              <div className="traveller-rows">

                {/* Adults */}
                <div className="guest-row-premium">
                  <div className="guest-info">
                    <div className="guest-icon-wrap" style={{background:'#FAF5F5'}}>
                      <Users size={16} color="#800020" />
                    </div>
                    <span className="guest-name">Adults</span>
                  </div>
                  <div className="controls-flex">
                    {/* MINUS left — neutral grey */}
                    <button className="counter-btn counter-btn-minus"
                      onClick={() => setAdults(a => Math.max(1, a - 1))}>−</button>

                    <div className="roll-number-wrap">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={`a-${adults}`}
                          className="roll-number"
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >{adults}</motion.span>
                      </AnimatePresence>
                    </div>

                    {/* PLUS right — burgundy */}
                    <button className="counter-btn counter-btn-plus"
                      onClick={() => setAdults(a => a + 1)}>+</button>
                  </div>
                </div>

                {/* Kids */}
                <div className="guest-row-premium">
                  <div className="guest-info">
                    <div className="guest-icon-wrap" style={{background:'#FAF5F5'}}>
                      <User size={16} color="#800020" />
                    </div>
                    <div className="guest-labels">
                      <span className="guest-name">Kids</span>
                      <span className="guest-sub">Below 16</span>
                    </div>
                  </div>
                  <div className="controls-flex">
                    <button className="counter-btn counter-btn-minus"
                      onClick={() => setChildren(c => Math.max(0, c - 1))}>−</button>

                    <div className="roll-number-wrap">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={`c-${children}`}
                          className="roll-number"
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        >{children}</motion.span>
                      </AnimatePresence>
                    </div>

                    <button className="counter-btn counter-btn-plus"
                      onClick={() => setChildren(c => c + 1)}>+</button>
                  </div>
                </div>
              </div>

              {/* Group type pills */}
              <div className="pill-scroll-row">
                {TRIP_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`pill-btn-outline ${tripType === type.id ? 'active' : ''}`}
                    onClick={() => setTripType(type.id)}
                  >
                    {type.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Dynamic Horizon Portal ── */}
            <div className="portal-wrap horizon-theme">
              {/* Blue/Green horizontal image belt */}
              <HorizonBelt isHolding={isHolding} holdProgress={holdProgress} />
              
              {/* Progress ring + white circle */}
              <div className="portal-circle-wrap">
                <svg width="184" height="184"
                  style={{position:'absolute',top:'-12px',left:'-12px',transform:'rotate(-90deg)',pointerEvents:'none',zIndex:12}}>
                  <circle cx="92" cy="92" r="84" fill="none"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                  <circle cx="92" cy="92" r="84" fill="none"
                    stroke="#FFFFFF" strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 - (holdProgress / 100) * 2 * Math.PI * 84}
                    style={{transition:'stroke-dashoffset 0.05s linear'}}/>
                </svg>

                <motion.div
                  className="portal-circle"
                  animate={{ 
                    scale: isHolding ? 0.95 : portalHover ? 1.05 : 1,
                    boxShadow: portalHover 
                      ? '0 20px 80px rgba(0,0,0,0.3)' 
                      : '0 12px 48px rgba(0,0,0,0.15)'
                  }}
                  transition={{ type:'spring', stiffness:300, damping:22 }}
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={e => { handleHoldEnd(); setPortalHover(false); }}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  onMouseEnter={() => setPortalHover(true)}
                >
                  <motion.div 
                    className="portal-fill"
                    style={{ opacity: holdProgress > 0 ? 1 : 0 }}
                    animate={{ scale: (holdProgress / 100 * 2.2) }}
                  />
                  <div className="portal-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke={holdProgress > 50 ? 'white' : '#1A1A1A'}
                      strokeWidth="1.8" strokeLinecap="round">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7 7 17 7 17 17"/>
                    </svg>
                    <span className="portal-label"
                      style={{ color: holdProgress > 50 ? 'white' : '#1A1A1A' }}>
                      {isHolding ? 'HOLD…' : 'HOLD TO ENTER'}<br/>EXPERIENCE
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Kinetic text */}
            <div className="portal-text-block">
              <h2 className="portal-title">PLAN YOUR DAYS</h2>
              <p className="portal-sub">PICK YOUR SCHEDULE / CURATE YOUR DAY</p>
            </div>
          </motion.div>
        </section>

        {/* Buffer */}
        <div style={{ height: '100vh' }} />
      </div>

      {/* Branded Loader — Fades in on 100% completion */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#FAFAFA',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RoamgLoader />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlannerPage;
