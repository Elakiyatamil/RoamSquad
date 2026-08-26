import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus, Calendar as CalendarIcon } from 'lucide-react';
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

// Add days to date string
const addDaysToString = (dateStr, daysCount) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + (daysCount - 1));
  return formatDateString(date);
};

// Calculate diff in days between two date strings
const calcDiffDays = (startStr, endStr) => {
  if (!startStr || !endStr) return 1;
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const s = new Date(sy, sm - 1, sd);
  const e = new Date(ey, em - 1, ed);
  const diffTime = e.getTime() - s.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) + 1);
};

export default function Step2Timeline() {
  const { duration = 5, startDate, endDate, updateData } = usePlannerStore();
  const [currentView, setCurrentView] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Synchronized Date Selection Logic ---
  const handleDateClick = (date) => {
    const clickedStr = formatDateString(date);
    const currentDuration = duration || 5;

    // If both dates are already set OR no start date is set yet -> Treat click as NEW Start Date
    if (!startDate || (startDate && endDate)) {
      const calculatedEnd = addDaysToString(clickedStr, currentDuration);
      updateData({
        startDate: clickedStr,
        endDate: calculatedEnd,
        duration: currentDuration
      });
      return;
    }

    // Only startDate was set (second click on calendar)
    if (clickedStr < startDate) {
      // Clicked date is before start date -> Set as new start date and auto-fill end date
      const calculatedEnd = addDaysToString(clickedStr, currentDuration);
      updateData({
        startDate: clickedStr,
        endDate: calculatedEnd,
        duration: currentDuration
      });
    } else if (clickedStr === startDate) {
      // Clicked same date again -> Set as 1-day trip
      updateData({
        startDate: clickedStr,
        endDate: clickedStr,
        duration: 1
      });
    } else {
      // Clicked date is after start date -> Set as end date and update duration counter
      const newDuration = calcDiffDays(startDate, clickedStr);
      updateData({
        startDate,
        endDate: clickedStr,
        duration: newDuration
      });
    }
  };

  // Plus / Minus Duration Counter Adjuster
  const adjustDuration = (delta) => {
    const newDuration = Math.max(1, (duration || 5) + delta);
    if (startDate) {
      const newEndDate = addDaysToString(startDate, newDuration);
      updateData({
        duration: newDuration,
        endDate: newEndDate
      });
    } else {
      updateData({ duration: newDuration });
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

  // Format human-friendly summary text
  const getSummaryBannerText = () => {
    if (startDate && endDate && endDate >= startDate) {
      const days = duration || calcDiffDays(startDate, endDate);
      return `📅 Trip Duration: ${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)} (${days} ${days === 1 ? 'Day' : 'Days'})`;
    }
    if (startDate) {
      const days = duration || 5;
      const projectedEnd = addDaysToString(startDate, days);
      return `📅 Trip Duration: ${formatDateDisplay(startDate)} – ${formatDateDisplay(projectedEnd)} (${days} Days)`;
    }
    return '📅 Select your travel start date on the calendar';
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
          Trip Duration & Dates
        </p>

        <div className="duration-wrapper">
          
          {/* 1. TOP: Day Counter Card */}
          <div className="day-counter-card">
            <div className="day-counter-label-group">
              <span className="day-counter-label">HOW MANY DAYS?</span>
              <span className="day-counter-sub">Adjust duration anytime</span>
            </div>
            
            <div className="counter-row">
              <button 
                type="button"
                className="counter-btn" 
                onClick={() => adjustDuration(-1)} 
                disabled={(duration || 5) <= 1}
              >
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
                  {duration || 5}
                </motion.span>
              </AnimatePresence>

              <button 
                type="button"
                className="counter-btn" 
                onClick={() => adjustDuration(1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* 2. MIDDLE: Section Heading */}
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#475569',
            marginTop: 8,
            marginBottom: 0
          }}>
            Select Travel Dates
          </p>

          {/* 3. BOTTOM: Inline Calendar Card */}
          <div className="calendar-card">
            <div className="calendar-header">
              <button type="button" className="nav-btn" onClick={prevMonth} disabled={isPrevMonthDisabled()}>
                <ChevronLeft size={18} />
              </button>
              <span className="month-label">
                {currentView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" className="nav-btn" onClick={nextMonth}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-grid">
              {DAYS.map((d, i) => <div key={`${d}-${i}`} className="day-header">{d}</div>)}
              {getDaysInMonth(currentView).map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;
                const dateStr = formatDateString(date);
                const isStart = dateStr === startDate;
                const isEnd = dateStr === endDate;
                const inRange = startDate && endDate && endDate >= startDate && dateStr > startDate && dateStr < endDate;
                const isDis = isDisabled(date);
                const isTodayDate = isToday(date);

                let cellClasses = ['date-cell'];
                if (isStart) cellClasses.push('start-date');
                if (isEnd) cellClasses.push('end-date');
                if (inRange) cellClasses.push('in-range');
                if (isTodayDate) cellClasses.push('today');
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
                    <span>{date.getDate()}</span>
                    {isTodayDate && <span className="today-dot" />}
                  </div>
                );
              })}
            </div>

            {/* Clean Glassmorphic Status / Summary Banner */}
            <div className="summary-banner-card">
              <span>{getSummaryBannerText()}</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

