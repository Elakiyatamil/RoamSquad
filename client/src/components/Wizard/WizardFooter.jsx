import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlannerStore from '../../store/usePlannerStore';

const VALIDATION_MESSAGES = {
  1: 'Pick a destination to continue',
  2: 'Select a start date to continue',
  3: 'Choose your travel vibe to continue',
};

export default function WizardFooter() {
  const { step, setStep, isValid } = usePlannerStore();
  const valid = isValid();
  const navigate = useNavigate();

  // Step 4 renders its own full dock — hide wizard footer
  if (step === 4) return null;

  const handleNext = () => { if (valid && step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const ctaLabel = step === 3 ? 'Review Itinerary →' : 'Continue →';

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: 640,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Validation tooltip */}
      <AnimatePresence>
        {!valid && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 100,
              padding: '6px 18px',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: '#800020',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              pointerEvents: 'none',
            }}
          >
            {VALIDATION_MESSAGES[step]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Black pill */}
      <div
        style={{
          width: '100%',
          background: '#000',
          borderRadius: 100,
          padding: '6px 6px 6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
        }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          disabled={step === 1}
          style={{
            background: 'none',
            border: 'none',
            color: step === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: step === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.2s',
            padding: '8px 0',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => { if (step > 1) e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { if (step > 1) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
        >
          ← Back
        </button>

        {/* Continue / Review CTA */}
        <button
          onClick={handleNext}
          disabled={!valid}
          style={{
            background: valid ? '#fff' : 'rgba(255,255,255,0.12)',
            color: valid ? '#000' : 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: 100,
            padding: '14px 32px',
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            cursor: valid ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            letterSpacing: '0.01em',
            boxShadow: valid ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
          }}
          onMouseEnter={e => { if (valid) e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {ctaLabel}
        </button>
      </div>

      {/* Return to Home link */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(0,0,0,0.28)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          cursor: 'pointer',
          transition: 'color 0.2s',
          padding: '4px 0',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(0,0,0,0.55)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.28)'}
      >
        <Home size={11} />
        Return to Home
      </button>
    </footer>
  );
}
