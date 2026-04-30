import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import './RoamgHero.css';

const RoamgHero = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="roamg-hero-wrapper p-6 lg:p-8 w-full h-[100vh] bg-white">
      <div className="roamg-hero-container relative w-full h-full rounded-[28px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-white">
        
        {/* Background Image Container with Parallax Zoom on Hover */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[2000ms] ease-out hover:scale-110"
            style={{ backgroundImage: `url('/assets/roamg-hero-bg.png')` }}
          />
        </div>
        
        {/* Extremely subtle gradient just for navbar readability, keeping image bright and airy */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

        {/* Huge Faded Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
          <h1 className="roamg-bg-text font-black text-white uppercase tracking-tighter">
            ROAMG
          </h1>
        </div>

        {/* Navbar */}
        <header className={`absolute top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/30 backdrop-blur-lg' : 'bg-transparent pt-4'}`}>
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
            {/* Logo - Removed per user request */}
            <div className="flex items-center z-10 w-12 h-12">
              {/* Blank space */}
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-10 text-white/90 text-xs font-bold tracking-[0.15em] uppercase">
              <Link to="/" className="text-white relative after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-full after:max-w-[20px] after:h-[2px] after:bg-white hover:text-white transition-colors">Discover</Link>
              <Link to="/planner" className="hover:text-white transition-colors hover:opacity-100 opacity-70">Planner</Link>
              <Link to="/packages" className="hover:text-white transition-colors hover:opacity-100 opacity-70">Package</Link>
              <Link to="/events" className="hover:text-white transition-colors hover:opacity-100 opacity-70">Events</Link>
              <Link to="/wishlist" className="hover:text-white transition-colors hover:opacity-100 opacity-70">Wishlists</Link>
              <Link to="/my-trips" className="hover:text-white transition-colors hover:opacity-100 opacity-70">MyTrips</Link>
            </nav>
            
            <div className="lg:hidden w-12"></div> {/* Spacer for mobile */}
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-16 pointer-events-none">
          <p className="text-white/90 text-[10px] md:text-xs font-semibold tracking-[0.4em] uppercase mb-12 drop-shadow-md">
            Roam Together &bull; Explore Forever
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-white/80 transition-opacity hover:opacity-100 cursor-pointer">
          <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Explore</span>
          <ArrowDown size={18} className="animate-bounce" strokeWidth={2} />
        </div>

      </div>
    </div>
  );
};

export default RoamgHero;
