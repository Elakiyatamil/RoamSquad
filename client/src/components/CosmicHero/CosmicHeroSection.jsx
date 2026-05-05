import React from 'react';
import './CosmicHeroSection.css';

const CosmicHeroSection = () => {
    return (
        <section className="editorial-hero-wrap">
            {/* CLEAN COSMIC BACKGROUND */}
            <div className="editorial-bg-v10">
                <div className="v10-sky-gradient"></div>
                <div className="v10-horizon-glow"></div>
            </div>

            {/* ARCHITECTURAL UI ARCH */}
            <div className="v10-arch-wrapper">
                <div className="v10-arch-surface">
                    <div className="v10-arch-rim"></div>
                    
                    {/* EDITORIAL CONTENT */}
                    <div className="v10-content-center">
                        {/* BRANDING - SEPARATE & DOMINANT */}
                        <div className="v10-branding">
                            <h1 className="v10-logo">ROAMSQUAD</h1>
                            <div className="v10-logo-accent"></div>
                        </div>

                        {/* SUBTLE CURVED NAVIGATION - NON-WARPED */}
                        <nav className="v10-nav-arc">
                            <svg className="v10-arc-svg" viewBox="0 0 1000 400">
                                {/* Shallow circular arc to prevent text distortion */}
                                <path 
                                    id="editorialNavPath" 
                                    d="M 50,380 A 1200,1200 0 0 1 950,380" 
                                    fill="transparent" 
                                />
                                <text className="v10-nav-text">
                                    <textPath href="#editorialNavPath" startOffset="12%">HOME</textPath>
                                    <textPath href="#editorialNavPath" startOffset="28%">DESTINATIONS</textPath>
                                    {/* Center Gap for Brand Dominance */}
                                    <textPath href="#editorialNavPath" startOffset="68%">ADVENTURES</textPath>
                                    <textPath href="#editorialNavPath" startOffset="84%">JOURNEYS</textPath>
                                </text>
                            </svg>
                        </nav>
                    </div>

                    {/* FOCUS AREA FOR FUTURE CONTENT */}
                    <div className="v10-focus-area">
                        {/* Area left clean for editorial images or subtle animations */}
                    </div>
                </div>
            </div>

            {/* MINIMAL FOOTER */}
            <div className="v10-hero-footer">
                <div className="v10-explore">
                    <span>THE ART OF TRAVEL</span>
                    <div className="v10-scroll-line"></div>
                </div>
            </div>
        </section>
    );
};

export default CosmicHeroSection;
