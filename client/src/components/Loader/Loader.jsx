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
