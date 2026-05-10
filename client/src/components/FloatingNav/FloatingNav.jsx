import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import './FloatingNav.css';

/**
 * Global Floating Navbar
 * Desktop: pill-shaped fixed nav (unchanged)
 * Mobile:  sticky bar with slide-in drawer from right
 */
const FloatingNav = ({ isAuthenticated, user, onLogin }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const { isLoading } = useLoader();

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const links = [
    { label: 'Discover',  href: '/' },
    { label: 'Planner',   href: '/planner' },
    { label: 'My Trips',  href: '/my-trips' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      {/* ═══════════════════════════════════════
          DESKTOP NAV — pill-shaped floating bar
      ═══════════════════════════════════════ */}
      <nav className={`fn-desktop ${isLoading ? 'nav-loading' : ''}`}>
        {/* Logo */}
        <Link to="/" className="fn-logo">
          <img src="/logo.png" alt="ROAMG" />
        </Link>

        {/* Links */}
        <div className="fn-links">
          {links.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                to={href}
                className={`fn-link ${active ? 'fn-link--active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right action */}
        <div className="fn-right">
          {isAuthenticated && user ? (
            <div className="fn-user-pill" onClick={() => navigate('/my-trips')}>
              <div className="fn-user-initial">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="fn-user-name">{user.name?.split(' ')[0] || 'My Account'}</span>
            </div>
          ) : (
            <button 
              className="fn-login-btn" 
              onClick={() => navigate('/login')}
              style={{
                background: '#8B2040',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '10px 24px',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE NAV */}
      <header className="fn-mobile-bar">
        <Link to="/" className="fn-mobile-logo">
          <img src="/logo.png" alt="ROAMG" />
        </Link>
        <button className="fn-hamburger" onClick={() => setDrawerOpen((v) => !v)}>
          <span className={`fn-bar fn-bar--top    ${drawerOpen ? 'open' : ''}`} />
          <span className={`fn-bar fn-bar--mid    ${drawerOpen ? 'open' : ''}`} />
          <span className={`fn-bar fn-bar--bottom ${drawerOpen ? 'open' : ''}`} />
        </button>
      </header>

      {/* Drawer */}
      <aside className={`fn-drawer ${drawerOpen ? 'fn-drawer--open' : ''}`}>
        <nav className="fn-drawer-links">
          {links.map(({ label, href }) => (
            <Link key={label} to={href} className="fn-drawer-link" onClick={() => setDrawerOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        {isAuthenticated && user ? (
          <div className="fn-drawer-user" onClick={() => { setDrawerOpen(false); navigate('/my-trips'); }}>
            <div className="fn-user-initial">{user.name?.[0]?.toUpperCase() || 'U'}</div>
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="fn-team-btn" onClick={() => { setDrawerOpen(false); if (onLogin) onLogin(); }}>
            LOGIN TO ROAM
          </button>
        )}
      </aside>
    </div>
  );
};

export default FloatingNav;
