import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, ArrowRight, Compass, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isAuthenticated, token } = useAuthStore();

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!isAuthenticated || !user?.email) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API}/wishlist?email=${user.email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWishlist(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, [user?.email, isAuthenticated, token]);

    return (
        <div className="w-full min-h-screen bg-[#FDFCF0] font-sans pb-32">
            
            {/* ── CINEMATIC HERO HEADER ── */}
            <header className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2560&q=100&auto=format" 
                    alt="Wishlist Background"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    style={{ animation: "pan-slow 25s ease-in-out infinite alternate" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A6B]/80 via-[#2A5298]/40 to-[#FDFCF0] mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF0] via-transparent to-transparent opacity-100" />

                <div className="relative z-10 text-center px-6 mt-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-6xl md:text-8xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-2xl"
                    >
                        Your Wishlist.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl font-serif italic text-white/90 max-w-2xl mx-auto drop-shadow-md"
                    >
                        Experiences you've fallen in love with, waiting to become reality.
                    </motion.p>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="container mx-auto px-6 max-w-7xl relative z-20 -mt-10">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-[#1B3A6B]/40">
                        <div className="w-10 h-10 border-4 border-[#1B3A6B]/20 border-t-[#1B3A6B] rounded-full animate-spin"></div>
                    </div>
                ) : !isAuthenticated ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-16 text-center border border-[#1B3A6B]/5 shadow-2xl relative overflow-hidden max-w-4xl mx-auto"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B3A6B] to-[#C4724A]" />
                        <h2 className="text-4xl font-display font-bold text-[#1B3A6B] mb-4">Unlock Your Wishlist</h2>
                        <p className="text-[#7A7068] text-xl font-serif italic mb-10 max-w-md mx-auto">
                            Please log in to view and manage your saved destinations and handcrafted itineraries.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {Array.isArray(wishlist) && wishlist.length > 0 ? wishlist.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="group bg-white rounded-[2rem] overflow-hidden border border-[#1B3A6B]/10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative h-64 overflow-hidden bg-[#1B3A6B]/5 flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.destinationName} />
                                        ) : (
                                            <MapPin size={48} className="text-[#1B3A6B]/20" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A6B]/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                                        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/30">
                                                {item.isLead ? 'Planned Trip' : 'Saved Destination'}
                                            </span>
                                            <Heart size={20} className="text-white fill-white/50" />
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-3xl font-display font-bold text-[#1B3A6B] mb-3 group-hover:text-[#C4724A] transition-colors line-clamp-1">
                                            {item.destinationName || item.destination || 'Untitled Journey'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[#7A7068] font-serif italic mb-6">
                                            <Calendar size={16} /> {new Date(item.date || item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        
                                        <div className="space-y-1 mb-8 flex-1">
                                            <p className="text-sm text-[#1B3A6B]/60 font-semibold uppercase tracking-widest">
                                                Budget: <span className="text-[#E8A838] font-bold text-lg">₹{Number(item.budget || item.totalBudget || 0).toLocaleString()}</span>
                                            </p>
                                            <p className="text-sm text-[#7A7068] italic">
                                                {item.activities?.length || 0} premium experiences saved
                                            </p>
                                        </div>

                                        <Link 
                                            to={`/journey/${item.id}`}
                                            className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-xl text-[#1B3A6B] font-bold group-hover:bg-[#1B3A6B] group-hover:text-white transition-colors duration-300"
                                        >
                                            View Details <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-[#1B3A6B]/5 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B3A6B] to-[#E8A838]" />
                                    <div className="w-24 h-24 bg-[#E8A838]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[#E8A838]">
                                        <Heart size={40} className="fill-[#E8A838]/20" />
                                    </div>
                                    <h2 className="text-4xl font-display font-bold text-[#1B3A6B] mb-4">Your heart is empty</h2>
                                    <p className="text-[#7A7068] text-xl font-serif italic mb-10 max-w-md mx-auto">
                                        Explore our curated destinations and save your most beloved experiences here.
                                    </p>
                                    <Link 
                                        to="/planner" 
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#E8A838] to-[#C4724A] text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-xl shadow-[#E8A838]/20"
                                    >
                                        <span>Start Discovering</span> <Compass size={22} />
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WishlistPage;
