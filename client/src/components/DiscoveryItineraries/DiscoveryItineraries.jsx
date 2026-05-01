import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DiscoveryItineraries.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const DiscoveryItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE}/packages/public`),
          axios.get(`${API_BASE}/events/public`)
        ]);

        // Merge and tag them
        const merged = [
          ...packagesRes.data.map(p => ({ ...p, type: 'Package', tag: 'Trending' })),
          ...eventsRes.data.map(e => ({ ...e, type: 'Event', tag: 'Limited' }))
        ];
        
        setItineraries(merged);
      } catch (err) {
        console.error("Error fetching discovery data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filters = ['All', 'Honeymoon', 'Family', 'Adventure', 'Luxury'];

  const filteredItems = filter === 'All' 
    ? itineraries 
    : itineraries.filter(item => item.category === filter || item.type === filter);

  return (
    <section id="discovery-itineraries" className="di-section">
      <div className="di-container">
        <div className="di-header-row">
          <motion.h2 
            className="di-title"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Recently Booked Itineraries
          </motion.h2>
        </div>

        <div className="di-filters">
          {filters.map(f => (
            <button 
              key={f} 
              className={`di-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="di-itinerary-row">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              className="di-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="di-card-img-wrap">
                <span className="di-tag">{item.tag}</span>
                <img src={item.image || '/placeholder-destination.jpg'} alt={item.title} />
              </div>
              
              <div className="di-card-body">
                <h3 className="di-card-title">{item.title}</h3>
                <p className="di-card-meta">
                  {item.duration || 'Flexible'} • {item.location || item.destinationName || 'World Wide'}
                </p>
                
                <div className="di-card-footer">
                  <div className="di-price-info">
                    <span className="di-price-label">Starting From</span>
                    <div className="di-price-value">₹{item.price?.toLocaleString() || 'Custom'}</div>
                  </div>
                  <Link to={`/${item.type.toLowerCase()}s/${item._id}`} className="di-view-btn">
                    View Itinerary
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoveryItineraries;
