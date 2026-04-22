import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Trash2, X, Leaf } from 'lucide-react';

/**
 * ROAMSQUAD PLANNER STEP 2 - "WANDER"
 * Elevated Redesign: Cinematic Vibe Selection & Dual-Question Expectations
 */

// Custom Vibe Icons from Master Prompt
const VibeIcon = ({ type, active }) => {
  const getPath = () => {
    switch (type) {
      case 'ADVENTUROUS':
        return (
          <>
            <path d="M20,6 L10,24 L20,32 L30,24 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <path d="M20,6 L20,32" stroke="white" strokeWidth="1.5" strokeDasharray="2 4" fill="none" opacity="0.6" />
            <path d="M14,21 L26,21" stroke="white" strokeWidth="1.5" fill="none" />
          </>
        );
      case 'LUXURY':
        return (
          <>
            <path d="M20,8 C20,16 12,20 12,20 C12,20 20,24 20,32 C20,24 28,20 28,20 C28,20 20,16 20,8 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <circle cx="20" cy="20" r="1.5" fill="white" />
          </>
        );
      case 'NATURE':
        return (
          <>
            <path d="M20,32 C20,32 10,24 10,14 C10,9 15,6 20,6 C25,6 30,9 30,14 C30,24 20,32 20,32 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <path d="M20,32 L20,14" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M20,22 L24,18" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
          </>
        );
      case 'CULTURAL':
        return (
          <>
            <path d="M10,30 L10,18 C10,12 15,8 20,8 C25,8 30,12 30,18 L30,30" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <path d="M14,30 L14,18 M26,30 L26,18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
            <line x1="6" y1="30" x2="34" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="18" r="1.5" fill="white" />
          </>
        );
      case 'SOCIAL':
        return (
          <>
            <circle cx="20" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="24" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="28" cy="24" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
            <path d="M18.5,14 L13.5,21.5 M21.5,14 L26.5,21.5 M14.5,24 L25.5,24" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
          </>
        );
      case 'MINIMALIST':
        return (
          <>
            <line x1="10" y1="14" x2="30" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="20" x2="24" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="12" y1="26" x2="28" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      default: return null;
    }
  };

  return (
    <svg width="36" height="36" viewBox="0 0 40 40" className="transition-transform duration-300">
      {getPath()}
    </svg>
  );
};

const VIBES = [
  { id: 'Adventurous', name: 'Adventurous', type: 'ADVENTUROUS' },
  { id: 'Luxury', name: 'Luxury / Mindful', type: 'LUXURY' },
  { id: 'Nature', name: 'Nature-Focused', type: 'NATURE' },
  { id: 'Cultural', name: 'Cultural Immersion', type: 'CULTURAL' },
  { id: 'Social', name: 'Social', type: 'SOCIAL' },
  { id: 'Minimalist', name: 'Minimalist', type: 'MINIMALIST' }
];

const SparkCanvas = ({ trigger }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const colors = ['#4ade80', '#54703a', '#bbf7d0', '#fff'];

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const count = 12;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: rect.width / 2,
        y: rect.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      });
    }

    let animationFrame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.current.splice(i, 1);
      });
      if (particles.current.length > 0) animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [trigger]);

  return <canvas ref={canvasRef} className="absolute inset-x-[-50px] inset-y-[-50px] pointer-events-none z-50" width={200} height={200} />;
};

const Step2Vibe = ({ config, setConfig, onNext, onBack }) => {
  const [selectedVibes, setSelectedVibes] = useState(config.vibes || []);
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const [waveDrawn, setWaveDrawn] = useState(false);
  const [ribbonDrawn, setRibbonDrawn] = useState(false);
  const [hasKids, setHasKids] = useState(!!config.kidsExpectations || config.children?.length > 1);
  const [localChildren, setLocalChildren] = useState(config.children || [{ age: '', name: '' }]);
  const [isExpFocused, setIsExpFocused] = useState(false);

  const waveLineRef = useRef(null);
  const ribbonRef = useRef(null);
  const vibeSectionRef = useRef(null);
  const [vibeSectionVisible, setVibeSectionVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaveDrawn(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVibeSectionVisible(true);
      }
    }, { threshold: 0.1 });
    if (vibeSectionRef.current) observer.observe(vibeSectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setRibbonDrawn(true);
    }, { threshold: 0.8 });
    if (ribbonRef.current) observer.observe(ribbonRef.current);
    return () => observer.disconnect();
  }, []);

  const handleVibeToggle = (id) => {
    setSparkTrigger(prev => prev + 1);
    const updated = selectedVibes.includes(id) 
      ? selectedVibes.filter(v => v !== id)
      : [...selectedVibes, id];
    setSelectedVibes(updated);
    setConfig(prev => ({ ...prev, vibes: updated }));
  };

  const updateChild = (idx, field, val) => {
    const updated = [...localChildren];
    updated[idx][field] = val;
    setLocalChildren(updated);
    setConfig(prev => ({ ...prev, children: updated }));
  };

  const handleAddChild = () => {
    const updated = [...localChildren, { age: '', name: '' }];
    setLocalChildren(updated);
    setConfig(prev => ({ ...prev, children: updated }));
  };

  const handleRemoveChild = (idx) => {
    if (localChildren.length <= 1) return;
    const updated = localChildren.filter((_, i) => i !== idx);
    setLocalChildren(updated);
    setConfig(prev => ({ ...prev, children: updated }));
  };

  return (
    <motion.div 
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ transform: "0.7s cubic-bezier(0.16,1,0.3,1)", opacity: "0.7s ease" }}
      className="fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col font-sans"
      style={{
        border: "none",
        outline: "none",
        boxShadow: "none",
        background: "transparent"
      }}
    >
      <section style={{
        position: "relative",
        width: "100%",
        height: "80vh",
        minHeight: "560px",
        overflow: "hidden",   // ← THIS IS CRITICAL
        border: "none",
        outline: "none",
        padding: "0",
        margin: "0",
      }}>

        {/* ── 1. Background photo ── */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1920&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          border: "none",
        }} />

        {/* ── 2. Dark gradient overlay ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.55) 100%)",
          border: "none",
        }} />

        {/* ── 3. Text content ── */}
        <div style={{
          position: "absolute",
          bottom: "120px",   // ← leave room for wave overlap
          left: "0", right: "0",
          padding: "0 48px",
          border: "none",
        }}>
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"14px",
            fontWeight:600, letterSpacing:"0.25em", color:"rgba(255,255,255,0.7)",
            textTransform:"uppercase", marginBottom:"8px" }}>
            DISCOVER YOUR
          </p>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
            fontSize:"clamp(80px,14vw,160px)", color:"white", lineHeight:0.9,
            letterSpacing:"-0.02em", marginBottom:"16px" }}>
            VIBE
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
            fontWeight:300, fontSize:"22px", color:"rgba(255,255,255,0.8)" }}>
            What kind of journey calls to your soul?
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
           4. WAVE SVG — position absolute at BOTTOM of hero
              This is what creates the flowing transition
              The white fill eats INTO the photo from below
           ══════════════════════════════════════════════════════════ */}
        <div style={{
          position: "absolute",
          bottom: "-2px",       // ← -2px closes any subpixel gap
          left: 0,
          right: 0,
          lineHeight: 0,
          border: "none",
          background: "transparent",
        }}>
          <svg
            viewBox="0 0 1440 130"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ width:"100%", display:"block", height:"130px" }}
          >
            {/* Main white wave fill — this IS the transition */}
            <path
              d="M0,70 C180,10 360,110 540,55 C720,0 900,90 1080,45 C1260,0 1380,80 1440,60 L1440,130 L0,130 Z"
              fill="white"
            />
            {/* Animated decorative line along wave crest */}
            <path
              d="M0,70 C180,10 360,110 540,55 C720,0 900,90 1080,45 C1260,0 1380,80 1440,60"
              stroke="rgba(134,239,172,0.5)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: "2400",
                strokeDashoffset: waveDrawn ? "0" : "2400",
                transition: "stroke-dashoffset 2.2s cubic-bezier(0.4,0,0.2,1) 0.5s",
              }}
            />
            {/* Soft glow band above the wave */}
            <path
              d="M0,70 C180,10 360,110 540,55 C720,0 900,90 1080,45 C1260,0 1380,80 1440,60"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

      </section>

      {/* SECTION 3: VIBE SELECTOR — immediately after, NO margin/padding top */}
      <section 
        ref={vibeSectionRef}
        className="px-12 py-16 flex flex-col items-center gap-12"
        style={{ 
          background: "linear-gradient(to bottom, #ffffff 0%, #f1f3ed 100%)",
          padding: "48px 48px 64px",
          marginTop: "0",       // ← NO gap between wave and this section
          paddingTop: "32px",   // ← small top padding only
          border: "none"
        }}
      >
        <div className="text-[#314022] font-bold tracking-[0.25em] text-[13px] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          MY VIBE IS...
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 flex-1">
          {VIBES.map((v, idx) => {
            const active = selectedVibes.includes(v.id);
            return (
              <motion.div 
                key={v.id} 
                className="flex flex-col items-center group cursor-pointer" 
                onClick={() => handleVibeToggle(v.id)}
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={vibeSectionVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: idx * 0.1, 
                  ease: [0.34, 1.56, 0.64, 1] 
                }}
                title={`Select ${v.name} vibe`}
              >
                <div 
                   className={`relative w-[90px] h-[90px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    active 
                    ? 'scale-[1.08] shadow-[0_0_24px_rgba(84,112,58,0.5),0_0_0_2px_rgba(84,112,58,0.7)] bg-gradient-to-br from-[#314022] to-[#54703a]' 
                    : 'bg-[#314022] group-hover:scale-[1.08] group-hover:shadow-[0_0_20px_rgba(84,112,58,0.3)]'
                  }`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
                >
                  <motion.div 
                    animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={active ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : {}}
                    className={`transition-all duration-300 ${!active && 'group-hover:brightness-110 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'}`}
                    style={{ filter: active ? 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' : 'none' }}
                  >
                    <VibeIcon type={v.type} active={active} />
                  </motion.div>
                  {active && <SparkCanvas trigger={sparkTrigger} />}
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span 
                    className={`uppercase font-bold tracking-[0.15em] transition-colors duration-300 ${active ? 'text-[#54703a]' : 'text-[#314022]'}`}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '12px', fontWeight: 800 }}
                  >
                    {v.name}
                  </span>
                  {active && (
                    <motion.div 
                      layoutId="vibe-indicator"
                      className="w-[4px] h-[4px] rounded-full bg-[#54703a] mt-1"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: DESTINATION RIBBON */}
      <div ref={ribbonRef} className="relative w-full h-[300px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80')`,
            backgroundPosition: "center 40%"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(0,0,0,0.15)] to-[rgba(0,0,0,0.6)]" />
        
        <svg viewBox="0 0 1440 300" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          <path d="M-50,220 C250,100 550,280 850,150 C1150,20 1300,200 1490,120"
            stroke="rgba(255,255,255,0.15)" strokeWidth="18" fill="none"
            strokeLinecap="round"/>
          
          <motion.path d="M-50,220 C250,100 550,280 850,150 C1150,20 1300,200 1490,120"
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: ribbonDrawn ? "3000" : "3000",
              strokeDashoffset: ribbonDrawn ? "0" : "3000",
              transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)"
            }}/>
          
          <motion.polygon points="850,143 857,150 850,157 843,150"
            fill="rgba(255,255,255,0.75)"
            initial={{ scale: 0, opacity: 0 }}
            animate={ribbonDrawn ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 1.5 }}/>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-6">
          <span className="uppercase font-semibold tracking-[0.22em] text-white/60 text-[12px]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            YOUR JOURNEY EXPECTATIONS
          </span>
          <h2 
            className="mt-2 text-white italic font-semibold leading-tight" 
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 4.5vw, 48px)' }}
          >
            What would make this trip perfect?
          </h2>
        </div>
      </div>

      {/* SECTION 5: EXPECTATIONS FORM */}
      <div className="bg-[#fdfaf5] px-12 py-[52px] flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* QUESTION 1 */}
          <motion.div 
            animate={{ scale: isExpFocused ? 1.01 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full relative group space-y-4"
          >
            <div className="relative pt-6">
              <motion.label 
                animate={{
                  y: isExpFocused || config.generalExpectations?.length > 0 ? -28 : 8,
                  opacity: isExpFocused || config.generalExpectations?.length > 0 ? 1 : 0
                }}
                className="absolute left-1 top-6 text-[#314022] text-[11px] font-bold tracking-[0.18em] uppercase pointer-events-none z-10"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                WHAT ARE YOUR EXPECTATIONS FOR THIS TRIP?
              </motion.label>
              
              <div className="relative">
                <textarea 
                  onFocus={() => setIsExpFocused(true)}
                  onBlur={() => setIsExpFocused(false)}
                  placeholder=""
                  rows={4}
                  maxLength={500}
                  value={config.generalExpectations || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, generalExpectations: e.target.value }))}
                  className={`w-full min-h-[120px] bg-[#314022]/[0.04] border-[1.5px] rounded-[16px] p-[16px_20px] outline-none text-[#1a1a1a] text-[18px] italic transition-all duration-300 resize-y ${
                    isExpFocused ? 'border-[#54703a] shadow-[0_0_12px_rgba(22,163,74,0.25)] bg-white' : 'border-[#314022]/20 hover:border-[#314022]/30'
                  }`}
                  style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.7 }}
                />
                <AnimatePresence>
                  {!(config.generalExpectations?.length > 0 || isExpFocused) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute left-[20px] top-[16px] pointer-events-none text-[#1a1a1a]/40 text-[18px] italic pr-8"
                      style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.7 }}
                    >
                      Describe your perfect journey… slow mornings, wild adventures, hidden gems, food trails…
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-4 right-4 text-[#314022]/40 text-[11px] font-bold tracking-[0.1em]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

                {config.generalExpectations?.length || 0} / 500
              </div>
            </div>
            </div>
          </motion.div>

          <div className="h-[1px] border-b border-dashed border-[#314022]/20 my-8" />

          {/* QUESTION 2: KIDS TOGGLE */}
          <div className="flex items-center justify-between gap-8">
            <div>
              <label className="block text-[#314022] text-[11px] font-bold tracking-[0.18em] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                TRAVELLING WITH KIDS?
              </label>
              <p className="text-[#314022]/60 italic text-[15px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                We'll tailor activities and pacing for them
              </p>
            </div>
            
            <button 
              onClick={() => setHasKids(!hasKids)}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 p-1 flex items-center ${
                hasKids ? 'bg-gradient-to-r from-[#314022] to-[#54703a]' : 'bg-[#d1d5db]'
              }`}
            >
              <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: hasKids ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </button>
          </div>

          <AnimatePresence>
            {hasKids && (
              <motion.div 
                initial={{ maxHeight: 0, opacity: 0 }}
                animate={{ maxHeight: 600, opacity: 1 }}
                exit={{ maxHeight: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 space-y-6">
                   {localChildren.map((child, idx) => (
                      <div key={idx} className="flex flex-wrap items-end gap-6 pb-6">
                        <div className="flex-shrink-0 w-20">
                          <input 
                            type="number"
                            placeholder="Age"
                            min="0" max="17"
                            value={child.age}
                            onChange={(e) => updateChild(idx, 'age', e.target.value)}
                            className="w-full bg-transparent border-b-2 border-[#314022] focus:outline-none text-[#314022] text-[18px] font-bold py-1 text-center"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <input 
                            type="text"
                            placeholder="Name (optional)"
                            value={child.name}
                            onChange={(e) => updateChild(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-b-2 border-[#314022] focus:outline-none text-[#314022] text-[16px] py-1"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                          />
                        </div>
                        {localChildren.length > 1 && (
                          <button onClick={() => handleRemoveChild(idx)} className="text-[#dc2626] pb-2">
                             <X size={18} />
                          </button>
                        )}
                      </div>
                   ))}

                   <button 
                      onClick={handleAddChild}
                      className="px-6 py-2 border-2 border-dashed border-[#314022] rounded-full text-[#314022] font-bold text-[11px] tracking-[0.15em] hover:bg-[#314022] hover:text-white transition-all uppercase"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                   >
                     + ADD CHILD
                   </button>

                   <div className="space-y-4 pt-4">
                      <label className="block text-[#314022] text-[11px] font-bold tracking-[0.18em] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        WHAT DO THE KIDS EXPECT FROM THIS TRIP?
                      </label>
                      <textarea 
                        placeholder="Adventures they'll talk about for years, gentle activities, theme parks, beach days, wildlife..."
                        rows={3}
                        value={config.kidsExpectations}
                        onChange={(e) => setConfig(prev => ({ ...prev, kidsExpectations: e.target.value }))}
                        className="w-full bg-[#314022]/[0.04] border-[1.5px] border-[#314022]/20 rounded-[16px] p-[16px_20px] focus:border-[#54703a] focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)] outline-none text-[#1a1a1a] text-[17px] italic transition-all duration-200"
                        style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.6 }}
                      />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NEXT BUTTON */}
          <div className="pt-16">
            <motion.button 
                whileHover="hover"
                whileTap="click"
                initial="idle"
                animate="idle"
                variants={{
                  idle: { scale: 1, y: 0, boxShadow: "0 12px 40px rgba(49,64,34,0.4)" },
                  hover: { scale: 1.01, y: -2, boxShadow: "0 16px 48px rgba(49,64,34,0.5)" },
                  click: { scale: 0.97, y: 0, boxShadow: "0 4px 16px rgba(49,64,34,0.4)" }
                }}
                onClick={onNext}
                className="group relative w-full flex items-center justify-center gap-4 bg-gradient-to-r from-[#314022] to-[#54703a] text-white px-10 py-6 rounded-full font-bold tracking-[0.18em] text-[17px] overflow-hidden transition-colors"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                {/* Very subtle particle effect behind text on hover */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)" }}
                />

                <span className="relative z-10 uppercase flex items-center gap-2">
                  NEXT: BUILD MY STORY
                  <motion.div
                    variants={{
                      idle: { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
                      hover: { x: 3, rotate: 10, transition: { type: "spring", stiffness: 300 } },
                      click: { scale: 0.9 }
                    }}
                    className="relative z-10 block"
                  >
                    <Leaf size={16} className="text-white/80" fill="transparent" />
                  </motion.div>
                </span>
                <ChevronRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step2Vibe;
