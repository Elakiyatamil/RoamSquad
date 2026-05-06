import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import './VelvetSplash.css';

const SPLASH_TEXTS = [
  "Curating your escape...",
  "Gathering local flavors...",
  "Mapping your journey...",
  "Ready to explore?"
];

/**
 * VelvetSplash - The new premium entry experience.
 */
export default function Loader({ onComplete }) {
  const [textIndex, setTextIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [trailPositions, setTrailPositions] = useState([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    // Cycle text faster for splash
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % SPLASH_TEXTS.length);
    }, 900);

    // Sync trails with a wider infinity motion
    const trailInterval = setInterval(() => {
      const id = trailIdRef.current++;
      const time = Date.now() / 1000;
      const x = Math.sin(time * 2) * 80; // Wider for splash
      const y = Math.cos(time * 4) * 30;

      setTrailPositions(prev => [...prev.slice(-15), { id, x, y }]);
    }, 100);

    // Timing
    const fadeTimer = setTimeout(() => setFadeOut(true), 3200);
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearInterval(textInterval);
      clearInterval(trailInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`velvet-splash-container ${fadeOut ? 'velvet-splash-exit' : ''}`}>
      <div className="velvet-loader-content">
        {/* Breathing Logo */}
        <motion.img 
          src="/logo.png" 
          alt="ROAMG" 
          className="velvet-logo-pulse"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Wanderlust Loader */}
        <div className="paper-plane-container">
          {trailPositions.map((pos) => (
            <motion.div 
              key={pos.id} 
              className="vapor-trail" 
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              style={{ 
                position: 'absolute',
                left: `calc(50% + ${pos.x}px)`, 
                top: `calc(50% + ${pos.y}px)`,
                background: '#800020', // Burgundy trails for splash
                width: 4, height: 4, borderRadius: '50%'
              }} 
            />
          ))}
          <div className="paper-plane-wrapper">
            <Send className="paper-plane-icon" fill="currentColor" />
          </div>
        </div>

        {/* Progressive Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="velvet-loader-text"
          >
            {SPLASH_TEXTS[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="velvet-splash-progress">
        <motion.div 
          className="velvet-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3.2, ease: "linear" }}
        />
      </div>
    </div>
  );
}
