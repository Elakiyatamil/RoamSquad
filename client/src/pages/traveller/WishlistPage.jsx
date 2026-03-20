import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, ArrowRight, Compass, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const API = 'http://localhost:5000/api';

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
                const res = await axios.get(`${API}/wishlist/leads/${user.email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("[WishlistPage] API Response:", res.data);
                setWishlist(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, [user?.email, isAuthenticated, token]);

    if (isLoading) return (
        <div className="flex items-center justify-center py-32 text-forest/40">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading your wishlist...
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-20 min-h-[70vh]">
            <header className="mb-16">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">Your Wishlist</h1>
                <p className="text-forest/50 text-xl font-display">Experiences you've fallen in love with.</p>
            </header>

            {!isAuthenticated ? (
                <div className="text-center py-32 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                    <h2 className="text-2xl font-display font-bold text-forest mb-4">Please log in to view your wishlist</h2>
                    <p className="text-forest/40 mb-10">Your saved itineraries are waiting for you.</p>
                </div>
            ) : wishlist.length === 0 ? (
                <div className="text-center py-32 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                    <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-8 text-forest/20">
                        <Heart size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-forest mb-4">Your heart is empty</h2>
                    <p className="text-forest/40 mb-10 max-w-sm mx-auto">Explore our curated destinations and save your favorites here.</p>
                    <Link 
                        to="/planner" 
                        className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-cream rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Start Planning <Compass size={20} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence>
                        {Array.isArray(wishlist) && wishlist.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-forest/5 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="relative h-64 overflow-hidden bg-forest/5 flex items-center justify-center">
                                    <MapPin size={48} className="text-forest/10" />
                                    {/* Since WishlistLead stores JSON itinerary, we don't have a direct image easily. 
                                        We'll use a placeholder or the first activity image if we had it. */}
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gold uppercase tracking-widest mb-2">
                                        Saved Trip
                                    </div>
                                    <h3 className="text-2xl font-bold text-forest mb-2">{item.destination}</h3>
                                    <div className="flex items-center gap-2 text-forest/40 text-sm mb-4">
                                        <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    
                                    <div className="space-y-2 mb-8">
                                        <p className="text-xs text-forest/60 font-medium">Budget: ₹{Number(item.totalBudget || 0).toLocaleString()}</p>
                                        <p className="text-xs text-forest/60 font-medium italic">
                                            {item.itinerary?.activities?.length || 0} activities saved
                                        </p>
                                    </div>

                                    <Link 
                                        to="/planner"
                                        className="flex items-center justify-between py-4 border-t border-forest/5 text-forest font-bold group-hover:text-gold transition-colors"
                                    >
                                        Resume Planning <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
