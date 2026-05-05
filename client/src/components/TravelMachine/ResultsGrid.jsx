import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, ArrowRight, Zap } from 'lucide-react';

const AntiGravityCard = ({ item, index }) => {
  return (
    <motion.div
      className="anti-gravity-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={{ y: -15 }}
    >
      <div className="card-inner-glass">
        {/* IMAGE WITH KEN BURNS EFFECT ON HOVER */}
        <div className="card-visual-wrap">
          <img src={item.image} alt={item.title} className="ken-burns-img" />
          <div className="card-overlay-gradient" />
          
          <div className="top-badges">
            <span className="glass-badge">{item.tags[0]}</span>
          </div>

          {/* QUICK PICKS FLOATING BADGES (VISIBLE ON HOVER) */}
          <div className="quick-picks-overlay">
            <div className="pick-badge"><Zap size={12} /> Private Villa</div>
            <div className="pick-badge"><Zap size={12} /> Breakfast</div>
          </div>
        </div>

        <div className="card-body">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3A6B]/50 flex items-center gap-1">
              <Clock size={12} /> {item.duration}
            </span>
            <div className="flex items-center gap-1 text-[#E8A838]">
              <Star size={12} fill="currentColor" stroke="none" />
              <span className="text-xs font-bold">{item.rating}</span>
            </div>
          </div>

          <h3 className="card-title text-xl font-bold text-[#1B3A6B] mb-6 line-clamp-2">
            {item.title}
          </h3>

          <div className="card-footer flex justify-between items-end">
            <div className="price-block">
              <span className="text-[10px] font-bold opacity-40 uppercase">Starting at</span>
              <div className="text-2xl font-black text-[#1B3A6B]">₹{item.price.toLocaleString()}</div>
            </div>
            
            <button className="view-itinerary-btn-green">
              View <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* GLOW EFFECT ON HOVER */}
      <div className="card-glow" />
    </motion.div>
  );
};

const ResultsGrid = ({ destination, duration, startDate, persona }) => {
  // Mock data expanded
  const itineraries = [
    {
      id: 1,
      title: "Ubud Escape: Private Pool Villa & Sacred Monkey Forest",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      price: 42853,
      duration: `${duration} Nights`,
      rating: 4.9,
      tags: ["Couple Choice", "Private Pool"]
    },
    {
      id: 2,
      title: "Seminyak Luxury: Beachfront Resort & Sunset Dinner",
      image: "https://images.unsplash.com/photo-1537953391147-f459c0b0ad14?w=800&q=80",
      price: 58210,
      duration: `${duration} Nights`,
      rating: 4.8,
      tags: ["Family Friendly", "All Inclusive"]
    },
    {
      id: 3,
      title: "Nusa Penida Adventure: Manta Bay & Kelingking Beach",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
      price: 36400,
      duration: `${duration} Nights`,
      rating: 4.7,
      tags: ["Adventure", "Photo Tour"]
    },
    {
      id: 4,
      title: "Uluwatu Cliffs: Temple Tour & Kecak Fire Dance",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
      price: 45900,
      duration: `${duration} Nights`,
      rating: 4.9,
      tags: ["Cultural", "Views"]
    }
  ];

  return (
    <div className="results-grid-wrapper container mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {itineraries.map((item, idx) => (
          <AntiGravityCard key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
