import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlannerPortalSection.css';

const CIRCUMFERENCE = 653;
const HOLD_MS = 1800;

const DESTINATIONS = [
  { name: 'SANTORINI', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=90', color: 'rgba(255,180,100,0.15)' },
  { name: 'MALDIVES', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=90', color: 'rgba(100,220,200,0.15)' },
  { name: 'BALI', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=90', color: 'rgba(150,200,100,0.12)' },
  { name: 'ICELAND', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=90', color: 'rgba(100,180,255,0.15)' },
  { name: 'KYOTO', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=90', color: 'rgba(255,150,150,0.12)' },
  { name: 'PATAGONIA', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=90', color: 'rgba(100,255,180,0.12)' },
  { name: 'AMALFI', image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=90', color: 'rgba(255,220,100,0.12)' },
  { name: 'TOKYO', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=90', color: 'rgba(200,150,255,0.12)' },
  { name: 'SAHARA', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=90', color: 'rgba(255,200,100,0.15)' },
  { name: 'FJORDS', image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=90', color: 'rgba(100,200,255,0.15)' },
  { name: 'MALDIVES AERIAL', image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=90', color: 'rgba(80,240,255,0.2)' },
  { name: 'GREEK ISLANDS', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=90', color: 'rgba(100,180,255,0.2)' }
];

const ZONES = [
  {top:[5,25],  left:[0,18]},
  {top:[5,30],  left:[15,42]},
  {top:[5,35],  left:[55,85]},
  {top:[5,28],  left:[82,99]},
  {top:[55,80], left:[0,20]},
  {top:[55,80], left:[80,99]}
];

const rand = (min, max) => Math.random() * (max - min) + min;

const PlannerPortalSection = () => {
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const followerRef = useRef(null);
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const btnRef = useRef(null);
    const anchorRef = useRef(null);
    
    const [holding, setHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [spawns, setSpawns] = useState([]);
    const [isHoveringPlanet, setIsHoveringPlanet] = useState(false);

    // Magnetic Cursor state
    const cursor = useRef({ 
        fx: 0, fy: 0,   // Follower position
        dx: 0, dy: 0,   // Dot position
        tx: 0, ty: 0    // Target mouse position
    });

    useEffect(() => {
        let magnetActive = false;

        const handleMouseMove = (e) => {
            cursor.current.tx = e.clientX;
            cursor.current.ty = e.clientY;

            // FIX 1: MAGNETIC ANCHOR LOGIC
            if (sectionRef.current && anchorRef.current) {
                const sRect = sectionRef.current.getBoundingClientRect();
                
                // True center of section in viewport coords
                const centerX = sRect.left + sRect.width / 2;
                const centerY = sRect.top + sRect.height / 2;
                
                // Distance from mouse to TRUE center
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const dist = Math.hypot(dx, dy);
                
                if (dist < 140) {
                    // Apply subtle pull to ANCHOR only, within safe limits
                    const strength = Math.pow((140 - dist) / 140, 2);
                    const maxPull = 14;
                    const pullX = Math.max(-maxPull, Math.min(maxPull, dx * strength * 0.14));
                    const pullY = Math.max(-maxPull, Math.min(maxPull, dy * strength * 0.14));
                    
                    anchorRef.current.style.transition = 'transform 0.15s ease-out';
                    anchorRef.current.style.transform = `translate(${pullX}px, ${pullY}px)`;
                    magnetActive = true;
                    
                    // Magnetic dot snap to center
                    cursor.current.snapX = centerX;
                    cursor.current.snapY = centerY;
                    followerRef.current?.classList.add('magnetic');
                } else {
                    if (magnetActive) {
                        // Spring back to exact center
                        anchorRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        anchorRef.current.style.transform = 'translate(0px, 0px)';
                        magnetActive = false;
                        followerRef.current?.classList.remove('magnetic');
                    }
                    cursor.current.snapX = null;
                    cursor.current.snapY = null;
                }
            }
        };

        const handleMouseLeave = () => {
            if (anchorRef.current) {
                anchorRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                anchorRef.current.style.transform = 'translate(0px, 0px)';
                magnetActive = false;
                followerRef.current?.classList.remove('magnetic');
            }
        };

        const loop = () => {
            // Lerp Follower (0.08)
            cursor.current.fx += (cursor.current.tx - cursor.current.fx) * 0.08;
            cursor.current.fy += (cursor.current.ty - cursor.current.fy) * 0.08;

            // Lerp Dot (0.22) - snap to button center if magnet active
            const targetDotX = cursor.current.snapX ?? cursor.current.tx;
            const targetDotY = cursor.current.snapY ?? cursor.current.ty;
            
            cursor.current.dx += (targetDotX - cursor.current.dx) * 0.22;
            cursor.current.dy += (targetDotY - cursor.current.dy) * 0.22;

            if (followerRef.current) {
                followerRef.current.style.left = `${cursor.current.fx}px`;
                followerRef.current.style.top = `${cursor.current.fy}px`;
                followerRef.current.style.transform = `translate(-50%, -50%)`;
            }
            if (dotRef.current) {
                dotRef.current.style.left = `${cursor.current.dx}px`;
                dotRef.current.style.top = `${cursor.current.dy}px`;
                dotRef.current.style.transform = `translate(-50%, -50%)`;
                dotRef.current.style.opacity = isHoveringPlanet ? '0' : '1';
            }

            requestAnimationFrame(loop);
        };

        window.addEventListener('mousemove', handleMouseMove);
        sectionRef.current?.addEventListener('mouseleave', handleMouseLeave);
        const raf = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            sectionRef.current?.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(raf);
        };
    }, [isHoveringPlanet]);

    // Destination Spawning System
    const usedRecently = useRef([]);
    const MAX_ACTIVE = 4;

    useEffect(() => {
        const spawnTask = () => {
            setSpawns(prev => {
                if (prev.length >= MAX_ACTIVE) return prev;

                // Pick destination not used recently
                let dest;
                do {
                    dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
                } while (usedRecently.current.includes(dest.name));

                usedRecently.current.push(dest.name);
                if (usedRecently.current.length > 5) usedRecently.current.shift();

                // Pick random zone
                const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
                const top = rand(zone.top[0], zone.top[1]);
                const left = rand(zone.left[0], zone.left[1]);
                const size = Math.floor(rand(200, 320));
                const tilt = rand(-12, 12).toFixed(1);
                const duration = rand(3.5, 6).toFixed(1);
                const hueShift = Math.floor(rand(-20, 20));
                const hasRing = Math.random() < 0.4;

                const newSpawn = {
                    id: Date.now() + Math.random(),
                    ...dest,
                    top, left, size, tilt, duration, hueShift, hasRing,
                    rotateDur: rand(16, 28).toFixed(0)
                };

                // Auto-remove after duration
                setTimeout(() => {
                    setSpawns(current => current.filter(s => s.id !== newSpawn.id));
                }, duration * 1000);

                return [...prev, newSpawn];
            });

            const nextDelay = rand(800, 2200);
            setTimeout(spawnTask, nextDelay);
        };

        const initial1 = setTimeout(spawnTask, 200);
        const initial2 = setTimeout(spawnTask, 900);

        return () => {
            clearTimeout(initial1);
            clearTimeout(initial2);
        };
    }, []);

    // Hold Interaction
    const startTime = useRef(null);
    const rafId = useRef(null);

    const updateRing = (now) => {
        if (!startTime.current) return;
        const elapsed = now - startTime.current;
        const p = Math.min(elapsed / HOLD_MS, 1);
        setProgress(p);

        if (ringRef.current) {
            const offset = CIRCUMFERENCE * (1 - p);
            ringRef.current.style.strokeDashoffset = offset;
        }

        if (p >= 1) {
            triggerEntry();
        } else {
            rafId.current = requestAnimationFrame(updateRing);
        }
    };

    const startHold = (e) => {
        e.preventDefault();
        setHolding(true);
        startTime.current = performance.now();
        if (btnRef.current) btnRef.current.classList.add('holding');
        rafId.current = requestAnimationFrame(updateRing);
    };

    const cancelHold = () => {
        setHolding(false);
        startTime.current = null;
        setProgress(0);
        if (rafId.current) cancelAnimationFrame(rafId.current);
        if (btnRef.current) btnRef.current.classList.remove('holding');
        if (ringRef.current) ringRef.current.style.strokeDashoffset = CIRCUMFERENCE;
    };

    const triggerEntry = () => {
        setHolding(false);
        if (sectionRef.current) {
            sectionRef.current.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sectionRef.current.style.opacity = '0';
            sectionRef.current.style.transform = 'scale(1.04)';
        }
        setTimeout(() => {
            navigate('/planner');
        }, 520);
    };

    return (
        <section id="planner-section" ref={sectionRef}>
            <div className="cloud-bridge"></div>
            
            {/* Star Field */}
            <div className="portal-stars">
                {[...Array(60)].map((_, i) => (
                    <div 
                        key={i} 
                        className="star" 
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${0.8 + Math.random() * 1.7}px`,
                            height: `${0.8 + Math.random() * 1.7}px`,
                            '--duration': `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Dynamic Spawning Destinations */}
            {spawns.map(p => (
                <div 
                    key={p.id} 
                    className="dest-pop-wrapper"
                    style={{ top: `${p.top}%`, left: `${p.left}%` }}
                    onMouseEnter={() => {
                        setIsHoveringPlanet(true);
                        followerRef.current?.classList.add('expanding');
                    }}
                    onMouseLeave={() => {
                        setIsHoveringPlanet(false);
                        followerRef.current?.classList.remove('expanding');
                    }}
                >
                    <div 
                        className="dest-pop-card"
                        style={{
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            '--r': `${p.tilt}deg`,
                            animation: `popIn ${p.duration}s cubic-bezier(0.34,1.2,0.64,1) forwards`,
                            boxShadow: `
                                0 0 0 2px rgba(80, 160, 255, 0.25),
                                0 0 ${p.size * 0.18}px rgba(40, 120, 255, 0.55),
                                0 0 ${p.size * 0.35}px rgba(20, 80, 220, 0.30),
                                0 0 ${p.size * 0.55}px rgba(10, 50, 180, 0.15),
                                inset 0 0 ${p.size * 0.15}px rgba(0, 20, 80, 0.5)
                            `
                        }}
                    >
                        <div 
                            className="sphere-bg"
                            style={{ 
                                backgroundImage: `url(${p.image})`,
                                animation: `rotatePlanet ${p.rotateDur}s linear infinite`,
                                filter: `saturate(1.6) contrast(1.25) brightness(0.95) hue-rotate(${p.hueShift}deg)`
                            }}
                        />
                        <div 
                            className="sphere-highlight" 
                            style={{
                                background: `radial-gradient(
                                    circle at 30% 28%,
                                    rgba(180, 220, 255, 0.45) 0%,
                                    rgba(100, 180, 255, 0.12) 35%,
                                    transparent 55%
                                )`
                            }}
                        />
                        <div 
                            className="sphere-shadow" 
                            style={{
                                background: `radial-gradient(
                                    circle at 70% 72%,
                                    rgba(0, 5, 40, 0.75) 0%,
                                    rgba(0, 10, 60, 0.4) 30%,
                                    transparent 55%
                                )`
                            }}
                        />
                        
                        {/* Saturn-like Ring */}
                        {p.hasRing && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: `${p.size * 1.5}px`,
                                height: `${p.size * 0.28}px`,
                                transform: 'translate(-50%, -50%) rotateX(72deg)',
                                borderRadius: '50%',
                                border: '2px solid rgba(80, 160, 255, 0.22)',
                                boxShadow: `
                                    0 0 12px rgba(60, 140, 255, 0.18),
                                    inset 0 0 8px rgba(40, 100, 255, 0.10)
                                `,
                                pointerEvents: 'none',
                                zIndex: -1 // Behind the planet image for semi-realism
                            }} />
                        )}
                    </div>
                    <span 
                        className="pop-label"
                        style={{ top: `${p.size + 14}px`, '--r': `${p.tilt}deg` }}
                    >
                        {p.name}
                    </span>
                </div>
            ))}

            {/* Center Content — Magnetic Anchor Fix */}
            <div id="planner-btn-anchor" ref={anchorRef}>
                <svg id="progress-ring" className="progress-ring-svg" viewBox="0 0 224 224">
                    <circle 
                        cx="112" cy="112" r="104"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2"
                    />
                    <circle 
                        ref={ringRef}
                        id="ring-progress" 
                        cx="112" cy="112" r="104"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE}
                        transform="rotate(-90 112 112)"
                        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                </svg>

                <div 
                    ref={btnRef}
                    id="planner-btn"
                    onMouseDown={startHold}
                    onTouchStart={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchEnd={cancelHold}
                >
                    <span className="btn-arrow">↗</span>
                    <div className="btn-text">
                        HOLD TO ENTER<br />EXPERIENCE
                    </div>
                </div>
            </div>

            {/* Staggered Typography Layout */}
            <div className="portal-bottom-typography">
                <span className="headline-row-1">PLAN</span>
                <span className="headline-row-2">YOUR</span>
                <div className="headline-row-3">
                    <span className="text-next">Next</span>
                    <span className="text-journey">Journey</span>
                </div>
                <p className="portal-descriptor">
                    HOLD THE BUTTON  ·  BUILD YOUR ITINERARY  ·  EXPLORE THE WORLD
                </p>
            </div>

            {/* Magnetic Cursor Elements */}
            <div id="cursor-follower" ref={followerRef}>
                <span className="cursor-view-text">VIEW</span>
            </div>
            <div id="cursor-dot" ref={dotRef}></div>
        </section>
    );
};

export default PlannerPortalSection;
