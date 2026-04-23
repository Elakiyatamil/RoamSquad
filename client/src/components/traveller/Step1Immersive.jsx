import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * ROAMSQUAD PLANNER V10.3 - PRECISION RADIAL DIAL
 */

const SwirlUnderline = ({ delay = 0 }) => (
  <svg 
    viewBox="0 0 100 20" 
    className="absolute -bottom-2 left-0 w-full overflow-visible pointer-events-none"
    style={{ height: '20px' }}
  >
    <motion.path
      d="M 0 10 Q 25 -5, 50 10 T 100 10"
      fill="none"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: [0, 0.5, 0.2, 0.5] 
      }}
      transition={{ 
        duration: 2.5, 
        delay, 
        repeat: Infinity, 
        repeatType: "mirror",
        ease: "easeInOut"
      }}
    />
  </svg>
);

const SnowEngine = ({ isTransitioning }) => {
  const canvasRef = useRef(null);
  const speedMult = isTransitioning ? 3 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 80 * 2.5 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.3,
      sy: [0.4, 0.8, 1.6][i % 3], 
      sx: (0.2 + Math.random() * 0.3), 
      opacity: [0.2, 0.4, 0.7][i % 3],
      blur: [2, 0.5, 0][i % 3],
      depth: (i % 3)
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        const currentSpeedY = p.sy * (p.depth === 2 ? speedMult * 1.5 : speedMult);
        const currentSpeedX = p.sx * speedMult;
        
        ctx.beginPath();
        const currentR = isTransitioning && p.depth === 2 ? p.r * 1.5 : p.r;
        const currentOpacity = isTransitioning && p.depth === 2 ? Math.min(1, p.opacity * 1.5) : p.opacity;

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.shadowBlur = p.blur;
        ctx.shadowColor = "white";
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.fill();

        p.y += currentSpeedY;
        p.x += currentSpeedX;

        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
        if (p.x > W + 10) { p.x = -10; }
      });
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);
    const animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, [isTransitioning, speedMult]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[15] pointer-events-none" />;
};

const MinimalCompass = ({ value, onChange, isTransitioning }) => {
  const containerRef = useRef(null);
  const minDays = 1;
  const maxDays = 60;
  
  // Calculate initial angle based on value
  const initialAngle = ((value - minDays) / (maxDays - minDays)) * 360;
  const rotation = useMotionValue(initialAngle);
  
  // Needle with smooth spring physics
  const springRotation = useSpring(rotation, { damping: 25, stiffness: 150 });

  const handleInteraction = (e) => {
    if (!containerRef.current || isTransitioning) return;
    
    // Get client coordinates for both touch and mouse
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle in radians, then convert to degrees
    // Adjusted so 0 degrees is at the top (negative-y axis)
    let angleRad = Math.atan2(clientY - centerY, clientX - centerX);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    
    // Normalize to 0-360 range
    if (angleDeg < 0) angleDeg += 360;
    
    // Calculate value based on angle
    let newVal = Math.round(minDays + (angleDeg / 360) * (maxDays - minDays));
    
    // BUFFER FIX: Make '1 day' easier to hit on mobile (first 6 degrees = 1 day)
    if (angleDeg < 6) newVal = minDays;
    
    // STRICT MINIMUM FIX: Ensure mobile touch points don't clamp to 2
    const clampedVal = Math.max(minDays, Math.min(maxDays, newVal));
    
    // Update rotation and internal state
    if (clampedVal !== value) {
      onChange(clampedVal);
    }
    
    // For manual rotation update, we use requestAnimationFrame to sync with browser
    requestAnimationFrame(() => {
      const targetRotation = ((clampedVal - minDays) / (maxDays - minDays)) * 360;
      rotation.set(targetRotation);
    });
  };

  const handlePointerDown = (e) => {
    handleInteraction(e);
    const onPointerMove = (moveEvent) => handleInteraction(moveEvent);
    const onPointerUp = () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
    
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  // Sync rotation when value changes externally
  useEffect(() => {
    const targetRotation = ((value - minDays) / (maxDays - minDays)) * 360;
    rotation.set(targetRotation);
  }, [value]);

  return (
    <motion.div 
      ref={containerRef}
      animate={{ 
        scale: isTransitioning ? 0.9 : 1,
        opacity: isTransitioning ? 0.3 : 1
      }}
      onPointerDown={handlePointerDown}
      className="relative w-[clamp(220px,30vw,380px)] aspect-square flex items-center justify-center my-8 md:my-0 select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* GLOWING AMBIENT RING */}
      <div className="absolute inset-0 rounded-full bg-orange-500/10 shadow-[0_0_60px_rgba(255,255,255,0.1)] blur-[40px] pointer-events-none" />

      {/* DIAL BASE */}
      <div className="relative w-full h-full rounded-full flex items-center justify-center cursor-pointer z-20">
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          {/* Main Ring - High Contrast */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
          
          <defs>
            <radialGradient id="inner-glow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#inner-glow)" />

          {/* Precision Ticks (60 days) */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isMajor = (i + 1) % 5 === 0 || i === 0;
            return (
              <line 
                key={i}
                x1="50" y1="2" x2="50" y2={isMajor ? "7" : "4"}
                stroke={isMajor ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
                strokeWidth={isMajor ? "0.6" : "0.3"}
                transform={`rotate(${(i / 60) * 360}, 50, 50)`}
              />
            );
          })}
        </svg>

        {/* ROTATING NEEDLE */}
        <motion.div 
          className="absolute w-1 h-[96%] flex flex-col items-center pointer-events-none"
          style={{ rotate: springRotation }}
        >
           <div className="w-[3px] h-[50%] flex flex-col items-center">
              <div className="w-full h-6 bg-[#E85D04] rounded-t-full shadow-[0_0_20px_rgba(255,149,0,1)]" />
              <div className="w-full flex-grow bg-white/95 shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
           </div>
           <div className="w-[1.5px] h-[48%] bg-white/10 mt-auto" />
        </motion.div>

        {/* CENTER VALUE DISPLAY */}
        <div className="flex flex-col items-center justify-center text-white pointer-events-none select-none z-30">
          <AnimatePresence mode="wait">
            <motion.span 
              key={value}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="font-serif italic drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] text-[#FFFFFF]"
              style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: "clamp(80px, 12vw, 140px)",
                fontWeight: 600
              }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-[12px] md:text-sm tracking-[0.5em] font-bold uppercase opacity-80 -mt-2 md:-mt-6 text-gold">Days</span>
        </div>
        
        {/* INNER DECORATIVE RING */}
        <div className="absolute inset-6 sm:inset-10 rounded-full border border-white/15 backdrop-blur-[3px] pointer-events-none z-10 shadow-[inset_0_0_25px_rgba(255,255,255,0.08)]" />
      </div>
    </motion.div>
  );
};

const TypographyScroller = ({ selected, onSelect, isTransitioning }) => {
  const options = ["FRIENDS", "COUPLE", "FAMILY", "SOLO", "STRANGERS", "GIRLS TRIP"];

  return (
    <motion.div 
      animate={{ 
        opacity: isTransitioning ? 0 : 1,
        y: isTransitioning ? 20 : 0
      }}
      className="w-full"
    >
      <div 
        className="flex flex-row flex-wrap justify-center items-center gap-[12px] md:gap-8 px-[16px] md:px-[10vw]"
      >
        {options.map((opt) => {
           const isSelected = selected === opt;
           return (
             <motion.div
               key={opt}
               onClick={() => onSelect(opt)}
               className="flex-shrink-0 cursor-pointer flex justify-center items-center py-2 relative"
               animate={{
                 scale: isSelected ? 1.1 : 1,
                 opacity: isSelected ? 1 : 0.5,
               }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
             >
               <span 
                 className="text-[clamp(12px,3.5vw,15px)] md:text-6xl font-bold tracking-tighter text-white transition-all text-center"
                 style={{ 
                    fontFamily: "'Barlow Condensed', sans-serif",
                    textShadow: isSelected ? '0 0 20px rgba(255,255,255,0.5)' : 'none'
                 }}
               >
                 {opt}
               </span>
               {isSelected && (
                 <motion.div
                   layoutId="activeUnderline"
                   className="absolute -bottom-1 left-1/4 right-1/4 h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full"
                 />
               )}
             </motion.div>
           )
        })}
      </div>
    </motion.div>
  );
};

const EnergySweep = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div 
          initial={{ left: "-20vw" }}
          animate={{ left: "120vw" }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
          className="fixed top-0 bottom-0 w-[4px] bg-white shadow-[0_0_20px_4px_rgba(200,220,255,0.8)] z-[100] blur-[2px] pointer-events-none"
          style={{ transform: "skewX(-15deg)" }}
        >
           <div className="absolute inset-0 bg-blue-100/50 w-[12px] blur-[8px] -ml-[4px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Step1Immersive = ({ config, setConfig, onNext }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => onNext(), 800);
  };

  return (
    <motion.div 
      initial={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 w-full h-full overflow-hidden bg-black flex flex-col items-center"
    >
      {/* 1. MOUNTAIN BACKGROUND (FORWARD PUSH) */}
      <motion.div 
        animate={{ 
            scale: isTransitioning ? 1.05 : 1,
            opacity: 1,
            y: 0
        }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')`,
          filter: 'brightness(0.55)'
        }}
      />

      {/* 2. HUGE BACKGROUND WORD */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-1 overflow-hidden">
        <motion.h1 
          animate={{ opacity: isTransitioning ? 0 : 0.06 }}
          className="text-white font-bold leading-none text-[25vw] tracking-tighter"
          style={{ fontFamily: "'Cormorant Garamond', serif", filter: 'blur(1px)' }}
        >
          ROAMSQUAD
        </motion.h1>
      </div>

      {/* 3. ATMOSPHERIC ELEMENTS (DYNAMIC SNOW) */}
      <SnowEngine isTransitioning={isTransitioning} />
      <div className="absolute inset-0 z-[6] bg-gradient-to-t from-black/40 md:from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* 4. CONTENT LAYER */}
      <motion.div 
         animate={{ opacity: isTransitioning ? [1, 0.8, 0] : 1 }}
         transition={{ duration: 0.8, times: [0, 0.4, 1] }}
         className="relative z-10 w-full h-[100dvh] flex flex-col md:p-12 lg:p-16"
      >
        {/* TOP SECTION (20% height on mobile) */}
        <div className="w-full flex h-[20vh] md:h-auto items-end md:items-start pt-[60px] md:pt-0 justify-center md:justify-start">
          <div className="flex flex-col space-y-4 w-full md:max-w-7xl items-center md:items-start">
            <h2 
              className="text-white font-serif italic text-center md:text-left text-[clamp(22px,5vw,32px)] md:text-[clamp(24px,5vw,48px)] leading-[1.3] md:leading-[1.05] max-w-[80%] md:max-w-full mx-auto md:mx-0"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              How many <span className="relative inline-block">days<SwirlUnderline delay={0.5} /></span> shall <br className="md:hidden"/>
              <span className="hidden md:inline">&nbsp;</span>your <span className="relative inline-block">story<SwirlUnderline delay={1.2} /></span> span?
            </h2>
            <div className="w-16 md:w-24 h-[1px] bg-white/20 hidden md:block" />
          </div>
        </div>

        {/* CENTER COMPASS (55% height on mobile) */}
        <div className="h-[55vh] md:flex-grow w-full flex items-center justify-center">
          <MinimalCompass 
              value={config.days || 1} 
              onChange={(d) => setConfig(prev => ({ ...prev, days: d }))} 
              isTransitioning={isTransitioning}
          />
        </div>

        {/* BOTTOM SELECTION & ARROW CTA (25% height on mobile) */}
        <div className="h-[25vh] md:h-auto w-full flex flex-col justify-center relative pb-8 md:pb-0">
          {/* NEW SECTION HEADING */}
          <div className="w-full flex justify-center mb-4 md:mb-8">
            <h2 
              className="text-white font-serif italic text-center text-[clamp(20px,4vw,28px)] md:text-[clamp(24px,4vw,36px)] leading-tight opacity-90"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              How about your <span className="relative inline-block">crew?<SwirlUnderline delay={1.8} /></span>
            </h2>
          </div>

          <TypographyScroller 
            selected={config.travelType}
            onSelect={(t) => setConfig(prev => ({ ...prev, travelType: t }))}
            isTransitioning={isTransitioning}
          />

          {/* ASYMMETRIC ARROW PIVOT */}
          <motion.div 
             animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
             className="fixed bottom-[20px] right-[20px] md:absolute md:right-12 md:bottom-0 translate-y-0 z-[60] flex flex-col items-center"
          >
            <motion.button
              whileHover={{ x: 5, color: '#FF9500' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleContinue}
              className="group flex flex-col items-center justify-center text-white transition-colors bg-[#1a3c2b] md:bg-transparent rounded-full md:rounded-none w-14 h-14 md:w-auto md:h-auto shadow-lg md:shadow-none border border-white/20 md:border-transparent"
            >
               <span className="text-[32px] md:text-7xl font-thin scale-x-150 tracking-[-0.2em] transform transition-all group-hover:text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none flex items-center justify-center h-[32px] md:h-auto">→</span>
               <span className="hidden md:block text-[10px] uppercase tracking-[0.6em] opacity-80 mt-1 md:mt-2 font-bold group-hover:opacity-100">Roam</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* ENERGY SWEEP TRANSITION */}
      <EnergySweep active={isTransitioning} />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default Step1Immersive;
