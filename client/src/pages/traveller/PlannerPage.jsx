import React, { useState } from 'react';

import { Calendar, Users, Briefcase, Zap, Coffee, Sparkles, ChevronRight, MapPin, Trash2, Plus, TreePalm } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { generatePDF } from '../../utils/pdfExport';
import Step1Immersive from '../../components/traveller/Step1Immersive';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')}/api/public`;

const PlannerPage = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquiryStatus, setInquiryStatus] = useState(null);
    const [submittedData, setSubmittedData] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const [errorMessage, setErrorMessage] = useState('');
    const [config, setConfig] = useState({
        days: 1,
        travellers: 2,
        travelType: 'Couple',
        vibe: 'Nature',
        experienceType: 'Mid-range',
        userName: '',
        userEmail: '',
        userPhone: '',
        startDate: '',
        hotel: '',
        food: ''
    });


    // Sync auth details
    React.useEffect(() => {
        if (isAuthenticated && user) {
            setConfig(prev => ({
                ...prev,
                userName: prev.userName || user.name || '',
                userEmail: prev.userEmail || user.email || '',
                userPhone: prev.userPhone || user.phone || ''
            }));
        }
    }, [isAuthenticated, user]);


    const [pendingSubmit, setPendingSubmit] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedDestinationId, setSelectedDestinationId] = useState("");
    const [selectedDayBuilder, setSelectedDayBuilder] = useState(1);

    const [activities, setActivities] = useState([]);
    const [food, setFood] = useState([]);
    const [stays, setStays] = useState([]);
    const [plan, setPlan] = useState({
        activities: [],
        food: [],
        stays: []
    });
    const [budget, setBudget] = useState(0);


    // Fetch Countries
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/countries`);
            return res.data.data || [];
        }
    });

    // Fetch States
    const { data: states } = useQuery({
        queryKey: ['states', selectedCountry],
        queryFn: async () => {
            if (!selectedCountry) return [];
            const res = await axios.get(`${API_BASE}/states/${selectedCountry}`);
            return res.data.data || [];
        },
        enabled: !!selectedCountry
    });

    // Fetch Districts
    const { data: districts } = useQuery({
        queryKey: ['districts', selectedState],
        queryFn: async () => {
            if (!selectedState) return [];
            const res = await axios.get(`${API_BASE}/districts/${selectedState}`);
            return res.data.data || [];
        },
        enabled: !!selectedState
    });

    const { data: destinations } = useQuery({
        queryKey: ['public-destinations', selectedDistrict],
        queryFn: async () => {
            if (!selectedDistrict) return [];
            const res = await axios.get(`${API_BASE}/destinations/district/${selectedDistrict}`);
            return res.data.data || [];
        },
        enabled: !!selectedDistrict
    });

    // 🔴 STEP 9 — FIX STATE RESET
    React.useEffect(() => {
        // WE DO NOT RESET `setPlan` or `setBudget` anymore to support multi-destination itineraries!

        if (!selectedDestinationId) {
            setActivities([]);
            setFood([]);
            setStays([]);
            return;
        }

        // 🔴 STEP 2 & 3 — FETCH FULL DATA & DEBUG
        axios.get(`${API_BASE}/destinations/id/${selectedDestinationId}`)
            .then(res => {
                const data = res.data.data;
                
                // 🔴 STEP 4 — FIX RENDERING (Ensure consistent fields)
                setActivities(data.activities || []);
                setFood(data.foodOptions || []);
                setStays(data.accommodations || []);
            })
            .catch(err => {
                console.error("API FETCH ERROR:", err);
                setActivities([]);
                setFood([]);
                setStays([]);
            });
    }, [selectedDestinationId]);



    const travelTypes = ['Solo', 'Couple', 'Family', 'Friends', 'Squad', 'Girls Trip'];
    const vibes = [
        { name: 'Luxury', icon: Sparkles, desc: 'Premium stays & private transfers' },
        { name: 'Comfort', icon: Coffee, desc: 'Boutique hotels & comfort' },
        { name: 'Budget', icon: Zap, desc: 'Quality stays on a budget' },
        { name: 'Adventure', icon: MapPin, desc: 'Thrilling activities & offbeat trails' },
        { name: 'Nature', icon: TreePalm, desc: 'Scenic landscapes & tranquility' },
        { name: 'Relaxation', icon: Coffee, desc: 'Slow travel & wellness' }
    ];

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // 🔴 STEP 6 — REAL-TIME BUDGET CALCULATION
    const calculateBudget = (currentPlan) => {
        return [
            ...currentPlan.activities,
            ...currentPlan.food,
            ...currentPlan.stays
        ].reduce((sum, item) => {
            return sum + (item.price || item.cost || 0);
        }, 0);
    };

    // 🔴 STEP 5 & 7 — FIX ADD TO PLAN (CORE FEATURE & INSTANT UPDATE)
    const addToPlan = (type, item, targetDay = null) => {
        const planKey = type === 'activity' ? 'activities' : type === 'food' ? 'food' : 'stays';
        // Make the item ID unique per day if a targetDay is provided
        const itemId = `${selectedDestinationId}-${item.id}${targetDay ? `-day${targetDay}` : ''}`;
        
        setPlan(prev => {
            const isSelected = prev[planKey].find(i => i.planId === itemId);
            let updated;

            if (isSelected) {
                updated = {
                    ...prev,
                    [planKey]: prev[planKey].filter(i => i.planId !== itemId)
                };
            } else {
                const newItem = {
                    ...item,
                    planId: itemId,
                    type,
                    day: targetDay,
                    destinationId: selectedDestinationId,
                    destinationName: destinations?.find(d => d.id === selectedDestinationId)?.name || 'Destination'
                };

                updated = {
                    ...prev,
                    [planKey]: [...prev[planKey], newItem]
                };
            }

            setBudget(calculateBudget(updated));
            return updated;
        });
    };



    const validateBeforeConfirm = () => {

        // RULE 7: Required fields
        if (!config.userName?.trim() || !config.userEmail?.trim() || !config.userPhone?.trim()) {
            return 'Please fill name, email and phone';
        }
        if (!config.startDate) return 'Please select a start date';
        
        // If they didn't manually enter a hotel, check if they selected a 'stay' item in the trip
        const selectedStay = plan.stays[0];
        if (!config.hotel?.trim() && !selectedStay) return 'Please enter or select an accommodation';
        
        if (plan.activities.length === 0) return 'Please select at least 1 activity';


        // RULE 8: startDate valid + RULE 3 (25-day rule): trip must be >= today + 25 days
        const start = new Date(`${config.startDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(start.getTime())) return 'Start date is invalid';
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 15);
        if (start < minDate) return 'Trip must be at least 15 days from today';

        // RULE 3: days match plan
        const itineraryDays = timeline.length;
        if (Number(config.days) !== itineraryDays) return 'Days do not match plan';

        return null;
    };

    const doSubmitInquiry = async () => {
        setIsSubmitting(true);
        setErrorMessage('');
        const validationError = validateBeforeConfirm();
        if (validationError) {
            setIsSubmitting(false);
            setErrorMessage(validationError);
            return;
        }
        // RULE 7 (SRS): login only at inquiry confirm
        if (!isAuthenticated) {
            setPendingSubmit(true);
            setShowAuthModal(true);
            setIsSubmitting(false);
            return;
        }
        try {
            const selectedFood = plan.food;
            const selectedStay = plan.stays[0];


            const state = states?.find(s => s.id === selectedState)?.name || null;
            const destinationName = destinations?.find(d => d.id === selectedDestinationId)?.name || null;
            const district = destinationName || districts?.find(d => d.id === selectedDistrict)?.name || null;
            const name = user?.name || config.userName;
            const email = user?.email || config.userEmail;
            const phone = config.userPhone;

            if (!name || !email || !phone) {
                alert("Please fill all required fields");
                return;
            }

            const payload = {
                userId: user?.id,
                name,
                email,
                phone,
                destinationId: selectedDestinationId || null,
                destinationName,
                state,
                district,
                itinerary: {
                    days: config.days,
                    people: config.travellers,
                    travelType: config.travelType,
                    vibe: config.vibe,
                    places: plan.activities,
                    food: selectedFood,
                    stay: selectedStay,
                    timeline
                },
                itinerarySnapshot: {
                    days: config.days,
                    people: config.travellers,
                    travelType: config.travelType,
                    vibe: config.vibe,
                    places: plan.activities,
                    timeline
                },
                hotelSnapshot: selectedStay 
                    ? { name: selectedStay.tier + " Stay", price: selectedStay.price }
                    : { name: config.hotel },
                foodSnapshot: selectedFood.length > 0 
                    ? { count: selectedFood.length, items: selectedFood.map(f => f.name) }
                    : config.food ? { name: config.food } : null,
                totalBudget: budget,
                tripDate: new Date(`${config.startDate}T00:00:00`).toISOString(),
                startDate: new Date(`${config.startDate}T00:00:00`).toISOString(),
                days: Number(config.days),
                people: Number(config.travellers)
            };
            
            
            const token = useAuthStore.getState().token;
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')}/api/inquiry`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Save to local storage for guest session reference
            const savedInquiries = JSON.parse(localStorage.getItem('submitted_inquiries') || '[]');
            savedInquiries.unshift({
                ...payload,
                date: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('submitted_inquiries', JSON.stringify(savedInquiries));

            setSubmittedData(payload);
            setInquiryStatus('success');
            toast.success("Inquiry sent successfully. Admin will contact you.");
            setStep(4);
        } catch (error) {
            console.error("Inquiry error:", error.response?.data || error.message);
            setInquiryStatus('error');
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                useAuthStore.getState().logout();
                setErrorMessage('Session expired. Please log in again.');
                setShowAuthModal(true);
            } else {
                setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'Failed to submit inquiry');
            }
        } finally {
            setIsSubmitting(false);
            setPendingSubmit(false);
        }
    };

    const submitInquiry = async (e) => {
        e.preventDefault();
        await doSubmitInquiry();
    };

    const handleAddToWishlist = async () => {
        if (!isAuthenticated) {
            setPendingSubmit(false); // We can reuse this or a separate flag if we wanted to resume wishlist add
            setShowAuthModal(true);
            return;
        }

        try {
            const payload = {
                email: user?.email || config.userEmail,
                destination: destinations?.find(d => d.id === selectedDestinationId)?.name || plan.activities[0]?.destinationName || "Multiple",
                itinerary: {
                    ...plan,
                    days: config.days,
                    travelType: config.travelType,
                    vibe: config.vibe,
                    user: {
                        name: user?.name || config.userName,
                        phone: config.userPhone
                    }
                },
                totalBudget: budget,
                createdAt: new Date().toISOString()
            };
            
            const token = useAuthStore.getState().token;
            // Since it's a lead capture, we can send it with or without token, 
            // but we're enforcing login now per user request.
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')}/api/wishlist/lead`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success("❤️ Saved to your Wishlist!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save to Wishlist.");
        }
    };

    // Derived logic for rendering
    const allPlanItems = [...plan.activities, ...plan.food, ...plan.stays];
    const isOverScheduled = plan.activities.length > config.days * 2;

    const totalActivityTime = plan.activities.reduce((sum, act) => {
        const durationStr = act.duration || "2h";
        const mins = parseInt(durationStr) * (durationStr.includes('h') ? 60 : 1) || 120;
        return sum + mins;
    }, 0);


    // Group items explicitly based on the assigned day
    const generateTimeline = () => {
        const timeline = [];
        for (let i = 1; i <= config.days; i++) {
            const dayActs = plan.activities.filter(a => a.day === i);
            const destinationsInDay = [...new Set(dayActs.map(a => a.destinationName))];
            
            timeline.push({
                day: i,
                activities: dayActs,
                travelNote: destinationsInDay.length > 1 ? `Transfer between ${destinationsInDay.join(' & ')}` : null,
                isOverloaded: dayActs.length > 5 // Adjust limits if needed
            });
        }
        return timeline;
    };
    const timeline = generateTimeline();



    return (
        <div className={`planner-page-container ${step === 1 ? 'immersive-mode' : ''}`}>
                <div className="max-w-7xl mx-auto">
                    {/* Minimal Progress Line */}
                    <div className="planner-progress-wrapper pt-12 pb-8">
                        <div className="planner-progress-line">
                            <div 
                                className="progress-fill transition-all duration-700 ease-in-out bg-gold h-full"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
                            <span className={step >= 1 ? 'text-white/60' : ''}>01 BASICS</span>
                            <span className={step >= 2 ? 'text-white/60' : ''}>02 VIBE</span>
                            <span className={step >= 3 ? 'text-white/60' : ''}>03 ITINERARY</span>
                        </div>
                    </div>

                    <div className="step-content-wrapper">
                        {step === 1 && (
                            <Step1Immersive 
                                config={config} 
                                setConfig={setConfig} 
                                onNext={nextStep} 
                            />
                        )}

                    {step === 2 && (
                        <div
                            key="step2"
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-forest/5 animate-fade-in"
                        >
                            <h2 className="text-4xl font-display font-bold text-forest mb-2">Customise Your Vibe</h2>
                            <p className="text-forest/50 mb-10 text-lg">Choose the style that matches your mood.</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                                {vibes.map(v => (
                                    <button
                                        key={v.name}
                                        onClick={() => setConfig({...config, vibe: v.name})}
                                        className={`p-6 rounded-[2rem] border-2 text-left transition-all ${
                                            config.vibe === v.name 
                                            ? 'border-gold bg-gold/5 ring-4 ring-gold/10' 
                                            : 'border-forest/5 hover:border-forest/20'
                                        }`}
                                    >
                                        <v.icon size={24} className="text-gold mb-4" />
                                        <h3 className="text-lg font-bold text-forest mb-1">{v.name}</h3>
                                        <p className="text-forest/40 text-[10px] leading-tight uppercase tracking-widest">{v.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <label className="block text-sm font-bold text-forest/40 uppercase tracking-widest">Share your idea of the perfect vibe</label>
                                <textarea 
                                    placeholder="Ex: Relaxation, hidden waterfalls, local street food trails..."
                                    className="w-full p-6 bg-forest/5 rounded-2xl border-2 border-transparent focus:border-gold outline-none text-lg min-h-[120px]"
                                    value={config.vibe}
                                    onChange={(e) => setConfig({...config, vibe: e.target.value})}
                                />
                            </div>

                            <div className="mt-16 flex justify-between">
                                <button onClick={prevStep} className="px-10 py-4 text-forest font-bold">Back</button>
                                <button 
                                    onClick={nextStep}
                                    className="px-10 py-4 bg-forest text-cream rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    Build Itinerary <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div key="step3" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Discovery Panel */}
                            <div className="lg:col-span-2 space-y-12">
                                <div className="flex flex-col md:flex-row gap-4 mb-8">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="Country"
                                            placeholder="Select Country"
                                            value={selectedCountry}
                                            options={(countries || []).map(c => ({ id: c.id, label: c.name }))}
                                            onChange={(val) => {
                                                setSelectedCountry(val);
                                                setSelectedState('');
                                                setSelectedDistrict('');
                                                setSelectedDestinationId('');
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="State"
                                            placeholder="Select State"
                                            disabled={!selectedCountry}
                                            value={selectedState}
                                            options={(states || []).map(s => ({ id: s.id, label: s.name }))}
                                            onChange={(val) => {
                                                setSelectedState(val);
                                                setSelectedDistrict('');
                                                setSelectedDestinationId('');
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="District"
                                            placeholder="Select District"
                                            disabled={!selectedState}
                                            value={selectedDistrict}
                                            options={(districts || []).map(d => ({ id: d.id, label: d.name }))}
                                            onChange={(val) => {
                                                setSelectedDistrict(val);
                                                setSelectedDestinationId("");
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="Destination"
                                            placeholder="Select Destination"
                                            disabled={!selectedDistrict}
                                            value={selectedDestinationId}
                                            options={(destinations || []).map(d => ({ id: d.id, label: d.name }))}
                                            emptyMessage="No destinations available"
                                            onChange={(val) => {
                                                setSelectedDestinationId(val);
                                            }}
                                        />
                                    </div>
                                </div>


                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-4xl font-display font-bold text-forest">Curated Experiences</h2>
                                    {selectedDestinationId && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {(Array.isArray(Array.from({ length: config.days })) ? Array.from({ length: config.days }) : []).map((_, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => setSelectedDayBuilder(i + 1)}
                                                    className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                                                        selectedDayBuilder === i + 1 
                                                        ? 'bg-forest text-cream shadow-md' 
                                                        : 'bg-white border text-forest hover:bg-forest/5'
                                                    }`}
                                                >
                                                    Day {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-16">
                                    {!selectedDestinationId ? (
                                        <div className="py-20 text-center bg-forest/5 rounded-[2rem] border-2 border-dashed border-forest/10">
                                            <MapPin size={48} className="mx-auto text-forest/20 mb-4" />
                                            <p className="text-xl font-bold text-forest/40">Select a destination to see experiences.</p>
                                        </div>
                                    ) : activities.length === 0 && food.length === 0 && stays.length === 0 ? (
                                        <div className="py-20 text-center bg-forest/5 rounded-[2rem] border-2 border-dashed border-forest/10">
                                            <Sparkles size={48} className="mx-auto text-forest/20 mb-4" />
                                            <p className="text-xl font-bold text-forest/40">No activities available — Add from admin</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            {activities.length > 0 ? (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-display font-bold text-forest">Activities</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {(Array.isArray(activities) ? activities : []).map(act => {
                                                            const isSelectedForDay = plan.activities.find(a => a.planId === `${selectedDestinationId}-${act.id}-day${selectedDayBuilder}`);
                                                            return (
                                                            <button
                                                                key={act.id}
                                                                onClick={() => addToPlan('activity', act, selectedDayBuilder)}
                                                                className={`p-6 rounded-2xl flex items-center justify-between text-left transition-all ${
                                                                    isSelectedForDay
                                                                    ? 'bg-forest text-cream shadow-xl shadow-forest/20'
                                                                    : 'bg-white border-2 border-forest/5 hover:border-forest/20'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-forest/5 rounded-xl flex items-center justify-center text-xl">
                                                                        {act.icon || '📍'}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold leading-tight text-forest">{act.name}</h4>
                                                                        <span className="text-xs text-forest/60">₹{act.price || 0} • {act.duration || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                                {isSelectedForDay
                                                                    ? <Trash2 size={16} className="text-cream" /> 
                                                                    : <Plus size={16} className="text-gold" />
                                                                }
                                                            </button>
                                                        )})}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center bg-forest/5 rounded-2xl border-2 border-dashed border-forest/10">
                                                    <p className="text-lg font-bold text-forest/40">No activities available</p>
                                                </div>
                                            )}

                                            {food.length > 0 ? (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-display font-bold text-forest">Food Options</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {(Array.isArray(food) ? food : []).map(f => (
                                                            <button
                                                                key={f.id}
                                                                onClick={() => addToPlan('food', f)}
                                                                className={`p-6 rounded-2xl flex items-center justify-between text-left transition-all ${
                                                                    plan.food.find(a => a.planId === `${selectedDestinationId}-${f.id}`)
                                                                    ? 'bg-forest text-cream shadow-xl shadow-forest/20'
                                                                    : 'bg-white border-2 border-forest/5 hover:border-forest/20'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-forest/5 rounded-xl flex items-center justify-center text-xl">
                                                                        {f.icon || '🍴'}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold leading-tight text-forest">{f.name}</h4>
                                                                        <span className="text-xs text-forest/60">₹{f.price || 0} • {f.type}</span>
                                                                    </div>
                                                                </div>
                                                                {plan.food.find(a => a.planId === `${selectedDestinationId}-${f.id}`) 
                                                                    ? <Trash2 size={16} className="text-cream" /> 
                                                                    : <Plus size={16} className="text-gold" />
                                                                }
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center bg-forest/5 rounded-2xl border-2 border-dashed border-forest/10">
                                                    <p className="text-lg font-bold text-forest/40">No food options available</p>
                                                </div>
                                            )}

                                            {stays.length > 0 ? (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-display font-bold text-forest">Accommodations</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {(Array.isArray(stays) ? stays : []).map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => addToPlan('stay', s)}
                                                                className={`p-6 rounded-2xl flex items-center justify-between text-left transition-all ${
                                                                    plan.stays.find(a => a.planId === `${selectedDestinationId}-${s.id}`)
                                                                    ? 'bg-forest text-cream shadow-xl shadow-forest/20'
                                                                    : 'bg-white border-2 border-forest/5 hover:border-forest/20'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-forest/5 rounded-xl flex items-center justify-center text-xl">
                                                                        {s.tier.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold leading-tight text-forest">{s.tier} Stay</h4>
                                                                        <span className="text-xs text-forest/60">₹{s.price || 0} / night</span>
                                                                    </div>
                                                                </div>
                                                                {plan.stays.find(a => a.planId === `${selectedDestinationId}-${s.id}`) 
                                                                    ? <Trash2 size={16} className="text-cream" /> 
                                                                    : <Plus size={16} className="text-gold" />
                                                                }
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center bg-forest/5 rounded-2xl border-2 border-dashed border-forest/10">
                                                    <p className="text-lg font-bold text-forest/40">No stays available</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Trip Plan Summary (Fixed Sidebar-like) */}
                            <div className="lg:col-span-1">
                                <div className="bg-forest text-cream rounded-[2.5rem] p-10 shadow-2xl sticky top-28">
                                    <h3 className="text-3xl font-display font-bold mb-8">Trip Plan</h3>
                                    
                                    <div className="space-y-6 mb-12 min-h-[200px] max-h-[400px] overflow-y-auto pr-2">
                                        {timeline.filter(t => t.activities.length > 0).length === 0 && plan.stays.length === 0 && plan.food.length === 0 ? (
                                            <p className="text-cream/30 italic">No items added to your trip yet...</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {(Array.isArray(timeline) ? timeline : []).map(t => t.activities.length > 0 && (
                                                    <div key={`day-${t.day}`} className="space-y-3 pb-4 border-b border-cream/10">
                                                        <h4 className="text-gold font-bold text-sm tracking-widest uppercase">Day {t.day}</h4>
                                                        {t.activities.map(item => (
                                                            <div key={item.planId} className="flex items-center justify-between group">
                                                                <div>
                                                                    <p className="font-bold text-sm leading-tight">{item.name}</p>
                                                                    <p className="text-[10px] text-cream/40 uppercase tracking-widest">{item.destinationName}</p>
                                                                </div>
                                                                <p className="font-bold text-gold opacity-80">₹{item.price}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                                {/* Global Items (Stays & Food) */}
                                                {(plan.stays.length > 0 || plan.food.length > 0) && (
                                                    <div className="space-y-3 pt-2">
                                                        <h4 className="text-white/40 font-bold text-xs tracking-widest uppercase">General Options</h4>
                                                        {[...plan.stays, ...plan.food].map(item => (
                                                            <div key={item.planId} className="flex items-center justify-between group">
                                                                <div>
                                                                    <p className="font-bold text-sm leading-tight">{item.name || item.tier + ' Stay'}</p>
                                                                    <p className="text-[10px] text-cream/40 uppercase tracking-widest">{item.type || 'Stay'}</p>
                                                                </div>
                                                                <p className="font-bold text-gold opacity-80">₹{item.price}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                    <div className="pt-8 border-t border-cream/10 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-cream/40">Duration</span>
                                            <span className="font-bold">{config.days} Days</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-cream/40">Travellers</span>
                                            <span className="font-bold">{config.travellers} {config.travelType}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-4">
                                            <span className="text-cream/40 text-sm">Est. Budget</span>
                                            <div className="text-right">
                                                <p className="text-3xl font-display font-bold text-gold">₹{budget.toLocaleString()}</p>
                                                <p className="text-[10px] text-cream/40">Excluding Stays & Flights</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <button 
                                                disabled={plan.activities.length === 0}
                                                onClick={handleAddToWishlist}
                                                className="w-1/3 py-5 bg-white border-2 border-forest text-forest hover:bg-forest/5 rounded-full font-bold transition-colors disabled:opacity-30 disabled:border-transparent flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={16} /> Wishlist
                                            </button>
                                            <button 
                                                disabled={plan.activities.length === 0}
                                                onClick={() => {
                                                    if (isOverScheduled) {
                                                        alert("Your itinerary is over-scheduled. Please remove some activities or increase trip days.");
                                                        return;
                                                    }
                                                    nextStep();
                                                }}
                                                className="w-2/3 py-5 bg-gold text-ink rounded-full font-bold hover:scale-102 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                                            >
                                                Review Inquiry
                                            </button>
                                        </div>
                                        {/* Row with Wishlist and Review buttons moved back to normal layout */}
                                    </div>
                                    
                                    {isOverScheduled && (
                                        <p className="mt-4 text-center text-xs text-red-500 font-bold animate-pulse">
                                            ⚠️ Warning: Activities exceed trip duration!
                                        </p>
                                    )}

                                    <div className="mt-8 space-y-2">
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-cream/40 px-2">
                                            <span>Est. Activity Time</span>
                                            <span>{Math.round(totalActivityTime / 60)}h Total</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${isOverScheduled ? 'bg-red-500' : 'bg-gold'}`}
                                                style={{ width: `${Math.min(100, (plan.activities.length / (config.days * 2)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && inquiryStatus === 'success' ? (
                        <div
                            key="success"
                            className="text-center py-20 bg-white rounded-[3rem] shadow-xl animate-fade-in"
                        >
                            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8 text-gold">
                                <Sparkles size={48} />
                            </div>
                            <h2 className="text-4xl font-display font-bold text-forest mb-4">Inquiry Received!</h2>
                            <p className="text-forest/50 text-xl max-w-lg mx-auto mb-10">
                                Our Roam Squad experts are already reviewing your handcrafted {config.days}-day journey. 
                                We'll get back to you within 24 hours.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => window.location.href = '/'}
                                    className="px-10 py-4 bg-forest text-cream rounded-full font-bold"
                                >
                                    Back to Discovery
                                </button>
                                <button 
                                    onClick={() => generatePDF(submittedData)}
                                    className="px-10 py-4 bg-gold text-forest rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Sparkles size={20} /> Download Itinerary
                                </button>
                            </div>
                        </div>
                    ) : step === 4 && (
                        <div
                            key="step4"
                            className="max-w-4xl mx-auto animate-fade-in"
                        >
                            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-forest/10">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="p-12 bg-forest text-cream">
                                        <h2 className="text-3xl font-display font-bold mb-8">Itinerary Timeline</h2>
                                        <div className="space-y-8">
                                            {timeline.map((day) => (
                                                <div key={day.day} className="relative pl-8 border-l-2 border-gold/30 last:border-0 pb-4">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gold shadow-lg ring-4 ring-forest" />
                                                    <h4 className="font-bold text-gold uppercase tracking-widest text-xs mb-4">Day {day.day}</h4>
                                                    <div className="space-y-4">
                                                        {day.activities.length > 0 ? day.activities.map(act => (
                                                            <div key={act.planId} className="flex flex-col">
                                                                <span className="font-bold">{act.name}</span>
                                                                <span className="text-xs text-cream/40 uppercase tracking-widest">{act.destinationName}</span>
                                                            </div>
                                                        )) : (
                                                            <span className="text-cream/20 italic text-sm">Transfer & Exploration</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-12">
                                        <h2 className="text-3xl font-display font-bold text-forest mb-6">Final Details</h2>
                                        <form onSubmit={submitInquiry} className="space-y-6">
                                            {errorMessage && (
                                                <div className="p-4 bg-red/10 border border-red/20 rounded-xl text-red text-sm font-bold">
                                                    {errorMessage}
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Your Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.userName}
                                                    onChange={e => setConfig({...config, userName: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Email Address</label>
                                                <input 
                                                    required
                                                    type="email" 
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.userEmail}
                                                    onChange={e => setConfig({...config, userEmail: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Phone Number</label>
                                                <input 
                                                    required
                                                    type="tel" 
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.userPhone}
                                                    onChange={e => setConfig({...config, userPhone: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Start Date</label>
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.startDate}
                                                    onChange={e => setConfig({ ...config, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Hotel (Required)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Example: Mid-range tier / Hotel name"
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.hotel}
                                                    onChange={e => setConfig({ ...config, hotel: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-forest/40 uppercase mb-2">Food (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Example: Vegetarian / Local cuisine preference"
                                                    className="w-full p-4 bg-forest/5 rounded-xl border-2 border-transparent focus:border-gold outline-none"
                                                    value={config.food}
                                                    onChange={e => setConfig({ ...config, food: e.target.value })}
                                                />
                                            </div>

                                            <div className="pt-6 border-t border-forest/5">
                                                <div className="flex justify-between items-end mb-8">
                                                    <span className="text-forest/40 text-sm italic">Est. Total Budget</span>
                                                    <span className="text-4xl font-display font-bold text-forest">₹{budget.toLocaleString()}</span>
                                                </div>
                                                <button 
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full py-5 bg-forest text-cream rounded-full font-bold hover:scale-102 transition-transform shadow-xl shadow-forest/20 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Sending...' : 'Confirm Inquiry'}
                                                </button>
                                                <button type="button" onClick={prevStep} className="w-full py-4 text-forest/40 text-sm font-bold">Edit Plan</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <AuthModal 
                    isOpen={showAuthModal} 
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={async () => {
                        setShowAuthModal(false);
                        if (pendingSubmit) {
                            await doSubmitInquiry();
                        } else {
                            nextStep();
                        }
                    }}
                />
                </div>
            </div>
    );
};

export default PlannerPage;
