import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Check, ArrowRight, Volume2, Play, ChevronLeft, ChevronRight, Edit3, Heart, Share2, Info } from 'lucide-react';
import './ItineraryBuilder.css';
import LoginScreen from './LoginScreen';

const SITES = [
  { id: 'monkey-forest', name: 'Monkey Forest', location: 'Ubud', video: '/droneshot.mp4', price: 1500, mapX: 55, mapY: 45, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'tegalalang', name: 'Tegalalang Rice Fields', location: 'Ubud', video: '/waterfall.mp4', price: 1800, mapX: 62, mapY: 38, image: 'https://images.unsplash.com/photo-1537953391147-f459c0b0ad14?w=800&q=80' },
  { id: 'uluwatu', name: 'Uluwatu Sea-Cliff Temple', location: 'South Kuta', video: '/sea.mp4', price: 2500, mapX: 45, mapY: 75, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80' },
  { id: 'bali-swing', name: 'Bali Swing Experience', location: 'Abiansemal', video: '/fall.mp4', price: 3200, mapX: 58, mapY: 52, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
  { id: 'kintamani', name: 'Kintamani Volcano', location: 'Bangli', video: '/waterfall.mp4', price: 2800, mapX: 70, mapY: 30, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80' },
  { id: 'tanah-lot', name: 'Tanah Lot Temple', location: 'Tabanan', video: '/sea.mp4', price: 1200, mapX: 30, mapY: 50, image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&q=80' },
  { id: 'tirta-gangga', name: 'Tirta Gangga', location: 'Karangasem', video: '/waterfall.mp4', price: 1000, mapX: 85, mapY: 45, image: 'https://images.unsplash.com/photo-1537953391147-f459c0b0ad14?w=800&q=80' },
  { id: 'besakih', name: 'Besakih Temple', location: 'Rendang', video: '/droneshot.mp4', price: 2000, mapX: 75, mapY: 35, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' },
  { id: 'sanur-beach', name: 'Sanur Beach', location: 'Denpasar', video: '/sea.mp4', price: 500, mapX: 65, mapY: 65, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80' },
  { id: 'nusa-penida', name: 'Nusa Penida', location: 'Klungkung', video: '/sea.mp4', price: 4500, mapX: 80, mapY: 70, image: 'https://images.unsplash.com/photo-1537953391147-f459c0b0ad14?w=800&q=80' }
];

const generateItems = (base, count, prefix) => {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    id: `${prefix}${i + 1}`,
    title: `${base.title} ${i + 1}`,
    price: base.price + (i * 100)
  }));
};

const DATA_MAP = {
  'monkey-forest': {
    activities: generateItems({ title: 'Sanctuary Explorer', price: 800, time: '10:00 AM', desc: 'Guide included', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' }, 10, 'm'),
    foods: generateItems({ name: 'Forest Delight', price: 400, info: 'Local dish', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80' }, 10, 'f')
  },
  'tegalalang': {
    activities: generateItems({ title: 'Terrace Trek', price: 1000, time: '09:00 AM', desc: 'Photos included', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80' }, 10, 't'),
    foods: generateItems({ name: 'Rice Bowl Special', price: 500, info: 'Organic', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' }, 10, 'ft')
  },
  'uluwatu': {
    activities: generateItems({ title: 'Cliff Sunset Yoga', price: 1200, time: '05:00 PM', desc: 'Mats provided', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80' }, 10, 'u'),
    foods: generateItems({ name: 'Sunset Seafood', price: 1500, info: 'Fresh catch', image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&q=80' }, 10, 'fu')
  },
  'bali-swing': {
    activities: generateItems({ title: 'Jungle Fly High', price: 2000, time: 'Anytime', desc: 'Safety gear included', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' }, 10, 's'),
    foods: generateItems({ name: 'Smoothie Bowl', price: 600, info: 'Tropical fruit', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80' }, 10, 'fs')
  }
};

const ItineraryBuilder = () => {
  const [currentSite, setCurrentSite] = useState(SITES[0]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  const toggleItem = (item) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const activeData = useMemo(() => {
    const data = DATA_MAP[currentSite.id] || DATA_MAP['monkey-forest'];
    return data;
  }, [currentSite]);

  return (
    <div className="itinerary-builder-parent">
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[5000]">
            <LoginScreen onBack={() => setShowLogin(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. INTERACTIVE CINEMATIC HUD */}
      <header className="itinerary-header-static">
        <div className="static-video-wrap">
          <video key={currentSite.video} autoPlay muted loop playsInline>
            <source src={currentSite.video} type="video/mp4" />
          </video>
        </div>
        <div className="header-overlay" />

        {/* Top Controls */}
        <div className="top-nav-bar">
          <div className="minimal-search">
            <input type="text" placeholder="Search Bali..." />
          </div>
          <button className="login-link-btn" onClick={() => setShowLogin(true)}>Login</button>
        </div>

        {/* FOOTER NAV (REF IMAGE STYLE) */}
        <div className="video-hud-footer">
          <div className="hud-footer-left">
            <ChevronLeft className="hud-nav-arrow" size={24} />
            <div className="site-nav-list no-scrollbar">
              {SITES.slice(0, 5).map((site) => (
                <div 
                  key={site.id} 
                  className={`site-nav-item ${currentSite.id === site.id ? 'active' : ''}`}
                  onClick={() => setCurrentSite(site)}
                >
                  <MapPin className="nav-pin" size={16} />
                  <span>{site.name}</span>
                </div>
              ))}
            </div>
            <ChevronRight className="hud-nav-arrow" size={24} />
          </div>

          <div className="hud-footer-right">
            <div className="hud-controls-icons">
              <Volume2 size={20} />
              <Play size={20} />
            </div>
            {/* MINI-MAP */}
            <div className="hud-mini-map-wrap">
              <svg viewBox="0 0 100 80" className="hud-map-outline">
                <path d="M20,30 C30,10 70,5 90,20 C100,30 110,60 90,70 C70,80 40,75 20,60 C10,50 5,40 20,30 Z" />
              </svg>
              <motion.div 
                className="hud-map-pin"
                animate={{ left: `${currentSite.mapX}%`, top: `${currentSite.mapY}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE BODY */}
      <main className="itinerary-scroll-body">
        
        {/* SITE DISCOVERY */}
        <section className="section-wrap">
          <motion.span 
            className="section-label-premium"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            Main Character Energy Sites
          </motion.span>
          <div className="horizontal-scroll-row no-scrollbar">
            {SITES.map((site, idx) => (
              <motion.div 
                key={site.id}
                className={`discovery-card-premium ${currentSite.id === site.id ? 'active' : ''}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                onClick={() => setCurrentSite(site)}
              >
                <img src={site.image} alt={site.name} />
                <div className="card-price-badge-premium">₹{site.price.toLocaleString()}</div>
                <div className="discovery-card-overlay-premium">
                  <div className="card-top-actions">
                    <button className="icon-btn-glass"><Heart size={18} /></button>
                    <button className="icon-btn-glass"><Share2 size={18} /></button>
                  </div>
                  <div className="card-title-premium">{site.name}</div>
                  <div className="card-meta-premium">{site.location} • {site.specs}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ACTIVITY TIMELINE */}
        <section className="section-wrap">
          <motion.span 
            className="section-label-premium"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            Current Mood: Adventurous
          </motion.span>
          <div className="horizontal-scroll-row no-scrollbar">
            {activeData.activities.map((act, idx) => {
              const isSelected = selectedItems.find(i => i.id === act.id);
              return (
                <motion.div 
                  key={act.id}
                  className="activity-card-premium relative cursor-pointer"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(act)}
                >
                  <div className="act-img-container">
                    <img src={act.image} alt={act.title} className="act-premium-img" />
                    {isSelected && (
                      <div className="act-selected-overlay">
                        <Check size={32} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <div className="act-premium-body">
                    <div className="act-premium-header">
                      <span className="act-premium-time">{act.time}</span>
                      <span className="act-premium-price">₹{act.price.toLocaleString()}</span>
                    </div>
                    <h3 className="act-premium-title">{act.title}</h3>
                    <p className="act-premium-desc">{act.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FOOD MAPPED */}
        <section className="section-wrap">
          <motion.span 
            className="section-label-premium"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            Bites for the Soul
          </motion.span>
          <div className="horizontal-scroll-row no-scrollbar">
            {activeData.foods.map((food, idx) => {
              const isSelected = selectedItems.find(i => i.id === food.id);
              return (
                <motion.div 
                  key={food.id}
                  className="food-card-premium cursor-pointer"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => toggleItem(food)}
                >
                  <div className={`food-circle-premium ${isSelected ? 'selected' : ''}`}>
                    <img src={food.image} alt={food.name} />
                  </div>
                  <div className="food-text-premium">
                    <span className="food-name-premium">{food.name}</span>
                    <span className="food-price-premium">· ₹{food.price.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 3. SELECTION DOCK */}
      <div className="selection-dock-floating">
        <motion.div className="dock-expanded" initial={{ y: 100 }} animate={{ y: 0 }}>
          <div className="dock-left-content">
            <div className="dock-thumb-strip">
              {selectedItems.map((item) => (
                <motion.div key={item.id} className="dock-thumb-item" layoutId={item.id}>
                  <img src={item.image} alt="" />
                </motion.div>
              ))}
            </div>
            <div className="dock-labels">
              <div className="dock-tagline">Room Together, Explore Forever</div>
              <div className="dock-counter">{selectedItems.length} items selected</div>
            </div>
          </div>

          <div className="dock-action-btns">
            <button className="btn-util" disabled={selectedItems.length === 0} onClick={() => setSelectedItems([])}>Clear All</button>
            <button className="btn-util" onClick={() => setShowLogin(true)}><Edit3 size={18} /></button>
            <button className="btn-grab-it" onClick={() => setShowLogin(true)}>
              Grab it for ₹{totalPrice.toLocaleString()} <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
