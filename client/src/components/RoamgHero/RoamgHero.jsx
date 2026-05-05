import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll } from 'framer-motion';
import { Volume2, VolumeX, Menu, X, Search } from 'lucide-react';
import { createSignal, globalSignals } from '../../utils/signals';
import useAudioStore from '../../store/useAudioStore';
import useAuthStore from '../../store/authStore';
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
  const { isMuted, toggleMute } = useAudioStore();
  const { isAuthenticated, user } = useAuthStore();
  const [activeLink, setActiveLink] = createSignal(location.pathname);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Sync muted property imperatively — browsers block autoplay on unmuted videos,
  // so the HTML muted attribute must stay true. We toggle audio via the ref instead.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        // Try to unmute; browsers may still block it without user gesture
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
      }
    }
  }, [isMuted]);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoReady(true);
    videoRef.current?.play().catch(() => {});
  }, []);

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
          autoPlay 
          muted
          loop 
          playsInline 
          preload="auto"
          onCanPlay={handleVideoCanPlay}
        />
        <div className="rh-master-overlay" />


        <div className="rh-centered-content">
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
                <svg viewBox="0 0 160 60" preserveAspectRatio="none">
                  <path d="M5,30 C5,10 75,5 135,15 C155,25 155,45 135,55 C75,65 5,50 5,30 Z" className="rh-scribble-path" />
                </svg>
              </span>
              YOUR WAY
            </span>
          </motion.h1>

          <div className="rh-hero-search-wrapper">
            <div 
              className="rh-hero-search-bar" 
              onClick={() => navigate('/planner')}
              style={{ cursor: 'pointer' }}
            >
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                className="rh-search-input"
                style={{ pointerEvents: 'none' }}
                readOnly
              />
              <button className="rh-search-submit-btn">
                <Search size={18} strokeWidth={3} />
              </button>
            </div>
            <p className="rh-search-subtext">DISCOVER YOUR NEXT ADVENTURE</p>
          </div>
        </div>

        <div className="rh-audio-container">
          <button 
            className="rh-audio-btn-glass" 
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <AnimatePresence mode="wait">
              {isMuted ? (
                <motion.div key="mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <VolumeX size={18} color="white" />
                </motion.div>
              ) : (
                <motion.div key="unmute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Volume2 size={18} color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="rh-svg-cut-wrap">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="rh-svg-cut">
            <path d="M0,0 Q720,100 1440,0 V100 H0 Z" fill="#F5F0EB" />
          </svg>
        </div>
      </div>

    </motion.section>
  );
};

export default RoamgHero;
