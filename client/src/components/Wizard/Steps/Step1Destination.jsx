import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Check } from 'lucide-react';
import axios from 'axios';
import usePlannerStore from '../../../store/usePlannerStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

/* Fallback destinations shown while loading or if API is empty */
const FALLBACK = [
  { id: 'coorg',    name: 'Coorg',    location: 'Karnataka', coverImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&q=80' },
  { id: 'munnar',   name: 'Munnar',   location: 'Kerala',    coverImage: 'https://images.unsplash.com/photo-1609766857564-2a4c4fde2ba4?w=600&q=80' },
  { id: 'goa',      name: 'Goa',      location: 'Goa',       coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { id: 'jaipur',   name: 'Jaipur',   location: 'Rajasthan', coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed31ac2?w=600&q=80' },
  { id: 'manali',   name: 'Manali',   location: 'Himachal',  coverImage: 'https://images.unsplash.com/photo-1597196914812-d9cc46e344da?w=600&q=80' },
  { id: 'andaman',  name: 'Andaman',  location: 'Islands',   coverImage: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80' },
];

export default function Step1Destination() {
  const { destination, updateData } = usePlannerStore();
  const [search, setSearch] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/public/destinations`)
      .then(r => { if (r.data?.success) setDestinations(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = (destinations.length ? destinations : FALLBACK).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 900,
        margin: '0 auto',
        padding: '48px 24px 24px',
        minHeight: 'calc(100vh - 192px)',
      }}
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <h1
          style={{
            fontFamily: "'Canva Sans', 'Inter', sans-serif",
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#000',
            margin: '0 0 12px',
            lineHeight: 1.05,
          }}
        >
          Where to next?
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            color: 'rgba(0,0,0,0.4)',
            margin: 0,
          }}
        >
          Pick a destination to start your journey.
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 560,
          position: 'relative',
          marginBottom: 40,
        }}
      >
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: 22,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search by city, country or attraction..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 100,
            padding: '16px 24px 16px 52px',
            fontSize: 15,
            fontFamily: "'Inter', sans-serif",
            color: '#000',
            outline: 'none',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#800020';
            e.target.style.boxShadow = '0 0 0 4px rgba(128,0,32,0.08)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(0,0,0,0.08)';
            e.target.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)';
          }}
        />
      </motion.div>

      {/* Destination cards grid */}
      {loading ? (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 200,
                height: 280,
                borderRadius: 20,
                background: 'rgba(0,0,0,0.06)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px 20px',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <AnimatePresence mode="popLayout">
            {list.map((dest, i) => {
              const isSelected = destination?.id === dest.id;
              return (
                <motion.div
                  key={dest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => updateData({ destination: dest })}
                  style={{
                    width: 200,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  {/* Card */}
                  <div
                    style={{
                      width: '100%',
                      height: 280,
                      borderRadius: 18,
                      overflow: 'hidden',
                      position: 'relative',
                      border: isSelected ? '2.5px solid #800020' : '2.5px solid transparent',
                      boxShadow: isSelected
                        ? '0 0 0 4px rgba(128,0,32,0.12), 0 8px 32px rgba(0,0,0,0.12)'
                        : '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.border = '2.5px solid #800020';
                        e.currentTarget.style.boxShadow = '0 0 24px rgba(128,0,32,0.2), 0 8px 32px rgba(0,0,0,0.12)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.border = '2.5px solid transparent';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <img
                      src={
                        dest.coverImage ||
                        dest.images?.[0] ||
                        `https://source.unsplash.com/400x560/?${encodeURIComponent(dest.name + ' travel')}`
                      }
                      alt={dest.name}
                      onError={e => {
                        e.target.src = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80`;
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                      }}
                    />

                    {/* Selected pin */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#800020',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(128,0,32,0.4)',
                        }}
                      >
                        <MapPin size={15} color="#fff" fill="#fff" />
                      </motion.div>
                    )}
                  </div>

                  {/* Meta below card */}
                  <div style={{ paddingLeft: 2 }}>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'rgba(0,0,0,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        margin: '0 0 3px',
                      }}
                    >
                      ◎ {dest.location || 'India'}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Canva Sans','DM Serif Display', serif",
                        fontSize: 18,
                        fontWeight: isSelected ? 700 : 400,
                        color: '#000',
                        margin: 0,
                        letterSpacing: '-0.01em',
                        transition: 'font-weight 0.2s',
                      }}
                    >
                      {dest.name}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
