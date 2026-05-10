import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NavUserPill = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Use the pattern provided in the prompt
  if (isAuthenticated && user) {
    return (
      <div
        className="team-pill"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F3F4F6',
          borderRadius: '50px',
          padding: '6px 14px 6px 6px',
          cursor: 'pointer',
          border: '1px solid #E5E7EB'
        }}
      >
        {/* Avatar circle with first letter */}
        <div style={{
          width: '30px', height: '30px',
          borderRadius: '50%',
          background: '#8B2040',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Poppins',
          fontWeight: 700, fontSize: '0.8rem',
          flexShrink: 0
        }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        {/* Name */}
        <span style={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '0.82rem',
          color: '#1A1A2E'
        }}>
          {user.name?.split(' ')[0] || 'My Account'}
          {'\'S TEAM'}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate('/login')}
      style={{
        background: '#8B2040', color: 'white',
        border: 'none', borderRadius: '50px',
        padding: '10px 24px',
        fontFamily: 'Poppins', fontWeight: 600,
        fontSize: '0.85rem', cursor: 'pointer'
      }}
    >Login</button>
  );
};

export default NavUserPill;
