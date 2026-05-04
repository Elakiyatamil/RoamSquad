import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ChevronLeft, ChevronRight, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const PackagesSlider = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
      const response = await fetch(`${apiUrl}/packages/public`);
      if (!response.ok) throw new Error('Failed to fetch packages');
      const data = await response.json();
      const packagesData = Array.isArray(data) ? data : (data.packages || data.data || []);
      setPackages(packagesData);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    fetchPackages();
    
    // Optional: listen for storage events to sync cross-tab if needed
    const handleStorage = () => fetchPackages();
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
      <div key={`skel-${i}`} className="fs-card fs-skeleton" style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'fs-shimmer 1.5s infinite'
      }}></div>
    ));
  };

  const getImgUrl = (url) => {
    const PLACEHOLDER = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
    if (!url || url === 'null' || url === 'undefined') return PLACEHOLDER;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  const PackageCard = ({ pkg, index }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const imgUrl = getImgUrl(pkg.image || pkg.imageUrl || pkg.photo || pkg.coverImage || pkg.image_url);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index < 5 ? index * 0.08 : 0 }}
      >
        <Link to="/packages" className="fs-card">
          
          {/* Wanderlust Loader */}
          <AnimatePresence>
            {!imgLoaded && !imgError && (
              <motion.div 
                className="fs-card-loader"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="fs-paper-plane-spinner">
                  <Send size={18} fill="currentColor" className="fs-plane-icon" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Image & Overlay */}
          <img 
            src={imgError ? "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" : imgUrl} 
            alt={pkg.title || pkg.name} 
            className={`fs-card-bg-img ${imgLoaded ? 'loaded' : ''}`} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
          />
          <div className="fs-card-overlay" />
          <div className="fs-card-gradient-readability" />
          
          {/* Badges */}
          {(pkg.category || pkg.type || pkg.tag) && <span className="fs-badge-tl">{pkg.category || pkg.type || pkg.tag}</span>}
          {(pkg.duration || pkg.daysCount) && <span className="fs-badge-tr">{pkg.duration || `${pkg.daysCount} Days`}</span>}
          
          {/* Default State Content */}
          <div className="fs-card-default-content">
            <h3 className="fs-card-title">{pkg.title || pkg.name}</h3>
            <div className="fs-card-price-pill">
              From ₹{(pkg.price || pkg.totalPrice)?.toLocaleString('en-IN') || 'N/A'}
            </div>
          </div>
          
          {/* Hover Arrow Icon */}
          <div className="fs-card-arrow-icon">
            <ArrowRight size={16} />
          </div>
          
          {/* Hover Frosted Panel */}
          <div className="fs-card-hover-panel">
            <h4 className="fs-hover-title">{pkg.title || pkg.name}</h4>
            <div className="fs-hover-location">
              <MapPin size={12} />
              {pkg.destination || pkg.location || pkg.place || pkg.city || 'Curated Trip'}
            </div>
            
            <div className="fs-hover-row">
              <div className="fs-hover-price">From ₹{(pkg.price || pkg.totalPrice)?.toLocaleString('en-IN') || 'N/A'}</div>
              <div className="fs-hover-rating">
                <Star size={12} />
                {pkg.rating || pkg.stars || 'New'}
              </div>
            </div>
            
            <button className="fs-hover-btn">
              Explore Trip <ArrowRight size={16} />
            </button>
          </div>
          
        </Link>
      </motion.div>
    );
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
        ) : packages.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            width: '100%'
          }}>
            No packages added yet.
          </div>
        ) : (
          <AnimatePresence>
            {packages.map((pkg, index) => (
              <PackageCard key={pkg.id || pkg._id} pkg={pkg} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default PackagesSlider;
