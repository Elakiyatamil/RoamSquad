import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './AboutUs.css';

/* Count-up hook */
const useCountUp = (end, duration = 1500, shouldStart = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, shouldStart]);
  return count;
};

/* Individual stat with count-up and sun burst */
const CountStat = ({ end, suffix, label, shouldStart }) => {
  const count = useCountUp(end, 1500, shouldStart);
  return (
    <div className="au-stat">
      <span className="au-stat-num-wrap">
        <StatSunBurst />
        <span className="au-stat-num">{count.toLocaleString()}{suffix}</span>
      </span>
      <span className="au-stat-label">{label}</span>
    </div>
  );
};

/* Infinity stat — no count-up */
const InfinityStat = () => (
  <div className="au-stat">
    <span className="au-stat-num-wrap">
      <StatSunBurst />
      <span className="au-stat-num au-stat-infinity">&#8734;</span>
    </span>
    <span className="au-stat-label">Happy Travellers</span>
  </div>
);

/* Small (60px) sun burst for stats */
const StatSunBurst = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="au-stat-sunburst">
    <line x1="30" y1="3"  x2="30" y2="16" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="30" y1="44" x2="30" y2="57" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="3"  y1="30" x2="16" y2="30" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="44" y1="30" x2="57" y2="30" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="9"  y1="9"  x2="18" y2="18" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="42" y1="42" x2="51" y2="51" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="51" y1="9"  x2="42" y2="18" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
    <line x1="9"  y1="51" x2="18" y2="42" stroke="#E8A838" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

/* Hand-drawn circle SVG around a word */
const DrawCircle = ({ delay = '0.2s', wide = false }) => (
  <svg
    className={`au-word-circle ${wide ? 'au-word-circle--wide' : ''}`}
    style={{ animationDelay: delay }}
    viewBox="0 0 100 40"
    preserveAspectRatio="none"
    fill="none"
  >
    <ellipse
      cx="50" cy="20"
      rx="48" ry="17"
      stroke="#E8A838"
      strokeWidth="2"
      strokeDasharray="300"
      strokeDashoffset="300"
      className="au-circle-path"
      style={{ animationDelay: delay }}
    />
  </svg>
);

const polaroids = [
  {
    src: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=480',
    style: { top: 0, left: 20, rotate: -6, zIndex: 1, width: 240, height: 300 }
  },
  {
    src: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=480',
    style: { top: 60, left: 120, rotate: 3, zIndex: 2, width: 220, height: 280 }
  },
  {
    src: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=480',
    style: { top: 130, left: 210, rotate: -2, zIndex: 3, width: 200, height: 260 }
  },
];

const AboutUs = () => {
  const sectionRef = useRef(null);
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCounting(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="au-wrapper" ref={sectionRef}>
      <div className="au-dot-grid" aria-hidden="true" />

      <div className="au-content">
        {/* LEFT: Text */}
        <motion.div
          className="au-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="au-label">OUR STORY</p>

          <h2 className="au-heading">
            Born from a{' '}
            <span className="au-word-wrap">
              love
              <DrawCircle delay="0.2s" />
            </span>
            {' '}of getting{' '}
            <span className="au-word-wrap">
              lost
              <DrawCircle delay="0.7s" wide />
            </span>
            .
          </h2>

          <p className="au-body">
            RoamSquad started as a group of friends who were tired of generic travel
            packages that looked beautiful in photos but felt hollow in person. We wanted
            something different — trips that matched who you actually are.
          </p>
          <p className="au-body">
            Today we plan journeys for hundreds of travellers who believe the best
            souvenirs are stories. We handle every detail so you can be completely,
            unapologetically present.
          </p>

          {/* Stats */}
          <div className="au-stats-block">
            <div className="au-stats-rule" />
            <div className="au-stats">
              <CountStat end={500}  suffix="+" label="Trips Planned"  shouldStart={counting} />
              <CountStat end={40}   suffix="+" label="Destinations"   shouldStart={counting} />
              <InfinityStat />
            </div>
          </div>

          <div className="au-cta-wrap">
            <a href="#" className="au-cta">
              Meet the Squad <span className="au-arrow">&#8212;&#8212;&#8212;&rarr;</span>
            </a>
          </div>
        </motion.div>

        {/* RIGHT: Polaroid collage */}
        <motion.div
          className="au-right"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="au-collage">
            {polaroids.map((p, i) => (
              <motion.img
                key={i}
                src={p.src}
                alt=""
                className="au-polaroid"
                style={{
                  top: p.style.top,
                  left: p.style.left,
                  zIndex: p.style.zIndex,
                  width: p.style.width,
                  height: p.style.height,
                }}
                initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1, rotate: p.style.rotate }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ scale: 1.04, zIndex: 10, transition: { duration: 0.3 } }}
                loading="lazy"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Closing rule + tagline */}
      <div className="au-closing">
        <div className="au-rule" />
        <p className="au-tagline">The best travel stories are written by your heart, carefully guided by ours.</p>
      </div>
    </section>
  );
};

export default AboutUs;
