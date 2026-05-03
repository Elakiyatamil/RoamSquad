import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Chrome as Google, Facebook, Eye, EyeOff, X, Loader2 } from 'lucide-react';
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
        <div className="login-form-side flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="RoamG" className="w-8 h-8 object-contain" />
            <span className="text-[#2D5A5A] font-black text-xl">RoamG</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
            {isLogin ? 'Welcome\nback' : 'Start your\nperfect trip'}
          </h1>

          {/* Social Logins - Wrapping Row */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="social-btn flex-1 min-w-[50px] opacity-50 cursor-not-allowed" title="Coming Soon"><Apple size={18} /></button>
            <button className="social-btn flex-1 min-w-[50px]" onClick={handleGoogleLogin}><Google size={18} /></button>
            <button className="social-btn flex-1 min-w-[50px] opacity-50 cursor-not-allowed" title="Coming Soon"><Facebook size={18} /></button>
          </div>

          <div className="text-slate-400 text-[10px] mb-6 text-center font-bold uppercase tracking-widest">or</div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Input Fields - Full Width */}
          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            {!isLogin && (
              <input 
                name="name"
                type="text" 
                placeholder="Full name" 
                className="login-input w-full text-sm" 
                value={formData.name}
                onChange={handleChange}
              />
            )}
            <input 
              name="email"
              type="email" 
              placeholder="Email" 
              className="login-input w-full text-sm" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="relative w-full">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="login-input w-full text-sm" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="login-start-btn bg-[#2D5A5A] text-white w-full py-4 rounded-xl font-bold mt-6 shadow-lg shadow-[#2d5a5a3d] transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Log in' : 'Start'}
            </button>
          </form>

          <p className="text-center mt-5 text-slate-500 font-medium text-xs">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
            <span 
              className="text-slate-900 font-bold cursor-pointer hover:underline"
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
        <div className="login-visual-side flex-1 relative hidden md:block overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80" 
            alt="Bali Hiking" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
          
          {/* Overlay Info */}
          <div className="absolute top-[15%] left-[10%]">
             <div className="glass-pin">
                <div className="w-2 h-2 bg-white rounded-full mb-1.5" />
                <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/25 text-white max-w-[160px]">
                  <div className="text-[9px] opacity-70">Ubud Village</div>
                  <div className="text-xs font-bold">Monkey Sanctuary</div>
                </div>
             </div>
          </div>

          <div className="absolute bottom-[20%] right-[10%]">
             <div className="glass-pin flex flex-col items-end">
                <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/25 text-white mb-1.5 text-right max-w-[180px]">
                  <div className="text-[9px] opacity-70">1,2 km</div>
                  <div className="text-xs font-bold">to your escape</div>
                </div>
                <div className="w-2 h-2 bg-white rounded-full" />
             </div>
          </div>

          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
             <div className="bg-white/85 backdrop-blur-md px-4 py-2 rounded-full text-slate-900 font-bold text-xs shadow-xl whitespace-nowrap">
               RoamG
             </div>
          </div>
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
