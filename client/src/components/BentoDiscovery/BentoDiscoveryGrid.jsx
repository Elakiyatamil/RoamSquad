import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BentoDiscoveryGrid.css';

/**
 * BentoDiscoveryGrid
 * 
 * A semantic, perfectly responsive discovery grid built with 
 * 100% fluid design principles.
 */
const BentoDiscoveryGrid = ({ destinations = [] }) => {
    // If no data, provide skeleton or fallback
    const displayItems = destinations.length > 0 
        ? destinations.slice(0, 8) 
        : Array(6).fill({ id: 'skele', name: 'Loading...', country: 'World' });

    return (
        <section className="bento-grid-container">
            <div className="bento-grid">
                {displayItems.map((item, index) => {
                    // Logic to assign featured/tall classes for a balanced bento look
                    const isFeatured = index === 0 || index === 5;
                    const isTall = index === 1 || index === 4;
                    
                    return (
                        <motion.article 
                            key={item.id + index}
                            className={`bento-card ${isFeatured ? 'bento-card--featured' : ''} ${isTall ? 'bento-card--tall' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                        >
                            <Link 
                                to={item.slug ? `/destinations/${item.slug}` : '#'} 
                                className="bento-card__link-wrapper"
                                aria-label={`View details for ${item.name}`}
                            >
                                <img 
                                    src={item.coverImage || `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&idx=${index}`}
                                    alt={item.name}
                                    className="bento-card__img"
                                    loading={index < 3 ? "eager" : "lazy"}
                                />
                                
                                <div className="bento-card__overlay">
                                    <div className="bento-card__content">
                                        <div className="bento-card__tag">
                                            {item.category || "Must Visit"}
                                        </div>
                                        <h3 className="bento-card__name">{item.name}</h3>
                                        <span className="bento-card__loc">
                                            <MapPin size={12} /> {item.country || 'Global'}
                                        </span>
                                    </div>
                                    
                                    <div className="bento-card__arrow" aria-hidden="true">
                                        <ArrowUpRight size={20} color="white" />
                                    </div>
                                </div>
                            </Link>

                            <style jsx>{`
                                .bento-card__link-wrapper {
                                    display: block;
                                    width: 100%;
                                    height: 100%;
                                    text-decoration: none;
                                    position: relative;
                                    overflow: hidden;
                                }
                                .bento-card__arrow {
                                    position: absolute;
                                    top: 20px;
                                    right: 20px;
                                    opacity: 0;
                                    transform: translate(-10px, 10px);
                                    transition: all 0.3s ease;
                                }
                                .bento-card:hover .bento-card__arrow {
                                    opacity: 1;
                                    transform: translate(0, 0);
                                }
                            `}</style>
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
};

export default BentoDiscoveryGrid;
