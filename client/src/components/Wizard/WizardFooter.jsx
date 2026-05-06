import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlannerStore from '../../store/usePlannerStore';

const WizardFooter = () => {
  const { step, setStep, isValid } = usePlannerStore();
  const valid = isValid();
  const navigate = useNavigate();

  // On step 4, ItineraryBuilder renders its own full dock — hide wizard footer
  if (step === 4) return null;

  const handleNext = () => {
    if (valid && step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGoHome = () => navigate('/');

  return (
    <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-[100] flex flex-col items-center gap-4">

      {/* Tooltip for invalid state */}
      {!valid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur text-primary text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.15em] border border-black/5 shadow-sm pointer-events-none mb-1"
        >
          Please select a vibe to continue
        </motion.div>
      )}

      {/* Main navigation bar (Pill Shape inspired by Image 10) */}
      <div className="w-full bg-[#000000] text-white rounded-full px-4 py-3 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">

        {/* Back Arrow */}
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            step === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'
          }`}
          title="Previous step"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Center: Main Call to Action Button */}
        <button
          onClick={handleNext}
          disabled={!valid}
          className={`flex-1 max-w-[280px] h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 mx-4 ${
            valid
              ? 'bg-white text-black hover:bg-white/95 cursor-pointer shadow-lg shadow-white/5'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {step === 3 ? (
            <>
              Review Itinerary <span className="text-base">→</span>
            </>
          ) : (
            <>
              Continue <span className="text-base">→</span>
            </>
          )}
        </button>

        {/* Forward Arrow */}
        <button
          onClick={handleNext}
          disabled={!valid}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            !valid ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 active:scale-90'
          }`}
          title="Next step"
        >
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Return to Home link */}
      <button
        onClick={handleGoHome}
        className="flex items-center gap-2 text-[10px] font-bold text-primary/30 hover:text-primary/60 uppercase tracking-[0.2em] transition-all py-1 group"
      >
        <Home size={11} className="group-hover:scale-110 transition-transform" />
        Return to Home
      </button>
    </footer>
  );
};

export default WizardFooter;
