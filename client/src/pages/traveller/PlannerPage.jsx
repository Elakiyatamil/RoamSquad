import React, { useState } from 'react';

import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';
import { generatePDF } from '../../utils/pdfExport';
import { motion, AnimatePresence } from 'framer-motion';
import Step1Immersive from '../../components/traveller/Step1Immersive';
import Step2Vibe from '../../components/traveller/Step2Vibe';
import Step3Itinerary from '../../components/traveller/Step3Itinerary';
import Step4Preview from '../../components/traveller/Step4Preview';
import CurtainTransition from '../../components/traveller/CurtainTransition';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')}/api/public`;

const PlannerPage = () => {
    const [step, setStep] = useState(1);
    const [transitioning, setTransitioning] = useState(false);
    const [curtainPhase, setCurtainPhase] = useState('hidden'); // 'hidden'|'down'|'up'
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
        vibes: [],
        experienceType: 'Mid-range',
        userName: '',
        userEmail: '',
        userPhone: '',
        startDate: '',
        hotel: '',
        food: '',
        children: [{ age: '', name: '' }],
        generalExpectations: '',
        kidsExpectations: ''
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

    const [daySelectedDestinations, setDaySelectedDestinations] = useState({}); // { 1: 'id1', 2: 'id2' }
    const [selectedDay, setSelectedDay] = useState(1);
    const selectedDestinationId = daySelectedDestinations[selectedDay] || "";

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
    }, [selectedDestinationId, selectedDay]);



    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Cinematic curtain transition Step 2 → Step 3
    const triggerCinematicNext = () => {
        if (transitioning) return;
        setTransitioning(true);
        setCurtainPhase('down');
        setTimeout(() => {
            setStep(3);
            setCurtainPhase('up');
        }, 500);
        setTimeout(() => {
            setCurtainPhase('hidden');
            setTransitioning(false);
        }, 900);
    };

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

            const vibe = Array.isArray(config.vibes) ? config.vibes.join(', ') : (config.vibe || '');
            
            // Prepare structured selectedPlan for backend
            const selectedPlan = {};
            for (let i = 1; i <= config.days; i++) {
                selectedPlan[`day${i}`] = {
                    destinationId: daySelectedDestinations[i] || null,
                    activityId: plan.activities.find(a => a.day === i)?.id || null,
                    foodId: plan.food.find(f => f.day === i)?.id || null,
                    stayId: plan.stays.find(s => s.day === i)?.id || null
                };
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
                    vibe: vibe,
                    places: plan.activities,
                    food: selectedFood,
                    stay: selectedStay,
                    timeline,
                    selectedPlan // Added for backend sync
                },
                itinerarySnapshot: {
                    days: Number(config.days),
                    people: Number(config.travellers),
                    travelType: config.travelType,
                    vibe: vibe,
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
                tripDate: config.startDate ? new Date(`${config.startDate}T00:00:00`).toISOString() : new Date().toISOString(),
                startDate: config.startDate ? new Date(`${config.startDate}T00:00:00`).toISOString() : null,
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
                    vibes: config.vibes,
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
            const dayFood = plan.food.filter(f => f.day === i);
            const dayStays = plan.stays.filter(s => s.day === i);
            const destinationsInDay = [...new Set(dayActs.map(a => a.destinationName))];
            
            timeline.push({
                day: i,
                activities: dayActs,
                food: dayFood,
                stays: dayStays,
                destinationId: daySelectedDestinations[i] || null,
                travelNote: destinationsInDay.length > 1 ? `Transfer between ${destinationsInDay.join(' & ')}` : null,
                isOverloaded: dayActs.length > 5 
            });
        }
        return timeline;
    };
    const timeline = generateTimeline();



    return (
        <div className={`planner-page-container ${step === 1 ? 'immersive-mode' : ''}`}>
            {/* ── CINEMATIC CURTAIN OVERLAY ── */}
            <CurtainTransition curtainPhase={curtainPhase} />

            <div>
                    {/* ── PROGRESS BAR ── */}
                    {step >= 2 && step <= 3 && (
                    <div
                        style={{
                            position: step >= 3 ? 'sticky' : 'relative',
                            top: 0,
                            zIndex: 50,
                            background: step >= 3 ? 'rgba(255,255,255,0.92)' : 'transparent',
                            backdropFilter: step >= 3 ? 'blur(20px)' : 'none',
                            borderBottom: step >= 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                            padding: step >= 3 ? '16px 48px' : '48px 0 32px',
                        }}
                    >
                        {/* Step labels row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            {[{ num: '01', label: 'BASICS' }, { num: '02', label: 'VIBE' }, { num: '03', label: 'ITINERARY' }].map((s, i) => {
                                const stepNum = i + 1;
                                const isActive = step === stepNum;
                                const isCompleted = step > stepNum;
                                const isInactive = step < stepNum;
                                return (
                                    <React.Fragment key={s.num}>
                                        <div
                                            onClick={() => { if (isCompleted) setStep(stepNum); }}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                                cursor: isCompleted ? 'pointer' : 'default',
                                                opacity: isInactive ? 0.25 : 1,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {isCompleted && (
                                                    <span style={{ color: '#0f4a23', fontSize: 12 }}>✓</span>
                                                )}
                                                <span style={{
                                                    fontFamily: "'Barlow Condensed', sans-serif",
                                                    fontWeight: isActive ? 700 : 800,
                                                    fontSize: 18,
                                                    color: isInactive
                                                        ? (step <= 1 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')
                                                        : '#0f4a23',
                                                }}>
                                                    {s.num}
                                                </span>
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{
                                                    fontFamily: "'Barlow Condensed', sans-serif",
                                                    fontWeight: 400, fontSize: 12,
                                                    letterSpacing: '0.15em',
                                                    color: isInactive
                                                        ? (step <= 1 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')
                                                        : '#0f4a23',
                                                }}>
                                                    {s.label}
                                                </span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="step-underline"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '100%' }}
                                                        transition={{ duration: 0.4 }}
                                                        style={{
                                                            position: 'absolute', bottom: -3, left: 0,
                                                            height: 2, background: '#0f4a23', borderRadius: 1,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {i < 2 && (
                                            <div style={{ flex: 1, margin: '0 16px', height: 1, background: 'rgba(0,0,0,0.1)', position: 'relative', top: -4 }}>
                                                <motion.div
                                                    animate={{ width: step > stepNum ? '100%' : '0%' }}
                                                    transition={{ duration: 0.6 }}
                                                    style={{ height: '100%', background: '#0f4a23', position: 'absolute', left: 0 }}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    )}

                    <div className="step-content-wrapper relative h-full w-full">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <Step1Immersive 
                                    key="step1"
                                    config={config} 
                                    setConfig={setConfig} 
                                    onNext={nextStep} 
                                />
                            )}

                            {step === 2 && (
                                <Step2Vibe 
                                    key="step2"
                                    config={config} 
                                    setConfig={setConfig} 
                                    onNext={triggerCinematicNext}
                                    onBack={prevStep}
                                />
                            )}
                        </AnimatePresence>
                    </div>


                        <Step3Itinerary
                            key="step3"
                            config={config}
                            plan={plan}
                            setPlan={setPlan}
                            budget={budget}
                            setBudget={setBudget}
                            timeline={timeline}
                            activities={activities}
                            food={food}
                            stays={stays}
                            countries={countries}
                            states={states}
                            districts={districts}
                            destinations={destinations}
                            selectedCountry={selectedCountry}
                            selectedState={selectedState}
                            selectedDistrict={selectedDistrict}
                            selectedDestinationId={selectedDestinationId}
                            daySelectedDestinations={daySelectedDestinations}
                            selectedDay={selectedDay}
                            setSelectedDay={setSelectedDay}
                            onCountryChange={(val) => { setSelectedCountry(val); setSelectedState(''); setSelectedDistrict(''); setDaySelectedDestinations({}); }}
                            onStateChange={(val) => { setSelectedState(val); setSelectedDistrict(''); setDaySelectedDestinations({}); }}
                            onDistrictChange={(val) => { setSelectedDistrict(val); setDaySelectedDestinations({}); }}
                            onDestinationChange={(val) => {
                                setDaySelectedDestinations(prev => ({
                                    ...prev,
                                    [selectedDay]: val
                                }));
                            }}
                            totalActivityTime={totalActivityTime}
                            isOverScheduled={isOverScheduled}
                            onWishlist={handleAddToWishlist}
                            onReview={() => {
                                if (isOverScheduled) {
                                    alert('Your itinerary is over-scheduled. Please remove some activities or increase trip days.');
                                    return;
                                }
                                nextStep();
                            }}
                        />



                    {step === 4 && inquiryStatus === 'success' ? (
                        <div
                            key="success"
                            className="w-full min-h-screen bg-[#F7F3EC] flex items-center justify-center p-8 animate-fade-in"
                        >
                            <div className="max-w-4xl w-full bg-white rounded-[2rem] p-16 text-center shadow-2xl relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#1B3A6B]/10" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#1B3A6B]/5 rounded-full blur-3xl" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#E8A838]/5 rounded-full blur-3xl" />

                                <div className="w-24 h-24 bg-[#1B3A6B]/10 rounded-full flex items-center justify-center mx-auto mb-10 text-[#1B3A6B]">
                                    <Sparkles size={48} className="animate-pulse" />
                                </div>

                                <h2 className="text-5xl font-display font-bold text-[#1B3A6B] mb-6 tracking-tight">Your Story Begins!</h2>
                                <p className="text-[#7A7068] text-xl max-w-xl mx-auto mb-12 font-serif italic">
                                    Our Roam Squad experts are already reviewing your handcrafted journey. 
                                    Expect a personalized touch within the next 24 hours.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                    <button 
                                        onClick={() => window.location.href = '/'}
                                        className="px-12 py-5 bg-[#1B3A6B] text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-[#1B3A6B]/20"
                                    >
                                        Return to Home
                                    </button>
                                    <button 
                                        onClick={() => generatePDF(submittedData)}
                                        className="px-12 py-5 bg-white border-2 border-[#1B3A6B]/10 text-[#1B3A6B] rounded-full font-bold text-lg flex items-center gap-3 hover:bg-[#1B3A6B]/5 transition-all"
                                    >
                                        <Sparkles size={20} className="text-[#E8A838]" /> 
                                        Download Itinerary PDF
                                    </button>
                                </div>
                                
                                <div className="mt-12 pt-12 border-t border-[#1B3A6B]/5">
                                    <p className="text-[#1B3A6B]/30 text-sm font-bold tracking-widest uppercase">Love from the Roam Squad</p>
                                </div>
                            </div>
                        </div>
                    ) : step === 4 && (
                        <Step4Preview
                            key="step4"
                            config={config}
                            setConfig={setConfig}
                            timeline={timeline}
                            plan={plan}
                            budget={budget}
                            isSubmitting={isSubmitting}
                            submitInquiry={submitInquiry}
                            errorMessage={errorMessage}
                            prevStep={prevStep}
                            destinations={destinations}
                        />
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
                <ChapterSweep active={step === 2} />

                <style jsx global>{`
                  .hide-scrollbar::-webkit-scrollbar { display: none; }
                  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
    );
};

export default PlannerPage;

const ChapterSweep = ({ active }) => {
    return (
        <AnimatePresence>
            {active && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] pointer-events-none flex items-center"
                >
                    <svg width="100%" height="100%" viewBox="0 0 1440 800" preserveAspectRatio="none">
                        <motion.path 
                            d="M-100,400 L1540,400"
                            stroke="white"
                            strokeWidth="4"
                            strokeOpacity="0.6"
                            initial={{ pathLength: 0, x: -100 }}
                            animate={{ pathLength: 1, x: 0 }}
                            exit={{ x: 100, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                        {/* Glow effect for the sweep line */}
                        <motion.path 
                            d="M-100,400 L1540,400"
                            stroke="white"
                            strokeWidth="20"
                            strokeOpacity="0.2"
                            className="blur-xl"
                            initial={{ pathLength: 0, x: -100 }}
                            animate={{ pathLength: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </svg>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
