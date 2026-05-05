import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronDown,
    Globe,
    Map,
    MapPin,
    Navigation,
    LayoutDashboard,
    Settings,
    LogOut
} from 'lucide-react';
import useStore from '../store/useStore';

const SidebarItem = ({ icon: Icon, label, children, depth = 0, isOpen, onToggle, active }) => {
    return (
        <div className="select-none">
            <motion.div
                whileHover={{ x: 4 }}
                onClick={onToggle}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${active ? 'bg-red text-white' : 'text-ink/70 hover:text-red hover:bg-red/5'
                    }`}
                style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
            >
                {Icon && <Icon size={18} />}
                <span className="flex-1 font-medium">{label}</span>
                {children && (
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight size={16} />
                    </motion.div>
                )}
            </motion.div>
            <AnimatePresence>
                {isOpen && children && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Sidebar = () => {
    const { sidebarOpen, currentDestinationId, setCurrentDestination } = useStore();
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (id) => {
        setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 280 : 0 }}
            className="h-screen bg-white border-r border-ink/10 flex flex-col overflow-hidden"
        >
            <div className="p-6 border-b border-ink/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-red rounded-lg flex items-center justify-center text-white font-display text-2xl font-bold">R</div>
                <div className="flex flex-col">
                    <span className="font-display text-xl font-bold text-ink">Roam Squad</span>
                    <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Admin Panel</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <SidebarItem
                    icon={LayoutDashboard}
                    label="Itinerary Kanban"
                    active={!currentDestinationId}
                    onToggle={() => setCurrentDestination(null)}
                />

                <div className="px-4 py-3 mt-4 text-[10px] uppercase tracking-widest text-ink/40 font-bold">
                    Destinations
                </div>

                {/* Static Example Structure for Now */}
                <SidebarItem
                    icon={Globe}
                    label="India"
                    isOpen={openItems['india']}
                    onToggle={() => toggleItem('india')}
                >
                    <SidebarItem
                        icon={Map}
                        depth={1}
                        label="Kerala"
                        isOpen={openItems['kerala']}
                        onToggle={() => toggleItem('kerala')}
                    >
                        <SidebarItem
                            icon={MapPin}
                            depth={2}
                            label="Idukki"
                            isOpen={openItems['idukki']}
                            onToggle={() => toggleItem('idukki')}
                        >
                            <SidebarItem
                                icon={Navigation}
                                depth={3}
                                label="Munnar"
                                active={currentDestinationId === 'munnar'}
                                onToggle={() => setCurrentDestination('munnar')}
                            />
                        </SidebarItem>
                    </SidebarItem>
                </SidebarItem>
            </div>

            <div className="p-4 border-t border-ink/10 bg-cream/50">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink/5 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-white text-xs font-bold">AS</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-ink truncate">Admin Squad</p>
                        <p className="text-[10px] text-ink/40 truncate">admin@roamsquad.com</p>
                    </div>
                    <LogOut size={16} className="text-ink/40" />
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
