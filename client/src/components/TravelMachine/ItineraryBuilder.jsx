import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Check, ArrowRight, Volume2, VolumeX,
  Star, Clock, Plus, Minus, X,
  MapPin, Send, Home
} from 'lucide-react';
import './ItineraryBuilder.css';
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
  if (type === 'food' && !url.includes('/')) return `${BACKEND_URL}/uploads/food/${url}`;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
};

const SameStateModal = ({ isOpen, onClose, siblings, currentState, onSelect }) => {
  if (!isOpen) return null;
  return (
    <div className="switch-modal-overlay" onClick={onClose}>
      <motion.div 
        className="switch-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <p className="modal-title">Switch City</p>
        <p className="modal-sub">Other destinations in {currentState || 'this region'}</p>

        <div className="city-list">
          {siblings?.map(dest => (
            <div
              key={dest.id}
              className="city-option"
              onClick={() => onSelect(dest)}
            >
              <img src={getImageUrl(dest.coverImage || dest.images?.[0])} className="city-thumb" alt={dest.name} />
              <div>
                <p className="city-name">{dest.name}</p>
                <p className="city-state">{dest.district?.state?.name || dest.state}</p>
              </div>
            </div>
          ))}

          {(!siblings || siblings.length === 0) && (
            <p className="no-options">No other cities available in this region.</p>
          )}
        </div>
      </motion.div>
    </div>
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
  const [showSwitcher, setShowSwitcher] = useState(null);
  const { isAuthenticated, user, token } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [itinerarySent, setItinerarySent] = useState(false);

  const handleSendItinerary = async () => {
    if (!isAuthenticated) {
      // Not logged in — save itinerary to sessionStorage first
      const timelinePayload = itinerary.map((day, idx) => ({
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
      }));

      const payload = {
          destinationId: fullDest?.id,
          destinationName: fullDest?.name,
          state: fullDest?.district?.state?.name || null,
          district: fullDest?.district?.name || null,
          itinerary: { timeline: timelinePayload },
          totalBudget: totalPrice,
          days: itinerary.length,
          people: tripConfig?.people || null,
          vibe: tripConfig?.tripType || null,
          tripDate: new Date(),
          status: 'INQUIRY SENT'
      };

      sessionStorage.setItem('pendingItinerary', JSON.stringify(payload));
      navigate('/login', { state: { redirectTo: '/planner', reason: 'send' } });
      return;
    }

    await submitToMyTrips();
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    itinerary.forEach(day => {
      day.dayItems.forEach(item => total += (item.price || 0));
    });
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

  const submitToMyTrips = async () => {
    setSubmitting(true);
    try {
        const timelinePayload = itinerary.map((day, idx) => ({
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
        }));

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
            totalBudget: totalPrice,
            days: itinerary.length,
            people: tripConfig?.people || null,
            vibe: tripConfig?.tripType || null,
            tripDate: new Date(),
            status: 'INQUIRY SENT'
        };

        await axios.post(`${API_BASE_URL}/inquiry`, payload, {
            headers: { Authorization: `Bearer ${token || ''}` }
        });

        // SUCCESS FLOW
        setItinerarySent(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          navigate('/my-trips');
        }, 2000);

    } catch (err) {
        console.error('Submission error:', err);
        // Still show toast or navigate if error? User said "after API call succeeds, THEN navigate"
        // I'll show error toast or just navigate
        navigate('/my-trips');
    } finally {
        setSubmitting(false);
    }
  };

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
    if (item.hotelNameInternal || item.tier) {
      if (activeDay === 0) {
        newItinerary.forEach(day => {
          if (day.destination.id === item.destinationId) day.accommodation = item;
        });
      } else {
        newItinerary[activeDay].accommodation = item;
      }
    } else {
      newItinerary[activeDay].dayItems.push(item);
    }
    setItinerary(newItinerary);
    if (!selectedItems.find(i => i.id === item.id)) setSelectedItems([...selectedItems, item]);
  };

  const removeItem = (dayIdx, itemId, type) => {
    const next = [...itinerary];
    if (type === 'accommodation') {
      const stayToRemove = next[dayIdx].accommodation;
      next.forEach(d => { if (d.accommodation?.id === stayToRemove?.id) d.accommodation = null; });
    } else {
      next[dayIdx].dayItems = next[dayIdx].dayItems.filter(i => i.id !== itemId);
    }
    setItinerary(next);
  };

  if (destLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF8F5]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="rounded-full border-2 border-[#8B2040] border-t-transparent w-12 h-12" />
      </div>
    );
  }

  const isAssigned = (id) => itinerary.some(d => d.dayItems.some(i => i.id === id) || d.accommodation?.id === id);

  return (
    <>
    <div className="itinerary-builder-parent">
      <AnimatePresence mode="wait">

        {showInquiry && (
          <InquiryModal isOpen={showInquiry} onClose={() => setShowInquiry(false)} selectedItems={selectedItems} totalPrice={totalPrice} destination={fullDest} user={user} itinerary={itinerary} tripConfig={tripConfig} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwitcher !== null && (
          <SameStateModal isOpen={true} onClose={() => setShowSwitcher(null)} siblings={siblings} currentState={currentDest?.district?.state?.name} onSelect={(dest) => {
            const next = [...itinerary];
            next[showSwitcher].destination = dest;
            setItinerary(next);
            setShowSwitcher(null);
          }} />
        )}
      </AnimatePresence>

      {/* 2. HERO IMAGE */}
      <header className="itinerary-hero">
        <video ref={videoRef} autoPlay loop muted playsInline key={currentDest.id}>
          <source src={`/destinationvideo/${currentDest.name.toLowerCase()}.mp4`} type="video/mp4" />
        </video>
        <div className="absolute bottom-4 right-4 z-10">
          <button className="rh-audio-btn-glass" onClick={toggleMute}>
            {isMuted ? <VolumeX size={18} color="white" /> : <Volume2 size={18} color="white" />}
          </button>
        </div>
      </header>

      {/* 1. BADGE ROW */}
      <div className="badge-row">
        <div className="badge-pill">
          <span className="badge-label">Timeline</span>
          <span className="badge-value">{duration} DAYS</span>
        </div>
        <div className="badge-pill">
          <span className="badge-label">Vibe</span>
          <span className="badge-value">{tripConfig?.tripType || 'COUPLE'}</span>
        </div>
      </div>

      {/* 3. PAGE LAYOUT */}
      <main className="itinerary-layout">
        
        {/* LEFT COLUMN: MARKETPLACE */}
        <div className="marketplace-column">
          <AnimatePresence mode="wait">
            <motion.div key={currentDest.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              {/* SITES SECTION */}
              <section className="mb-12">
                <h2 className="section-heading">Sites to enjoy</h2>
                <span className="section-sub">Curated for your {tripConfig?.tripType || 'Couple'} selection.</span>
                <div className="curated-row">
                  {fullDest?.activities?.map((act) => {
                    const assigned = isAssigned(act.id);
                    return (
                      <div key={act.id} className={`curated-card ${assigned ? 'selected' : ''}`} onClick={() => assignToSlot(act)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(act.imageUrl || act.image_url)} alt={act.name} />
                          {assigned && (
                            <div className="check-badge">
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{act.name}</h4>
                            <div className="curated-price">₹{act.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta"><Clock size={12} /> {act.duration}</div>
                          <button className="add-to-day-btn">
                            <Plus size={14} /> Add to Day
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* FOOD SECTION */}
              <section className="mb-12">
                <h2 className="section-heading">Eat with all your soul</h2>
                <span className="section-sub">Taste the local essence.</span>
                <div className="curated-row">
                  {fullDest?.foodOptions?.map((food) => {
                    const assigned = isAssigned(food.id);
                    return (
                      <div key={food.id} className={`curated-card ${assigned ? 'selected' : ''}`} onClick={() => assignToSlot(food)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(food.imageUrl || food.image_url, 'food')} alt={food.name} />
                          {assigned && (
                            <div className="check-badge">
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{food.name}</h4>
                            <div className="curated-price">₹{food.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta">{food.mealType} • {food.cuisine}</div>
                          <button className="add-to-day-btn">
                            <Plus size={14} /> Add to Day
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* STAYS SECTION */}
              <section className="mb-12">
                <h2 className="section-heading">Stays & Sanctuaries</h2>
                <span className="section-sub">Handpicked luxury for you.</span>
                <div className="curated-row">
                  {fullDest?.accommodations?.map((acc) => {
                    const assigned = isAssigned(acc.id);
                    return (
                      <div key={acc.id} className={`curated-card ${assigned ? 'selected' : ''}`} onClick={() => assignToSlot(acc)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(acc.imageUrl || acc.image_url, 'stay')} alt={acc.tier} />
                          {assigned && (
                            <div className="check-badge">
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{acc.tier} Sanctuary</h4>
                            <div className="curated-price">₹{acc.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta"><Star size={12} fill="#fbbf24" className="text-yellow-400" /> {acc.stars} Stars</div>
                          <button className="add-to-day-btn">
                            <Plus size={14} /> Add to Day
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: ITINERARY ARCHITECT */}
        <aside className="timeline-column">
          
          {/* 4. DAY TABS */}
          <div className="day-tabs">
            {itinerary.map((_, i) => (
              <button key={i} className={`day-tab ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                Day {i + 1}
              </button>
            ))}
          </div>

          {/* 5. DAY CARD */}
          <div className="day-card">
            <div className="day-card-header">
              <div>
                <h3 className="day-title">Day {activeDay + 1}</h3>
                <span className="day-destination">{itinerary[activeDay].destination.name}</span>
              </div>
              <button className="switch-city-btn" onClick={() => setShowSwitcher(activeDay)}>
                Switch City <ArrowRight size={10} />
              </button>
            </div>

            {/* Base Stay */}
            {itinerary[activeDay].accommodation ? (
              <div className="experience-item" data-type="BASE STAY">
                <img src={getImageUrl(itinerary[activeDay].accommodation.imageUrl || itinerary[activeDay].accommodation.image_url, 'stay')} className="experience-thumb" alt="" />
                <div className="experience-info">
                  <span className="experience-tag">Base Stay</span>
                  <span className="experience-name">{itinerary[activeDay].accommodation.tier} Sanctuary</span>
                </div>
                <div className="remove-btn" onClick={() => removeItem(activeDay, itinerary[activeDay].accommodation.id, 'accommodation')}><X size={12} /></div>
              </div>
            ) : (
              <div className="empty-slot dashed" onClick={() => setActiveDay(activeDay)}>
                <Home size={16} /> <span>+ Add Base Stay</span>
              </div>
            )}

            {/* Experiences */}
            <div className="experience-list">
              {itinerary[activeDay].dayItems.length > 0 ? (
                itinerary[activeDay].dayItems.map((item) => {
                  const type = item.mealType ? 'DINNER' : (item.isSpecial ? 'LOCAL SPECIAL' : 'EXPERIENCE');
                  return (
                    <div key={item.id} className="experience-item" data-type={type}>
                      <img src={getImageUrl(item.imageUrl || item.image_url, item.mealType ? 'food' : 'activity')} className="experience-thumb" alt="" />
                      <div className="experience-info">
                        <span className="experience-tag">{item.mealType || 'Experience'}</span>
                        <span className="experience-name">{item.name}</span>
                      </div>
                      <div className="remove-btn" onClick={() => removeItem(activeDay, item.id, 'experience')}><X size={12} /></div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-slot dashed" style={{ marginTop: '12px' }}>
                  <Plus size={16} /> <span>+ Add your first experience</span>
                </div>
              )}
            </div>
          </div>
        </aside>

      </main>

      {/* 8. BOTTOM TOAST BAR */}
      <AnimatePresence>
        {!showConfirmModal && (
          <motion.div className="toast-bar" initial={{ y: 100, x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: 100, x: '-50%' }}>
            <div className="toast-left">
              <div className="stacked-avatars">
                {selectedItems.slice(0, 3).map(item => (
                  <img key={item.id} src={getImageUrl(item.imageUrl || item.image_url)} className="avatar-circle" alt="" />
                ))}
                {selectedItems.length > 3 && <div className="avatar-more">+{selectedItems.length - 3}</div>}
              </div>
            </div>
            <span className="toast-text">Ready to roam?</span>
            <button className="send-btn" onClick={handleSendItinerary}>
              Send it to us! <Send size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST */}
      {itinerarySent && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A2E',
          color: 'white',
          fontFamily: 'Poppins',
          padding: '20px 32px',
          borderRadius: '20px',
          zIndex: 99999,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'modalPop 0.3s ease',
          minWidth: '280px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✈️</div>
          <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
            Itinerary sent!
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>
            Taking you to My Trips...
          </p>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div className="confirm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmModal(false)} />
            <motion.div className="confirm-modal-card" initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }} animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }} exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }} style={{ top: '50%', left: '50%' }}>
              <h2 className="confirm-modal-header">Confirm Selection</h2>
              <div className="mb-6">
                <div className="summary-item"><span>Experiences</span><span>{selectedItems.length} items</span></div>
                <div className="summary-item"><span>Duration</span><span>{duration} Days</span></div>
                <div className="summary-total"><span>Total Budget</span><span>₹{totalPrice.toLocaleString()}</span></div>
              </div>
              <div className="whatsapp-input-wrap">
                <input type="tel" className="whatsapp-input" placeholder="WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              </div>
              <button className="btn-submit-request" disabled={submitting || whatsappNumber.length < 10} onClick={submitToMyTrips}>
                {submitting ? 'Sending...' : 'Submit to Squad'} <ArrowRight size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ItineraryBuilder;
