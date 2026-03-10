import React from 'react';
import useStore from '../store/useStore';
import { Menu, Bell, Search } from 'lucide-react';

const Navbar = () => {
    const { toggleSidebar } = useStore();

    return (
        <nav className="h-16 bg-white border-b border-ink/10 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-ink/5 rounded-lg transition-colors text-ink/60"
                >
                    <Menu size={20} />
                </button>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        className="pl-10 pr-4 py-2 bg-cream/50 border border-transparent focus:border-red/20 focus:bg-white rounded-full text-sm outline-none transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-ink/5 rounded-lg transition-colors text-ink/60 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-ink/10 mx-2"></div>
                <button className="bg-red text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red/90 transition-colors shadow-lg shadow-red/20">
                    Create New
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
