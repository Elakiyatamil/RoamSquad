import React from 'react';
import './TypographicHeroSection.css';

const TypographicHeroSection = () => {
    return (
        <section className="typo-hero-wrap">
            {/* COSMIC BACKGROUND LAYERS */}
            <div className="v11-cosmic-bg">
                <div className="v11-stars"></div>
                <div className="v11-nebula"></div>
                <div className="v11-aurora"></div>
            </div>

            {/* CORNER METADATA - EDITORIAL STYLE */}
            <div className="v11-metadata v11-meta-left">DESTINATIONS</div>
            <div className="v11-metadata v11-meta-right">YOUR STORY</div>

            {/* CENTERED HERO CONTENT */}
            <div className="v11-arch-container">
                {/* FORCED NEBULA GLOW BEHIND TEXT */}
                <div className="v11-nebula-glow"></div>
                
                <div className="v11-brand-h1">
                    <h1 className="hero-text">
                        {"ROAMSQUAD".split("").map((char, i) => (
                            <span key={i} className="hero-letter">{char}</span>
                        ))}
                    </h1>
                </div>

                {/* EDITORIAL TAGLINE */}
                <div className="v11-tagline">
                    DESTINATIONS <span className="v11-dot-sep">·</span> EXPERIENCES <span className="v11-dot-sep">·</span> YOUR STORY
                </div>

                {/* HIDDEN SECONDARY NAV (Maintained for logic but styled minimally) */}
                <nav className="v11-secondary-nav">
                    <a href="#destinations" className="v11-nav-item">DISCOVER</a>
                    <a href="#experiences" className="v11-nav-item">EXPLORE</a>
                    <a href="#about" className="v11-nav-item">JOURNEY</a>
                </nav>
            </div>

            {/* MINIMAL FOOTER SCROLL INDICATOR */}
            <div className="v11-hero-footer">
                <div className="v11-scroll">
                    <span>SCROLL TO EXPLORE</span>
                    <div className="v11-scroll-line"></div>
                </div>
            </div>
        </section>
    );
};

export default TypographicHeroSection;
