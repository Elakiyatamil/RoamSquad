import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './CloudNavbarSection.css'

export default function CloudNavbarSection() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const nav = [
    { to: '/', label: 'Discover' },
    { to: '/planner', label: 'Planner' },
    { to: '/#packages', label: 'Packages' },
    { to: '/#events', label: 'Events' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/my-trips', label: 'My Trips' },
  ]

  const [activeHash, setActiveHash] = useState(location.hash || '')
  const [isPackagesVisible, setIsPackagesVisible] = useState(false)

  // Track window hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // IntersectionObserver for packages/events section
  useEffect(() => {
    if (location.pathname !== '/') return
    const target = document.getElementById('packages')
    if (!target) return
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsPackagesVisible(entry.isIntersecting)
      })
    }, { threshold: 0.2 })
    
    observer.observe(target)
    return () => observer.disconnect()
  }, [location.pathname])

  const handleMobileNavClick = (e, n) => {
    if (n.to.startsWith('/#') && location.pathname === '/') {
      e.preventDefault()
      setDrawerOpen(false)
      const hashTarget = n.to.replace('/', '')
      window.location.hash = hashTarget
      // Browser handles smooth scroll via CSS
    } else if (n.label === 'Planner' && location.pathname === '/') {
      e.preventDefault()
      setDrawerOpen(false)
      setTimeout(() => {
        document.getElementById('planner-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 420)
    } else {
      setDrawerOpen(false)
    }
  }

  const getIsActive = (n) => {
    if (n.to.startsWith('/#')) {
      if (location.pathname !== '/') return false
      const hashTarget = n.to.replace('/', '')
      if (isPackagesVisible) {
        if (activeHash === hashTarget) return true
        if (!activeHash && n.label === 'Packages') return true
      }
      return false
    }
    if (n.to === '/') {
      return location.pathname === '/' && !isPackagesVisible && !location.hash && location.pathname === '/'
    }
    return location.pathname === n.to
  }

  return (
    <>
      <header className="cloud-nav" aria-label="RoamSquad navigation">
        {/* Desktop layout */}
        <div className="cloud-nav-content">
          <Link to="/" className="cloud-brand" aria-label="RoamSquad home">
            RoamSquad
          </Link>
          <nav className="cloud-links" aria-label="Primary">
            {nav.map((n, idx) => {
              const active = getIsActive(n)
              return (
                <React.Fragment key={n.to}>
                  <Link
                    to={n.to}
                    className={`cloud-link ${active ? 'is-active' : ''}`}
                    data-nav={n.label.toLowerCase()}
                    onClick={(e) => {
                      if (n.to.startsWith('/#') && location.pathname === '/') {
                        e.preventDefault()
                        const hashTarget = n.to.replace('/', '')
                        window.location.hash = hashTarget
                        document.getElementById('packages-events-section')?.scrollIntoView({ behavior: 'smooth' })
                      } else if (n.label === 'Planner' && location.pathname === '/') {
                        e.preventDefault()
                        document.getElementById('planner-section')?.scrollIntoView({ behavior: 'smooth' })
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

        {/* Mobile layout */}
        <div className="cloud-nav-mobile">
          <Link to="/" className="cloud-brand-mobile" aria-label="RoamSquad home">
            ROAMSQUAD
          </Link>
          <button
            className="cloud-hamburger"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="cloud-bar" />
            <span className="cloud-bar" />
            <span className="cloud-bar" />
          </button>
        </div>
      </header>

      {/* Mobile fullscreen drawer */}
      <div className={`cloud-drawer ${drawerOpen ? 'cloud-drawer--open' : ''}`} aria-hidden={!drawerOpen}>
        {/* Subtle star bg */}
        <div className="cloud-drawer-bg" />

        <button
          className="cloud-drawer-close"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
        >
          ✕
        </button>

        <nav className="cloud-drawer-links" aria-label="Mobile navigation">
          {nav.map((n) => {
            const active = getIsActive(n)
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`cloud-drawer-link ${active ? 'is-active' : ''}`}
                onClick={(e) => handleMobileNavClick(e, n)}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Backdrop to close drawer on outside tap */}
      {drawerOpen && (
        <div className="cloud-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}
    </>
  )
}
