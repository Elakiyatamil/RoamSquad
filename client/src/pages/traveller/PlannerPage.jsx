import React, { useEffect, useRef } from 'react';
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
  const { step } = usePlannerStore();
  const prevStepRef = useRef(step);
  const [direction, setDirection] = React.useState(1);

  useEffect(() => {
    setDirection(step >= prevStepRef.current ? 1 : -1);
    prevStepRef.current = step;
  }, [step]);

  const StepComponent = STEPS[step - 1];

  return (
    <div
      className="planner-page-root"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#FDFCF0',
        fontFamily: "'Inter', 'Canva Sans', sans-serif",
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

      {/* Persistent top breadcrumb header */}
      <WizardHeader />

      {/* Step content area */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '72px',   /* below fixed header */
          paddingBottom: '120px', /* above fixed footer pill */
          minHeight: '100vh',
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
