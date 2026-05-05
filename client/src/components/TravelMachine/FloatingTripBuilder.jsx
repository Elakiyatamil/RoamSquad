import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Save, Share2 } from 'lucide-react';

const FloatingTripBuilder = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="floating-builder-anchor fixed bottom-8 right-8 z-[2000]"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="builder-menu mb-4 flex flex-col gap-3 items-end"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
          >
            <button className="menu-item-btn">
              <span className="label">Draft Your Own Journey</span>
              <div className="icon-wrap bg-white text-[#1B3A6B]">
                <Edit3 size={18} />
              </div>
            </button>
            <button className="menu-item-btn">
              <span className="label">Save Template</span>
              <div className="icon-wrap bg-white text-[#1B3A6B]">
                <Save size={18} />
              </div>
            </button>
            <button className="menu-item-btn">
              <span className="label">Share Plan</span>
              <div className="icon-wrap bg-white text-[#1B3A6B]">
                <Share2 size={18} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="main-builder-btn bg-[#22c55e] text-white p-5 rounded-full shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>
      
      {/* Pulse effect */}
      {!isOpen && (
        <div className="btn-pulse-ring" />
      )}
    </div>
  );
};

export default FloatingTripBuilder;
