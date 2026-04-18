import React, { useEffect, useRef, useState } from 'react';
import './DoorAnimationSection.css';

const DoorAnimationSection = () => {
    const containerRef = useRef(null);
    const [lerpedProgress, setLerpedProgress] = useState(0);



    useEffect(() => {
        let requestRef;
        let targetProgress = 0;
        let currentProgress = 0;
        const lerpFactor = 0.12;

        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalHeight = containerRef.current.offsetHeight;
            const stickyHeight = window.innerHeight;
            
            let progress = -rect.top / (totalHeight - stickyHeight);
            progress = Math.max(0, Math.min(1, progress));
            targetProgress = progress;
        };

        const update = () => {
            currentProgress += (targetProgress - currentProgress) * lerpFactor;
            setLerpedProgress(currentProgress);
            requestRef = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        requestRef = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(requestRef);
        };
    }, []);

    // LUXURY ANIMATION VARIABLES
    // Straight-on camera move toward the door
    const cameraZoom = 1 + (lerpedProgress * 8.5); 
    
    // Light transition segments
    // 0.0 - 0.4: Early Dawn Glow
    // 0.4 - 0.7: Door Opening / Passing Through
    // 0.7 - 1.0: Full Reveal
    
    const dawnIntensity = Math.max(0, Math.min(1, lerpedProgress / 0.5));
    const doorOpenProgress = Math.max(0, Math.min(1, (lerpedProgress - 0.35) / 0.35));
    const doorRotation = doorOpenProgress * -88; // hinge motion
    
    const scene2Opacity = Math.max(0, Math.min(1, (lerpedProgress - 0.5) / 0.2));

    // Draggable Cards Handlers


    return (
        <div className="luxury-hero-section" ref={containerRef}>
            <div className="sticky-viewport-v8">
                
                {/* SCENE 1: LUXURY EARLY DAWN BEACH */}
                <div className="scene-1-v8" style={{ 
                    opacity: lerpedProgress > 0.9 ? 0 : 1,
                    transform: `scale(${cameraZoom})`,
                    transformOrigin: '50% 50%' 
                }}>
                    <div className="beach-atmosphere-v8">
                        <div className="sky-gradient-v8"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=95" 
                            alt="Luxury Dawn Beach" 
                            className="beach-photo-v8" 
                        />
                        {/* Sand texture and wet reflections */}
                        <div className="sand-ground-v8">
                            <div className="sand-wet-reflection-overlay"></div>
                        </div>
                        {/* Front-facing waves */}
                        <div className="luxury-waves-v8">
                            <div className="wave-wash-v8"></div>
                            <div className="wave-wash-v8 delay-v8"></div>
                        </div>
                    </div>

                    {/* PREMIUM ARCHITECTURAL DOOR - BURIED */}
                    <div className="door-grounded-anchor-v8">
                        {/* Contact AO and drop shadow */}
                        <div className="door-shadow-v8"></div>
                        
                        <div className="door-architectural-v8">
                            {/* Frame Depth & Sides */}
                            <div className="door-frame-depth"></div>
                            
                            <div className="door-portal-reveal-v8">
                                <div className="portal-paradise-v8">
                                    <img src="https://images.unsplash.com/photo-1540206276207-39257862cd99?auto=format&fit=crop&w=1400&q=95" alt="Paradise Revealed" />
                                    {/* Warm light spill inside */}
                                    <div className="portal-light-glow-v8" style={{ opacity: doorOpenProgress }}></div>
                                </div>
                            </div>

                            {/* ADJUSTABLE DOOR PANEL - HINGE SIDE */}
                            <div className="door-panel-v8" style={{ 
                                transform: `perspective(2200px) rotateY(${doorRotation}deg)`
                            }}>
                                <div className="door-material-luxury-v8">
                                    <div className="wood-texture-v8"></div>
                                    <div className="scratches-detail-v8"></div>
                                    
                                    <div className="door-bevels-system">
                                        <div className="bevel-pane"></div>
                                        <div className="bevel-pane"></div>
                                    </div>
                                    <div className="premium-handle-brass">
                                        <div className="handle-shimmer-v8"></div>
                                    </div>
                                    
                                    {/* Dynamic Lighting Tints */}
                                    <div className="sunrise-warm-tint" style={{ opacity: dawnIntensity }}></div>
                                    <div className="sky-cool-tint" style={{ opacity: 1 - dawnIntensity }}></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Messy sand accumulation at base */}
                        <div className="sand-accumulation-v8">
                            <div className="clump-v8 s1"></div>
                            <div className="clump-v8 s2"></div>
                            <div className="clump-v8 s3"></div>
                        </div>
                    </div>
                </div>

                {/* SCENE 2: PARADISE FULL REVEAL */}
                <div className="scene-2-v8" style={{ 
                    opacity: scene2Opacity,
                    visibility: scene2Opacity > 0 ? 'visible' : 'hidden'
                }}>
                    <div className="full-screen-paradise-v8">
                        <img src="https://images.unsplash.com/photo-1540206276207-39257862cd99?auto=format&fit=crop&w=2000&q=100" alt="Lush Life" />
                    </div>


                </div>
            </div>
        </div>
    );
};

export default DoorAnimationSection;
