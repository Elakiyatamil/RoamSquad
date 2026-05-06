import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';

const Step2Timeline = () => {
  const { duration, startDate, updateData } = usePlannerStore();
  const [showCalendar, setShowCalendar] = useState(false);

  const adjustDuration = (amt) => {
    updateData({ duration: Math.max(1, duration + amt) });
  };

  // Simple calendar simulation or native input
  // I'll implement a custom looking one as requested by the "minimalist/airy" aesthetic
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full"
      >
        <h2 className="text-primary/40 uppercase tracking-[0.2em] font-bold text-sm mb-8">Trip Duration</h2>
        
        {/* Days Counter */}
        <div className="flex items-center justify-center gap-12 mb-20">
          <button
            onClick={() => adjustDuration(-1)}
            className="w-16 h-16 rounded-full border border-black/5 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-black/5 transition-all active:scale-90"
          >
            <Minus size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <motion.span
              key={duration}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-9xl font-display font-bold tabular-nums"
            >
              {duration}
            </motion.span>
            <span className="text-xl font-display font-medium text-primary/40 -mt-2">Days</span>
          </div>

          <button
            onClick={() => adjustDuration(1)}
            className="w-16 h-16 rounded-full border border-black/5 bg-white shadow-sm flex items-center justify-center text-primary hover:bg-black/5 transition-all active:scale-90"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Start Date */}
        <div className="relative w-full max-w-sm mx-auto">
          <label className="block text-primary/40 uppercase tracking-[0.2em] font-bold text-[10px] mb-4">Start Date</label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`w-full bg-white border rounded-2xl py-4 px-6 flex items-center justify-between transition-all ${
              startDate ? 'border-accent-maroon/20 bg-accent-maroon/[0.02]' : 'border-black/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <CalendarIcon size={20} className={startDate ? 'text-accent-maroon' : 'text-primary/30'} />
              <span className={`text-lg font-medium ${startDate ? 'text-primary' : 'text-primary/30'}`}>
                {startDate ? new Date(startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select your start date'}
              </span>
            </div>
            <ChevronDown size={20} className={`transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-4 z-50"
              >
                <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-2xl">
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => {
                      updateData({ startDate: e.target.value });
                      setShowCalendar(false);
                    }}
                    className="w-full border-none focus:ring-0 text-lg font-medium cursor-pointer"
                  />
                  <p className="mt-4 text-[10px] text-primary/30 uppercase tracking-widest text-center">Select a date to continue</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Step2Timeline;
