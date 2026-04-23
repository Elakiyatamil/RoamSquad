import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './SocialProofSection.css';
import { Play } from 'lucide-react';

const SQUAD_MOMENTS_FALLBACK = [
    {
        id: 1, type: 'video', src: 'https://cdn.pixabay.com/video/2020/05/25/40149-425232977_small.mp4',
        name: 'Aisha K.', location: 'Goa Beach', quote: 'Golden hour hits different here.', height: '420px'
    },
    {
        id: 2, type: 'photo', src: 'https://images.unsplash.com/photo-1594968846939-b9d9df14d13f?q=80&w=800',
        name: 'Rahul V.', location: 'Ladakh Roads', quote: 'The ultimate road trip!', height: '380px'
    },
    {
        id: 3, type: 'photo', src: 'https://images.unsplash.com/photo-1599661559498-8b5e9a4fba73?q=80&w=800',
        name: 'Sarah M.', location: 'Rajasthan Forts', quote: 'Stepping back in time.', height: '450px'
    },
    {
        id: 4, type: 'video', src: 'https://cdn.pixabay.com/video/2019/11/08/28695-371490226_tiny.mp4',
        name: 'Tenzin N.', location: 'Kashmir Snow', quote: 'Winter wonderland magic.', height: '400px'
    },
    {
        id: 5, type: 'photo', src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800',
        name: 'Maya S.', location: 'Bali Sunsets', quote: 'Endless horizons.', height: '430px'
    },
    {
        id: 6, type: 'photo', src: 'https://images.unsplash.com/photo-1593309255288-7517c3761826?q=80&w=800',
        name: 'Vikram B.', location: 'Coorg Mist', quote: 'Coffee and clouds.', height: '390px'
    }
];

const SocialProofSection = () => {
    const [squadData, setSquadData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/squad-love`);
                if (!response.ok) throw new Error('API Error');
                const result = await response.json();
                
                // Map backend data to frontend format
                const mappedData = result.data.map(item => ({
                    id: item.id,
                    type: item.type.toLowerCase(),
                    src: item.url,
                    name: item.name || 'Community Member',
                    location: item.location || 'Roaming the World',
                    quote: item.caption || 'Unforgettable experience with Roam Squad!',
                    height: `${380 + Math.floor(Math.random() * 100)}px` // Random height for masonry effect
                }));

                setSquadData(mappedData.length > 0 ? mappedData : SQUAD_MOMENTS_FALLBACK);
            } catch (error) {
                console.error('Social Proof Fetch Error:', error);
                setSquadData(SQUAD_MOMENTS_FALLBACK);
            } finally {
                setLoading(false);
            }
        };
        fetchSquad();
    }, []);


    // 3D Carousel transform logic
    useEffect(() => {
        if (loading) return;
        
        let rafId;
        const process3D = () => {
            const wrappers = document.querySelectorAll('.squad-moment-wrapper');
            if (!wrappers.length) return;
            
            const centerX = window.innerWidth / 2;
            
            wrappers.forEach(wrapper => {
                const rect = wrapper.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const dist = cardCenterX - centerX;
                
                const maxDist = window.innerWidth / 2;
                let progress = dist / (maxDist * 0.8); // reach full tilt slightly before edge
                progress = Math.max(-1, Math.min(1, progress));
                
                // rotateY: right side (progress>0) tilts -18deg, left side tilts +18deg
                const rotateY = progress * -18; 
                const absProg = Math.abs(progress);
                const scale = 1 - (absProg * 0.12); // edges are 0.88
                
                wrapper.style.setProperty('--rot-y', `${rotateY}deg`);
                wrapper.style.setProperty('--scale', scale);
            });
            
            rafId = requestAnimationFrame(process3D);
        };
        
        rafId = requestAnimationFrame(process3D);
        return () => cancelAnimationFrame(rafId);
    }, [loading]);

    return (
        <section className="squad-social-proof">
            {/* Background 60-80 stars */}
            <div className="squad-bg-stars">
                {[...Array(75)].map((_, i) => (
                    <div key={`squad-star-${i}`} className="squad-bg-star" style={{
                        left: `${Math.random()*100}%`,
                        top: `${Math.random()*100}%`,
                        animationDelay: `${Math.random()*4}s`,
                        opacity: 0.25 + Math.random()*0.25,
                        width: Math.random() > 0.5 ? '2px' : '1px',
                        height: Math.random() > 0.5 ? '2px' : '1px'
                    }} />
                ))}
            </div>

            <div className="squad-header">
                <motion.h2 
                    className="squad-title"
                    initial={{ opacity: 0, filter: "blur(12px)", letterSpacing: "0.4em" }}
                    whileInView={{ opacity: 1, filter: "blur(0px)", letterSpacing: "0.02em" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                    LOVE FROM THE <span className="squad-word-highlight">
                        SQUAD
                        <motion.span 
                            className="squad-underline"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 1.0, duration: 0.6, ease: "easeInOut" }}
                        />
                    </span>
                </motion.h2>
            </div>

            <div className="squad-carousel-container">
                <div className="squad-carousel-track">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={`skel-${idx}`} className={`squad-moment-wrapper skel-h-${(idx % 3) + 1}`}>
                                <div className="squad-moment-card skeleton-pulse" />
                            </div>
                        ))
                    ) : (
                        [...squadData, ...squadData].map((moment, idx) => (
                            <div 
                                key={`${moment.id}-${idx}`} 
                                className="squad-moment-wrapper"
                                style={{ height: moment.height || '400px' }}
                            >
                                <div className="squad-moment-card">
                                    {moment.type === 'video' || moment.mediaType === 'video' ? (
                                        <>
                                            <video 
                                                className="squad-media squad-video" 
                                                src={moment.src || moment.mediaUrl} 
                                                autoPlay 
                                                muted 
                                                loop 
                                                playsInline 
                                            />
                                            <div className="squad-play-icon">
                                                <Play size={20} color="white" fill="white" />
                                            </div>
                                        </>
                                    ) : (
                                        <img 
                                            className="squad-media" 
                                            src={moment.src || moment.mediaUrl} 
                                            alt={moment.location} 
                                            loading="lazy" 
                                        />
                                    )}
                                    
                                    <div className="squad-card-overlay">
                                        <div className="squad-base-info">
                                            <span className="squad-name">{moment.name}</span>
                                            <span className="squad-loc">{moment.location}</span>
                                        </div>
                                        <div className="squad-reveal-quote">
                                            "{moment.quote}"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default SocialProofSection;
