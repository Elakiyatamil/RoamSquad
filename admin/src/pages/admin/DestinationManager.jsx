import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Star,
    MapPin,
    X,
    Upload,
    Image as ImageIcon,
    Globe,
    Clock,
    Utensils,
    Hotel,
    Info
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const DestinationForm = ({ destination, onClose }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('Basic Info');

    // Hierarchy States
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: 'Nature',
        description: '',
        rating: 4.5,
        avgCost: '',
        bestSeason: '',
        status: 'DRAFT',
        active: true,
        images: [],
        activities: [],
        accommodation: [],
        travelOptions: []
    });

    // Fetch Full Data if Editing
    const { data: fullDestination, isLoading: isLoadingFull } = useQuery({
        queryKey: ['destination-full', destination?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${destination.id}`);
            console.log("[DestinationForm] Full Destination Response:", res.data);
            return res.data.data;
        },
        enabled: !!destination?.id
    });

    // Sync full data to state
    useEffect(() => {
        if (fullDestination) {
            setFormData({
                ...fullDestination,
                activities: fullDestination.activities || [],
                accommodation: fullDestination.accommodation || [],
                travelOptions: fullDestination.travelOptions || []
            });
            setSelectedCountry(fullDestination.district?.state?.countryId || '');
            setSelectedState(fullDestination.district?.stateId || '');
            setSelectedDistrict(fullDestination.districtId || '');
        }
    }, [fullDestination]);

    // Fetch Hierarchy Data
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await apiClient.get('/countries');
            console.log("[DestinationForm] Countries Response:", res.data);
            return res.data.data || [];
        }
    });

    const { data: states = [] } = useQuery({
        queryKey: ['states', selectedCountry],
        queryFn: async () => {
            const res = await apiClient.get(`/countries/${selectedCountry}/states`);
            console.log("[DestinationForm] States Response:", res.data);
            return res.data.data || [];
        },
        enabled: !!selectedCountry
    });

    const { data: districts = [] } = useQuery({
        queryKey: ['districts', selectedState],
        queryFn: async () => {
            const res = await apiClient.get(`/states/${selectedState}/districts`);
            console.log("[DestinationForm] Districts Response:", res.data);
            return res.data.data || [];
        },
        enabled: !!selectedState
    });

    // Separate Mutations for each section
    const basicInfoMutation = useMutation({
        mutationFn: async (data) => {
            if (destination?.id) {
                return await apiClient.patch(`/destinations/${destination.id}`, data);
            } else {
                return await apiClient.post(`/districts/${selectedDistrict}/destinations`, data);
            }
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries(['destinations']);
            if (destination?.id) {
                queryClient.invalidateQueries(['destination-full', destination.id]);
            }
            if (!destination?.id) {
                alert('Destination created! You can now add activities, food, and stays.');
                onClose();
            } else {
                alert('Basic info updated!');
            }
        }
    });

    const activitiesMutation = useMutation({
        mutationFn: async (activities) => {
            // This is a bit tricky: do we save all at once or individually?
            // The instruction says "POST /api/activities". Usually means one by one.
            // But if we have an array locally, we can send it to a bulk endpoint if it exists,
            // or just iterate. Let's see if we can use the reorder endpoint or just create/update.
            // For now, let's assume we want to sync the whole list.
            return await apiClient.patch(`/destinations/${destination.id}/activities/reorder`, { order: activities.map(a => a.id) });
        },
        onSuccess: () => alert('Activities synced!')
    });

    const handleSaveBasicInfo = (publishNow = false) => {
        if (!selectedDistrict && !destination?.id) {
            alert('Please select a District first.');
            return;
        }
        if (!formData.name || !formData.category || !formData.rating) {
            alert('Name, Category, and Rating are required.');
            return;
        }

        const slugToSave = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const coverImage = formData.coverImage || (formData.images && formData.images.length > 0 ? formData.images[0] : null);

        basicInfoMutation.mutate({
            ...formData,
            status: publishNow ? 'ACTIVE' : (formData.status || 'DRAFT'),
            slug: slugToSave,
            coverImage,
            rating: parseFloat(formData.rating) || 0
        });
    };

    const tabs = ['Basic Info', 'Travel Details', 'Experiences', 'Food', 'Accommodation', 'Images'];

    // Local Mutation for nested items
    const addItem = (type, item) => {
        setFormData(prev => ({ ...prev, [type]: [...prev[type], item] }));
    };

    const updateItem = (type, index, item) => {
        setFormData(prev => {
            const newList = [...prev[type]];
            newList[index] = item;
            return { ...prev, [type]: newList };
        });
    };

    const removeItem = (type, index) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    if (isLoadingFull) return (
        <div className="fixed inset-y-0 right-0 w-full max-w-[600px] bg-white shadow-2xl z-[60] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red/10 border-t-red rounded-full animate-spin" />
                <p className="text-sm font-bold text-ink/40 uppercase tracking-widest">Loading Configuration...</p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[600px] bg-white shadow-2xl z-[60] flex flex-col"
        >
            <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-cream/30">
                <div>
                    <h2 className="text-2xl font-bold text-ink">{destination ? 'Edit' : 'New'} Destination</h2>
                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Master Configuration Panel</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="flex border-b border-ink/5 bg-white overflow-x-auto no-scrollbar scroll-smooth">
                {tabs.map(tab => {
                    const getIcon = () => {
                        switch(tab) {
                            case 'Basic Info': return <Info size={14} />;
                            case 'Travel Details': return <Globe size={14} />;
                            case 'Experiences': return <Star size={14} />;
                            case 'Food': return <Utensils size={14} />;
                            case 'Accommodation': return <Hotel size={14} />;
                            case 'Images': return <ImageIcon size={14} />;
                            default: return null;
                        }
                    };
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            disabled={!destination?.id && tab !== 'Basic Info'}
                            className={`
                                px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b-2 flex items-center gap-2
                                ${activeTab === tab ? 'text-red border-red bg-red/5' : 'text-ink/40 border-transparent hover:text-ink'}
                                ${!destination?.id && tab !== 'Basic Info' ? 'opacity-30 cursor-not-allowed' : ''}
                            `}
                        >
                            {getIcon()}
                            {tab}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'Basic Info' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Destination Name</label>
                            <input
                                type="text"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Coorg Coffee Estate"
                                className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none focus:ring-4 focus:ring-red/5 outline-none font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium"
                                >
                                    <option value="Nature">Nature</option>
                                    <option value="Heritage">Heritage</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Relaxation">Relaxation</option>
                                    <option value="City">City</option>
                                    <option value="Beach">Beach</option>
                                    <option value="Mountains">Mountains</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-bold text-red"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Rating (0-5)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    max="5"
                                    min="0"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium"
                                />
                            </div>
                        </div>

                        {!destination && (
                            <div className="space-y-4 pt-4 border-t border-ink/5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Location Hierarchy</p>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/60">Country</label>
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(''); setSelectedDistrict(''); }}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/60">State</label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                                        disabled={!selectedCountry}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium disabled:opacity-50"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/60">District *</label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedState}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium disabled:opacity-50"
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the beauty and attractions..."
                                className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none focus:ring-4 focus:ring-red/5 outline-none font-medium resize-none"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'Travel Details' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Available Travel Options</p>
                            <button 
                                onClick={() => addItem('travelOptions', { mode: 'Road', cost: 0, duration: '1h', description: '' })}


                                className="text-[10px] font-bold uppercase tracking-widest text-red flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Add Mode
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.travelOptions.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-ink/5 rounded-2xl flex flex-col items-center justify-center text-ink/20">
                                    <p className="text-sm font-bold">No travel options added yet.</p>
                                </div>
                            ) : formData.travelOptions.map((opt, i) => (
                                <div key={i} className="p-5 bg-ink/5 rounded-2xl space-y-4 relative group">
                                    <button 
                                        onClick={() => removeItem('travelOptions', i)}
                                        className="absolute top-4 right-4 text-ink/20 hover:text-red transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Mode</label>
                                            <select 
                                                value={opt.mode || "Road"} 
                                                onChange={(e) => updateItem('travelOptions', i, { ...opt, mode: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            >
                                                <option>Road</option>
                                                <option>Flight</option>
                                                <option>Train</option>
                                                <option>Boat</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Cost (₹)</label>
                                            <input 
                                                type="number"
                                                value={opt.cost || 0}
                                                onChange={(e) => updateItem('travelOptions', i, { ...opt, cost: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                                placeholder="e.g. 1500"
                                            />
                                        </div>

                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration & Description</label>
                                        <div className="flex gap-2">
                                            <input 
                                                value={opt.duration || ""}
                                                onChange={(e) => updateItem('travelOptions', i, { ...opt, duration: e.target.value })}
                                                className="w-[100px] px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                                placeholder="e.g. 4h"
                                            />
                                            <input 
                                                value={opt.description || ""}
                                                onChange={(e) => updateItem('travelOptions', i, { ...opt, description: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-medium"
                                                placeholder="Distance or specific transport details..."
                                            />
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-ink/5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Best Season</label>
                                    <input 
                                        value={formData.bestSeason || ""}
                                        onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium"
                                        placeholder="e.g. Oct to Mar"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Avg Cost / Person</label>
                                    <input 
                                        value={formData.avgCost || ""}
                                        onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium"
                                        placeholder="e.g. ₹5,000 - ₹10,000"
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Experiences' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Top Activities</p>
                            <button 
                                onClick={() => addItem('activities', { name: '', description: '', price: 0, duration: '', icon: '🏕️' })}
                                className="text-[10px] font-bold uppercase tracking-widest text-red flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Add Activity
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.activities.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-ink/5 rounded-2xl flex flex-col items-center justify-center text-ink/20">
                                    <p className="text-sm font-bold">No activities added yet.</p>
                                </div>
                            ) : formData.activities.map((act, i) => (
                                <div key={i} className="p-6 bg-ink/5 rounded-3xl space-y-4 relative">
                                    <button 
                                        onClick={() => removeItem('activities', i)}
                                        className="absolute top-4 right-4 text-ink/20 hover:text-red transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl border border-ink/5">
                                            <input 
                                                value={act.icon || "🏕️"}
                                                onChange={(e) => updateItem('activities', i, { ...act, icon: e.target.value })}
                                                className="w-full text-center bg-transparent border-none outline-none"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Activity Name</label>
                                            <input 
                                                value={act.name || ""}
                                                onChange={(e) => updateItem('activities', i, { ...act, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                                placeholder="Activity Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration</label>
                                            <input 
                                                value={act.duration || ""}
                                                onChange={(e) => updateItem('activities', i, { ...act, duration: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-medium"
                                                placeholder="e.g. 2 Hours"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹)</label>
                                            <input 
                                                type="number"
                                                value={act.price || 0}
                                                onChange={(e) => updateItem('activities', i, { ...act, price: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            />
                                        </div>

                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Short Description</label>
                                        <textarea 
                                            rows={2}
                                            value={act.description || ""}
                                            onChange={(e) => updateItem('activities', i, { ...act, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border-none outline-none text-sm font-medium resize-none"
                                            placeholder="What makes this experience special?"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Food' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Local Cuisine & Food Options</p>
                            <button 
                                onClick={() => addItem('foodOptions', { name: '', description: '', price: 0, type: 'Local Special', icon: '🍲', isActive: true })}

                                className="text-[10px] font-bold uppercase tracking-widest text-red flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Add Food
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(formData.foodOptions || []).length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-ink/5 rounded-2xl flex flex-col items-center justify-center text-ink/20">
                                    <p className="text-sm font-bold">No food options added yet.</p>
                                </div>
                            ) : formData.foodOptions.map((food, i) => (
                                <div key={i} className="p-6 bg-ink/5 rounded-3xl space-y-4 relative">
                                    <button 
                                        onClick={() => removeItem('foodOptions', i)}
                                        className="absolute top-4 right-4 text-ink/20 hover:text-red transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl border border-ink/5">
                                            <input 
                                                value={food.icon || "🍲"}
                                                onChange={(e) => updateItem('foodOptions', i, { ...food, icon: e.target.value })}
                                                className="w-full text-center bg-transparent border-none outline-none"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Food / Dish Name</label>
                                            <input 
                                                value={food.name || ""}
                                                onChange={(e) => updateItem('foodOptions', i, { ...food, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                                placeholder="e.g. Pandi Curry"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Meal Type</label>
                                            <select 
                                                value={food.type || "Local Special"}
                                                onChange={(e) => updateItem('foodOptions', i, { ...food, type: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-medium"
                                            >
                                                <option>Breakfast</option>
                                                <option>Lunch</option>
                                                <option>Dinner</option>
                                                <option>Snack</option>
                                                <option>Local Special</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Avg Price (₹)</label>
                                            <input 
                                                type="number"
                                                value={food.price || 0}
                                                onChange={(e) => updateItem('foodOptions', i, { ...food, price: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Short Description</label>
                                        <textarea 
                                            rows={2}
                                            value={food.description || ""}
                                            onChange={(e) => updateItem('foodOptions', i, { ...food, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border-none outline-none text-sm font-medium resize-none"
                                            placeholder="Tastes like..."
                                        />
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Accommodation' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Stay Tiers</p>
                            <button 
                                onClick={() => addItem('accommodation', { tier: 'Budget', stars: 3, price: 0, description: '', hotelNameInternal: '', includes: [] })}

                                className="text-[10px] font-bold uppercase tracking-widest text-red flex items-center gap-1 hover:underline"
                            >

                                <Plus size={14} /> Add Tier
                            </button>

                        </div>

                        <div className="space-y-6">
                            {formData.accommodation.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-ink/5 rounded-2xl flex flex-col items-center justify-center text-ink/20">
                                    <p className="text-sm font-bold">No accommodation data yet.</p>
                                </div>
                            ) : formData.accommodation.map((acc, i) => (
                                <div key={i} className="p-6 bg-ink/5 rounded-3xl space-y-4 relative border border-ink/5">
                                    <button 
                                        onClick={() => removeItem('accommodation', i)}
                                        className="absolute top-4 right-4 text-ink/20 hover:text-red transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Tier</label>
                                            <select 
                                                value={acc.tier}
                                                onChange={(e) => updateItem('accommodation', i, { ...acc, tier: e.target.value })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            >
                                                <option>Budget</option>
                                                <option>Comfort</option>
                                                <option>Luxury</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Stars</label>
                                            <select 
                                                value={acc.stars || 3}
                                                onChange={(e) => updateItem('accommodation', i, { ...acc, stars: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            >

                                                {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Stars</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price / Night (₹)</label>
                                        <input 
                                            type="number"
                                            value={acc.price || 0}
                                            onChange={(e) => updateItem('accommodation', i, { ...acc, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                        />
                                    </div>


                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                                        <textarea 
                                            rows={2}
                                            value={acc.description || ""}
                                            onChange={(e) => updateItem('accommodation', i, { ...acc, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-xl border-none outline-none text-sm font-medium resize-none"
                                            placeholder="e.g. Eco-friendly riverside camping..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Hotel Name (Private)</label>
                                        <input 
                                            value={acc.hotelNameInternal || ""}
                                            onChange={(e) => updateItem('accommodation', i, { ...acc, hotelNameInternal: e.target.value })}
                                            className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-bold"
                                            placeholder="Internal reference name"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Inclusions (comma separated)</label>
                                        <input 
                                            value={(acc.includes || []).join(', ')}
                                            onChange={(e) => updateItem('accommodation', i, { ...acc, includes: e.target.value.split(',').map(s => s.trim()) })}
                                            className="w-full px-3 py-2 bg-white rounded-lg border-none outline-none text-sm font-medium"
                                            placeholder="WiFi, Pool, Breakfast"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Images' && (
                    <div className="space-y-6">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            id="destination-images"
                            className="hidden"
                            onChange={async (e) => {
                                const files = Array.from(e.target.files);
                                if (!files.length) return;
                                
                                const uploadData = new FormData();
                                files.forEach(file => uploadData.append('images', file));
                                
                                try {
                                    const res = await apiClient.post('/upload/multiple', uploadData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        images: [...(prev.images || []), ...res.data.data.urls] 
                                    }));
                                } catch (err) {
                                    alert('Failed to upload images.');
                                }
                            }}
                        />
                        <label 
                            htmlFor="destination-images"
                            className="w-full aspect-video border-2 border-dashed border-ink/10 rounded-3xl flex flex-col items-center justify-center group hover:border-red/20 cursor-pointer transition-all"
                        >
                            <div className="w-16 h-16 bg-red/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-red" />
                            </div>
                            <p className="font-bold text-ink mb-1">Upload Images</p>
                            <p className="text-xs text-ink/40 font-medium text-center px-8">Click to upload. Max 5MB per image. (WEBP, PNG, JPG)</p>
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            {(formData.images || []).map((img, i) => (
                                <div key={i} className="aspect-square bg-ink/5 rounded-2xl relative group overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => {
                                                const newImages = [...formData.images];
                                                newImages.splice(i, 1);
                                                setFormData({ ...formData, images: newImages });
                                            }}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                // Make this image the cover (first in array)
                                                const newImages = [...formData.images];
                                                const selected = newImages.splice(i, 1)[0];
                                                newImages.unshift(selected);
                                                setFormData({ ...formData, images: newImages, coverImage: selected });
                                            }}
                                            className={`p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ${i === 0 || formData.coverImage === img ? 'text-yellow-400' : 'text-white'}`}
                                            title="Set as Cover Image"
                                        >
                                            <Star size={16} />
                                        </button>
                                    </div>
                                    {(i === 0 || formData.coverImage === img) && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-ink text-[10px] font-bold px-2 py-1 rounded">COVER</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 border-t border-ink/5 bg-cream/30 flex gap-4 sticky bottom-0">
                <button onClick={onClose} className="flex-1 py-4 border border-ink/10 rounded-2xl font-bold text-ink hover:bg-white transition-colors">Discard</button>
                
                {activeTab === 'Basic Info' ? (
                    <>
                        {formData.status !== 'ACTIVE' && (
                            <button onClick={() => handleSaveBasicInfo(true)} disabled={basicInfoMutation.isPending} className="flex-1 py-4 border border-red/20 rounded-2xl font-bold text-red hover:bg-red/5 transition-colors">Save & Publish</button>
                        )}
                        <button onClick={() => handleSaveBasicInfo(false)} disabled={basicInfoMutation.isPending} className="flex-[2] btn-primary py-4 disabled:opacity-70">
                            {basicInfoMutation.isPending ? 'Syncing...' : 'Save Basic Info'}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={async (e) => {
                            const btn = e.currentTarget;
                            const originalText = btn.innerText;
                            btn.innerText = 'Syncing...';
                            btn.disabled = true;
                            
                            try {
                                const endpointMapping = {
                                    'Travel Details': { path: 'travel-options', type: 'travelOptions' },
                                    'Experiences': { path: 'activities', type: 'activities' },
                                    'Food': { path: 'food', type: 'foodOptions' },
                                    'Accommodation': { path: 'accommodation', type: 'accommodation' }
                                };
                                
                                const { path, type } = endpointMapping[activeTab];
                                const items = formData[type] || [];

                                const results = await Promise.all(items.map(item => {
                                    if (item.id) {
                                        // Update existing
                                        return apiClient.patch(`/${path}/${item.id}`, item).then(res => res.data);
                                    } else {
                                        // Create new
                                        return apiClient.post(`/${path}`, { ...item, destinationId: destination.id }).then(res => res.data);
                                    }
                                }));

                                // Immediately update local state with saved objects (prevents empty ID renders)
                                setFormData(prev => ({
                                    ...prev,
                                    [type]: results
                                }));

                                alert(`${activeTab} updated successfully!`);
                                queryClient.invalidateQueries(['destination-full', destination.id]);

                            } catch (err) {
                                console.error(err);
                                alert(`Failed to save ${activeTab}: ` + (err.response?.data?.error || err.message));
                            } finally {
                                btn.innerText = originalText;
                                btn.disabled = false;
                            }
                        }}
                        className="flex-[2] btn-primary py-4 disabled:opacity-70"
                    >
                        Save {activeTab}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const DestinationManager = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDestination, setEditingDestination] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['destinations', page, search, statusFilter],
        queryFn: async () => {
            const statusParam = statusFilter !== 'All' ? `&status=${statusFilter.toUpperCase()}` : '';
            const res = await apiClient.get(`/destinations?page=${page}&limit=10&search=${search}${statusParam}`);
            console.log("[DestinationManager] List View Response:", res.data);
            return res.data.data; // this contains { data, meta }
        },
        keepPreviousData: true
    });

    const destinations = responseData?.data || [];
    const meta = responseData?.meta || { total: 0, totalPages: 1 };

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/destinations/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['destinations'])
    });

    const publishMutation = useMutation({
        mutationFn: async (id) => await apiClient.patch(`/destinations/${id}`, { status: 'ACTIVE' }),
        onSuccess: () => queryClient.invalidateQueries(['destinations'])
    });

    const handlePublish = (e, id) => {
        e.stopPropagation();
        publishMutation.mutate(id);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this destination?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-display font-bold text-ink mb-2">Destinations</h1>
                    <p className="text-ink/60 font-medium">Manage curated travel spots across the world structure.</p>
                </div>
                <button onClick={() => { setEditingDestination(null); setIsFormOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Add Destination
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:max-w-md group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, category, or path..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    {['All', 'Active', 'Draft'].map(filter => (
                        <button 
                            key={filter} 
                            onClick={() => { setStatusFilter(filter); setPage(1); }}
                            className={`px-5 py-2.5 rounded-xl border border-ink/5 font-bold text-sm transition-all ${statusFilter === filter ? 'bg-red text-white shadow-lg shadow-red/20' : 'bg-white text-ink/60 hover:text-red'}`}
                        >
                            {filter}
                        </button>
                    ))}
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-ink/5 rounded-xl text-ink/40 hover:text-red transition-all">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-ink/5 text-[10px] font-bold uppercase tracking-widest text-ink/40 border-b border-ink/5">
                                <th className="px-6 py-4">Cover</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Path</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="w-12 h-12 bg-ink/5 rounded-xl" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-ink/5 rounded w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-ink/5 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-ink/5 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-ink/5 rounded w-8" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-ink/5 rounded w-16" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-ink/5 rounded w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : destinations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mb-4">
                                                <MapPin size={24} className="text-ink/20" />
                                            </div>
                                            <p className="font-bold text-ink mb-1">Start by adding your first destination.</p>
                                            <p className="text-xs text-ink/40 font-medium">Capture the essence of a new location to build your travel ecosystem.</p>
                                            <button onClick={() => { setEditingDestination(null); setIsFormOpen(true); }} className="mt-6 text-xs font-bold uppercase tracking-widest text-red hover:underline">Add Destination Now</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                destinations.map((dest, i) => (
                                    <motion.tr
                                        key={dest.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="hover:bg-ink/[0.02] cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 bg-ink/5 rounded-xl overflow-hidden shadow-sm">
                                                {dest.coverImage ? (
                                                    <img src={dest.coverImage} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-ink/10"><ImageIcon size={20} /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-ink leading-tight">{dest.name}</p>
                                            <p className="text-[10px] text-ink/40 font-bold uppercase tracking-tighter mt-0.5">{dest.slug}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-ink/40 italic">
                                            {dest.district?.name} / {dest.district?.state?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-ink/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-ink/60">
                                                {dest.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gold font-bold text-sm">
                                                <Star size={12} fill="currentColor" /> {dest.rating || 4.5}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${dest.status === 'ACTIVE' ? 'bg-forest' : 'bg-red'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${dest.status === 'ACTIVE' ? 'text-forest' : 'text-red'}`}>
                                                    {dest.status || 'DRAFT'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {dest.status !== 'ACTIVE' && (
                                                    <button 
                                                        onClick={(e) => handlePublish(e, dest.id)}
                                                        disabled={publishMutation.isPending}
                                                        className="px-3 py-1 bg-forest/10 hover:bg-forest text-forest hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all mr-2"
                                                    >
                                                        Publish
                                                    </button>
                                                )}
                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/40 hover:text-ink transition-all">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingDestination(dest); setIsFormOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/40 hover:text-red transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={(e) => handleDelete(e, dest.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/40 hover:text-red transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <MoreVertical size={16} className="text-ink/20 group-hover:hidden ml-auto" />
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-ink/[0.02] border-t border-ink/5 flex items-center justify-between">
                    <p className="text-xs text-ink/40 font-bold uppercase tracking-widest">
                        Showing {destinations.length} of {meta.total || 0} destinations
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="w-10 h-10 border border-ink/10 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(meta.totalPages || 1)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i + 1 ? 'bg-red text-white shadow-lg shadow-red/20' : 'text-ink/40 hover:bg-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={page === meta.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="w-10 h-10 border border-ink/10 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                        />
                        <DestinationForm
                            destination={editingDestination}
                            onClose={() => setIsFormOpen(false)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DestinationManager;
