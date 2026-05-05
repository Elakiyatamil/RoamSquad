import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, User, Home, UserPlus } from 'lucide-react';

const PERSONAS = [
  { id: 'COUPLE', label: 'Couple', icon: Heart },
  { id: 'FAMILY', label: 'Family', icon: Home },
  { id: 'SOLO', label: 'Solo', icon: User },
  { id: 'STRANGER', label: 'Stranger', icon: UserPlus },
  { id: 'FRIENDS', label: 'Friends', icon: Users }
];

const PersonaSwitcher = ({ activePersona, onPersonaChange }) => {
  return (
    <div className="persona-switcher-wrap py-8">
      <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto px-4 pb-4 no-scrollbar">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPersonaChange(p.id)}
            className={`persona-toggle-btn ${activePersona === p.id ? 'active' : ''}`}
          >
            <div className="icon-box">
              <p.icon size={20} />
            </div>
            <span className="label">{p.label}</span>
            {activePersona === p.id && (
              <motion.div 
                layoutId="persona-pill"
                className="active-pill"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonaSwitcher;
