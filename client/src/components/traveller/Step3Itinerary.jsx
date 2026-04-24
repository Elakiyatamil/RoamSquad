import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, MapPin, Sparkles, ChevronUp, ChevronDown, Heart, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   ASSET LOOKUP — Preferred production images
────────────────────────────────────────────── */
const DESTINATION_IMAGES = {
  'TOKYO': '/assets/destinations/tokyo.png',
  'EDINBURGH': '/assets/destinations/edinburgh.png',
  'GOA': '/assets/destinations/goa.png',
  'SAHARA': '/assets/destinations/sahara.png',
  'SANTORINI': '/assets/destinations/santorini.png',
  'BALI': '/assets/destinations/bali.png',
  'ICELAND': '/assets/destinations/iceland.png',
};

// Fallback images for categories when admin has not provided an image
const NO_IMAGE = 'https://placehold.co/600x400/f8f9fa/a0aec0?text=Image+Needed';

// Utility to resolve image URLs from the backend
const getImgUrl = (item) => {
  if (!item) return null;
  const url = item.image_url || item.imageUrl || item.images?.[0] || item.coverImage || item.bannerImage;
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const CATEGORY_FALLBACKS = {
  activities: NO_IMAGE,
  food: NO_IMAGE,
  hotel: NO_IMAGE,
  hiking: NO_IMAGE,
  castle: NO_IMAGE,
};

/* ─────────────────────────────────────────────
   PARTICLE BURST — Pure Canvas implementation
────────────────────────────────────────────── */
const ParticleBurst = ({ trigger }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#22c55e', '#15803d', '#bbf7d0', '#fbbf24'];

    for (let i = 0; i < 15; i++) {
      particles.current.push({
        x: 60, y: 60,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, 120, 120);
      particles.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.25; p.life -= 0.025;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.current.splice(i, 1);
      });
      if (particles.current.length > 0) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas 
      ref={canvasRef} width={120} height={120} 
      className="absolute pointer-events-none z-50" 
      style={{ left: -42, top: -42 }} 
    />
  );
};

/* ─────────────────────────────────────────────
   TYPEWRITER HOOK — Pure React
────────────────────────────────────────────── */
const useTypewriter = (text, speed = 60) => {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [blurAmount, setBlurAmount] = useState(10);

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayed('');
    setBlurAmount(10);
    setShowCursor(true);

    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      setBlurAmount(Math.max(0, 10 - (i * 10 / text.length)));
      if (i >= text.length) {
        clearInterval(interval);
        setBlurAmount(0);
        let blinks = 0;
        const blink = setInterval(() => {
          setShowCursor(p => !p);
          blinks++;
          if (blinks >= 6) { clearInterval(blink); setShowCursor(false); }
        }, 200);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, showCursor, blurAmount };
};

/* ─────────────────────────────────────────────
   IMAGE WITH SHIMMER — CSS Transition based
────────────────────────────────────────────── */
const ImageWithShimmer = ({ src, alt, style }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ ...style, position: 'relative', overflow: 'hidden', background: '#f0f2f0' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          animation: 'shimmer 1.5s infinite linear',
          zIndex: 1
        }} />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease-out' }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   ANIMATED BUDGET COUNTER
────────────────────────────────────────────── */
const AnimatedBudget = ({ value }) => {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const raf = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(raf);
      else prevRef.current = end;
    };
    requestAnimationFrame(raf);
  }, [value]);

  return <span>₹{displayed.toLocaleString()}</span>;
};

/* ─────────────────────────────────────────────
   EXPERIENCE CARD — Glassmorphic List Item
────────────────────────────────────────────── */
const ExperienceCard = ({ item, isAdded, onToggle, type }) => {
  const [particleTrigger, setParticleTrigger] = useState(0);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAdded) setParticleTrigger(p => p + 1);
    onToggle();
  };

  const displayName = item.name || (item.tier ? `${item.tier} Stay` : 'Experience');
  const displayPrice = item.price || item.cost || 0;
  const displayDuration = item.duration || (type === 'stay' ? 'Per night' : null);

  return (
    <div
      className="exp-card"
      style={{
        background: 'white',
        borderRadius: 20,
        border: isAdded ? '1.5px solid #0f4a23' : '1px solid rgba(0,0,0,0.05)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isAdded ? '0 10px 30px rgba(15,74,35,0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
        position: 'relative'
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 60, height: 60, borderRadius: 14,
        background: '#f8f9fa', flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.03)'
      }}>
        <ImageWithShimmer 
          src={getImgUrl(item) || CATEGORY_FALLBACKS[type] || CATEGORY_FALLBACKS.activities} 
          alt={displayName} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <div style={{ 
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, 
          color: '#1a1a1a', letterSpacing: '0.02em',
          marginBottom: 8
        }}>
          {displayName}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#0f4a23', fontWeight: 700, marginBottom: 4 }}>
          ₹{displayPrice.toLocaleString()}
        </div>
        {displayDuration && (
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 2, letterSpacing: '0.05em' }}>
            {displayDuration.toUpperCase()}
          </div>
        )}
      </div>

      {/* Action */}
      <div style={{ position: 'relative', height: 34, display: 'flex', alignItems: 'center' }}>
        <ParticleBurst trigger={particleTrigger} />
        <button
          onClick={handleClick}
          style={{
            width: 38, height: 38, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: isAdded ? 'none' : '1.5px solid rgba(15,74,35,0.15)',
            background: isAdded ? '#0f4a23' : 'transparent',
            color: isAdded ? 'white' : '#0f4a23',
            cursor: 'pointer', transition: 'all 0.2s ease',
            alignSelf: 'center'
          }}
        >
          {isAdded ? <Trash2 size={16} /> : <Plus size={20} />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .exp-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 15px 35px rgba(0,0,0,0.06); }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   FAN CAROUSEL — 5 Card Deck Logic (Fix 3)
────────────────────────────────────────────── */
const FanCarousel = ({ items, isAddedFn, onToggleFn, type }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const handleNext = () => setActiveIndex(p => (p + 1) % items.length);
  const handlePrev = () => setActiveIndex(p => (p - 1 + items.length) % items.length);

  return (
    <div style={{ 
      position: 'relative', width: '100%', height: 420, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', padding: '20px 0'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120%', height: 1, background: 'rgba(15,74,35,0.05)', zIndex: 0
      }} />

      <div style={{ 
        position: 'relative', width: '100%', maxWidth: 1000, 
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {items.map((item, idx) => {
          // Calculate relative position to activeIndex
          let diff = idx - activeIndex;
          if (diff > items.length / 2) diff -= items.length;
          if (diff < -items.length / 2) diff += items.length;

          // Only render +/- 2 cards
          const absDiff = Math.abs(diff);
          if (absDiff > 2) return null;

          // Logic for fan layout
          const x = diff * 220; // Horizontal spacing
          const rotation = diff * 8; // Fan rotation
          const scale = 1 - absDiff * 0.15; // Depth scale
          const opacity = 1 - absDiff * 0.35; // Fade effect
          const zIndex = 10 - absDiff;
          const y = absDiff * 20; // Vertical "curve"

          const isCenter = diff === 0;

          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                position: 'absolute',
                width: 200, height: 280,
                transform: `translateX(${x}px) translateY(${y}px) scale(${scale}) rotate(${rotation}deg)`,
                opacity, zIndex,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '100%', height: '100%',
                background: 'white', borderRadius: 24, overflow: 'hidden',
                boxShadow: isCenter ? '0 30px 60px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.08)',
                border: isAddedFn(type, item) ? '2px solid #0f4a23' : '1px solid rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column'
              }}>
                <img 
                  src={getImgUrl(item) || CATEGORY_FALLBACKS[type] || CATEGORY_FALLBACKS.activities} 
                  style={{ height: '60%', width: '100%', objectFit: 'cover' }} 
                  alt={item.name}
                />
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ 
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, 
                      lineHeight: 1.2, color: '#1a1a1a', marginBottom: 4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontStyle: 'italic', color: '#0f4a23', fontWeight: 600 }}>
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>

                  {isCenter && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFn(type, item); }}
                      style={{
                        width: '100%', background: isAddedFn(type, item) ? '#ef4444' : '#0f4a23',
                        color: 'white', border: 'none', borderRadius: 50, padding: '8px 0',
                        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 10,
                        letterSpacing: '0.05em', cursor: 'pointer', animation: 'fadeIn 0.4s'
                      }}
                    >
                      {isAddedFn(type, item) ? 'REMOVE FROM TRIP' : 'ADD TO STORY'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav Arrows */}
      <button 
        onClick={handlePrev}
        className="nav-arrow" style={{ left: 40 }}
      >
        <ChevronUp style={{ transform: 'rotate(-90deg)' }} size={20} />
      </button>
      <button 
        onClick={handleNext}
        className="nav-arrow" style={{ right: 40 }}
      >
        <ChevronUp style={{ transform: 'rotate(90deg)' }} size={20} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .nav-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44; height: 44; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1);
          background: white; color: #0f4a23; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; z-index: 20;
        }
        .nav-arrow:hover { background: #0f4a23; color: white; box-shadow: 0 10px 20px rgba(15,74,35,0.2); }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION HEADER — Gradient + Trailing Line
────────────────────────────────────────────── */
const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 48 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <h3 style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13,
        letterSpacing: '0.25em', color: '#0f4a23', margin: 0, whiteSpace: 'nowrap',
        background: 'linear-gradient(90deg, #0f4a23, #16a34a)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        {title.toUpperCase()}
      </h3>
      <div style={{ flex: 1, height: 1, background: 'rgba(15,74,35,0.1)' }} />
    </div>
    {subtitle && (
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18,
        color: 'rgba(15,74,35,0.6)', marginTop: 8
      }}>
        {subtitle}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   CATEGORY SECTION — FoodEat Style (Fix 4 & 5)
────────────────────────────────────────────── */
const CategorySection = ({ type, title, items, isAddedFn, onToggleFn, heroImage }) => {
  if (!items || items.length === 0) return null;

  // Find featured item from admin dashboard toggle, fallback to first item
  const featured = items.find(i => i.isFeatured) || items[0];
  const gridItems = items.filter(i => i.id !== featured.id);

  return (
    <div style={{ marginBottom: 80 }}>
      <SectionHeader title={title} />
      
      {/* Category Hero Banner */}
      <div className="category-hero-banner" style={{
        display: 'flex', background: '#f8f9fa', borderRadius: 32,
        overflow: 'hidden', marginBottom: 40, border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative'
      }}>
        <div className="category-hero-text" style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ 
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, 
            letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', marginBottom: 16 
          }}>
            FEATURED {type.toUpperCase()}
          </div>
          <h4 style={{ 
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 32, 
            color: '#1a1a1a', margin: '0 0 16px', lineHeight: 1.1 
          }}>
            {featured.name}
          </h4>
          <p style={{ 
            fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'rgba(0,0,0,0.6)', 
            marginBottom: 32, maxWidth: 400 
          }}>
            Experience the finest {type} curated by our squad for your unique journey.
          </p>
          <button
            onClick={() => onToggleFn(type, featured)}
            style={{
              width: 'fit-content', padding: '14px 32px', borderRadius: 50,
              background: isAddedFn(type, featured) ? '#ef4444' : '#0f4a23',
              color: 'white', border: 'none', fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isAddedFn(type, featured) ? 'REMOVE FROM TRIP' : 'ADD TO STORY'}
          </button>
        </div>
        
        <div className="category-hero-image-container" style={{ flex: 1.2, position: 'relative', minHeight: 300 }}>
          <img 
            src={getImgUrl(featured) || heroImage || CATEGORY_FALLBACKS[type]} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            alt="Category Hero"
          />
          {/* Floating Circle Image — Refined positioning to avoid overlap */}
          <div className="floating-circle-img" style={{
            position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)',
            width: 140, height: 140, borderRadius: '50%', border: '6px solid white',
            overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 12
          }}>
            <img 
              src={getImgUrl(featured) || CATEGORY_FALLBACKS[type]} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Detail"
            />
          </div>
        </div>
      </div>

      {/* Grid of other items */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 24 
      }}>
        {gridItems.map(item => (
          <ExperienceCard
            key={item.id}
            item={item}
            isAdded={isAddedFn(type, item)}
            onToggle={() => onToggleFn(type, item)}
            type={type}
          />
        ))}
      </div>
    </div>
  );
};
/* ─────────────────────────────────────────────
   TIMELINE PANEL — Reference 4 Style
────────────────────────────────────────────── */
const TripPlanPanel = ({ plan, config, budget, timeline, onWishlist, onReview }) => {
  const allItems = [...plan.activities, ...plan.food, ...plan.stays];

  return (
    <div style={{
      width: '100%',
      maxWidth: 320,
      background: 'white',
      borderRadius: 20,
      border: '1px solid rgba(0,0,0,0.08)',
      padding: '32px 28px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      position: 'sticky',
      top: 80,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }} className="custom-scrollbar">
      {/* Vertical Timeline Line */}
      <div style={{
        position: 'absolute', left: 42, top: 80, bottom: 120,
        width: 2,
        background: 'linear-gradient(to bottom, #0f4a23, rgba(15,74,35,0.1))',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {timeline.map((t, dayIdx) => {
          const hasItems = t.activities.length > 0;
          return (
            <div key={`day-${t.day}`} style={{ marginBottom: 40 }}>
              {/* Day Circle */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11,
                letterSpacing: '0.1em',
                background: hasItems ? '#0f4a23' : 'white',
                color: hasItems ? 'white' : '#0f4a23',
                border: hasItems ? 'none' : '2px dashed rgba(15,74,35,0.3)',
                boxShadow: hasItems ? '0 4px 12px rgba(15,74,35,0.2)' : 'none',
                position: 'relative'
              }}>
                D{t.day}
                {hasItems && (
                  <div className="pulse-dot" style={{
                    position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%', background: '#E85D04'
                  }} />
                )}
              </div>

              {/* Items in Day */}
              <div style={{ marginTop: 16 }}>
                {t.activities.map((item, idx) => (
                  <div
                    key={item.planId}
                    className="timeline-item-card"
                    style={{
                      background: 'rgba(15,74,35,0.04)',
                      border: '1px solid rgba(15,74,35,0.12)',
                      borderRadius: 12, padding: '10px 14px',
                      marginLeft: 52, marginBottom: 8,
                      display: 'flex', alignItems: 'center', gap: 12,
                      animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={getImgUrl(item) || CATEGORY_FALLBACKS.activities} 
                      alt="" 
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 13, 
                        color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 12, color: '#0f4a23' }}>
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary - Sticky inside panel */}
      <div style={{
        marginTop: 'auto',
        position: 'sticky', bottom: -32,
        background: 'white',
        borderTop: '2px solid #0f4a23',
        padding: '20px 0 0',
        zIndex: 10
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 10,
          letterSpacing: '0.2em', color: '#0f4a23', textTransform: 'uppercase'
        }}>
          EST. BUDGET
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 40,
          color: '#E85D04', lineHeight: 1
        }}>
          <AnimatedBudget value={budget} />
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: 'rgba(0,0,0,0.35)', marginBottom: 20 }}>
          Excl. stays & flights
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onWishlist}
            disabled={allItems.length === 0}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 50,
              border: '1.5px solid #0f4a23', background: 'transparent', color: '#0f4a23',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 200ms'
            }}
          >
            Wishlist
          </button>
          <button
            onClick={onReview}
            disabled={allItems.length === 0}
            style={{
              flex: 1.5, padding: '11px 16px', borderRadius: 50,
              background: 'linear-gradient(135deg, #0f4a23, #16a34a)',
              border: 'none', color: 'white',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12,
              letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 200ms'
            }}
          >
            Review Inquiry →
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.4); }
        }
        .pulse-dot { animation: pulse 2s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15,74,35,0.1); borderRadius: 10px; }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   MOBILE BOTTOM SHEET
────────────────────────────────────────────── */
const MobileBottomSheet = ({ plan, config, budget, timeline, totalActivityTime, onWishlist, onReview, isOverScheduled }) => {
  const [expanded, setExpanded] = useState(false);
  const allItems = [...plan.activities, ...plan.food, ...plan.stays];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'linear-gradient(160deg, #0f3320 0%, #071a0d 100%)',
      borderRadius: '24px 24px 0 0',
      border: '1px solid rgba(255,255,255,0.1)',
      height: expanded ? '85vh' : '88px',
      transition: 'height 500ms cubic-bezier(0.32, 0.72, 0, 1)',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      overflow: 'hidden',
      boxShadow: '0 -10px 50px rgba(0,0,0,0.5)',
    }}>
      {/* Handle / Tap Area */}
      <div
        onClick={() => setExpanded(p => !p)}
        onDragStart={(e) => e.preventDefault()}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '16px 0 12px', 
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.03)'
        }}
      >
        <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }} />
        {!expanded ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%', 
            padding: '12px 24px 0' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                CURRENT PLAN
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: 'white', fontWeight: 700 }}>
                {allItems.length} items · <span style={{ color: '#f59e0b' }}>₹{budget.toLocaleString()}</span>
              </span>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 50, 
              padding: '6px 14px',
              fontFamily: "'Barlow Condensed', sans-serif", 
              fontSize: 11, 
              color: 'white',
              fontWeight: 700,
              display: 'flex', 
              alignItems: 'center', 
              gap: 6 
            }}>
              <ChevronUp size={14} color="#E85D04" /> VIEW SUMMARY
            </div>
          </div>
        ) : (
          <div style={{ padding: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronDown size={16} color="rgba(255,255,255,0.3)" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em' }}>
              COLLAPSE
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', overflowY: 'auto', height: 'calc(100% - 60px)' }}>
          <TripPlanPanel
            plan={plan} config={config} budget={budget} timeline={timeline}
            totalActivityTime={totalActivityTime} onWishlist={onWishlist}
            onReview={onReview} isOverScheduled={isOverScheduled}
          />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SPLIT HERO PANELS — 100vh Cinematic Entrance
────────────────────────────────────────────── */
const SplitHeroPanels = () => {
  const panels = [
    {
      url: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=2560&q=100', // Ocean / Goa style
      label: 'ADVENTURE',
      pos: 'center center',
    },
    {
      url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2560&q=100', // Desert / Sahara style
      label: 'DISCOVER',
      center: true,
      pos: 'center center',
    },
    {
      url: 'https://images.unsplash.com/photo-1476611317561-60117649dd94?auto=format&fit=crop&w=2560&q=100', // Forest / Switzerland style
      label: 'CULTURE',
      pos: 'center 40%',
    },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '60vh', 
      minHeight: '400px', 
      overflow: 'hidden',
      position: 'relative',
      maxWidth: '100vw'
    }}>
      {panels.map((p, i) => (
        <div
          key={i}
          className="hero-panel"
          style={{
            flex: 'none',
            width: '33.333%',
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: p.center ? 2 : 1,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${p.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: p.pos,
            transition: 'transform 0.8s ease',
            filter: 'none',
            opacity: 1
          }} className="hero-img" />
          
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
            filter: 'none',
            opacity: 1
          }} />

          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(9px, 2.5vw, 13px)',
            color: 'white',
            letterSpacing: '0.1em',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            margin: 0,
            pointerEvents: 'none',
            position: 'absolute',
            bottom: '12px',
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '0 4px',
            wordWrap: 'break-word'
          }}>
            {p.label}
          </h2>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-panel:hover { flex: 1.4; }
        .hero-panel:hover .hero-img { transform: scale(1.05); }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   DESTINATION HERO (after selection)
────────────────────────────────────────────── */
const DestinationHero = ({ destinationName, countryName, stateName, config, heroImage }) => {
  const { displayed, showCursor, blurAmount } = useTypewriter(destinationName?.toUpperCase(), 60);
  const [subVisible, setSubVisible] = useState(false);

  useEffect(() => {
    setSubVisible(false);
    if (!destinationName) return;
    const t = setTimeout(() => setSubVisible(true), (destinationName.length * 60) + 400);
    return () => clearTimeout(t);
  }, [destinationName]);

  const searchKey = destinationName?.toUpperCase() || '';
  const lookupUrl = DESTINATION_IMAGES[searchKey] || Object.keys(DESTINATION_IMAGES).find(k => searchKey.includes(k)) && DESTINATION_IMAGES[Object.keys(DESTINATION_IMAGES).find(k => searchKey.includes(k))];
  const heroUrl = heroImage || lookupUrl || NO_IMAGE;

  return (
    <div style={{
      position: 'relative', width: '100%', height: '60vh', minHeight: 400, overflow: 'hidden',
      marginBottom: -80,
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('${heroUrl}')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Centered Content */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center',
        padding: '0 40px', textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600, fontSize: 13, letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 12,
          opacity: 0, animation: 'fadeInDown 0.5s forwards'
        }}>
          YOUR JOURNEY TO
        </p>

        {/* Typewriter name */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(64px,10vw,160px)',
          color: 'white', lineHeight: 0.85,
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.1s ease-out'
        }}>
          {displayed}
          {showCursor && (
            <span style={{ opacity: 1, color: '#E85D04' }}>|</span>
          )}
        </div>

        <div style={{ 
          opacity: subVisible ? 1 : 0, 
          transform: subVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out',
          marginTop: 20 
        }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 400, fontSize: 18, letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'uppercase',
          }}>
            {stateName && `${stateName} · `}{countryName}
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   GLASS DROPDOWN — Custom Premium Select
   (Fix for Step 3 District Selector)
────────────────────────────────────────────── */
const GlassDropdown = ({ value, opts, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOpt = opts.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="glass-trigger"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ 
          color: selectedOpt ? 'white' : 'rgba(255, 255, 255, 0.6)', 
          fontSize: 14, 
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'white', 
            transition: 'transform 0.4s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
          }} 
        />
      </div>

      {/* Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 14,
            padding: 8,
            zIndex: 100,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            maxHeight: 280,
            overflowY: 'auto',
            animation: 'dropdownFadeSlide 0.15s ease-out'
          }}
        >
          {opts.length === 0 ? (
            <div style={{ padding: '10px 12px', color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, fontStyle: 'italic' }}>
              No options available
            </div>
          ) : opts.map(opt => {
            const isSelected = opt.id === value;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className="glass-item"
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  color: isSelected ? '#bbf7d0' : 'rgba(255, 255, 255, 0.7)',
                  background: isSelected ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: 2,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: 13 }}>{opt.label}</span>
                {isSelected && <Check size={14} color="#22c55e" />}
              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dropdownFadeSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-trigger:hover { 
          background: rgba(15, 23, 42, 0.75) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }
        .glass-item:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          transform: scale(1.02);
          color: white !important;
        }
        .glass-panel::-webkit-scrollbar { width: 4px; }
        .glass-panel::-webkit-scrollbar-track { background: transparent; }
        .glass-panel::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

/* ─────────────────────────────────────────────
   DESTINATION SELECTOR BAR
────────────────────────────────────────────── */
const DestinationSelectorBar = ({
  countries, states, districts, destinations,
  selectedCountry, selectedState, selectedDistrict, selectedDestinationId,
  onCountryChange, onStateChange, onDistrictChange, onDestinationChange,
}) => {
  return (
    <div style={{
      position: 'relative',
      marginTop: -60,
      zIndex: 10,
      background: 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 20,
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      gap: 16,
      flexWrap: 'wrap',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {[
        { label: 'COUNTRY', value: selectedCountry, opts: (countries || []).map(c => ({ id: c.id, label: c.name })), onChange: onCountryChange },
        { label: 'STATE', value: selectedState, opts: (states || []).map(s => ({ id: s.id, label: s.name })), onChange: onStateChange },
        { label: 'DISTRICT', value: selectedDistrict, opts: (districts || []).map(d => ({ id: d.id, label: d.name })), onChange: onDistrictChange },
        { label: 'DESTINATION', value: selectedDestinationId, opts: (destinations || []).map(d => ({ id: d.id, label: d.name })), onChange: onDestinationChange },
      ].map(({ label, value, opts, onChange }) => (
        <div key={label} style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
            {label}
          </span>
          <GlassDropdown 
            placeholder={`Select ${label.charAt(0) + label.slice(1).toLowerCase()}`}
            value={value}
            opts={opts}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SCRAPBOOK DESTINATION SELECTOR
────────────────────────────────────────────── */
const ScrapbookDestinationSelector = ({ destinations, selectedId, onSelect }) => {
  const scrollRef = useRef(null);

  return (
    <div style={{ 
      marginBottom: 60, 
      background: '#fdfcf0', // Soft beige/parchment
      padding: '40px 30px', 
      borderRadius: 40,
      border: '1px solid rgba(15,74,35,0.05)',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f4a23' }} />
        <span style={{ 
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, 
          letterSpacing: '0.15em', color: '#0f4a23', textTransform: 'uppercase' 
        }}>
          PIN YOUR DESTINATION
        </span>
      </div>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        className="hide-scrollbar scrapbook-scroll"
        style={{
          display: 'flex',
          gap: 32,
          padding: '20px 10px 40px',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          cursor: 'grab'
        }}
      >
        {destinations.map((dest, i) => {
          const isSelected = dest.id === selectedId;
          // Random rotation for scrapbook feel
          const rotation = ((i % 5) - 2) * 1.5; 

          return (
            <div
              key={dest.id}
              onClick={() => onSelect(dest.id)}
              style={{
                flex: '0 0 240px',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                position: 'relative',
                transform: `rotate(${rotation}deg) ${isSelected ? 'scale(1.05)' : 'scale(1)'}`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isSelected ? 10 : 1
              }}
            >
              {/* Tape Effect */}
              <div style={{
                position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
                width: 60, height: 24, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)', zIndex: 5, pointerEvents: 'none'
              }} />

              {/* Polaroid Frame */}
              <div style={{
                background: 'white',
                padding: '12px 12px 48px',
                borderRadius: 4,
                boxShadow: isSelected 
                  ? '0 0 25px rgba(232, 93, 4, 0.4), 0 15px 45px rgba(0,0,0,0.15)' 
                  : '0 10px 30px rgba(0,0,0,0.1)',
                border: isSelected ? '2.5px solid #E85D04' : '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{ 
                  width: '100%', height: 200, background: '#f8f9fa', 
                  borderRadius: 2, overflow: 'hidden' 
                }}>
                  <ImageWithShimmer 
                    src={getImgUrl(dest.heroImage || dest.coverImage || dest.images?.[0]) || DESTINATION_IMAGES[dest.name?.toUpperCase()] || NO_IMAGE} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                {/* Handwritten Label */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
                  fontFamily: "'Caveat', cursive", fontSize: 24, color: '#1a1a1a', transform: 'rotate(-2deg)'
                }}>
                  {dest.name}
                </div>

                {/* Location Tag */}
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <MapPin size={8} color="white" />
                  <span style={{ fontSize: 8, color: 'white', fontWeight: 800 }}>{dest.category?.toUpperCase()}</span>
                </div>
              </div>

              {/* Selection Status */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', bottom: -25, left: '50%', transform: 'translateX(-50%)',
                      background: '#0f4a23', color: 'white', padding: '4px 12px', borderRadius: 50,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 4px 12px rgba(15,74,35,0.3)'
                    }}
                  >
                    <Check size={10} /> SELECTED
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Caption */}
              <div style={{
                position: 'absolute', bottom: -50, left: 0, right: 0, textAlign: 'center',
                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 12,
                color: 'rgba(15,74,35,0.4)', opacity: isSelected ? 1 : 0.6
              }}>
                "A place worth exploring"
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrapbook-scroll:active { cursor: grabbing; }
        .scrapbook-scroll { scroll-behavior: smooth; }
      `}} />
    </div>
  );
};


/* ─────────────────────────────────────────────
   MAIN STEP 3 COMPONENT
────────────────────────────────────────────── */
const Step3Itinerary = ({
  config,
  plan, setPlan, budget, setBudget,
  timeline,
  activities, food, stays,
  countries, states, districts, destinations,
  selectedCountry, selectedState, selectedDistrict, selectedDestinationId,
  daySelectedDestinations, selectedDay, setSelectedDay,
  onCountryChange, onStateChange, onDistrictChange, onDestinationChange,
  totalActivityTime, isOverScheduled,
  onWishlist, onReview,
  heroAnimIn,
}) => {

  const selectedDestName = destinations?.find(d => d.id === selectedDestinationId)?.name || '';
  const selectedStateName = states?.find(s => s.id === selectedState)?.name || '';
  const selectedCountryName = countries?.find(c => c.id === selectedCountry)?.name || '';

  const addToPlan = (type, item, targetDay = null) => {
    const planKey = type === 'activity' ? 'activities' : type === 'food' ? 'food' : 'stays';
    const itemId = `${selectedDestinationId}-${item.id}${targetDay ? `-day${targetDay}` : ''}`;
    setPlan(prev => {
      const isSelected = prev[planKey].find(i => i.planId === itemId);
      let updated;
      if (isSelected) {
        updated = { ...prev, [planKey]: prev[planKey].filter(i => i.planId !== itemId) };
      } else {
        updated = {
          ...prev,
          [planKey]: [...prev[planKey], {
            ...item, planId: itemId, type,
            day: targetDay,
            destinationId: selectedDestinationId,
            destinationName: selectedDestName,
          }],
        };
      }
      setBudget([...updated.activities, ...updated.food, ...updated.stays].reduce((s, i) => s + (i.price || i.cost || 0), 0));
      return updated;
    });
  };

  const isAdded = (type, item, targetDay) => {
    const planKey = type === 'activity' ? 'activities' : type === 'food' ? 'food' : 'stays';
    const itemId = `${selectedDestinationId}-${item.id}${targetDay ? `-day${targetDay}` : ''}`;
    return !!plan[planKey].find(i => i.planId === itemId);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'white' }}>
      {/* ── HERO SECTION ── */}
      <div style={{ position: 'relative', width: '100%', height: '60vh' }}>
        {!selectedDestinationId ? (
          <SplitHeroPanels />
        ) : (
          <DestinationHero
            destinationName={selectedDestName}
            countryName={selectedCountryName}
            stateName={selectedStateName}
            config={config}
            heroImage={destinations?.find(d => d.id === selectedDestinationId)?.coverImage || destinations?.find(d => d.id === selectedDestinationId)?.images?.[0]}
          />
        )}

      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 60px' }}>
        <DestinationSelectorBar
          countries={countries}
          states={states}
          districts={districts}
          destinations={destinations}
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedDestinationId={selectedDestinationId}
          onCountryChange={onCountryChange}
          onStateChange={onStateChange}
          onDistrictChange={onDistrictChange}
          onDestinationChange={onDestinationChange}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 320px',
        gap: 60,
        padding: '100px 60px 140px',
        maxWidth: 1600,
        margin: '0 auto',
      }} className="step3-grid">
        
        {/* LEFT: Experiences */}
        <div>
          <div style={{ marginBottom: 80 }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 'clamp(48px, 6vw, 92px)', letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #0f4a23 0%, #16a34a 50%, #22c55e 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: '0 0 20px'
            }}>
              CURATED EXPERIENCES
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              fontSize: 22, color: 'rgba(15,74,35,0.6)', maxWidth: 600
            }}>
              {selectedDestName
                ? `Handpicked narratives for your ${config.vibes?.[0] || 'bespoke'} journey through ${selectedDestName}.`
                : 'Choose your next chapter by selecting a destination above.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Day selection */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, overflowX: 'auto', paddingBottom: 10 }} className="hide-scrollbar">
              {Array.from({ length: config.days }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '12px 32px', borderRadius: 50,
                    background: selectedDay === day ? '#0f4a23' : 'transparent',
                    color: selectedDay === day ? 'white' : '#0f4a23',
                    border: selectedDay === day ? 'none' : '1px solid rgba(15,74,35,0.2)',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  DAY {day}
                </button>
              ))}
            </div>

            {/* SCRAPBOOK DESTINATION SELECTOR */}
            <ScrapbookDestinationSelector 
              destinations={destinations || []}
              selectedId={selectedDestinationId}
              onSelect={onDestinationChange}
            />

            {!selectedDestinationId ? (
              <div style={{
                padding: '120px 0', textAlign: 'center',
                background: 'rgba(15,74,35,0.02)', borderRadius: 40,
                border: '2px dashed rgba(15,74,35,0.1)',
                marginTop: 20
              }}>
                <MapPin size={48} style={{ margin: '0 auto 20px', color: 'rgba(15,74,35,0.1)' }} />
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: 'rgba(15,74,35,0.3)' }}>
                  SELECT A DESTINATION FOR DAY {selectedDay}
                </p>
              </div>
            ) : (
              <>

              {/* Activities — FAN CAROUSEL */}
              {activities.length > 0 && (
                <div style={{ marginBottom: 100 }}>
                  <SectionHeader 
                    title="Daily Adventures" 
                    subtitle={`Explore the top experiences for Day ${selectedDay}. Click to center, swipe to browse.`} 
                  />
                  <FanCarousel 
                    items={activities}
                    isAddedFn={(t, i) => isAdded(t, i, selectedDay)}
                    onToggleFn={(t, i) => addToPlan(t, i, selectedDay)}
                    type="activity"
                  />
                </div>
              )}
              {/* Food Section — FOOD-EAT Style */}
              <CategorySection
                type="food"
                title="Gastronomy"
                items={food}
                heroImage={CATEGORY_FALLBACKS.food}
                isAddedFn={(t, i) => isAdded(t, i, selectedDay)}
                onToggleFn={(t, i) => addToPlan(t, i, selectedDay)}
              />

              {/* Stays Section — FOOD-EAT Style */}
              <CategorySection
                type="hotel"
                title="Boutique Stays"
                items={stays}
                heroImage={CATEGORY_FALLBACKS.hotel}
                isAddedFn={(t, i) => isAdded(t, i, selectedDay)}
                onToggleFn={(t, i) => addToPlan(t, i, selectedDay)}
              />
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Trip Plan Panel — desktop only */}
        <div className="step3-sidebar">
          <TripPlanPanel
            plan={plan}
            config={config}
            budget={budget}
            timeline={timeline}
            onWishlist={onWishlist}
            onReview={onReview}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="step3-mobile-sheet">
        <MobileBottomSheet
          plan={plan}
          config={config}
          budget={budget}
          timeline={timeline}
          onWishlist={onWishlist}
          onReview={onReview}
        />
      </div>

      {/* Responsive styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Barlow+Condensed:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap');

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .step3-sidebar { display: block; }
        .step3-mobile-sheet { display: none; }

        @media (max-width: 1024px) {
          .step3-grid { grid-template-columns: 1fr 260px !important; gap: 30px !important; padding: 60px 30px !important; }
        }

        @media (max-width: 768px) {
          .step3-grid { grid-template-columns: 1fr !important; padding: 60px 20px 160px !important; }
          .step3-sidebar { display: none !important; }
          .step3-mobile-sheet { display: block !important; }
          .category-hero-banner { flex-direction: column !important; height: auto !important; }
          .category-hero-text { padding: 32px 24px !important; }
          .category-hero-image-container { height: 250px !important; }
          .floating-circle-img { width: 100px !important; height: 100px !important; left: 20px !important; top: -50px !important; transform: none !important; }
          .exp-card { padding: 20px 24px !important; gap: 20px !important; }
        }
      `}} />
    </div>
  );
};

export default Step3Itinerary;
