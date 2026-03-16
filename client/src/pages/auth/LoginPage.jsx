import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import apiClient from '../../services/apiClient';

const REMEMBER_KEY = 'roamsquad-remember';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated, hydrated } = useAuthStore();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (hydrated && isAuthenticated) navigate('/admin', { replace: true });
    }, [isAuthenticated, hydrated, navigate]);

    // Pre-fill if Remember Me was set
    useEffect(() => {
        try {
            const saved = localStorage.getItem(REMEMBER_KEY);
            if (saved) {
                const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
                setEmail(savedEmail || '');
                setPassword(savedPassword || '');
                setRememberMe(true);
            }
        } catch { /* ignore */ }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            login(response.data.user, response.data.token);

            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-col justify-between w-[45%] bg-ink p-16 relative overflow-hidden"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
                            className="absolute border border-white/30 rounded-full"
                            style={{
                                width: `${200 + i * 100}px`,
                                height: `${200 + i * 100}px`,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-red rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-white font-black text-lg">R</span>
                    </div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Roam Squad</p>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
                        The Control<br />Centre for<br />
                        <span className="text-red">Indian Travel.</span>
                    </h1>
                    <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">
                        Manage destinations, curate experiences, and orchestrate unforgettable journeys across India.
                    </p>
                </div>

                <div className="relative z-10 flex gap-8">
                    {[
                        { number: '100+', label: 'Destinations' },
                        { number: '500+', label: 'Experiences' },
                        { number: '24/7', label: 'Access' }
                    ].map((stat) => (
                        <div key={stat.label}>
                            <p className="text-white font-bold text-2xl">{stat.number}</p>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Right login panel */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 flex items-center justify-center p-8 bg-cream"
            >
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-red rounded-xl flex items-center justify-center">
                            <span className="text-white font-black">R</span>
                        </div>
                        <span className="font-display font-bold text-xl text-ink">Roam Squad</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-display font-bold text-ink mb-2">Welcome back</h2>
                        <p className="text-ink/40 font-medium">Sign in to your admin panel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/10 focus:border-red/20 transition-all font-medium shadow-sm"
                                    placeholder="admin@roamsquad.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border border-ink/5 outline-none focus:ring-4 focus:ring-red/10 focus:border-red/20 transition-all font-medium shadow-sm"
                                    placeholder="••••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div
                                    onClick={() => setRememberMe(v => !v)}
                                    className={`
                                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                        ${rememberMe ? 'bg-red border-red' : 'border-ink/20 group-hover:border-red/40'}
                                    `}
                                >
                                    {rememberMe && <CheckCircle2 size={12} className="text-white fill-white" />}
                                </div>
                                <span className="text-sm font-medium text-ink/60">Remember me</span>
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-bold text-red bg-red/5 p-4 rounded-xl border border-red/10 flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-ink text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-ink/10 hover:bg-ink/90 disabled:opacity-60 transition-all mt-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Enter Dashboard</span>
                                    <LogIn size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center mt-8 text-[10px] font-bold uppercase tracking-widest text-ink/20">
                        © 2025 Roam Squad · Admin Access Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
