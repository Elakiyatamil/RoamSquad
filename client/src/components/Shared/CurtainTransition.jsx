import React, { useEffect, useRef } from 'react';
const { gsap } = window;
import './CurtainTransition.css';

const CurtainTransition = ({ isActive, onComplete, children }) => {
    const leftCurtainRef = useRef(null);
    const rightCurtainRef = useRef(null);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            // Initial state: curtains closed
            gsap.set([leftCurtainRef.current, rightCurtainRef.current], {
                scaleX: 1,
                opacity: 1
            });
            gsap.set(overlayRef.current, { visibility: 'visible', opacity: 1 });
            gsap.set(contentRef.current, { scale: 0.95, opacity: 0 });

            const tl = gsap.timeline({
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });

            // Loading phase (placeholder for any loading logic if needed)
            tl.to({}, { duration: 0.5 }); // brief pause

            // Reveal phase: Curtains split
            tl.to(leftCurtainRef.current, {
                xPercent: -100,
                duration: 1.2,
                ease: "power4.inOut"
            }, "reveal");

            tl.to(rightCurtainRef.current, {
                xPercent: 100,
                duration: 1.2,
                ease: "power4.inOut"
            }, "reveal");

            // Content fade and scale
            tl.to(contentRef.current, {
                scale: 1,
                opacity: 1,
                duration: 1.4,
                ease: "expo.out"
            }, "reveal+=0.3");

            // Cleanup curtains
            tl.to(overlayRef.current, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    gsap.set(overlayRef.current, { visibility: 'hidden' });
                }
            }, "-=0.3");
        }
    }, [isActive, onComplete]);

    return (
        <div className="curtain-container">
            <div className="curtain-overlay" ref={overlayRef}>
                <div className="curtain-panel left-panel" ref={leftCurtainRef}>
                    <div className="curtain-glow" />
                </div>
                <div className="curtain-panel right-panel" ref={rightCurtainRef}>
                    <div className="curtain-glow" />
                </div>
                
                {/* Loader info inside the absolute overlay */}
                <div className="curtain-loader-info">
                   <div className="loader-orbit">
                       <div className="orbit-dot" />
                   </div>
                   <p className="loader-text">PREPARING YOUR JOURNEY...</p>
                </div>
            </div>

            <div className="curtain-content" ref={contentRef}>
                {children}
            </div>
        </div>
    );
};

export default CurtainTransition;
