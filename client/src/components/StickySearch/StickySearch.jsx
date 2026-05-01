import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { globalSignals } from '../../utils/signals';
import './StickySearch.css';

const StickySearch = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show sticky search after scrolling past the first few viewports (approx 1.5x vh)
    if (latest > window.innerHeight * 1.5) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  const scrollToDiscovery = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    globalSignals.setCurrentPlannerStep(1);
    navigate('/planner');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header 
          className="ss-header"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/" className="ss-logo">
            <img src="/logo.png" alt="ROAMG Logo" style={{ height: '40px', width: 'auto' }} />
          </Link>

          <nav className="ss-nav">
            <span className="ss-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Discover</span>
            <Link to="/planner" className="ss-nav-link">Planner</Link>
            <span className="ss-nav-link" onClick={() => scrollToDiscovery('discovery-itineraries')}>Packages</span>
            <span className="ss-nav-link" onClick={() => scrollToDiscovery('discovery-itineraries')}>Events</span>
            <Link to="/wishlist" className="ss-nav-link">Wishlist</Link>
          </nav>

          <div className="ss-search-wrap" onClick={handleSearchClick}>
            <div className="ss-compact-search">
              <span className="ss-search-placeholder">Where to next?</span>
              <div className="ss-burgundy-glow" />
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default StickySearch;
