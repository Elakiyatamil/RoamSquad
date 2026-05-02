import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { globalSignals } from '../../utils/signals';
import { Menu, X, Search } from 'lucide-react';
import './StickySearch.css';

const StickySearch = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          {/* Desktop Nav */}
          <nav className="ss-nav desktop-only">
            <span className="ss-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Discover</span>
            <Link to="/planner" className="ss-nav-link">Planner</Link>
            <span className="ss-nav-link" onClick={() => scrollToDiscovery('discovery-itineraries')}>Packages</span>
            <span className="ss-nav-link" onClick={() => scrollToDiscovery('discovery-itineraries')}>Events</span>
            <Link to="/wishlist" className="ss-nav-link">Wishlist</Link>
          </nav>

          <div className="ss-right-section">
            <div className="ss-search-wrap desktop-only" onClick={handleSearchClick}>
              <div className="ss-compact-search">
                <span className="ss-search-placeholder">Where to next?</span>
                <div className="ss-burgundy-glow" />
              </div>
            </div>

            <button 
              className="ss-mobile-toggle mobile-only"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Drawer Consistency */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                className="rh-mobile-drawer" /* Reuse RoamgHero drawer styles */
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="rh-drawer-header">
                  <img src="/logo.png" alt="Roamg" className="rh-logo-img" style={{ height: '32px', filter: 'none' }} />
                  <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                </div>
                <nav className="rh-drawer-nav">
                  <span className="rh-drawer-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Discover</span>
                  <Link to="/planner" className="rh-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Planner</Link>
                  <span className="rh-drawer-link" onClick={() => { scrollToDiscovery('discovery-itineraries'); setIsMobileMenuOpen(false); }}>Packages</span>
                  <span className="rh-drawer-link" onClick={() => { scrollToDiscovery('discovery-itineraries'); setIsMobileMenuOpen(false); }}>Events</span>
                  <Link to="/wishlist" className="rh-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
                  <button className="rh-drawer-search-btn" onClick={() => { navigate('/planner'); setIsMobileMenuOpen(false); }}>
                    <Search size={18} />
                    <span>Where to next?</span>
                  </button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default StickySearch;
