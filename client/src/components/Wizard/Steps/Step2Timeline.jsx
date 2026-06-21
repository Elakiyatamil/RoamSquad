import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';
import './Step2Timeline.css';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Timezone-safe local date to 'YYYY-MM-DD' converter
const formatDateString = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Timezone-safe date string format display
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Step2Timeline() {
  const { duration, startDate, endDate, updateData } = usePlannerStore();
  const [currentView, setCurrentView] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Date Picker Click Logic ---
  const handleDateClick = (date) => {
    const clickedStr = formatDateString(date);

    if (!startDate) {
      // Empty: Set start date
      updateData({ startDate: clickedStr, endDate: '' });
    } else if (!endDate) {
      // Start date exists, no end date yet
      if (clickedStr === startDate) {
        // Clicked same date again: Make it a 1-day trip
        updateData({ endDate: clickedStr, duration: 1 });
      } else if (clickedStr < startDate) {
        // Clicked date is before start date -> Set as endDate to trigger ERROR state
        updateData({ endDate: clickedStr });
      } else {
        // Clicked date is on or after start date -> Set as endDate and auto-update duration
        const start = new Date(startDate);
        const end = new Date(clickedStr);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        updateData({ endDate: clickedStr, duration: diffDays });
      }
    } else {
      // Both exist: User clicks again -> start fresh or reset
      if (clickedStr === startDate && startDate === endDate) {
        // Reset both if they click the 1-day trip date a third time
        updateData({ startDate: '', endDate: '' });
      } else if (clickedStr === startDate) {
        // Reset both
        updateData({ startDate: '', endDate: '' });
      } else if (clickedStr > startDate) {
        // Replace end date
        const start = new Date(startDate);
        const end = new Date(clickedStr);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        updateData({ endDate: clickedStr, duration: diffDays });
      } else {
        // New date is before start -> Replace start and clear end
        updateData({ startDate: clickedStr, endDate: '' });
      }
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isDisabled = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
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

  // Prevent navigating to months entirely in the past
  const isPrevMonthDisabled = () => {
    return (
      currentView.getFullYear() === today.getFullYear() &&
      currentView.getMonth() === today.getMonth()
    );
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

  // Calculate Errors and Warnings
  let alertText = '';
  let alertType = ''; // 'error' | 'warning'

  if (startDate && endDate && endDate < startDate) {
    alertText = 'End date must be after start date';
    alertType = 'error';
  } else if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 90) {
      alertText = 'Maximum trip duration is 90 days';
      alertType = 'error';
    } else if (duration !== diffDays) {
      alertText = "Duration doesn't match selected dates";
      alertType = 'warning';
    }
  }

  // If still no alert, check if only start date selected
  if (!alertText && startDate && !endDate) {
    alertText = 'Select your end date (or click again for 1-day trip)';
    alertType = 'warning';
  }

  // Display text for date range
  const getRangeDisplayText = () => {
    if (startDate && endDate && endDate >= startDate) {
      return `FROM: ${formatDateDisplay(startDate)} TO: ${formatDateDisplay(endDate)}`;
    }
    if (startDate) {
      return `FROM: ${formatDateDisplay(startDate)}`;
    }
    return 'Select your travel dates';
  };

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
                  style={{
                    color: alertText === "Duration doesn't match selected dates" ? '#FF9800' : '#1A1A2E'
                  }}
                >
                  {duration}
                </motion.span>
              </AnimatePresence>

              <button className="counter-btn" onClick={() => adjust(1)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* 2. MIDDLE: When do you start? (and end?) */}
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
            When do you start? (and end?)
          </p>

          {/* 3. BOTTOM: Inline Calendar Card */}
          <div className="calendar-card">
            <div className="calendar-header">
              <button className="nav-btn" onClick={prevMonth} disabled={isPrevMonthDisabled()}>
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
                const dateStr = formatDateString(date);
                const isStart = dateStr === startDate;
                const isEnd = dateStr === endDate;
                const inRange = startDate && endDate && endDate >= startDate && dateStr > startDate && dateStr < endDate;
                const hasError = endDate && endDate < startDate && (isStart || isEnd);
                const isDis = isDisabled(date);

                let cellClasses = ['date-cell'];
                if (isStart) cellClasses.push('start-date');
                if (isEnd) cellClasses.push('end-date');
                if (inRange) cellClasses.push('in-range');
                if (hasError) cellClasses.push('error');
                if (isToday(date)) cellClasses.push('today');
                if (isDis) cellClasses.push('disabled');

                if ((isStart && !endDate) || (isStart && isEnd)) {
                  cellClasses.push('single-date');
                }

                return (
                  <div
                    key={date.toISOString()}
                    className={cellClasses.join(' ')}
                    onClick={() => !isDis && handleDateClick(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Display */}
            <div className="date-range-display">
              {getRangeDisplayText()}
            </div>

            {/* Alerts/Warnings Container */}
            <AnimatePresence>
              {alertText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`alert-container ${alertType}`}
                >
                  <span>{alertType === 'error' ? '❌' : '⚠️'}</span>
                  <span>{alertText}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
