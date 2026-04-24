import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarDays, MapPin, Phone, Loader2, ArrowRight, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

const SnowEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 150 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.3,
      sy: [0.4, 0.8, 1.2][i % 3], 
      sx: (0.1 + Math.random() * 0.2), 
      opacity: [0.2, 0.4, 0.6][i % 3],
      blur: [2, 0.5, 0][i % 3],
      depth: (i % 3)
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.shadowBlur = p.blur;
        ctx.shadowColor = "white";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.sy;
        p.x += p.sx;

        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
        if (p.x > W + 10) { p.x = -10; }
      });
      requestAnimationFrame(draw);
    };

    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);
    const animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
};

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
            return new Date(dt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
        } catch { return dt; }
    };

    const isUpcoming = (dt) => dt ? new Date(dt) > new Date() : true;

    return (
        <div className="relative w-full min-h-screen bg-black overflow-hidden font-sans pb-32">
            
            {/* ── CINEMATIC BACKGROUND ── */}
            <div 
                className="fixed inset-0 z-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=100')`,
                }}
            />

            {/* ── HUGE BACKGROUND WORD ── */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden mix-blend-overlay">
                <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 2 }}
                    className="text-white font-bold leading-none text-[25vw] tracking-tighter whitespace-nowrap"
                    style={{ fontFamily: "'Cormorant Garamond', serif", filter: 'blur(2px)' }}
                >
                    ROAMSQUAD
                </motion.h1>
            </div>

            {/* Nav Bar Protection Gradient - Soft Blend */}
            <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FDFCF0]/90 via-[#FDFCF0]/50 to-transparent z-[5] pointer-events-none" />

            {/* ── FESTIVE ANIMATIONS ── */}
            <SnowEngine />
            
            {/* Gradient Overlay for Readability (Dark at bottom) */}
            <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none mix-blend-multiply" />

            {/* ── MAIN CONTENT ── */}
            <main className="relative z-10 container mx-auto px-6 py-24 max-w-5xl">
                <header className="mb-20 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        Upcoming Events
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-white/90 text-2xl md:text-4xl font-serif italic max-w-4xl mx-auto leading-relaxed drop-shadow-lg"
                    >
                        "Join our community events, meetups, and exclusive experiences."
                    </motion.p>
                </header>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32 text-white/40">
                        <Loader2 size={40} className="animate-spin mr-4" /> 
                        <span className="text-xl font-serif italic">Loading events...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 font-bold text-xl">Failed to load events. Please try again.</p>
                    </div>
                ) : events.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 shadow-2xl max-w-4xl mx-auto relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E8A838] to-transparent" />
                        <CalendarDays size={56} className="mx-auto text-white/30 mb-6" />
                        <h2 className="text-3xl font-display font-bold text-white mb-2">No upcoming events yet.</h2>
                        <p className="text-white/50 font-serif italic text-lg">Stay tuned for exciting new experiences!</p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {(Array.isArray(events) ? events : []).map((evt, idx) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="group bg-black/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:border-white/30 transition-all flex flex-col md:flex-row"
                            >
                                {evt.image ? (
                                    <div className="md:w-[350px] h-64 md:h-auto overflow-hidden shrink-0 relative">
                                        <img
                                            src={evt.image}
                                            alt={evt.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black/80 to-transparent" />
                                    </div>
                                ) : (
                                    <div className="md:w-[350px] h-64 md:h-auto bg-white/5 flex items-center justify-center shrink-0 relative overflow-hidden">
                                        <CalendarDays size={64} className="text-white/10" />
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black/80 to-transparent" />
                                    </div>
                                )}
                                <div className="flex-1 p-8 md:p-10 flex flex-col relative z-10">
                                    <div className="mb-4">
                                        {isUpcoming(evt.dateTime) && (
                                            <span className="inline-block text-[10px] font-bold bg-[#E8A838]/20 text-[#E8A838] border border-[#E8A838]/30 px-3 py-1 rounded-full uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(232,168,56,0.1)]">
                                                Upcoming
                                            </span>
                                        )}
                                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-[#E8A838] transition-colors">{evt.title}</h3>
                                    </div>

                                    {evt.description && (
                                        <p className="text-white/60 mb-6 text-base font-serif italic leading-relaxed">{evt.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/50 mb-8 border-t border-white/10 pt-6">
                                        {evt.location && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <MapPin size={16} className="text-[#E8A838] shrink-0" /> {evt.location}
                                            </span>
                                        )}
                                        {evt.dateTime && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <Clock size={16} className="text-[#E8A838] shrink-0" /> {formatDate(evt.dateTime)}
                                            </span>
                                        )}
                                        {evt.contactNumber && (
                                            <span className="flex items-center gap-2 font-medium">
                                                <Phone size={16} className="text-[#E8A838] shrink-0" /> {evt.contactNumber}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleJoin(evt)}
                                        disabled={joinMutation.isPending}
                                        className="mt-auto self-start px-10 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center gap-3 disabled:opacity-50 backdrop-blur-md shadow-lg"
                                    >
                                        {joinMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                        Join Event
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E8A838] to-transparent" />
                        
                        {isSuccess ? (
                            <div className="text-center py-6">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-[#E8A838]/20 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CalendarDays size={40} className="text-[#E8A838]" />
                                </motion.div>
                                <h3 className="text-3xl font-display font-bold text-white mb-3">Registration Sent!</h3>
                                <p className="text-white/60 mb-8 italic font-serif">Thank you for your interest. Our team will reach out to you shortly to confirm your spot in this event.</p>
                                <button 
                                    onClick={() => {
                                        setShowPhoneModal(false);
                                        setTimeout(() => setIsSuccess(false), 300);
                                    }} 
                                    className="w-full py-4 bg-[#E8A838] text-black rounded-full font-bold hover:bg-[#E8A838]/90 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-3xl font-display font-bold text-white mb-3">Your Contact</h3>
                                <p className="text-white/50 text-base mb-8 font-serif italic">Please provide your phone number so our team can seamlessly connect with you.</p>
                                
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full p-5 bg-black/50 text-white rounded-2xl border border-white/20 focus:border-[#E8A838] focus:ring-1 focus:ring-[#E8A838] outline-none mb-8 font-medium text-lg placeholder-white/20 transition-all"
                                    autoFocus
                                />
                                
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowPhoneModal(false)}
                                        className="flex-1 py-4 font-bold text-white/50 hover:bg-white/5 rounded-full transition-colors"
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
                                        className="flex-1 py-4 bg-[#E8A838] text-black rounded-full font-bold hover:bg-[#E8A838]/90 transition-colors shadow-[0_0_20px_rgba(232,168,56,0.3)] disabled:opacity-50"
                                    >
                                        {joinMutation.isPending ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Confirm"}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
