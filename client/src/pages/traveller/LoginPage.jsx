import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Chrome as Google, Facebook, Apple, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itinerarySent, setItinerarySent] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
  const redirectTo = location.state?.redirectTo || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);
      const { user, token } = res.data.data;
      
      login(user, token);

      // Check for pending itinerary
      const pending = sessionStorage.getItem('pendingItinerary');
      if (pending) {
        sessionStorage.removeItem('pendingItinerary');
        try {
          const payload = JSON.parse(pending);
          // Attach real user data
          payload.userId = user.id;
          payload.name = user.name;
          payload.email = user.email;

          await axios.post(`${API_BASE}/api/inquiry`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Show success toast
          setItinerarySent(true);
          setTimeout(() => {
            setItinerarySent(false);
            navigate('/my-trips');
          }, 3000);
        } catch (submitErr) {
          console.error('Post-login submit failed:', submitErr);
          navigate('/my-trips');
        }
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE: FORM */}
      <div className="login-form-side">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="ROAMG" className="login-logo" />
        </div>

        <h1 className="login-heading">
          {isLogin ? 'Welcome back.' : 'Start your journey.'}
        </h1>
        <p style={{ color: '#9CA3AF', marginBottom: '32px', fontSize: '0.9rem' }}>
          {isLogin ? 'Login to manage your itineraries.' : 'Create an account to save your trips.'}
        </p>

        {/* Social logins */}
        <div className="social-row">
          <div className="social-btn"><Google size={20} /></div>
          <div className="social-btn"><Facebook size={20} /></div>
          <div className="social-btn"><Apple size={20} /></div>
        </div>

        <div className="divider">or</div>

        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="login-input-group">
              <User className="input-icon" size={18} />
              <input 
                name="name"
                type="text" 
                placeholder="Full Name" 
                className="login-input" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="login-input-group">
            <Mail className="input-icon" size={18} />
            <input 
              name="email"
              type="email" 
              placeholder="Email address" 
              className="login-input" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-input-group">
            <Lock className="input-icon" size={18} />
            <input 
              name="password"
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              className="login-input" 
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div 
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9CA3AF' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>

          <button className="login-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="login-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>

      {/* RIGHT SIDE: IMAGE */}
      <div className="login-image-side">
        <img 
          src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80" 
          alt="Travel" 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #FAF8F5, transparent)' }} />
      </div>

      {/* SUCCESS TOAST */}
      {itinerarySent && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A2E',
          color: 'white',
          fontFamily: 'Poppins',
          padding: '20px 32px',
          borderRadius: '20px',
          zIndex: 99999,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'modalPop 0.3s ease',
          minWidth: '280px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✈️</div>
          <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
            Itinerary sent!
          </p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>
            Taking you to My Trips...
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
