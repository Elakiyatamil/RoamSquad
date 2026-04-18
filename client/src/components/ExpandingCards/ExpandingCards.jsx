import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
    const sectionRef = useRef(null);

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
                setActiveTab(tab);
                setActivePanel(0);
                // Allow time for DOM update if tab changed
                setTimeout(() => {
                    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        };

        // Listen for both hashchange and a custom event if needed
        window.addEventListener('hashchange', handleHash);
        // Also check on mount
        handleHash();

        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setActivePanel(0);
    };

    return (
        <section id="packages-events-section" className="expanding-cards-section" ref={sectionRef}>
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

            {/* Panels Container */}
            <div className={`cards-wrapper ${activeTab}-cards`}>
                {currentData.slice(0, 5).map((item, index) => {
                    const title = item.name || item.title;
                    const image = item.coverImage || item.image || item.bannerImage;
                    const desc = item.description || (item.daysCount ? `${item.daysCount} days · ${item.highlights?.join(', ')}` : '');
                    const link = item.link || (activeTab === 'packages' ? `/packages/${item.id}` : `/events/${item.id}`);
                    const ctaText = item.linkText || (activeTab === 'packages' ? 'VIEW PACKAGE →' : 'JOIN EVENT →');

                    return (
                        <div 
                            key={item.id || index}
                            className={`panel ${activePanel === index ? 'active' : ''}`}
                            onClick={() => setActivePanel(index)}
                        >
                            <div 
                                className="panel-bg" 
                                style={{ backgroundImage: `url(${image})` }}
                                loading="lazy"
                            />
                            <div className="panel-overlay" />
                            
                            {/* Collapsed vertical label */}
                            <div className="panel-label">
                                {title}
                            </div>

                            {/* Expanded Content */}
                            <div className="panel-content">
                                <span className="category-tag">{activeTab}</span>
                                <h3 className="panel-title">{title}</h3>
                                <p className="panel-description">{desc}</p>
                                <a href={link} className="panel-cta" onClick={(e) => {
                                    // Prevent panel click from triggering when clicking link
                                    e.stopPropagation();
                                }}>
                                    {ctaText}
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ExpandingCards;
