import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Check, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000/api/public';

const DestinationDetailsPage = () => {
    const { slug } = useParams();

    const { data: dest, isLoading } = useQuery({
        queryKey: ['destination', slug],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/destinations/${slug}`);
            return res.data;
        }
    });

    const [wishlist, setWishlist] = React.useState([]);
    const { isAuthenticated, token } = useAuthStore();

    React.useEffect(() => {
        const loadWishlist = async () => {
            if (isAuthenticated && token) {
                try {
                    const res = await axios.get(`${API_BASE.replace('/public', '/wishlist')}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const serverItems = res.data.map(i => ({ id: i.entityId, type: i.entityType }));
                    setWishlist(serverItems);
                    return;
                } catch (err) {
                    console.error("Wishlist load error", err);
                }
            }
            const saved = localStorage.getItem('roam_wishlist');
            if (saved) setWishlist(JSON.parse(saved));
        };
        loadWishlist();
    }, [isAuthenticated, token]);

    const toggleWishlist = async () => {
        const isSaved = wishlist.find(item => item.id === dest.id);
        
        if (isAuthenticated && token) {
            try {
                if (isSaved) {
                    await axios.delete(`${API_BASE.replace('/public', '/wishlist')}/${dest.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Removed from wishlist");
                } else {
                    await axios.post(`${API_BASE.replace('/public', '/wishlist')}`, {
                        entityType: 'Destination', entityId: dest.id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Added to wishlist ♥️");
                }
                // Toggle locally for UI update
                let updated;
                if (isSaved) {
                    updated = wishlist.filter(item => item.id !== dest.id);
                } else {
                    updated = [...wishlist, { 
                        id: dest.id, 
                        name: dest.name, 
                        location: `${dest.district?.name}, ${dest.district?.state?.name}`, 
                        image: dest.coverImage, 
                        type: 'Destination',
                        path: `/destinations/${dest.slug}`
                    }];
                }
                setWishlist(updated);
                localStorage.setItem('roam_wishlist', JSON.stringify(updated));
            } catch (err) {
                toast.error("Failed to update wishlist");
                console.error(err);
            }
        } else {
            let updated;
            if (isSaved) {
                updated = wishlist.filter(item => item.id !== dest.id);
                toast.success("Removed from wishlist");
            } else {
                updated = [...wishlist, { 
                    id: dest.id, 
                    name: dest.name, 
                    location: `${dest.district?.name}, ${dest.district?.state?.name}`, 
                    image: dest.coverImage, 
                    type: 'Destination',
                    path: `/destinations/${dest.slug}`
                }];
                toast.success("Added to wishlist ♥️");
            }
            setWishlist(updated);
            localStorage.setItem('roam_wishlist', JSON.stringify(updated));
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center text-forest font-bold">Loading your next adventure...</div>;
    if (!dest) return <div className="h-screen flex items-center justify-center text-forest font-bold">Destination not found.</div>;

    return (
        <div className="bg-cream">
            {/* Gallery Hero */}
            <div className="relative h-[60vh] md:h-[70vh] bg-forest overflow-hidden">
                <img 
                    src={dest.coverImage || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'} 
                    alt={dest.name} 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-0 right-0">
                    <div className="container mx-auto px-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-cream/70 hover:text-gold mb-8 transition-colors">
                            <ArrowLeft size={20} /> Back to Discovery
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-cream mb-4">{dest.name}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-cream/80">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-gold" />
                                <span>{dest.district?.name}, {dest.district?.state?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-gold" fill="currentColor" />
                                <span className="font-bold">{dest.rating}</span>
                                <span className="opacity-50 text-sm">(Curated Rating)</span>
                            </div>
                            {dest.bestSeason && (
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-gold" />
                                    <span>Best Season: {dest.bestSeason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-16">
                    <div className="prose prose-xl prose-stone max-w-none">
                        <p className="text-2xl text-forest/70 leading-relaxed font-display">
                            {dest.description}
                        </p>
                    </div>

                    {/* Activities Grid */}
                    <section>
                        <h2 className="text-4xl font-display font-bold text-forest mb-10 flex items-center gap-4">
                            Expert-Curated Activities
                            <div className="h-px flex-1 bg-forest/10" />
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dest.activities?.map((act) => (
                                <div key={act.id} className="bg-white p-8 rounded-3xl shadow-sm border border-forest/5 group hover:shadow-xl transition-all duration-300">
                                    <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                        {act.icon || '📍'}
                                    </div>
                                    <h3 className="text-xl font-bold text-forest mb-2">{act.name}</h3>
                                    <p className="text-forest/50 text-sm mb-6 line-clamp-2">{act.description || 'Experience the authentic charm of this local attraction.'}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-forest/5">
                                        <div className="flex items-center gap-2 text-forest/40 text-xs font-bold uppercase tracking-wider">
                                            <Clock size={14} /> {act.duration}
                                        </div>
                                        <div className="text-gold font-bold">₹{act.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Accommodations */}
                    <section>
                        <h2 className="text-4xl font-display font-bold text-forest mb-10 flex items-center gap-4">
                            Where to Stay
                            <div className="h-px flex-1 bg-forest/10" />
                        </h2>
                        <div className="space-y-6">
                            {dest.accommodation?.map((stay) => (
                                <div key={stay.id} className="flex flex-col md:flex-row gap-8 bg-white rounded-[2.5rem] overflow-hidden border border-forest/5 p-4 pr-10 shadow-sm">
                                    <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shrink-0">
                                        <img 
                                            src={stay.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000'} 
                                            alt={stay.tier}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 py-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1 block">
                                                    {stay.tier.replace('_', ' ')} Stay
                                                </span>
                                                <h3 className="text-2xl font-bold text-forest uppercase">{stay.hotelNameInternal || 'Boutique Stay'}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 text-gold">
                                                {[...Array(stay.stars)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                        </div>
                                        <p className="text-forest/60 text-sm mb-6 max-w-md">{stay.vibeDescription}</p>
                                        <div className="flex flex-wrap gap-4">
                                            {stay.includes?.map(inc => (
                                                <div key={inc} className="flex items-center gap-2 text-[10px] font-bold text-forest/40 bg-forest/5 px-3 py-1 rounded-full uppercase tracking-wider">
                                                    <Check size={10} className="text-forest" /> {inc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center py-4 shrink-0">
                                        <span className="text-sm text-forest/40">From</span>
                                        <span className="text-3xl font-display font-bold text-forest">₹{stay.pricePerNight}</span>
                                        <span className="text-xs text-forest/40 mt-1">per night</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Food Options */}
                    {dest.foodOptions?.length > 0 && (
                        <section>
                            <h2 className="text-4xl font-display font-bold text-forest mb-10 flex items-center gap-4">
                                Cuisine & Local Must-Tries
                                <div className="h-px flex-1 bg-forest/10" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {dest.foodOptions.map((food) => (
                                    <div key={food.id} className="bg-white p-8 rounded-3xl border border-forest/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-2xl">
                                                {food.icon || '🍱'}
                                            </div>
                                            <h3 className="text-xl font-bold text-forest">{food.name}</h3>
                                        </div>
                                        <p className="text-forest/60 text-sm mb-6">{food.description || 'Discover local flavors curated by our experts.'}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {food.tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-forest/5 text-[10px] font-bold text-forest/40 rounded-full uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    <div className="bg-forest rounded-[3rem] p-10 text-cream shadow-2xl sticky top-28">
                        <h3 className="text-3xl font-display font-bold mb-6">Ready to Go?</h3>
                        <p className="text-cream/60 text-sm leading-relaxed mb-10">
                            Add experiences from {dest.name} to your handcrafted itinerary. Let's make it official.
                        </p>
                        
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between py-3 border-b border-white/10 text-sm">
                                <span className="text-cream/40">Avg. Per Day</span>
                                <span className="font-bold text-gold">₹{dest.avgCost || '3,500+'}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/10 text-sm">
                                <span className="text-cream/40">Travel Type</span>
                                <span className="font-bold">Managed & Private</span>
                            </div>
                        </div>

                        <Link 
                            to="/planner"
                            className="w-full py-5 bg-gold text-ink rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform mb-4"
                        >
                            Open Itinerary Builder <ArrowRight size={20} />
                        </Link>
                        
                        <button 
                            onClick={toggleWishlist}
                            className={`w-full py-4 border-2 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
                                wishlist.find(item => item.id === dest?.id)
                                ? 'bg-red border-red text-white'
                                : 'border-white/20 text-cream hover:bg-white/10'
                            }`}
                        >
                            <Heart size={20} fill={wishlist.find(item => item.id === dest?.id) ? 'currentColor' : 'none'} />
                            {wishlist.find(item => item.id === dest?.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-forest/5">
                        <h4 className="font-bold text-forest mb-4">Travel Options</h4>
                        <div className="space-y-4">
                            {dest.travelOptions?.map(opt => (
                                <div key={opt.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-forest/5 rounded-xl flex items-center justify-center text-xl">
                                        {opt.icon || '🚗'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-forest capitalize">{opt.mode.replace('_', ' ')}</p>
                                        <p className="text-xs text-forest/40">{opt.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetailsPage;
