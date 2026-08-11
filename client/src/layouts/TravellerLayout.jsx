import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingNav from '../components/FloatingNav/FloatingNav'

export default function TravellerLayout() {
  const location = useLocation()

  // On planner/packages pages, nav is custom or hidden.
  // On home and my-trips pages, pages have top hero images; top padding is set to 0
  // to bring the Navigation Bar directly to the top of the viewport.
  const isPlanner = location.pathname.startsWith('/planner')
  const isPackages = location.pathname === '/packages'
  const isHome = location.pathname === '/'
  const isMyTrips = location.pathname === '/my-trips' || location.pathname === '/my-journeys'
  
  const hideNav = isPlanner || isPackages

  return (
    <div
      className="min-h-screen bg-bg-cream text-primary"
      style={{ paddingTop: hideNav || isHome || isMyTrips ? '0' : '80px' }}
    >
      {/* Hide global FloatingNav on planner and packages pages */}
      {!hideNav && <FloatingNav />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
