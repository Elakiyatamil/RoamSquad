import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Heart, Compass, User, Menu, X, Plane } from 'lucide-react';

const TravellerLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Discover', path: '/', icon: Compass },
        { name: 'Planner', path: '/planner', icon: Map },
        { name: 'Wishlist', path: '/wishlist', icon: Heart },
        { name: 'My Trips', path: '/my-trips', icon: Plane },
    ];

    return (
        <div className="min-h-screen bg-cream text-ink font-sans selection:bg-gold/30">
            {/* Header */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream">
                            <Compass size={24} />
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight text-forest">
                            Roam <span className="text-gold">Squad</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold ${
                                    location.pathname === item.path ? 'text-forest' : 'text-forest/70'
                                }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        ))}
                        <Link 
                            to="/login"
                            className="ml-4 px-6 py-2 bg-forest text-cream rounded-full text-sm font-medium hover:bg-forest/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-forest/20"
                        >
                            Sign In
                        </Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button 
                        className="md:hidden text-forest p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-cream md:hidden pt-24 px-6"
                    >
                        <nav className="flex flex-col gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 text-2xl font-display font-medium text-forest"
                                >
                                    <item.icon size={24} />
                                    {item.name}
                                </Link>
                            ))}
                            <Link 
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="mt-4 w-full py-4 bg-forest text-cream rounded-xl text-center font-medium"
                            >
                                Sign In
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-forest text-cream py-16 mt-20">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-3xl font-display font-bold block mb-4">Roam Squad</span>
                        <p className="text-cream/70 max-w-md leading-relaxed">
                            Crafting handcrafted itineraries using expert-curated experiences. 
                            Your journey, handpicked by travel experts.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Explore</h4>
                        <ul className="space-y-2 text-cream/60">
                            <li><Link to="/">Destinations</Link></li>
                            <li><Link to="/planner">Trip Planner</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Roam Squad</h4>
                        <ul className="space-y-2 text-cream/60">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/admin">Admin Panel</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-16 pt-8 border-t border-cream/10 text-center text-cream/40 text-sm">
                    © 2026 Roam Squad Travel Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default TravellerLayout;
