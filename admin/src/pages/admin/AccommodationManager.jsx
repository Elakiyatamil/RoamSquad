import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hotel, Star, IndianRupee, Plus, EyeOff, ChevronDown, X, Trash2, Edit2, Upload
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const TIERS = ['Budget', 'Comfort', 'Luxury'];

// --- Accommodation Form Modal ---
const AccommodationForm = ({ accommodation, destinationId, onClose }) => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(accommodation || {
        tier: 'Budget',
        stars: 3,
        price: '',
        vibeDescription: '',

        hotelNameInternal: '',
        includes: '',
        imageUrl: '',
        isActive: true,
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (accommodation?.id) return await apiClient.patch(`/accommodation/${accommodation.id}`, data);
            return await apiClient.post('/accommodation', { ...data, destinationId });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries(['accommodation', destinationId]);
            onClose();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.price) { alert('Price is required.'); return; }

        const includesArray = form.includes
            ? (typeof form.includes === 'string' ? form.includes.split(',').map(s => s.trim()).filter(Boolean) : form.includes)
            : [];
        mutation.mutate({
            ...form,
            stars: parseInt(form.stars) || 3,
            price: parseFloat(form.price) || 0,
            includes: includesArray
        });

    };

    const includesStr = Array.isArray(form.includes) ? form.includes.join(', ') : form.includes;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-ink">{accommodation ? 'Edit' : 'Configure'} Stay Tier</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Accommodation Details</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Tier *</label>
                            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" disabled={!!accommodation}>
                                {TIERS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Stars</label>
                            <select value={form.stars} onChange={e => setForm({ ...form, stars: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium">
                                {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Stars</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹) *</label>
                        <input type="number" value={form.price || ""} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="3500" />

                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Vibe Description</label>
                        <textarea rows={2} value={form.vibeDescription || ""} onChange={e => setForm({ ...form, vibeDescription: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium resize-none" placeholder="Cozy eco-friendly stays surrounded by nature..." />

                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Includes (comma-separated)</label>
                        <input value={includesStr || ""} onChange={e => setForm({ ...form, includes: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="WiFi, Breakfast, Parking" />

                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Internal Hotel Name (Private)</label>
                        <input value={form.hotelNameInternal || ""} onChange={e => setForm({ ...form, hotelNameInternal: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="Vendor contact hotel name" />

                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Property Image</label>
                        {form.imageUrl ? (
                            <div className="relative group rounded-2xl overflow-hidden aspect-video">
                                <img src={form.imageUrl} alt="property" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, imageUrl: '' })}
                                    className="absolute top-2 right-2 w-8 h-8 bg-ink/70 hover:bg-red rounded-xl flex items-center justify-center text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const uploadData = new FormData();
                                        uploadData.append('image', file);
                                        try {
                                            const res = await apiClient.post('/upload/single', uploadData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            setForm(prev => ({ ...prev, imageUrl: res.data.url }));
                                        } catch (err) {
                                            alert('Failed to upload image.');
                                        }
                                    }}
                                />
                                <div className="w-full py-8 border-2 border-dashed border-ink/10 rounded-2xl flex flex-col items-center gap-2 justify-center text-ink/40 hover:text-red hover:border-red/30 transition-colors cursor-pointer">
                                    <Upload size={24} />
                                    <span className="text-xs font-bold">Click to upload image</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="flex-[2] btn-primary py-3 disabled:opacity-70">
                            {mutation.isPending ? 'Saving...' : accommodation ? 'Save Changes' : 'Configure Tier'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Accommodation Card ---
const AccommodationCard = ({ tier, record, onEdit, onDelete }) => {
    const getIconColor = () => {
        switch (tier.toLowerCase()) {
            case 'luxury': return 'text-gold';
            case 'comfort': return 'text-ocean';
            default: return 'text-forest';
        }
    };

    return (
        <motion.div whileHover={{ y: -4 }} className="card p-8 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${getIconColor()} opacity-[0.03] -mr-8 -mt-8`}><Hotel size={128} /></div>

            <div className="flex justify-between items-start mb-6">
                <div className="px-4 py-1.5 rounded-lg bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/60 border border-ink/5">{tier}</div>
                <div className="flex items-center gap-2">
                    <div className="flex text-gold">
                        {[...Array(record?.stars || 3)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    {record && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(record)} className="text-ink/30 hover:text-ink p-1"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(record.id)} className="text-ink/30 hover:text-red p-1"><Trash2 size={14} /></button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-3xl font-display font-bold text-ink mb-4">
                {record?.price ? `₹${record.price}` : 'Not Configured'}
            </h3>

            <p className="text-sm text-ink/60 font-medium mb-6 line-clamp-3">
                {record?.vibeDescription || 'No description provided for this tier.'}
            </p>

            <div className="space-y-4 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Includes</p>
                <div className="flex flex-wrap gap-2">
                    {(record?.includes || []).length > 0
                        ? record.includes.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-ink/5 rounded-full text-[10px] font-bold text-ink/60">{item}</span>
                        ))
                        : <span className="text-[10px] text-ink/20 font-bold italic">None configured</span>
                    }
                </div>
            </div>

            <div className="pt-6 border-t border-ink/5">
                {record && (
                    <div className="flex items-center gap-2 text-red/40 mb-4">
                        <EyeOff size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Private: {record.hotelNameInternal || 'Not Set'}</span>
                    </div>
                )}
                <button onClick={() => onEdit(record || { tier })} className="w-full py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold text-sm transition-all">
                    {record ? 'Edit Tier' : 'Configure Tier'}
                </button>
            </div>
        </motion.div>
    );
};

// --- Main Manager ---
const AccommodationManager = () => {
    const queryClient = useQueryClient();
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // Fetch Hierarchy Data
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await apiClient.get('/countries');
            return res.data.data || [];
        }
    });

    const { data: states = [] } = useQuery({
        queryKey: ['states', selectedCountry],
        queryFn: async () => {
            const res = await apiClient.get(`/countries/${selectedCountry}/states`);
            return res.data.data || [];
        },
        enabled: !!selectedCountry
    });

    const { data: districts = [] } = useQuery({
        queryKey: ['districts', selectedState],
        queryFn: async () => {
            const res = await apiClient.get(`/states/${selectedState}/districts`);
            return res.data.data || [];
        },
        enabled: !!selectedState
    });

    const { data: destinations = [] } = useQuery({
        queryKey: ['destinations', selectedDistrict],
        queryFn: async () => {
            const res = await apiClient.get(`/districts/${selectedDistrict}/destinations`);
            return res.data.data || [];
        },
        enabled: !!selectedDistrict
    });


    const { data: accommodations = [], isLoading } = useQuery({
        queryKey: ['accommodation', selectedDestId],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${selectedDestId}/accommodation`);
            return res.data.data || []; // Array of accommodation records
        },
        enabled: !!selectedDestId
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/accommodation/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['accommodation', selectedDestId])
    });

    const handleDelete = (id) => { if (window.confirm('Delete this accommodation tier?')) deleteMutation.mutate(id); };
    const openEdit = (record) => { setEditingRecord(record); setIsFormOpen(true); };

    // Map tiers to records
    const tierMap = {};
    accommodations.forEach(a => { tierMap[a.tier] = a; });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Stays &amp; Tiers</h1>
                    <p className="text-ink/60 font-medium">Manage accommodation packages for each destination.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] border border-ink/5 shadow-sm">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Country</label>
                    <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedState(''); setSelectedDistrict(''); setSelectedDestId(''); }} className="w-full px-4 py-3 bg-ink/5 rounded-2xl outline-none font-bold text-ink">
                        <option value="">Select Country</option>
                        {(Array.isArray(countries) ? countries : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">State</label>
                    <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedDestId(''); }} disabled={!selectedCountry} className="w-full px-4 py-3 bg-ink/5 rounded-2xl outline-none font-bold text-ink disabled:opacity-50">
                        <option value="">Select State</option>
                        {(Array.isArray(states) ? states : []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">District</label>
                    <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedDestId(''); }} disabled={!selectedState} className="w-full px-4 py-3 bg-ink/5 rounded-2xl outline-none font-bold text-ink disabled:opacity-50">
                        <option value="">Select District</option>
                        {(Array.isArray(districts) ? districts : []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Destination</label>
                    <select value={selectedDestId} onChange={e => setSelectedDestId(e.target.value)} disabled={!selectedDistrict} className="w-full px-4 py-3 bg-ink/5 rounded-2xl outline-none font-bold text-ink disabled:opacity-50">
                        <option value="">Select Destination</option>
                        {(Array.isArray(destinations) ? destinations : []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <ChevronDown size={18} className="hidden" /> 


            {!selectedDestId ? (
                <div className="py-24 text-center text-ink/30">
                    <p className="font-bold text-lg">No destinations yet</p>
                    <p className="text-sm mt-1">Create a destination first to configure accommodation.</p>
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="card h-96 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TIERS.map(tier => (
                        <AccommodationCard
                            key={tier}
                            tier={tier}
                            record={tierMap[tier] || null}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isFormOpen && (
                    <AccommodationForm
                        accommodation={editingRecord?.id ? editingRecord : null}
                        destinationId={selectedDestId}
                        onClose={() => { setIsFormOpen(false); setEditingRecord(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccommodationManager;
