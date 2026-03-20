import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Leaf, Trash2, Edit2, X, ChevronDown
} from 'lucide-react';
import apiClient from '../../services/apiClient';

// --- Food Form Modal ---
const FoodForm = ({ food, destinationId, onClose }) => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(food || {
        name: '',
        emoji: '🍲',
        mealType: 'BREAKFAST',
        price: '',
        dietaryTag: 'Veg',
        description: '',
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (food?.id) return await apiClient.patch(`/food/${food.id}`, data);
            return await apiClient.post('/food', { ...data, destinationId });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries(['food', destinationId]);
            onClose();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.error || err.message}`)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { alert('Food name is required.'); return; }
        mutation.mutate({ ...form, price: parseFloat(form.price) || 0 });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-ink">{food ? 'Edit' : 'Add'} Food Option</h2>
                        <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">Culinary Details</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <div className="space-y-1 w-20">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Emoji</label>
                            <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="w-full px-3 py-3 bg-ink/5 rounded-xl border-none outline-none text-center text-xl" placeholder="🍲" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Name *</label>
                            <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="e.g. Masala Dosa" />

                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Meal Type</label>
                            <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium">
                                <option value="BREAKFAST">Breakfast</option>
                                <option value="LUNCH">Lunch</option>
                                <option value="DINNER">Dinner</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹)</label>
                            <input type="number" value={form.price || ""} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium" placeholder="220" />

                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Dietary Tag</label>
                        <select value={form.dietaryTag} onChange={e => setForm({ ...form, dietaryTag: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium">
                            <option>Veg</option>
                            <option>Non-Veg</option>
                            <option>Vegan</option>
                            <option>Jain</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                        <textarea rows={2} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium resize-none" placeholder="Short description..." />

                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-ink/10 rounded-xl font-bold text-sm hover:bg-ink/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={mutation.isPending} className="flex-[2] btn-primary py-3 disabled:opacity-70">
                            {mutation.isPending ? 'Saving...' : food ? 'Save Changes' : 'Add Food Option'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const FoodCard = ({ food, index, onEdit, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="bg-white p-4 rounded-xl border border-ink/5 shadow-sm group hover:border-red/20 transition-all flex items-center gap-4"
    >
        <div className="w-12 h-12 bg-cream rounded-lg flex items-center justify-center text-xl shrink-0">{food.emoji || '🍲'}</div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-ink truncate">{food.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-forest uppercase tracking-widest flex items-center gap-0.5"><Leaf size={10} /> {food.dietaryTag || 'Veg'}</span>
                <span className="text-xs text-ink/40 font-bold">₹{food.price}</span>
            </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(food)} className="text-ink/30 hover:text-ink p-1"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(food.id)} className="text-ink/30 hover:text-red p-1"><Trash2 size={14} /></button>
        </div>
    </motion.div>
);

const FoodOptionsManager = () => {
    const queryClient = useQueryClient();
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [defaultMeal, setDefaultMeal] = useState('BREAKFAST');

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


    const { data: foodOptions = [], isLoading } = useQuery({
        queryKey: ['food', selectedDestId],
        queryFn: async () => {
            const res = await apiClient.get(`/food?destinationId=${selectedDestId}`);
            return res.data.data || [];
        },
        enabled: !!selectedDestId
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/food/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['food', selectedDestId])
    });

    const handleDelete = (id) => { if (window.confirm('Delete this food option?')) deleteMutation.mutate(id); };
    const openAdd = (meal) => { setDefaultMeal(meal); setEditingFood(null); setIsFormOpen(true); };
    const openEdit = (food) => { setEditingFood(food); setIsFormOpen(true); };

    const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Food Palette</h1>
                    <p className="text-ink/60 font-medium">Curate authentic culinary experiences per destination.</p>
                </div>
                <button onClick={() => openAdd('BREAKFAST')} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Food Option
                </button>
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
                    <p className="text-sm mt-1">Create a destination first to add food options.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {meals.map(meal => (
                        <div key={meal} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">{meal}</h3>
                                <span className="w-8 h-8 rounded-lg bg-white border border-ink/5 flex items-center justify-center text-xs font-bold text-ink/20">
                                    {foodOptions.filter(f => f.mealType === meal).length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {isLoading ? (
                                    [1, 2].map(i => <div key={i} className="h-20 bg-white/50 rounded-xl animate-pulse" />)
                                ) : (
                                    foodOptions.filter(f => f.mealType === meal).map((food, i) => (
                                        <FoodCard key={food.id} food={food} index={i} onEdit={openEdit} onDelete={handleDelete} />
                                    ))
                                )}
                                {!isLoading && (
                                    <button
                                        onClick={() => openAdd(meal)}
                                        className="w-full py-3 border-2 border-dashed border-ink/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-ink/30 hover:border-red/20 hover:text-red transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} />
                                        {foodOptions.filter(f => f.mealType === meal).length === 0 ? `Add first ${meal.toLowerCase()} option` : `Add more`}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isFormOpen && (
                    <FoodForm
                        food={editingFood ? { ...editingFood } : { mealType: defaultMeal }}
                        destinationId={selectedDestId}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodOptionsManager;
