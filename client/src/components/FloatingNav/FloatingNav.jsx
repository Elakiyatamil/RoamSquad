import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import './FloatingNav.css';

/**
 * Global Responsive Floating Navbar
 */
const FloatingNav = ({ isAuthenticated, user, onLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { isLoading } = useLoader();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const links = [
    { label: 'Discover', href: '/' },
    { label: 'Planner', href: '/planner' },
    { label: 'Packages', href: '/packages' },
    { label: 'Events', href: '/events' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'My Trips', href: '/my-trips' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`floating-nav-container ${isLoading ? 'nav-loading' : ''}`}>
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="ROAMG" />
        </Link>

        {/* Desktop Links */}
        <div className="desktop-links">
          {links.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className={`nav-link ${isActive(href) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="nav-right-actions">
          {isAuthenticated && user ? (
            <button className="nav-btn-team">
              {user.name || "Tamil's Team"}
            </button>
          ) : (
            <button className="nav-btn-team" onClick={onLogin}>
              Tamil's Team
            </button>
          )}

          {/* Hamburger Menu Toggle */}
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button 
              className="mobile-menu-close" 
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={32} />
            </button>

            <div className="mobile-links">
              {links.map(({ label, href }) => (
                <Link
                  key={label}
                  to={href}
                  className={`mobile-link ${isActive(href) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <button 
                  className="btn-primary" 
                  style={{ marginTop: '20px', fontSize: '18px', padding: '15px 40px', borderRadius: '40px' }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onLogin) onLogin();
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNav;
