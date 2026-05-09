import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../Loader/LiquidFlowLoader.css'; // Use the CSS from the startup loader

/**
 * GlobalLoader (formerly VelvetLoader)
 * Replicates the startup Liquid Flow Loader logic but binds to the global isLoading state.
 */
const VelvetLoader = ({ isLoading, children }) => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);
  const rafRef = useRef(null);
  const MIN_TIME = 800; // minimum display time in ms

  // Wave animation via requestAnimationFrame
  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const t = (timestamp - startTime) / 1000;
      setWavePhase(t);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Progress logic bound to isLoading
  useEffect(() => {
    let interval;
    let startTime;

    if (isLoading) {
      setShow(true);
      setIsZooming(false);
      setProgress(0);
      startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let currentProgress = Math.floor((elapsed / MIN_TIME) * 100);
        
        // Plateau at 99% until officially finishes
        if (currentProgress >= 99) {
          currentProgress = 99;
        }
        
        setProgress(currentProgress);
      }, 50);
    } else {
      if (show) {
        setProgress(100);
        // Wait a tiny bit at 100%, then zoom, then hide
        const transitionTimer = setTimeout(() => {
          setIsZooming(true);
          const hideTimer = setTimeout(() => {
            setShow(false);
          }, 800); // 800ms for zoom out to finish
        }, 300);
        return () => clearTimeout(transitionTimer);
      }
    }

    return () => clearInterval(interval);
  }, [isLoading, show]);

  // Dynamic SVG Wave Path
  const buildWavePath = (phase, width = 500, amplitude = 14, freq = 2) => {
    const points = 256;
    let d = '';
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = amplitude * Math.sin((i / points) * freq * 2 * Math.PI + phase);
      if (i === 0) d += `M ${x} ${y}`;
      else d += ` L ${x} ${y}`;
    }
    d += ` L ${width} 200 L 0 200 Z`;
    return d;
  };

  const fillY = 150 - progress * 1.5;

  return (
    <>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: '#F9F8F3' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          >
            <div className={`liquid-loader-container ${isZooming ? 'execute-zoom' : ''}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100000 }}>
              <div className="liquid-loader-bg-waves" />
              <div className="liquid-logo-wrapper">
                <svg className="liquid-logo-svg" viewBox="0 0 500 150" overflow="visible">
                  <defs>
                    <clipPath id="roamgGlobalClip">
                      <text x="50%" y="50%" dy=".35em" textAnchor="middle" className="liquid-logo-text">
                        RoamG
                      </text>
                    </clipPath>
                  </defs>

                  <text
                    x="50%" y="50%" dy=".35em" textAnchor="middle"
                    className="liquid-logo-text"
                    fill="#FFFFFF" fillOpacity="0.6" stroke="#000000" strokeWidth="0.15" strokeOpacity="1"
                  >
                    RoamG
                  </text>

                  <g clipPath="url(#roamgGlobalClip)">
                    <rect x="0" y={fillY + 12} width="500" height="200" fill="#000000" />
                    <g transform={`translate(0, ${fillY})`}>
                      <path d={buildWavePath(wavePhase * 3, 500, 12, 3)} fill="#000000" />
                    </g>
                  </g>
                </svg>

                {!isZooming && (
                  <div className={`liquid-counter ${progress > 82 ? 'over-fill' : ''}`}>
                    loading... {progress}%
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default VelvetLoader;
