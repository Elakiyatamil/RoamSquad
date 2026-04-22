import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ROAMSQUAD — Cinematic Curtain Transition
 * Phase 1: Curtain drops (0–400ms)
 * Phase 2: Logo flashes on curtain (300–600ms)
 * Phase 3: Curtain lifts revealing Step 3 (500–900ms)
 *
 * curtainPhase: 'hidden' | 'down' | 'logo' | 'up'
 */
const CurtainTransition = ({ curtainPhase }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [lineDrawn, setLineDrawn] = useState(false);

  useEffect(() => {
    if (curtainPhase === 'down') {
      // Show logo after curtain is almost fully down
      const t1 = setTimeout(() => { setLogoVisible(true); setLineDrawn(true); }, 350);
      return () => clearTimeout(t1);
    }
    if (curtainPhase === 'up' || curtainPhase === 'hidden') {
      setLogoVisible(false);
      setLineDrawn(false);
    }
  }, [curtainPhase]);

  const isVisible = curtainPhase === 'down' || curtainPhase === 'up';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="curtain"
          initial={{ y: '-100%' }}
          animate={{ y: curtainPhase === 'up' ? '-100%' : '0%' }}
          transition={{
            duration: 0.4,
            ease: [0.76, 0, 0.24, 1],
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'linear-gradient(135deg, #0a0f1e 0%, #1a0500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence>
            {logoVisible && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: '48px',
                    color: '#E85D04',
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                  }}
                >
                  ROAMSQUAD
                </span>
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(232,93,4,0.6)',
                    width: lineDrawn ? '200px' : '0px',
                    transition: 'width 300ms ease',
                    marginTop: '4px',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CurtainTransition;
