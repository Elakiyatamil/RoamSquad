import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';
import usePlannerStore from '../../../store/usePlannerStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const Step1Destination = () => {
  const { destination, updateData } = usePlannerStore();
  const [search, setSearch] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/destinations`);
        if (response.data.success) {
          setDestinations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filtered = destinations.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 tracking-tighter">Where to next?</h1>
        <p className="text-primary/40 text-lg">Pick a destination to start your journey.</p>
      </motion.div>

      {/* Search Bar */}
      <div className="w-full max-w-xl relative mb-12 group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent-maroon transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search by city, country or attraction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-black/5 rounded-full py-5 pl-16 pr-6 text-lg focus:outline-none focus:ring-4 focus:ring-accent-maroon/5 transition-all shadow-sm"
        />
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-[300px] bg-white/50 rounded-[24px] animate-pulse" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((dest) => (
              <motion.div
                key={dest.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData({ destination: dest })}
                className={`group relative h-[300px] rounded-[24px] overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  destination?.id === dest.id ? 'border-accent-maroon shadow-lg' : 'border-transparent shadow-sm'
                }`}
              >
                <img
                  src={dest.coverImage || dest.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                    <MapPin size={12} />
                    {dest.location || 'Explore'}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white">{dest.name}</h3>
                </div>
                {destination?.id === dest.id && (
                  <div className="absolute top-4 right-4 bg-accent-maroon text-white p-2 rounded-full">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Search size={14} className="rotate-45" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Step1Destination;
