import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import FloatingNav from '../components/FloatingNav/FloatingNav'

export default function TravellerLayout() {
  const location = useLocation()

  // On the planner page, the planner has its own sticky navbar.
  // We must suppress the global nav and the 80px top padding it needs.
  const isPlanner = location.pathname.startsWith('/planner')
  const isPackages = location.pathname === '/packages'
  
  const hideNav = isPlanner || isPackages

  return (
    <div
      className="min-h-screen bg-bg-cream text-primary"
      style={{ paddingTop: hideNav ? '0' : '80px' }}
    >
      {/* Hide global FloatingNav on planner and packages pages */}
      {!hideNav && <FloatingNav />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
