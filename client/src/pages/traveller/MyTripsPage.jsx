import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Calendar, MapPin, ChevronRight, AlertCircle, Heart, Plus, Copy, CheckCircle2, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axios from 'axios';

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [activeTab, setActiveTab] = useState('journeys'); // 'journeys' or 'wishlist'
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        const load = async () => {
            if (isAuthenticated && token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/inquiry/my', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTrips(res.data.data || []);
                } catch (err) {
                    console.error("[MyTripsPage] Fetch Error:", err);
                    // fall back
                }
            } else {
                const saved = localStorage.getItem('submitted_inquiries');
                if (saved) setTrips(JSON.parse(saved));
            }
            
            // Load Wishlist
            if (isAuthenticated && token && useAuthStore.getState().user?.email) {
                try {
                    const resW = await axios.get(`http://localhost:5000/api/wishlist?email=${useAuthStore.getState().user.email}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setWishlist(resW.data?.data || []);
                } catch (err) {
                    console.error("[MyTripsPage] Wishlist Fetch Error:", err);
                }
            } else {
                setWishlist([]); 
            }
        };
        load();
    }, [isAuthenticated, token]);

    const handleReuse = (trip) => {
        // Reuse logic: could save to another draft or just go to planner
        navigate('/planner');
    };

    const getStatusConfig = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('approve') || s.includes('confirm')) return { color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Approved' };
        if (s.includes('reject')) return { color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Rejected' };
        return { color: 'text-gold bg-gold/20', icon: Clock, label: 'Pending Inquiry' };
    };

    return (
        <div className="container mx-auto px-6 py-20 min-h-[70vh]">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">Dashboard</h1>
                        <p className="text-forest/50 text-xl font-display">Manage your inquiries, past trips, and wishlist.</p>
                    </div>
                    <Link 
                        to="/planner" 
                        className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-cream rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        <Plus size={20} /> New Itinerary
                    </Link>
                </div>
            </header>

            <div className="flex items-center gap-4 mb-10 border-b border-forest/10 pb-4">
                <button 
                    onClick={() => setActiveTab('journeys')}
                    className={`text-xl font-display font-bold transition-colors ${activeTab === 'journeys' ? 'text-forest' : 'text-forest/30 hover:text-forest/60'}`}
                >
                    Journeys & Inquiries
                </button>
                <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={`text-xl font-display font-bold transition-colors ${activeTab === 'wishlist' ? 'text-forest' : 'text-forest/30 hover:text-forest/60'}`}
                >
                    Wishlist ({wishlist.length})
                </button>
            </div>

            {activeTab === 'journeys' && (
                trips.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border border-forest/5 shadow-xl">
                        <div className="w-20 h-20 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-8 text-forest/20">
                            <Plane size={40} />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-forest mb-4">No trips planned yet</h2>
                        <p className="text-forest/40 mb-10 max-w-sm mx-auto">Build your first handcrafted itinerary and submit an inquiry to see it here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Array.isArray(trips) && trips.map((trip, idx) => {
                            const statusConfig = getStatusConfig(trip.status);
                            const StatusIcon = statusConfig.icon;
                            
                            return (
                            <motion.div
                                key={trip.id ?? idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-forest/5 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
                            >
                                <div className="flex items-start gap-6 cursor-pointer flex-1" onClick={() => { if (trip?.id != null) navigate(`/journey/${trip.id}`); }}>
                                    <div className="w-16 h-16 bg-forest/5 rounded-2xl flex items-center justify-center text-forest/30 shrink-0">
                                        <Calendar size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest flex items-center gap-1 ${statusConfig.color}`}>
                                                <StatusIcon size={12} /> {statusConfig.label}
                                            </span>
                                            <span className="text-forest/30 text-xs">{new Date(trip.date || trip.startDate || trip.tripDate || trip.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-forest">{trip.destinationName || trip.state ? `${trip.state}${trip.district ? ` · ${trip.district}` : ''}` : (trip.destination || 'Custom Trip')}</h3>
                                        <p className="text-forest/50 text-sm">{trip.people ?? trip.travelers ?? trip.itinerarySnapshot?.people ?? trip.itinerary?.people ?? 0} Pax • {trip.vibe ?? trip.itinerarySnapshot?.vibe ?? 'Custom'} Vibe</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-forest/5 pt-4 md:pt-0 md:pl-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">Est. Budget</p>
                                        <p className="text-xl font-display font-bold text-forest">₹{Number(trip.totalBudget || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleReuse(trip)}
                                            className="p-4 bg-forest/5 rounded-2xl text-forest hover:bg-forest hover:text-cream transition-all group relative"
                                            title="Reuse Itinerary"
                                        >
                                            <Copy size={20} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/journey/${trip.id || trip._id}`)}
                                            className="p-4 bg-forest/5 rounded-2xl text-forest hover:bg-forest hover:text-cream transition-all"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )})}
                        
                        {!isAuthenticated && (
                        <div className="mt-12 p-8 bg-forest/5 rounded-[2.5rem] flex items-start gap-4 border-2 border-dashed border-forest/10">
                            <AlertCircle className="text-gold shrink-0 mt-1" size={20} />
                            <div>
                                <p className="font-bold text-forest mb-1">Looking for older trips?</p>
                                <p className="text-forest/50 text-sm">Log in to sync your full travel history across all devices.</p>
                            </div>
                        </div>
                        )}
                    </div>
                )
            )}

            {activeTab === 'wishlist' && (
                wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                        <Heart size={40} className="mx-auto text-forest/20 mb-4" />
                        <h2 className="text-3xl font-display font-bold text-forest mb-4">Your wishlist is empty</h2>
                        <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-cream rounded-full font-bold hover:scale-105 transition-transform mt-4">
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(wishlist?.length > 0 ? wishlist : []).map(item => (
                            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-forest/5 shadow-sm hover:shadow-xl transition-all block">
                                <div className="h-48 relative bg-forest/5 flex items-center justify-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.destinationName} className="w-full h-full object-cover" />
                                    ) : (
                                        <MapPin size={40} className="text-forest/20" />
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-forest mb-1">{item.destinationName || item.name}</h3>
                                    <p className="text-forest/40 text-[12px] font-bold uppercase tracking-widest mb-4">
                                        Budget: ₹{Number(item.budget || 0).toLocaleString()}
                                    </p>
                                    <Link to={`/journey/${item.id || item._id}`} className="text-gold font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        View Details <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default MyTripsPage;
