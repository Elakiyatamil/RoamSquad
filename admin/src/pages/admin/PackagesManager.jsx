import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Plus, IndianRupee, Calendar, Edit2, Trash2, X
} from 'lucide-react';
import apiClient from '../../services/apiClient';

// --- Package Form Modal ---
const PackageForm = ({ pkg, onClose }) => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(pkg || {
        name: '',
        daysCount: '',
        totalPrice: '',
        highlights: '',
        tag: 'Bestseller',
        coverImage: '',
        isActive: true,
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (pkg?.id) return await apiClient.patch(`/packages/${pkg.id}`, data);
            return await apiClient.post('/packages', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['packages']);
            onClose();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { alert('Package name is required.'); return; }
        if (!form.totalPrice) { alert('Price is required.'); return; }
        if (!form.daysCount) { alert('Duration is required.'); return; }
        
        const highlightsArray = typeof form.highlights === 'string' 
            ? form.highlights.split(',').map(s => s.trim()).filter(Boolean) 
            : (Array.isArray(form.highlights) ? form.highlights : []);

        mutation.mutate({
            ...form,
            daysCount: parseInt(form.daysCount) || 0,
            totalPrice: parseFloat(form.totalPrice) || 0,
            highlights: highlightsArray,
        });
    };

    const highlightsStr = Array.isArray(form.highlights) ? form.highlights.join(', ') : form.highlights;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-ink">{pkg ? 'Edit' : 'New'} Package</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Travel Package Details</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Package Name *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-red/20 transition-all" placeholder="e.g. Kerala Backwaters Escape" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Days *</label>
                            <input type="number" value={form.daysCount} onChange={e => setForm({ ...form, daysCount: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-red/20 transition-all" placeholder="7" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹) *</label>
                            <input type="number" value={form.totalPrice} onChange={e => setForm({ ...form, totalPrice: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-red/20 transition-all" placeholder="24999" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Package Tag</label>
                        <select 
                            value={form.tag || 'Bestseller'} 
                            onChange={e => setForm({ ...form, tag: e.target.value })}
                            className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-red/20 transition-all appearance-none"
                        >
                            <option value="Bestseller">Bestseller</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Family">Family</option>
                            <option value="Honeymoon">Honeymoon</option>
                            <option value="Budget">Budget</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Cover Image URL</label>
                        <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-red/20 transition-all" placeholder="https://images.unsplash.com/..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Highlights (comma-separated)</label>
                        <textarea 
                            value={highlightsStr} 
                            onChange={e => setForm({ ...form, highlights: e.target.value })} 
                            className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium min-h-[80px] focus:ring-2 focus:ring-red/20 transition-all" 
                            placeholder="Houseboat Stay, Kathakali Show, Spice Plantation" 
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="flex-[2] btn-primary py-3 disabled:opacity-70 flex items-center justify-center gap-2">
                            {mutation.isPending ? 'Saving...' : (pkg ? 'Save Changes' : 'Create Package')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Package Card ---
const PackageCard = ({ item, index, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="card group cursor-pointer"
    >
        <div className="aspect-[16/10] bg-ink/5 relative overflow-hidden">
            {item.coverImage ? (
                <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/10"><Package size={48} /></div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-widest text-red flex items-center gap-1.5 shadow-sm">
                <Calendar size={10} />
                {item.daysCount} Days
            </div>
            {item.tag && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-ink text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    {item.tag}
                </div>
            )}
        </div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold truncate pr-4 text-ink">{item.name}</h3>
                <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/20 hover:text-ink transition-all"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red/5 text-ink/20 hover:text-red transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-forest font-bold">
                    <IndianRupee size={14} />
                    <span>{item.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-ink/10 rounded-full" />
                <p className="text-ink/40 font-bold text-[10px] uppercase tracking-widest">Starting Price</p>
            </div>
            {item.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {item.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="px-2 py-1 bg-ink/5 rounded-lg text-[10px] font-bold text-ink/50 border border-ink/5">{h}</span>
                    ))}
                    {item.highlights.length > 3 && (
                        <span className="px-2 py-1 bg-ink/5 rounded-lg text-[10px] font-bold text-ink/30">+{item.highlights.length - 3} more</span>
                    )}
                </div>
            )}
            <button onClick={() => onEdit(item)} className="w-full py-4 bg-ink/5 hover:bg-red text-ink hover:text-white rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-[0.98]">Manage Itinerary</button>
        </div>
    </motion.div>
);

// --- Main Manager ---
const PackagesManager = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const res = await apiClient.get('/packages');
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/packages/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['packages'])
    });

    const handleDelete = (id) => { if (window.confirm('Delete this package?')) deleteMutation.mutate(id); };
    const openAdd = () => { setEditingPkg(null); setIsFormOpen(true); };
    const openEdit = (pkg) => { setEditingPkg(pkg); setIsFormOpen(true); };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Global Packages</h1>
                    <p className="text-ink/60 font-medium">Manage multi-destination curated itineraries.</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> New Package
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="card h-[400px] animate-pulse bg-white/50" />)}
                </div>
            ) : packages.length === 0 ? (
                <div className="py-24 flex flex-col items-center text-center text-ink/30">
                    <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mb-6"><Package size={40} /></div>
                    <p className="font-bold text-lg mb-2">No packages yet</p>
                    <p className="text-sm mb-6">Create your first curated travel package.</p>
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create First Package</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, i) => (
                        <PackageCard key={pkg.id} item={pkg} index={i} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isFormOpen && (
                    <PackageForm pkg={editingPkg} onClose={() => { setIsFormOpen(false); setEditingPkg(null); }} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PackagesManager;
