import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Check, Star, ArrowRight, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import AuthModal from '../../components/auth/AuthModal';

const API = 'http://localhost:5000/api';

export default function PackagesPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const { isAuthenticated, user } = useAuthStore();
    const token = useAuthStore(s => s.token);

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['publicPackages'],
        queryFn: async () => {
            const res = await axios.get(`${API}/packages/public`);
            console.log("[PackagesPage] API Response:", res.data);
            return res.data.data || [];
        }
    });

    const interestMutation = useMutation({
        mutationFn: async ({ packageId, packageName }) => {
            const payload = {
                email: user?.email,
                name: user?.name,
                phone: user?.phone,
                packageId,
                packageName,
                createdAt: new Date()
            };
            console.log("Package interest sent to admin", payload);
            return axios.post(`${API}/packages/${packageId}/interest`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            alert("Your interest has been sent to admin. They will contact you.");
            toast.success("Interest sent! 🚀");
        },
        onError: () => toast.error("Failed to register interest.")
    });

    const handleInterest = (pkg) => {
        if (!isAuthenticated) {
            alert("Please login first");
            setPendingId(pkg.id);
            setShowAuth(true);
            return;
        }
        interestMutation.mutate({ packageId: pkg.id, packageName: pkg.name });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-32 text-forest/40">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading packages...
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-20 min-h-screen">
            <header className="mb-16 text-center">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-forest mb-4 tracking-tight">
                    Global Packages
                </h1>
                <p className="text-forest/50 text-xl max-w-2xl mx-auto">
                    Handcrafted travel packages designed for unforgettable experiences.
                </p>
            </header>

            {packages.length === 0 ? (
                <div className="text-center py-20 bg-forest/5 rounded-[3rem] border-2 border-dashed border-forest/10">
                    <Package size={40} className="mx-auto text-forest/20 mb-4" />
                    <h2 className="text-2xl font-display font-bold text-forest/50">No packages available yet.</h2>
                    <p className="text-forest/30 mt-2">Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-forest/5 flex flex-col"
                        >
                            {pkg.coverImage ? (
                                <div className="h-52 overflow-hidden">
                                    <img src={pkg.coverImage} alt={pkg.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                </div>
                            ) : (
                                <div className="h-52 bg-gradient-to-br from-forest/10 to-gold/10 flex items-center justify-center">
                                    <Package size={48} className="text-forest/20" />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        {pkg.tag && <span className="inline-block text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest mb-2">{pkg.tag}</span>}
                                        <h3 className="text-xl font-bold text-forest">{pkg.name}</h3>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-[10px] text-forest/40 uppercase font-bold">from</p>
                                        <p className="text-xl font-display font-bold text-forest">₹{Number(pkg.totalPrice).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={14} className="text-forest/40" />
                                    <span className="text-sm text-forest/60 font-medium">{pkg.daysCount} days</span>
                                </div>
                                {pkg.highlights?.length > 0 && (
                                    <ul className="space-y-1 mb-6 flex-1">
                                        {pkg.highlights.slice(0, 4).map(h => (
                                            <li key={h} className="flex items-center gap-2 text-sm text-forest/60">
                                                <Check size={14} className="text-gold shrink-0" /> {h}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button
                                    onClick={() => handleInterest(pkg)}
                                    disabled={interestMutation.isPending}
                                    className="mt-auto w-full py-4 bg-forest text-cream rounded-2xl font-bold hover:bg-forest/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {interestMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                                    I'm Interested
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => {
                setShowAuth(false);
                if (pendingId) {
                    const pkg = packages.find(p => p.id === pendingId);
                    if (pkg) interestMutation.mutate({ packageId: pkg.id, packageName: pkg.name });
                }
            }} />
        </div>
    );
}
