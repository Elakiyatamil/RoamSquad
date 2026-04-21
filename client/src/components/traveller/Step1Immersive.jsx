import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * ROAMSQUAD PLANNER V10 - CINEMATIC "CLOUD-ENTRY" TRANSITION
 * --------------------------------------------------------
 * - Forward Camera Push (Scale 1.08)
 * - UI Blur & Depth Shift (Blur 6px, Opacity 0.7)
 * - Intensified 3D Snow Physics
 * - Volumetric Cloud Sweep (Soft White/Blue)
 * - Continuous Motion Flow
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
  const density = isTransitioning ? 2.5 : 1;
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
      sy: [0.4, 0.8, 1.6][i % 3], // base speed y
      sx: (0.2 + Math.random() * 0.3), // base speed x
      opacity: [0.2, 0.4, 0.7][i % 3],
      blur: [2, 0.5, 0][i % 3],
      depth: (i % 3) // 0: Far, 1: Mid, 2: Near
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        // Adjust speed based on depth and transitioning state
        const currentSpeedY = p.sy * (p.depth === 2 ? speedMult * 1.5 : speedMult);
        const currentSpeedX = p.sx * speedMult;
        
        ctx.beginPath();
        // Foreground particles slightly larger and brighter during transition
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
    const val = Math.round((((r % 360) + 360) % 360) / 360 * 50);
    return Math.max(0, Math.min(50, val));
  });

  useEffect(() => { rotation.set((value / 50) * 360); }, []);

  useEffect(() => {
    const unsub = currentDay.on("change", (v) => { if (v !== value) onChange(v); });
    return () => unsub();
  }, [currentDay, value, onChange]);

  return (
    <motion.div 
      animate={{ 
        scale: isTransitioning ? 0.9 : 1,
        opacity: isTransitioning ? 0.3 : 1,
        filter: isTransitioning ? 'blur(6px)' : 'blur(0px)'
      }}
      className="relative w-80 h-80 flex items-center justify-center"
    >
      <div className="absolute inset-0 rounded-full bg-orange-500/5 blur-[50px] pointer-events-none" />

      <motion.div 
        className="relative w-72 h-72 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={(e, info) => { rotation.set(rotation.get() + info.delta.x * 0.5); }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
          {Array.from({ length: 50 }).map((_, i) => (
            <line 
              key={i}
              x1="50" y1="2" x2="50" y2={i % 5 === 0 ? "6" : "4"}
              stroke={i % 5 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.4)"}
              strokeWidth="0.5"
              transform={`rotate(${(i / 50) * 360}, 50, 50)`}
            />
          ))}
        </svg>

        <motion.div 
          className="absolute w-0.5 h-full flex flex-col items-center pointer-events-none"
          style={{ rotate: smoothRotation }}
        >
           <div className="w-[2px] h-[48%] flex flex-col items-center">
              <div className="w-full h-5 bg-[#E85D04] rounded-t-full shadow-[0_0_12px_rgba(232,93,4,0.8)]" />
              <div className="w-full flex-grow bg-white/40" />
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
              className="text-8xl font-serif italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs tracking-[0.4em] uppercase opacity-40 -mt-2">Days</span>
        </div>
        <div className="absolute inset-8 rounded-full border border-white/5 backdrop-blur-[2px] pointer-events-none z-10" />
      </motion.div>
    </motion.div>
  );
};

const TypographyScroller = ({ selected, onSelect, isTransitioning }) => {
  const options = ["FRIENDS", "COUPLE", "FAMILY", "SOLO", "STRANGERS"];
  const containerRef = useRef(null);

  return (
    <motion.div 
      animate={{ 
        opacity: isTransitioning ? 0 : 1,
        y: isTransitioning ? 20 : 0
      }}
      className="w-full flex flex-col items-center space-y-6"
    >
      <div 
        ref={containerRef}
        className="flex items-center gap-16 md:gap-24 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[42%] w-full transition-all duration-700"
      >
        {options.map((opt) => (
          <motion.div
            key={opt}
            onClick={() => onSelect(opt)}
            className="flex-shrink-0 cursor-pointer snap-center py-4"
            animate={{
              scale: selected === opt ? 1.15 : 0.7,
              opacity: selected === opt ? 1 : 0.3,
              filter: selected === opt ? 'drop-shadow(0 0 15px rgba(255,255,255,0.4))' : 'none'
            }}
          >
            <span 
              className="text-4xl md:text-7xl font-bold tracking-tighter text-white"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {opt}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const VolumetricClouds = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
        >
            {/* VOLUMETRIC GRADIENT BASE */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-blue-50/40 to-transparent blur-3xl opacity-90" />
            
            {/* INDIVIDUAL SOFT CLOUD NODES */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [1, 2.8],
                  opacity: [0, 0.7, 0],
                  y: [-100, -800],
                  x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 800]
                }}
                transition={{ duration: 1.4, delay: i * 0.04, ease: "easeOut" }}
                className="absolute bg-white/60 rounded-full blur-[140px]"
                style={{ 
                  width: 500 + i * 100,
                  height: 400 + i * 100,
                  left: `${Math.random() * 100}%`,
                  top: `100%`,
                }}
              />
            ))}

            {/* WHITEOUT HOLDER */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-3xl"
            />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Step1Immersive = ({ config, setConfig, onNext }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = () => {
    setIsTransitioning(true);
    // Sequence timing
    // 0ms: Scale + Blur Start
    // 0-800ms: Snow intensifying + Fog Rising
    // 1000ms: Whiteout Hold
    // 1400ms: Transition to next page
    setTimeout(() => onNext(), 1500);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black flex flex-col items-center">
      {/* 1. MOUNTAIN BACKGROUND (FORWARD PUSH) */}
      <motion.div 
        animate={{ 
            scale: isTransitioning ? 1.08 : 1,
            opacity: isTransitioning ? 0 : 1,
            y: isTransitioning ? -20 : 0
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-12 md:p-16">
        
        {/* LEFT-ALIGNED QUESTION (BLUR ON TRANSITION) */}
        <motion.div 
           animate={{ 
             opacity: isTransitioning ? 0.6 : 0.9,
             filter: isTransitioning ? 'blur(6px)' : 'blur(0px)',
             x: isTransitioning ? -20 : 0
           }}
           className="w-full max-w-7xl flex justify-start"
        >
          <div className="flex flex-col space-y-6">
            <h2 
              className="text-white font-serif italic text-5xl md:text-7xl text-left leading-[1.05]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              How many <span className="relative inline-block">days<SwirlUnderline delay={0.5} /></span> shall <br/> 
              your <span className="relative inline-block">story<SwirlUnderline delay={1.2} /></span> span?
            </h2>
            <div className="w-24 h-[1px] bg-white/20" />
          </div>
        </motion.div>

        {/* CENTER COMPASS */}
        <MinimalCompass 
            value={config.days || 3} 
            onChange={(d) => setConfig(prev => ({ ...prev, days: d }))} 
            isTransitioning={isTransitioning}
        />

        {/* BOTTOM SELECTION & ARROW CTA */}
        <div className="w-full flex flex-col items-center space-y-12 pb-10">
          <TypographyScroller 
            selected={config.travelType}
            onSelect={(t) => setConfig(prev => ({ ...prev, travelType: t }))}
            isTransitioning={isTransitioning}
          />

          {/* ASYMMETRIC ARROW PIVOT */}
          <motion.div 
             animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
             className="flex flex-col items-center translate-y-6 translate-x-4"
          >
            <motion.button
              whileHover={{ x: 5, color: '#FF9500' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleContinue}
              className="group flex flex-col items-center justify-center text-white/50 transition-colors"
            >
               <span className="text-5xl md:text-7xl font-thin scale-x-150 tracking-[-0.2em] transform transition-all group-hover:text-white drop-shadow-xl">→</span>
               <span className="text-[10px] uppercase tracking-[0.6em] opacity-40 mt-2 font-bold group-hover:opacity-100">Roam</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* CLOUD FOG TRANSITION (VOLUMETRIC SWEEP) */}
      <VolumetricClouds active={isTransitioning} />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Step1Immersive;
