import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTripsPage = () => {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        // For now, we'll check if there were any submitted inquiries saved locally
        const saved = localStorage.getItem('submitted_inquiries');
        if (saved) setTrips(JSON.parse(saved));
    }, []);

    return (
        <div className="container mx-auto px-6 py-20 min-h-[70vh]">
            <header className="mb-16">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">My Journeys</h1>
                <p className="text-forest/50 text-xl font-display">Track your handcrafted inquiries and upcoming adventures.</p>
            </header>

            {trips.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-16 text-center border border-forest/5 shadow-xl">
                    <div className="w-20 h-20 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-8 text-forest/20">
                        <Plane size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-forest mb-4">No trips planned yet</h2>
                    <p className="text-forest/40 mb-10 max-w-sm mx-auto">Build your first handcrafted itinerary and submit an inquiry to see it here.</p>
                    <Link 
                        to="/planner" 
                        className="inline-flex items-center gap-2 px-10 py-5 bg-gold text-ink rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Go to Planner
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {trips.map((trip, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-forest/5 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
                        >
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-forest/5 rounded-2xl flex items-center justify-center text-forest/30">
                                    <Calendar size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-gold/20 text-gold text-[10px] font-bold rounded uppercase tracking-widest">Inquiry Sent</span>
                                        <span className="text-forest/30 text-xs">{new Date(trip.date).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-forest">{trip.destination}</h3>
                                    <p className="text-forest/50 text-sm">{trip.travelers} Pax • {trip.vibe} Vibe</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">Estimated Budget</p>
                                    <p className="text-xl font-display font-bold text-forest">{trip.budget}</p>
                                </div>
                                <button className="p-4 bg-forest/5 rounded-2xl text-forest hover:bg-forest hover:text-cream transition-all">
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    
                    <div className="mt-12 p-8 bg-forest/5 rounded-[2.5rem] flex items-start gap-4 border-2 border-dashed border-forest/10">
                        <AlertCircle className="text-gold shrink-0 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-forest mb-1">Looking for older trips?</p>
                            <p className="text-forest/50 text-sm">Log in to sync your full travel history across all devices.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTripsPage;
