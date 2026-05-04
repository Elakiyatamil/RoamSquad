import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import './VelvetLoader.css';

const LOADING_TEXTS = [
  "Curating your escape...",
  "Gathering local flavors...",
  "Mapping your journey...",
  "Polishing the horizon..."
];

/**
 * VelvetLoader - Global premium loading component
 * Features: Smart delay, infinity plane loop, and split-dissolve exit.
 */
const VelvetLoader = ({ isLoading, children }) => {
  const [show, setShow] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [trailPositions, setTrailPositions] = useState([]);
  const timerRef = useRef(null);
  const trailIdRef = useRef(0);

  // Smart Delay Logic (400ms) - Only show if loading takes a while
  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => setShow(true), 400);
    } else {
      clearTimeout(timerRef.current);
      setShow(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isLoading]);

  // Text cycling
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [show]);

  // Vapor trail logic - creates a sense of lingering travel
  useEffect(() => {
    if (!show) {
      setTrailPositions([]);
      return;
    }
    const interval = setInterval(() => {
      const id = trailIdRef.current++;
      // We simulate positions based on a generic wave to match the CSS animation
      const time = Date.now() / 1000;
      const x = Math.sin(time * 2) * 60;
      const y = Math.cos(time * 4) * 20;

      setTrailPositions(prev => [...prev.slice(-12), { id, x, y }]);
    }, 120);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            className="velvet-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              clipPath: 'inset(0 50% 0 50%)',
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            <div className="velvet-loader-content">
              {/* Breathing Logo */}
              <img src="/logo.png" alt="ROAMG" className="velvet-logo-pulse" />

              {/* Wanderlust Loader */}
              <div className="paper-plane-container">
                {/* Simulated Vapor Trails behind the plane */}
                {trailPositions.map((pos, idx) => (
                  <motion.div 
                    key={pos.id} 
                    className="vapor-trail" 
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    style={{ 
                      position: 'absolute',
                      left: `calc(50% + ${pos.x}px)`, 
                      top: `calc(50% + ${pos.y}px)`,
                      background: 'white',
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="velvet-loader-text"
                >
                  {LOADING_TEXTS[textIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default VelvetLoader;
