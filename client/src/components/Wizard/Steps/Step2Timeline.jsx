import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronDown, Minus, Plus } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';

export default function Step2Timeline() {
  const { duration, startDate, updateData } = usePlannerStore();
  const [showCal, setShowCal] = useState(false);

  const adjust = (n) => updateData({ duration: Math.max(1, duration + n) });
  const today = new Date().toISOString().split('T')[0];

  const formattedDate = startDate
    ? new Date(startDate + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 192px)',
        maxWidth: 520,
        margin: '0 auto',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%' }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'rgba(0,0,0,0.35)',
            marginBottom: 32,
          }}
        >
          Trip Duration
        </p>

        {/* Days counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            marginBottom: 56,
          }}
        >
          {/* Minus button */}
          <button
            onClick={() => adjust(-1)}
            disabled={duration <= 1}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.12)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: duration <= 1 ? 'not-allowed' : 'pointer',
              opacity: duration <= 1 ? 0.3 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (duration > 1) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            <Minus size={20} color="#000" />
          </button>

          {/* Number display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={duration}
                initial={{ opacity: 0, y: 12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                style={{
                  fontFamily: "'Canva Sans', 'Inter', sans-serif",
                  fontSize: 'clamp(96px, 18vw, 160px)',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: '#000',
                  letterSpacing: '-0.04em',
                  display: 'block',
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                {duration}
              </motion.span>
            </AnimatePresence>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'rgba(0,0,0,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              Days
            </span>
          </div>

          {/* Plus button */}
          <button
            onClick={() => adjust(1)}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: '1.5px solid #800020',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(128,0,32,0.1)',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#800020';
              e.currentTarget.querySelector('svg').style.stroke = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.querySelector('svg').style.stroke = '#800020';
            }}
          >
            <Plus size={20} color="#800020" style={{ transition: 'stroke 0.15s' }} />
          </button>
        </div>

        {/* Start Date */}
        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(0,0,0,0.35)',
              marginBottom: 12,
            }}
          >
            Start Date
          </label>

          <button
            onClick={() => setShowCal(!showCal)}
            style={{
              width: '100%',
              background: '#fff',
              border: startDate ? '1px solid rgba(128,0,32,0.3)' : '1px solid rgba(0,0,0,0.1)',
              borderRadius: 16,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: startDate ? '0 0 0 3px rgba(128,0,32,0.07)' : '0 2px 8px rgba(0,0,0,0.05)',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#800020';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(128,0,32,0.07)';
            }}
            onMouseLeave={e => {
              if (!startDate) {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }
            }}
          >
            <CalendarIcon
              size={18}
              color={startDate ? '#800020' : 'rgba(0,0,0,0.3)'}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: startDate ? '#000' : 'rgba(0,0,0,0.3)',
                flex: 1,
                textAlign: 'left',
              }}
            >
              {formattedDate || 'Select your start date'}
            </span>
            <ChevronDown
              size={18}
              color="rgba(0,0,0,0.35)"
              style={{
                transition: 'transform 0.2s',
                transform: showCal ? 'rotate(180deg)' : 'rotate(0deg)',
                flexShrink: 0,
              }}
            />
          </button>

          <AnimatePresence>
            {showCal && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 20,
                  padding: '20px 24px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  zIndex: 50,
                }}
              >
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={e => {
                    updateData({ startDate: e.target.value });
                    setShowCal(false);
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#000',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    accentColor: '#800020',
                  }}
                />
                <p
                  style={{
                    marginTop: 12,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    color: 'rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    textAlign: 'center',
                  }}
                >
                  Select a date to continue
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
