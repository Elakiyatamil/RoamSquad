import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Chrome as Google, Facebook, Eye, X } from 'lucide-react';

const LoginScreen = ({ onBack }) => {
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
          <div className="voyager-logo text-[#2D5A5A] font-black text-xl mb-6">voyger</div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
            Start your<br />perfect trip
          </h1>

          {/* Social Logins - Wrapping Row */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="social-btn flex-1 min-w-[50px]"><Apple size={18} /></button>
            <button className="social-btn flex-1 min-w-[50px]"><Google size={18} /></button>
            <button className="social-btn flex-1 min-w-[50px]"><Facebook size={18} /></button>
          </div>

          <div className="text-slate-400 text-[10px] mb-6 text-center font-bold uppercase tracking-widest">or</div>

          {/* Input Fields - Full Width */}
          <div className="space-y-3 w-full">
            <input type="text" placeholder="Full name" className="login-input w-full text-sm" />
            <input type="email" placeholder="Email" className="login-input w-full text-sm" />
            <div className="relative w-full">
              <input type="password" placeholder="Password" className="login-input w-full text-sm" />
              <Eye className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <button className="login-start-btn bg-[#2D5A5A] text-white w-full py-4 rounded-xl font-bold mt-6 shadow-lg shadow-[#2d5a5a3d] transition-transform active:scale-95 text-sm">
            Start
          </button>

          <p className="text-center mt-5 text-slate-500 font-medium text-xs">
            Already have an account? <span className="text-slate-900 font-bold cursor-pointer">Log in</span>
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
               Voyager Discovery
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

      <style jsx>{`
        .social-btn {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 14px;
          transition: all 0.3s;
        }
        .social-btn:hover { background: #e2e8f0; transform: translateY(-1px); }
        .login-input {
          background: #f1f5f9;
          border: 1px solid transparent;
          padding: 16px 20px;
          border-radius: 14px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus { border-color: #2D5A5A; background: #fff; }
        .glass-pin { display: flex; flex-direction: column; align-items: flex-start; }
      `}</style>
    </div>
  );
};

export default LoginScreen;
