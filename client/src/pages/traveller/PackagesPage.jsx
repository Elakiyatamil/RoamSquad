import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Check, ArrowRight, Loader2, Calendar, Search, Filter, X, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';
import { useLoader } from '../../context/LoaderContext';
import './PackagesPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API = `${API_BASE}/api`;

export default function PackagesPage() {
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [pendingPkg, setPendingPkg] = useState(null);
    const { isAuthenticated, user } = useAuthStore();
    const token = useAuthStore(s => s.token);
    const { setIsLoading: setGlobalLoading } = useLoader();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVibe, setSelectedVibe] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
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

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVibe = selectedVibe === 'All' || (pkg.vibe && pkg.vibe === selectedVibe);
        return matchesSearch && matchesVibe;
    });

    return (
        <div className="packages-page">
            <header className="packages-gallery-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', position: 'sticky', top: 0, background: '#FAF8F5', zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'white', border: 'none', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Filter size={20} color="#1A1A1A" />
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'white', borderRadius: '100px', padding: '0 20px', height: '48px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Search size={18} color="#9CA3AF" style={{ marginRight: '12px' }} />
                    <input 
                        type="text" 
                        placeholder="Search packages..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '15px' }}
                    />
                </div>
                <button onClick={() => navigate('/')} style={{ background: 'white', border: 'none', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={20} color="#1A1A1A" />
                </button>
            </header>

            {showFilters && (
                <div style={{ padding: '0 24px 16px', display: 'flex', gap: '8px', overflowX: 'auto', background: '#FAF8F5' }}>
                    {['All', 'Stranger', 'Family', 'Couple', 'Solo', 'Friends'].map(vibe => (
                        <button 
                            key={vibe} 
                            onClick={() => setSelectedVibe(vibe)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '100px', 
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: selectedVibe === vibe ? '#800000' : 'white',
                                color: selectedVibe === vibe ? 'white' : '#6B7280',
                                boxShadow: selectedVibe === vibe ? '0 4px 12px rgba(128,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            {vibe}
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="packages-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '100%', height: '240px', background: '#f3f4f6', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            <div style={{ padding: '24px', spaceY: '12px' }}>
                                <div style={{ height: '24px', background: '#f3f4f6', borderRadius: '4px', width: '70%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '4px', width: '40%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <div style={{ height: '40px', background: '#f3f4f6', borderRadius: '8px', width: '100%', marginTop: '20px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPackages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
                    <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>No packages found matching your criteria.</p>
                </div>
            ) : (
                <div className="packages-grid" style={{ padding: '0 24px 80px' }}>
                    {filteredPackages.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            className="package-card" 
                            style={{ 
                                background: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}
                            onClick={() => navigate(`/packages/${pkg.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={getImgUrl(pkg.image || pkg.imageUrl || pkg.photo || pkg.coverImage || pkg.image_url)} 
                                    alt={pkg.altText || pkg.name} 
                                    style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                                />
                                {pkg.tag && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        background: '#800000',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    }}>
                                        {pkg.tag}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px', lineHeight: '1.3' }}>{pkg.name}</h3>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>
                                    <MapPin size={14} color="#9CA3AF" />
                                    {pkg.destination || pkg.location || 'Curated Trip'}
                                </div>

                                {pkg.vibe && (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        background: pkg.vibe === 'Family' ? '#EFF6FF' : (pkg.vibe === 'Stranger' ? '#FDF2F8' : (pkg.vibe === 'Friends' ? '#F0FDF4' : '#F9FAFB')),
                                        color: pkg.vibe === 'Family' ? '#3B82F6' : (pkg.vibe === 'Stranger' ? '#EC4899' : (pkg.vibe === 'Friends' ? '#22C55E' : '#6B7280')),
                                        marginBottom: '20px'
                                    }}>
                                        {pkg.vibe === 'Stranger' ? '👥 ' : (pkg.vibe === 'Family' ? '👨‍👩‍👧‍👦 ' : (pkg.vibe === 'Friends' ? '🥳 ' : '✨ '))}
                                        {pkg.vibe}
                                    </div>
                                )}

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-end', 
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                    paddingTop: '20px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1A1A1A' }}>
                                            ₹{Number(pkg.totalPrice).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>
                                            {pkg.daysCount} nights / person
                                        </div>
                                    </div>
                                    
                                    <button 
                                        style={{ 
                                            background: '#10B981',
                                            color: 'white',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                                    >
                                        View Details
                                    </button>
                                </div>
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
