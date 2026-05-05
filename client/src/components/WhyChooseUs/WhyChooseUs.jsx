import React from 'react';
import { motion } from 'framer-motion';
import './WhyChooseUs.css';

const floatingImages = [
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320', pos: { top: '8%',    left: '3%'   }, rotate: -4, float: 4.0, delay: 0,   sunOffset: 0   },
  { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=320', pos: { top: '15%',   left: '18%'  }, rotate:  3, float: 5.5, delay: 0.1, sunOffset: 30  },
  { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=320', pos: { top: '5%',    right: '4%'  }, rotate:  5, float: 6.0, delay: 0.2, sunOffset: 60  },
  { src: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=320', pos: { top: '20%',   right: '16%' }, rotate: -3, float: 4.5, delay: 0.3, sunOffset: 45  },
  { src: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=320', pos: { bottom: '10%', left: '4%'  }, rotate:  3, float: 5.0, delay: 0.4, sunOffset: 15  },
  { src: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=320', pos: { bottom: '18%', left: '20%' }, rotate: -5, float: 6.5, delay: 0.5, sunOffset: 75  },
  { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=320', pos: { bottom: '8%',  right: '5%' }, rotate: -4, float: 4.8, delay: 0.6, sunOffset: 20  },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=320', pos: { bottom: '15%', right: '18%'}, rotate:  4, float: 5.2, delay: 0.7, sunOffset: 50  },
];

const tabletVisible = new Set([0, 2, 4, 6]);

const reasons = [
  {
    num: '01',
    title: 'You Design It, We Build It',
    body: 'Tell us your dream — the places, the pace, the vibe. We turn your exact vision into a real, bookable itinerary.',
  },
  {
    num: '02',
    title: 'Your Itinerary, Your Rules',
    body: 'No fixed packages, no compromises. Every detail — stays, routes, activities — chosen by you, refined by our experts.',
  },
  {
    num: '03',
    title: 'We Handle Everything Else',
    body: 'Once you have shaped your journey, we take over — bookings, logistics, support — so you just show up and live it.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="wcu-section">
      {/* ── Inject keyframe via style tag (guaranteed to work regardless of CSS modules) ── */}
      <style>{`
        @keyframes wcuSunSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes wcuImgSpin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
      `}</style>

      {/* ── Curved dark→white top divider ── */}
      <svg className="wcu-divider-top" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,60 Q720,0 1440,60 L1440,0 L0,0 Z" fill="#0A0E1A" />
      </svg>

      {/* ── FLOATING IMAGES LAYER (z-index 0, position absolute) ── */}
      {floatingImages.map((img, i) => (
        <motion.div
          key={i}
          className={`wcu-img-tile ${tabletVisible.has(i) ? 'wcu-show-tablet' : 'wcu-show-desktop'}`}
          style={{ position: 'absolute', zIndex: 0, pointerEvents: 'none', ...img.pos }}
          initial={{ opacity: 0, scale: 0.85, rotate: img.rotate }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: img.delay }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: img.float, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'relative' }}
          >
            {/* Small sun burst behind each image */}
            <svg
              width="80" height="80" viewBox="0 0 80 80"
              style={{
                position: 'absolute', top: '50%', left: '50%',
                zIndex: 0, pointerEvents: 'none',
                animation: `wcuImgSpin 12s linear infinite`,
                animationDelay: `${img.sunOffset * 0.04}s`,
              }}
            >
              <line x1="40" y1="4"  x2="40" y2="22" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="40" y1="58" x2="40" y2="76" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="4"  y1="40" x2="22" y2="40" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="58" y1="40" x2="76" y2="40" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="14" y1="14" x2="26" y2="26" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="54" y1="54" x2="66" y2="66" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="66" y1="14" x2="54" y2="26" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
              <line x1="14" y1="66" x2="26" y2="54" stroke="#E8A838" strokeWidth="1.5" opacity="0.45"/>
            </svg>
            <img src={img.src} alt="" className="wcu-img-el" loading="lazy" />
          </motion.div>
        </motion.div>
      ))}

      {/* ── CENTER CONTENT COLUMN (z-index 1, above images) ── */}
      <motion.div
        className="wcu-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* HEADING */}
        <div className="wcu-heading-row">
          <span className="wcu-heading-main">WHY ROAM WITH</span>
          {' '}
          <span className="wcu-us-wrap">
            {/* Sun rays SVG */}
            <motion.svg
              width="140" height="140" viewBox="0 0 140 140"
              className="wcu-us-sunburst"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <line x1="70" y1="8"   x2="70" y2="36"  stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="70" y1="104" x2="70" y2="132" stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="8"  y1="70"  x2="36" y2="70"  stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="104" y1="70" x2="132" y2="70" stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="23" y1="23"  x2="43" y2="43"  stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="97" y1="97"  x2="117" y2="117" stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="117" y1="23" x2="97" y2="43"  stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
              <line x1="23" y1="117" x2="43" y2="97"  stroke="#E8A838" strokeWidth="2" opacity="0.6"/>
            </motion.svg>
            <span className="wcu-us-text">US</span>
          </span>
        </div>

        {/* THREE REASONS */}
        <div className="wcu-reasons">
          {reasons.map((r, i) => (
            <motion.div
              key={r.num}
              className={`wcu-reason-row ${i === reasons.length - 1 ? 'wcu-reason-last' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="wcu-num">{r.num}</div>
              <div className="wcu-reason-body-wrap">
                <div className="wcu-reason-title">{r.title}</div>
                <div className="wcu-reason-body">{r.body}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="wcu-bottom-rule" />
      </motion.div>

      {/* ── White→Dark curved bottom divider ── */}
      <svg className="wcu-divider-bottom" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,0 Q720,60 1440,0 L1440,60 L0,60 Z" fill="#0A0E1A" />
      </svg>
    </section>
  );
};

export default WhyChooseUs;
