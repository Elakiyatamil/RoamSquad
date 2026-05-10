import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Check, ArrowRight, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';
import { useLoader } from '../../context/LoaderContext';
import './PackagesPage.css';

const API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api`;

export default function PackagesPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [pendingPkg, setPendingPkg] = useState(null);
    const { isAuthenticated, user } = useAuthStore();
    const token = useAuthStore(s => s.token);
    const { setIsLoading: setGlobalLoading } = useLoader();

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['publicPackages'],
        queryFn: async () => {
            const res = await axios.get(`${API}/packages/public`);
            return res.data.data || [];
        }
    });

    useEffect(() => {
      setGlobalLoading(isLoading);
    }, [isLoading, setGlobalLoading]);

    const interestMutation = useMutation({
        mutationFn: async ({ packageId, packageName, customPhone }) => {
            const payload = {
                email: user?.email,
                name: user?.name || 'Interested User',
                phone: customPhone,
                packageId,
                packageName,
                createdAt: new Date()
            };
            return axios.post(`${API}/packages/${packageId}/interest`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Interest sent! 🚀");
        },
        onError: () => toast.error("Failed to register interest.")
    });

    const handleInterest = (pkg) => {
        if (!isAuthenticated) {
            toast.error("Please login first");
            setPendingId(pkg.id);
            setShowAuth(true);
            return;
        }
        setPhoneInput(user?.phone || '');
        setPendingPkg(pkg);
        setShowPhoneModal(true);
    };

    const getImgUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${base}${path}`;
    };

    return (
        <div className="packages-page">
            <header>
                <h1 className="packages-heading">Recently Booked Packages</h1>
                <p className="packages-sub">Handcrafted travel packages designed for unforgettable, premium experiences.</p>
            </header>

            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: '100px', color: '#9CA3AF' }}>
                    <Loader2 size={32} className="animate-spin" style={{ marginRight: '12px' }} /> 
                    <span>Curating packages...</span>
                </div>
            ) : packages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>No packages available yet.</p>
                </div>
            ) : (
                <div className="packages-grid">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="package-card" onClick={() => handleInterest(pkg)}>
                            <img src={getImgUrl(pkg.image || pkg.imageUrl || pkg.photo || pkg.coverImage || pkg.image_url)} alt={pkg.name} />
                            <div className="package-card-body">
                                <h3 className="package-name">{pkg.name}</h3>
                                <div className="package-days">{pkg.daysCount} Days</div>
                                <div className="package-price">
                                    ₹{Number(pkg.amount || pkg.totalPrice).toLocaleString()}
                                </div>
                                
                                {pkg.highlights?.length > 0 && (
                                    <ul className="package-features">
                                        {pkg.highlights.slice(0, 3).map((h, i) => (
                                            <li key={i}>{h}</li>
                                        ))}
                                    </ul>
                                )}
                                
                                <button className="package-btn">
                                    Request Itinerary
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => {
                setShowAuth(false);
                if (pendingId) {
                    const pkg = packages.find(p => p.id === pendingId);
                    if (pkg) {
                        setPhoneInput(user?.phone || '');
                        setPendingPkg(pkg);
                        setShowPhoneModal(true);
                    }
                }
            }} />

            {/* Phone Modal */}
            {showPhoneModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '20px', boxSizing: 'border-box' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', boxSizing: 'border-box' }}>
                        {isSuccess ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <Check size={30} color="#10B981" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Request Sent!</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>Thank you! Our team will reach out to you shortly to discuss this bespoke adventure.</p>
                                <button 
                                    onClick={() => {
                                        setShowPhoneModal(false);
                                        setTimeout(() => setIsSuccess(false), 300);
                                    }} 
                                    className="package-btn"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Your Contact</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '24px' }}>Please provide your phone number so our team can craft this bespoke package for you.</p>
                                
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    style={{ width: '100%', padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', outline: 'none', marginBottom: '24px', fontSize: '1rem' }}
                                    autoFocus
                                />
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowPhoneModal(false)}
                                        style={{ flex: 1, padding: '12px', border: 'none', background: 'none', color: '#9CA3AF', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!phoneInput.trim()) return toast.error("Phone number is required!");
                                            interestMutation.mutate({ 
                                                packageId: pendingPkg.id, 
                                                packageName: pendingPkg.name,
                                                customPhone: phoneInput
                                            });
                                        }}
                                        disabled={interestMutation.isPending}
                                        className="package-btn"
                                        style={{ flex: 2, marginTop: 0 }}
                                    >
                                        {interestMutation.isPending ? 'Sending...' : 'Confirm'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
