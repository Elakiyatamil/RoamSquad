import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Search, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';
import { generatePDF } from '../../utils/pdfExport';
import apiClient from '../../services/apiClient';

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s.includes('approve') || s.includes('confirm')) return <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max"><CheckCircle2 size={12} /> Approved</span>;
  if (s.includes('reject')) return <span className="px-2 py-1 bg-red/10 text-red text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max"><AlertCircle size={12} /> Rejected</span>;
  return <span className="px-2 py-1 bg-gold/20 text-gold text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max"><Clock size={12} /> Pending</span>;
};

const DetailModal = ({ inquiry, onClose, onStatusUpdate }) => {
  const itinerary = inquiry?.itinerarySnapshot || inquiry?.itinerary || null;
  const timeline = itinerary?.timeline || itinerary?.itinerary?.timeline || [];
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/inquiry/${inquiry.id}/status`, { status: newStatus });
      onStatusUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-ink">{inquiry.name}</h2>
              <StatusBadge status={inquiry.status} />
            </div>
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

        <div className="space-y-4 mb-8">
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
                {(Array.isArray(timeline) ? timeline : []).map((day) => (
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

        {/* Action Controls */}
        <div className="flex gap-4 border-t border-ink/5 pt-6 mt-2">
          <button 
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('Approved')}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition disabled:opacity-50"
          >
            Approve Journey
          </button>
          <button 
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('Rejected')}
            className="flex-1 py-3 bg-red text-white rounded-xl font-bold hover:bg-red/90 transition disabled:opacity-50"
          >
            Reject Inquiry
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function InquiryManager() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('inquiries');
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading, error } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const res = await apiClient.get('/inquiry');
      return res.data.data || [];
    },
  });

  const { data: wishlist = [], isLoading: wlLoading } = useQuery({
    queryKey: ['wishlistLeads'],
    queryFn: async () => {
      const res = await apiClient.get('/wishlist/leads');
      return res.data.data || [];
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter((i) =>
      [i.name, i.email, i.phone, i.state, i.district, i.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [inquiries, query]);

  const filteredWishlist = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return wishlist;
    return wishlist.filter((i) =>
      [i.email, i.destination].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [wishlist, query]);

  const handleStatusUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    setSelected(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold text-ink mb-2">Leads Dashboard</h1>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('inquiries')}
              className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'inquiries' ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}
            >
              Inquiries
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-gold text-ink' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}
            >
              Wishlist Leads
            </button>
          </div>
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

      <div className="card p-0 overflow-hidden mt-6">
        <div className="p-6 border-b border-ink/5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
            {activeTab === 'inquiries' ? (isLoading ? 'Loading…' : `${filtered.length} inquiries`) : (wlLoading ? 'Loading…' : `${filteredWishlist.length} wishlist leads`)}
          </p>
          {error && activeTab === 'inquiries' ? <p className="text-xs font-bold text-red">Failed to load</p> : null}
        </div>
        <div className="overflow-x-auto">
          {activeTab === 'inquiries' ? (
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-ink/60">
                <tr>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Name</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Contact</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Destination</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Budget</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="text-right p-4 font-bold uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filtered) ? filtered : []).map((i) => (
                  <tr key={i.id} className="border-t border-ink/5 hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-bold text-ink">{i.name}</td>
                    <td className="p-4 text-ink/70 font-semibold">{i.phone}</td>
                    <td className="p-4 text-ink/70 font-semibold">{i.state ? `${i.state} / ${i.district || '-'}` : (i.district || '-')}</td>
                    <td className="p-4 text-ink/70 font-semibold">₹{Number(i.totalBudget || 0).toLocaleString()}</td>
                    <td className="p-4 text-ink/60 font-semibold">{new Date(i.createdAt).toLocaleString()}</td>
                    <td className="p-4"><StatusBadge status={i.status} /></td>
                     <td className="p-4 text-right flex items-center justify-end gap-2">
                       <button
                         onClick={() => generatePDF(i)}
                         title="Download Itinerary PDF"
                         className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-ink/5 text-ink/40 hover:bg-forest hover:text-white transition-all shadow-sm"
                       >
                         <Download size={16} />
                       </button>
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
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-ink/60">
                <tr>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Email</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Destination</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
                  <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Preview</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredWishlist) ? filteredWishlist : []).map((w) => (
                  <tr key={w.id} className="border-t border-ink/5 hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-bold text-ink">{w.email}</td>
                    <td className="p-4 text-ink/70 font-semibold">{w.destination}</td>
                    <td className="p-4 text-ink/60 font-semibold">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="p-4 text-ink/60 text-xs align-top">
                      {w.itinerary ? (
                          <div className="space-y-2 bg-ink/5 p-4 rounded-xl max-w-sm whitespace-normal">
                              {w.itinerary.user && (
                                  <div className="mb-3 pb-3 border-b border-ink/10">
                                      <p className="font-bold text-ink">User: <span className="font-medium text-ink/70">{w.itinerary.user.name || 'N/A'}</span></p>
                                      <p className="font-bold text-ink">Phone: <span className="font-medium text-ink/70">{w.itinerary.user.phone || 'N/A'}</span></p>
                                      <p className="font-bold text-ink mt-2">Details: <span className="font-medium text-ink/70">{w.itinerary.days} Days • {w.itinerary.travelType} • {w.itinerary.vibe}</span></p>
                                  </div>
                              )}
                              <p className="font-bold text-ink mb-2">Est. Budget: ₹{Number(w.totalBudget || 0).toLocaleString()}</p>
                              
                              {Array.isArray(w.itinerary.activities) && w.itinerary.activities.length > 0 && (
                                  <div className="mb-2">
                                      <p className="font-bold text-ink/80 mb-1">Selected Activities:</p>
                                      <ul className="list-disc list-inside text-[11px] text-ink/60 space-y-1">
                                          {w.itinerary.activities.map((a, i) => (
                                              <li key={i}>{a.name} <span className="opacity-60 text-[9px]">({a.destinationName})</span></li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                              
                              {Array.isArray(w.itinerary.stays) && w.itinerary.stays.length > 0 && (
                                  <div className="mt-2">
                                      <p className="font-bold text-ink/80">Stay: <span className="font-normal text-ink/60 text-[11px]">{w.itinerary.stays[0].tier} Tier Stay</span></p>
                                  </div>
                              )}
                              
                              {Array.isArray(w.itinerary.food) && w.itinerary.food.length > 0 && (
                                  <div className="mt-2">
                                      <p className="font-bold text-ink/80">Food Options: <span className="font-normal text-ink/60 text-[11px]">{w.itinerary.food.map(f => f.name).join(', ')}</span></p>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <span className="italic text-ink/40">No structured plan available</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!wlLoading && filteredWishlist.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-ink/40 font-bold">
                      No wishlist leads yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected ? <DetailModal inquiry={selected} onClose={() => setSelected(null)} onStatusUpdate={handleStatusUpdate} /> : null}
      </AnimatePresence>
    </div>
  );
}
