import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, MapPin, Check, ArrowRight, Volume2, Play, ChevronLeft, ChevronRight, Edit3, Heart, Share2, Info, Star, Clock } from 'lucide-react';
import './ItineraryBuilder.css';
import LoginScreen from './LoginScreen';

const API_BASE_URL = 'http://localhost:5000/api';

const ItineraryBuilder = ({ destination, duration, startDate, tripConfig }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  // 1. Fetch Full Destination Details (including activities/food) from PUBLIC endpoint
  const { data: fullDest, isLoading: destLoading } = useQuery({
    queryKey: ['destination', destination?.id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/public/destination/${destination.id}`);
      return response.data.data;
    },
    enabled: !!destination?.id,
    refetchInterval: 3000 // Poll every 3 seconds for live updates
  });

  const toggleItem = (item) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [selectedItems]);

  const activities = fullDest?.activities || [];
  const foodOptions = fullDest?.foodOptions || [];

  if (destLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="rounded-full border-2 border-emerald-500 border-t-transparent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="itinerary-builder-parent">
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[5000] fixed inset-0">
            <LoginScreen onBack={() => setShowLogin(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. CINEMATIC STATIC HUD */}
      <header className="itinerary-header-static">
        <div className="static-video-wrap">
          <video autoPlay muted loop playsInline>
            <source src="/droneshot.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="header-overlay" />

        <div className="top-nav-bar">
          <div className="destination-title-hud">
            <p className="text-white/60 text-xs tracking-widest uppercase mb-1">Planning for</p>
            <h1 className="text-3xl font-display font-bold text-white">{fullDest?.name}</h1>
          </div>
          <button className="login-link-btn" onClick={() => setShowLogin(true)}>Login</button>
        </div>

        <div className="video-hud-footer">
          <div className="hud-footer-left">
            <div className="glass-pill p-3 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase">Timeline</span>
                <span className="text-sm text-white font-bold">{duration} Nights</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase">Vibe</span>
                <span className="text-sm text-white font-bold">{tripConfig?.tripType || 'ADVENTURE'}</span>
              </div>
            </div>
          </div>

          <div className="hud-footer-right">
             <div className="hud-mini-map-wrap">
              <svg viewBox="0 0 100 80" className="hud-map-outline">
                <path d="M20,30 C30,10 70,5 90,20 C100,30 110,60 90,70 C70,80 40,75 20,60 C10,50 5,40 20,30 Z" />
              </svg>
              <motion.div 
                className="hud-map-pin"
                animate={{ left: `50%`, top: `45%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE BODY */}
      <main className="itinerary-scroll-body">
        
        {/* ACTIVITIES SECTION */}
        <section className="section-wrap">
          <div className="section-header-flex">
            <motion.span 
              className="section-label-premium"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              Main Character Energy Sites
            </motion.span>
            <span className="text-white/40 text-xs uppercase tracking-widest">{activities.length} Options</span>
          </div>
          
          <div className="horizontal-scroll-row no-scrollbar">
            {activities.length === 0 ? (
              <div className="p-20 text-white/20 text-center w-full italic">No activities added yet in Admin...</div>
            ) : activities.map((act, idx) => {
              const isSelected = selectedItems.find(i => i.id === act.id);
              const displayImg = act.image_url || act.imageUrl || `https://loremflickr.com/600/800/travel,${act.name.replace(/\s+/g, '')}`;
              
              return (
                <motion.div 
                  key={act.id}
                  className={`discovery-card-premium ${isSelected ? 'selected' : ''}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => toggleItem(act)}
                >
                  <img src={displayImg} alt={act.name} />
                  <div className="card-price-badge-premium">₹{act.price?.toLocaleString()}</div>
                  <div className="discovery-card-overlay-premium">
                    <div className="card-top-actions">
                      <button className="icon-btn-glass"><Heart size={18} fill={isSelected ? '#22c55e' : 'none'} /></button>
                      <button className="icon-btn-glass"><Share2 size={18} /></button>
                    </div>
                    <div className="card-title-premium">{act.name}</div>
                    <div className="card-meta-premium flex items-center gap-2">
                      <Clock size={12} /> {act.duration} • <Star size={12} fill="#fbbf24" className="text-yellow-400" /> 4.8
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500 rounded-[28px]">
                      <Check size={48} className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FOOD SECTION */}
        <section className="section-wrap">
          <div className="section-header-flex">
            <motion.span 
              className="section-label-premium"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              Bites for the Soul
            </motion.span>
            <span className="text-white/40 text-xs uppercase tracking-widest">{foodOptions.length} Options</span>
          </div>

          <div className="horizontal-scroll-row no-scrollbar">
            {foodOptions.length === 0 ? (
              <div className="p-20 text-white/20 text-center w-full italic">No food options added yet in Admin...</div>
            ) : foodOptions.map((food, idx) => {
              const isSelected = selectedItems.find(i => i.id === food.id);
              const displayImg = food.image_url || food.imageUrl || `https://loremflickr.com/400/400/food,${food.name.replace(/\s+/g, '')}`;
              
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
                    <img src={displayImg} alt={food.name} />
                  </div>
                  <div className="food-text-premium">
                    <span className="food-name-premium">{food.name}</span>
                    <span className="food-price-premium">· ₹{food.price?.toLocaleString()}</span>
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
              {selectedItems.slice(0, 4).map((item) => (
                <motion.div key={item.id} className="dock-thumb-item" layoutId={item.id}>
                  <img src={item.image_url || item.imageUrl || `https://loremflickr.com/100/100/travel,${item.name}`} alt="" />
                </motion.div>
              ))}
              {selectedItems.length > 4 && <div className="text-white/40 text-xs">+{selectedItems.length - 4}</div>}
            </div>
            <div className="dock-labels">
              <div className="dock-tagline">Room Together, Explore Forever</div>
              <div className="dock-counter">{selectedItems.length} items selected</div>
            </div>
          </div>

          <div className="dock-action-btns">
            <button className="btn-util" disabled={selectedItems.length === 0} onClick={() => setSelectedItems([])}>Clear All</button>
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

