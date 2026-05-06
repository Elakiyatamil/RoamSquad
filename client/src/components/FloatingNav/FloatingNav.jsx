import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';

/**
 * Global Floating Glassmorphism Capsule Navbar
 * Shared across: Landing, Planner, Packages, Events, Wishlist, My Trips, Journey
 */
const FloatingNav = ({ isAuthenticated, user, onLogin }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { isLoading } = useLoader(); // Add this line manually if needed, but I'll use context properly.


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
    <nav style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '92%',
      maxWidth: 960,
      zIndex: 9999,
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      borderRadius: 100,
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.5) inset',
      opacity: isLoading ? 0.5 : 1,
      transition: 'all 0.3s ease',
      pointerEvents: isLoading ? 'none' : 'auto',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img src="/logo.png" alt="ROAMG" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
      </a>

      {/* Desktop Links */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden md:flex">
        {links.map(({ label, href }) => {
          const active = isActive(href);
          return (
            <a key={label} href={href} style={{
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              color: active ? '#800020' : '#1a1a1a',
              letterSpacing: 0.5,
              paddingBottom: 2,
              borderBottom: active ? '2px solid #800020' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!active) e.target.style.color = '#800020'; }}
            onMouseLeave={e => { if (!active) e.target.style.color = '#1a1a1a'; }}
            >{label}</a>
          );
        })}
      </div>

      {/* Right: User / Login */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {isAuthenticated && user ? (
          <span className="hidden md:block" style={{
            fontSize: 12, fontWeight: 700, color: '#1a1a1a',
            background: 'rgba(0,0,0,0.05)', padding: '6px 14px', borderRadius: 20,
          }}>{user.name}</span>
        ) : onLogin ? (
          <button className="hidden md:block" onClick={onLogin} style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            color: '#800020', background: 'none', border: '1px solid rgba(128,0,32,0.3)',
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
          }}>Login</button>
        ) : null}

        {/* Hamburger */}
        <button className="md:hidden" onClick={() => setOpen(v => !v)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#1a1a1a', padding: 4,
        }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              left: 0, right: 0,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 24,
              padding: '20px 24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {links.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <a key={label} href={href} onClick={() => setOpen(false)} style={{
                  fontSize: 16, fontWeight: active ? 800 : 600,
                  color: active ? '#800020' : '#1a1a1a',
                  textDecoration: 'none', padding: '10px 12px', borderRadius: 12,
                  background: active ? 'rgba(128,0,32,0.06)' : 'transparent',
                  transition: 'all 0.15s',
                }}>{label}</a>
              );
            })}
            {!isAuthenticated && onLogin && (
              <button onClick={() => { setOpen(false); onLogin(); }} style={{
                marginTop: 8, padding: '12px', borderRadius: 12,
                background: '#800020', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
              }}>Login</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default FloatingNav;
