import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Calendar, MapPin, ChevronRight, AlertCircle, Plus, Copy, CheckCircle2, Clock, Download, Menu, X, Users, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { generatePDF } from '../../utils/pdfExport';
import FloatingNav from '../../components/FloatingNav/FloatingNav';

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const load = async () => {
      if (isAuthenticated && token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api/inquiry/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTrips(res.data.data || []);
        } catch (err) {
          console.error("[MyTripsPage] Fetch Error:", err);
        }
      } else {
        const saved = localStorage.getItem('submitted_inquiries');
        if (saved) setTrips(JSON.parse(saved));
      }
      setIsLoading(false);
    };
    load();
  }, [isAuthenticated, token]);

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approve') || s.includes('confirm')) return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2, label: 'Approved' };
    if (s.includes('reject')) return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertCircle, label: 'Rejected' };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock, label: 'Pending' };
  };

  // Smart title from data
  const getTripTitle = (trip) => {
    if (trip.destinationName && trip.destinationName !== 'null') return trip.destinationName;
    if (trip.district && trip.state) return `${trip.district}, ${trip.state}`;
    if (trip.state) return trip.state;
    if (trip.destination && trip.destination !== 'null') return trip.destination;
    return 'My Adventure';
  };

  const getTravelers = (trip) =>
    trip.people ?? trip.travelers ?? trip.itinerarySnapshot?.people ?? trip.itinerary?.people ?? null;

  const getVibe = (trip) =>
    trip.vibe ?? trip.itinerarySnapshot?.vibe ?? trip.travelType ?? null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FAF8F4 0%, #F5F0E8 100%)', fontFamily: "'Inter', sans-serif" }}>
      <FloatingNav isAuthenticated={isAuthenticated} user={user} />

      {/* ── HERO ── */}
      <header style={{ position: 'relative', width: '100%', height: '45vh', minHeight: 320, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=2000&q=90&auto=format"
          alt="Your Journeys"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, #FAF8F4 100%)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', marginTop: 60 }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            Your Journeys.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.8)', marginTop: 12, fontStyle: 'italic' }}>
            Your inquiries, itineraries &amp; next grand escape.
          </motion.p>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 120px', position: 'relative', zIndex: 20, marginTop: -20 }}>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32, paddingTop: 8 }}>
          <Link to="/planner" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 100,
            background: '#800020', color: '#fff', textDecoration: 'none',
            fontWeight: 700, fontSize: 14, letterSpacing: 0.5,
            boxShadow: '0 8px 24px rgba(128,0,32,0.3)', transition: 'all 0.3s ease',
          }}>
            <Plus size={18} />
            Craft New Itinerary
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(128,0,32,0.15)', borderTop: '3px solid #800020', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : trips.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 32, padding: '64px 48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
            <Plane size={48} style={{ color: 'rgba(128,0,32,0.2)', transform: 'rotate(-45deg)', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>No journeys yet</h2>
            <p style={{ color: '#888', fontSize: '1.1rem', fontStyle: 'italic', maxWidth: 400, margin: '0 auto' }}>
              The world is waiting. Build your first itinerary and submit an inquiry to see it here.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {trips.map((trip, idx) => {
              const statusConfig = getStatusConfig(trip.status);
              const StatusIcon = statusConfig.icon;
              const title = getTripTitle(trip);
              const travelers = getTravelers(trip);
              const vibe = getVibe(trip);
              const destImg = trip.coverImage || trip.image_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70&auto=format`;

              return (
                <motion.div
                  key={trip.id ?? idx}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  style={{
                    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)', borderRadius: 28,
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
                    transition: 'box-shadow 0.3s, transform 0.3s',
                  }}
                  whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Top section */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', cursor: 'pointer' }}
                      onClick={() => trip?.id != null && navigate(`/journey/${trip.id}`)}
                    >
                      {/* Destination thumbnail */}
                      <img
                        src={destImg}
                        alt={title}
                        style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover', flexShrink: 0 }}
                        onError={e => { e.target.src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70&auto=format`; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Status badge + date row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 12px', borderRadius: 100,
                            background: statusConfig.bg, color: statusConfig.color,
                            fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                          }}>
                            <StatusIcon size={12} /> {statusConfig.label}
                          </span>
                          <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
                            {new Date(trip.createdAt || trip.tripDate || trip.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {/* Title */}
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {title}
                        </h3>
                        {/* Meta */}
                        <p style={{ margin: 0, fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          {travelers != null && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} />{travelers} Traveler{travelers !== 1 ? 's' : ''}</span>}
                          {vibe && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{vibe} Vibe</span>}
                          {(trip.days || trip.itinerarySnapshot?.days) && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} />{trip.days || trip.itinerarySnapshot?.days} Days</span>}
                        </p>
                      </div>
                      {/* Budget (desktop only) */}
                      <div className="hidden sm:block" style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Est. Budget</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: '#800020', margin: 0 }}>
                          ₹{Number(trip.totalBudget || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Bottom action row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 28px', borderTop: '1px solid rgba(0,0,0,0.05)',
                      background: 'rgba(0,0,0,0.02)',
                    }}>
                      {/* Budget mobile */}
                      <p className="sm:hidden" style={{ fontSize: 16, fontWeight: 800, color: '#800020', margin: 0 }}>
                        ₹{Number(trip.totalBudget || 0).toLocaleString()}
                      </p>
                      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                        <button onClick={() => generatePDF(trip)}
                          style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}
                          title="Download">
                          <Download size={16} />
                        </button>
                        <button onClick={() => navigate('/planner')}
                          style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}
                          title="Reuse">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => navigate(`/journey/${trip.id || trip._id}`)}
                          style={{
                            padding: '10px 20px', borderRadius: 14, background: '#800020',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                          View <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {!isAuthenticated && (
              <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <AlertCircle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>Looking for older trips?</p>
                  <p style={{ color: '#888', margin: 0, fontStyle: 'italic' }}>Log in to sync your full travel history.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTripsPage;
