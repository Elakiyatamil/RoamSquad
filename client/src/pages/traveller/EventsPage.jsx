import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarDays, MapPin, Phone, Loader2, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';
import './EventsPage.css';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

export default function EventsPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [pendingEvent, setPendingEvent] = useState(null);
    const { isAuthenticated, user } = useAuthStore();
    const token = useAuthStore(s => s.token);

    const { data: events = [], isLoading, error } = useQuery({
        queryKey: ['publicEvents'],
        queryFn: async () => {
            const res = await axios.get(`${API}/events/public`);
            return res.data.data || [];
        }
    });

    const joinMutation = useMutation({
        mutationFn: async ({ eventId, eventTitle, contactNumber, customPhone }) => {
            const payload = {
                email: user?.email,
                name: user?.name || 'Interested User',
                phone: customPhone,
                eventId,
                eventTitle,
                contactNumber,
                createdAt: new Date()
            };
            return axios.post(`${API}/events/${eventId}/join`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Registration sent! 🎉");
        },
        onError: (err) => {
            if (err.response?.status === 401) {
                toast.error("Please log in to join events.");
            } else {
                toast.error("Failed to join. Try again.");
            }
        }
    });

    const handleJoin = (evt) => {
        if (!isAuthenticated) {
            toast.error("Please login first");
            setPendingId(evt.id);
            setShowAuth(true);
            return;
        }
        setPhoneInput(user?.phone || '');
        setPendingEvent(evt);
        setShowPhoneModal(true);
    };

    const formatDate = (dt) => {
        if (!dt) return null;
        try {
            return new Date(dt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return dt; }
    };

    const getImgUrl = (url) => {
        const PLACEHOLDER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
        if (!url || url === 'null' || url === 'undefined') return PLACEHOLDER;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${base}${path}`;
    };

    return (
        <div className="events-page">
            <header>
                <h1 className="events-heading">Upcoming Events</h1>
                <p className="events-sub">Join our community events, meetups, and exclusive experiences.</p>
            </header>

            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0', color: '#9CA3AF' }}>
                    <Loader2 size={32} className="animate-spin" style={{ marginRight: '12px' }} /> 
                    <span>Loading events...</span>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ color: '#EF4444', fontWeight: 700 }}>Failed to load events. Please try again.</p>
                </div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
                    <CalendarDays size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>No upcoming events yet.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map((evt) => (
                        <div key={evt.id} className="event-card" onClick={() => handleJoin(evt)}>
                            <div className="event-image-container">
                                <img src={getImgUrl(evt.image || evt.imageUrl || evt.photo || evt.bannerImage || evt.image_url)} alt={evt.title} />
                                <div className="event-date-badge">{formatDate(evt.dateTime)}</div>
                            </div>
                            <div className="event-card-body">
                                <h3 className="event-name">{evt.title}</h3>
                                {evt.location && (
                                    <div className="event-location">
                                        <MapPin size={12} /> {evt.location}
                                    </div>
                                )}
                                
                                <ul className="event-details">
                                    {evt.description && (
                                        <li style={{ marginBottom: '8px', fontStyle: 'italic', color: '#6B7280' }}>
                                            {evt.description.length > 80 ? `${evt.description.substring(0, 80)}...` : evt.description}
                                        </li>
                                    )}
                                    {evt.contactNumber && (
                                        <li><Phone size={14} /> {evt.contactNumber}</li>
                                    )}
                                    <li style={{ color: '#10B981', fontWeight: 600 }}>
                                        <CheckCircle2 size={14} /> Spots available
                                    </li>
                                </ul>
                                
                                <button className="event-btn">
                                    Join Event
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => {
                setShowAuth(false);
                if (pendingId) {
                    const evt = events.find(e => e.id === pendingId);
                    if (evt) {
                        setPhoneInput(user?.phone || '');
                        setPendingEvent(evt);
                        setShowPhoneModal(true);
                    }
                }
            }} />

            {/* Phone Modal */}
            {showPhoneModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '20px', boxSizing: 'border-box' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', boxSizing: 'border-box' }}>
                        {isSuccess ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <CalendarDays size={30} color="#10B981" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Registration Sent!</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>Thank you! Our team will reach out to you shortly to confirm your spot in this event.</p>
                                <button 
                                    onClick={() => {
                                        setShowPhoneModal(false);
                                        setTimeout(() => setIsSuccess(false), 300);
                                    }} 
                                    className="event-btn"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Your Contact</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '24px' }}>Please provide your phone number so our team can seamlessly connect with you.</p>
                                
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    style={{ width: '100%', padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', outline: 'none', marginBottom: '24px', fontSize: '1rem' }}
                                    autoFocus
                                />
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowPhoneModal(false)}
                                        style={{ flex: 1, padding: '12px', border: 'none', background: 'none', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!phoneInput.trim()) return toast.error("Phone number is required!");
                                            joinMutation.mutate({ 
                                                eventId: pendingEvent.id, 
                                                eventTitle: pendingEvent.title, 
                                                contactNumber: pendingEvent.contactNumber || '',
                                                customPhone: phoneInput
                                            });
                                        }}
                                        disabled={joinMutation.isPending}
                                        className="event-btn"
                                        style={{ flex: 2, marginTop: 0 }}
                                    >
                                        {joinMutation.isPending ? 'Sending...' : 'Confirm'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
