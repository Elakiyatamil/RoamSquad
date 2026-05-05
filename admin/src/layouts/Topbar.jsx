import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Topbar = () => {
    return (
        <header className="h-20 border-b border-ink/5 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md group">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-red transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="Search resources, requests..."
                        className="w-full pl-12 pr-6 py-3 bg-ink/[0.03] border-2 border-transparent focus:border-red/10 focus:bg-white focus:ring-4 focus:ring-red/5 transition-all duration-300 outline-none rounded-2xl text-sm font-medium placeholder:text-ink/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
                <div className="flex items-center gap-2">
                    <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-ink/5 text-ink/30 hover:text-red transition-all duration-300 relative group">
                        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red rounded-full border-2 border-white shadow-sm" />
                    </button>
                    <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-ink/5 text-ink/30 hover:text-ink transition-all duration-300">
                        <Settings size={20} className="hover:rotate-45 transition-transform" />
                    </button>
                </div>
                
                <div className="h-8 w-px bg-ink/5 mx-2" />
                
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-ink/30 uppercase tracking-[0.2em] font-bold mb-0.5">System Status</p>
                    <div className="flex items-center gap-2 justify-end">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest"></span>
                        </span>
                        <span className="text-sm font-bold text-forest/80 tracking-tight">Active</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
