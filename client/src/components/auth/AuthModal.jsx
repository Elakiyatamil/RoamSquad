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

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE}/api${endpoint}`, formData);
            const { user, token } = res.data.data;
            login(user, token);
            
            // Sync Wishlist
            const localWishlist = JSON.parse(localStorage.getItem('roam_wishlist') || '[]');
            if (localWishlist.length > 0) {
                try {
                    await axios.post(`${API_BASE}/api/wishlist/sync`, 
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
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE}/auth/google`;
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
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
                                <span className="text-forest font-black text-xl italic">G</span>
                            </div>
                            <h2 className="text-3xl font-display font-bold text-forest">RoamG</h2>
                        </div>
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
                                    className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium text-forest"
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
                                className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium text-forest"
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
                                className="w-full pl-12 pr-4 py-4 bg-forest/5 rounded-xl outline-none focus:ring-2 ring-gold/50 transition-all font-medium text-forest"
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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-forest/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-cream px-2 text-forest/30 font-bold tracking-widest">Or continue with</span></div>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white border border-forest/10 text-forest rounded-xl font-bold hover:bg-forest/5 transition-all flex items-center justify-center gap-3 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button>

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
