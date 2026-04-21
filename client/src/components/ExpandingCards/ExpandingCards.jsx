import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './ExpandingCards.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

const FALLBACK_PACKAGES = [
    { id: 'p1', name: 'Himalayan Escape', tag: 'PACKAGES', description: '8 days · Leh, Spiti & Manali', coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', link: '/packages/himalayan-escape', linkText: 'VIEW PACKAGE →' },
    { id: 'p2', name: 'Kerala Backwaters', tag: 'PACKAGES', description: '5 days · Alleppey & Kumarakom', coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', link: '/packages/kerala-backwaters', linkText: 'VIEW PACKAGE →' },
    { id: 'p3', name: 'Rajasthan Royale', tag: 'PACKAGES', description: '7 days · Jaipur, Jodhpur & Udaipur', coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', link: '/packages/rajasthan-royale', linkText: 'VIEW PACKAGE →' },
    { id: 'p4', name: 'Andaman Islands', tag: 'PACKAGES', description: '6 days · Havelock & Neil Island', coverImage: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800', link: '/packages/andaman-islands', linkText: 'VIEW PACKAGE →' },
    { id: 'p5', name: 'Coorg Coffee Trail', tag: 'PACKAGES', description: '4 days · Misty hills & plantations', coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', link: '/packages/coorg', linkText: 'VIEW PACKAGE →' }
];

const FALLBACK_EVENTS = [
    { id: 'e1', title: 'Sunrise Trek Meetup', tag: 'EVENTS', description: 'May 12 · Triund, Himachal Pradesh', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', link: '/events/sunrise-trek', linkText: 'JOIN EVENT →' },
    { id: 'e2', title: 'Beach Camping Night', tag: 'EVENTS', description: 'May 18 · Gokarna, Karnataka', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', link: '/events/beach-camping', linkText: 'JOIN EVENT →' },
    { id: 'e3', title: 'Monsoon River Rafting', tag: 'EVENTS', description: 'June 3 · Rishikesh, Uttarakhand', image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800', link: '/events/river-rafting', linkText: 'JOIN EVENT →' },
    { id: 'e4', title: 'Desert Stargazing', tag: 'EVENTS', description: 'June 14 · Jaisalmer, Rajasthan', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800', link: '/events/stargazing-camp', linkText: 'JOIN EVENT →' },
    { id: 'e5', title: 'Valley of Flowers', tag: 'EVENTS', description: 'July 8 · Uttarakhand UNESCO Trek', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', link: '/events/valley-of-flowers', linkText: 'JOIN EVENT →' }
];

const ExpandingCards = () => {
    const [activeTab, setActiveTab] = useState('packages');
    const [activePanel, setActivePanel] = useState(0);
    const [isTabFading, setIsTabFading] = useState(false);
    const [isImageFading, setIsImageFading] = useState(false);
    const sectionRef = useRef(null);
    const navigate = useNavigate();

    // Mobile accordion state: which index is open (-1 = all closed)
    const [mobileOpenIndex, setMobileOpenIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch Packages
    const { data: packages = FALLBACK_PACKAGES } = useQuery({
        queryKey: ['public-packages'],
        queryFn: async () => {
            try {
                const res = await axios.get(`${API_BASE}/packages/public`);
                return res.data.data && res.data.data.length > 0 ? res.data.data : FALLBACK_PACKAGES;
            } catch (error) {
                console.warn("Packages API failed, using fallback data", error);
                return FALLBACK_PACKAGES;
            }
        }
    });

    // Fetch Events
    const { data: events = FALLBACK_EVENTS } = useQuery({
        queryKey: ['public-events'],
        queryFn: async () => {
            try {
                const res = await axios.get(`${API_BASE}/events/public`);
                return res.data.data && res.data.data.length > 0 ? res.data.data : FALLBACK_EVENTS;
            } catch (error) {
                console.warn("Events API failed, using fallback data", error);
                return FALLBACK_EVENTS;
            }
        }
    });

    const currentData = activeTab === 'packages' ? packages : events;

    // Handle external nav triggers via hash
    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash;
            if (hash === '#packages' || hash === '#events') {
                const tab = hash.replace('#', '');
                if (window.currentTabRef !== tab) {
                    setIsTabFading(true);
                    setTimeout(() => {
                        setActiveTab(tab);
                        window.currentTabRef = tab;
                        setActivePanel(0);
                        setMobileOpenIndex(0); 
                        setIsTabFading(false);
                    }, 300);
                }
            }
        };

        window.addEventListener('hashchange', handleHash);
        handleHash();
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const switchTab = (tab) => {
        if (tab === activeTab) return;
        // Updating the hash triggers handleHash via hashchange event
        window.history.pushState(null, '', `#${tab}`);
        window.dispatchEvent(new Event('hashchange'));
    };

    const switchPanel = (index) => {
        if (index === activePanel) return;
        setIsImageFading(true);
        setTimeout(() => {
            setActivePanel(index);
            setIsImageFading(false);
        }, 300);
    };

    const activeItem = currentData[activePanel] || currentData[0];
    const activeTitle = activeItem?.name || activeItem?.title || '';
    const activeImage = activeItem?.coverImage || activeItem?.image || activeItem?.bannerImage || '';
    const activeDesc = activeItem?.description || (activeItem?.daysCount ? `${activeItem?.daysCount} days · ${activeItem?.highlights?.join(', ')}` : '');
    const activeLink = activeItem?.link || (activeTab === 'packages' ? `/packages/${activeItem?.id}` : `/events/${activeItem?.id}`);
    const activeCta = activeItem?.linkText || (activeTab === 'packages' ? 'VIEW PACKAGE →' : 'JOIN EVENT →');

    return (
        <section id="packages" className="expanding-cards-section" ref={sectionRef}>
            <div id="events" style={{ position: 'absolute', top: 0 }} />
            {/* Tabs Bar */}
            <div className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
                    onClick={() => switchTab('packages')}
                    data-tab="packages"
                >
                    Packages
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => switchTab('events')}
                    data-tab="events"
                >
                    Events
                </button>
            </div>

            {/* ===== MOBILE: Stacked Accordion Bars ===== */}
            {isMobile ? (
                <div className={`mobile-accordion-stack ${isTabFading ? 'fading' : ''}`}>
                    {currentData.slice(0, 5).map((item, index) => {
                        const bgImage = item.coverImage || item.image || item.bannerImage || '';
                        const title = item.name || item.title || '';
                        const desc = item.description || (item.daysCount ? `${item.daysCount} days` : '');
                        const link = item.link || (activeTab === 'packages' ? `/packages/${item.id}` : `/events/${item.id}`);
                        const cta = item.linkText || (activeTab === 'packages' ? 'VIEW PACKAGE' : 'JOIN EVENT');
                        const isOpen = mobileOpenIndex === index;

                        return (
                            <div
                                key={`mob-bar-${item.id || index}`}
                                className={`mob-bar ${isOpen ? 'mob-bar--open' : ''}`}
                                onClick={() => setMobileOpenIndex(isOpen ? -1 : index)}
                            >
                                {/* Background image */}
                                {bgImage && (
                                    <img
                                        src={bgImage}
                                        className="mob-bar__bg"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        alt={title}
                                    />
                                )}

                                {/* Gradient overlay */}
                                <div className="mob-bar__overlay" />

                                {/* Collapsed label row */}
                                <div className="mob-bar__collapsed-row">
                                    <span className="mob-bar__name">{title}</span>
                                    <span className={`mob-bar__toggle ${isOpen ? 'mob-bar__toggle--open' : ''}`}>+</span>
                                </div>

                                {/* Expanded content (only visible when open) */}
                                <div className={`mob-bar__expanded-content ${isOpen ? 'mob-bar__expanded-content--visible' : ''}`}>
                                    <span className="mob-bar__eyebrow">{activeTab === 'packages' ? 'PACKAGES' : 'EVENTS'}</span>
                                    <h3 className="mob-bar__title">{title}</h3>
                                    <p className="mob-bar__duration">{desc}</p>
                                    <Link
                                        to={link}
                                        className="mob-bar__cta"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {cta}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ===== DESKTOP: Existing layout ===== */
                <div className={`cards-wrapper ${isTabFading ? 'fading' : ''}`}>
                    
                    {/* Child 1: Main Feature Card */}
                    <div className={`main-feature-card ${isImageFading ? 'fading' : ''}`}>
                        {activeImage && (
                            <img src={activeImage} className="main-bg" loading="eager" alt={activeTitle} />
                        )}
                        <div className="main-overlay" />
                        
                        <div className="main-content">
                            <span className="category-tag">{activeTab}</span>
                            <h3 className="main-title">{activeTitle}</h3>
                            <p className="main-description">{activeDesc}</p>
                            <Link to={activeLink} className="main-cta">
                                {activeCta}
                            </Link>
                        </div>
                    </div>

                    {/* Child 2: Thumbnail Filmstrip */}
                    <div className="thumbnail-filmstrip">
                        {currentData.slice(0, 5).map((item, index) => {
                            const thumbImage = item.coverImage || item.image || item.bannerImage;
                            const thumbTitle = item.name || item.title;
                            const isActiveThumb = activePanel === index;

                            return (
                                <div 
                                    key={`thumb-${item.id || index}`}
                                    className={`thumb-card ${isActiveThumb ? 'active-thumb' : ''}`}
                                    onClick={() => switchPanel(index)}
                                >
                                    <img src={thumbImage} className="thumb-bg" loading="lazy" alt={thumbTitle}/>
                                    <div className="thumb-overlay">
                                        <span className="thumb-text">{thumbTitle}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </section>
    );
};

export default ExpandingCards;
