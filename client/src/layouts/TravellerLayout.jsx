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
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-tight">
            RoamSquad
          </Link>
          <nav className="flex gap-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  location.pathname === n.to ? 'bg-ink text-cream' : 'text-ink/70 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

