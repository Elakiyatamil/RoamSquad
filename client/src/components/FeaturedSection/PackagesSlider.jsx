import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PackagesSlider = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/packages/public`);
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        
        // Handle potentially nested data like { packages: [...] } or direct array
        const packagesData = Array.isArray(data) ? data : (data.packages || data.data || []);
        setPackages(packagesData);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
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
      <div key={`skel-${i}`} className="fs-card fs-skeleton"></div>
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
                  <path d="M5,30 C5,10 45,5 75,15 C95,25 95,45 75,55 C45,65 5,50 5,30 Z" className="fs-scribble-path packages-scribble" />
                </svg>
              </span>
              HOT DEALS
            </span>
          </div>
          <h2 className="fs-heading">Featured Packages</h2>
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
          <Link to="/packages" className="fs-view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* HORIZONTAL SCROLL TRACK */}
      <div className="fs-slider-track" ref={trackRef}>
        {isLoading ? (
          renderSkeletons()
        ) : error || packages.length === 0 ? (
          <div className="fs-empty-state">
            No trips loaded yet. Check back soon! ✈️
          </div>
        ) : (
          <AnimatePresence>
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg._id || pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index < 5 ? index * 0.08 : 0 }}
              >
                <Link to={`/packages/${pkg._id || pkg.id}`} className="fs-card">
                  
                  {/* Background Image & Overlay */}
                  <img src={pkg.image || pkg.coverImage || pkg.images?.[0]} alt={pkg.title} className="fs-card-bg-img" loading="lazy" />
                  <div className="fs-card-overlay" />
                  
                  {/* Badges */}
                  {pkg.category && <span className="fs-badge-tl">{pkg.category}</span>}
                  {pkg.duration && <span className="fs-badge-tr">{pkg.duration}</span>}
                  
                  {/* Default State Content */}
                  <div className="fs-card-default-content">
                    <h3 className="fs-card-title">{pkg.title}</h3>
                    <div className="fs-card-price-pill">
                      From ₹{pkg.price?.toLocaleString('en-IN') || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Hover Arrow Icon */}
                  <div className="fs-card-arrow-icon">
                    <ArrowRight size={16} />
                  </div>
                  
                  {/* Hover Frosted Panel */}
                  <div className="fs-card-hover-panel">
                    <h4 className="fs-hover-title">{pkg.title}</h4>
                    <div className="fs-hover-location">
                      <MapPin size={12} />
                      {pkg.destination || `${pkg.city || ''} ${pkg.country || ''}`}
                    </div>
                    
                    <div className="fs-hover-row">
                      <div className="fs-hover-price">From ₹{pkg.price?.toLocaleString('en-IN') || 'N/A'}</div>
                      <div className="fs-hover-rating">
                        <Star size={12} />
                        {pkg.rating || 'New'} {pkg.reviews_count ? `(${pkg.reviews_count})` : ''}
                      </div>
                    </div>
                    
                    <button className="fs-hover-btn">
                      Explore Trip <ArrowRight size={16} />
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

export default PackagesSlider;
