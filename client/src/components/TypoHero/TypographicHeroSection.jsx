import React from 'react';
import './TypographicHeroSection.css';

const TypographicHeroSection = () => {
    const twinkleStars = React.useMemo(() => {
        const count = 80;
        const seed = 1337;
        let s = seed;
        const rand = () => {
            // deterministic LCG for stable layouts across reloads
            s = (s * 1664525 + 1013904223) % 4294967296;
            return s / 4294967296;
        };

        return Array.from({ length: count }, (_, i) => {
            const size = rand() > 0.65 ? 2 : 1;
            return {
                key: i,
                left: `${Math.floor(rand() * 100)}%`,
                top: `${Math.floor(rand() * 100)}%`,
                size,
                opacity: 0.35 + rand() * 0.45,
                delay: `${(rand() * 5).toFixed(2)}s`,
                duration: `${(3 + rand() * 3).toFixed(2)}s`,
            };
        });
    }, []);

    return (
        <section className="v12-mindjoin-hero">
            {/* MAIN CONTENT AREA */}
            <div className="v12-hero-container">
                <div className="v12-center-content">
                    <div className="v12-title-wrapper">
                    <h1 className="v12-hero-text">
                        {"ROAMSQUAD".split("").map((char, i) => (
                            <span key={i} className={`v12-char char-${i}`}>{char}</span>
                        ))}
                    </h1>
                    </div>

                    <div className="v12-motto-wrapper" aria-label="Roam together. Explore forever.">
                        <span className="v12-motto-word v12-motto-roam">ROAM</span>
                        <span className="v12-motto-word v12-motto-together">TOGETHER</span>
                        <span className="v12-motto-dot">·</span>
                        <span className="v12-motto-word v12-motto-explore">EXPLORE</span>
                        <span className="v12-motto-word v12-motto-forever">FOREVER</span>
                    </div>
                </div>

                <div className="v12-scroll-indicator" aria-hidden="true">
                    <div className="v12-scroll-text">EXPLORE ↓</div>
                    <div className="scroll-line"></div>
                </div>
            </div>

            {/* MINIMAL BACKGROUND EFFECT */}
            <div className="v12-bg-elements">
                <div className="v12-comet-field" aria-hidden="true">
                    <span className="v12-comet v12-comet-one"></span>
                    <span className="v12-comet v12-comet-two"></span>
                </div>
                <div className="v12-stars-static" aria-hidden="true"></div>

                <div className="v12-stars-twinkle" aria-hidden="true">
                    {twinkleStars.map((st) => (
                        <span
                            key={st.key}
                            className="v12-twinkle-star"
                            style={{
                                left: st.left,
                                top: st.top,
                                width: `${st.size}px`,
                                height: `${st.size}px`,
                                opacity: st.opacity,
                                animationDelay: st.delay,
                                animationDuration: st.duration,
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TypographicHeroSection;
