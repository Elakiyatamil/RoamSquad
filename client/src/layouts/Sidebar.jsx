import React from 'react';
import { motion } from 'framer-motion';
import { useSidebarStore } from '../store/adminStore';
import {
    BarChart3,
    Map,
    Palmtree,
    Utensils,
    Hotel,
    Package,
    ClipboardList,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    ShieldCheck
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
    const { isOpen, toggle } = useSidebarStore();
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { title: 'Tree Manager', icon: Map, path: '/admin/tree' },
        { title: 'Destinations', icon: Palmtree, path: '/admin/destinations' },
        { title: 'Activities', icon: BarChart3, path: '/admin/activities' },
        { title: 'Food Options', icon: Utensils, path: '/admin/food' },
        { title: 'Accommodation', icon: Hotel, path: '/admin/accommodation' },
        { title: 'Packages', icon: Package, path: '/admin/packages' },
        { title: 'Requests', icon: ClipboardList, path: '/admin/requests' },
        { title: 'Activity Log', icon: ShieldCheck, path: '/admin/activity-log' },
    ];

    return (
        <motion.aside
            animate={{ width: isOpen ? 260 : 80 }}
            className="h-screen bg-ink text-cream border-r border-white/5 flex flex-col relative z-50 shrink-0"
        >
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-red flex items-center justify-center rounded-lg shrink-0">
                    <span className="font-display font-bold text-white text-xl">R</span>
                </div>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-display font-bold text-2xl tracking-tight"
                    >
                        Roam Squad
                    </motion.span>
                )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
              ${isActive ? 'bg-red text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'}
            `}
                    >
                        <item.icon size={20} className="shrink-0" />
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-medium"
                            >
                                {item.title}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={toggle}
                className="absolute -right-3 top-20 w-6 h-6 bg-red rounded-full border-2 border-cream flex items-center justify-center text-white"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-red flex items-center justify-center text-xs font-bold shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1">
                            <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-tighter truncate">{user?.email}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
