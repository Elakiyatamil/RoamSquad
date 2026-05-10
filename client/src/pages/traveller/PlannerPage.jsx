import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WizardHeader from '../../components/Wizard/WizardHeader';
import WizardFooter from '../../components/Wizard/WizardFooter';
import Step1Destination from '../../components/Wizard/Steps/Step1Destination';
import Step2Timeline from '../../components/Wizard/Steps/Step2Timeline';
import Step3Travelers from '../../components/Wizard/Steps/Step3Travelers';
import Step4Itinerary from '../../components/Wizard/Steps/Step4Itinerary';
import usePlannerStore from '../../store/usePlannerStore';

const variants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const STEPS = [Step1Destination, Step2Timeline, Step3Travelers, Step4Itinerary];

export default function PlannerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { step, updateData } = usePlannerStore();
  const prevStepRef = useRef(step);
  const [direction, setDirection] = React.useState(1);

  // Read vibe from location state on mount
  useEffect(() => {
    if (location.state && location.state.selectedVibe) {
      updateData({ vibe: location.state.selectedVibe });
      // Clear the state so it doesn't re-trigger on refresh or back navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, updateData]);

  useEffect(() => {
    setDirection(step >= prevStepRef.current ? 1 : -1);
    prevStepRef.current = step;
  }, [step]);

  const StepComponent = STEPS[step - 1] || STEPS[0];

  if (!StepComponent) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ fontFamily: 'Poppins', color: '#5C5C6E' }}>Loading your planner...</p>
    </div>
  );

  return (
    <div
      className="planner-page-root page-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        backgroundColor: '#FDFCF0',
        fontFamily: "'Inter', 'Canva Sans', sans-serif",
        paddingTop: '0 !important',
        marginTop: '0 !important',
      }}
    >
      {/* Subtle animated wave lines — matching RoamG reference */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        preserveAspectRatio="none"
      >
        <path
          d="M-200,220 Q300,120 800,260 T1800,220 T2800,240"
          fill="none"
          stroke="#800020"
          strokeWidth="1"
          opacity="0.09"
        >
          <animateTransform attributeName="transform" type="translate" from="0,0" to="-900,0" dur="22s" repeatCount="indefinite" />
        </path>
        <path
          d="M-200,460 Q400,360 900,500 T1900,445 T2800,465"
          fill="none"
          stroke="#000"
          strokeWidth="0.7"
          opacity="0.05"
        >
          <animateTransform attributeName="transform" type="translate" from="0,0" to="-900,0" dur="30s" repeatCount="indefinite" />
        </path>
        <path
          d="M-200,710 Q350,610 850,740 T1850,690 T2800,715"
          fill="none"
          stroke="#800020"
          strokeWidth="0.8"
          opacity="0.07"
        >
          <animateTransform attributeName="transform" type="translate" from="0,0" to="-900,0" dur="38s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* Persistent top breadcrumb header — sits below global nav */}
      <div style={{ position: 'sticky', top: '80px', zIndex: 50, background: 'rgba(253, 252, 240, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <WizardHeader />
      </div>

      {/* Step content area */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '24px',   /* below sticky header */
          paddingBottom: '120px', /* above fixed footer pill */
          minHeight: '80vh',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 320, damping: 32 },
              opacity: { duration: 0.18 },
            }}
            style={{ width: '100%' }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent bottom navigation pill */}
      <WizardFooter />
    </div>
  );
}
