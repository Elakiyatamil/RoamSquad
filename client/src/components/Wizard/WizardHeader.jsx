import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlannerStore from '../../store/usePlannerStore';
import useAuthStore from '../../store/authStore';

const STEPS = [
  { id: 1, label: 'Destination' },
  { id: 2, label: 'Duration' },
  { id: 3, label: 'Travelers' },
  { id: 4, label: 'Itinerary' },
];

export default function WizardHeader() {
  const { step, setStep } = usePlannerStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleStepClick = (id) => {
    if (id < step) setStep(id); // only allow going back to completed steps
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 56,
        background: 'rgba(253,252,240,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left — Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Canva Sans', 'Inter', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#000',
            userSelect: 'none',
          }}
        >
          RoamG
        </span>
      </div>

      {/* Center — Breadcrumb navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {STEPS.map((s) => {
          const isActive    = step === s.id;
          const isCompleted = step > s.id;
          const isClickable = isCompleted;

          return (
            <button
              key={s.id}
              onClick={() => handleStepClick(s.id)}
              disabled={!isClickable && !isActive}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                position: 'relative',
                cursor: isClickable ? 'pointer' : 'default',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.01em',
                color: isActive
                  ? '#000'
                  : isCompleted
                  ? 'rgba(0,0,0,0.45)'
                  : 'rgba(0,0,0,0.22)',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ marginRight: 4, opacity: 0.45, fontSize: 11 }}>
                {s.id}.
              </span>
              {s.label}

              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="wizard-active-tab"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#800020',
                    borderRadius: 2,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right — User badge + Close */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {isAuthenticated && user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px 5px 8px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(0,0,0,0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {user.name || 'You'}
            </span>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(128,0,32,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#800020',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {(user.name || 'U').charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* X → navigate home */}
        <button
          onClick={() => navigate('/')}
          title="Return to Home"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
          <X size={15} color="rgba(0,0,0,0.55)" />
        </button>
      </div>

      {/* Mobile progress bar */}
      <div
        style={{
          display: 'none', // shown via media-query in CSS, keep simple
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(0,0,0,0.05)',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(step / STEPS.length) * 100}%` }}
          style={{ height: '100%', background: '#800020', borderRadius: 2 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>
    </header>
  );
}
