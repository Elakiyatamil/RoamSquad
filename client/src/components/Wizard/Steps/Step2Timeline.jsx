import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';
import './Step2Timeline.css';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Step2Timeline() {
  const { duration, startDate, updateData } = usePlannerStore();
  const [currentView, setCurrentView] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Date Picker Logic ---
  const handleDateClick = (date) => {
    updateData({ startDate: date.toISOString().split('T')[0] });
  };

  const isSelected = (date) => {
    if (!date || !startDate) return false;
    return date.toISOString().split('T')[0] === startDate;
  };

  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  };

  const isDisabled = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < today;
  };

  const nextMonth = () => {
    const next = new Date(currentView);
    next.setMonth(next.getMonth() + 1);
    setCurrentView(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentView);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentView(prev);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  };

  const adjust = (n) => updateData({ duration: Math.max(1, duration + n) });

  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="planner-step-container" style={{ padding: '20px 24px', minHeight: 'calc(100vh - 192px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: 'rgba(0,0,0,0.35)',
          marginBottom: 24,
          textAlign: 'center'
        }}>
          Trip Duration
        </p>

        <div className="duration-wrapper">
          
          {/* 1. TOP: Day Counter Card (Compact Row) */}
          <div className="day-counter-card">
            <div className="day-counter-label-group">
              <span className="day-counter-label">How many days?</span>
            </div>
            
            <div className="counter-row">
              <button className="counter-btn" onClick={() => adjust(-1)} disabled={duration <= 1}>
                <Minus size={18} />
              </button>
              
              <AnimatePresence mode="wait">
                <motion.span
                  key={duration}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="day-counter-number"
                >
                  {duration}
                </motion.span>
              </AnimatePresence>

              <button className="counter-btn" onClick={() => adjust(1)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* 2. MIDDLE: When do you start? */}
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#5C5C6E',
            marginTop: 8,
            marginBottom: 0
          }}>
            When do you start?
          </p>

          {/* 3. BOTTOM: Inline Calendar Card */}
          <div className="calendar-card">
            <div className="calendar-header">
              <button className="nav-btn" onClick={prevMonth} disabled={currentView.getMonth() === today.getMonth() && currentView.getFullYear() === today.getFullYear()}>
                <ChevronLeft size={18} />
              </button>
              <span className="month-label">
                {currentView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button className="nav-btn" onClick={nextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-grid">
              {DAYS.map(d => <div key={d} className="day-header">{d}</div>)}
              {getDaysInMonth(currentView).map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;
                const isSel = isSelected(date);
                const isDis = isDisabled(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={`date-cell ${isSel ? 'selected' : ''} ${isToday(date) ? 'today' : ''} ${isDis ? 'disabled' : ''}`}
                    onClick={() => !isDis && handleDateClick(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Pill */}
            <div className={`selected-date-pill ${startDate ? 'visible' : ''}`}>
              {formattedDate}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
