import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Calendar, MapPin, ChevronRight, AlertCircle, Heart, Plus, Copy, CheckCircle2, Clock, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { generatePDF } from '../../utils/pdfExport';

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

    const handleReuse = (trip) => {
        navigate('/planner');
    };

    const getStatusConfig = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('approve') || s.includes('confirm')) return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Approved' };
        if (s.includes('reject')) return { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: AlertCircle, label: 'Rejected' };
        return { color: 'text-[#E8A838] bg-[#E8A838]/10 border-[#E8A838]/20', icon: Clock, label: 'Pending Inquiry' };
    };

    return (
        <div className="w-full min-h-screen bg-[#FDFCF0] font-sans pb-32">
            
            {/* ── CINEMATIC HERO HEADER ── */}
            <header className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=2560&q=100&auto=format" 
                    alt="Journeys Background"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    style={{ animation: "pan-slow 25s ease-in-out infinite alternate" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A6B]/80 via-[#1B3A6B]/40 to-[#FDFCF0] mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF0] via-transparent to-transparent opacity-100" />

                <style>{`
                    @keyframes pan-slow {
                        0% { transform: scale(1.05) translate(0, 0); }
                        100% { transform: scale(1.1) translate(-2%, 2%); }
                    }
                `}</style>

                <div className="relative z-10 text-center px-6 mt-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-6xl md:text-8xl font-display font-bold text-[#1B3A6B] mb-4 tracking-tight drop-shadow-xl"
                    >
                        Your Journeys.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl font-serif italic text-[#1B3A6B]/80 max-w-2xl mx-auto"
                    >
                        Review your inquiries, manage your itineraries, and prepare for your next grand adventure.
                    </motion.p>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="container mx-auto px-6 max-w-6xl relative z-20 -mt-10">
                <div className="flex justify-end mb-12">
                    <Link 
                        to="/planner" 
                        className="group relative px-8 py-4 bg-gradient-to-r from-[#E8A838] to-[#C4724A] text-white rounded-full font-semibold text-lg overflow-hidden transition-transform hover:scale-105 shadow-xl shadow-[#E8A838]/20 flex items-center gap-2"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>Craft New Itinerary</span>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-[#1B3A6B]/40">
                        <div className="w-10 h-10 border-4 border-[#1B3A6B]/20 border-t-[#1B3A6B] rounded-full animate-spin"></div>
                    </div>
                ) : trips.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-16 text-center border border-[#1B3A6B]/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B3A6B] to-[#E8A838]" />
                        <div className="w-24 h-24 bg-[#1B3A6B]/5 rounded-full flex items-center justify-center mx-auto mb-8 text-[#1B3A6B]/30">
                            <Plane size={48} className="transform -rotate-45 ml-2" />
                        </div>
                        <h2 className="text-4xl font-display font-bold text-[#1B3A6B] mb-4">No journeys planned yet</h2>
                        <p className="text-[#7A7068] text-xl font-serif italic mb-10 max-w-md mx-auto">
                            The world is waiting. Build your first handcrafted itinerary and submit an inquiry to see it here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {Array.isArray(trips) && trips.map((trip, idx) => {
                            const statusConfig = getStatusConfig(trip.status);
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                            <motion.div
                                key={trip.id ?? idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-white p-8 rounded-[2rem] border border-[#1B3A6B]/10 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group"
                            >
                                {/* Decorative line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1B3A6B]/10 to-transparent group-hover:from-[#E8A838] transition-colors duration-500" />

                                <div className="flex items-start gap-6 cursor-pointer flex-1 pl-4" onClick={() => { if (trip?.id != null) navigate(`/journey/${trip.id}`); }}>
                                    <div className="w-16 h-16 bg-[#1B3A6B]/5 rounded-2xl flex items-center justify-center text-[#1B3A6B]/40 shrink-0 group-hover:bg-[#1B3A6B] group-hover:text-white transition-colors duration-300">
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5 border ${statusConfig.color}`}>
                                                <StatusIcon size={14} /> {statusConfig.label}
                                            </span>
                                            <span className="text-[#1B3A6B]/40 text-sm font-medium">
                                                {new Date(trip.date || trip.startDate || trip.tripDate || trip.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-display font-bold text-[#1B3A6B] mb-2 group-hover:text-[#C4724A] transition-colors">
                                            {trip.destinationName || trip.state ? `${trip.state}${trip.district ? ` · ${trip.district}` : ''}` : (trip.destination || 'Custom Trip')}
                                        </h3>
                                        <p className="text-[#7A7068] font-serif italic text-lg">
                                            {trip.people ?? trip.travelers ?? trip.itinerarySnapshot?.people ?? trip.itinerary?.people ?? 0} Travelers • {trip.vibe ?? trip.itinerarySnapshot?.vibe ?? 'Custom'} Vibe
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-[#1B3A6B]/10 pt-6 md:pt-0 md:pl-10">
                                    <div className="text-right hidden sm:block mr-4">
                                        <p className="text-[11px] font-bold text-[#1B3A6B]/40 uppercase tracking-widest mb-1">Est. Budget</p>
                                        <p className="text-3xl font-display font-bold text-[#E8A838]">₹{Number(trip.totalBudget || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => generatePDF(trip)}
                                            className="p-4 bg-[#F7F3EC] rounded-2xl text-[#1B3A6B]/60 hover:bg-[#1B3A6B] hover:text-white transition-all shadow-sm"
                                            title="Download Itinerary"
                                        >
                                            <Download size={22} />
                                        </button>
                                        <button 
                                            onClick={() => handleReuse(trip)}
                                            className="p-4 bg-[#F7F3EC] rounded-2xl text-[#1B3A6B]/60 hover:bg-[#1B3A6B] hover:text-white transition-all shadow-sm"
                                            title="Reuse Itinerary"
                                        >
                                            <Copy size={22} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/journey/${trip.id || trip._id}`)}
                                            className="px-6 py-4 bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-2xl text-[#1B3A6B] font-bold hover:bg-[#1B3A6B] hover:text-white transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            View <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )})}
                        
                        {!isAuthenticated && (
                        <div className="mt-12 p-8 bg-white rounded-[2rem] flex items-start gap-5 border border-[#1B3A6B]/10 shadow-lg">
                            <div className="w-12 h-12 bg-[#E8A838]/10 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle className="text-[#E8A838]" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-[#1B3A6B] text-lg mb-1">Looking for older trips?</p>
                                <p className="text-[#7A7068] font-serif italic text-lg">Log in to sync your full travel history across all devices securely.</p>
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
