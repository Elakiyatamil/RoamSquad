import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './PageLoader.css';

const PlaneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <g transform="rotate(90 12 12)">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#ffffff" />
        <path d="M11.5 2C10.67 2 10 2.67 10 3.5V9L11.5 10L13 9V3.5C13 2.67 12.33 2 11.5 2Z" fill="#C1351A" />
    </g>
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="18" viewBox="0 0 12 16" fill="none">
    <path d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 7.10457 7.10457 8 6 8Z" fill="#C1351A"/>
  </svg>
);

export default function PageLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    document.body.style.overflow = 'hidden';
    
    // Strict Theater Split Trigger
    const exitTime = isInitialLoad ? 2800 : 800;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      if (isInitialLoad) setIsInitialLoad(false);
    }, exitTime);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  const roamWord = "ROAM".split('');
  const squadWord = "SQUAD".split('');
  
  const pins = [
      { name: 'GOA', pos: 0.25 },
      { name: 'EDINBURGH', pos: 0.45 },
      { name: 'BALI', pos: 0.65 },
      { name: 'TOKYO', pos: 0.85 }
  ];

  // Waterfall Durations (Strictly ordered)
  const planeDelay = isInitialLoad ? 1.42 : 0;
  const planeDuration = isInitialLoad ? 1.0 : 0.6;
  const stage4Delay = isInitialLoad ? 2.42 : 0.6;
  const stage4Duration = isInitialLoad ? 0.38 : 0.2;

  return (
    <AnimatePresence>
      {isLoading && (
        <div className="global-page-loader-wrapper">
          {/* Theater Curtain Splits - 0.4s Duration (2.8 - 3.2s) */}
          <motion.div 
            className="loader-curtain loader-top-half"
            initial={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div 
            className="loader-curtain loader-bottom-half"
            initial={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Quick disappear fading prior to full split opening */}
          <motion.div 
            className="loader-content-layer"
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
          >
            {/* Stage 1: Stars Warp Burst (0 - 0.4s) */}
            {isInitialLoad && (
              <div className="loader-stars-burst">
                 {[...Array(50)].map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 25 + Math.random() * 85; // vw distance
                    const x = Math.cos(angle) * dist;
                    const y = Math.sin(angle) * dist;
                    
                    return (
                        <motion.div 
                           key={i} 
                           className="burst-star" 
                           initial={{ x: 0, y: 0, opacity: 0 }}
                           animate={{ x: `${x}vw`, y: `${y}vw`, opacity: [1, 0.3] }}
                           transition={{ 
                               duration: 0.4, 
                               ease: [0.16, 1, 0.3, 1], // Warp shoot out
                               opacity: { delay: 0.4, duration: 1 + Math.random(), repeat: Infinity, repeatType: 'reverse' }
                           }}
                        />
                    );
                 })}
              </div>
            )}

            <div className="loader-center-content">
              {isInitialLoad && (
                <div className="loader-brand-cinematic">
                   <div className="loader-roam-word cinematic-word">
                      {roamWord.map((char, i) => (
                         <motion.span 
                           key={`roam-${i}`} 
                           initial={{ y: -60, rotateX: 25, scaleX: 1.04, color: '#ffffff', opacity: 0 }}
                           animate={{ y: 0, rotateX: 0, scaleX: 1, color: '#C1351A', opacity: 1 }}
                           transition={{ duration: 0.4, delay: 0.4 + (i * 0.08), ease: "easeOut" }}
                           className="roam-char"
                         >
                           {char}
                         </motion.span>
                      ))}
                   </div>
                   
                   {/* Stage 2 Signature Stroke */}
                   <motion.div 
                      className="cinematic-divider"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 120, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.12, ease: "easeInOut" }}
                   />

                   <div className="loader-squad-word cinematic-word">
                      {squadWord.map((char, i) => (
                         <motion.span 
                           key={`squad-${i}`} 
                           initial={{ y: 60, rotateX: -25, scaleX: 1.04, color: '#ffffff', opacity: 0 }}
                           animate={{ y: 0, rotateX: 0, scaleX: 1, color: '#F5F0E8', opacity: 1 }}
                           transition={{ duration: 0.4, delay: 0.4 + (i * 0.08), ease: "easeOut" }}
                           className="squad-char"
                         >
                           {char}
                         </motion.span>
                      ))}
                   </div>
                   
                   <motion.div 
                      className="cinematic-tagline"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: stage4Delay, duration: stage4Duration, ease: "easeOut" }}
                   >
                      ROAM TOGETHER · EXPLORE FOREVER
                   </motion.div>
                </div>
              )}

              {/* Stage 3: Flight Arc from center-bottom */}
              <div className="loader-arc-zone">
                 <svg viewBox="0 0 800 250" className="cinematic-flight-svg">
                    <motion.path 
                       d="M 400 0 Q 550 200 900 50" 
                       fill="transparent" 
                       stroke="#C1351A" 
                       strokeWidth="2.5" 
                       strokeDasharray="6,8"
                       strokeLinecap="round"
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.7 }}
                       transition={{ duration: planeDuration, delay: planeDelay, ease: "easeInOut" }}
                    />
                 </svg>
                 
                 <motion.div 
                    className="cinematic-plane"
                    initial={{ offsetDistance: "0%", opacity: 0, scale: 0.2 }}
                    animate={{ offsetDistance: "100%", opacity: 1, scale: 1 }}
                    transition={{ duration: planeDuration, delay: planeDelay, ease: "easeInOut" }}
                    style={{ offsetPath: `path('M 400 0 Q 550 200 900 50')` }}
                 >
                    <PlaneIcon />
                 </motion.div>
                 
                 {pins.map((pin, i) => (
                    <motion.div 
                      key={i} 
                      className="cinematic-pin-wrapper"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                          delay: planeDelay + (pin.pos * planeDuration), 
                          type: "spring", stiffness: 450, damping: 15
                      }}
                      style={{ 
                          offsetPath: `path('M 400 0 Q 550 200 900 50')`,
                          offsetDistance: `${pin.pos * 100}%` 
                      }}
                    >
                       <div className="pin-icon-box"><PinIcon /></div>
                       <div className="pin-city-name">{pin.name}</div>
                    </motion.div>
                 ))}
              </div>
            </div>

            {/* Stage 4 Final Sweep Bar */}
            <motion.div 
               className="cinematic-progress-bar"
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: stage4Duration, delay: stage4Delay, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
