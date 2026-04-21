import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ComingSoonPage({ type }) {
  const { id } = useParams();
  
  // Format ID from 'himalayan-escape' to 'Himalayan Escape'
  const formattedName = id 
    ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4 text-center">
      <span className="text-[#C1351A] text-xs font-bold tracking-[0.2em] uppercase mb-4">
        {type}
      </span>
      <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-6xl italic mb-6">
        {formattedName}
      </h1>
      <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
        We are currently curating the details for this {type.toLowerCase()}. Check back soon for an exclusive itinerary and booking options.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 border border-white/20 hover:bg-white hover:text-[#0a0a0a] transition-all duration-300 tracking-[0.15em] text-xs font-semibold uppercase"
      >
        Return to Discover
      </Link>
    </div>
  );
}
