import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, User, Zap } from 'lucide-react';

const TrustLayer = () => {
  const [activeUrgency, setActiveUrgency] = useState(null);

  const customerStories = [
    { name: "Monish Raja", text: "Bali was a dream. RoamSquad made it seamless!", rating: 4.8, city: "Bengaluru" },
    { name: "Sneha Kapoor", text: "The Ubud villa recommendation was 10/10.", rating: 5.0, city: "Delhi" },
    { name: "Arshad Khan", text: "Quickest booking I've ever done.", rating: 4.7, city: "Mumbai" }
  ];

  const urgencyNotifications = [
    "Arshad from Bengaluru booked a Bali trip 2h ago",
    "4 others are looking at this itinerary",
    "Only 2 slots left for May 15th departure"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * urgencyNotifications.length);
      setActiveUrgency(urgencyNotifications[random]);
      setTimeout(() => setActiveUrgency(null), 4000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="trust-layer-container py-20 bg-[#FAF8F4]">
      {/* PYT EXCLUSIVES */}
      <section className="exclusives-section container mx-auto px-6 mb-24">
        <h2 className="section-title text-center mb-12">PYT Exclusives: Sooper Hits</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {['Floating Breakfast', 'Swing Over Forest', 'Temple Sunset'].map(item => (
            <div key={item} className="exclusive-pill">
              <Zap size={16} fill="currentColor" /> {item}
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF WALL */}
      <section className="social-proof-section container mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {customerStories.map((story, i) => (
            <motion.div 
              key={i} 
              className="story-card bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-4 text-[#E8A838]">
                {Array(5).fill(0).map((_, j) => <Star key={j} size={14} fill="currentColor" stroke="none" />)}
              </div>
              <p className="story-text text-lg italic text-gray-700 mb-6">"{story.text}"</p>
              <div className="story-user flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{story.name}</h4>
                  <p className="text-sm text-gray-500">{story.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-xl font-medium text-gray-600">
            Join <span className="text-[#1B3A6B] font-bold">1,50,000+</span> happy travelers
          </p>
        </div>
      </section>

      {/* URGENCY ENGINE (Notification Toast) */}
      <AnimatePresence>
        {activeUrgency && (
          <motion.div 
            className="urgency-toast fixed bottom-10 left-10 z-[1000]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="bg-[#1B3A6B] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Zap size={20} className="text-[#E8A838]" />
              </div>
              <div>
                <p className="text-sm font-medium">{activeUrgency}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrustLayer;
