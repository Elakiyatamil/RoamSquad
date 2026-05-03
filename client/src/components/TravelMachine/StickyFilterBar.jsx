import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const StickyFilterBar = ({ filters, setFilters }) => {
  return (
    <motion.div 
      className="sticky-filter-bar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="filter-content container mx-auto">
        <div className="filter-group">
          <SlidersHorizontal size={18} />
          <span className="filter-label">Sort & Filter</span>
        </div>
        
        <div className="filter-actions">
          <div className="filter-pill">
            Price: Low to High <ChevronDown size={14} />
          </div>
          <div className="filter-pill">
            Duration: 5 Nights <ChevronDown size={14} />
          </div>
          <div className="filter-pill">
            Rating: 4.5+ <ChevronDown size={14} />
          </div>
        </div>

        <div className="filter-stats text-sm opacity-60">
          Showing 12 results for Bali
        </div>
      </div>
    </motion.div>
  );
};

export default StickyFilterBar;
