import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Search } from 'lucide-react';
import apiClient from '../../services/apiClient';

const DetailModal = ({ inquiry, onClose }) => {
  const itinerary = inquiry?.itinerarySnapshot || inquiry?.itinerary || null;
  const timeline = itinerary?.timeline || itinerary?.itinerary?.timeline || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-ink">{inquiry.name}</h2>
            <p className="text-sm text-ink/40 font-medium">{inquiry.email} · {inquiry.phone}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-ink/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">State</p>
            <p className="font-bold text-ink">{inquiry.state || '-'}</p>
          </div>
          <div className="p-4 bg-ink/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">District</p>
            <p className="font-bold text-ink">{inquiry.district || '-'}</p>
          </div>
          <div className="p-4 bg-ink/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Start Date</p>
            <p className="font-bold text-ink">{(inquiry.tripDate || inquiry.startDate) ? new Date(inquiry.tripDate || inquiry.startDate).toLocaleDateString() : '-'}</p>
          </div>
          <div className="p-4 bg-ink/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Budget</p>
            <p className="font-bold text-ink">₹{Number(inquiry.totalBudget || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-forest/5 rounded-xl border border-forest/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-forest mb-2">Hotel</p>
            <p className="text-sm font-semibold text-ink/80">{inquiry.hotelSnapshot?.name || inquiry.hotel || '-'}</p>
          </div>
          {inquiry.foodSnapshot || inquiry.food ? (
            <div className="p-4 bg-gold/5 rounded-xl border border-gold/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Food</p>
              <p className="text-sm font-semibold text-ink/80">{inquiry.foodSnapshot?.name || inquiry.food}</p>
            </div>
          ) : null}

          <div className="p-4 bg-white rounded-xl border border-ink/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-3">Itinerary</p>
            {timeline.length ? (
              <div className="space-y-3">
                {timeline.map((day) => (
                  <div key={day.day} className="border-l-2 border-gold/30 pl-4 py-1">
                    <p className="text-[10px] font-bold text-gold uppercase tracking-tighter mb-1">Day {day.day}</p>
                    <div className="space-y-1">
                      {(day.activities || []).map((act) => (
                        <p key={act.planId || `${act.destinationName}:${act.name}`} className="text-xs font-bold text-ink/70 leading-tight">
                          {act.destinationName}: {act.name}
                        </p>
                      ))}
                      {day.travelNote ? <p className="text-[11px] text-ink/40 italic">{day.travelNote}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs text-ink/60 whitespace-pre-wrap">{JSON.stringify(inquiry.itinerary, null, 2)}</pre>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function InquiryManager() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => (await apiClient.get('/inquiry')).data,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter((i) =>
      [i.name, i.email, i.phone, i.state, i.district].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [inquiries, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold text-ink mb-2">Inquiries</h1>
          <p className="text-ink/60 font-medium">User itinerary inquiries saved from the traveller form.</p>
        </div>
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, state..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/10 focus:border-red/20 transition-all font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-ink/5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
            {isLoading ? 'Loading…' : `${filtered.length} inquiries`}
          </p>
          {error ? <p className="text-xs font-bold text-red">Failed to load</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/60">
              <tr>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Name</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Phone</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">State</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">District</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Budget</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
                <th className="text-right p-4 font-bold uppercase tracking-widest text-[10px]">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-ink/5 hover:bg-ink/5 transition-colors">
                  <td className="p-4 font-bold text-ink">{i.name}</td>
                  <td className="p-4 text-ink/70 font-semibold">{i.phone}</td>
                  <td className="p-4 text-ink/70 font-semibold">{i.state || '-'}</td>
                  <td className="p-4 text-ink/70 font-semibold">{i.district || '-'}</td>
                  <td className="p-4 text-ink/70 font-semibold">₹{Number(i.totalBudget || 0).toLocaleString()}</td>
                  <td className="p-4 text-ink/60 font-semibold">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelected(i)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ink text-cream hover:bg-ink/90 transition font-bold text-xs"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-ink/40 font-bold">
                    No inquiries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected ? <DetailModal inquiry={selected} onClose={() => setSelected(null)} /> : null}
      </AnimatePresence>
    </div>
  );
}

