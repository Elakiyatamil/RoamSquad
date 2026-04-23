import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './PageLoader.css';

const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(193,53,26,0.6))' }}>
    <g transform="rotate(90 12 12)">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#ffffff" />
        <path d="M11.5 2C10.67 2 10 2.67 10 3.5V9L11.5 10L13 9V3.5C13 2.67 12.33 2 11.5 2Z" fill="#C1351A" />
    </g>
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 12 16" fill="none">
    <path d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 7.10457 7.10457 8 6 8Z" fill="#C1351A"/>
  </svg>
);

const getDim = () => {
    if (typeof window !== 'undefined') {
        return { w: window.innerWidth, h: window.innerHeight };
    }
    return { w: 1000, h: 800 };
};

export default function PageLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dim, setDim] = useState(getDim());

  useEffect(() => {
    const handleResize = () => setDim(getDim());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    document.body.style.overflow = 'hidden';
    
    // Total duration is exactly 3s
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      if (isInitialLoad) setIsInitialLoad(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  const roamWord = "ROAM".split('');
  const squadWord = "SQUAD".split('');
  
  const pins = [
      { name: 'GOA', pos: 0.20 },
      { name: 'EDINBURGH', pos: 0.38 },
      { name: 'BALI', pos: 0.62 },
      { name: 'TOKYO', pos: 0.80 }
  ];

  const { w, h } = dim;
  // Dynamic bezier coordinates mapping exactly to 10%, 75%, 35%, 45%, etc as requested
  const pathD = `M ${w * 0.1} ${h * 0.75} C ${w * 0.35} ${h * 0.45}, ${w * 0.65} ${h * 0.45}, ${w * 0.9} ${h * 0.75}`;

  // Use the exact delays and durations mathematically
  const planeDelay = 1.0; 
  const planeDuration = 1.2;

  // We show full animations if it's the initial load; 
  // if you want subsequent nav loaders to go faster, toggle speeds below,
  // but as per spec: plane motion is 1.2s and exit is at 3s.
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="global-page-loader-wrapper"
          initial={{ y: 0 }}
          exit={{ 
              y: "-100%", 
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          <div className="loader-content-layer">
            {isInitialLoad && (
              <div className="loader-brand-cinematic">
                 <div className="loader-roam-word cinematic-word">
                    {roamWord.map((char, i) => (
                       <motion.span 
                         key={`roam-${i}`} 
                         initial={{ y: -40, rotateX: 25, scaleX: 1.04, color: '#ffffff', opacity: 0 }}
                         animate={{ y: 0, rotateX: 0, scaleX: 1, color: '#C1351A', opacity: 1 }}
                         transition={{ duration: 0.4, delay: 0.2 + (i * 0.08), ease: "easeOut" }}
                         className="roam-char"
                       >
                         {char}
                       </motion.span>
                    ))}
                 </div>
                 
                 <motion.div 
                    className="cinematic-divider"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 120, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8, ease: "easeInOut" }}
                 />

                 <div className="loader-squad-word cinematic-word">
                    {squadWord.map((char, i) => (
                       <motion.span 
                         key={`squad-${i}`} 
                         initial={{ y: 40, rotateX: -25, scaleX: 1.04, color: '#ffffff', opacity: 0 }}
                         animate={{ y: 0, rotateX: 0, scaleX: 1, color: '#F5F0E8', opacity: 1 }}
                         transition={{ duration: 0.4, delay: 0.2 + (i * 0.08), ease: "easeOut" }}
                         className="squad-char"
                       >
                         {char}
                       </motion.span>
                    ))}
                 </div>
              </div>
            )}

            <div className="loader-spatial-zone">
               <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  <motion.path 
                     d={pathD}
                     fill="none" 
                     stroke="#C1351A" 
                     strokeWidth="1.5"
                     style={{ filter: 'drop-shadow(0 0 4px #C1351A)' }}
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ 
                         pathLength: { duration: planeDuration, delay: planeDelay, ease: [0.4, 0, 0.2, 1] },
                         opacity: { duration: 0.2, delay: planeDelay }
                     }}
                  />
               </svg>
               
               <motion.div 
                  className="cinematic-plane"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ offsetDistance: "100%", opacity: 1 }}
                  transition={{ 
                      offsetDistance: { duration: planeDuration, delay: planeDelay, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.2, delay: planeDelay }
                  }}
                  style={{ offsetPath: `path('${pathD}')` }}
               >
                  <PlaneIcon />
               </motion.div>
               
               {pins.map((pin, i) => {
                  const pinTriggerTime = planeDelay + (pin.pos * planeDuration);
                  return (
                    <div 
                      key={i} 
                      className="cinematic-pin-wrapper"
                      style={{ 
                          offsetPath: `path('${pathD}')`,
                          offsetDistance: `${pin.pos * 100}%` 
                      }}
                    >
                       <motion.div 
                          className="pin-icon-box"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10, delay: pinTriggerTime }}
                       >
                           <PinIcon />
                       </motion.div>
                       <motion.div 
                          className="pin-city-name"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.1, delay: pinTriggerTime + 0.1 }}
                       >
                           {pin.name}
                       </motion.div>
                    </div>
                  )
               })}
            </div>

            <motion.div 
               className="cinematic-progress-bar"
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: 3.0, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
