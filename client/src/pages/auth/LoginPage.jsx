import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import apiClient from '../../services/apiClient';

const LoginPage = () => {
    const [email, setEmail] = useState('admin@roamsquad.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            login(response.data.user, response.data.token);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-red rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-2xl shadow-red/20 rotate-12">
                        <LogIn size={40} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-ink mb-2">Roam Squad</h1>
                    <p className="text-ink/40 font-bold uppercase tracking-[0.2em] text-xs">Admin Gateway</p>
                </div>

                <div className="card p-10 bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-ink/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all font-medium"
                                    placeholder="admin@roamsquad.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-ink/5 rounded-2xl outline-none focus:ring-4 focus:ring-red/5 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-bold text-red bg-red/5 p-3 rounded-xl border border-red/10 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 group shadow-xl shadow-red/20 active:scale-95 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Enter Dashboard'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold uppercase tracking-widest text-ink/20">
                    &copy; 2024 Roam Squad Curated Travel Platform
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
