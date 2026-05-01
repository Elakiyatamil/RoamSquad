import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { createSignal, globalSignals } from '../../utils/signals';
import './RoamgHero.css';

const COMPANION_OPTIONS = [
  { id: 'couple', label: 'COUPLE' },
  { id: 'solo', label: 'SOLO' },
  { id: 'family', label: 'FAMILY' },
  { id: 'friends', label: 'FRIENDS' },
  { id: 'strangers', label: 'STRANGERS' },
];

const ITEM_ANGLE = 40; // Increased angle to prevent overlap

const RoamgHero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = createSignal(true);
  const [activeLink, setActiveLink] = createSignal(location.pathname);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Dial State
  const [focusedIndex, setFocusedIndex] = useState(2); // Start at 'FAMILY'
  const dialRotation = useMotionValue(0);
  const smoothRotation = useSpring(dialRotation, { damping: 25, stiffness: 100 });
  
  const videoRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoReady(true);
    videoRef.current?.play().catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted()) {
      videoRef.current.muted = false;
      videoRef.current.volume = 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, setIsMuted]);

  // Dial Interaction
  const updateFocus = (rot) => {
    const nearestIndex = Math.round(rot / ITEM_ANGLE);
    let newFocus = 2 - nearestIndex;
    while (newFocus < 0) newFocus += COMPANION_OPTIONS.length;
    while (newFocus >= COMPANION_OPTIONS.length) newFocus -= COMPANION_OPTIONS.length;
    setFocusedIndex(newFocus);
  };

  const handleDialDrag = (e, info) => {
    if (isSelecting) return;
    const sensitivity = 0.5;
    const newRot = dialRotation.get() + info.delta.x * sensitivity;
    dialRotation.set(newRot);
    updateFocus(newRot);
  };

  const handleDialDragEnd = (e, info) => {
    if (isSelecting) return;
    const currentRot = dialRotation.get();
    const nearestIndex = Math.round(currentRot / ITEM_ANGLE);
    const snapRot = nearestIndex * ITEM_ANGLE;
    dialRotation.set(snapRot);
    updateFocus(snapRot);
  };

  const handleSnap = (index) => {
    if (isSelecting) return;
    const targetRot = (2 - index) * ITEM_ANGLE;
    dialRotation.set(targetRot);
    setFocusedIndex(index);
  };

  const onSelectCompanion = (label) => {
    setIsSelecting(true);
    globalSignals.setCompanionChoice(label.toUpperCase());
    setTimeout(() => navigate('/planner'), 800); // 800ms for zoom-in animation
  };

  return (
    <section className={`rh-wrapper ${isSelecting ? 'rh-wrapper--zooming' : ''}`}>
      
      {/* ══════════════════════════════════
          CINEMATIC PANEL
      ══════════════════════════════════ */}
      <div className="rh-video-panel">
        <video
          ref={videoRef}
          className={`rh-video ${isVideoReady ? 'rh-video--ready' : ''}`}
          src="/drone_shots.mp4"
          autoPlay muted loop playsInline preload="auto"
          onCanPlay={handleVideoCanPlay}
        />
        <div className="rh-master-overlay" />

        <header className={`rh-nav-master ${scrolled ? 'rh-nav--scrolled' : ''}`}>
          <div className="rh-nav-inner">
            <Link to="/" className="rh-logo-master" onClick={() => setActiveLink('/')}>
              <img src="/assets/roamg-logo.png" alt="Roamg" className="rh-logo-img" />
            </Link>
            <nav className="rh-nav-links">
              {['Discover', 'Planner', 'Packages', 'Events', 'Wishlist'].map((label) => (
                <Link key={label} to={`/${label.toLowerCase()}`} className="rh-nav-link" onClick={() => setActiveLink(`/${label.toLowerCase()}`)}>
                  {label}
                  <span className="rh-nav-underline" />
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="rh-hero-content rh-hero-content--journal">
          <motion.h1 
            className="rh-headline-journal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            PLAN YOUR <span className="rh-journal-note">
              <span className="rh-marker-bg">
                <svg viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M5,15 C40,10 80,18 120,12 C160,6 195,15 195,15" className="rh-scribble-path" />
                </svg>
              </span>
              HOLIDAY
            </span>
            <br />
            IN <span className="rh-journal-note">
              <span className="rh-marker-bg">
                <svg viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path d="M5,30 C5,10 45,5 75,15 C95,25 95,45 75,55 C45,65 5,50 5,30 Z" className="rh-scribble-path" />
                </svg>
              </span>
              YOUR
            </span> WAY
          </motion.h1>
        </div>

        <div className="rh-audio-container">
          {!isMuted() && (
            <div className="rh-audio-ripples"><div className="rh-ripple" /><div className="rh-ripple" /></div>
          )}
          <button className={`rh-audio-btn-burgundy ${!isMuted() ? 'rh-audio--on' : ''}`} onClick={toggleMute}>
            {isMuted() ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="rh-svg-cut-wrap">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="rh-svg-cut">
            <path d="M0,0 Q720,100 1440,0 V100 H0 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════
          TYPOGRAPHIC CAROUSEL
      ══════════════════════════════════ */}
      <div className="rh-dial-polish">
        
        <div className="rh-dial-header">
          <h2 className="rh-dial-heading-top">Who’s ready with you?</h2>
        </div>

        <div className="rh-dial-carousel-wrap">
          <motion.div 
            className="rh-dial-gesture-area"
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            onDrag={handleDialDrag}
            onDragEnd={handleDialDragEnd}
          >
            <div className="rh-dial-track">
              {COMPANION_OPTIONS.map((opt, i) => {
                const angleOffset = (i - 2) * ITEM_ANGLE;
                const relativeRot = useTransform(smoothRotation, r => r + angleOffset);
                
                // Dial Path Math
                const x = useTransform(relativeRot, a => 500 + Math.sin(a * Math.PI / 180) * 450);
                const y = useTransform(relativeRot, a => 200 - Math.cos(a * Math.PI / 180) * 150);
                const op = useTransform(relativeRot, a => Math.max(0.1, 1 - Math.abs(a) / 90));
                const scale = useTransform(relativeRot, a => 1 - Math.abs(a) / 200);

                const isFocused = focusedIndex === i;

                return (
                  <motion.div
                    key={opt.id}
                    className={`rh-dial-item ${isFocused ? 'rh-focused-item' : ''}`}
                    style={{ left: x, top: y, opacity: op, scale }}
                    onClick={() => isFocused ? onSelectCompanion(opt.label) : handleSnap(i)}
                  >
                    <motion.span 
                      className="rh-item-text"
                      animate={isFocused && isSelecting ? { scale: 3.5, opacity: 0 } : {}}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      {opt.label}
                    </motion.span>
                    {isFocused && (
                      <motion.div 
                        className="rh-item-glow" 
                        animate={isSelecting ? { scale: 4, opacity: 0 } : {}}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="rh-dial-hint-polish">Slide to discover • Tap center to choose</div>
      </div>

    </section>
  );
};

export default RoamgHero;
