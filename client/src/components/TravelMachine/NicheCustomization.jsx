import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Home, ArrowRight } from 'lucide-react';

const NicheCustomization = () => {
  const [activePersona, setActivePersona] = useState('Couple');

  const personas = [
    { id: 'Couple', icon: Heart, label: 'Couple', color: 'rose' },
    { id: 'Family', icon: Home, label: 'Family', color: 'blue' },
    { id: 'Friends', icon: Users, label: 'Friends', color: 'emerald' }
  ];

  return (
    <div className="niche-customization-container py-24 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="section-title mb-4">Tailored Just For You</h2>
        <p className="text-gray-500 mb-12 max-w-2xl mx-auto text-lg">
          Personalize your Bali escape by selecting your travel persona.
        </p>

        <div className="persona-tabs flex justify-center gap-6 mb-16">
          {personas.map(p => (
            <button 
              key={p.id}
              className={`persona-tab ${activePersona === p.id ? 'active' : ''}`}
              onClick={() => setActivePersona(p.id)}
            >
              <p.icon size={20} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <motion.div 
          key={activePersona}
          className="persona-content max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gray-50 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="persona-visual flex-1">
              <div className="w-full aspect-square bg-gray-200 rounded-3xl overflow-hidden shadow-inner">
                {/* Placeholder for persona-specific image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {activePersona} Package Visual
                </div>
              </div>
            </div>
            
            <div className="persona-details flex-1 text-left">
              <span className="text-[#22c55e] font-bold text-sm tracking-widest uppercase mb-4 block">
                Top Pick for {activePersona}s
              </span>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                {activePersona === 'Couple' ? 'Romantic Island Retreat' : 
                 activePersona === 'Family' ? 'Heritage & Fun Escape' : 
                 'Epic Squad Adventure'}
              </h3>
              <ul className="space-y-4 mb-10">
                {['Curated Boutique Stays', 'Private Cultural Tours', 'Adventure Activities'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button className="conversion-btn-green w-full md:w-auto">
                View Itinerary <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NicheCustomization;
