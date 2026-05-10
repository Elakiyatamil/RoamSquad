import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Check, ArrowRight, Volume2, VolumeX,
  Star, Clock, Plus, X,
  Home, Send
} from 'lucide-react';
import './ItineraryBuilder.css';
import InquiryModal from './InquiryModal';
import useAuthStore from '../../store/authStore';
import useAudioStore from '../../store/useAudioStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';

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
    <div style={{
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <p className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Switch City</p>
        <p className="modal-sub" style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '24px' }}>Other destinations in {currentState || 'this region'}</p>

        <div className="city-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {siblings?.map(dest => (
            <div key={dest.id} className="city-option" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', background: '#FAF8F5', cursor: 'pointer' }} onClick={() => onSelect(dest)}>
              <img src={getImageUrl(dest.coverImage || dest.images?.[0])} className="city-thumb" alt={dest.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <p className="city-name" style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{dest.name}</p>
                <p className="city-state" style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>{dest.district?.state?.name || dest.state}</p>
              </div>
            </div>
          ))}
          {(!siblings || siblings.length === 0) && <p className="no-options">No other cities available in this region.</p>}
        </div>
      </div>
    </div>
  );
};

const ItineraryBuilder = ({ destination: propDestination, duration, tripConfig }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [itinerary, setItinerary] = useState(() => {
    return Array.from({ length: duration }).map(() => ({
      destination: propDestination,
      dayItems: [],
      accommodation: null
    }));
  });
  
  const [activeDay, setActiveDay] = useState(0);
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
  const [duplicateToConfirm, setDuplicateToConfirm] = useState(null);

  const totalPrice = useMemo(() => {
    let total = 0;
    itinerary.forEach(day => {
      day.dayItems.forEach(item => total += (item.price || 0));
    });
    const baseStay = itinerary[0].accommodation;
    if (baseStay) {
      const nights = duration - 1;
      total += (baseStay.price * Math.max(1, nights));
    }
    return total;
  }, [itinerary, duration]);

  const submitToMyTrips = async () => {
    setSubmitting(true);
    try {
        const timelinePayload = itinerary.map((day, idx) => ({
            day: idx + 1,
            destination: day.destination?.name || '',
            destinationId: day.destination?.id || null,
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

        setItinerarySent(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { navigate('/my-trips'); }, 2000);

    } catch (err) {
        console.error('Submission error:', err);
        navigate('/my-trips');
    } finally {
        setSubmitting(false);
    }
  };

  const handleSendItinerary = () => {
    if (!isAuthenticated) {
      // Basic simulation of saving pending
      const payload = { 
        destinationId: fullDest?.id, 
        destinationName: fullDest?.name,
        itinerary: { timeline: [] },
        days: itinerary.length,
        totalBudget: totalPrice
      };
      sessionStorage.setItem('pendingItinerary', JSON.stringify(payload));
      navigate('/login', { state: { redirectTo: '/planner', reason: 'send' } });
      return;
    }
    setShowConfirmModal(true);
  };

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
    const isAccommodation = !!(item.hotelNameInternal || item.tier);
    const currentDay = itinerary[activeDay];
    
    // Check if already in current day
    const isDuplicate = isAccommodation 
      ? currentDay.accommodation?.id === item.id
      : currentDay.dayItems.some(i => i.id === item.id);

    if (isDuplicate) {
      setDuplicateToConfirm(item);
      return;
    }

    executeAdd(item);
  };

  const executeAdd = (item) => {
    const isAccommodation = !!(item.hotelNameInternal || item.tier);
    const newItinerary = [...itinerary];
    if (isAccommodation) {
      if (activeDay === 0) {
        // Base stay logic: applies to all days in this city
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
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
    setDuplicateToConfirm(null);
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

  if (destLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#FAF8F5]">Loading...</div>;

  const isAssigned = (id) => itinerary.some(d => d.dayItems.some(i => i.id === id) || d.accommodation?.id === id);

  return (
    <div className="itinerary-builder-parent">
      <AnimatePresence>
        {duplicateToConfirm && (
          <div style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }} onClick={() => setDuplicateToConfirm(null)}>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#FFF0F3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Plus size={24} color="#8B2040" />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: '#1A1A2E' }}>Add Duplicate?</h2>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.5', marginBottom: '24px' }}>
                  <strong>"{duplicateToConfirm.name || duplicateToConfirm.tier}"</strong> is already in your itinerary for Day {activeDay + 1}. Do you want to add it again?
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="base-stay-btn" style={{ margin: 0, borderStyle: 'solid', borderColor: '#E5E7EB', color: '#6B7280', flex: 1 }} onClick={() => setDuplicateToConfirm(null)}>
                    Cancel
                  </button>
                  <button className="btn-submit-request" style={{ margin: 0, padding: '12px', flex: 1 }} onClick={() => executeAdd(duplicateToConfirm)}>
                    Yes, Add Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showSwitcher !== null && (
          <SameStateModal isOpen={true} onClose={() => setShowSwitcher(null)} siblings={siblings} currentState={currentDest?.district?.state?.name} onSelect={(dest) => {
            const next = [...itinerary];
            next[showSwitcher].destination = dest;
            setItinerary(next);
            setShowSwitcher(null);
          }} />
        )}
      </AnimatePresence>

      {/* 2. HERO IMAGE — reduce height, clean fade */}
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

      {/* 1. TIMELINE + VIBE BADGES — reposition nicely */}
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

      {/* 3. PAGE LAYOUT — two-column on desktop */}
      <main className="itinerary-layout">
        
        {/* LEFT COLUMN: DAY CARDS */}
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
              <div className="experience-item">
                <img src={getImageUrl(itinerary[activeDay].accommodation.imageUrl || itinerary[activeDay].accommodation.image_url, 'stay')} className="experience-thumb" alt="" />
                <div className="experience-info">
                  <span className="experience-tag">Base Stay</span>
                  <span className="experience-name">{itinerary[activeDay].accommodation.tier} Sanctuary</span>
                </div>
                <div className="remove-btn" onClick={() => removeItem(activeDay, itinerary[activeDay].accommodation.id, 'accommodation')}><X size={12} /></div>
              </div>
            ) : (
              <button className="base-stay-btn" onClick={() => {}}>
                <Home size={16} /> <span>+ Select Base Stay</span>
              </button>
            )}

            {/* Experiences */}
            <div className="experience-list">
              {itinerary[activeDay].dayItems.map((item) => (
                <div key={item.id} className="experience-item">
                  <img src={getImageUrl(item.imageUrl || item.image_url, item.mealType ? 'food' : 'activity')} className="experience-thumb" alt="" />
                  <div className="experience-info">
                    <span className="experience-tag">{item.mealType || 'Experience'}</span>
                    <span className="experience-name">{item.name}</span>
                  </div>
                  <div className="remove-btn" onClick={() => removeItem(activeDay, item.id, 'experience')}><X size={12} /></div>
                </div>
              ))}
              <button className="add-experience-btn">
                <Plus size={16} /> <span>+ Add an experience</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: CURATED CARDS */}
        <div className="marketplace-column">
          <AnimatePresence mode="wait">
            <motion.div key={currentDest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              {/* SITES SECTION */}
              <section className="mb-12">
                <h2 className="section-heading">Sites to enjoy</h2>
                <span className="section-sub">Curated for your {tripConfig?.tripType || 'Couple'} selection.</span>
                <div className="curated-row">
                  {fullDest?.activities?.map((act) => {
                    const assigned = isAssigned(act.id);
                    return (
                      <div key={act.id} className="curated-card" onClick={() => assignToSlot(act)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(act.imageUrl || act.image_url)} alt={act.name} />
                          {assigned && <div className="check-badge"><Check size={16} strokeWidth={3} /></div>}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{act.name}</h4>
                            <div className="curated-price">₹{act.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta"><Clock size={12} /> {act.duration}</div>
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
                      <div key={food.id} className="curated-card" onClick={() => assignToSlot(food)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(food.imageUrl || food.image_url, 'food')} alt={food.name} />
                          {assigned && <div className="check-badge"><Check size={16} strokeWidth={3} /></div>}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{food.name}</h4>
                            <div className="curated-price">₹{food.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta">{food.mealType} • {food.cuisine}</div>
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
                      <div key={acc.id} className="curated-card" onClick={() => assignToSlot(acc)}>
                        <div className="curated-img-wrap">
                          <img src={getImageUrl(acc.imageUrl || acc.image_url, 'stay')} alt={acc.tier} />
                          {assigned && <div className="check-badge"><Check size={16} strokeWidth={3} /></div>}
                        </div>
                        <div className="curated-card-body">
                          <div className="curated-header-row">
                            <h4 className="curated-name">{acc.tier} Sanctuary</h4>
                            <div className="curated-price">₹{acc.price?.toLocaleString()}</div>
                          </div>
                          <div className="curated-meta"><Star size={12} fill="#fbbf24" className="text-yellow-400" /> {acc.stars} Stars</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 8. BOTTOM TOAST BAR */}
      <AnimatePresence>
        {!showConfirmModal && (
          <motion.div className="toast-bar" initial={{ y: 100, x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: 100, x: '-50%' }}>
            <div className="stacked-avatars">
              {selectedItems.slice(0, 3).map(item => (
                <img key={item.id} src={getImageUrl(item.imageUrl || item.image_url)} className="avatar-circle" alt="" />
              ))}
              {selectedItems.length > 3 && <div className="avatar-more">+{selectedItems.length - 3}</div>}
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
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', background: '#1A1A2E', color: 'white', fontFamily: 'Poppins', padding: '20px 32px', borderRadius: '20px', zIndex: 99999, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', minWidth: '280px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✈️</div>
          <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>Itinerary sent!</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>Taking you to My Trips...</p>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div className="confirm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmModal(false)} />
            <motion.div className="confirm-modal-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001 }}>
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
  );
};

export default ItineraryBuilder;
