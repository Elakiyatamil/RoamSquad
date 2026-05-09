import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Check, ArrowRight, Volume2, VolumeX, Edit3, 
  Star, Clock, Plus, Minus,
  Menu, X, MapPin, Send,
  Coffee, Utensils, Home, Sparkles
} from 'lucide-react';
import './ItineraryBuilder.css';
import LoginScreen from './LoginScreen';
import InquiryModal from './InquiryModal';
import useAuthStore from '../../store/authStore';
import useAudioStore from '../../store/useAudioStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';

// ASSET REPAIR UTILITY
const getImageUrl = (url, type) => {
  if (!url) {
    if (type === 'food') return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800';
    if (type === 'stay') return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800';
  }
  if (url.startsWith('http')) return url;
  
  // Specific fix for Food items uploaded in Admin
  if (type === 'food' && !url.includes('/')) {
    return `${BACKEND_URL}/uploads/food/${url}`;
  }
  
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
};

const SameStateModal = ({ isOpen, onClose, siblings, currentState, onSelect }) => {
  if (!isOpen) return null;
  return (
    <motion.div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <div className="p-8 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Same State Discovery</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#800020]/10 text-[#800020] text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Within {currentState}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-2 gap-4 no-scrollbar">
          {siblings?.map(dest => (
            <div key={dest.id} className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#800020] transition-all" onClick={() => onSelect(dest)}>
              <img src={getImageUrl(dest.coverImage || dest.images?.[0])} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                <p className="text-white/60 text-xs flex items-center gap-1"><MapPin size={10} /> {dest.district?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ItineraryBuilder = ({ destination: propDestination, duration, startDate, tripConfig }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [itinerary, setItinerary] = useState(() => {
    return Array.from({ length: duration }).map(() => ({
      destination: propDestination,
      dayItems: [],
      accommodation: null
    }));
  });
  
  const [activeDay, setActiveDay] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const { isMuted, toggleMute } = useAudioStore();
  const videoRef = useRef(null);
  const [priceRolling, setPriceRolling] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const { isAuthenticated, user, logout, token } = useAuthStore();
  const navigate = useNavigate();
  const submitDisabled = whatsappNumber.replace(/\D/g, '').length !== 10;
  const [submitting, setSubmitting] = useState(false);

  const submitToMyTrips = async () => {
    setSubmitting(true);
    try {
        const timelinePayload = itinerary ? itinerary.map((day, idx) => ({
            day: idx + 1,
            destination: day.destination?.name || fullDest?.name || '',
            destinationId: day.destination?.id || fullDest?.id || null,
            accommodation: day.accommodation ? {
                id: day.accommodation.id,
                name: day.accommodation.hotelNameInternal || day.accommodation.tier,
                tier: day.accommodation.tier,
                price: day.accommodation.price || 0,
                imageUrl: day.accommodation.imageUrl || day.accommodation.image_url || null,
            } : null,
            activities: (day.dayItems || []).map(item => ({
                id: item.id,
                name: item.name,
                price: item.price || 0,
                imageUrl: item.imageUrl || item.image_url || null,
                category: item.mealType ? 'FOOD' : (item.tier ? 'ACCOMMODATION' : 'ACTIVITY'),
                destinationName: item.destinationName || day.destination?.name || '',
                duration: item.duration || item.timing || null,
            }))
        })) : [{ day: 1, activities: selectedItems.map(item => ({
            id: item.id, name: item.name, price: item.price || 0,
            imageUrl: item.imageUrl || item.image_url || null,
            category: item.mealType ? 'FOOD' : (item.tier ? 'ACCOMMODATION' : 'ACTIVITY'),
        })) }];

        const hotelItem = selectedItems.find(i => i.hotelNameInternal || i.tier);

        const payload = {
            userId: user?.id,
            name: user?.name || 'Guest User',
            email: user?.email,
            phone: whatsappNumber,
            destinationId: fullDest?.id,
            destinationName: fullDest?.name,
            state: fullDest?.district?.state?.name || null,
            district: fullDest?.district?.name || null,
            itinerary: { timeline: timelinePayload },
            itinerarySnapshot: { timeline: timelinePayload },
            hotelSnapshot: hotelItem ? { name: hotelItem.hotelNameInternal || hotelItem.tier, tier: hotelItem.tier, price: hotelItem.price } : null,
            totalBudget: totalPrice,
            days: itinerary?.length || 1,
            people: tripConfig?.people || null,
            vibe: tripConfig?.tripType || null,
            tripDate: new Date(),
            status: 'INQUIRY SENT'
        };

        await axios.post(`${API_BASE_URL}/inquiry`, payload, {
            headers: { Authorization: `Bearer ${token || ''}` }
        });

        navigate('/my-trips');
    } catch (err) {
        console.error('Submission error:', err);
        navigate('/my-trips');
    } finally {
        setSubmitting(false);
    }
  };

  // Sync audio imperatively — HTML muted attr must stay true for autoplay to work
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
      }
    }
  }, [isMuted]);

  const currentDest = itinerary[activeDay]?.destination || propDestination;

  const { data: fullDest, isLoading: destLoading } = useQuery({
    queryKey: ['destination', currentDest?.id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/public/destination/${currentDest.id}`);
      return response.data.data;
    },
    enabled: !!currentDest?.id
  });

  const { data: siblings } = useQuery({
    queryKey: ['siblings', currentDest?.stateId || currentDest?.district?.stateId],
    queryFn: async () => {
      const stateId = currentDest?.stateId || currentDest?.district?.stateId;
      if (!stateId) return [];
      const response = await axios.get(`${API_BASE_URL}/public/destinations/state/${stateId}`);
      return response.data.data.filter(d => d.id !== currentDest.id);
    },
    enabled: !!currentDest?.id
  });

  const assignToSlot = (item) => {
    const newItinerary = [...itinerary];
    const targetDay = activeDay;

    if (item.hotelNameInternal || item.tier) {
      // 1. UNIFIED STAY LOGIC (N-1 Rule)
      // Propagate stay to all days at this destination if added on Day 1
      if (targetDay === 0) {
        newItinerary.forEach(day => {
          if (day.destination.id === item.destinationId) {
            day.accommodation = item;
          }
        });
      } else {
        newItinerary[targetDay].accommodation = item;
      }
    } else {
      newItinerary[targetDay].dayItems.push(item);
    }
    
    setItinerary(newItinerary);
    setSuccessId(item.id);
    setTimeout(() => setSuccessId(null), 800);
    setPriceRolling(true);
    setTimeout(() => setPriceRolling(false), 500);

    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (dayIdx, itemId, type) => {
    const next = [...itinerary];
    if (type === 'accommodation') {
      const stayToRemove = next[dayIdx].accommodation;
      next.forEach(d => {
        if (d.accommodation?.id === stayToRemove?.id) d.accommodation = null;
      });
    } else {
      next[dayIdx].dayItems = next[dayIdx].dayItems.filter(i => i.id !== itemId);
    }
    setItinerary(next);
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    
    // Sum experiences
    itinerary.forEach(day => {
      day.dayItems.forEach(item => total += (item.price || 0));
    });

    // Sum stay (N-1 logic)
    const baseStay = itinerary[0].accommodation;
    if (baseStay) {
      const nights = duration - 1;
      total += (baseStay.price * Math.max(1, nights));
    } else {
      itinerary.slice(1).forEach(day => {
        if (day.accommodation && day.accommodation.id !== itinerary[0].accommodation?.id) {
          total += (day.accommodation.price || 0);
        }
      });
    }

    return total;
  }, [itinerary, duration]);

  const activities = fullDest?.activities || [];
  const foodOptions = fullDest?.foodOptions || [];
  const accommodations = fullDest?.accommodations || [];

  if (destLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="rounded-full border-2 border-[#800020] border-t-transparent w-12 h-12" />
      </div>
    );
  }

  const isAssigned = (id) => itinerary.some(d => d.dayItems.some(i => i.id === id) || d.accommodation?.id === id);

  return (
    <>
    <div className="itinerary-builder-parent">
      <AnimatePresence mode="wait">
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[5000] fixed inset-0">
            <LoginScreen onBack={() => setShowLogin(false)} />
          </motion.div>
        )}
        {showInquiry && (
          <InquiryModal 
            isOpen={showInquiry} 
            onClose={() => setShowInquiry(false)}
            selectedItems={selectedItems}
            totalPrice={totalPrice}
            destination={fullDest}
            user={user}
            itinerary={itinerary}
            tripConfig={tripConfig}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwitcher !== null && (
          <SameStateModal isOpen={true} onClose={() => setShowSwitcher(null)} siblings={siblings} currentState={currentDest?.district?.state?.name || "the region"} onSelect={(dest) => {
            const next = [...itinerary];
            next[showSwitcher].destination = dest;
            setItinerary(next);
            setShowSwitcher(null);
          }} />
        )}
      </AnimatePresence>

      <header className="itinerary-hero-60">
        <div className="hero-video-wrap">
          <video ref={videoRef} autoPlay loop muted playsInline key={currentDest.id}>
            <source src={`/destinationvideo/${currentDest.name.toLowerCase()}.mp4`} type="video/mp4" />
          </video>
          <div className="hero-gradient-fade" />
        </div>
        <div className="hero-info-bar">
          <div className="glass-pill-premium">
            <span className="pill-label">Timeline</span>
            <span className="pill-value">{duration} DAYS</span>
          </div>
          <div className="glass-pill-premium">
            <span className="pill-label">Vibe</span>
            <span className="pill-value">{tripConfig?.tripType || 'COUPLE'}</span>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 z-10 flex gap-4">
          <button 
            className="rh-audio-btn-glass" 
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <AnimatePresence mode="wait">
              {isMuted ? (
                <motion.div key="mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <VolumeX size={20} color="white" />
                </motion.div>
              ) : (
                <motion.div key="unmute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Volume2 size={20} color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      <main className="itinerary-main-split">
        <button className="drawer-toggle-btn lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}><Menu size={24} /></button>
        {isMobileSidebarOpen && <div className="drawer-overlay lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />}

        <aside className={`timeline-column ${isMobileSidebarOpen ? 'open' : ''}`}>
          <div className="timeline-header"><h2 className="timeline-title">Itinerary Architect</h2></div>
          <div className="day-indicators-list no-scrollbar overflow-y-auto max-h-[70vh]">
            {itinerary.map((day, dIdx) => (
              <div key={dIdx} className={`day-indicator-card ${activeDay === dIdx ? 'active' : ''}`} onClick={() => setActiveDay(dIdx)}>
                <div className="day-label-serif flex flex-wrap gap-2 items-center">
                  Day {dIdx + 1}: {day.destination.name}
                  <button className="switch-city-pill" onClick={(e) => { e.stopPropagation(); setShowSwitcher(dIdx); }}>Switch City <ArrowRight size={10} /></button>
                </div>
                
                <div className="slot-architect-stack">
                  {/* ACCOMMODATION (PROPAGATED) */}
                  <div className={`architect-slot ${day.accommodation ? 'filled' : ''}`} onClick={(e) => { e.stopPropagation(); setActiveDay(dIdx); }}>
                    {day.accommodation ? (
                      <div className="slot-filled">
                        <img src={getImageUrl(day.accommodation.imageUrl || day.accommodation.image_url, 'stay')} alt="" loading="lazy" />
                        <div className="flex flex-col">
                          <span className="slot-type-badge">{dIdx > 0 && itinerary[0].accommodation?.id === day.accommodation.id ? 'Continued from Day 1' : 'Base Stay'}</span>
                          <span className="text-xs font-bold text-black/80 truncate max-w-[140px]">{day.accommodation.tier} Sanctuary</span>
                        </div>
                        <button className="ml-auto text-black/20 hover:text-red-500" onClick={(e) => { e.stopPropagation(); removeItem(dIdx, day.accommodation.id, 'accommodation'); }}><Minus size={14} /></button>
                      </div>
                    ) : (<><Home size={14} className="text-[#800020]/40" /><span className="slot-placeholder">Select Base Stay</span></>)}
                  </div>

                  {/* DYNAMIC EXPERIENCES */}
                  <AnimatePresence>
                    {day.dayItems.map((item) => (
                      <motion.div key={item.id} className="architect-slot filled" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="slot-filled">
                          <img src={getImageUrl(item.imageUrl || item.image_url, item.mealType ? 'food' : 'activity')} alt="" loading="lazy" />
                          <div className="flex flex-col">
                            <span className="slot-type-badge">{item.mealType || 'Experience'}</span>
                            <span className="text-xs font-bold text-black/80 truncate max-w-[140px]">{item.name}</span>
                          </div>
                          <button className="ml-auto text-black/20 hover:text-red-500" onClick={(e) => { e.stopPropagation(); removeItem(dIdx, item.id, 'experience'); }}><Minus size={14} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="architect-slot border-dotted" onClick={(e) => { e.stopPropagation(); setActiveDay(dIdx); }}>
                    <Plus size={14} className="text-[#800020]" />
                    <span className="slot-placeholder">+ Add an experience</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="marketplace-column overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentDest.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
              
              <section className="category-block">
                <h3 className="category-header-premium">Sites to enjoy</h3>
                <span className="tagline-premium">Curated for your {tripConfig?.tripType || 'Couple'} selection.</span>
                <div className="marketplace-grid">
                  {activities.map((act, idx) => (
                    <motion.div key={act.id} className="marketplace-card-premium" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} onClick={() => assignToSlot(act)}>
                      <div className="card-img-wrap">
                        <img src={getImageUrl(act.imageUrl || act.image_url)} alt={act.name} loading="lazy" />
                        <button className="quick-add-btn">{isAssigned(act.id) ? <Check size={20} /> : <Plus size={20} />}</button>
                        <AnimatePresence>{successId === act.id && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="success-popover"><Check size={48} /></motion.div>)}</AnimatePresence>
                      </div>
                      <div className="card-body-premium">
                        <div className="card-price-premium">₹{act.price?.toLocaleString()}</div>
                        <h4 className="card-title-serif">{act.name}</h4>
                        <div className="card-meta-row"><Clock size={12} /> {act.duration} • <Star size={12} fill="#fbbf24" className="text-yellow-400" /> 4.8</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="category-block">
                <h3 className="category-header-premium">Eat with all your soul</h3>
                <span className="tagline-premium">Curated for your {tripConfig?.tripType || 'Couple'} selection.</span>
                <div className="marketplace-grid">
                  {foodOptions.map((food, idx) => (
                    <motion.div key={food.id} className="marketplace-card-premium" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} onClick={() => assignToSlot(food)}>
                      <div className="card-img-wrap">
                        <img src={getImageUrl(food.imageUrl || food.image_url, 'food')} alt={food.name} className="asset-img-cover" loading="lazy" />
                        <button className="quick-add-btn">{isAssigned(food.id) ? <Check size={20} /> : <Plus size={20} />}</button>
                      </div>
                      <div className="card-body-premium">
                        <div className="card-price-premium">₹{food.price?.toLocaleString()}</div>
                        <h4 className="card-title-serif">{food.name}</h4>
                        <div className="card-meta-row">{food.mealType} • {food.cuisine || 'Local Flavor'}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="category-block">
                <h3 className="category-header-premium">Stays & Sanctuaries</h3>
                <span className="tagline-premium">Curated for your {tripConfig?.tripType || 'Couple'} selection.</span>
                <div className="marketplace-grid">
                  {accommodations.map((acc, idx) => (
                    <motion.div key={acc.id} className="marketplace-card-premium" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} onClick={() => assignToSlot(acc)}>
                      <div className="card-img-wrap">
                        <img src={getImageUrl(acc.imageUrl || acc.image_url, 'stay')} alt={acc.tier} className="asset-img-cover" loading="lazy" />
                        <button className="quick-add-btn">{isAssigned(acc.id) ? <Check size={20} /> : <Plus size={20} />}</button>
                      </div>
                      <div className="card-body-premium">
                        <div className="card-price-premium">₹{acc.price?.toLocaleString()}</div>
                        <h4 className="card-title-serif">{acc.tier} Sanctuary</h4>
                        <div className="card-meta-row flex items-center gap-1"><Star size={12} fill="#fbbf24" className="text-yellow-400" /> {acc.stars} Stars</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>

    {/* CONFIRMATION MODAL */}
    <AnimatePresence>
      {showConfirmModal && (
        <>
          <motion.div 
            className="confirm-modal-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          />
          <motion.div 
            className="confirm-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            style={{ top: '50%', left: '50%' }}
          >
            <h2 className="confirm-modal-header">Confirm Your Selection</h2>
            <button 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
              onClick={() => setShowConfirmModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className="trip-summary-list">
              <div className="summary-item">
                <span>Experiences ({itinerary.reduce((acc, day) => acc + day.dayItems.length, 0)})</span>
                <span>Included</span>
              </div>
              <div className="summary-item">
                <span>Accommodation</span>
                <span>Included</span>
              </div>
              <div className="summary-total">
                <span>Total Price</span>
                <span>₹{totalPrice > 0 ? totalPrice.toLocaleString() : "2,100"}</span>
              </div>
            </div>

            <div className="whatsapp-input-wrap">
              <svg className="whatsapp-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.011.266 1.996.766 2.868l-.813 2.97 3.037-.797c.84.457 1.782.698 2.768.698h.004c3.18 0 5.766-2.585 5.768-5.766 0-1.541-.6-2.991-1.689-4.08a5.727 5.727 0 0 0-4.073-1.659zm0-1.583c1.966 0 3.816.765 5.205 2.155A7.324 7.324 0 0 1 19.38 11.94c-.001 4.05-3.298 7.348-7.348 7.348-.002 0 0 0 0 0-1.282 0-2.535-.335-3.633-.97L3 20.125l1.844-5.263a7.35 7.35 0 0 1-1.025-3.722c0-4.051 3.297-7.35 7.348-7.35h.001A7.307 7.307 0 0 1 12.03 4.59h.001zm3.896 9.878c-.214-.107-1.264-.624-1.46-.695-.194-.071-.336-.107-.478.107-.142.213-.55.694-.675.836-.123.143-.247.16-.46.054-.214-.107-.903-.333-1.72-1.061-.635-.566-1.063-1.264-1.187-1.478-.124-.213-.013-.328.093-.435.096-.096.213-.25.32-.375.106-.125.142-.213.213-.356.071-.143.035-.268-.018-.375-.053-.107-.478-1.152-.654-1.577-.171-.416-.345-.359-.478-.365-.122-.006-.265-.006-.407-.006-.142 0-.374.053-.568.267-.194.214-.746.73-.746 1.782 0 1.052.763 2.068.87 2.21.106.143 1.506 2.3 3.647 3.224.509.219.907.351 1.218.45.512.162.978.139 1.345.084.414-.061 1.264-.516 1.442-1.015.178-.499.178-.928.125-1.016-.054-.089-.196-.143-.41-.25z"/>
              </svg>
              <input 
                type="tel" 
                className="whatsapp-input" 
                placeholder="WhatsApp Number" 
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>

            <button 
              className="btn-submit-request"
              disabled={submitDisabled || submitting}
              style={{ opacity: (submitDisabled || submitting) ? 0.5 : 1, pointerEvents: (submitDisabled || submitting) ? 'none' : 'auto' }}
              onClick={submitToMyTrips}
            >
              {submitting ? 'Submitting...' : 'Submit Request'} <ArrowRight size={20} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Portalled footer — escapes all stacking contexts, always on top */}
    {createPortal(
      <AnimatePresence>
        {!showConfirmModal && (
          <motion.div 
            className="itinerary-footer"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="avatar-stack">
              {selectedItems.slice(0, 3).map((item) => (
                <img
                  key={item.id}
                  className="avatar-circle"
                  src={getImageUrl(item.imageUrl || item.image_url)}
                  alt=""
                />
              ))}
              {selectedItems.length > 3 && (
                <div className="avatar-circle bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">+{selectedItems.length - 3}</span>
                </div>
              )}
            </div>
            
            <span className="footer-text-slim hidden sm:block">Roam together, explore forever.</span>
            
            <button
              className="footer-btn-send"
              onClick={() => {
                if (isAuthenticated) setShowConfirmModal(true);
                else setShowLogin(true);
              }}
            >
              Send it to us! <Send size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};

export default ItineraryBuilder;
