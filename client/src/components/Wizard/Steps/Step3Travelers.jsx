import React from 'react';
import { motion } from 'framer-motion';
import { User, Baby, Minus, Plus } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';
import VibeSelector from '../../WhoAreYou/VibeSelector';

function CounterRow({ label, sub, count, icon, onAdd, onSub, minVal = 0 }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        marginBottom: 14,
      }}
    >
      {/* Icon + labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.35)',
          }}
        >
          {icon}
        </div>
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>
            {label}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2px 0 0' }}>
            {sub}
          </p>
        </div>
      </div>

      {/* Counter controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button
          onClick={onSub}
          disabled={count <= minVal}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: count <= minVal ? 'not-allowed' : 'pointer',
            opacity: count <= minVal ? 0.3 : 1,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { if (count > minVal) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Minus size={16} color="#9CA3AF" />
        </button>

        <motion.span
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontFamily: "'Canva Sans', 'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: '#000',
            minWidth: 28,
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          {count}
        </motion.span>

        <button
          onClick={onAdd}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1.5px solid #800020',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#800020'; e.currentTarget.querySelector('svg').style.stroke = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('svg').style.stroke = '#800020'; }}
        >
          <Plus size={16} color="#800020" style={{ transition: 'stroke 0.15s' }} />
        </button>
      </div>
    </div>
  );
}

export default function Step3Travelers() {
  const { travelers, vibe, updateData } = usePlannerStore();

  const adjust = (type, amt) =>
    updateData({
      travelers: {
        ...travelers,
        [type]: Math.max(type === 'adults' ? 1 : 0, travelers[type] + amt),
      },
    });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 860,
        margin: '0 auto',
        padding: '40px 24px 24px',
        minHeight: 'calc(100vh - 192px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%' }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Traveler counters */}
          <CounterRow
            label="Adults" sub="Age 16+"
            count={travelers.adults}
            icon={<User size={22} />}
            onAdd={() => adjust('adults', 1)}
            onSub={() => adjust('adults', -1)}
            minVal={1}
          />
          <CounterRow
            label="Kids" sub="Below 16"
            count={travelers.kids}
            icon={<Baby size={22} />}
            onAdd={() => adjust('kids', 1)}
            onSub={() => adjust('kids', -1)}
            minVal={0}
          />
        </div>

        {/* THE VIBE */}
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: 'rgba(0,0,0,0.3)',
            textAlign: 'center',
            margin: '48px 0 24px',
          }}
        >
          Choose Your Vibe
        </p>

        {/* Vibe Selector — Matching Homepage */}
        <div style={{ width: '100%' }}>
          <VibeSelector 
            value={vibe} 
            onSelect={(vId) => updateData({ vibe: vId })} 
            navigateOnSelect={false} 
          />
        </div>
      </motion.div>
    </div>
  );
}
