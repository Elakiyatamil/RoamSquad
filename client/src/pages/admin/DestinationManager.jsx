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
    UtensilsCrossed,
    Hotel,
    Zap,
    Globe,
    Calendar,
    DollarSign,
    Clock,
    Check,
    IndianRupee
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import SearchableSelect from '../../components/ui/SearchableSelect';

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
    const [errors, setErrors] = useState({});

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

    const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [foodForm, setFoodForm] = useState({ name: '', emoji: '🍲', mealType: 'BREAKFAST', price: 0, dietaryTag: 'Veg', description: '' });

    const [isAccommodationFormOpen, setIsAccommodationFormOpen] = useState(false);
    const [editingAccommodation, setEditingAccommodation] = useState(null);
    const [accommodationForm, setAccommodationForm] = useState({ tier: 'Budget', stars: 3, pricePerNight: 0, vibeDescription: '', includes: '', imageUrl: '' });

    const [isTravelFormOpen, setIsTravelFormOpen] = useState(false);
    const [editingTravel, setEditingTravel] = useState(null);
    const [travelForm, setTravelForm] = useState({ mode: '', icon: '🚗', description: '', estimatedCost: '', durationMins: 30 });

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

    const { data: foodOptions = [], refetch: refetchFood } = useQuery({
        queryKey: ['food', destination?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${destination.id}/food`);
            return res.data;
        },
        enabled: !!destination?.id
    });

    const { data: accommodations = [], refetch: refetchAccommodation } = useQuery({
        queryKey: ['accommodation', destination?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${destination.id}/accommodation`);
            return res.data;
        },
        enabled: !!destination?.id
    });

    const { data: travelOptions = [], refetch: refetchTravel } = useQuery({
        queryKey: ['travel-options', destination?.id],
        queryFn: async () => {
            const res = await apiClient.get(`/destinations/${destination.id}/travel-options`);
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

    // --- Travel Options Mutations ---
    const travelMutation = useMutation({
        mutationFn: async (data) => {
            if (editingTravel?.id) return await apiClient.patch(`/travel-options/${editingTravel.id}`, data);
            return await apiClient.post(`/destinations/${destination.id}/travel-options`, data);
        },
        onSuccess: () => {
            refetchTravel();
            setIsTravelFormOpen(false);
            setEditingTravel(null);
        }
    });

    const deleteTravelMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/travel-options/${id}`),
        onSuccess: () => refetchTravel()
    });

    // --- Food Options Mutations ---
    const foodMutation = useMutation({
        mutationFn: async (data) => {
            if (editingFood?.id) return await apiClient.patch(`/food/${editingFood.id}`, data);
            return await apiClient.post(`/destinations/${destination.id}/food`, data);
        },
        onSuccess: () => {
            refetchFood();
            setIsFoodFormOpen(false);
            setEditingFood(null);
        }
    });

    const deleteFoodMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/food/${id}`),
        onSuccess: () => {
            refetchFood();
            setErrors({});
        }
    });

    const categories = [
        { value: 'Nature', name: 'Nature' },
        { value: 'Heritage', name: 'Heritage' },
        { value: 'Adventure', name: 'Adventure' },
        { value: 'Relaxation', name: 'Relaxation' },
        { value: 'City', name: 'City' },
        { value: 'Beach', name: 'Beach' },
        { value: 'Mountains', name: 'Mountains' }
    ];

    // --- Accommodation Mutations ---
    const accommodationMutation = useMutation({
        mutationFn: async (data) => {
            if (editingAccommodation?.id) return await apiClient.patch(`/accommodation/${editingAccommodation.id}`, data);
            return await apiClient.post(`/destinations/${destination.id}/accommodation`, data);
        },
        onSuccess: () => {
            refetchAccommodation();
            setIsAccommodationFormOpen(false);
            setEditingAccommodation(null);
        }
    });

    const deleteAccommodationMutation = useMutation({
        mutationFn: async (id) => await apiClient.delete(`/accommodation/${id}`),
        onSuccess: () => refetchAccommodation()
    });

    const handleSave = () => {
        const newErrors = {};
        if (!selectedDistrict && !destination?.id) newErrors.district = 'Required';
        if (!formData.name) newErrors.name = 'Required';
        if (!formData.category) newErrors.category = 'Required';
        if (!formData.description) newErrors.description = 'Required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setActiveTab('Basic Info');
            return;
        }

        setErrors({});
        // Image requirement temporarily disabled as per user request
        /*
        if (!formData.images || formData.images.length === 0) {
            alert('At least one image is required.');
            return;
        }
        */

        const slugToSave = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

    const tabs = ['Basic Info', 'Travel Details', 'Experiences', 'Food', 'Accommodation', 'Images'];

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
                            <SearchableSelect
                                label="Category"
                                options={categories}
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                error={errors.category}
                            />
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

                        <div className="space-y-4 pt-4 border-t border-ink/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Location Hierarchy</p>

                            <SearchableSelect
                                label="Country"
                                options={countries}
                                value={selectedCountry}
                                onChange={(val) => { setSelectedCountry(val); setSelectedState(''); setSelectedDistrict(''); }}
                                placeholder="Select Country"
                            />
                            <SearchableSelect
                                label={`State ${isStatesLoading ? '(Loading...)' : ''}`}
                                options={states}
                                value={selectedState}
                                onChange={(val) => { setSelectedState(val); setSelectedDistrict(''); }}
                                placeholder="Select State"
                                disabled={!selectedCountry}
                                loading={isStatesLoading}
                            />
                            <SearchableSelect
                                label={`District * ${isDistrictsLoading ? '(Loading...)' : ''}`}
                                options={districts}
                                value={selectedDistrict}
                                onChange={(val) => setSelectedDistrict(val)}
                                placeholder="Select District"
                                disabled={!selectedState}
                                loading={isDistrictsLoading}
                                error={errors.district}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the beauty and attractions..."
                                className={`w-full px-4 py-3 bg-ink/5 rounded-xl border-2 focus:ring-4 focus:ring-red/5 outline-none font-medium resize-none transition-all ${errors.description ? 'border-red/50 bg-red/5' : 'border-transparent'}`}
                            />
                            {errors.description && <p className="text-[10px] text-red font-bold uppercase tracking-wider">{errors.description}</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'Travel Details' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Average Cost (Per Person)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={formData.avgCost || ''}
                                        onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                                        placeholder="5000"
                                        className="w-full pl-8 pr-4 py-3 bg-ink/5 rounded-xl border-none font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Best Season to Visit</label>
                                <input
                                    type="text"
                                    value={formData.bestSeason || ''}
                                    onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                                    placeholder="Oct to Mar"
                                    className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {!destination ? (
                                <div className="py-12 text-center bg-ink/5 rounded-3xl">
                                    <Clock size={32} className="mx-auto mb-4 text-ink/20" />
                                    <p className="font-bold text-ink">Save the destination first</p>
                                    <p className="text-xs text-ink/40 mt-1">Travel options can be managed after the destination is created.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold">Travel Options</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEditingTravel(null);
                                                setTravelForm({ mode: '', icon: '🚗', description: '', estimatedCost: '', durationMins: 30 });
                                                setIsTravelFormOpen(true);
                                            }}
                                            className="btn-secondary text-xs py-2 px-4"
                                        >
                                            <Plus size={14} className="inline mr-1" /> Add Option
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {travelOptions.length === 0 ? (
                                            <p className="text-sm text-ink/30 italic py-4 text-center border-2 border-dashed border-ink/5 rounded-2xl">No travel options configured.</p>
                                        ) : (
                                            travelOptions.map(opt => (
                                                <div key={opt.id} className="p-4 bg-ink/5 rounded-2xl flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-2xl">{opt.icon || '🚗'}</div>
                                                        <div>
                                                            <h5 className="font-bold text-sm">{opt.mode}</h5>
                                                            <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{opt.estimatedCost} • {opt.durationMins} mins</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => { setEditingTravel(opt); setTravelForm(opt); setIsTravelFormOpen(true); }} className="p-2 hover:bg-ink/10 rounded-lg text-ink/40"><Edit2 size={14} /></button>
                                                        <button type="button" onClick={() => { if(confirm('Delete?')) deleteTravelMutation.mutate(opt.id); }} className="p-2 hover:bg-red/10 rounded-lg text-red/40"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
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
                                                        activityMutation.mutate({ 
                                                            ...activityForm, 
                                                            price: parseInt(activityForm.price) || 0 
                                                        });
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

                {activeTab === 'Food' && (
                    <div className="space-y-6">
                        {!destination ? (
                            <div className="py-12 text-center bg-ink/5 rounded-3xl">
                                <UtensilsCrossed size={32} className="mx-auto mb-4 text-ink/20" />
                                <p className="font-bold text-ink">Save the destination first</p>
                                <p className="text-xs text-ink/40 mt-1">Food options can be managed after the destination is created.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-ink">Food Palette</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => { setEditingFood(null); setFoodForm({ name: '', emoji: '🍲', mealType: 'BREAKFAST', price: 0, dietaryTag: 'Veg', description: '' }); setIsFoodFormOpen(true); }}
                                        className="btn-primary text-xs py-2"
                                    >
                                        <Plus size={14} className="inline mr-1" /> Add Food
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {foodOptions.length === 0 ? (
                                        <div className="p-12 text-center border-2 border-dashed border-ink/10 rounded-3xl text-ink/20">
                                            <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-bold">No food options added.</p>
                                        </div>
                                    ) : (
                                        foodOptions.map(food => (
                                            <div key={food.id} className="p-4 bg-white border border-ink/5 rounded-2xl flex items-center gap-4 group hover:border-red/20 transition-all">
                                                <div className="text-2xl w-12 h-12 bg-ink/5 rounded-xl flex items-center justify-center">{food.emoji}</div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-sm">{food.name}</h5>
                                                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{food.mealType} • ₹{food.price} • {food.dietaryTag}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={() => { setEditingFood(food); setFoodForm(food); setIsFoodFormOpen(true); }} className="p-2 hover:bg-ink/5 rounded-lg text-ink/30"><Edit2 size={14} /></button>
                                                    <button type="button" onClick={() => { if(confirm('Delete?')) deleteFoodMutation.mutate(food.id); }} className="p-2 hover:bg-red/5 rounded-lg text-red/40"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Accommodation' && (
                    <div className="space-y-6">
                        {!destination ? (
                            <div className="py-12 text-center bg-ink/5 rounded-3xl">
                                <Hotel size={32} className="mx-auto mb-4 text-ink/20" />
                                <p className="font-bold text-ink">Save the destination first</p>
                                <p className="text-xs text-ink/40 mt-1">Accommodation can be managed after the destination is created.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-ink">Stay Tiers</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => { setEditingAccommodation(null); setAccommodationForm({ tier: 'Budget', stars: 3, pricePerNight: 0, vibeDescription: '', includes: '' }); setIsAccommodationFormOpen(true); }}
                                        className="btn-primary text-xs py-2"
                                    >
                                        <Plus size={14} className="inline mr-1" /> Add Tier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {accommodations.length === 0 ? (
                                        <div className="col-span-2 p-12 text-center border-2 border-dashed border-ink/10 rounded-3xl text-ink/20">
                                            <Hotel size={32} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-sm font-bold">No stay tiers configured.</p>
                                        </div>
                                    ) : (
                                        accommodations.map(acc => (
                                            <div key={acc.id} className="p-5 bg-white border border-ink/5 rounded-2xl group hover:border-red/20 transition-all flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="px-3 py-1 bg-ink/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-ink/60">{acc.tier}</div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => { setEditingAccommodation(acc); setAccommodationForm({ ...acc, includes: Array.isArray(acc.includes) ? acc.includes.join(', ') : acc.includes }); setIsAccommodationFormOpen(true); }} className="p-2 hover:bg-ink/5 rounded-lg text-ink/30"><Edit2 size={14} /></button>
                                                        <button type="button" onClick={() => { if(confirm('Delete?')) deleteAccommodationMutation.mutate(acc.id); }} className="p-2 hover:bg-red/5 rounded-lg text-red/40"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-lg">₹{acc.pricePerNight} <span className="text-xs font-medium text-ink/40">/ night</span></h4>
                                                <div className="flex text-gold">
                                                    {[...Array(acc.stars)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                                </div>
                                                <p className="text-xs text-ink/60 line-clamp-2">{acc.vibeDescription}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
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
                {/* Accommodation Form Modal */}
                <AnimatePresence>
                    {isAccommodationFormOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAccommodationFormOpen(false)} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10 max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-6">{editingAccommodation ? 'Edit' : 'Add'} Stay Tier</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Tier"
                                            options={[
                                                { value: 'Standard', name: 'Standard' },
                                                { value: 'Premium', name: 'Premium' },
                                                { value: 'Luxury', name: 'Luxury' },
                                                { value: 'Budget', name: 'Budget' },
                                                { value: 'Mid-range', name: 'Mid-range' }
                                            ]}
                                            value={accommodationForm.tier}
                                            onChange={(val) => setAccommodationForm({ ...accommodationForm, tier: val })}
                                        />
                                        <SearchableSelect
                                            label="Stars"
                                            options={[1,2,3,4,5].map(s => ({ value: s, name: `${s} Stars` }))}
                                            value={accommodationForm.stars}
                                            onChange={(val) => setAccommodationForm({ ...accommodationForm, stars: val })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price Per Night (₹)</label>
                                        <input type="number" value={accommodationForm.pricePerNight} onChange={e => setAccommodationForm({...accommodationForm, pricePerNight: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Vibe Description</label>
                                        <textarea rows={2} value={accommodationForm.vibeDescription} onChange={e => setAccommodationForm({...accommodationForm, vibeDescription: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium resize-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Includes (comma separated)</label>
                                        <input value={accommodationForm.includes} onChange={e => setAccommodationForm({...accommodationForm, includes: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" placeholder="WiFi, Breakfast, etc." />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsAccommodationFormOpen(false)} className="flex-1 py-3 bg-ink/5 rounded-xl font-bold">Cancel</button>
                                        <button type="button" onClick={() => {
                                            const includesArray = typeof accommodationForm.includes === 'string' 
                                                ? accommodationForm.includes.split(',').map(s => s.trim()).filter(Boolean) 
                                                : accommodationForm.includes;
                                            
                                            accommodationMutation.mutate({ 
                                                ...accommodationForm, 
                                                includes: includesArray,
                                                stars: parseInt(accommodationForm.stars) || 3,
                                                pricePerNight: parseInt(accommodationForm.pricePerNight) || 0
                                            });
                                        }} className="flex-2 btn-primary py-3">Save Tier</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Food Form Modal */}
                <AnimatePresence>
                    {isFoodFormOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFoodFormOpen(false)} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
                                <h3 className="text-xl font-bold mb-6">{editingFood ? 'Edit' : 'Add'} Food Option</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Emoji</label>
                                            <input value={foodForm.emoji} onChange={e => setFoodForm({...foodForm, emoji: e.target.value})} className="w-full px-3 py-3 bg-ink/5 rounded-xl border-none text-center text-xl" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Dish Name</label>
                                            <input value={foodForm.name} onChange={e => setFoodForm({...foodForm, name: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SearchableSelect
                                            label="Meal Type"
                                            options={[
                                                { value: 'BREAKFAST', name: 'Breakfast' },
                                                { value: 'LUNCH', name: 'Lunch' },
                                                { value: 'DINNER', name: 'Dinner' },
                                                { value: 'SNACK', name: 'Snack/Drinks' }
                                            ]}
                                            value={foodForm.mealType}
                                            onChange={(val) => setFoodForm({ ...foodForm, mealType: val })}
                                        />
                                        <SearchableSelect
                                            label="Dietary"
                                            options={[
                                                { value: 'Veg', name: 'Veg' },
                                                { value: 'Non-Veg', name: 'Non-Veg' },
                                                { value: 'Vegan', name: 'Vegan' },
                                                { value: 'Egg', name: 'Contains Egg' }
                                            ]}
                                            value={foodForm.dietaryTag}
                                            onChange={(val) => setFoodForm({ ...foodForm, dietaryTag: val })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Price (₹)</label>
                                        <input type="number" value={foodForm.price} onChange={e => setFoodForm({...foodForm, price: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsFoodFormOpen(false)} className="flex-1 py-3 bg-ink/5 rounded-xl font-bold">Cancel</button>
                                        <button type="button" onClick={() => {
                                            if (!foodForm.name) return alert('Dish name is required');
                                            
                                            // Transform fields to match Prisma schema
                                            const payload = {
                                                name: foodForm.name,
                                                icon: foodForm.emoji || '🍲',
                                                mealType: foodForm.mealType,
                                                price: parseInt(foodForm.price) || 0,
                                                dietaryTags: foodForm.dietaryTag ? [foodForm.dietaryTag] : [],
                                                description: foodForm.description || ''
                                            };
                                            
                                            foodMutation.mutate(payload);
                                        }} className="flex-2 btn-primary py-3">Save Food</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Travel Form Modal */}
                <AnimatePresence>
                    {isTravelFormOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTravelFormOpen(false)} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
                                <h3 className="text-xl font-bold mb-6">{editingTravel ? 'Edit' : 'Add'} Travel Option</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Icon</label>
                                            <input value={travelForm.icon} onChange={e => setTravelForm({...travelForm, icon: e.target.value})} className="w-full px-3 py-3 bg-ink/5 rounded-xl border-none text-center text-xl" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Mode Of Transport</label>
                                            <input value={travelForm.mode} onChange={e => setTravelForm({...travelForm, mode: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" placeholder="e.g. Luxury Cab" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Est. Cost</label>
                                            <input value={travelForm.estimatedCost} onChange={e => setTravelForm({...travelForm, estimatedCost: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" placeholder="₹2000 - ₹3000" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Duration (Mins)</label>
                                            <input type="number" value={travelForm.durationMins} onChange={e => setTravelForm({...travelForm, durationMins: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Description</label>
                                        <textarea rows={2} value={travelForm.description} onChange={e => setTravelForm({...travelForm, description: e.target.value})} className="w-full px-4 py-3 bg-ink/5 rounded-xl border-none font-medium resize-none" />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsTravelFormOpen(false)} className="flex-1 py-3 bg-ink/5 rounded-xl font-bold">Cancel</button>
                                        <button type="button" onClick={() => travelMutation.mutate(travelForm)} className="flex-2 btn-primary py-3">Save Option</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
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
