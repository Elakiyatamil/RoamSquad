import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('roam_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    const removeItem = (id) => {
        const updated = wishlist.filter(item => item.id !== id);
        setWishlist(updated);
        localStorage.setItem('roam_wishlist', JSON.stringify(updated));
    };

    return (
        <div className="container mx-auto px-6 py-20 min-h-[70vh]">
            <header className="mb-16">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">Your Wishlist</h1>
                <p className="text-forest/50 text-xl font-display">Experiences you've fallen in love with.</p>
            </header>

            {wishlist.length === 0 ? (
                <div className="text-center py-32 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                    <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-8 text-forest/20">
                        <Heart size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-forest mb-4">Your heart is empty</h2>
                    <p className="text-forest/40 mb-10 max-w-sm mx-auto">Explore our curated destinations and save your favorites here.</p>
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-cream rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Start Exploring <Compass size={20} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence>
                        {wishlist.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-forest/5 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img 
                                        src={item.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-cream hover:bg-red hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gold uppercase tracking-widest mb-2">
                                        {item.type}
                                    </div>
                                    <h3 className="text-2xl font-bold text-forest mb-2">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-forest/40 text-sm mb-8">
                                        <MapPin size={14} /> {item.location}
                                    </div>
                                    
                                    <Link 
                                        to={item.path}
                                        className="flex items-center justify-between py-4 border-t border-forest/5 text-forest font-bold group-hover:text-gold transition-colors"
                                    >
                                        View Details <ArrowRight size={20} />
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
