import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './CloudNavbarSection.css'

export default function CloudNavbarSection() {
  const location = useLocation()
  const nav = [
    { to: '/', label: 'Discover' },
    { to: '/planner', label: 'Planner' },
    { to: '/#packages', label: 'Packages' },
    { to: '/#events', label: 'Events' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/my-trips', label: 'My Trips' },
  ]

  return (
    <header className="cloud-nav" aria-label="RoamSquad navigation">
      <div className="cloud-nav-content">
        <Link to="/" className="cloud-brand" aria-label="RoamSquad home">
          RoamSquad
        </Link>
        <nav className="cloud-links" aria-label="Primary">
          {nav.map((n, idx) => {
            const active = location.pathname === n.to
            return (
              <React.Fragment key={n.to}>
                <Link 
                  to={n.to} 
                  className={`cloud-link ${active ? 'is-active' : ''}`}
                  data-nav={n.label.toLowerCase()}
                  onClick={(e) => {
                    if (n.label === 'Planner' && location.pathname === '/') {
                      e.preventDefault();
                      document.getElementById('planner-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {n.label}
                </Link>
                {idx !== nav.length - 1 && <span className="cloud-sep">·</span>}
              </React.Fragment>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

