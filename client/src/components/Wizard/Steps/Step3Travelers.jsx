import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, User, Baby, Check } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';

const Step3Travelers = () => {
  const { travelers, vibe, updateData } = usePlannerStore();

  const adjustTravelers = (type, amt) => {
    updateData({
      travelers: {
        ...travelers,
        [type]: Math.max(type === 'adults' ? 1 : 0, travelers[type] + amt)
      }
    });
  };

  const VIBES = [
    { id: 'solo', label: 'Solo', img: '/solo.png' },
    { id: 'couple', label: 'Couple', img: '/couple.png' },
    { id: 'family', label: 'Family', img: '/family.png' },
    { id: 'friends', label: 'Friends', img: '/friends.png' },
    { id: 'strangers', label: 'Strangers', img: '/strangers.png' }
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-12"
      >
        {/* 1. Travelers Counters at the top */}
        <div className="space-y-6">
          <CounterRow
            label="Adults"
            sub="Age 16+"
            count={travelers.adults}
            icon={<User size={24} />}
            onAdd={() => adjustTravelers('adults', 1)}
            onSub={() => adjustTravelers('adults', -1)}
          />
          <CounterRow
            label="Kids"
            sub="Below 16"
            count={travelers.kids}
            icon={<Baby size={24} />}
            onAdd={() => adjustTravelers('kids', 1)}
            onSub={() => adjustTravelers('kids', -1)}
          />
        </div>

        {/* 2. THE VIBE Sub-header */}
        <div className="text-center">
            <h2 className="text-primary/30 uppercase tracking-[0.25em] font-bold text-[11px] mb-8">THE VIBE</h2>
        </div>

        {/* 3. Vibe Sticker Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {VIBES.map((v) => {
            const isSelected = vibe === v.id;
            return (
              <button
                key={v.id}
                onClick={() => updateData({ vibe: v.id })}
                className="group relative flex flex-col items-center gap-4 outline-none"
              >
                {/* Sticker Card (Arch Shape) */}
                <div 
                  className={`relative w-full aspect-[4/5] rounded-t-[120px] rounded-b-[20px] md:rounded-t-[150px] md:rounded-b-[24px] overflow-hidden transition-all duration-500 shadow-xl shadow-black/5 ${
                    isSelected 
                      ? 'bg-accent-maroon scale-105 border-4 border-accent-maroon' 
                      : 'bg-white hover:bg-white/80 hover:-translate-y-2'
                  }`}
                >
                  <div className="w-full h-full p-2 md:p-3 flex flex-col items-center">
                    <div className="w-full h-[82%] rounded-t-[110px] rounded-b-[12px] overflow-hidden">
                      <img 
                        src={v.img} 
                        alt={v.label}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          isSelected ? 'scale-110 brightness-110' : 'group-hover:scale-105'
                        }`}
                      />
                    </div>
                    
                    {/* Label inside the card */}
                    <div className="flex-1 flex items-center justify-center">
                      <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase transition-colors ${
                        isSelected ? 'text-white' : 'text-primary/60'
                      }`}>
                        {v.label}
                      </span>
                    </div>

                    {/* Green Checkmark for selected state */}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const CounterRow = ({ label, sub, count, icon, onAdd, onSub }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-[32px] p-6 md:p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-6">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/5 flex items-center justify-center text-primary/40">
        {icon}
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-display font-bold">{label}</h3>
        <p className="text-[10px] text-primary/30 uppercase tracking-widest font-bold">{sub}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4 md:gap-8">
      <button
        onClick={onSub}
        className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-black/5 transition-all active:scale-90"
      >
        <Minus size={18} />
      </button>
      <span className="text-2xl md:text-3xl font-display font-bold w-6 text-center">{count}</span>
      <button
        onClick={onAdd}
        className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-black/5 transition-all active:scale-90"
      >
        <Plus size={18} />
      </button>
    </div>
  </div>
);

export default Step3Travelers;
