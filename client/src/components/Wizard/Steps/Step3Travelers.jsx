import React from 'react';
import { motion } from 'framer-motion';
import { User, Baby, Minus, Plus, Check } from 'lucide-react';
import usePlannerStore from '../../../store/usePlannerStore';

const VIBES = [
  { id: 'solo',      label: 'Solo',      img: '/solo.png' },
  { id: 'couple',    label: 'Couple',    img: '/couple.png' },
  { id: 'family',    label: 'Family',    img: '/family.png' },
  { id: 'friends',   label: 'Friends',   img: '/friends.png' },
  { id: 'strangers', label: 'Strangers', img: '/strangers.png' },
];

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
        maxWidth: 680,
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

        {/* THE VIBE */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: 'rgba(0,0,0,0.3)',
            textAlign: 'center',
            margin: '32px 0 20px',
          }}
        >
          The Vibe
        </p>

        {/* Arch sticker cards */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {VIBES.map((v) => {
            const sel = vibe === v.id;
            return (
              <button
                key={v.id}
                onClick={() => updateData({ vibe: v.id })}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  outline: 'none',
                }}
              >
                {/* Arch card */}
                <div
                  style={{
                    width: 108,
                    height: 148,
                    borderRadius: '999px 999px 20px 20px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: sel ? '#800020' : '#fff',
                    border: sel ? '2.5px solid #800020' : '2.5px solid rgba(0,0,0,0.06)',
                    boxShadow: sel
                      ? '0 8px 32px rgba(128,0,32,0.28)'
                      : '0 4px 16px rgba(0,0,0,0.08)',
                    transform: sel ? 'scale(1.06)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.transform = 'translateY(-6px)'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img
                    src={v.img}
                    alt={v.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: sel ? 'brightness(0.85)' : 'none',
                      transition: 'filter 0.3s',
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />

                  {/* Label inside card */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: sel ? '#fff' : 'rgba(255,255,255,0.85)',
                        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      }}
                    >
                      {v.label}
                    </span>
                  </div>

                  {/* Green check for selected */}
                  {sel && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
                      }}
                    >
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
