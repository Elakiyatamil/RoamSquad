import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function TravellerLayout() {
  const location = useLocation()
  const nav = [
    { to: '/', label: 'Discover' },
    { to: '/planner', label: 'Planner' },
    { to: '/packages', label: 'Packages' },
    { to: '/events', label: 'Events' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/my-trips', label: 'My Trips' },
  ]

  return (
    <div className="min-h-screen bg-cream text-ink">
      {location.pathname !== '/' && !location.pathname.startsWith('/planner') && !location.pathname.startsWith('/my-trips') && !location.pathname.startsWith('/journey') && !location.pathname.startsWith('/packages') && !location.pathname.startsWith('/events') && !location.pathname.startsWith('/wishlist') && (
      <header className="sticky top-0 z-[100] bg-transparent backdrop-blur border-b border-white/5 h-[56px] md:h-auto flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0 mr-4 w-fit">
            <img 
              src="/logo.png" 
              alt="ROAMG Logo" 
              className="h-7 md:h-8 w-auto max-w-[120px] object-contain block" 
            />
          </Link>
          <nav 
            className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide w-full md:w-auto"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition shrink-0 ${
                  location.pathname === n.to ? 'bg-ink text-cream' : 'text-ink/70 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

