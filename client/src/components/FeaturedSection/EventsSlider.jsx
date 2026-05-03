import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventsSlider = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
      const response = await fetch(`${apiUrl}/events/public`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      const eventsData = Array.isArray(data) ? data : (data.events || data.data || []);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    fetchEvents();
    
    // Optional: listen for storage events to sync cross-tab if needed
    const handleStorage = () => fetchEvents();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = 280;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={`skel-evt-${i}`} className="fs-card fs-skeleton" style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'fs-shimmer 1.5s infinite'
      }}></div>
    ));
  };

  return (
    <>
      {/* FULL-WIDTH HEADER */}
      <motion.div 
        className="fs-header-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="fs-header-left">
          <div className="fs-journal-label">
            <span className="fs-journal-text">
              <span className="fs-marker-bg">
                <svg viewBox="0 0 100 60" preserveAspectRatio="none">
                  <path d="M5,30 C5,10 45,5 75,15 C95,25 95,45 75,55 C45,65 5,50 5,30 Z" className="fs-scribble-path events-scribble" />
                </svg>
              </span>
              THIS MONTH
            </span>
          </div>
          <h2 className="fs-heading">Upcoming Events</h2>
        </div>
        
        <div className="fs-header-right">
          <div className="fs-nav-arrows">
            <button className="fs-nav-btn" onClick={() => scroll('left')} aria-label="Scroll left">
              <ChevronLeft size={20} />
            </button>
            <button className="fs-nav-btn" onClick={() => scroll('right')} aria-label="Scroll right">
              <ChevronRight size={20} />
            </button>
          </div>
          <Link to="/events" className="fs-view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* HORIZONTAL SCROLL TRACK */}
      <div className="fs-slider-track" ref={trackRef}>
        {isLoading ? (
          renderSkeletons()
        ) : events.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            width: '100%'
          }}>
            No events added yet.
          </div>
        ) : (
          <AnimatePresence>
            {events.map((evt, index) => (
              <motion.div
                key={evt.id || evt._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index < 5 ? index * 0.08 : 0 }}
              >
                <Link to={`/events/${evt.id || evt._id}`} className="fs-card">
                  
                  {/* Background Image & Overlay */}
                  <img 
                    src={evt.image || evt.imageUrl || evt.photo || evt.bannerImage || evt.image_url} 
                    alt={evt.title || evt.name} 
                    className="fs-card-bg-img" 
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = '#1a1a2e';
                    }}
                  />
                  <div className="fs-card-overlay" />
                  
                  {/* Badges */}
                  {(evt.type || evt.category || evt.tag) && <span className="fs-badge-tl">{evt.type || evt.category || evt.tag}</span>}
                  {(evt.date || evt.startDate || evt.dateTime || evt.eventDate) && (
                    <span className="fs-badge-tr">
                      {new Date(evt.date || evt.startDate || evt.dateTime || evt.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  
                  {/* Default State Content */}
                  <div className="fs-card-default-content">
                    <h3 className="fs-card-title">{evt.title || evt.name}</h3>
                    <div className="fs-card-row">
                      <div className="fs-card-seats-indicator available">✓ Spots available</div>
                    </div>
                  </div>
                  
                  {/* Hover Arrow Icon */}
                  <div className="fs-card-arrow-icon">
                    <ArrowRight size={16} />
                  </div>
                  
                  {/* Hover Frosted Panel */}
                  <div className="fs-card-hover-panel">
                    <h4 className="fs-hover-title">{evt.title || evt.name}</h4>
                    <div className="fs-hover-location">
                      <MapPin size={12} />
                      {evt.location || evt.place || evt.venue || 'TBA'}
                    </div>
                    
                    <div className="fs-hover-row">
                      <div className="fs-hover-datetime">
                        <Calendar size={12} />
                        {(evt.date || evt.startDate || evt.dateTime || evt.eventDate) 
                          ? new Date(evt.date || evt.startDate || evt.dateTime || evt.eventDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) 
                          : 'TBA'}
                      </div>
                    </div>
                    
                    <button className="fs-hover-btn mt-auto">
                      Join Event <ArrowRight size={16} />
                    </button>
                  </div>
                  
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default EventsSlider;
