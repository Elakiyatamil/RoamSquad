import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * ROAMSQUAD PLANNER V10.1 - REFINED RESPONSIVE & SWEEP TRANSITION
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
  const rotation = useMotionValue(0);
  const smoothRotation = useSpring(rotation, { damping: 30, stiffness: 100 });
  
  const currentDay = useTransform(smoothRotation, (r) => {
    let normalizedR = ((r % 360) + 360) % 360;
    const val = Math.floor((normalizedR / 360) * 50) + 1;
    return Math.max(1, Math.min(50, val));
  });

  useEffect(() => { rotation.set(((value - 1) / 50) * 360); }, []);

  useEffect(() => {
    const unsub = currentDay.on("change", (v) => { if (v !== value) onChange(v); });
    return () => unsub();
  }, [currentDay, value, onChange]);

  return (
    <motion.div 
      animate={{ 
        scale: isTransitioning ? 0.9 : 1,
        opacity: isTransitioning ? 0.3 : 1
      }}
      className="relative w-[70vw] max-w-[320px] aspect-square flex items-center justify-center my-8 md:my-0"
    >
      <div className="absolute inset-0 rounded-full bg-orange-500/20 shadow-[0_0_40px_rgba(255,255,255,0.15)] blur-[40px] pointer-events-none" />

      <motion.div 
        className="relative w-full h-full rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={(e, info) => { rotation.set(rotation.get() + info.delta.x * 0.5); }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
          <circle cx="50" cy="50" r="48" fill="url(#inner-glow)" pointerEvents="none" />
          <defs>
            <radialGradient id="inner-glow" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
            </radialGradient>
          </defs>
          {Array.from({ length: 50 }).map((_, i) => (
            <line 
              key={i}
              x1="50" y1="2" x2="50" y2={i % 5 === 0 ? "6" : "4"}
              stroke={i % 5 === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"}
              strokeWidth="0.5"
              transform={`rotate(${(i / 50) * 360}, 50, 50)`}
            />
          ))}
        </svg>

        <motion.div 
          className="absolute w-1 h-[96%] flex flex-col items-center pointer-events-none"
          style={{ rotate: smoothRotation }}
        >
           <div className="w-[3px] h-[50%] flex flex-col items-center">
              <div className="w-full h-6 bg-[#E85D04] rounded-t-full shadow-[0_0_15px_rgba(255,149,0,1)]" />
              <div className="w-full flex-grow bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
           </div>
           <div className="w-[1.5px] h-[48%] bg-white/10 mt-auto" />
        </motion.div>

        <div className="flex flex-col items-center justify-center text-white pointer-events-none select-none z-30">
          <AnimatePresence mode="wait">
            <motion.span 
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="font-serif italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] text-[#FFFFFF]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(64px, 15vw, 128px)" }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase opacity-60 -mt-2 md:-mt-4">Days</span>
        </div>
        <div className="absolute inset-4 sm:inset-8 rounded-full border border-white/10 backdrop-blur-[2px] pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
      </motion.div>
    </motion.div>
  );
};

const TypographyScroller = ({ selected, onSelect, isTransitioning }) => {
  const options = ["FRIENDS", "COUPLE", "FAMILY", "SOLO", "STRANGERS"];

  return (
    <motion.div 
      animate={{ 
        opacity: isTransitioning ? 0 : 1,
        y: isTransitioning ? 20 : 0
      }}
      className="w-full flex flex-col items-center"
    >
      <div 
        className="flex items-center space-x-4 md:space-x-8 overflow-x-auto hide-scrollbar snap-x snap-mandatory w-full max-w-full px-[10vw] pb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {options.map((opt) => {
           const isSelected = selected === opt;
           return (
             <motion.div
               key={opt}
               onClick={() => onSelect(opt)}
               className="flex-shrink-0 cursor-pointer snap-center flex justify-center items-center py-2 min-w-[120px] sm:min-w-[160px] relative"
               animate={{
                 scale: isSelected ? 1.15 : 1,
                 opacity: isSelected ? 1 : 0.4,
               }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
             >
               <span 
                 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-white transition-all"
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
          className="fixed top-0 bottom-0 w-[4px] bg-white shadow-[0_0_20px_4px_rgba(200,220,255,0.8)] z-[100] pointer-events-none blur-[2px]"
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
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black flex flex-col items-center">
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
      <div className="absolute inset-0 z-[6] bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* 4. CONTENT LAYER */}
      <motion.div 
         animate={{ opacity: isTransitioning ? [1, 0.8, 0] : 1 }}
         transition={{ duration: 0.8, times: [0, 0.4, 1] }}
         className="relative z-10 w-full h-[100dvh] flex flex-col items-center justify-between p-6 md:p-12 lg:p-16"
      >
        {/* LEFT-ALIGNED QUESTION */}
        <motion.div 
           className="w-full max-w-7xl flex justify-start"
        >
          <div className="flex flex-col space-y-4 md:space-y-6 pt-4 md:pt-0">
            <h2 
              className="text-white font-serif italic text-left leading-[1.05]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(24px, 5vw, 48px)" }}
            >
              How many <span className="relative inline-block">days<SwirlUnderline delay={0.5} /></span> shall <br/> 
              your <span className="relative inline-block">story<SwirlUnderline delay={1.2} /></span> span?
            </h2>
            <div className="w-16 md:w-24 h-[1px] bg-white/20" />
          </div>
        </motion.div>

        {/* CENTER COMPASS */}
        <div className="flex-grow flex items-center justify-center w-full min-h-[300px]">
          <MinimalCompass 
              value={config.days || 1} 
              onChange={(d) => setConfig(prev => ({ ...prev, days: d }))} 
              isTransitioning={isTransitioning}
          />
        </div>

        {/* BOTTOM SELECTION & ARROW CTA */}
        <div className="w-full flex flex-col items-center space-y-6 md:space-y-12 pb-24 sm:pb-16 md:pb-10 relative">
          <TypographyScroller 
            selected={config.travelType}
            onSelect={(t) => setConfig(prev => ({ ...prev, travelType: t }))}
            isTransitioning={isTransitioning}
          />

          {/* ASYMMETRIC ARROW PIVOT */}
          <motion.div 
             animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
             className="flex flex-col items-center md:absolute md:right-12 md:bottom-0 translate-y-[-24px] sm:translate-y-[-10px] md:translate-y-0"
          >
            <motion.button
              whileHover={{ x: 5, color: '#FF9500' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleContinue}
              className="group flex flex-col items-center justify-center text-white/50 transition-colors"
            >
               <span className="text-4xl md:text-7xl font-thin scale-x-150 tracking-[-0.2em] transform transition-all group-hover:text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">→</span>
               <span className="text-[10px] uppercase tracking-[0.6em] opacity-40 mt-1 md:mt-2 font-bold group-hover:opacity-100">Roam</span>
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
    </div>
  );
};

export default Step1Immersive;
