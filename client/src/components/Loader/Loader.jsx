<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
import './Loader.css';

const { gsap } = window;

const Loader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const progressRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Initial state
    gsap.set(containerRef.current, { opacity: 1 });
    gsap.set(logoRef.current, { scale: 0.8, opacity: 0 });
    gsap.set(textRef.current, { y: 20, opacity: 0 });
    gsap.set(progressRef.current, { scaleX: 0 });

    // Animation sequence
    tl.to(logoRef.current, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: "expo.out"
    })
    .to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6")
    .to(progressRef.current, {
      scaleX: 1,
      duration: 2,
      ease: "power2.inOut"
    }, "-=0.4")
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "+=0.2");

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div className="loader-container" ref={containerRef}>
      <div className="loader-content">
        <div className="loader-logo-wrapper" ref={logoRef}>
          <img src="/logo.png" alt="RoamSquad" className="loader-logo" />
        </div>
        <div className="loader-text-wrapper" ref={textRef}>
          <span className="loader-brand">ROAM</span>
          <span className="loader-squad">SQUAD</span>
        </div>
        <div className="loader-progress-container">
          <div className="loader-progress-bar" ref={progressRef} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
=======
import { useEffect, useState } from 'react'

const slides = [
  {
    bg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    city: 'Switzerland',
    tag: 'Adventure',
    overlay: 'rgba(13,92,99,0.45)',
  },
  {
    bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    city: 'Maldives',
    tag: 'Escape',
    overlay: 'rgba(139,26,47,0.45)',
  },
  {
    bg: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
    city: 'Kyoto',
    tag: 'Culture',
    overlay: 'rgba(232,168,56,0.35)',
  },
]

export default function Loader({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Fix 6: Image Crossfade states
  const [currentBg, setCurrentBg] = useState(slides[0].bg)
  const [nextBg, setNextBg] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    slides.forEach(s => {
      const img = new Image()
      img.src = s.bg
    })

    const updateSlide = (newIndex) => {
      setNextBg(slides[newIndex].bg)
      setTransitioning(true)
      setTimeout(() => {
        setCurrentBg(slides[newIndex].bg)
        setNextBg(null)
        setTransitioning(false)
        setIndex(newIndex)
      }, 500)
    }

    const t1 = setTimeout(() => updateSlide(1), 700)
    const t2 = setTimeout(() => updateSlide(2), 1400)
    const t3 = setTimeout(() => setShowLogo(true), 2000)
    const t4 = setTimeout(() => setFadeOut(true), 2800)
    const t5 = setTimeout(() => {
      if (onComplete) onComplete()
    }, 3200)

    let p = 0
    const interval = setInterval(() => {
      p += 1
      setProgress(Math.min(p, 100))
      if (p >= 100) clearInterval(interval)
    }, 28)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearInterval(interval)
    }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>

      {/* Fix 6: Background crossfade layered divs */}
      <div style={{ 
        backgroundImage: `url(${currentBg})`, 
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.5s ease',
        position: 'absolute', 
        inset: 0,
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }} />
      {nextBg && (
        <div style={{ 
          backgroundImage: `url(${nextBg})`,
          opacity: transitioning ? 1 : 0,
          transition: 'opacity 0.5s ease',
          position: 'absolute', 
          inset: 0,
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }} />
      )}

      {/* Fix 1: Dark overlay for logo phase */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#0A0E1A',
        opacity: showLogo ? 1 : 0,
        transition: 'opacity 0.5s ease',
        zIndex: 1,
      }} />

      {/* Dark base overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.35) 60%, rgba(10,14,26,0.2) 100%)',
      }} />

      {/* Color mood overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: slides[index].overlay,
        transition: 'background 0.4s ease',
      }} />

      {/* Dot indicators top center */}
      <div style={{
        position: 'absolute',
        top: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        zIndex: 2,
      }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            height: 6,
            width: i === index ? 24 : 6,
            borderRadius: 3,
            background: i === index
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(255,255,255,0.25)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>

      {/* Fix 2: Stamp circle — center-top area */}
      {!showLogo && (
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 110,
          height: 110,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          zIndex: 2,
          animation: 'stampIn 0.35s ease forwards',
        }}>
          <span style={{
            color: 'white',
            fontSize: 9,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {slides[index].city}
          </span>
          <div style={{
            width: '55%',
            height: 1,
            background: 'rgba(255,255,255,0.45)',
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 7,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            ROAMSQUAD
          </span>
          <span style={{
            color: '#E8A838',
            fontSize: 9,
            letterSpacing: 3,
          }}>
            ★ ★ ★
          </span>
        </div>
      )}

      {/* Logo phase — center */}
      {showLogo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 2,
          animation: 'fadeUp 0.5s ease forwards',
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(28px, 6vw, 42px)',
            letterSpacing: '0.06em',
            display: 'flex',
          }}>
            <span style={{ color: '#8B1A2F' }}>ROAM</span>
            <span style={{ color: '#FFFFFF' }}>SQUAD</span>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            fontStyle: 'italic',
            letterSpacing: '0.08em',
            animation: 'fadeIn 0.5s ease 0.3s both',
          }}>
            Your journey. Your way. Always.
          </div>
        </div>
      )}

      {/* Fix 3: Bottom city name with animation */}
      {!showLogo && (
        <div style={{
          position: 'absolute',
          bottom: 48,
          left: 40,
          zIndex: 2,
        }}>
          <div key={index} style={{
            color: 'white',
            fontFamily: '"DM Serif Display", "Playfair Display", serif',
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400,
            lineHeight: 1.1,
            animation: 'cityFadeUp 0.4s ease forwards',
          }}>
            {slides[index].city}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>
            {slides[index].tag}
          </div>
        </div>
      )}

      {/* Fix 5: Progress bar with glow */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.08)',
        zIndex: 3,
      }}>
        <div 
          className="loader-progress-fill"
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(to right, #8B1A2F, #E8A838, #0D5C63)',
            transition: 'width 0.1s linear',
          }} 
        />
      </div>

      <style>{`
        @keyframes stampIn {
          from { transform: translate(-50%, -50%) scale(1.6) rotate(-10deg); opacity: 0; }
          to   { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cityFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loader-progress-fill {
          box-shadow: 0 0 10px rgba(232,168,56,0.5);
        }
      `}</style>
    </div>
  )
}
>>>>>>> b5016b7 (Standardize media infrastructure and fix image rendering)
