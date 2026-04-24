import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MapPin, ChevronDown, Compass, Send, ArrowRight, Plane, Bed, Car, Camera, Utensils } from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTS & THEME
────────────────────────────────────────────── */
const PALETTE = {
  oceanBlue: '#1B3A6B',
  terracotta: '#C4724A',
  cream: '#F7F3EC',
  white: '#FFFFFF',
  charcoal: '#1A1A2E',
  warmGray: '#7A7068',
  saffronGold: '#E8A838',
  paper: '#fdfaf5',
  tape: '#d2c39b8c'
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Barlow+Condensed:wght@400;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');

  .scrapbook-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .scrapbook-card:hover {
    transform: translateY(-5px) !important;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15) !important;
  }

  .polaroid-img {
    transition: transform 0.5s ease;
  }
  .polaroid-img:hover {
    transform: scale(1.03);
  }

  .underline-animate {
    display: block;
    height: 3px;
    background: #E8A838;
    width: 0;
    transition: width 1s ease;
  }
  .underline-animate.visible {
    width: 120px;
  }

  p::selection, span::selection, h1::selection, h2::selection, h3::selection {
    background: rgba(27, 58, 107, 0.1);
    color: inherit;
  }
`;

// Image selection logic transitioned to priority-based system using admin data.

/* ─────────────────────────────────────────────
   HELPERS: Intersection Observer Hook
────────────────────────────────────────────── */
function useIntersectionObserver() {
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const currentObs = observer.current;
    return () => currentObs.disconnect();
  }, []);

  const register = (node) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  };

  return register;
}

/* ─────────────────────────────────────────────
   COMPONENT: STEP 4 PREVIEW
────────────────────────────────────────────── */
const Step4Preview = ({
    config,
    setConfig,
    timeline,
    plan,
    budget,
    isSubmitting,
    submitInquiry,
    errorMessage,
    prevStep,
    destinations
}) => {
    const register = useIntersectionObserver();
    const activeDestination = destinations?.find(d => d.id === config.destinationId) || destinations?.[0];
    const destinationNameRaw = config.destinationName || activeDestination?.name || "Your Journey";
    const destinationName = destinationNameRaw.toUpperCase();
    const heroImage = activeDestination?.image_url || activeDestination?.coverImage || activeDestination?.heroImage || activeDestination?.images?.[0] || "https://placehold.co/1920x1080/000000/333333?text=Destination+Hero";

    return (
        <div style={{ background: PALETTE.cream, minHeight: '100vh', overflowX: 'hidden' }}>
            <style dangerouslySetInnerHTML={{ __html: FONTS }} />

            {/* ── SECTION 1: CINEMATIC REAL-IMAGE HERO ── */}
            <header style={{
                height: '100vh',
                maxHeight: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: `#000`
            }} className="preview-hero">
                <img 
                    src={heroImage} 
                    alt={destinationName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/1600x900/000000/333333?text=No+Image"; }}
                />
                
                {/* Overlay Gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)'
                }} />

                {/* Curved Dotted Travel Path with Airplane */}
                <svg 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
                    viewBox="0 0 1440 800"
                    className="hidden md:block"
                >
                    <path 
                        d="M -100 200 Q 400 500 1540 100" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeDasharray="8 12" 
                        opacity="0.3" 
                    />
                    <foreignObject x="680" y="300" width="40" height="40">
                        <div style={{ transform: 'rotate(25deg)', color: 'white', opacity: 0.6 }}>
                            <Plane size={32} fill="currentColor" />
                        </div>
                    </foreignObject>
                </svg>

                {/* Content (Left Aligned, Centered Vertically) */}
                <div style={{
                    position: 'absolute', top: '45%', left: '8%', transform: 'translateY(-50%)',
                    zIndex: 10, maxWidth: '850px', textAlign: 'left'
                }} className="hero-content">
                    <p style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700, fontSize: 14, letterSpacing: '4px',
                        color: 'white', textTransform: 'uppercase', marginBottom: 20,
                        opacity: 0.9
                    }}>YOUR ITINERARY</p>
                    
                    <h1 style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 900, fontSize: 'clamp(42px, 10vw, 110px)',
                        color: 'white', textTransform: 'uppercase', 
                        lineHeight: 0.85, margin: '0 0 24px',
                        textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        {destinationName}
                    </h1>

                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(20px, 4vw, 28px)', color: 'rgba(255,255,255,0.95)',
                        fontStyle: 'italic', marginBottom: 0
                    }}>
                        {config.days} Days · ₹{budget.toLocaleString()} Est.
                    </p>
                </div>

                {/* Bottom Feature Row Icons */}
                <div style={{
                    position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 15, display: 'flex', gap: 'clamp(12px, 4vw, 32px)', alignItems: 'center',
                    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
                    padding: '16px 24px', borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    width: 'max-content',
                    maxWidth: '90vw'
                }} className="hero-features">
                    {[
                        { icon: Plane, label: 'Travel' },
                        { icon: Bed, label: 'Accommodation' },
                        { icon: Car, label: 'Local Transport' },
                        { icon: Camera, label: 'Sightseeing' },
                        { icon: Utensils, label: 'Meals' }
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <item.icon size={16} color="white" strokeWidth={1.5} />
                            <span style={{ color: 'white', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom Fade Mask */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '25vh',
                    background: `linear-gradient(to bottom, transparent, ${PALETTE.cream})`,
                    zIndex: 20
                }} />

                <style dangerouslySetInnerHTML={{ __html: `
                    @media (max-width: 768px) {
                        .preview-hero { height: 45vh !important; max-height: 45vh !important; }
                        .hero-content { top: 40% !important; left: 20px !important; right: 20px !important; }
                        .hero-features { bottom: 15px !important; padding: 10px 20px !important; }
                    }
                `}} />
            </header>

            {/* ── SECTION 2: SCRAPBOOK ITINERARY ── */}
            <main style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 80 }}>
                    <h2 
                        ref={register}
                        style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 800, fontSize: 'clamp(32px, 6vw, 56px)', 
                            color: PALETTE.oceanBlue, margin: '0 0 12px',
                            letterSpacing: '0.1em', textTransform: 'uppercase'
                        }}
                    >
                        THE STORY UNFOLDS
                        <span ref={register} className="underline-animate" style={{ margin: '0 auto' }} />
                    </h2>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: 24, 
                        color: PALETTE.warmGray, fontStyle: 'italic'
                    }}>Your personalized travel scrapbook</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
                    {timeline.map((day, idx) => {
                        const isEven = idx % 2 !== 0;
                        const activity = day.activities?.[0];
                        const stay = day.stays?.[0];
                        const food = day.food?.[0];
                        const destination = destinations?.find(d => d.id === day.destinationId);
                        
                        // PRIORITY IMAGE SELECTION
                        const dayPhoto = 
                            destination?.image_url || destination?.coverImage || destination?.heroImage || destination?.images?.[0] || 
                            "https://placehold.co/600x400/f8f9fa/a0aec0?text=No+Image";
                        
                        const rotation = [-2.5, 1.8, -1.2, 2.8, -3.1, 1.5][idx % 6];
                        const cardTilt = idx % 2 === 0 ? -1 : 1;

                        return (
                            <div key={idx} className="scrapbook-card" style={{
                                display: 'flex', 
                                flexDirection: isEven ? 'row-reverse' : 'row',
                                alignItems: 'center', gap: 50, flexWrap: 'wrap',
                                background: PALETTE.paper, borderRadius: '16px',
                                padding: '40px', position: 'relative',
                                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
                                transform: `rotate(${cardTilt}deg)`
                            }}>
                                {/* Tape Masking Effect */}
                                <div style={{
                                    position: 'absolute', top: -10, left: '50%',
                                    transform: 'translateX(-50%)', width: 60, height: 24,
                                    background: PALETTE.tape, borderRadius: '2px', zIndex: 5
                                }} />

                                {/* LEFT: Text Note */}
                                <div style={{ flex: '1 1 350px' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                                        <span style={{
                                            fontFamily: "'Barlow Condensed', sans-serif",
                                            fontWeight: 900, fontSize: 72, color: PALETTE.oceanBlue,
                                            lineHeight: 1
                                        }}>{day.day}</span>
                                        <span style={{ 
                                            fontSize: 20, color: PALETTE.warmGray, fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '2px'
                                        }}>DAY</span>
                                    </div>

                                    <div style={{
                                        display: 'inline-flex', padding: '6px 16px', background: `${PALETTE.oceanBlue}10`,
                                        borderRadius: '999px', color: PALETTE.oceanBlue, fontSize: 13, fontWeight: 800,
                                        marginBottom: 24, alignItems: 'center', gap: 8, border: `1px solid ${PALETTE.oceanBlue}20`
                                    }}>
                                        <span>📍 {destination?.name || day.activities?.[0]?.destinationName || 'Secret Location'}</span>
                                    </div>

                                    <h3 style={{
                                        fontFamily: "'Caveat', cursive", fontSize: 34, color: PALETTE.oceanBlue,
                                        margin: '0 0 16px', fontWeight: 800, lineHeight: 1.2
                                    }}>
                                        {day.activities?.length > 0 ? day.activities.map(a => a.name).join(' & ') : 'Exploration Day'}
                                    </h3>

                                    {/* Dynamic Itinerary Content: Hotel, Activity & Food */}
                                    <div style={{ 
                                        fontFamily: "'Cormorant Garamond', serif", fontSize: 18, 
                                        color: PALETTE.charcoal, fontStyle: 'italic',
                                        paddingTop: 16,
                                        display: 'flex', flexDirection: 'column', gap: 6
                                    }}>
                                        <p style={{ margin: 0 }}>Hotel: {day.stays?.length > 0 ? day.stays.map(s => s.name).join(', ') : 'Not selected'}</p>
                                        <p style={{ margin: 0 }}>Activity: {day.activities?.length > 0 ? day.activities.map(a => a.name).join(', ') : 'Not selected'}</p>
                                        <p style={{ margin: 0 }}>Food: {day.food?.length > 0 ? day.food.map(f => f.name).join(', ') : 'Not selected'}</p>
                                    </div>
                                </div>

                                {/* RIGHT: Polaroid Image */}
                                <div style={{
                                    flex: '0 0 320px', display: 'flex', justifyContent: 'center'
                                }}>
                                        <div className="polaroid-img" style={{
                                        background: 'white', padding: '12px 12px 16px 12px', // Shorter bottom padding
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                                        transform: `rotate(${rotation}deg)`,
                                        width: '100%', maxWidth: '320px'
                                    }}>
                                        <div style={{ 
                                            width: '100%', height: 240, background: '#eee', 
                                            borderRadius: '4px', overflow: 'hidden' 
                                        }}>
                                            <img 
                                                src={dayPhoto} 
                                                alt={activity?.name || destination?.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => { e.target.src = "https://placehold.co/400x300/f8f9fa/a0aec0?text=No+Image"; }}
                                            />
                                        </div>
                                        <div style={{
                                            fontFamily: "'Caveat', cursive", fontSize: 18, color: PALETTE.warmGray,
                                            textAlign: 'center', marginTop: 12, opacity: 0.6
                                        }}>
                                            {destination?.name ? `Exploring ${destination.name}` : "The Adventure"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* ── SECTION 2.5: FEATURED SQUAD HIGHLIGHTS ── */}
            <section style={{ padding: '0 5% 100px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 800, fontSize: 13, letterSpacing: '0.25em',
                        color: PALETTE.oceanBlue, textTransform: 'uppercase', marginBottom: 12
                    }}>SQUAD RECOMMENDATIONS</h3>
                    <div style={{ width: 120, height: 2, background: PALETTE.saffronGold }} />
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 24
                }}>
                    {[...plan.activities, ...plan.food, ...plan.stays]
                        .filter(item => item.isFeatured)
                        .map((item, i) => (
                            <div key={i} className="scrapbook-card" style={{
                                background: PALETTE.white, borderRadius: 20, overflow: 'hidden',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ height: 200, position: 'relative' }}>
                                    <img 
                                        src={item.image_url || item.imageUrl || item.image || item.images?.[0] || "https://placehold.co/600x400/f8f9fa/a0aec0?text=No+Image"} 
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: 12, right: 12,
                                        background: PALETTE.saffronGold, color: PALETTE.white,
                                        borderRadius: '50px', padding: '4px 12px', fontSize: 10,
                                        fontWeight: 800, letterSpacing: '1px'
                                    }}>FEATURED</div>
                                </div>
                                <div style={{ padding: 20 }}>
                                    <h4 style={{ 
                                        fontFamily: "'Barlow Condensed', sans-serif", 
                                        fontWeight: 700, fontSize: 18, color: PALETTE.oceanBlue,
                                        marginBottom: 8 
                                    }}>{item.name}</h4>
                                    <p style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: 16, color: PALETTE.warmGray, fontStyle: 'italic',
                                        margin: 0, lineHeight: 1.4
                                    }}>{item.description || "A truly exceptional highlight of your journey."}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </section>

            {/* ── SECTION 3: FINAL DETAILS FORM ── */}
            <section style={{ 
                background: PALETTE.oceanBlue, 
                padding: '120px 24px',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)'
            }}>
                <div style={{
                    maxWidth: 820, margin: '0 auto', background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '32px', padding: '60px', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 40, right: 40, opacity: 0.1, color: 'white' }}>
                        <Compass size={120} strokeWidth={1} />
                    </div>

                    <h2 style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 800, fontSize: 48, color: 'white', letterSpacing: '2px',
                        margin: '0 0 16px'
                    }}>REFINING YOUR JOURNEY</h2>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                        fontSize: 20, color: 'rgba(255,255,255,0.7)', marginBottom: 48
                    }}>Complete the final brushstrokes of your bespoke travel story.</p>

                    <form onSubmit={submitInquiry}>
                        {errorMessage && (
                            <div style={{
                                padding: 16, background: 'rgba(231,76,60,0.1)', borderRadius: 12,
                                color: '#e74c3c', fontSize: 14, fontWeight: 700, marginBottom: 32,
                                border: '1px solid rgba(231,76,60,0.2)'
                            }}>{errorMessage}</div>
                        )}

                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 32, marginBottom: 48
                        }}>
                            <InputField label="Your Name" value={config.userName} onChange={v => setConfig({...config, userName: v})} />
                            <InputField label="Email Address" value={config.userEmail} onChange={v => setConfig({...config, userEmail: v})} />
                            <InputField label="Phone Number" value={config.userPhone} onChange={v => setConfig({...config, userPhone: v})} />
                            <InputField label="Start Date" value={config.startDate} type="date" onChange={v => setConfig({...config, startDate: v})} />
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 40 }}>
                            <div style={{ marginBottom: 40 }}>
                                <p style={{
                                    fontSize: 12, fontWeight: 700, letterSpacing: '2px',
                                    color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase'
                                }}>ESTIMATED TOTAL BUDGET</p>
                                <span style={{
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontWeight: 900, fontSize: 72, color: PALETTE.saffronGold
                                }}>₹{budget.toLocaleString()}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                <button type="button" onClick={prevStep} style={{
                                    flex: 1, padding: '18px 32px', borderRadius: '12px', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent', color: 'white', fontWeight: 600, 
                                    cursor: 'pointer', transition: 'all 0.3s'
                                }}>EDIT PLAN</button>
                                <button type="submit" disabled={isSubmitting} style={{
                                    flex: 1.5, padding: '18px 40px', borderRadius: '12px', 
                                    background: PALETTE.saffronGold,
                                    color: PALETTE.charcoal, fontWeight: 800, fontSize: 18, border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', gap: 12, transition: 'all 0.3s'
                                }}>
                                    {isSubmitting ? 'Sending...' : 'CONFIRM INQUIRY'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '1px', 
            color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase'
        }}>{label}</label>
        <input 
            type={type} value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '16px 20px', color: 'white', outline: 'none',
                fontFamily: 'inherit', fontSize: 16, transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
    </div>
);

export default Step4Preview;
