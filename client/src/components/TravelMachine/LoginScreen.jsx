import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Chrome as Google, Facebook, Eye, EyeOff, X, Loader2, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import './LoginScreen.css';

const LoginScreen = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(false); // Default to Signup based on "Start your perfect trip"
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setError('Please fill in all required fields');
    }
    
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);
      
      const { user, token } = res.data.data;
      login(user, token);
      
      // Sync Wishlist from localStorage if it exists
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
          // Don't block the user if sync fails, they are still logged in
        }
      }
      
      // Close the screen on success
      onBack();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="login-screen-parent fixed inset-0 z-[5000] bg-black/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* "Self-Healing" Optimized Container */}
      <motion.div 
        className="login-container w-[95%] max-w-[900px] min-h-[500px] max-h-[90vh] bg-white rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* LEFT SIDE: FORM (50%) */}
        <div className="login-form-side flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-center overflow-y-auto bg-white/40">
          
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/logo.png" alt="ROAMG Logo" className="h-10 w-auto object-contain mb-6" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight text-center font-playfair">
              {isLogin ? 'Welcome back.' : 'Your next escape\nstarts here.'}
            </h1>
          </div>

          {/* Social Logins - Neat Row */}
          <div className="flex justify-center gap-4 mb-6">
            <button className="social-pill opacity-50 cursor-not-allowed" title="Coming Soon"><Apple size={20} /></button>
            <button className="social-pill" onClick={handleGoogleLogin}><Google size={20} /></button>
            <button className="social-pill opacity-50 cursor-not-allowed" title="Coming Soon"><Facebook size={20} /></button>
          </div>

          <div className="flex items-center gap-4 mb-8 opacity-50">
             <div className="h-[1px] bg-slate-400 flex-1"></div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">or</span>
             <div className="h-[1px] bg-slate-400 flex-1"></div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-2xl text-center shadow-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Input Fields - Glassmorphism */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {!isLogin && (
              <div className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#800020] transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="name"
                  type="text" 
                  placeholder="Full name" 
                  className="login-input-glass w-full text-sm pl-12" 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#800020] transition-colors">
                <Mail size={18} />
              </div>
              <input 
                name="email"
                type="email" 
                placeholder="Email address" 
                className="login-input-glass w-full text-sm pl-12" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#800020] transition-colors">
                <Lock size={18} />
              </div>
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="login-input-glass w-full text-sm pl-12 pr-12" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800020] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="btn-burgundy-gradient w-full py-4 rounded-2xl font-bold mt-8 shadow-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-70 text-white"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Continue Your Journey' : 'Join the Escape'}
            </button>
          </form>

          <p className="text-center mt-6 text-slate-500 font-medium text-xs tracking-wide">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
            <span 
              className="text-[#800020] font-bold cursor-pointer hover:underline transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>

        </div>

        {/* RIGHT SIDE: IMAGE (50%) */}
        <div className="login-visual-side flex-1 relative hidden md:block overflow-hidden rounded-r-[32px]">
          <img 
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80" 
            alt="Travel Destination" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-90" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors z-[6000]"
        >
          <X size={24} />
        </button>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
