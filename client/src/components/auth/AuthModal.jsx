import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuthStore();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`http://localhost:5000/api${endpoint}`, formData);
            const { user, token } = res.data;
            login(user, token);
            
            // Sync Wishlist
            const localWishlist = JSON.parse(localStorage.getItem('roam_wishlist') || '[]');
            if (localWishlist.length > 0) {
                try {
                    await axios.post('http://localhost:5000/api/wishlist/sync', 
                        { items: localWishlist.map(item => ({ entityType: item.type || 'Destination', entityId: item.id })) },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    localStorage.removeItem('roam_wishlist');
                } catch (syncErr) {
                    console.error('Wishlist sync failed:', syncErr);
                }
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-forest/80 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-cream rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-forest/40 hover:text-forest transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-display font-bold text-forest mb-2">
                            {isLogin ? 'Welcome Back' : 'Join Roam Squad'}
                        </h2>
                        <p className="text-forest/50">
                            {isLogin ? 'Sign in to confirm your handcrafted inquiry.' : 'Create an account to save and track your trips.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red/10 border border-red/20 rounded-xl text-red text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={18} />
                                <input 
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={18} />
                            <input 
                                required
                                type="email"
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/30" size={18} />
                            <input 
                                required
                                type="password"
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-5 bg-forest text-cream rounded-xl font-bold hover:bg-forest/90 transition-all shadow-xl shadow-forest/10 mt-6 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-forest/40 hover:text-gold transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
