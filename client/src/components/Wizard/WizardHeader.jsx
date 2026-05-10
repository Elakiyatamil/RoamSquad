import React from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlannerStore from '../../store/usePlannerStore';
import useAuthStore from '../../store/authStore';
import NavUserPill from '../Navigation/NavUserPill';
import './PlannerNavbar.css';

const STEPS = [
  { id: 1, label: 'Destination' },
  { id: 2, label: 'Duration' },
  { id: 3, label: 'Travelers' },
  { id: 4, label: 'Itinerary' },
];

export default function WizardHeader() {
  const { step, setStep } = usePlannerStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleStepClick = (id) => {
    if (id <= step) setStep(id);
  };

  return (
    <header className="planner-navbar">

      {/* LEFT — Logo */}
      <div className="pn-logo" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="RoamG" className="pn-logo-img" />
      </div>

      {/* CENTER — Animated Step Indicator */}
      <nav className="pn-steps">
        {STEPS.map((s, index) => {
          const isActive = step === s.id;
          const isCompleted = step > s.id;

          return (
            <React.Fragment key={s.id}>
              <div className="pn-step-item">
                <button
                  onClick={() => handleStepClick(s.id)}
                  className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  disabled={!isCompleted && !isActive}
                  aria-label={`Step ${s.id}: ${s.label}`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : s.id}
                </button>
                <span className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {s.label}
                </span>
              </div>

              {/* Connector Line — fills crimson as steps complete */}
              {index < STEPS.length - 1 && (
                <div className={`step-line ${step > s.id ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* RIGHT — User pill + Close */}
      <div className="pn-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <NavUserPill />
        <button
          className="pn-close-btn"
          onClick={() => navigate('/')}
          aria-label="Exit planner"
        >
          <X size={18} />
        </button>
      </div>

    </header>
  );
}
