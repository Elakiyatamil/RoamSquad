import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Clock,
    IndianRupee,
    Zap,
    Edit2,
    Trash2,
    X,
    ChevronDown
} from 'lucide-react';
import apiClient from '../../services/apiClient';

// --- Activity Form Modal ---
const ActivityForm = ({ activity, destinationId, onClose }) => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(activity || {
        name: '',
        icon: '🏕️',
        duration: '',
        price: '',
        description: '',
        images: []
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (activity?.id) {
                return await apiClient.patch(`/activities/${activity.id}`, data);
            }
            return await apiClient.post(`/destinations/${destinationId}/activities`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['activities', destinationId]);
            onClose();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { alert('Activity name is required.'); return; }
        if (!destinationId) { alert('Please select a destination first.'); return; }
        mutation.mutate({ ...form, price: parseFloat(form.price) || 0 });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-ink">{activity ? 'Edit' : 'New'} Activity</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Activity Details</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <div className="space-y-1 w-20">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Icon</label>
                            <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-3 bg-ink/5 rounded-xl border-none outline-none text-center text-xl" placeholder="🏕️" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Name *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="e.g. Kayaking Tour" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration</label>
                            <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="e.g. 3 Hours" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹)</label>
                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="500" />
                        </div>
                    </div>
                    <div className="space-y-4 pt-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Activity Images (Max 4)</label>
                        <div className="flex gap-2 items-center">
                            {form.images.map((img, i) => (
                                <div key={i} className="w-16 h-16 rounded-xl bg-ink/5 relative group overflow-hidden shrink-0">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...form.images];
                                            newImages.splice(i, 1);
                                            setForm({ ...form, images: newImages });
                                        }}
                                        className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            
                            {form.images.length < 4 && (
                                <div className="relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files).slice(0, 4 - form.images.length);
                                            if (!files.length) return;
                                            
                                            const uploadData = new FormData();
                                            files.forEach(file => uploadData.append('images', file));
                                            
                                            try {
                                                const res = await apiClient.post('/upload/multiple', uploadData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                setForm(prev => ({ 
                                                    ...prev, 
                                                    images: [...prev.images, ...res.data.urls] 
                                                }));
                                            } catch (err) {
                                                alert('Failed to upload images.');
                                            }
                                        }}
                                    />
                                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-ink/10 flex items-center justify-center text-ink/40 hover:text-red hover:border-red/30 transition-colors">
                                        <Plus size={20} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium resize-none" placeholder="Describe this activity..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="flex-[2] btn-primary py-3 disabled:opacity-70">
                            {mutation.isPending ? 'Saving...' : activity ? 'Save Changes' : 'Add Activity'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Activity Card ---
const ActivityCard = ({ activity, index, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="card group cursor-pointer overflow-hidden flex flex-col"
        >
            <div className="h-40 bg-ink/5 relative overflow-hidden">
                {activity.images && activity.images.length > 0 ? (
                    <img src={activity.images[0]} alt={activity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        {activity.icon || '🏕️'}
                    </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(activity)} className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl flex items-center justify-center text-ink/60 hover:text-ink hover:bg-white transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(activity.id)} className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl flex items-center justify-center text-ink/60 hover:text-red hover:bg-white transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold truncate pr-4">{activity.name}</h3>
                    {activity.images && activity.images.length > 0 && <span className="text-2xl">{activity.icon || '🏕️'}</span>}
                </div>
                
                <p className="text-xs text-ink/60 font-medium line-clamp-2 mb-4 flex-1">
                    {activity.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between border-t border-ink/5 pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-ink/60 text-sm font-bold">
                        <Clock size={16} className="text-ocean" />
                        {activity.duration || '—'}
                    </div>
                    <div className="flex items-center gap-1.5 text-font-bold text-ink bg-forest/10 px-3 py-1.5 rounded-lg">
                        <IndianRupee size={16} className="text-forest" />
                        <span className="font-bold">{activity.price || '—'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Manager ---
const ActivitiesManager = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const { data: destinations = [] } = useQuery({
        queryKey: ['destinations', 'all'],
        queryFn: async () => {
            const res = await apiClient.get('/destinations?limit=100');
            const dests = res.data.data || [];
            if (dests.length > 0 && !selectedDestId) {
                setSelectedDestId(dests[0].id);
            }
            return dests;
        }
    });

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities', selectedDestId],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${selectedDestId}/activities`);
            return res.data;
        },
        enabled: !!selectedDestId
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/activities/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['activities', selectedDestId])
    });

    const handleDelete = (id) => {
        if (window.confirm('Delete this activity?')) deleteMutation.mutate(id);
    };

    const openAdd = () => { setEditingActivity(null); setIsFormOpen(true); };
    const openEdit = (activity) => { setEditingActivity(activity); setIsFormOpen(true); };

    const filtered = activities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Activities</h1>
                    <p className="text-ink/60 font-medium">Manage thrills, culture, and nature experiences.</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Activity
                </button>
            </div>

            <div className="flex gap-4 flex-wrap items-center">
                <div className="relative group">
                    <label className="absolute -top-2 left-4 px-1 bg-cream text-[10px] font-bold uppercase tracking-widest text-ink/40 z-10">Destination</label>
                    <select value={selectedDestId} onChange={e => setSelectedDestId(e.target.value)} className="pl-4 pr-10 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 appearance-none font-bold text-ink shadow-sm min-w-[220px]">
                        {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
                </div>
                <div className="relative group flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input type="text" placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm" />
                </div>
            </div>

            {!selectedDestId ? (
                <div className="py-24 text-center text-ink/30">
                    <p className="font-bold text-lg">No destinations yet</p>
                    <p className="text-sm mt-1">Create a destination first, then add activities to it.</p>
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="card h-[250px] animate-pulse bg-white/50" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center text-center text-ink/30">
                    <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center mb-6 text-4xl">🏕️</div>
                    <p className="font-bold text-lg mb-2">No activities yet</p>
                    <p className="text-sm mb-6">Start by adding your first activity for this destination.</p>
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add First Activity</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((activity, i) => (
                        <ActivityCard key={activity.id} activity={activity} index={i} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isFormOpen && (
                    <ActivityForm
                        activity={editingActivity}
                        destinationId={selectedDestId}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActivitiesManager;
