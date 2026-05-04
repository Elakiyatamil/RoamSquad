import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Users, Wallet, MapPin, Utensils, Home, Star, Menu, X } from 'lucide-react'
import axios from 'axios'
import useAuthStore from '../store/authStore'
import FloatingNav from '../components/FloatingNav/FloatingNav'
// ─── Smart data helpers ───────────────────────────────────────────────────────


// ─── Smart data helpers ───────────────────────────────────────────────────────
const getTitle = (inquiry) => {
  if (inquiry?.destinationName && inquiry.destinationName !== 'null') return inquiry.destinationName;
  if (inquiry?.district && inquiry?.state) return `${inquiry.district}, ${inquiry.state}`;
  if (inquiry?.state) return inquiry.state;
  if (inquiry?.destination && inquiry.destination !== 'null') return inquiry.destination;
  return 'My Adventure';
};

const getItineraryArray = (inquiry) => {
  // NEW format: { timeline: [...] }
  if (Array.isArray(inquiry?.itinerary?.timeline)) return inquiry.itinerary.timeline;
  if (Array.isArray(inquiry?.itinerarySnapshot?.timeline)) return inquiry.itinerarySnapshot.timeline;
  // Direct array
  if (Array.isArray(inquiry?.itinerary)) return inquiry.itinerary;
  if (Array.isArray(inquiry?.itinerarySnapshot)) return inquiry.itinerarySnapshot;
  // LEGACY format: { items: [...] } — wrap into a single Day 1
  const flatItems = inquiry?.itinerary?.items || inquiry?.itinerarySnapshot?.items;
  if (Array.isArray(flatItems) && flatItems.length > 0) {
    return [{ day: 1, destination: inquiry?.destinationName || '', activities: flatItems }];
  }
  return [];
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JourneyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const { data: inquiry, isLoading, error } = useQuery({
    queryKey: ['inquiry', id],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api/inquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || res.data;
    },
    enabled: Boolean(id && token),
  });

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderRadius: 32, padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Trip Summary</h1>
          <p style={{ color: '#888', marginBottom: 24 }}>Please log in to view your journey details.</p>
          <Link to="/planner" style={{ padding: '12px 28px', background: '#800020', color: '#fff', borderRadius: 100, textDecoration: 'none', fontWeight: 700 }}>Back to Planner</Link>
        </div>
      </div>
    );
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(128,0,32,0.15)', borderTop: '3px solid #800020', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !inquiry) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800020', fontWeight: 700 }}>
      {error ? 'Failed to load journey details.' : 'No journey found.'}
    </div>
  );

  const title = getTitle(inquiry);
  const timeline = getItineraryArray(inquiry);
  const heroImg = inquiry.coverImage || inquiry.image_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format`;
  const travelers = inquiry.people ?? inquiry.travelers ?? inquiry.itinerarySnapshot?.people;
  const vibe = inquiry.vibe ?? inquiry.itinerarySnapshot?.vibe ?? inquiry.travelType;
  // Duration: prefer DB value, fall back to timeline length
  const days = (inquiry.days && inquiry.days > 0) ? inquiry.days : (timeline.length > 0 ? timeline.length : null);
  // Budget: prefer DB value, fall back to sum of all activity prices across days
  const computedBudget = timeline.reduce((total, day) => {
    const actSum = (day.activities || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
    const stayPrice = day.accommodation ? (Number(day.accommodation.price) || 0) : 0;
    return total + actSum + stayPrice;
  }, 0);
  const budget = Number(inquiry.totalBudget || 0) || computedBudget;
  const tripDate = inquiry.tripDate || inquiry.startDate;
  const hotel = inquiry.hotelSnapshot?.name || inquiry.hotel;
  const food = inquiry.foodSnapshot?.name || inquiry.food;
  const hasItinerary = timeline.length > 0 && timeline.some(d => (d.activities || []).length > 0 || d.accommodation);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FAF8F4 0%, #F5F0E8 100%)', fontFamily: "'Inter', sans-serif" }}>
      <FloatingNav isAuthenticated={isAuthenticated} user={user} />

      {/* ── CINEMATIC HERO HEADER ── */}
      <header style={{ position: 'relative', width: '100%', height: '50vh', minHeight: 320, overflow: 'hidden' }}>
        <img src={heroImg} alt={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, #FAF8F4 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate('/my-trips')}
          style={{ position: 'absolute', top: 100, left: 40, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 100, padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Trip Title Overlay */}
        <div style={{ position: 'absolute', bottom: 60, left: 40, right: 40 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>
            Trip Summary
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            {title}
          </motion.h1>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 120px', position: 'relative', zIndex: 20 }}>

        {/* ── BENTO STATS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: Users, label: 'Travelers', value: travelers != null ? `${travelers} ${travelers === 1 ? 'Person' : 'People'}` : null },
            { icon: Calendar, label: 'Trip Date', value: tripDate ? new Date(tripDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null },
            { icon: MapPin, label: 'Duration', value: days != null && days > 0 ? `${days} Day${days > 1 ? 's' : ''}` : null },
            { icon: Wallet, label: 'Total Budget', value: budget > 0 ? `₹${budget.toLocaleString()}` : null },
            ...(vibe ? [{ icon: Star, label: 'Vibe', value: vibe }] : []),
          ].filter(item => item.value != null).map(({ icon: Icon, label, value }) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.6)', padding: '20px 20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}>
              <Icon size={18} style={{ color: '#800020', marginBottom: 10 }} />
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa', margin: '0 0 4px' }}>{label}</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── ITINERARY SECTION ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)', borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.6)', padding: '32px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 24,
          }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 28px' }}>
            {hasItinerary ? 'Your Curated Journey' : 'Itinerary'}
          </h2>
          {hasItinerary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {timeline.map((day, index) => {
                const activities = Array.isArray(day.activities) ? day.activities
                  : Array.isArray(day.items) ? day.items : [];
                return (
                  <div key={day.day || index} style={{ display: 'flex', gap: 20 }}>
                    {/* Day marker */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#800020', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                        {day.day || index + 1}
                      </div>
                      {index < timeline.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: 'rgba(128,0,32,0.15)', marginTop: 8 }} />
                      )}
                    </div>
                    {/* Day content */}
                    <div style={{ flex: 1, paddingBottom: 20 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#800020', textTransform: 'uppercase', letterSpacing: 1, margin: '6px 0 12px' }}>
                        Day {day.day || index + 1}{day.destination ? ` · ${day.destination}` : ''}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Accommodation per day */}
                        {day.accommodation && (
                          <div style={{
                            background: 'rgba(128,0,32,0.05)', borderRadius: 12, padding: '10px 16px',
                            display: 'flex', alignItems: 'center', gap: 12,
                            border: '1px solid rgba(128,0,32,0.1)',
                          }}>
                            {day.accommodation.imageUrl ? (
                              <img src={day.accommodation.imageUrl} alt={day.accommodation.name}
                                style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(128,0,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Home size={16} style={{ color: '#800020' }} />
                              </div>
                            )}
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{day.accommodation.name || day.accommodation.tier}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#800020', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stay</p>
                            </div>
                            {day.accommodation.price > 0 && (
                              <p style={{ margin: '0 0 0 auto', fontSize: 13, fontWeight: 700, color: '#800020' }}>₹{Number(day.accommodation.price).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                        {/* Activities */}
                        {activities.length > 0 ? activities.map((act, ai) => (
                          <div key={act.id || ai} style={{
                            background: 'rgba(0,0,0,0.025)', borderRadius: 12, padding: '10px 16px',
                            display: 'flex', alignItems: 'center', gap: 12,
                          }}>
                            {act.imageUrl || act.image_url ? (
                              <img src={act.imageUrl || act.image_url} alt={act.name}
                                style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(128,0,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {act.category === 'FOOD' ? <Utensils size={16} style={{ color: '#800020' }} /> : <MapPin size={16} style={{ color: '#800020' }} />}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.name || act.title}</p>
                              {act.destinationName && (
                                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{act.destinationName}</p>
                              )}
                            </div>
                            {act.price > 0 && (
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#800020', flexShrink: 0 }}>₹{Number(act.price).toLocaleString()}</p>
                            )}
                          </div>
                        )) : !day.accommodation && (
                          <p style={{ margin: 0, color: '#bbb', fontStyle: 'italic', fontSize: 13 }}>No activities logged for this day.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <MapPin size={32} style={{ color: 'rgba(128,0,32,0.2)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#aaa', fontStyle: 'italic', margin: 0 }}>No itinerary selections were saved with this inquiry.</p>
            </div>
          )}
        </motion.div>

        {/* ── ACCOMMODATION & FOOD (only if data exists) ── */}
        {(hotel || food) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {hotel && (
              <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.6)', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <Home size={18} style={{ color: '#800020', marginBottom: 10 }} />
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa', margin: '0 0 6px' }}>Accommodation</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{hotel}</p>
              </div>
            )}
            {food && (
              <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.6)', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <Utensils size={18} style={{ color: '#800020', marginBottom: 10 }} />
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#aaa', margin: '0 0 6px' }}>Food Plan</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{food}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── CTA ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/planner" style={{
            padding: '14px 32px', background: '#800020', color: '#fff',
            borderRadius: 100, textDecoration: 'none', fontWeight: 700, fontSize: 15,
            boxShadow: '0 8px 24px rgba(128,0,32,0.3)',
          }}>
            Craft New Itinerary
          </Link>
          <button onClick={() => navigate('/my-trips')} style={{
            padding: '14px 32px', background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100,
            color: '#1a1a1a', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>
            ← All Journeys
          </button>
        </div>
      </main>
    </div>
  );
}
