import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarDays, MapPin, Phone, Loader2, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';

const API = 'http://localhost:5000/api';

export default function EventsPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const { isAuthenticated, user } = useAuthStore();
    const token = useAuthStore(s => s.token);

    const { data: events = [], isLoading, error } = useQuery({
        queryKey: ['publicEvents'],
        queryFn: async () => {
            const res = await axios.get(`${API}/events/public`);
            console.log("[EventsPage] API Response:", res.data);
            return res.data.data || [];
        }
    });

    const joinMutation = useMutation({
        mutationFn: async ({ eventId, eventTitle, contactNumber }) => {
            const payload = {
                email: user?.email,
                name: user?.name,
                phone: user?.phone,
                eventId,
                eventTitle,
                contactNumber,
                createdAt: new Date()
            };
            console.log("Event interest sent", payload);
            return axios.post(`${API}/events/${eventId}/join`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            alert("Your interest has been sent to admin. They will contact you.");
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
            alert("Please login first");
            setPendingId(evt.id);
            setShowAuth(true);
            return;
        }
        joinMutation.mutate({ 
            eventId: evt.id, 
            eventTitle: evt.title, 
            contactNumber: evt.contactNumber || '' 
        });
    };

    const formatDate = (dt) => {
        if (!dt) return null;
        try {
            return new Date(dt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
        } catch { return dt; }
    };

    const isUpcoming = (dt) => dt ? new Date(dt) > new Date() : true;

    if (isLoading) return (
        <div className="flex items-center justify-center py-32 text-forest/40">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading events...
        </div>
    );

    if (error) return (
        <div className="text-center py-20">
            <p className="text-red-500 font-bold">Failed to load events. Please try again.</p>
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-20 min-h-screen">
            <header className="mb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">
                    Upcoming Events
                </h1>
                <p className="text-forest/50 text-xl max-w-2xl mx-auto">
                    Join our community events, travel meetups, and exclusive experiences.
                </p>
            </header>

            {events.length === 0 ? (
                <div className="text-center py-20 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                    <CalendarDays size={40} className="mx-auto text-forest/20 mb-4" />
                    <h2 className="text-2xl font-display font-bold text-forest/50">No upcoming events yet.</h2>
                    <p className="text-forest/30 mt-2">Stay tuned for exciting experiences!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {events.map((evt, idx) => (
                        <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="bg-white rounded-[2rem] overflow-hidden border border-forest/5 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex flex-col md:flex-row">
                                {evt.image ? (
                                    <div className="md:w-72 h-48 md:h-auto overflow-hidden shrink-0">
                                        <img
                                            src={evt.image}
                                            alt={evt.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div className="md:w-72 h-48 md:h-auto bg-gradient-to-br from-forest/10 to-gold/10 flex items-center justify-center shrink-0">
                                        <CalendarDays size={48} className="text-forest/20" />
                                    </div>
                                )}
                                <div className="flex-1 p-8 flex flex-col">
                                    <div className="mb-4">
                                        {isUpcoming(evt.dateTime) && (
                                            <span className="inline-block text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">
                                                Upcoming
                                            </span>
                                        )}
                                        <h3 className="text-2xl font-bold text-forest">{evt.title}</h3>
                                    </div>

                                    {evt.description && (
                                        <p className="text-forest/60 mb-4 text-sm leading-relaxed">{evt.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-forest/50 mb-6">
                                        {evt.location && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <MapPin size={16} className="text-gold shrink-0" /> {evt.location}
                                            </span>
                                        )}
                                        {evt.dateTime && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <Clock size={16} className="text-gold shrink-0" /> {formatDate(evt.dateTime)}
                                            </span>
                                        )}
                                        {evt.contactNumber && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <Phone size={16} className="text-gold shrink-0" /> {evt.contactNumber}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleJoin(evt)}
                                        disabled={joinMutation.isPending}
                                        className="mt-auto self-start px-8 py-4 bg-forest text-cream rounded-2xl font-bold hover:bg-forest/90 hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {joinMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                        Join Event
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => {
                setShowAuth(false);
                if (pendingId) {
                    const evt = events.find(e => e.id === pendingId);
                    if (evt) joinMutation.mutate({ 
                        eventId: evt.id, 
                        eventTitle: evt.title, 
                        contactNumber: evt.contactNumber || '' 
                    });
                }
            }} />
        </div>
    );
}
