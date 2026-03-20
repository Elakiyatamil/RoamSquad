import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, Users, Star, Calendar } from 'lucide-react';
import apiClient from '../../services/apiClient';

function PackageForm({ onSave }) {
  const [form, setForm] = useState({ name: '', daysCount: 3, totalPrice: 0, highlights: '', tag: '', coverImage: '', isActive: true });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, daysCount: Number(form.daysCount), totalPrice: Number(form.totalPrice), highlights: form.highlights.split(',').map(h => h.trim()).filter(Boolean) });
    setForm({ name: '', daysCount: 3, totalPrice: 0, highlights: '', tag: '', coverImage: '', isActive: true });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-ink/5 space-y-4">
      <h3 className="text-xl font-bold text-ink mb-4">Create New Package</h3>
      <input required className="w-full p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Package Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
      <div className="grid grid-cols-2 gap-4">
        <input type="number" className="p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Days" value={form.daysCount} onChange={e => setForm(p => ({...p, daysCount: e.target.value}))} />
        <input type="number" className="p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Total Price (₹)" value={form.totalPrice} onChange={e => setForm(p => ({...p, totalPrice: e.target.value}))} />
      </div>
      <input className="w-full p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Highlights (comma separated)" value={form.highlights} onChange={e => setForm(p => ({...p, highlights: e.target.value}))} />
      <div className="grid grid-cols-2 gap-4">
        <input className="p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Tag (e.g. POPULAR)" value={form.tag} onChange={e => setForm(p => ({...p, tag: e.target.value}))} />
        <input className="p-4 bg-ink/5 rounded-xl border-2 border-transparent focus:border-gold outline-none" placeholder="Cover Image URL" value={form.coverImage} onChange={e => setForm(p => ({...p, coverImage: e.target.value}))} />
      </div>
      <button type="submit" className="w-full py-4 bg-ink text-cream rounded-xl font-bold hover:bg-ink/90 transition flex items-center justify-center gap-2">
        <Plus size={18} /> Add Package
      </button>
    </form>
  );
}

export default function GlobalPackagesManager() {
  const [activeTab, setActiveTab] = useState('packages');
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: async () => {
      const res = await apiClient.get('/packages');
      console.log("[GlobalPackagesManager] Packages API Response:", res.data);
      return res.data.data || [];
    }
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['packageInterests'],
    queryFn: async () => {
      const res = await apiClient.get('/package-interest');
      console.log("[GlobalPackagesManager] Interests API Response:", res.data);
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/packages', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPackages'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/packages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPackages'] })
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => apiClient.patch(`/packages/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminPackages'] })
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-display font-bold text-ink mb-2">Global Packages</h1>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setActiveTab('packages')}
              className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'packages' ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}>
              <Package size={16} className="inline mr-2" />Packages ({packages.length})
            </button>
            <button onClick={() => setActiveTab('interests')}
              className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'interests' ? 'bg-gold text-ink' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}>
              <Users size={16} className="inline mr-2" />Interests ({interests.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PackageForm onSave={createMutation.mutate} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {isLoading && <p className="text-ink/40 font-bold animate-pulse">Loading packages...</p>}
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl p-6 border border-ink/5 flex items-center gap-4 shadow-sm">
                {pkg.coverImage && <img src={pkg.coverImage} alt={pkg.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {pkg.tag && <span className="text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded uppercase">{pkg.tag}</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{pkg.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <h3 className="font-bold text-ink text-lg">{pkg.name}</h3>
                  <p className="text-sm text-ink/60">{pkg.daysCount} days · ₹{Number(pkg.totalPrice).toLocaleString()}</p>
                  {pkg.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pkg.highlights.map(h => <span key={h} className="text-[10px] bg-ink/5 text-ink/60 px-2 py-0.5 rounded-full">{h}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => toggleActive.mutate({ id: pkg.id, isActive: !pkg.isActive })}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-ink/10 hover:bg-ink/5 transition">
                    {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => { if(window.confirm('Delete this package?')) deleteMutation.mutate(pkg.id); }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-red/10 text-red hover:bg-red hover:text-white transition flex items-center gap-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && packages.length === 0 && (
              <div className="text-center py-16 bg-ink/5 rounded-3xl">
                <Package size={40} className="mx-auto text-ink/20 mb-4" />
                <p className="font-bold text-ink/40">No packages created yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'interests' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-ink/60">
              <tr>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Email</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Name</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Phone</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Package</th>
                <th className="text-left p-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
              </tr>
            </thead>
            <tbody>
                {interests.map((i) => (
                  <tr key={i.id} className="border-t border-ink/5 hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-bold text-ink">{i.email}</td>
                    <td className="p-4 text-ink/70">{i.name || '-'}</td>
                    <td className="p-4 text-ink/70 font-bold text-red">{i.phone || '-'}</td>
                    <td className="p-4 text-ink/70 font-semibold">{i.package?.name || '-'}</td>
                    <td className="p-4 text-ink/60 font-semibold">{new Date(i.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              {interests.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-ink/40 font-bold">No interests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
