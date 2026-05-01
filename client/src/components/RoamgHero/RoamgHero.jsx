import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll } from 'framer-motion';
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
    setTimeout(() => navigate('/planner'), 800);
  };

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  return (
    <motion.section 
      className={`rh-wrapper ${isSelecting ? 'rh-wrapper--zooming' : ''}`}
      style={{ opacity: heroOpacity, scale: heroScale }}
    >
      
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
              <img src="/logo.png" alt="Roamg" className="rh-logo-img" style={{ height: '40px', width: 'auto' }} />
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

        <div className="rh-scroll-indicator">
          <span className="rh-scroll-text">Scroll to explore</span>
          <motion.div 
            className="rh-scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </motion.div>
        </div>

        <div className="rh-svg-cut-wrap">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="rh-svg-cut">
            <path d="M0,0 Q720,100 1440,0 V100 H0 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

    </motion.section>
  );
};

export default RoamgHero;
