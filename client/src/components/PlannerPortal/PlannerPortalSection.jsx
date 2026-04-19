import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './PlannerPortalSection.css';

const CIRCUMFERENCE = 653;
const HOLD_MS = 1800;

const DESTINATIONS = [
  { name: 'EDINBURGH CASTLE', image: '/assets/destinations/edinburgh.png' },
  { name: 'GOA BEACH', image: '/assets/destinations/goa.png' },
  { name: 'SAHARA DESERT', image: '/assets/destinations/sahara.png' },
  { name: 'SANTORINI', image: '/assets/destinations/santorini.png' },
  { name: 'BALI RICE TERRACES', image: '/assets/destinations/bali.png' },
  { name: 'TOKYO NEON', image: '/assets/destinations/tokyo.png' },
  { name: 'ICELAND AURORA', image: '/assets/destinations/iceland.png' },
  { name: 'MACHU PICCHU', image: 'https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?w=800&q=80' },
  { name: 'DISNEYLAND', image: 'https://images.unsplash.com/photo-1542125387-c71274d94f0a?w=800&q=80' },
  { name: 'DUBAI TWILIGHT', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' },
  { name: 'KYOTO CHERRY BLOSSOMS', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
  { name: 'MALDIVES AERIAL', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' }
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

            if (sectionRef.current && anchorRef.current) {
                const sRect = sectionRef.current.getBoundingClientRect();
                const centerX = sRect.left + sRect.width / 2;
                const centerY = sRect.top + sRect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const dist = Math.hypot(dx, dy);
                
                if (dist < 140) {
                    const strength = Math.pow((140 - dist) / 140, 2);
                    const maxPull = 14;
                    const pullX = Math.max(-maxPull, Math.min(maxPull, dx * strength * 0.14));
                    const pullY = Math.max(-maxPull, Math.min(maxPull, dy * strength * 0.14));
                    
                    anchorRef.current.style.transition = 'transform 0.15s ease-out';
                    anchorRef.current.style.transform = `translate(${pullX}px, ${pullY}px)`;
                    magnetActive = true;
                    cursor.current.snapX = centerX;
                    cursor.current.snapY = centerY;
                    followerRef.current?.classList.add('magnetic');
                } else {
                    if (magnetActive) {
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
            cursor.current.fx += (cursor.current.tx - cursor.current.fx) * 0.08;
            cursor.current.fy += (cursor.current.ty - cursor.current.fy) * 0.08;
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
    const MAX_ACTIVE = 6;

    useEffect(() => {
        const spawnTask = () => {
            setSpawns(prev => {
                if (prev.length >= MAX_ACTIVE) return prev;

                let dest;
                do {
                    dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
                } while (usedRecently.current.includes(dest.name));

                usedRecently.current.push(dest.name);
                if (usedRecently.current.length > 6) usedRecently.current.shift();

                const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
                const top = rand(zone.top[0], zone.top[1]);
                const left = rand(zone.left[0], zone.left[1]);
                const size = Math.floor(rand(180, 260));
                const duration = rand(12, 18);
                const driftX = rand(-40, 40);
                const driftY = rand(-60, -20); // Always drift slightly upward (antigravity)

                const newSpawn = {
                    id: Date.now() + Math.random(),
                    ...dest,
                    top, left, size, duration, driftX, driftY,
                    rotateDur: rand(20, 40),
                    bobDelay: rand(0, 4)
                };

                // Auto-remove
                setTimeout(() => {
                    setSpawns(current => current.filter(s => s.id !== newSpawn.id));
                }, duration * 1000);

                return [...prev, newSpawn];
            });

            const nextDelay = rand(1500, 3500);
            setTimeout(spawnTask, nextDelay);
        };

        const initialSpawns = [
            setTimeout(spawnTask, 200),
            setTimeout(spawnTask, 1200),
            setTimeout(spawnTask, 2500)
        ];

        return () => initialSpawns.forEach(t => clearTimeout(t));
    }, []);

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
            {/* Star Field */}
            <div className="portal-stars">
                {[...Array(80)].map((_, i) => (
                    <motion.div 
                        key={i} 
                        className="star" 
                        initial={{ 
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: rand(0.1, 0.4)
                        }}
                        animate={{ 
                            top: ['100%', '-10%'],
                            opacity: [0.1, 0.6, 0.1]
                        }}
                        transition={{ 
                            duration: rand(15, 30),
                            repeat: Infinity,
                            ease: "linear",
                            delay: rand(0, 20)
                        }}
                        style={{
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`,
                        }}
                    />
                ))}
            </div>

            {/* Cinematic Floating Memory Orbs */}
            <AnimatePresence>
                {spawns.map(p => (
                    <motion.div 
                        key={p.id} 
                        className="dest-pop-wrapper"
                        initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [0.2, 1, 1, 0.6],
                            x: p.driftX,
                            y: p.driftY
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: p.duration, ease: "easeInOut" }}
                        style={{ 
                            top: `${p.top}%`, 
                            left: `${p.left}%`,
                            width: p.size,
                            height: p.size,
                            zIndex: 5
                        }}
                        onMouseEnter={() => {
                            setIsHoveringPlanet(true);
                            followerRef.current?.classList.add('expanding');
                        }}
                        onMouseLeave={() => {
                            setIsHoveringPlanet(false);
                            followerRef.current?.classList.remove('expanding');
                        }}
                    >
                        <motion.div 
                            className="dest-pop-card"
                            animate={{ y: [0, -15, 0] }}
                            transition={{ 
                                duration: 5, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                delay: p.bobDelay 
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                position: 'relative',
                                boxShadow: `
                                    0 0 30px rgba(80, 160, 255, 0.3),
                                    0 0 60px rgba(40, 100, 255, 0.15)
                                `,
                                filter: 'brightness(1.1) saturate(1.2)'
                            }}
                        >
                            <motion.div 
                                className="sphere-bg"
                                animate={{ backgroundPosition: ['0% center', '100% center'] }}
                                transition={{ duration: p.rotateDur, repeat: Infinity, ease: "linear" }}
                                style={{ 
                                    backgroundImage: `url(${p.image})`,
                                    backgroundSize: '200% 100%',
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%'
                                }}
                            />
                            <div className="sphere-highlight" />
                            <div className="sphere-shadow" />
                            
                            {/* Organic Glow Blur */}
                            <div style={{
                                position: 'absolute',
                                inset: '-2px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                pointerEvents: 'none'
                                }} 
                            />
                        </motion.div>
                        <span className="pop-label" style={{ top: '100%', marginTop: '15px' }}>
                            {p.name}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Center Content */}
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
                        stroke="#C1351A"
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
                        HOLD TO PLAN<br />YOUR TRIP
                    </div>
                </div>
            </div>

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

            <div id="cursor-follower" ref={followerRef}>
                <span className="cursor-view-text">VIEW</span>
            </div>
            <div id="cursor-dot" ref={dotRef}></div>
        </section>
    );
};

export default PlannerPortalSection;
