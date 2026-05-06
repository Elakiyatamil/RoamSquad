import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardHeader from '../../components/Wizard/WizardHeader';
import WizardFooter from '../../components/Wizard/WizardFooter';
import Step1Destination from '../../components/Wizard/Steps/Step1Destination';
import Step2Timeline from '../../components/Wizard/Steps/Step2Timeline';
import Step3Travelers from '../../components/Wizard/Steps/Step3Travelers';
import Step4Itinerary from '../../components/Wizard/Steps/Step4Itinerary';
import usePlannerStore from '../../store/usePlannerStore';

// Slide direction variants
const variants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const STEP_COMPONENTS = [
  Step1Destination,
  Step2Timeline,
  Step3Travelers,
  Step4Itinerary,
];

const PlannerPage = () => {
  const { step, setStep } = usePlannerStore();
  const [prevStep, setPrevStep] = React.useState(step);
  const direction = step >= prevStep ? 1 : -1;

  // Sync prevStep so we know transition direction
  useEffect(() => {
    setPrevStep(step);
  }, [step]);

  const StepComponent = STEP_COMPONENTS[step - 1];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#F5F5F0', fontFamily: "'Outfit', 'Open Sans', 'Inter', sans-serif" }}
    >
      {/* Organic Wave SVG Background */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <path
          d="M-200,200 Q300,100 700,250 T1600,200 T2400,220"
          fill="none"
          stroke="#800020"
          strokeWidth="1.2"
          opacity="0.12"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0,0"
            to="-800,0"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M-200,450 Q400,350 800,500 T1700,440 T2500,460"
          fill="none"
          stroke="#000000"
          strokeWidth="0.8"
          opacity="0.06"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0,0"
            to="-800,0"
            dur="28s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M-200,700 Q350,600 750,730 T1650,680 T2450,700"
          fill="none"
          stroke="#800020"
          strokeWidth="1"
          opacity="0.08"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0,0"
            to="-800,0"
            dur="35s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Persistent Header */}
      <WizardHeader />

      {/* Main Scrollable Step Area */}
      <div
        className="relative z-10 min-h-screen overflow-hidden"
        style={{ paddingTop: '80px', paddingBottom: '120px' }}
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
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Footer */}
      <WizardFooter />
    </div>
  );
};

export default PlannerPage;
