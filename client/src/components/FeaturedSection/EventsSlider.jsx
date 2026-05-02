import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventsSlider = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
        const response = await fetch(`${apiUrl}/events`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        
        // Handle potentially nested data like { events: [...] } or direct array
        const eventsData = Array.isArray(data) ? data : (data.events || data.data || []);
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
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
    return Array(4).fill(0).map((_, i) => (
      <div key={`skel-evt-${i}`} className="fs-card fs-skeleton"></div>
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
                <svg viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M5,15 C40,10 80,18 120,12 C160,6 195,15 195,15" className="fs-scribble-path events-scribble" />
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
        ) : error || events.length === 0 ? (
          <div className="fs-empty-state">
            No events loaded yet. Stay tuned! 🎒
          </div>
        ) : (
          <AnimatePresence>
            {events.map((evt, index) => (
              <motion.div
                key={evt._id || evt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index < 5 ? index * 0.08 : 0 }}
              >
                <Link to={`/events/${evt._id || evt.id}`} className="fs-card">
                  
                  {/* Background Image & Overlay */}
                  <img src={evt.image || evt.coverImage || evt.images?.[0]} alt={evt.title} className="fs-card-bg-img" loading="lazy" />
                  <div className="fs-card-overlay" />
                  
                  {/* Badges */}
                  {evt.type && <span className="fs-badge-tl">{evt.type}</span>}
                  {evt.date && <span className="fs-badge-tr">{evt.date}</span>}
                  
                  {/* Default State Content */}
                  <div className="fs-card-default-content">
                    <h3 className="fs-card-title">{evt.title}</h3>
                    <div className="fs-card-row">
                      {evt.seats_left < 10 ? (
                        <div className="fs-card-seats-indicator warning">⚡ Only {evt.seats_left || 0} seats left</div>
                      ) : (
                        <div className="fs-card-seats-indicator available">✓ Spots available</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Arrow Icon */}
                  <div className="fs-card-arrow-icon">
                    <ArrowRight size={16} />
                  </div>
                  
                  {/* Hover Frosted Panel */}
                  <div className="fs-card-hover-panel">
                    <h4 className="fs-hover-title">{evt.title}</h4>
                    <div className="fs-hover-location">
                      <MapPin size={12} />
                      {evt.location}
                    </div>
                    
                    <div className="fs-hover-row">
                      <div className="fs-hover-datetime">
                        <Calendar size={12} />
                        {evt.date} {evt.time ? `• ${evt.time}` : ''}
                      </div>
                      <div className="fs-hover-seats">
                        {evt.seats_left < 10 ? (
                          <span style={{color: '#E8A838'}}>⚡ {evt.seats_left || 0} left</span>
                        ) : (
                          <span style={{color: '#0D5C63'}}>✓ Open</span>
                        )}
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
