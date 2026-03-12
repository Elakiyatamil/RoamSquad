import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Topbar = () => {
    return (
        <header className="h-20 border-b border-ink/5 bg-white flex items-center justify-between px-8 z-40">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 group-focus-within:text-red transition-colors" />
                    <input
                        type="text"
                        placeholder="Search resources, requests..."
                        className="w-full pl-12 pr-4 py-2.5 bg-ink/5 border-transparent focus:border-red focus:bg-white focus:ring-4 focus:ring-red/5 transition-all outline-none rounded-2xl"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 ml-8">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-ink/5 text-ink/40 hover:text-red transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red rounded-full border-2 border-white" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-ink/5 text-ink/40 hover:text-ink transition-all">
                    <Settings size={20} />
                </button>
                <div className="h-8 w-px bg-ink/10 mx-2" />
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">Server Status</p>
                    <div className="flex items-center gap-1.5 justify-end">
                        <span className="w-1.5 h-1.5 bg-forest rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-forest">Operational</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
