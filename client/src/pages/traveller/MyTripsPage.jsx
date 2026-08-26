import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Calendar, MapPin, ChevronRight, AlertCircle, Plus, Copy, 
  CheckCircle2, Clock, Download, Users, Edit3, LogIn, Lock, Sparkles, FileText, Send
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import usePlannerStore from '../../store/usePlannerStore';
import axios from 'axios';
import { generatePDF } from '../../utils/pdfExport';
import LuggageFooter from '../../components/LuggageFooter/LuggageFooter';
import PackingChecklist from '../../components/PackingChecklist/PackingChecklist';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState('submitted'); // 'submitted' | 'drafts'
  const [submittedTrips, setSubmittedTrips] = useState([]);
  const [draftTrips, setDraftTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      let fetchedSubmitted = [];
      let fetchedDrafts = [];

      if (isAuthenticated && token && user) {
        try {
          // 1. Fetch User Submitted Inquiries (Strictly scoped by backend req.user.id)
          const resInquiries = await axios.get(`${API_BASE}/api/inquiry/my?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchedSubmitted = resInquiries.data?.data || [];
        } catch (err) {
          console.error('[MyTripsPage] Error fetching user inquiries:', err);
        }

        try {
          // 2. Fetch User Saved Draft Plans from server
          const resPlans = await axios.get(`${API_BASE}/api/user/plans?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchedDrafts = resPlans.data?.data || [];
        } catch (err) {
          console.error('[MyTripsPage] Error fetching user drafts:', err);
        }
      }

      // 3. Gather local storage drafts (both for Guest Mode and as local working copy)
      const localGuestDraftsRaw = localStorage.getItem('guest_drafts');
      const localPlannerStoreRaw = localStorage.getItem('roamg-planner-store');
      
      let localDrafts = [];
      if (localGuestDraftsRaw) {
        try {
          localDrafts = JSON.parse(localGuestDraftsRaw);
        } catch (_) {}
      }

      // Check current active planner store state
      if (localPlannerStoreRaw) {
        try {
          const parsedStore = JSON.parse(localPlannerStoreRaw);
          const storeState = parsedStore.state || parsedStore;
          if (storeState && (storeState.destination || storeState.vibe)) {
            const activeDraft = {
              id: 'active_planner_draft',
              isLocalActive: true,
              isGuestMode: !isAuthenticated,
              destinationName: typeof storeState.destination === 'string' ? storeState.destination : storeState.destination?.name || 'In-Progress Trip',
              destination: storeState.destination,
              days: storeState.duration || 3,
              travelers: storeState.travelers,
              vibe: storeState.vibe,
              startDate: storeState.startDate,
              endDate: storeState.endDate,
              status: !isAuthenticated ? 'UNSAVED DRAFT (GUEST MODE)' : 'DRAFT / IN PROGRESS',
              createdAt: new Date().toISOString()
            };

            // Avoid duplicate if active draft is already listed
            if (!localDrafts.some(d => d.id === 'active_planner_draft')) {
              localDrafts.unshift(activeDraft);
            }
          }
        } catch (_) {}
      }

      // Combine drafts
      const allDrafts = [...fetchedDrafts, ...localDrafts];
      // Deduplicate drafts by ID
      const uniqueDrafts = Array.from(new Map(allDrafts.map(item => [item.id || item._id, item])).values());

      setSubmittedTrips(fetchedSubmitted);
      setDraftTrips(uniqueDrafts);
      setIsLoading(false);
    };

    fetchData();
  }, [isAuthenticated, token, user]);

  // Status Styling Config Helper
  const getStatusBadgeConfig = (status, isGuestMode = false) => {
    if (isGuestMode || status === 'UNSAVED DRAFT (GUEST MODE)') {
      return {
        label: 'Unsaved Draft (Guest Mode)',
        bg: 'rgba(249, 115, 22, 0.12)',
        color: '#c2410c',
        borderColor: 'rgba(249, 115, 22, 0.3)',
        icon: AlertCircle
      };
    }

    const s = (status || '').toLowerCase();
    if (s.includes('confirm') || s.includes('book') || s.includes('approve')) {
      return {
        label: '🟢 CONFIRMED / BOOKED',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#047857',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        icon: CheckCircle2
      };
    }
    if (s.includes('reject') || s.includes('cancel')) {
      return {
        label: '🔴 REJECTED',
        bg: 'rgba(244, 63, 94, 0.12)',
        color: '#be123c',
        borderColor: 'rgba(244, 63, 94, 0.3)',
        icon: AlertCircle
      };
    }
    if (s.includes('draft')) {
      return {
        label: '⚪ DRAFT / IN PROGRESS',
        bg: 'rgba(99, 102, 241, 0.12)',
        color: '#4338ca',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        icon: Edit3
      };
    }
    // Default: Pending review
    return {
      label: '🟡 PENDING ADMIN REVIEW',
      bg: 'rgba(245, 158, 11, 0.12)',
      color: '#b45309',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      icon: Clock
    };
  };

  // Helper for title display
  const getTripTitle = (trip) => {
    if (trip.destinationName && trip.destinationName !== 'null') return trip.destinationName;
    if (trip.name && trip.name !== 'null') return trip.name;
    if (trip.district && trip.state) return `${trip.district}, ${trip.state}`;
    if (trip.state) return trip.state;
    if (trip.destination && typeof trip.destination === 'string') return trip.destination;
    if (trip.destination && trip.destination.name) return trip.destination.name;
    return 'Custom Journey';
  };

  const getTravelersCount = (trip) => {
    if (typeof trip.travelers === 'object' && trip.travelers !== null) {
      return (trip.travelers.adults || 0) + (trip.travelers.kids || 0);
    }
    return trip.people ?? trip.travelers ?? trip.itinerarySnapshot?.people ?? 2;
  };

  // Edit draft in planner
  const handleEditDraft = (draft) => {
    const updateData = usePlannerStore.getState().updateData;
    const setStep = usePlannerStore.getState().setStep;

    updateData({
      destination: draft.destination || draft.destinationName || draft.state || null,
      duration: draft.days || draft.daysCount || 3,
      startDate: draft.startDate || '',
      endDate: draft.endDate || '',
      travelers: typeof draft.travelers === 'object' ? draft.travelers : { adults: getTravelersCount(draft), kids: 0 },
      vibe: draft.vibe || null,
    });
    setStep(1);
    navigate('/planner');
  };

  // Display List based on Active Tab
  const activeList = activeTab === 'submitted' ? submittedTrips : draftTrips;

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FAF8F4 0%, #F5F0E8 100%)', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <header style={{ position: 'relative', width: '100%', height: '42vh', minHeight: 310, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=2000&q=90&auto=format"
          alt="Your Journeys"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, #FAF8F4 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', marginTop: 40 }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
          >
            Your Journeys
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)', color: 'rgba(255,255,255,0.85)', marginTop: 10, fontStyle: 'italic' }}
          >
            Manage your submitted inquiries, active drafts &amp; custom itineraries
          </motion.p>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 940, margin: '0 auto', padding: '0 24px 120px', position: 'relative', zIndex: 20, marginTop: -24 }}>

        {/* TOP ROW: Action Button & Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          
          {/* Create New Itinerary Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link 
              to="/planner" 
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 100,
                background: '#800020', color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: 13.5, letterSpacing: 0.3,
                boxShadow: '0 6px 20px rgba(128,0,32,0.28)', transition: 'all 0.25s ease',
              }}
            >
              <Plus size={16} />
              Craft New Itinerary
            </Link>
          </div>

          {/* Categorization Tabs */}
          <div style={{
            display: 'flex', gap: 12, background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('submitted')}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13.5, transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: activeTab === 'submitted' ? '#0f172a' : 'transparent',
                color: activeTab === 'submitted' ? '#ffffff' : '#64748b',
                boxShadow: activeTab === 'submitted' ? '0 4px 12px rgba(15,23,42,0.15)' : 'none'
              }}
            >
              <Send size={15} />
              <span>Submitted to Admin</span>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: activeTab === 'submitted' ? 'rgba(255,255,255,0.2)' : 'rgba(100,116,139,0.12)',
                color: activeTab === 'submitted' ? '#fff' : '#64748b',
                fontWeight: 800
              }}>
                {submittedTrips.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drafts')}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13.5, transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: activeTab === 'drafts' ? '#0f172a' : 'transparent',
                color: activeTab === 'drafts' ? '#ffffff' : '#64748b',
                boxShadow: activeTab === 'drafts' ? '0 4px 12px rgba(15,23,42,0.15)' : 'none'
              }}
            >
              <FileText size={15} />
              <span>Drafts &amp; In Progress</span>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: activeTab === 'drafts' ? 'rgba(255,255,255,0.2)' : 'rgba(100,116,139,0.12)',
                color: activeTab === 'drafts' ? '#fff' : '#64748b',
                fontWeight: 800
              }}>
                {draftTrips.length}
              </span>
            </button>
          </div>
        </div>

        {/* CONTENT LOADING & EMPTY STATES */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(128,0,32,0.15)', borderTop: '3px solid #800020', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !isAuthenticated && activeList.length === 0 ? (
          /* GUEST MODE UNAUTHENTICATED EMPTY STATE CARD */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', 
              borderRadius: 28, padding: '56px 36px', textAlign: 'center', 
              border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 50px rgba(0,0,0,0.06)' 
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(128,0,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={30} style={{ color: '#800020' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Lock in your travel plans!
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.5 }}>
              Sign in to view your saved itineraries, active drafts, and submitted inquiries.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 100,
                background: '#800020', color: '#fff', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(128,0,32,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={18} />
              Log In / Sign Up
            </button>
          </motion.div>
        ) : activeList.length === 0 ? (
          /* AUTHENTICATED EMPTY STATE FOR CURRENT TAB */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', 
              borderRadius: 28, padding: '56px 36px', textAlign: 'center', 
              border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 16px 40px rgba(0,0,0,0.05)' 
            }}
          >
            <Plane size={44} style={{ color: 'rgba(128,0,32,0.25)', transform: 'rotate(-45deg)', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              {activeTab === 'submitted' ? 'No submitted inquiries yet' : 'No saved drafts yet'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem', fontStyle: 'italic', maxWidth: 400, margin: '0 auto 24px' }}>
              {activeTab === 'submitted' 
                ? 'Craft an itinerary in the planner and send an inquiry to review it here.' 
                : 'Start designing your next getaway in our interactive travel planner!'}
            </p>
            <Link 
              to="/planner"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 26px', borderRadius: 100,
                background: '#0f172a', color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: 14
              }}
            >
              <Sparkles size={16} />
              Start Planning Now
            </Link>
          </motion.div>
        ) : (
          /* LIST OF TRIP CARDS */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeList.map((trip, idx) => {
              const isGuest = !isAuthenticated || trip.isGuestMode;
              const badge = getStatusBadgeConfig(trip.status, isGuest);
              const StatusIcon = badge.icon;
              const title = getTripTitle(trip);
              const travelers = getTravelersCount(trip);
              const vibe = trip.vibe || trip.itinerarySnapshot?.vibe || null;
              const days = trip.days || trip.daysCount || trip.itinerarySnapshot?.days || 3;
              const destImg = trip.coverImage || trip.image_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format`;
              const formattedDate = trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently Saved';

              return (
                <motion.div
                  key={trip.id || trip._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  style={{
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)', borderRadius: 24,
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                  }}
                  whileHover={{ y: -3, boxShadow: '0 14px 36px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Top Content Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px' }}>
                      <img
                        src={destImg}
                        alt={title}
                        style={{ width: 80, height: 80, borderRadius: 18, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }}
                        onError={e => { e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format`; }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Dynamic Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 100,
                            background: badge.bg, color: badge.color, border: `1px solid ${badge.borderColor}`,
                            fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase'
                          }}>
                            <StatusIcon size={12} /> {badge.label}
                          </span>

                          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                            {formattedDate}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {title}
                        </h3>

                        {/* Meta Tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: '#64748b' }}>
                          {travelers > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <Users size={13} style={{ color: '#800020' }} /> {travelers} Traveler{travelers !== 1 ? 's' : ''}
                            </span>
                          )}
                          {vibe && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <MapPin size={13} style={{ color: '#800020' }} /> {vibe} Vibe
                            </span>
                          )}
                          {days > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              <Calendar size={13} style={{ color: '#800020' }} /> {days} Days
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estimated Budget (Desktop) */}
                      {trip.totalBudget > 0 && (
                        <div className="hidden sm:block" style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Est. Budget</p>
                          <p style={{ fontSize: 22, fontWeight: 800, color: '#800020', margin: 0 }}>
                            ₹{Number(trip.totalBudget).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Banner Subtext for Submitted Cards */}
                    {activeTab === 'submitted' && (
                      <div style={{
                        padding: '8px 28px', background: 'rgba(248, 250, 252, 0.9)',
                        borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
                        fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6
                      }}>
                        <Clock size={13} style={{ color: '#800020' }} />
                        <span>
                          {trip.status?.toLowerCase().includes('confirm')
                            ? `Confirmed on ${formattedDate} • Your booking is locked!`
                            : `Submitted on ${formattedDate} • Admin review in progress.`}
                        </span>
                      </div>
                    )}

                    {/* Bottom Action Footer Row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 28px', background: 'rgba(248, 250, 252, 0.6)'
                    }}>
                      {/* Budget Mobile */}
                      {trip.totalBudget > 0 ? (
                        <p className="sm:hidden" style={{ fontSize: 16, fontWeight: 800, color: '#800020', margin: 0 }}>
                          ₹{Number(trip.totalBudget).toLocaleString()}
                        </p>
                      ) : <div />}

                      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                        {activeTab === 'submitted' ? (
                          <>
                            <button 
                              onClick={() => generatePDF(trip)}
                              style={{ padding: '8px 14px', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}
                              title="Download Itinerary PDF"
                            >
                              <Download size={14} /> PDF
                            </button>

                            <button 
                              onClick={() => navigate(`/journey/${trip.id || trip._id}`)}
                              style={{
                                padding: '9px 18px', borderRadius: 10, background: '#800020',
                                color: '#fff', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                                boxShadow: '0 2px 8px rgba(128,0,32,0.2)'
                              }}
                            >
                              View Inquiry Details <ChevronRight size={15} />
                            </button>
                          </>
                        ) : (
                          /* DRAFTS ACTION BUTTON */
                          <button 
                            onClick={() => handleEditDraft(trip)}
                            style={{
                              padding: '9px 20px', borderRadius: 10, background: '#0f172a',
                              color: '#fff', border: 'none', cursor: 'pointer',
                              fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                              boxShadow: '0 2px 8px rgba(15,23,42,0.2)'
                            }}
                          >
                            <Edit3 size={14} /> Edit &amp; Complete
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <div className="mt-auto w-full">
        <LuggageFooter onLuggageClick={() => setIsChecklistOpen(true)} isPaused={isChecklistOpen} />
      </div>

      {/* Packing Checklist Modal */}
      <PackingChecklist isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
    </div>
  );
}
