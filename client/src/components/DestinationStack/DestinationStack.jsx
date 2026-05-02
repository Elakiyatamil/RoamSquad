import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { globalSignals } from '../../utils/signals';
import './DestinationStack.css';

const STACK_DATA = [
  {
    id: 'mountains',
    category: 'The Heights',
    title: 'Roam Together • Explore Forever',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90',
    description: 'High-altitude immersion beneath snow-capped peaks.'
  }
];

const DestinationStack = ({ heroRef }) => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  // Hero Parallax: Fade and scale back as we scroll
  // We want the hero to disappear as cards come up
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSearchClick = (destName) => {
    globalSignals.setDestinationChoice(destName);
    globalSignals.setCurrentPlannerStep(1);
    navigate('/planner');
  };

  return (
    <div className="ds-stack-container">
      {/* 
         THE HERO PARALLAX WRAPPER 
         This keeps the hero visible as a background until it fades out
      */}
      <motion.div 
        className="ds-hero-parallax-wrapper"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* The child (RoamgHero) is passed via props or injected here if needed */}
      </motion.div>

      <div className="ds-card-stack">
        {STACK_DATA.map((card, index) => (
          <div key={card.id} className="ds-card-item">
            <div className="ds-card-bg">
              <img src={card.image} alt={card.title} />
              <div className="ds-card-overlay" />
            </div>

            <div className="ds-card-content">
              {/* Massive Volumetric Watermark */}
              {index === 0 && (
                <motion.div 
                  className="ds-massive-watermark"
                  style={{ 
                    y: useTransform(scrollYProgress, [0, 0.4], [0, 80]),
                    filter: useTransform(scrollYProgress, [0, 0.4], ["blur(6px)", "blur(12px)"]),
                    opacity: useTransform(scrollYProgress, [0, 0.4], [0.08, 0.12])
                  }}
                >
                  <img src="/logo.png" alt="ROAMG Watermark" className="ds-watermark-img" />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="ds-content-inner"
              >
                <h2 className="ds-card-title">{card.title}</h2>
                
                {/* Search is embedded in the first card (index 0) */}
                {index === 0 ? (
                  <div className="ds-search-entry-container ds-search-low">
                    <div 
                      className="ds-neon-search-bar"
                      onClick={() => handleSearchClick(card.title)}
                    >
                      <span className="ds-search-text">Where do you want to go?</span>
                      <div className="ds-neon-glow" />
                    </div>
                    <motion.p 
                      className="ds-curated-subtitle"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Curated Journeys
                    </motion.p>
                  </div>
                ) : (
                  <button 
                    className="ds-explore-btn"
                    onClick={() => handleSearchClick(card.title)}
                  >
                    Explore {card.id}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationStack;
