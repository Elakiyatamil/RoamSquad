import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/public';

const DiscoveryPage = () => {
    const { data: destinations = [], isLoading } = useQuery({
        queryKey: ['public-destinations'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/destinations`);
            console.log("[DiscoveryPage] API Response:", res.data);
            return res.data.data || [];
        }
    });

    const [wishlist, setWishlist] = React.useState([]);

    React.useEffect(() => {
        const saved = localStorage.getItem('roam_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    const toggleWishlist = (e, dest) => {
        e.preventDefault();
        e.stopPropagation();
        let updated;
        if (wishlist.find(item => item.id === dest.id)) {
            updated = wishlist.filter(item => item.id !== dest.id);
        } else {
            updated = [...wishlist, { 
                id: dest.id, 
                name: dest.name, 
                location: dest.location, 
                image: dest.coverImage, 
                type: 'Destination',
                path: `/destinations/${dest.slug}`
            }];
        }
        setWishlist(updated);
        localStorage.setItem('roam_wishlist', JSON.stringify(updated));
    };

    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-forest">
                <div className="absolute inset-0 opacity-40">
                    <img 
                        src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2070" 
                        alt="Hero" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
                
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-8xl font-display font-bold text-cream mb-6 tracking-tight">
                            Design Your <span className="text-gold">Handcrafted</span> Journey
                        </h1>
                        <p className="text-xl md:text-2xl text-cream/80 mb-10 max-w-3xl mx-auto font-sans leading-relaxed">
                            Discover expert-curated experiences across India and beyond. 
                            Build itineraries that reflect your unique vibe.
                        </p>
                        <Link 
                            to="/planner" 
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gold text-ink rounded-full text-lg font-bold hover:bg-gold/90 transition-all hover:scale-105 shadow-xl shadow-gold/20"
                        >
                            Start Planning <ArrowRight size={24} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Destination Grid */}
            <section className="py-24 container mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-forest mb-4">
                            Discover Destinations
                        </h2>
                        <p className="text-forest/60 text-lg max-w-xl">
                            Curated spots from our expert travellers. Explore Dandeli's river rapids to Gokarna's serene beaches.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-forest/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {Array.isArray(destinations) && destinations.map((dest, idx) => (
                            <motion.div
                                key={dest.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative h-[480px] rounded-[2rem] overflow-hidden mb-6 shadow-2xl shadow-forest/10">
                                    <img 
                                        src={dest.coverImage || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'} 
                                        alt={dest.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent" />
                                    
                                    <button 
                                        onClick={(e) => toggleWishlist(e, dest)}
                                        className={`absolute top-8 left-8 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 ${
                                            wishlist.find(item => item.id === dest.id) 
                                            ? 'bg-red text-white' 
                                            : 'bg-white/20 text-cream hover:bg-white/40'
                                        }`}
                                    >
                                        <Heart size={20} fill={wishlist.find(item => item.id === dest.id) ? 'currentColor' : 'none'} />
                                    </button>
                                    
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex items-center gap-2 text-gold mb-2">
                                            <Star size={16} fill="currentColor" />
                                            <span className="text-sm font-bold">{dest.rating}</span>
                                        </div>
                                        <h3 className="text-3xl font-display font-bold text-cream mb-2 group-hover:text-gold transition-colors">
                                            {dest.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-cream/70 text-sm mb-4">
                                            <MapPin size={14} />
                                            {dest.location}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {dest.highlights?.slice(0, 3).map(h => (
                                                <span key={h} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] text-cream uppercase tracking-widest font-bold">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="absolute top-8 right-8 px-4 py-2 bg-cream text-forest rounded-full text-xs font-bold shadow-lg">
                                        Starting ₹{dest.startingPrice.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-forest/40 font-medium">{dest.category.replace('_', ' ')}</span>
                                    <Link to={`/destinations/${dest.slug}`} className="text-forest font-bold inline-flex items-center gap-2 hover:text-gold transition-colors">
                                        Explore <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DiscoveryPage;
