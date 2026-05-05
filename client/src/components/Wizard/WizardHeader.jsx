import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlannerStore from '../../store/usePlannerStore';
import useAuthStore from '../../store/authStore';

const WizardHeader = () => {
  const { step, setStep } = usePlannerStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const sections = [
    { id: 1, label: 'Destination' },
    { id: 2, label: 'Duration' },
    { id: 3, label: 'Travelers' },
    { id: 4, label: 'Itinerary' },
  ];

  const handleStepClick = (s) => {
    if (s < step) setStep(s);
  };

  const handleClose = () => navigate('/');

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] bg-bg-cream/80 backdrop-blur-md border-b border-black/5 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">

        {/* Logo */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h1 className="text-xl font-display font-bold tracking-tighter select-none">RoamG</h1>
        </div>

        {/* Progress Navigation */}
        <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {sections.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(s.id)}
                disabled={!isCompleted && !isActive}
                className={`relative py-1 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-primary font-bold'
                    : isCompleted
                    ? 'text-primary/50 hover:text-primary cursor-pointer'
                    : 'text-primary/25 cursor-not-allowed'
                }`}
              >
                <span className="mr-1.5 opacity-40 text-xs">{s.id}.</span>
                {s.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent-maroon"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Profile + Close */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* User badge */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-black/5">
              <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">
                {user.name || 'kenny'}
              </span>
              <div className="w-6 h-6 rounded-full bg-accent-maroon/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent-maroon uppercase">
                  {(user.name || 'k').charAt(0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden md:block w-8 h-8 rounded-full bg-black/5 border border-black/10" />
          )}

          {/* Close → Home */}
          <button
            onClick={handleClose}
            title="Return to Home"
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 border border-black/8 flex items-center justify-center transition-all active:scale-90 group"
          >
            <X size={16} className="text-primary/60 group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden mt-3 h-[2px] w-full bg-black/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(step / sections.length) * 100}%` }}
          className="h-full bg-accent-maroon rounded-full"
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>
    </header>
  );
};

export default WizardHeader;
