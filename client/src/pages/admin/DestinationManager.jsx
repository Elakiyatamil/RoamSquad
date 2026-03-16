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
    Image as ImageIcon
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Clock, IndianRupee, Zap } from 'lucide-react';

const ActivityRow = ({ activity, onEdit, onDelete }) => (
    <div className="flex items-center gap-4 p-4 bg-ink/5 rounded-2xl group">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shrink-0">
            {activity.icon || '🏕️'}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-ink truncate">{activity.name}</h4>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-ink/40 mt-1">
                <span className="flex items-center gap-1"><Clock size={12} /> {activity.duration || '—'}</span>
                <span className="flex items-center gap-1"><IndianRupee size={12} /> {activity.price || '0'}</span>
            </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(activity)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-ink/40 hover:text-ink transition-all">
                <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(activity.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-ink/40 hover:text-red transition-all">
                <Trash2 size={14} />
            </button>
        </div>
    </div>
);

const DestinationForm = ({ destination, onClose }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('Basic Info');

    // Hierarchy States
    const [selectedCountry, setSelectedCountry] = useState(destination?.district?.state?.countryId || '');
    const [selectedState, setSelectedState] = useState(destination?.district?.stateId || '');
    const [selectedDistrict, setSelectedDistrict] = useState(destination?.districtId || '');

    const [formData, setFormData] = useState(destination || {
        name: '',
        slug: '',
        category: 'Nature',
        description: '',
        rating: 4.5,
        avgCost: '',
        bestSeason: '',
        images: []
    });

    const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [activityForm, setActivityForm] = useState({ name: '', duration: '', description: '', price: 0, icon: '🏕️', images: [] });

    // Fetch Hierarchy Data
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await apiClient.get('/countries');
            return res.data;
        }
    });

    const { data: states = [], isLoading: isStatesLoading, error: statesError } = useQuery({
        queryKey: ['states', selectedCountry],
        queryFn: async () => {
            console.log('Fetching states for country:', selectedCountry);
            const res = await apiClient.get(`/countries/${selectedCountry}/states`);
            console.log('Fetched states:', res.data);
            return res.data;
        },
        enabled: !!selectedCountry
    });

    const { data: districts = [], isLoading: isDistrictsLoading, error: districtsError } = useQuery({
        queryKey: ['districts', selectedState],
        queryFn: async () => {
            console.log('Fetching districts for state:', selectedState);
            const res = await apiClient.get(`/states/${selectedState}/districts`);
            console.log('Fetched districts:', res.data);
            return res.data;
        },
        enabled: !!selectedState
    });

    useEffect(() => {
        if (statesError) console.error('Error fetching states:', statesError);
        if (districtsError) console.error('Error fetching districts:', districtsError);
    }, [statesError, districtsError]);

    const { data: activities = [], refetch: refetchActivities } = useQuery({
        queryKey: ['activities', destination?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${destination.id}/activities`);
            return res.data;
        },
        enabled: !!destination?.id
    });

    const activityMutation = useMutation({
        mutationFn: async (data) => {
            if (editingActivity?.id) {
                return await apiClient.patch(`/activities/${editingActivity.id}`, data);
            }
            return await apiClient.post(`/destinations/${destination.id}/activities`, data);
        },
        onSuccess: () => {
            refetchActivities();
            setIsActivityFormOpen(false);
            setEditingActivity(null);
            setActivityForm({ name: '', duration: '', description: '', price: 0, icon: '🏕️', images: [] });
        }
    });

    const deleteActivityMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/activities/${id}`),
        onSuccess: () => refetchActivities()
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (destination?.id) {
                return await apiClient.patch(`/destinations/${destination.id}`, data);
            } else {
                return await apiClient.post(`/districts/${selectedDistrict}/destinations`, data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['destinations']);
            onClose();
        },
        onError: (err) => {
            alert('Failed to save destination. Please ensure all required fields are set and district is selected if new.');
        }
    });

    const handleSave = () => {
        if (!selectedDistrict && !destination?.id) {
            alert('Please select a District first.');
            return;
        }
        if (!formData.name || !formData.category || !formData.rating) {
            alert('Name, Category, and Rating are required.');
            return;
        }
        if (!formData.description) {
            alert('Description is required.');
            return;
        }
        // Image requirement temporarily disabled as per user request
        /*
        if (!formData.images || formData.images.length === 0) {
            alert('At least one image is required.');
            return;
        }
        */

        // Image requirement temporarily disabled as per user request
        const coverImage = (formData.images && formData.images.length > 0) 
            ? (formData.coverImage || formData.images[0]) 
            : null;

        saveMutation.mutate({
            ...formData,
            slug: slugToSave,
            coverImage,
            rating: parseFloat(formData.rating) || 0
        });
    };

    const tabs = ['Basic Info', 'Travel Details', 'Experiences', 'Accommodation', 'Images'];

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl z-[60] flex flex-col"
        >
            <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-cream/30">
                <div>
                    <h2 className="text-2xl font-bold text-ink">{destination ? 'Edit' : 'New'} Destination</h2>
                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Configuration Panel</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red/10 text-ink/40 hover:text-red transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="flex border-b border-ink/5 bg-white overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2
              ${activeTab === tab ? 'text-red border-red bg-red/5' : 'text-ink/40 border-transparent hover:text-ink'}
            `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'Basic Info' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Destination Name</label>
                            <input
                                type="text"
                                value={formData.name}
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
                                    <label className="text-xs font-bold text-ink/60">
                                        State {isStatesLoading && '(Loading...)'} {statesError && '(Error!)'}
                                    </label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                                        disabled={!selectedCountry || isStatesLoading}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium disabled:opacity-50"
                                    >
                                        <option value="">{isStatesLoading ? 'Loading states...' : 'Select State'}</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/60">
                                        District * {isDistrictsLoading && '(Loading...)'} {districtsError && '(Error!)'}
                                    </label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedState || isDistrictsLoading}
                                        className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none outline-none font-medium disabled:opacity-50"
                                    >
                                        <option value="">{isDistrictsLoading ? 'Loading districts...' : 'Select District'}</option>
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

                {activeTab === 'Experiences' && (
                    <div className="space-y-6">
                        {!destination ? (
                            <div className="py-12 text-center bg-ink/5 rounded-3xl">
                                <Zap size={32} className="mx-auto mb-4 text-ink/20" />
                                <p className="font-bold text-ink">Save the destination first</p>
                                <p className="text-xs text-ink/40 mt-1">Activities can be managed after the destination is created.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-ink">Destination Activities</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Manage Experiences</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setEditingActivity(null);
                                            setActivityForm({ name: '', duration: '', description: '', price: 0, icon: '🏕️', images: [] });
                                            setIsActivityFormOpen(true);
                                        }}
                                        className="w-10 h-10 bg-red text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {activities.length === 0 ? (
                                        <div className="py-12 text-center border-2 border-dashed border-ink/10 rounded-3xl">
                                            <p className="text-sm font-medium text-ink/40">No activities added yet.</p>
                                        </div>
                                    ) : (
                                        activities.map(act => (
                                            <ActivityRow 
                                                key={act.id} 
                                                activity={act} 
                                                onEdit={(a) => {
                                                    setEditingActivity(a);
                                                    setActivityForm({ ...a });
                                                    setIsActivityFormOpen(true);
                                                }}
                                                onDelete={(id) => {
                                                    if (window.confirm('Delete this activity?')) deleteActivityMutation.mutate(id);
                                                }}
                                            />
                                        ))
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isActivityFormOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="p-6 bg-cream border border-ink/5 rounded-3xl space-y-4 shadow-xl"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-ink">{editingActivity ? 'Edit' : 'Add'} Activity</h4>
                                                <button type="button" onClick={() => setIsActivityFormOpen(false)}><X size={16} /></button>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Icon</label>
                                                    <input 
                                                        value={activityForm.icon} 
                                                        onChange={e => setActivityForm({...activityForm, icon: e.target.value})}
                                                        className="w-full px-3 py-3 bg-white rounded-xl border-none outline-none text-center"
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Activity Name</label>
                                                    <input 
                                                        value={activityForm.name}
                                                        onChange={e => setActivityForm({...activityForm, name: e.target.value})}
                                                        className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium"
                                                        placeholder="e.g. Guided Walk"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration</label>
                                                    <input 
                                                        value={activityForm.duration}
                                                        onChange={e => setActivityForm({...activityForm, duration: e.target.value})}
                                                        className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium"
                                                        placeholder="e.g. 2 Hours"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (Approx)</label>
                                                    <input 
                                                        type="number"
                                                        value={activityForm.price}
                                                        onChange={e => setActivityForm({...activityForm, price: e.target.value})}
                                                        className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium"
                                                        placeholder="500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                                                <textarea 
                                                    rows={2}
                                                    value={activityForm.description}
                                                    onChange={e => setActivityForm({...activityForm, description: e.target.value})}
                                                    className="w-full px-4 py-3 bg-white rounded-xl border-none outline-none font-medium resize-none shadow-sm"
                                                    placeholder="Short tagline or description..."
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsActivityFormOpen(false)}
                                                    className="flex-1 py-3 bg-white border border-ink/5 rounded-xl font-bold text-xs"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        if (!activityForm.name) return alert('Name is required');
                                                        activityMutation.mutate({ ...activityForm, price: parseFloat(activityForm.price) || 0 });
                                                    }}
                                                    disabled={activityMutation.isPending}
                                                    className="flex-[2] btn-primary py-3 text-xs"
                                                >
                                                    {activityMutation.isPending ? 'Saving...' : 'Save Activity'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
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
                                        images: [...(prev.images || []), ...res.data.urls] 
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

            <div className="p-8 border-t border-ink/5 bg-cream/30 flex gap-4">
                <button onClick={onClose} className="flex-1 py-4 border border-ink/10 rounded-2xl font-bold text-ink hover:bg-white transition-colors">Discard</button>
                <button onClick={handleSave} disabled={saveMutation.isPending} className="flex-[2] btn-primary py-4 disabled:opacity-70">
                    {saveMutation.isPending ? 'Saving...' : 'Save Destination'}
                </button>
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

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['destinations', page, search],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations?page=${page}&limit=8&search=${search}`);
            return res.data;
        },
        keepPreviousData: true
    });

    const destinations = responseData?.data || [];
    const meta = responseData?.meta || { total: 0, totalPages: 1 };

    const deleteMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/destinations/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['destinations'])
    });

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
                        <button key={filter} className="px-5 py-2.5 rounded-xl bg-white border border-ink/5 font-bold text-sm text-ink/60 hover:text-red transition-all">
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
                                                <span className={`w-1.5 h-1.5 rounded-full ${dest.active !== false ? 'bg-forest' : 'bg-red'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${dest.active !== false ? 'text-forest' : 'text-red'}`}>
                                                    {dest.active !== false ? 'Active' : 'Draft'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
