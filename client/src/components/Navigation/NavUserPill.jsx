import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, X, Ticket } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './NavUserPill.css';

const NavUserPill = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="user-pill-container" onClick={(e) => e.stopPropagation()}>
        <div
          className="team-pill"
          onClick={(e) => {
            e.stopPropagation();
            setShowProfileMenu(!showProfileMenu);
          }}
        >
          {/* Avatar circle with first letter */}
          <div className="team-avatar">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {/* Name */}
          <span className="team-name-text">
            {user.name?.split(' ')[0] || 'Account'}
            {'\'S TEAM'}
          </span>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showProfileMenu && (
            <>
              <motion.div 
                className="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(false);
                }} 
              />
              <motion.div 
                className="logout-menu"
                initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <button 
                  className="menu-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu(false);
                  }}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>

                <div className="menu-header">
                  <p className="signed-in-as">Signed in as</p>
                  <p className="user-email">{user.email}</p>
                </div>
                
                <button
                  className="logout-button"
                  style={{ color: '#111827', marginBottom: '8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/my-meetups');
                    setShowProfileMenu(false);
                  }}
                >
                  <Ticket className="logout-icon" style={{ color: '#6b7280' }} />
                  My Meetups
                </button>

                <button
                  className="logout-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <LogOut className="logout-icon" />
                  Logout
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      className="login-trigger-btn"
      onClick={() => navigate('/login')}
    >
      Login
    </button>
  );
};

export default NavUserPill;

